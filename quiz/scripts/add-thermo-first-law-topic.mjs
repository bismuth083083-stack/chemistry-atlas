import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = path.join(root, 'data');
const distDataRoot = path.join(root, 'dist', 'data');

const points = (difficulty) => difficulty === 'challenging' ? 3 : difficulty === 'hard' ? 2 : 1;
const one = (id, question, options, answer, explanation, difficulty, tags) => ({
  id, type: 'single-choice', question,
  options: options.map(([optionId, text]) => ({ id: optionId, text })),
  answer, points: points(difficulty), explanation, difficulty, tags
});
const many = (id, question, options, answers, explanation, difficulty, tags) => ({
  id, type: 'multiple-choice', question,
  options: options.map(([optionId, text]) => ({ id: optionId, text })),
  answers, points: points(difficulty), explanation, difficulty, tags
});
const tf = (id, question, answer, explanation, difficulty, tags) => ({
  id, type: 'true-false', question, answer,
  points: points(difficulty), explanation, difficulty, tags
});
const fill = (id, question, answer, acceptableAnswers, explanation, difficulty, tags) => ({
  id, type: 'fill-in-the-blank', question, answer, acceptableAnswers,
  grading: { caseSensitive: false, collapseWhitespace: true },
  points: points(difficulty), explanation, difficulty, tags
});

