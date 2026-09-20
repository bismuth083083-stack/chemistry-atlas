const DATA_ROOT = './data/';
const STORAGE_KEY = 'chemistry-atlas.quiz-library.filters.v1';

const SUBJECT_META = {
  'organic-chemistry': { label: 'Organic Chemistry', short: 'ORG', className: 'organic' },
  'physical-chemistry': { label: 'Physical Chemistry', short: 'PCHEM', className: 'physical' },
  'inorganic-chemistry': { label: 'Inorganic Chemistry', short: 'INORG', className: 'inorganic' },
  'analytical-chemistry': { label: 'Analytical Chemistry', short: 'ANA', className: 'analytical' },
  biochemistry: { label: 'Biochemistry', short: 'BIOC', className: 'biochem' },
  'general-chemistry': { label: 'General Chemistry', short: 'GEN', className: 'general' }
};

const TYPE_LABELS = { lesson: 'Lesson Quiz', topic: 'Topic Quiz', comprehensive: 'Comprehensive' };
const DIFFICULTY_LABELS = { basic: 'Basic', easy: 'Basic', intermediate: 'Intermediate', medium: 'Intermediate', advanced: 'Advanced', hard: 'Advanced', challenging: 'Challenging' };
const SUBJECT_ORDER = ['organic-chemistry', 'physical-chemistry', 'inorganic-chemistry', 'analytical-chemistry', 'biochemistry', 'general-chemistry'];
const DIFFICULTY_ORDER = { basic: 1, easy: 1, intermediate: 2, medium: 2, advanced: 3, hard: 3, challenging: 4 };

const $ = (selector, parent = document) => parent.querySelector(selector);
const normalize = (value) => String(value ?? '').trim().toLowerCase();
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

function subjectKey(value) {
  const key = normalize(value).replace(/_/g, '-');
  if (SUBJECT_META[key]) return key;
  if (key.includes('organic')) return 'organic-chemistry';
  if (key.includes('physical')) return 'physical-chemistry';
  if (key.includes('inorganic')) return 'inorganic-chemistry';
  if (key.includes('analytical')) return 'analytical-chemistry';
  if (key.includes('bio')) return 'biochemistry';
  return 'general-chemistry';
}

function subjectMeta(value) {
  return SUBJECT_META[subjectKey(value)] || SUBJECT_META['general-chemistry'];
}

function displayDate(value) {
  if (!value) return '—';
  const date = String(value).slice(0, 10).replace(/-/g, '.');
  return date;
}

function difficultyValue(entry) {
  return normalize(entry.difficulty || 'basic');
}

function sortNumber(entry) {
  return Number(entry.lessonNumber ?? entry.topicNumber ?? entry.examNumber ?? 9999);
}

function entryCode(entry) {
  const meta = subjectMeta(entry.subject);
  if (entry.displayId) return entry.displayId;
  return entry.id.toUpperCase();
}

function entrySearchText(entry) {
  return [
    entry.id, entry.displayId, entry.title, entry.description, entry.subject, entry.chapter,
    entry.lesson, entry.topic, entry.type, entry.difficulty,
    ...(entry.tags || []), ...(entry.knowledgePoints || [])
  ].map(normalize).join(' ');
}

function matchesSearch(entry, rawQuery) {
  const query = normalize(rawQuery);
  if (!query) return true;
  if (/^\d{1,3}$/.test(query)) {
    const number = Number(query);
    const padded = String(number).padStart(2, '0');
    const code = normalize(entryCode(entry));
    return [entry.lessonNumber, entry.topicNumber, entry.examNumber].some((value) => Number(value) === number)
      || new RegExp(`(?:^|-)${padded}(?:$|-)`).test(code)
      || code.includes(`-${padded}`);
  }
  return entrySearchText(entry).includes(query);
}

function dateValue(value) {
  const parsed = Date.parse(value || '');
  return Number.isNaN(parsed) ? 0 : parsed;
}

