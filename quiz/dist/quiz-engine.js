const DATA_ROOT = './data/';
const STORAGE_PREFIX = 'chemistry-atlas.quiz.';
const VALID_TYPES = ['single-choice', 'multiple-choice', 'true-false', 'fill-in-the-blank'];
const TYPE_LABELS = { 'single-choice': 'Single choice', 'multiple-choice': 'Multiple choice', 'true-false': 'True / false', 'fill-in-the-blank': 'Fill in the blank' };
const ICONS = { check: '✓', cross: '×', dash: '—', info: 'i' };

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];
const escapeKey = (value) => String(value).replace(/[^a-z0-9_-]/gi, '-');

function text(tag, value, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  node.textContent = value ?? '';
  return node;
}

function normalizeAnswer(answer) {
  if (Array.isArray(answer)) return [...answer].sort();
  return answer;
}

function answersEqual(left, right) {
  return JSON.stringify(normalizeAnswer(left)) === JSON.stringify(normalizeAnswer(right));
}

function normalizeFill(value, grading = {}) {
  let answer = String(value ?? '').trim();
  if (grading.collapseWhitespace !== false) answer = answer.replace(/\s+/g, ' ');
  if (grading.caseSensitive !== true) answer = answer.toLocaleLowerCase();
  return answer;
}

function validateQuiz(quiz) {
  const errors = [];
  const need = (condition, path, message) => { if (!condition) errors.push({ path, message }); };
  need(quiz && typeof quiz === 'object' && !Array.isArray(quiz), '$', 'quiz must be an object');
  if (!quiz || typeof quiz !== 'object') return errors;
  ['id', 'title', 'description', 'subject', 'chapter', 'version'].forEach((key) => need(typeof quiz[key] === 'string' && quiz[key].trim(), `$.${key}`, 'must be a non-empty string'));
  need(Number.isFinite(quiz.totalPoints) && quiz.totalPoints >= 0, '$.totalPoints', 'must be a non-negative number');
  need(Array.isArray(quiz.questions) && quiz.questions.length > 0, '$.questions', 'must contain at least one question');
  if (!Array.isArray(quiz.questions)) return errors;
  const ids = new Set();
  quiz.questions.forEach((question, index) => {
    const path = `$.questions[${index}]`;
    need(question && typeof question === 'object' && !Array.isArray(question), path, 'must be an object');
    if (!question || typeof question !== 'object') return;
    need(typeof question.id === 'string' && question.id.trim(), `${path}.id`, 'must be a non-empty string');
    if (ids.has(question.id)) errors.push({ path: `${path}.id`, message: 'must be unique' });
    ids.add(question.id);
    need(VALID_TYPES.includes(question.type), `${path}.type`, `must be one of ${VALID_TYPES.join(', ')}`);
    need(typeof question.question === 'string' && question.question.trim(), `${path}.question`, 'must be a non-empty string');
    need(Number.isFinite(question.points) && question.points > 0, `${path}.points`, 'must be a positive number');
    need(typeof question.explanation === 'string' && question.explanation.trim(), `${path}.explanation`, 'must be a non-empty string');
    need(['easy', 'medium', 'hard', 'challenging'].includes(question.difficulty), `${path}.difficulty`, 'must be easy, medium, hard, or challenging');
    need(Array.isArray(question.tags), `${path}.tags`, 'must be an array');
    if (question.image !== undefined) {
      need(question.image && typeof question.image === 'object' && typeof question.image.src === 'string' && question.image.src.trim() && typeof question.image.alt === 'string' && question.image.alt.trim(), `${path}.image`, 'must contain src and alt text');
    }
    if (['single-choice', 'multiple-choice'].includes(question.type)) {
      need(Array.isArray(question.options) && question.options.length >= 2, `${path}.options`, 'must contain at least two options');
      const optionIds = new Set();
      (question.options || []).forEach((option, optionIndex) => {
        need(option && typeof option.id === 'string' && option.id.trim() && typeof option.text === 'string', `${path}.options[${optionIndex}]`, 'must have string id and text');
        if (optionIds.has(option.id)) errors.push({ path: `${path}.options[${optionIndex}].id`, message: 'must be unique' });
        optionIds.add(option.id);
      });
      const expected = question.type === 'multiple-choice' ? question.answers : question.answer;
      need(question.type === 'multiple-choice' ? Array.isArray(expected) && expected.length > 0 : typeof expected === 'string', `${path}.${question.type === 'multiple-choice' ? 'answers' : 'answer'}`, 'must match the question type');
    }
    if (question.type === 'true-false') need(typeof question.answer === 'boolean', `${path}.answer`, 'must be a boolean');
    if (question.type === 'fill-in-the-blank') {
      need(typeof question.answer === 'string' && question.answer.trim(), `${path}.answer`, 'must be a non-empty string');
      if (question.acceptableAnswers !== undefined) need(Array.isArray(question.acceptableAnswers), `${path}.acceptableAnswers`, 'must be an array');
      if (question.grading !== undefined) need(typeof question.grading === 'object', `${path}.grading`, 'must be an object');
    }
  });
  const pointSum = (quiz.questions || []).reduce((sum, question) => sum + (Number(question.points) || 0), 0);
  if (Number.isFinite(quiz.totalPoints) && Math.abs(pointSum - quiz.totalPoints) > 0.001) errors.push({ path: '$.totalPoints', message: `does not match question point total (${pointSum})` });
  return errors;
}

