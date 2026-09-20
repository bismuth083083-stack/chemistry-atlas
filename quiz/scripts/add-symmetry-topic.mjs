import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataRoot = path.join(root, 'data');
const distDataRoot = path.join(root, 'dist', 'data');
const manifestPath = path.join(root, 'structures-manifest.json');

const image = (file, alt, caption = '由 Chemical Structure Renderer 根据清晰的 SMILES 输入渲染。') => ({ src: `assets/structure-renders/${file}`, alt, caption });
const one = (id, question, options, answer, explanation, difficulty, tags, picture) => ({ id, type: 'single-choice', question, options: options.map(([optionId, text]) => ({ id: optionId, text })), answer, points: difficulty === 'challenging' ? 3 : difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...(picture ? { image: picture } : {}) });
const many = (id, question, options, answers, explanation, difficulty, tags, picture) => ({ id, type: 'multiple-choice', question, options: options.map(([optionId, text]) => ({ id: optionId, text })), answers, points: difficulty === 'challenging' ? 3 : difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...(picture ? { image: picture } : {}) });
const tf = (id, question, answer, explanation, difficulty, tags, picture) => ({ id, type: 'true-false', question, answer, points: difficulty === 'challenging' ? 3 : difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...(picture ? { image: picture } : {}) });
const fill = (id, question, answer, acceptableAnswers, explanation, difficulty, tags, picture) => ({ id, type: 'fill-in-the-blank', question, answer, acceptableAnswers, grading: { caseSensitive: false, collapseWhitespace: true }, points: difficulty === 'challenging' ? 3 : difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...(picture ? { image: picture } : {}) });

const structureDefaults = (item) => ({
  protonation: item.protonation || 'Explicit educational structure; charge 0',
  stereochemistry: item.stereochemistry || 'explicit', image_type: 'neutral', show_carbon_numbers: false, show_lone_pairs: false,
  group: null, background: 'transparent', size: [520, 280], png_scale: 4,
  source: { type: 'authored-educational-structure', reference: 'Chemistry Atlas Inorganic Chemistry · VSEPR and point-group topic bank', accessed: '2026-09-20' }
});

const newStructures = [
  ['symmetry-becl2', '二氯化铍', 'beryllium-dichloride', '[Be](Cl)Cl', 'BeCl2', 0],
  ['symmetry-water', '水', 'water', 'O', 'H2O', 0],
  ['symmetry-ammonia', '氨', 'ammonia', 'N', 'H3N', 0],
  ['symmetry-methane', '甲烷', 'methane', 'C', 'CH4', 0],
  ['symmetry-pcl5', '五氯化磷', 'phosphorus-pentachloride', 'ClP(Cl)(Cl)(Cl)Cl', 'Cl5P', 0, 'unspecified-approved'],
  ['symmetry-sf6', '六氟化硫', 'sulfur-hexafluoride', 'FS(F)(F)(F)(F)F', 'F6S', 0, 'unspecified-approved'],
  ['symmetry-xef2', '二氟化氙', 'xenon-difluoride', 'F[Xe]F', 'F2Xe', 0],
  ['symmetry-xef4', '四氟化氙', 'xenon-tetrafluoride', 'F[Xe](F)(F)F', 'F4Xe', 0],
  ['symmetry-hcn', '氰化氢', 'hydrogen-cyanide', 'C#N', 'CHN', 0],
  ['symmetry-nitrate', '硝酸根', 'nitrate-anion', '[O-][N+](=O)[O-]', 'NO3-', -1],
  ['symmetry-pcl3', '三氯化磷', 'phosphorus-trichloride', 'ClP(Cl)Cl', 'Cl3P', 0],
  ['symmetry-sf4', '四氟化硫', 'sulfur-tetrafluoride', 'FS(F)(F)F', 'F4S', 0],
  ['symmetry-if5', '五氟化碘', 'iodine-pentafluoride', 'FI(F)(F)(F)F', 'F5I', 0, 'unspecified-approved'],
  ['symmetry-bf4', '四氟合硼酸根', 'tetrafluoroborate-anion', 'F[B-](F)(F)F', 'BF4-', -1],
  ['symmetry-acetylene', '乙炔', 'acetylene', 'C#C', 'C2H2', 0],
  ['symmetry-ozone', '臭氧', 'ozone', '[O-][O+]=O', 'O3', 0]
].map(([id, chinese_name, english_name, smiles, formula, charge, stereochemistry]) => ({
  id, chinese_name, english_name, structure: { format: 'smiles', value: smiles },
  ...structureDefaults({ protonation: charge === 0 ? 'Explicit neutral educational structure; charge 0' : `Explicit ion; charge ${charge}`, stereochemistry }),
  expected: { formula, net_charge: charge }
}));