function compareEntries(left, right, sort) {
  const leftMeta = subjectMeta(left.subject);
  const rightMeta = subjectMeta(right.subject);
  if (sort === 'oldest') return dateValue(left.createdAt) - dateValue(right.createdAt);
  if (sort === 'course') return (SUBJECT_ORDER.indexOf(subjectKey(left.subject)) - SUBJECT_ORDER.indexOf(subjectKey(right.subject)))
    || (sortNumber(left) - sortNumber(right))
    || entryCode(left).localeCompare(entryCode(right));
  if (sort === 'id') return entryCode(left).localeCompare(entryCode(right), undefined, { numeric: true });
  if (sort === 'count') return (Number(left.questionCount || 0) - Number(right.questionCount || 0)) || entryCode(left).localeCompare(entryCode(right));
  if (sort === 'difficulty') return ((DIFFICULTY_ORDER[difficultyValue(left)] || 9) - (DIFFICULTY_ORDER[difficultyValue(right)] || 9)) || entryCode(left).localeCompare(entryCode(right));
  return (dateValue(right.updatedAt || right.createdAt) - dateValue(left.updatedAt || left.createdAt))
    || (dateValue(right.createdAt) - dateValue(left.createdAt))
    || leftMeta.label.localeCompare(rightMeta.label)
    || entryCode(left).localeCompare(entryCode(right));
}

function cardMarkup(entry, index = 0) {
  const meta = subjectMeta(entry.subject);
  const tags = (entry.tags || []).slice(0, 4).map((tag) => `<span>#${escapeHtml(tag)}</span>`).join('');
  const count = entry.questionCount ?? entry.questions?.length ?? '—';
  const difficulty = DIFFICULTY_LABELS[difficultyValue(entry)] || 'Basic';
  return `
    <a class="library-card theme-${meta.className}" style="--card-delay: ${Math.min(index, 8) * 55}ms" href="?quiz=${encodeURIComponent(entry.id)}">
      <span class="library-card-accent" aria-hidden="true"></span>
      <span class="library-card-top"><span class="quiz-code">${escapeHtml(entryCode(entry))}</span><span class="subject-badge">${escapeHtml(meta.label)}</span></span>
      <span class="library-card-kicker">${escapeHtml(TYPE_LABELS[entry.type] || 'Quiz')}</span>
      <h3>${escapeHtml(entry.title)}</h3>
      <p>${escapeHtml(entry.description || entry.chapter || 'A focused Chemistry Atlas practice set.')}</p>
      <span class="library-card-meta"><span>${escapeHtml(String(count))} Questions</span><span>${escapeHtml(difficulty)}</span><span>${escapeHtml(displayDate(entry.updatedAt || entry.createdAt))}</span></span>
      <span class="library-card-tags">${tags}</span>
      <span class="library-card-footer"><span>${escapeHtml(entry.chapter || entry.lesson || 'Practice set')}</span><b aria-hidden="true">↗</b></span>
    </a>
  `;
}

class QuizLibrary {
  constructor(entries) {
    this.entries = entries;
    this.pageSize = 9;
    this.visibleLimit = this.pageSize;
    this.loadingMore = false;
    this.loadTimer = null;
    this.state = this.restoreState();
    this.bindControls();
    this.bindInfiniteScroll();
    this.render();
  }