const questions = [
  one('q001', '关于热力学状态与状态函数，下列说法正确的是……', [
    ['A', '给定体系状态后，每一个状态函数都有唯一数值'],
    ['B', '只要知道热量 Q，就能唯一确定体系状态'],
    ['C', '状态函数的数值只由过程路径决定'],
    ['D', '所有状态函数都必须在恒温过程中才有定义']
  ], 'A', '状态函数只依赖体系当前状态。状态确定后，U、H、P、V 等状态函数都有确定值；热量和功则是过程量。', 'easy', ['state functions', 'system state']),
  tf('q002', '体系发生状态变化时，所有状态函数都一定发生变化。', false, '状态改变并不意味着每一个状态函数都必须改变。例如某些过程可以保持温度不变；判断必须结合具体初末状态。', 'easy', ['state functions']),
  tf('q003', 'U 和 H 是状态函数，而 Qv、Qp 通常不是状态函数。', true, '内能和焓只由初末状态决定；Qv、Qp 只是特定条件下的热量记号，热量本身取决于过程路径。', 'easy', ['heat', 'enthalpy']),
  one('q004', '若体系在绝热条件下膨胀并对外做功，下列判断最合理的是……', [
    ['A', '体系必须先吸收等量热量'],
    ['B', '体系可以不吸热，但内能因做功而降低'],
    ['C', '绝热过程不可能发生体积变化'],
    ['D', '只要做功，Q 就一定大于 0']
  ], 'B', '绝热意味着 Q=0，并不意味着不能做功。按 ΔU=Q+W，体系对外做功时 W<0，内能可以降低。', 'easy', ['first law', 'adiabatic process']),
  one('q005', '恒压绝热容器中用机械方式搅拌液体，温度升高。此时不能直接写成 ΔH=Qp=0，关键原因是……', [
    ['A', '恒压过程一定没有热量交换'],
    ['B', '机械搅拌属于非膨胀功，ΔH=Qp 还需要无非膨胀功'],
    ['C', '绝热体系没有内能'],
    ['D', '焓只对气体定义']
  ], 'B', 'ΔH=Qp 的常用条件包括恒压和只有膨胀功。机械搅拌输入了非膨胀功，所以不能把焓变直接等同于 Qp。', 'easy', ['enthalpy', 'non-expansion work']),
  tf('q006', '同一体系从相同初态到相同终态时，ΔH 相同，但不同路径上的 Q 可以不同。', true, '焓是状态函数，因此 ΔH 与路径无关；热量是过程量，可能随路径改变。', 'medium', ['enthalpy', 'path dependence']),
  one('q007', '为什么可逆热机的最高效率不能简单理解为“可以直接用来在有限时间内拉动列车”？', [
    ['A', '可逆热机只能使用理想气体'],
    ['B', '可逆过程要求无限接近平衡，达到理论极限时进行得无限慢'],
    ['C', '可逆热机不发生能量转换'],
    ['D', '可逆热机的效率恒为零']
  ], 'B', '可逆效率是理论上限。真正可逆要求每一步都无限接近平衡，过程时间趋于无限长，因此不能直接等同于有限时间的大功率输出。', 'medium', ['reversibility', 'heat engine']),
  one('q008', '相同物质的量的 Zn 与盐酸反应，在敞口恒压装置和近似封闭刚性装置中比较，通常哪种装置记录的放热量绝对值更大？', [
    ['A', '封闭刚性装置，因为没有把能量分给大气膨胀功'],
    ['B', '敞口装置，因为氢气逸出会额外产生热量'],
    ['C', '两者一定相同，因为反应焓是状态函数'],
    ['D', '无法比较，因为 Q 永远是状态函数']
  ], 'A', '敞口条件下生成气体还要对外界做膨胀功；封闭刚性装置不发生这部分体积功，因此释放热量的绝对值通常更大。', 'medium', ['reaction heat', 'expansion work']),
  one('q009', '导热气缸中的压缩空气与环境平衡后突然打开，待压力刚好降到与外界相等时封住开口。随后与环境充分换热，气体压力最可能……', [
    ['A', '继续降到真空'],
    ['B', '保持不变'],
    ['C', '因温度回升而高于封口瞬间的压力'],
    ['D', '必然变成原来的两倍']
  ], 'C', '封口瞬间气体因快速膨胀而冷却。封口后导热回到环境温度，而体积基本固定，所以压力回升。', 'medium', ['adiabatic expansion', 'ideal gas']),
  many('q010', '氨合成反应 N₂+3H₂→2NH₃ 中，实验测得的 Qp 与按 Kirchhoff 关系计算的反应热不一致，哪些解释合理？', [
    ['A', '计算值通常对应反应进度为 1 mol 的摩尔反应焓'],
    ['B', '实验体系可能只达到平衡转化，实际反应进度小于理论完全反应值'],
    ['C', '因此实验热量绝对值可能小于按完全反应计算的数值'],
    ['D', '差异说明焓不是状态函数']
  ], ['A', 'B', 'C'], '计算通常给出单位反应进度的热效应，而实验可能只发生约 25% 的转化；热量按实际反应进度缩放，所以绝对值更小。', 'medium', ['Kirchhoff law', 'reaction extent', 'equilibrium']),
  tf('q011', '理想气体分别进行绝热可逆和绝热不可逆过程，若两种推导都出现 W=CvΔT，就说明两种过程的功一定相同。', false, '两条路径的初态相同但终态通常不同，ΔT 也不同。公式形式相同不代表代入后的功相同；同一初态下，可逆绝热膨胀的功的绝对值通常更大。', 'medium', ['adiabatic process', 'work']),
  one('q012', '在相同初态和相同外界终压下，理想气体绝热膨胀时，可逆过程与不可逆过程比较，通常有……', [
    ['A', '可逆过程的膨胀功绝对值更大'],
    ['B', '不可逆过程的膨胀功绝对值必然更大'],
    ['C', '两者功都必为零'],
    ['D', '可逆性只影响热量，不影响功']
  ], 'A', '可逆膨胀始终以尽可能小的压差推动边界，能够获得更大的对外功；不可逆膨胀的耗散使可得功减少。', 'medium', ['reversible work', 'adiabatic expansion']),
  many('q013', '在采用 ΔU=Q+W 的符号约定时，要使用 ΔH=Qp，通常需要哪些条件？', [
    ['A', '恒压'],
    ['B', '除膨胀功外没有非膨胀功'],
    ['C', '必须恒温'],
    ['D', '路径必须是绝热的']
  ], ['A', 'B'], '恒压且只有体积功时，ΔH=Qp。恒温或绝热都不是这条等式的必要条件；绝热时 Qp 反而为零。', 'medium', ['enthalpy', 'constant pressure']),
  many('q014', '在采用 ΔU=Q+W 的符号约定时，要使用 ΔU=Qv，通常需要哪些条件？', [
    ['A', '恒容'],
    ['B', '除膨胀功外没有非膨胀功'],
    ['C', '必须恒压'],
    ['D', '必须是可逆过程']
  ], ['A', 'B'], '恒容使膨胀功为零，再排除非膨胀功后，第一定律给出 ΔU=Qv。可逆性不是必要条件。', 'medium', ['internal energy', 'constant volume']),
  fill('q015', '在理想气体、等温、可逆且只有膨胀功的条件下，按题面符号约定，功可写为 W=____。', 'nRT ln(V1/V2)', ['nRT ln(V1/V2)', 'nRTln(V1/V2)', 'nRT ln (V1/V2)'], '从 W=−∫Pext dV 且 P=nRT/V 得 W=nRT ln(V1/V2)。膨胀时 V2>V1，因此 W 为负。', 'medium', ['reversible work', 'ideal gas']),
  one('q016', '理想气体自由膨胀（真空膨胀）时，W、Q、ΔU、ΔH 的符号组合是……', [
    ['A', 'W=0，Q=0，ΔU=0，ΔH=0'],
    ['B', 'W<0，Q=0，ΔU<0，ΔH<0'],
    ['C', 'W=0，Q>0，ΔU>0，ΔH>0'],
    ['D', 'W>0，Q<0，ΔU=0，ΔH=0']
  ], 'A', '真空膨胀没有外压，所以 W=0；绝热条件下 Q=0。理想气体内能和焓只依赖温度，温度不变则 ΔU=ΔH=0。', 'hard', ['free expansion', 'ideal gas']),
  one('q017', '范德瓦耳斯气体在恒容条件下受热，且没有非膨胀功。最合理的符号组合是……', [
    ['A', 'W=0，Q>0，ΔU>0，ΔH>0'],
    ['B', 'W<0，Q>0，ΔU>0，ΔH=0'],
    ['C', 'W=0，Q<0，ΔU<0，ΔH>0'],
    ['D', 'W>0，Q=0，ΔU>0，ΔH<0']
  ], 'A', '恒容使膨胀功 W=0；受热使 Q>0，因而 ΔU>0。对通常的稳定单相加热过程，温度和焓也上升，ΔH>0。', 'hard', ['van der Waals gas', 'constant volume']),
  many('q018', 'Zn(s)+2HCl(aq)→ZnCl₂(aq)+H₂(g) 在恒压、非绝热条件下进行。按 ΔU=Q+W，哪些判断正确？', [
    ['A', '生成气体推动外界，W<0'],
    ['B', '该放热反应有 Q<0'],
    ['C', '反应的 ΔU<0'],
    ['D', '反应的 ΔH<0']
  ], ['A', 'B', 'C', 'D'], '恒压放热反应的焓变为负；生成 H₂ 还要对外做膨胀功，所以 W<0，并使内能变化也为负。', 'hard', ['reaction signs', 'enthalpy']),
  many('q019', 'H₂(g)+Cl₂(g)→2HCl(g) 在绝热刚性钢瓶中进行。哪些判断正确？', [
    ['A', 'W=0'],
    ['B', 'Q=0'],
    ['C', 'ΔU=0'],
    ['D', 'ΔH>0']
  ], ['A', 'B', 'C', 'D'], '刚性容器没有体积功，绝热又使 Q=0，因此 ΔU=0。反应放出的能量使温度升高；在气体物质的量相同的情况下，焓随温度升高而增大，故 ΔH>0。', 'hard', ['adiabatic bomb', 'enthalpy']),
  many('q020', '水在 273.15 K、101.325 kPa 下冻结为冰，哪些符号判断正确？', [
    ['A', 'W<0'],
    ['B', 'Q<0'],
    ['C', 'ΔU<0'],
    ['D', 'ΔH<0']
  ], ['A', 'B', 'C', 'D'], '液态水结冰时体积增大，体系对外做功，所以 W<0；凝固放热，Q 和 ΔH<0，第一定律也给出 ΔU<0。', 'challenging', ['freezing', 'phase change']),
  many('q021', '关于“氢氧生成水”的不同反应路径以及水的完整循环，下列说法正确的是……', [
    ['A', '不同路径若初末态相同，则 ΔU 和 ΔH 相同'],
    ['B', '不同路径的 Q 和 W 可以不同'],
    ['C', '完整循环回到初态，因此 ΔU=ΔH=0'],
    ['D', 'Q 也是状态函数，所以所有路径的 Q 必须相同']
  ], ['A', 'B', 'C'], '内能和焓是状态函数；热量和功是路径函数。水从海洋到云、雪、冰、融化再回到海洋的完整循环初末态相同，所以状态函数变化为零。', 'challenging', ['state functions', 'cycle', 'path functions']),
  many('q022', '要把 298 K、101.3 kPa 的液态水可逆地变成同温同压的水蒸气，哪些路径设计合理？', [
    ['A', '先在 101.3 kPa 下可逆加热到沸点，在沸点可逆汽化，再把蒸气可逆冷却到 298 K'],
    ['B', '先在 298 K 下可逆降压到该温度的饱和蒸气压，在该压力下可逆汽化，最后等温可逆压缩到 101.3 kPa'],
    ['C', '直接突然蒸发，且整个过程仍称为可逆'],
    ['D', '用刚性绝热容器完成全部过程，且不需要热交换']
  ], ['A', 'B'], '可逆路径必须由一系列无限接近平衡的步骤组成。原题给出的两条路线分别利用沸点和 298 K 下的饱和蒸气压来构造可逆过程；突然蒸发和刚性绝热路线都不满足要求。', 'challenging', ['reversible path', 'phase equilibrium'])
];

const quiz = {
  id: 'PCHEM-T01',
  title: '物理化学专题：热力学第一定律思考题',
  description: '根据用户提供的《热力学第一定律思考题》整理，覆盖状态函数、热力学第一定律、热与功、等压/等容过程、可逆性、焓变与循环。',
  subject: 'physical-chemistry',
  chapter: 'Topic · First law of thermodynamics',
  version: '1.0.0',
  totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
  selection: { mode: 'fixed' },
  scopeNote: '根据用户提供的《热力学第一定律思考题》PDF 整理并改写为交互式题目；保留原题的符号约定 ΔU=Q+W 与核心解析。',
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
  difficulty: 'advanced',
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

console.log(`Added ${manifestEntry.id} with ${questions.length} questions.`);