const p = {
  becl2: image('symmetry-becl2-beryllium-dichloride-neutral.png', '二氯化铍的线形结构示意图'),
  water: image('symmetry-water-water-neutral.png', '水的折线形结构示意图'),
  ammonia: image('symmetry-ammonia-ammonia-neutral.png', '氨的三角锥形中心原子模型示意图'),
  methane: image('symmetry-methane-methane-neutral.png', '甲烷的四面体结构示意图'),
  pcl5: image('symmetry-pcl5-phosphorus-pentachloride-neutral.png', '五氯化磷的三角双锥结构示意图'),
  sf6: image('symmetry-sf6-sulfur-hexafluoride-neutral.png', '六氟化硫的八面体结构示意图'),
  xef2: image('symmetry-xef2-xenon-difluoride-neutral.png', '二氟化氙的线形结构示意图'),
  xef4: image('symmetry-xef4-xenon-tetrafluoride-neutral.png', '四氟化氙的平方平面结构示意图'),
  hcn: image('symmetry-hcn-hydrogen-cyanide-neutral.png', '氰化氢的线形结构示意图'),
  nitrate: image('symmetry-nitrate-nitrate-anion-neutral.png', '硝酸根的平面结构示意图', 'Renderer 显示一种明确 Lewis 共振表示；点群题按三个端氧等价的理想共振平均讨论。'),
  pcl3: image('symmetry-pcl3-phosphorus-trichloride-neutral.png', '三氯化磷的三角锥形结构示意图'),
  sf4: image('symmetry-sf4-sulfur-tetrafluoride-neutral.png', '四氟化硫的跷跷板构型示意图'),
  if5: image('symmetry-if5-iodine-pentafluoride-neutral.png', '五氟化碘的平方锥形结构示意图'),
  bf4: image('symmetry-bf4-tetrafluoroborate-anion-neutral.png', '四氟合硼酸根的四面体结构示意图'),
  acetylene: image('symmetry-acetylene-acetylene-neutral.png', '乙炔的线形结构示意图'),
  ozone: image('symmetry-ozone-ozone-neutral.png', '臭氧的折线形结构示意图', 'Renderer 显示一种明确 Lewis 共振表示；构型题按等价端氧的理想化模型讨论。'),
  bf3: image('inorg-bf3-boron-trifluoride-neutral.png', '三氟化硼的平面三角形结构示意图'),
  co2: image('inorg-carbon-dioxide-carbon-dioxide-neutral.png', '二氧化碳的线形结构示意图'),
  so2: image('inorg-sulfur-dioxide-sulfur-dioxide-neutral.png', '二氧化硫的折线形结构示意图'),
  no2: image('inorg-nitrogen-dioxide-nitrogen-dioxide-neutral.png', '二氧化氮的折线形结构示意图'),
  ammonium: image('inorg-ammonium-ammonium-cation-neutral.png', '铵离子的四面体结构示意图'),
  benzene: image('org-benzene-benzene-neutral.png', '苯的平面六元环结构示意图')
};