function formatValidationErrors(errors) {
  const list = document.createElement('ul');
  errors.slice(0, 8).forEach((error) => { const item = document.createElement('li'); item.append(text('code', error.path), text('span', ` ${error.message}`)); list.append(item); });
  if (errors.length > 8) list.append(text('li', `…and ${errors.length - 8} more issue(s)`));
  return list;
}

async function loadQuiz() {
  const requestedId = new URLSearchParams(window.location.search).get('quiz') || '';
  const manifestResponse = await fetch(`${DATA_ROOT}index.json`);
  if (!manifestResponse.ok) throw new Error('Could not load quiz manifest.');
  const manifest = await manifestResponse.json();
  const entry = manifest.quizzes?.find((quiz) => quiz.id === requestedId || quiz.legacyIds?.includes(requestedId)) || manifest.quizzes?.[0];
  if (!entry) throw new Error('No quizzes are available in the manifest.');
  const response = await fetch(`${DATA_ROOT}${entry.path}`);
  if (!response.ok) throw new Error(`Could not load quiz data: ${entry.path}`);
  const quiz = await response.json();
  const errors = validateQuiz(quiz);
  if (errors.length) { const error = new Error('The quiz data failed validation.'); error.validationErrors = errors; throw error; }
  return quiz;
}

function selectQuestions(quiz) {
  const selection = quiz.selection || { mode: 'fixed' };
  if (selection.mode !== 'question-bank') return [...quiz.questions];
  let candidates = [...quiz.questions];
  ['chapter', 'difficulty'].forEach((filter) => { if (selection[filter]) candidates = candidates.filter((question) => question[filter] === selection[filter]); });
  if (Array.isArray(selection.tags) && selection.tags.length) candidates = candidates.filter((question) => selection.tags.every((tag) => question.tags.includes(tag)));
  const chosen = [];
  const shuffle = (items) => {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const target = Math.floor(Math.random() * (index + 1));
      [items[index], items[target]] = [items[target], items[index]];
    }
    return items;
  };
  const counts = selection.counts || {};
  Object.entries(counts).forEach(([type, count]) => {
    const pool = shuffle(candidates.filter((question) => question.type === type));
    chosen.push(...pool.slice(0, Number(count)));
  });
  return chosen.length ? shuffle(chosen) : [...quiz.questions];
}