  restoreState() {
    const defaults = { subject: 'all', type: 'all', difficulty: 'all', sort: 'updated', query: '' };
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaults, ...(saved && typeof saved === 'object' ? saved : {}) };
    } catch {
      return defaults;
    }
  }

  saveState() {
    try {
      const { subject, type, difficulty, sort } = this.state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ subject, type, difficulty, sort }));
    } catch {}
  }

  resetPaging() {
    if (this.loadTimer) window.clearTimeout(this.loadTimer);
    this.loadTimer = null;
    this.loadingMore = false;
    this.visibleLimit = this.pageSize;
  }

  bindControls() {
    const search = $('#library-search');
    search.addEventListener('input', (event) => { this.state.query = event.target.value; this.resetPaging(); this.render(); });
    ['subject', 'type', 'difficulty', 'sort'].forEach((key) => {
      const control = $(`#filter-${key}`);
      control.value = this.state[key];
      control.addEventListener('change', (event) => { this.state[key] = event.target.value; this.resetPaging(); this.saveState(); this.render(); });
    });
    $('#reset-filters').addEventListener('click', () => {
      this.state = { ...this.state, subject: 'all', type: 'all', difficulty: 'all', sort: 'updated', query: '' };
      this.resetPaging();
      $('#library-search').value = '';
      ['subject', 'type', 'difficulty', 'sort'].forEach((key) => { $(`#filter-${key}`).value = this.state[key]; });
      this.saveState();
      this.render();
    });
    $('#empty-reset').addEventListener('click', () => $('#reset-filters').click());
  }

  bindInfiniteScroll() {
    const sentinel = $('#load-sentinel');
    const maybeLoad = () => {
      if (!sentinel.hidden && sentinel.getBoundingClientRect().top < window.innerHeight + 480) this.loadNextPage();
    };
    if ('IntersectionObserver' in window) {
      this.sentinelObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) this.loadNextPage();
      }, { rootMargin: '0px 0px 480px 0px' });
      this.sentinelObserver.observe(sentinel);
    } else {
      window.addEventListener('scroll', maybeLoad, { passive: true });
      window.addEventListener('resize', maybeLoad, { passive: true });
    }
  }

  updateLoadSentinel(results = this.filteredEntries()) {
    const sentinel = $('#load-sentinel');
    const hasMore = results.length > this.visibleLimit;
    sentinel.hidden = !hasMore;
    sentinel.classList.toggle('is-loading', this.loadingMore);
    $('#load-sentinel-label').textContent = this.loadingMore ? 'Loading more quizzes…' : 'Scroll for more quizzes';
  }

  loadNextPage() {
    const results = this.filteredEntries();
    if (this.loadingMore || this.visibleLimit >= results.length) return;
    this.loadingMore = true;
    this.updateLoadSentinel(results);
    this.loadTimer = window.setTimeout(() => {
      this.visibleLimit = Math.min(this.visibleLimit + this.pageSize, results.length);
      this.loadingMore = false;
      this.loadTimer = null;
      this.render();
    }, 160);
  }

  filteredEntries() {
    return this.entries
      .filter((entry) => this.state.subject === 'all' || subjectKey(entry.subject) === this.state.subject)
      .filter((entry) => this.state.type === 'all' || normalize(entry.type) === this.state.type)
      .filter((entry) => this.state.difficulty === 'all' || difficultyValue(entry) === this.state.difficulty || (this.state.difficulty === 'basic' && difficultyValue(entry) === 'easy') || (this.state.difficulty === 'intermediate' && difficultyValue(entry) === 'medium') || (this.state.difficulty === 'advanced' && ['hard', 'challenging'].includes(difficultyValue(entry))))
      .filter((entry) => matchesSearch(entry, this.state.query))
      .sort((left, right) => compareEntries(left, right, this.state.sort));
  }

  render() {
    const results = this.filteredEntries();
    const grid = $('#quiz-grid');
    const empty = $('#library-empty');
    const visible = results.slice(0, this.visibleLimit);
    $('#result-count').textContent = String(results.length);
    $('#total-count').textContent = String(this.entries.length);
    $('#subject-count').textContent = String(new Set(this.entries.map((entry) => subjectKey(entry.subject))).size);
    $('#latest-date').textContent = displayDate(this.entries.slice().sort((a, b) => compareEntries(a, b, 'updated'))[0]?.updatedAt);
    $('#active-filter-label').textContent = this.state.query || this.state.subject !== 'all' || this.state.type !== 'all' || this.state.difficulty !== 'all' ? `${results.length} matching quizzes` : 'All practice sets';
    grid.innerHTML = visible.map((entry, index) => cardMarkup(entry, index)).join('');
    grid.hidden = visible.length === 0;
    empty.hidden = visible.length !== 0;
    this.updateLoadSentinel(results);
  }
}

async function start() {
  const library = $('#library-app');
  if (new URLSearchParams(window.location.search).has('quiz')) {
    library.remove();
    $('#app').hidden = false;
    document.title = 'Quiz · Chemistry Atlas';
    await import('./quiz-engine.js');
    return;
  }

  $('#app').remove();
  try {
    const response = await fetch(`${DATA_ROOT}index.json`);
    if (!response.ok) throw new Error('Could not load quiz manifest.');
    const manifest = await response.json();
    const entries = Array.isArray(manifest.quizzes) ? manifest.quizzes : [];
    new QuizLibrary(entries);
  } catch (error) {
    library.innerHTML = `<section class="library-error"><p class="library-kicker">QUIZ LIBRARY ERROR</p><h1>练习中心暂时无法加载</h1><p>${escapeHtml(error.message)}</p><button class="button button-dark" type="button" onclick="location.reload()">Retry</button></section>`;
  }
}

start();