const questions = [
  one('q001', 'VSEPR 模型首先统计中心原子周围的……', [['A', '电子域'], ['B', '中子数'], ['C', '溶剂体积'], ['D', '晶胞边长']], 'A', 'VSEPR 把成键电子对和孤电子对都作为排斥电子域，用来预测局部几何。', 'easy', ['VSEPR', 'electron domains']),
  one('q002', '在 AX₃E 中，中心原子的电子域几何是……', [['A', '四面体'], ['B', '平面三角形'], ['C', '三角双锥'], ['D', '八面体']], 'A', 'AX₃E 含 4 个电子域，因此电子域几何为四面体；分子构型则为三角锥形。', 'easy', ['VSEPR', 'AX3E']),
  one('q003', '理想化的 BeCl₂ 构型是……', [['A', '线形'], ['B', '折线形'], ['C', '平面三角形'], ['D', '四面体']], 'A', 'Be 周围有两个成键电子域、没有孤对电子，AX₂ 对应线形。', 'easy', ['BeCl2', 'linear'], p.becl2),
  one('q004', 'BF₃ 的分子构型是……', [['A', '平面三角形'], ['B', '三角锥形'], ['C', '四面体'], ['D', 'T 形']], 'A', 'B 周围有 3 个成键电子域且没有孤对电子，构型为平面三角形。', 'easy', ['BF3', 'trigonal planar'], p.bf3),
  one('q005', 'CH₄ 的中心碳采取哪种理想构型？', [['A', '四面体'], ['B', '平面正方形'], ['C', '线形'], ['D', '平方锥形']], 'A', 'CH₄ 是 AX₄，四个成键电子域尽量远离，形成四面体。', 'easy', ['CH4', 'tetrahedral'], p.methane),
  one('q006', 'NH₃ 的分子构型是……', [['A', '三角锥形'], ['B', '平面三角形'], ['C', 'T 形'], ['D', '直线形']], 'A', 'NH₃ 是 AX₃E，孤对电子占据一个电子域，原子构型为三角锥形。', 'easy', ['NH3', 'trigonal pyramidal'], p.ammonia),
  one('q007', 'H₂O 的分子构型是……', [['A', '折线形'], ['B', '线形'], ['C', '四面体'], ['D', '平面三角形']], 'A', 'H₂O 是 AX₂E₂；电子域几何为四面体，但只看原子位置时为折线形。', 'easy', ['H2O', 'bent'], p.water),
  one('q008', 'PCl₅ 的电子域几何是……', [['A', '三角双锥'], ['B', '四面体'], ['C', '八面体'], ['D', '平面正方形']], 'A', 'PCl₅ 是 AX₅，五个电子域对应三角双锥。', 'easy', ['PCl5', 'trigonal bipyramidal'], p.pcl5),
  one('q009', 'SF₆ 的分子构型是……', [['A', '八面体'], ['B', '三角双锥'], ['C', '平方平面'], ['D', '三角锥形']], 'A', 'SF₆ 是 AX₆，六个配体指向八面体的六个顶点。', 'easy', ['SF6', 'octahedral'], p.sf6),
  one('q010', 'XeF₄ 的原子构型是……', [['A', '平方平面'], ['B', '四面体'], ['C', '跷跷板'], ['D', '平面三角形']], 'A', 'XeF₄ 是 AX₄E₂，孤对电子位于八面体电子域的相对位置，剩余四个 F 构成平方平面。', 'easy', ['XeF4', 'square planar'], p.xef4),
  one('q011', '若假定理想几何，SO₂ 通常归入哪个点群？', [['A', 'C₂v'], ['B', 'D∞h'], ['C', 'Td'], ['D', 'Oh']], 'A', 'SO₂ 为对称的折线形分子，含 C₂ 轴和两个包含主轴的镜面，属于 C₂v。', 'medium', ['SO2', 'C2v'], p.so2),
  one('q012', 'NH₃ 的点群最合理的是……', [['A', 'C₃v'], ['B', 'D₃h'], ['C', 'C₂v'], ['D', 'Td']], 'A', '三角锥形 NH₃ 有一条 C₃ 轴和三面包含主轴的镜面，属于 C₃v。', 'medium', ['NH3', 'C3v'], p.ammonia),
  one('q013', '平面三角形 BF₃ 的点群是……', [['A', 'D₃h'], ['B', 'C₃v'], ['C', 'C₂v'], ['D', 'Td']], 'A', 'BF₃ 具有 C₃ 轴、分子平面 σh 和三条垂直 C₂ 轴，属于 D₃h。', 'medium', ['BF3', 'D3h'], p.bf3),
  one('q014', '理想平面三角形 NO₃⁻ 的点群最合理的是……', [['A', 'D₃h'], ['B', 'C₃v'], ['C', 'C₁'], ['D', 'Oh']], 'A', '在等价共振平均和理想平面几何下，三个 O 等价，NO₃⁻ 具有 D₃h 对称性。', 'medium', ['nitrate', 'D3h'], p.nitrate),
  one('q015', 'CO₂ 的点群是……', [['A', 'D∞h'], ['B', 'C∞v'], ['C', 'C₂v'], ['D', 'D₃h']], 'A', 'CO₂ 为对称线形分子，存在反演中心和无穷多条垂直 C₂ 轴，因此为 D∞h。', 'medium', ['CO2', 'D-infinity-h'], p.co2),
  one('q016', '异核线形 HCN 更接近哪个点群？', [['A', 'C∞v'], ['B', 'D∞h'], ['C', 'D₃h'], ['D', 'C₃v']], 'A', 'HCN 虽为线形，但两端不同，不具有反演中心或垂直 C₂ 轴，属于 C∞v。', 'medium', ['HCN', 'C-infinity-v'], p.hcn),
  one('q017', 'PCl₃ 的点群通常是……', [['A', 'C₃v'], ['B', 'D₃h'], ['C', 'C₂v'], ['D', 'Td']], 'A', 'PCl₃ 为三角锥形，具有 C₃ 轴和三个 σv 镜面，属于 C₃v。', 'medium', ['PCl3', 'C3v'], p.pcl3),
  one('q018', '理想化 SF₄ 的跷跷板构型可归入……', [['A', 'C₂v'], ['B', 'D₃h'], ['C', 'Td'], ['D', 'D₄h']], 'A', 'SF₄ 是 AX₄E，三角双锥中的孤对电子占据赤道位，保留 C₂v 对称性。', 'medium', ['SF4', 'seesaw', 'C2v'], p.sf4),
  one('q019', 'ClF₃ 的 T 形构型常见点群为……', [['A', 'C₂v'], ['B', 'D∞h'], ['C', 'C₃v'], ['D', 'Oh']], 'A', 'ClF₃ 是 AX₃E₂，三个 F 呈 T 形，保留一条 C₂ 轴和两个 σv 镜面。', 'medium', ['ClF3', 'T-shaped', 'C2v']),
  one('q020', 'IF₅ 的平方锥形构型最合理的点群是……', [['A', 'C₄v'], ['B', 'D₄h'], ['C', 'C₃v'], ['D', 'Td']], 'A', 'IF₅ 是 AX₅E，孤对电子占据八面体一个顶点，分子保留 C₄ 轴和 σv 镜面，属于 C₄v。', 'medium', ['IF5', 'square pyramidal', 'C4v'], p.if5),
  many('q021', '关于 BF₄⁻ 的理想四面体对称性，下列说法正确的是……', [['A', '构型为四面体'], ['B', '点群为 Td'], ['C', '有四条等价的三重轴'], ['D', '点群为 C₂v']], ['A', 'B', 'C'], 'BF₄⁻ 是 AX₄ 四面体；在四个 F 等价时属于 Td，而不是只有低阶轴的 C₂v。', 'hard', ['BF4-', 'Td', 'tetrahedral'], p.bf4),
  many('q022', '关于 XeF₂ 的理想线形结构，下列说法正确的是……', [['A', '中心 Xe 的五个电子域呈三角双锥排列'], ['B', '两个孤对电子位于赤道位'], ['C', '分子构型为线形'], ['D', '点群一定是 C₂v']], ['A', 'B', 'C'], 'XeF₂ 是 AX₂E₃；三个赤道电子域中有两个孤对电子，两个 F 占轴向位置，形成线形且对称的分子。', 'hard', ['XeF2', 'linear', 'AX2E3'], p.xef2),
  many('q023', '理想 XeF₄ 的对称性分析可得到哪些结论？', [['A', '电子域几何为八面体'], ['B', '原子构型为平方平面'], ['C', '点群为 D₄h'], ['D', '一定属于 C₄v']], ['A', 'B', 'C'], 'XeF₄ 是 AX₄E₂，两个孤对电子相对放置，具有反演中心和 σh，因此为 D₄h。', 'hard', ['XeF4', 'D4h', 'square planar'], p.xef4),
  many('q024', '对称的线形三原子或多原子物种在判定 D∞h 时，需要关注……', [['A', '分子轴上的高阶旋转'], ['B', '反演中心'], ['C', '与主轴垂直的 C₂ 轴族'], ['D', '是否含有碳元素']], ['A', 'B', 'C'], 'D∞h 的关键不是元素种类，而是对称线形几何、反演中心和无穷多垂直 C₂ 轴等特征。', 'hard', ['D-infinity-h', 'symmetry test']),
  many('q025', '对乙炔 H–C≡C–H 的理想结构，下列判断正确的是……', [['A', '分子线形'], ['B', '具有反演中心'], ['C', '可归入 D∞h'], ['D', '因为含三键所以一定是 C₃v']], ['A', 'B', 'C'], '乙炔为对称线形分子，端点和中点的映射保留反演中心，属于 D∞h。', 'hard', ['acetylene', 'D-infinity-h', 'linear'], p.acetylene),
  many('q026', '苯的 D₆h 对称性意味着……', [['A', '有六重主轴'], ['B', '具有分子平面'], ['C', '存在反演中心'], ['D', '所有振动都既 IR 又 Raman 活性']], ['A', 'B', 'C'], '苯为平面六元环，D₆h 包含 C₆ 主轴、σh 与反演中心；中心对称还带来 IR/Raman 互斥规则。', 'hard', ['benzene', 'D6h', 'inversion'], p.benzene),
  many('q027', '关于臭氧 O₃ 的理想化结构，下列判断正确的是……', [['A', '原子构型为折线形'], ['B', '两个端氧在共振平均模型中等价'], ['C', '可用 C₂v 描述其理想对称性'], ['D', '它是线形 D∞h 分子']], ['A', 'B', 'C'], 'O₃ 是弯曲的三原子分子；在等价端氧的理想模型下有 C₂ 轴和两个镜面，属于 C₂v。', 'hard', ['ozone', 'C2v', 'resonance'], p.ozone),
  many('q028', '比较 CO₂ 与 SO₂ 时，哪些推理是合理的？', [['A', 'CO₂ 的对称线形带来反演中心'], ['B', 'SO₂ 的折线形通常没有反演中心'], ['C', '二者都可直接判作 D∞h'], ['D', '弯曲会降低可用对称操作数量']], ['A', 'B', 'D'], 'CO₂ 为 D∞h，而 SO₂ 弯曲后通常为 C₂v；几何弯曲会移除线形分子的部分高阶对称操作。', 'hard', ['CO2', 'SO2', 'symmetry comparison'], p.so2),
  tf('q029', 'VSEPR 中多重键通常作为一个电子域参与中心原子周围的几何排斥。', true, '在基础 VSEPR 计数中，单键、双键和三键各按一个电子域计数，但多重键电子密度可能使排斥强度略有差别。', 'hard', ['VSEPR', 'multiple bond']),
  tf('q030', '具有反演中心的分子中，同一个正常振动模式可以同时具有 IR 和 Raman 活性。', false, '中心对称分子遵循互斥规则；同一模式不能同时属于 IR 活性的 u 类和 Raman 活性的 g 类。', 'hard', ['inversion', 'IR', 'Raman']),
  tf('q031', '如果把 BF₃ 中一个 F 替换成不同的配体，原来的 D₃h 对称性必然完整保留。', false, '取代会使配体不再全部等价，通常会降低主轴阶数和镜面数量；不能直接保留 D₃h。', 'hard', ['symmetry breaking', 'BF3']),
  tf('q032', 'C∞v 与 D∞h 的主要分流之一，是线形分子是否具有反演中心和垂直 C₂ 轴族。', true, '异核线形物种常为 C∞v；端点对称的线形物种可具有反演中心和垂直 C₂ 轴族，属于 D∞h。', 'hard', ['C-infinity-v', 'D-infinity-h']),
  tf('q033', '孤对电子只影响电子域几何，不会改变原子构成的分子构型。', false, '孤对电子占据空间并改变键角，因此 AX₃E、AX₂E₂ 等分子构型分别不同于对应的电子域几何。', 'challenging', ['lone pairs', 'molecular geometry']),
  tf('q034', '点群名称本身不能替代几何检查；必须先确认原子是否等价、构型是否理想化。', true, '同一电子域计数在不同配体等价性或构象下可能属于不同点群，点群判断必须建立在明确结构假设上。', 'challenging', ['point groups', 'assumptions']),
  fill('q035', 'AX₂E₂ 的电子域几何是____。', '四面体', ['四面体', 'tetrahedral'], '四个电子域尽量分开，构成四面体电子域几何；H₂O 的原子构型则是折线形。', 'challenging', ['AX2E2', 'electron-domain geometry'], p.water),
  fill('q036', '对称线形 CO₂ 的点群通常写作____。', 'D∞h', ['D∞h', 'Dinfh', 'D-infinity-h'], 'CO₂ 两端等价并具有反演中心和垂直 C₂ 轴族，因此归入 D∞h。', 'challenging', ['CO2', 'D-infinity-h'], p.co2),
  fill('q037', 'NH₃ 的主旋转轴是____轴。', 'C3', ['C3', 'C₃', 'C₃轴', 'C3轴'], '三角锥形 NH₃ 绕穿过 N 和三角形中心的轴旋转 120° 后重合，因此有 C₃ 主轴。', 'challenging', ['NH3', 'C3 axis'], p.ammonia),
  fill('q038', '中心对称分子中，IR 与 Raman 选择定则常称为____规则。', '互斥', ['互斥', 'mutual exclusion'], '具有反演中心时，g/u 对称性使同一振动模式不能同时 IR 和 Raman 活性。', 'challenging', ['mutual exclusion', 'spectroscopy']),
  fill('q039', 'PCl₅ 的五个配体构成____双锥构型。', '三角', ['三角', 'trigonal'], 'AX₅ 的五个电子域排成三角双锥，含两个轴向位置和三个赤道位置。', 'challenging', ['PCl5', 'trigonal bipyramidal'], p.pcl5),
  fill('q040', 'XeF₄ 的两个孤对电子在理想八面体电子域中彼此呈____位置。', '相对', ['相对', 'trans', '180°', '180度'], '为了最大化间距，两个孤对电子占据相对的八面体顶点，四个 F 留在同一平面。', 'challenging', ['XeF4', 'lone pairs', 'D4h'], p.xef4)
];