class QuizSession {
  constructor(quiz) {
    this.quiz = quiz;
    this.questions = selectQuestions(quiz);
    this.storageKey = `${STORAGE_PREFIX}${escapeKey(quiz.id)}.v1`;
    this.state = this.restore() || { answers: {}, currentIndex: 0, submitted: false, result: null };
    this.state.currentIndex = Math.min(Math.max(Number(this.state.currentIndex) || 0, 0), this.questions.length - 1);
    if (this.state.submitted && this.state.result) this.state.result = this.grade();
  }
  restore() { try { const value = JSON.parse(localStorage.getItem(this.storageKey)); return value && typeof value === 'object' ? value : null; } catch { return null; } }
  save() { try { localStorage.setItem(this.storageKey, JSON.stringify(this.state)); } catch { /* private browsing can disable storage */ } }
  setAnswer(questionId, answer) { if (this.state.submitted) return; this.state.answers[questionId] = answer; this.save(); }
  answerFor(questionId) { return this.state.answers[questionId]; }
  answeredCount() { return this.questions.filter((question) => this.isAnswered(question)).length; }
  isAnswered(question) { const answer = this.answerFor(question.id); return Array.isArray(answer) ? answer.length > 0 : answer !== undefined && answer !== null && String(answer).trim() !== ''; }
  grade() {
    const details = this.questions.map((question) => {
      const userAnswer = this.answerFor(question.id);
      let correct = false;
      if (question.type === 'fill-in-the-blank') {
        const accepted = [question.answer, ...(question.acceptableAnswers || [])].map((answer) => normalizeFill(answer, question.grading));
        correct = accepted.includes(normalizeFill(userAnswer, question.grading));
      } else correct = answersEqual(userAnswer, question.type === 'multiple-choice' ? question.answers : question.answer);
      return { questionId: question.id, correct, userAnswer, pointsEarned: correct ? question.points : 0 };
    });
    const score = details.reduce((sum, detail) => sum + detail.pointsEarned, 0);
    return { score, totalPoints: this.questions.reduce((sum, question) => sum + question.points, 0), correctCount: details.filter((item) => item.correct).length, incorrectCount: details.filter((item) => this.isAnswered(this.questions.find((question) => question.id === item.questionId)) && !item.correct).length, unansweredCount: details.filter((item) => !this.isAnswered(this.questions.find((question) => question.id === item.questionId))).length, details, submittedAt: new Date().toISOString() };
  }
  submit() { this.state.submitted = true; this.state.result = this.grade(); this.save(); }
  reset() { this.state = { answers: {}, currentIndex: 0, submitted: false, result: null }; this.save(); }
}

