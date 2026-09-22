import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = path.join(root, 'data');
const distDataRoot = path.join(root, 'dist', 'data');

// The source PDF contains eight numbered problems. Keep that structure intact;
// the fixed schema metadata is only used for rendering, not for rebalancing.
const base = (id, type, question, explanation, tags, extra = {}) => ({
  id, type, question, points: 1, explanation, difficulty: 'medium', tags, ...extra
});
const single = (id, question, options, answer, explanation, tags) => base(id, 'single-choice', question, explanation, tags, {
  options: options.map(([optionId, text]) => ({ id: optionId, text })), answer
});
const many = (id, question, options, answers, explanation, tags) => base(id, 'multiple-choice', question, explanation, tags, {
  options: options.map(([optionId, text]) => ({ id: optionId, text })), answers
});
const fill = (id, question, answer, acceptableAnswers, explanation, tags) => base(id, 'fill-in-the-blank', question, explanation, tags, {
  answer, acceptableAnswers, grading: { caseSensitive: false, collapseWhitespace: true }
});

const questions = [
  many('q001', '判断下列关于热力学第一定律、状态函数、热和功的说法。选择所有正确项。', [
    ['A', '给定体系状态后，所有状态函数都有唯一数值；反过来若状态函数组的数值确定，体系状态也随之确定。'],
    ['B', '体系发生状态变化时，所有状态函数都一定发生变化。'],
    ['C', '因为 ΔU=Qv、ΔH=Qp，所以 Qv 和 Qp 本身是状态函数。'],
    ['D', '体系对外做功时，必须先吸收热量。'],
    ['E', '恒压绝热容器中机械搅拌液体使温度升高时，可以直接写 ΔH=Qp=0。'],
    ['F', '同一初态和终态之间，无论采用可逆电化学电池还是其他路径，ΔH 相同，但 Q 可以不同。']
  ], ['A', 'F'], '状态函数只由状态决定；热量和功是过程量。绝热膨胀可以在 Q=0 时对外做功，机械搅拌属于非膨胀功，不能直接套用 ΔH=Qp。', ['state functions', 'heat', 'work']),
  many('q002', '综合回答下列四个热力学思考情境。选择所有正确的结论。', [
    ['A', '可逆热机效率是理论极限，但可逆过程要求无限接近平衡，因此不能在有限时间内直接作为高功率牵引机。'],
    ['B', '相同 Zn 与盐酸反应中，敞口装置通常比封闭刚性装置释放更多热量，因为生成氢气还会做膨胀功。'],
    ['C', '压缩空气突然放空、在压力等于外界时封住开口后，导热回到环境温度，压力会重新升高。'],
    ['D', '氨合成的实验 Qp 可能小于 Kirchhoff 计算值，因为计算按单位反应进度，而实验可能只达到平衡转化。'],
    ['E', '只要测量温度不同，Kirchhoff 关系就不能用于比较反应热。']
  ], ['A', 'C', 'D'], '可逆性、膨胀功、快速绝热膨胀后的回温，以及实际反应进度都会影响过程热量的解释；Kirchhoff 关系本身并不因温度变化而失效。', ['reversibility', 'reaction heat', 'equilibrium']),
  single('q003', '理想气体从同一初态分别进行绝热可逆和绝热不可逆过程。虽然两种推导都可写出 W=CvΔT，但关于两种功的说法正确的是……', [
    ['A', '两种过程的功必然相同'],
    ['B', '两种过程的终态通常不同，因此功不必相同；可逆膨胀的功的绝对值通常更大'],
    ['C', '绝热过程的功都为零'],
    ['D', '不可逆过程一定得到更大的膨胀功']
  ], 'B', '公式形式相同不代表 ΔT 相同。相同初态和外界条件下，可逆过程始终无限接近平衡，通常能够获得更大的对外功。', ['adiabatic process', 'reversible work']),
  many('q004', '分别判断下列等式成立所需的通常条件。选择所有正确项。', [
    ['A', 'ΔH=Qp：恒压，且没有除膨胀功以外的非膨胀功。'],
    ['B', 'ΔU=Qv：恒容，且没有除膨胀功以外的非膨胀功。'],
    ['C', 'W=nRT ln(V1/V2)：理想气体、等温、可逆，且只有膨胀功。'],
    ['D', '三条等式对任意体系、任意路径都成立。']
  ], ['A', 'B', 'C'], '这些等式都需要明确的边界条件。采用 ΔU=Q+W 约定时，W=nRT ln(V1/V2) 在膨胀时为负。', ['enthalpy', 'internal energy', 'reversible work']),
  many('q005', '按 ΔU=Q+W 的符号约定，判断下列过程中的 W、Q、ΔU、ΔH 符号。选择所有正确项。', [
    ['A', '理想气体自由膨胀：W=0，Q=0，ΔU=0，ΔH=0。'],
    ['B', '范德瓦耳斯气体恒容受热：W=0，Q>0，ΔU>0，ΔH>0。'],
    ['C', 'Zn(s)+2HCl(aq)→ZnCl₂(aq)+H₂(g)，恒压非绝热放热：W<0，Q<0，ΔU<0，ΔH<0。'],
    ['D', 'H₂(g)+Cl₂(g)→2HCl(g)，绝热刚性钢瓶：W=0，Q=0，ΔU=0，ΔH>0。'],
    ['E', '水在 273.15 K、101.325 kPa 下冻结：W<0，Q<0，ΔU<0，ΔH<0。']
  ], ['A', 'B', 'C', 'D', 'E'], '自由膨胀没有外界压力功；恒容受热使内能上升；放热且生成气体的反应具有负的 Q、W 和焓变；绝热刚性反应中温度升高使焓上升；水冻结时体积增大并放热。', ['sign conventions', 'reaction signs', 'phase change']),
  single('q006', '氢气和氧气生成水可通过燃烧、爆炸、热爆炸或燃料电池等不同路径完成。若初态和终态相同，下列说法正确的是……', [
    ['A', '所有路径的 Q、W、ΔU、ΔH 都相同'],
    ['B', '所有路径的 ΔU 和 ΔH 相同，但 Q、W 可以不同'],
    ['C', '只有燃料电池路径的 ΔH 是状态函数'],
    ['D', '不同路径的 ΔU 必然不同']
  ], 'B', '内能和焓是状态函数，热量和功是路径函数；路径改变不会改变相同初末态之间的 ΔU 和 ΔH。', ['state functions', 'path functions']),
  fill('q007', '海水→云→雨/雪→冰→融化→河流→海水构成完整循环，因此该循环的 ΔU=____，ΔH=____。', '0，0', ['0，0', '0, 0', '0 0', '零，零'], '完整循环回到初态，所有状态函数的总变化为零，因此 ΔU=0、ΔH=0。', ['thermodynamic cycle', 'state functions']),
  many('q008', '298 K、101.3 kPa 的液态水要可逆地变成同温同压的水蒸气。选择可行的可逆路径。', [
    ['A', '在 101.3 kPa 下可逆加热至沸点，在沸点可逆汽化，再将蒸气可逆冷却至 298 K。'],
    ['B', '298 K 下可逆降压至饱和蒸气压，在该压力下可逆汽化，再等温可逆压缩至 101.3 kPa。'],
    ['C', '直接突然蒸发，并把该过程称为可逆过程。'],
    ['D', '在刚性绝热容器中完成全部过程，不需要热交换。']
  ], ['A', 'B'], '可逆路径必须由一系列无限接近平衡的步骤组成。前两条分别利用常压沸点和 298 K 下的饱和蒸气压构造可逆路径；突然蒸发和刚性绝热路线不满足条件。', ['reversible path', 'phase equilibrium'])
];