const quiz = {
  id: 'INORG-T01',
  title: '无机专题：VSEPR、结构与点群挑战',
  description: '从主族中心原子和典型分子/离子目录中随机抽题，练习电子域、分子构型、对称元素、点群与 IR/Raman 选择定则。每次尝试随机抽取 22 题。',
  subject: 'inorganic-chemistry',
  chapter: 'Topic · VSEPR, molecular structure, and point groups',
  version: '1.0.0',
  totalPoints: questions.reduce((sum, question) => sum + question.points, 0),
  selection: { mode: 'question-bank', counts: { 'single-choice': 10, 'multiple-choice': 4, 'true-false': 4, 'fill-in-the-blank': 4 } },
  sources: [
    { title: 'NIST CCCBDB · species sorted by point group', url: 'https://cccbdb.nist.gov/pglist.asp', role: 'point-group cross-check and attribution; no bulk copy' },
    { title: 'Otterbein Symmetry resources', url: 'http://symmetry.otterbein.edu/index.html', role: 'conceptual reference supplied by the learner' },
    { title: 'Otterbein Symmetry Challenge', url: 'http://symmetry.otterbein.edu/challenge/index.html', role: 'challenge-style reference supplied by the learner' }
  ],
  scopeNote: 'This is an independently authored educational bank of canonical main-group examples. It is not a mirror of any third-party database; formulas, structures, explanations, and question wording were selected or written for Chemistry Atlas.',
  speciesCatalog: [
    { center: 'Be', examples: ['BeCl2'], geometry: 'linear', pointGroups: ['D∞h'] },
    { center: 'B', examples: ['BF3', 'BF4−'], geometry: 'trigonal planar / tetrahedral', pointGroups: ['D3h', 'Td'] },
    { center: 'C', examples: ['CO2', 'CH4', 'HCN'], geometry: 'linear / tetrahedral', pointGroups: ['D∞h', 'Td', 'C∞v'] },
    { center: 'N', examples: ['NH3', 'NO3−'], geometry: 'trigonal pyramidal / trigonal planar', pointGroups: ['C3v', 'D3h'] },
    { center: 'O', examples: ['H2O', 'SO2', 'O3'], geometry: 'bent', pointGroups: ['C2v'] },
    { center: 'P', examples: ['PCl3', 'PCl5'], geometry: 'trigonal pyramidal / trigonal bipyramidal', pointGroups: ['C3v', 'D3h'] },
    { center: 'S', examples: ['SF4', 'SF6'], geometry: 'seesaw / octahedral', pointGroups: ['C2v', 'Oh'] },
    { center: 'Cl', examples: ['ClF3'], geometry: 'T-shaped', pointGroups: ['C2v'] },
    { center: 'I', examples: ['IF5'], geometry: 'square pyramidal', pointGroups: ['C4v'] },
    { center: 'Xe', examples: ['XeF2', 'XeF4'], geometry: 'linear / square planar', pointGroups: ['D∞h', 'D4h'] }
  ],
  questions
};