class QuizUI {
  constructor(session) { this.session = session; this.app = $('#app'); this.reviewFilter = 'all'; this.render(); }
  render() { $('#header-exam-label').textContent = this.session.quiz.title; this.session.state.submitted ? this.renderResults() : this.renderQuiz(); }
  baseShell() {
    const fragment = document.createDocumentFragment();
    const main = document.createElement('main'); main.className = 'quiz-main';
    const intro = document.createElement('section'); intro.className = 'quiz-intro';
    const title = text('h1', this.session.quiz.title); const desc = text('p', this.session.quiz.description); desc.className = 'quiz-description'; intro.append(title, desc);
    const aside = document.createElement('aside'); aside.className = 'question-nav'; aside.setAttribute('aria-label', 'Question navigation');
    fragment.append(main, aside); this.app.replaceChildren(fragment); return { main, intro, aside };
  }
  renderQuiz() {
    const { main, intro, aside } = this.baseShell();
    const meta = document.createElement('div'); meta.className = 'quiz-meta'; meta.append(text('span', `${this.session.quiz.subject} · ${this.session.quiz.chapter}`), text('span', `${this.session.questions.length} questions`));
    const progressWrap = document.createElement('div'); progressWrap.className = 'progress-wrap'; const progressLabel = text('span', `${this.session.answeredCount()} / ${this.session.questions.length} answered`); progressLabel.className = 'progress-label'; const progress = document.createElement('div'); progress.className = 'progress-track'; const bar = document.createElement('div'); bar.className = 'progress-bar'; bar.style.width = `${(this.session.answeredCount() / this.session.questions.length) * 100}%`; progress.append(bar); progressWrap.append(progressLabel, progress);
    const top = document.createElement('div'); top.className = 'intro-top'; top.append(meta, progressWrap); intro.prepend(top); main.append(intro);
    const q = this.session.questions[this.session.state.currentIndex]; const card = this.questionCard(q); card.classList.add('question-enter'); main.append(card); requestAnimationFrame(() => card.classList.add('question-enter-active')); main.append(this.actionBar()); this.renderQuestionNav(aside);
  }
  questionCard(question) {
    const section = document.createElement('section'); section.className = 'question-card';
    const header = document.createElement('div'); header.className = 'question-header'; const number = text('span', String(this.session.state.currentIndex + 1).padStart(2, '0'), 'question-number'); const chips = document.createElement('div'); chips.className = 'question-chips'; chips.append(text('span', TYPE_LABELS[question.type], 'chip'), text('span', `${question.points} ${question.points === 1 ? 'point' : 'points'}`, 'chip'), text('span', question.difficulty, `chip difficulty-${question.difficulty}`)); header.append(number, chips);
    const prompt = text('h2', question.question); prompt.className = 'question-prompt'; section.append(header);
    if (question.image?.src) {
      const figure = document.createElement('figure'); figure.className = 'question-figure';
      const image = document.createElement('img'); image.src = question.image.src; image.alt = question.image.alt; image.loading = 'lazy'; figure.append(image);
      if (question.image.caption) figure.append(text('figcaption', question.image.caption));
      section.append(figure);
    }
    section.append(prompt);
    const answerArea = document.createElement('div'); answerArea.className = 'answer-area'; const saved = this.session.answerFor(question.id);
    if (['single-choice', 'multiple-choice'].includes(question.type)) answerArea.append(this.optionList(question, saved));
    else if (question.type === 'true-false') answerArea.append(this.booleanList(question, saved));
    else answerArea.append(this.fillInput(question, saved));
    section.append(answerArea);
    const hint = text('p', question.type === 'multiple-choice' ? 'Select every option that applies.' : question.type === 'fill-in-the-blank' ? 'Trimmed spaces are ignored. Check the prompt before submitting.' : 'Choose one answer. You can change it before submitting.'); hint.className = 'answer-hint'; section.append(hint);
    return section;
  }
  optionList(question, saved) {
    const list = document.createElement('div'); list.className = 'option-list'; list.setAttribute('role', 'group'); list.setAttribute('aria-label', 'Answer options');
    question.options.forEach((option) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'answer-option'; const selected = Array.isArray(saved) ? saved.includes(option.id) : saved === option.id; if (selected) button.classList.add('selected'); button.setAttribute('aria-pressed', String(selected)); button.append(text('span', option.id, 'option-id'), text('span', option.text, 'option-copy'), text('span', selected ? ICONS.check : '↗', 'option-mark')); button.addEventListener('click', () => { const next = question.type === 'multiple-choice' ? [...(Array.isArray(this.session.answerFor(question.id)) ? this.session.answerFor(question.id) : [])] : option.id; if (question.type === 'multiple-choice') { const index = next.indexOf(option.id); index >= 0 ? next.splice(index, 1) : next.push(option.id); } this.session.setAnswer(question.id, next); this.syncAnswerControls(question); }); list.append(button); }); return list;
  }
  booleanList(question, saved) { const list = document.createElement('div'); list.className = 'option-list boolean-list'; [['true', 'True'], ['false', 'False']].forEach(([value, label]) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'answer-option'; const selected = saved === (value === 'true'); if (selected) button.classList.add('selected'); button.setAttribute('aria-pressed', String(selected)); button.append(text('span', value === 'true' ? 'T' : 'F', 'option-id'), text('span', label, 'option-copy'), text('span', selected ? ICONS.check : '↗', 'option-mark')); button.addEventListener('click', () => { this.session.setAnswer(question.id, value === 'true'); this.syncAnswerControls(question); }); list.append(button); }); return list; }
  syncAnswerControls(question) { const saved = this.session.answerFor(question.id); $$('.answer-option', this.app).forEach((button, index) => { const optionId = question.type === 'true-false' ? index === 0 : question.options[index].id; const selected = question.type === 'true-false' ? saved === (index === 0) : Array.isArray(saved) ? saved.includes(optionId) : saved === optionId; button.classList.toggle('selected', selected); button.setAttribute('aria-pressed', String(selected)); const mark = $('.option-mark', button); if (mark) mark.textContent = selected ? ICONS.check : '↗'; }); this.updateProgressUI(); }
  updateProgressUI() { const count = this.session.answeredCount(); const total = this.session.questions.length; const label = $('.progress-label', this.app); const bar = $('.progress-bar', this.app); if (label) label.textContent = `${count} / ${total} answered`; if (bar) bar.style.width = `${(count / total) * 100}%`; const navCount = $('.nav-heading span:last-child', this.app); if (navCount) navCount.textContent = `${count} / ${total}`; $$('.number-button', this.app).forEach((button, index) => { const answered = this.session.isAnswered(this.session.questions[index]); button.classList.toggle('answered', answered); button.setAttribute('aria-label', `Question ${index + 1}, ${answered ? 'answered' : 'not answered'}`); }); }
  fillInput(question, saved) { const wrap = document.createElement('div'); wrap.className = 'fill-wrap'; const label = text('label', 'Your answer'); label.htmlFor = `answer-${question.id}`; const input = document.createElement('input'); input.id = `answer-${question.id}`; input.className = 'fill-input'; input.type = 'text'; input.autocomplete = 'off'; input.value = typeof saved === 'string' ? saved : ''; input.placeholder = 'Type your answer…'; input.addEventListener('input', (event) => this.session.setAnswer(question.id, event.target.value)); wrap.append(label, input); return wrap; }
  actionBar() { const bar = document.createElement('div'); bar.className = 'action-bar'; const prev = document.createElement('button'); prev.type = 'button'; prev.className = 'button button-quiet'; prev.disabled = this.session.state.currentIndex === 0; prev.append(text('span', '←'), text('span', 'Previous')); prev.addEventListener('click', () => { this.session.state.currentIndex -= 1; this.session.save(); this.render(); }); const next = document.createElement('button'); next.type = 'button'; next.className = 'button button-dark'; next.append(text('span', this.session.state.currentIndex === this.session.questions.length - 1 ? 'Review answers' : 'Next question'), text('span', '→')); next.addEventListener('click', () => { if (this.session.state.currentIndex < this.session.questions.length - 1) { this.session.state.currentIndex += 1; this.session.save(); this.render(); } else this.openSubmitDialog(); }); const clear = document.createElement('button'); clear.type = 'button'; clear.className = 'clear-progress'; clear.textContent = 'Clear progress'; clear.addEventListener('click', () => this.confirmClear()); bar.append(prev, next, clear); return bar; }
  renderQuestionNav(aside) { const header = document.createElement('div'); header.className = 'nav-heading'; header.append(text('span', 'Questions'), text('span', `${this.session.answeredCount()} / ${this.session.questions.length}`)); aside.append(header); const list = document.createElement('div'); list.className = 'number-grid'; this.session.questions.forEach((question, index) => { const button = document.createElement('button'); button.type = 'button'; button.className = 'number-button'; button.textContent = String(index + 1).padStart(2, '0'); if (index === this.session.state.currentIndex) button.classList.add('current'); if (this.session.isAnswered(question)) { button.classList.add('answered'); button.setAttribute('aria-label', `Question ${index + 1}, answered`); } else button.setAttribute('aria-label', `Question ${index + 1}, not answered`); button.addEventListener('click', () => { this.session.state.currentIndex = index; this.session.save(); this.render(); }); list.append(button); }); aside.append(list); const note = text('p', 'Your progress is saved locally in this browser.'); note.className = 'nav-note'; aside.append(note); }
  openSubmitDialog() { const unanswered = this.session.questions.length - this.session.answeredCount(); const dialog = document.createElement('dialog'); dialog.className = 'confirm-dialog'; const title = text('h2', unanswered ? `You have ${unanswered} unanswered ${unanswered === 1 ? 'question' : 'questions'}.` : 'Ready to submit?'); const copy = text('p', unanswered ? 'You can still go back and complete them, or submit now and leave them blank.' : 'Once submitted, this attempt will be locked and graded.'); const actions = document.createElement('div'); actions.className = 'dialog-actions'; const cancel = text('button', 'Keep working', 'button button-quiet'); cancel.type = 'button'; cancel.addEventListener('click', () => dialog.close()); const submit = text('button', unanswered ? 'Submit anyway' : 'Submit quiz', 'button button-dark'); submit.type = 'button'; submit.addEventListener('click', () => { this.session.submit(); dialog.close(); this.render(); }); actions.append(cancel, submit); dialog.append(title, copy, actions); document.body.append(dialog); dialog.addEventListener('close', () => dialog.remove()); dialog.showModal(); }
  confirmClear() { const dialog = document.createElement('dialog'); dialog.className = 'confirm-dialog'; dialog.append(text('h2', 'Clear this attempt?'), text('p', 'Your saved answers will be removed from this browser. This cannot be undone.')); const actions = document.createElement('div'); actions.className = 'dialog-actions'; const cancel = text('button', 'Cancel', 'button button-quiet'); cancel.type = 'button'; cancel.addEventListener('click', () => dialog.close()); const clear = text('button', 'Clear and restart', 'button button-dark'); clear.type = 'button'; clear.addEventListener('click', () => { this.session.reset(); dialog.close(); this.render(); }); actions.append(cancel, clear); dialog.append(actions); document.body.append(dialog); dialog.addEventListener('close', () => dialog.remove()); dialog.showModal(); }
  renderResults() { const { main, intro, aside } = this.baseShell(); aside.remove(); const result = this.session.state.result || this.session.grade(); const percent = Math.round((result.score / result.totalPoints) * 100); const kicker = text('p', 'Attempt complete', 'result-kicker'); const title = text('h1', 'Your result'); const copy = text('p', `${this.session.quiz.title} · Submitted ${new Date(result.submittedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`); copy.className = 'quiz-description'; intro.append(kicker, title, copy); const summary = document.createElement('section'); summary.className = 'result-summary'; const score = document.createElement('div'); score.className = 'score-block'; score.append(text('span', 'SCORE', 'summary-label'), text('strong', `${result.score} / ${result.totalPoints}`), text('span', `${percent}%`, 'score-percent')); const stats = document.createElement('div'); stats.className = 'result-stats'; [['Correct', result.correctCount, 'good'], ['Incorrect', result.incorrectCount, 'bad'], ['Unanswered', result.unansweredCount, 'neutral']].forEach(([label, value, tone]) => { const stat = document.createElement('div'); stat.className = `result-stat ${tone}`; stat.append(text('span', label), text('strong', String(value))); stats.append(stat); }); summary.append(score, stats); main.append(intro, summary); const reviewHeader = document.createElement('div'); reviewHeader.className = 'review-heading'; reviewHeader.append(text('h2', 'Review')); const filters = document.createElement('div'); filters.className = 'review-filters'; [['all', 'View all'], ['incorrect', 'View missed']].forEach(([value, label]) => { const button = text('button', label, `filter-button ${this.reviewFilter === value ? 'active' : ''}`); button.type = 'button'; button.addEventListener('click', () => { this.reviewFilter = value; this.renderResults(); }); filters.append(button); }); reviewHeader.append(filters); main.append(reviewHeader); const list = document.createElement('div'); list.className = 'review-list'; this.session.questions.forEach((question, index) => { const detail = result.details[index]; if (this.reviewFilter === 'incorrect' && detail.correct) return; list.append(this.reviewCard(question, detail, index)); }); main.append(list); const resultActions = document.createElement('div'); resultActions.className = 'result-actions'; const retake = text('button', 'Retake quiz ↻', 'button button-dark'); retake.type = 'button'; retake.addEventListener('click', () => { this.session.reset(); this.reviewFilter = 'all'; this.render(); }); const home = text('a', 'Back to Atlas ↗', 'button button-quiet'); home.href = 'https://chemistryatlas.xyz'; resultActions.append(retake, home); main.append(resultActions); }
  reviewCard(question, detail, index) { const card = document.createElement('article'); card.className = `review-card ${detail.correct ? 'review-correct' : 'review-missed'}`; const header = document.createElement('div'); header.className = 'review-card-header'; const status = text('span', detail.correct ? `${ICONS.check} Correct` : detail.userAnswer === undefined ? `${ICONS.dash} Unanswered` : `${ICONS.cross} Incorrect`, `review-status ${detail.correct ? 'status-good' : 'status-bad'}`); header.append(text('span', `Question ${String(index + 1).padStart(2, '0')}`, 'review-number'), status, text('span', `${question.points} ${question.points === 1 ? 'point' : 'points'}`, 'review-points')); const prompt = text('h3', question.question); const answerGrid = document.createElement('div'); answerGrid.className = 'review-answers'; answerGrid.append(this.answerReadout('Your answer', this.formatAnswer(question, detail.userAnswer), detail.correct ? 'answer-good' : 'answer-bad'), this.answerReadout('Correct answer', this.formatAnswer(question, question.type === 'multiple-choice' ? question.answers : question.answer), 'answer-correct')); const explanation = document.createElement('div'); explanation.className = 'explanation'; explanation.append(text('span', 'Explanation', 'explanation-label'), text('p', question.explanation)); if (question.tags?.length) { const tags = document.createElement('div'); tags.className = 'tag-list'; question.tags.forEach((tag) => tags.append(text('span', `#${tag}`))); explanation.append(tags); } card.append(header, prompt, answerGrid, explanation); return card; }
  answerReadout(label, value, tone) { const wrap = document.createElement('div'); wrap.className = `answer-readout ${tone}`; wrap.append(text('span', label, 'readout-label'), text('strong', value)); return wrap; }
  formatAnswer(question, answer) { if (answer === undefined || answer === null || answer === '' || (Array.isArray(answer) && answer.length === 0)) return 'No answer'; if (question.type === 'multiple-choice') return answer.map((id) => question.options.find((option) => option.id === id)?.text || id).join(' · '); if (question.type === 'single-choice') return question.options.find((option) => option.id === answer)?.text || answer; if (question.type === 'true-false') return answer ? 'True' : 'False'; return String(answer); }
}

function renderFatalError(error) { const app = $('#app'); app.replaceChildren(); const panel = document.createElement('section'); panel.className = 'error-panel'; panel.append(text('span', 'QUIZ DATA ERROR', 'error-kicker'), text('h1', 'This quiz needs attention.'), text('p', error.message || 'Something went wrong while loading the quiz.')); if (error.validationErrors) panel.append(formatValidationErrors(error.validationErrors)); const link = text('a', 'Back to Chemistry Atlas ↗', 'button button-dark'); link.href = 'https://chemistryatlas.xyz'; panel.append(link); app.append(panel); }

function applyQuizTheme(quiz) {
  const subject = String(quiz.subject || '').toLowerCase();
  const theme = subject.includes('bio') ? 'biochemistry' : subject.includes('organic') ? 'organic-chemistry' : subject.includes('inorganic') ? 'inorganic-chemistry' : subject.includes('physical') ? 'physical-chemistry' : subject.includes('analytical') ? 'analytical-chemistry' : 'general-chemistry';
  document.documentElement.dataset.quizSubject = theme;
}

loadQuiz().then((quiz) => { applyQuizTheme(quiz); return new QuizUI(new QuizSession(quiz)); }).catch(renderFatalError);