const quiz = {
  id: 'PCHEM-T01',
  title: '物理化学专题：热力学第一定律思考题',
  description: '按用户提供的《热力学第一定律思考题》PDF 原有 8 个大题导入，不按题型或难度人为拆分和配比。',
  subject: 'physical-chemistry',
  chapter: 'Topic · First law of thermodynamics',
  version: '1.1.0',
  totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
  selection: { mode: 'fixed' },
  scopeNote: '题目数量和组织方式遵循来源 PDF 的八道编号大题；题型只在系统需要交互判分时采用最接近的呈现方式，不代表额外的题型或难度分布。',
  questions
};

const manifestEntry = {
  id: 'PCHEM-T01',
  title: quiz.title,
  description: quiz.description,
  subject: quiz.subject,
  type: 'topic',
  lessonNumber: null,
  topicNumber: 1,
  examNumber: null,
  chapter: quiz.chapter,
  lesson: 'State functions, heat, work, and reversible paths',
  topic: 'Thermodynamics first-law thinking problems',
  questionCount: questions.length,
  difficulty: 'intermediate',
  tags: ['thermodynamics', 'first law', 'state functions', 'enthalpy', 'reversibility'],
  knowledgePoints: ['state functions', 'heat and work', 'constant-pressure and constant-volume processes', 'reversible processes', 'enthalpy'],
  createdAt: '2026-09-22',
  updatedAt: '2026-09-22',
  relatedNotes: ['/physical/dist/lesson-04.html'],
  path: 'pchem-t01.json',
  mode: 'fixed'
};

const body = JSON.stringify(quiz, null, 2) + '\n';
fs.writeFileSync(path.join(dataRoot, 'pchem-t01.json'), body, 'utf8');
fs.writeFileSync(path.join(distDataRoot, 'pchem-t01.json'), body, 'utf8');

for (const target of [path.join(dataRoot, 'index.json'), path.join(distDataRoot, 'index.json')]) {
  const manifest = JSON.parse(fs.readFileSync(target, 'utf8'));
  manifest.quizzes = [...manifest.quizzes.filter((entry) => entry.id !== manifestEntry.id), manifestEntry];
  fs.writeFileSync(target, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

console.log(`Updated ${manifestEntry.id} with ${questions.length} source-aligned questions.`);