const manifestEntry = {
  id: 'INORG-T01', title: quiz.title, description: quiz.description, subject: quiz.subject, type: 'topic', lessonNumber: null, topicNumber: 1, examNumber: null,
  chapter: quiz.chapter, lesson: 'VSEPR, molecular structure, and point groups', topic: 'Randomized symmetry challenge bank', questionCount: questions.length, difficulty: 'advanced',
  tags: ['VSEPR', 'molecular geometry', 'point groups', 'symmetry', 'IR', 'Raman'], knowledgePoints: ['electron-domain geometry', 'molecular shape', 'symmetry elements', 'point-group classification', 'selection rules'],
  createdAt: '2026-09-20', updatedAt: '2026-09-20', relatedNotes: ['/inorganic/dist/lesson-03.html', '/inorganic/dist/lesson-04.html'], path: 'inorg-t01.json', mode: 'question-bank'
};

const structureManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
structureManifest.items = structureManifest.items.filter((item) => !String(item.id).startsWith('symmetry-'));
structureManifest.items.push(...newStructures);
fs.writeFileSync(manifestPath, JSON.stringify(structureManifest, null, 2) + '\n', 'utf8');

const body = JSON.stringify(quiz, null, 2) + '\n';
fs.writeFileSync(path.join(dataRoot, 'inorg-t01.json'), body, 'utf8');
fs.writeFileSync(path.join(distDataRoot, 'inorg-t01.json'), body.replaceAll('assets/structure-renders/', 'assets/structures/'), 'utf8');

for (const target of [path.join(dataRoot, 'index.json'), path.join(distDataRoot, 'index.json')]) {
  const manifest = JSON.parse(fs.readFileSync(target, 'utf8'));
  manifest.quizzes = [...manifest.quizzes.filter((entry) => entry.id !== manifestEntry.id), manifestEntry];
  fs.writeFileSync(target, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

console.log(`Added ${manifestEntry.id} with ${questions.length} questions and ${newStructures.length} render manifest entries.`);
