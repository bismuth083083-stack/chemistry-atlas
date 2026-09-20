import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const quizRoot = path.resolve(here, '..');
const rootData = path.join(quizRoot, 'data');
const distData = path.join(quizRoot, 'dist', 'data');
// The source quiz runs from /quiz/, while the publishable build runs from /quiz/dist/.
// Keep the two resource roots explicit so a build never accidentally points one
// deployment at the other deployment's asset directory.
const img = (file, alt, caption) => ({
  image: {
    // Use the PNG emitted by Chemical Structure Renderer for the browser-facing
    // question stem. SVG/MOL/SDF outputs remain alongside it for provenance and
    // future editing, but PNG avoids host-specific SVG MIME/XML handling.
    src: `assets/structure-renders/${file.replace(/\.svg$/i, '.png')}`,
    alt,
    ...(caption ? { caption } : {})
  }
});
const options = (items) => items.map(([id, text]) => ({ id, text }));
const one = (id, question, choices, answer, explanation, difficulty = 'easy', tags = [], extra = {}) => ({ id, type: 'single-choice', question, options: options(choices), answer, points: difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...extra });
const many = (id, question, choices, answers, explanation, difficulty = 'medium', tags = [], extra = {}) => ({ id, type: 'multiple-choice', question, options: options(choices), answers, points: difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...extra });
const tf = (id, question, answer, explanation, difficulty = 'easy', tags = [], extra = {}) => ({ id, type: 'true-false', question, answer, points: difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...extra });
const fill = (id, question, answer, explanation, difficulty = 'easy', tags = [], acceptableAnswers = [], extra = {}) => ({ id, type: 'fill-in-the-blank', question, answer, ...(acceptableAnswers.length ? { acceptableAnswers } : {}), grading: { caseSensitive: false, collapseWhitespace: true }, points: difficulty === 'hard' ? 2 : 1, explanation, difficulty, tags, ...extra });

const sets = [
  {
    id: 'ORG-L02', title: '酸碱、分子轨道与分子结构', subject: 'organic-chemistry', chapter: 'Chapter 2 · Molecular orbitals', lesson: 'Acid-base, molecular orbitals, and structure', description: '练习 LCAO、σ/π 轨道、HOMO–LUMO、杂化、VSEPR 与分子极性。', tags: ['LCAO', 'molecular orbitals', 'HOMO-LUMO', 'hybridization'], knowledgePoints: ['orbital overlap', 'bond order', 'molecular geometry', 'polarity'], relatedNotes: ['/organic/dist/lesson-02.html'], questions: [
      one('q001', 'Lewis 酸与亲电体都具有的共同特征是……', [['A', '电子贫乏并能接受电子对'], ['B', '一定带负电'], ['C', '一定能提供质子'], ['D', '只能存在于水溶液']], 'A', 'Lewis 酸是电子对受体；亲电体也是电子贫乏、倾向接受电子密度的中心。', 'easy', ['Lewis acid', 'electrophile']),
      one('q002', 'LCAO 的含义是……', [['A', '原子轨道线性组合成分子轨道'], ['B', '所有电子都局限在一个原子上'], ['C', '只把核轨道相加'], ['D', '用实验峰代替轨道']], 'A', '分子轨道可由原子轨道的线性组合构造，组合的相位与能量决定成键或反键性质。', 'easy', ['LCAO', 'molecular orbitals']),
      one('q003', '下列哪种重叠最典型地形成 π 键？', [['A', '沿核间轴正面重叠'], ['B', '平行 p 轨道侧向重叠'], ['C', '两个球形 s 轨道背向重叠'], ['D', '两个原子核直接接触']], 'B', 'π 键来自轨道相对于核间轴的侧向重叠；正面重叠对应 σ 键。', 'easy', ['sigma', 'pi'], { ...img('org-ethene-ethene-neutral.svg', '乙烯的 C=C 结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES C=C 渲染') }),
      many('q004', '关于成键与反键分子轨道，下列说法正确的是……', [['A', '成键轨道通常比对应原子轨道能量低'], ['B', '反键轨道的节点使核间电子密度降低'], ['C', '电子填入反键轨道会削弱净成键'], ['D', '反键轨道永远不能被占据']], ['A', 'B', 'C'], '成键组合增加核间电子密度并降低能量；反键组合具有节点，若被占据会抵消成键贡献。', 'medium', ['bonding orbital', 'antibonding orbital']),
      one('q005', '分子轨道模型中，键级通常按什么计算？', [['A', '（成键电子数−反键电子数）/2'], ['B', '成键电子数+反键电子数'], ['C', '总电子数/原子数'], ['D', '核电荷数之差']], 'A', '键级的常用模型定义是成键与反键电子数差的一半。', 'easy', ['bond order']),
      one('q006', 'HOMO 在有机反应中的常见角色是……', [['A', '电子供体轨道'], ['B', '电子受体轨道'], ['C', '原子核轨道'], ['D', '只决定分子质量']], 'A', '较高能量的已占据分子轨道常作为亲核体的电子供体；LUMO 则常作为受体。', 'easy', ['HOMO-LUMO']),
      one('q007', 'LUMO 更适合被描述为……', [['A', '最低能量的未占据分子轨道'], ['B', '最高能量的已占据轨道'], ['C', '最低能量的原子核'], ['D', '所有孤对电子的总和']], 'A', 'LUMO 是最低未占据分子轨道，亲电体的受体轨道常与亲核体 HOMO 相互作用。', 'easy', ['HOMO-LUMO']),
      one('q008', '下列哪一项最符合 sp³ 杂化的局域几何？', [['A', '四面体方向'], ['B', '线形'], ['C', '三角平面'], ['D', '八面体']], 'A', '四个等价 sp³ 杂化轨道指向近似四面体方向。', 'easy', ['hybridization', 'geometry']),
      one('q009', '关于杂化模型与分子轨道模型，下列说法正确的是……', [['A', '杂化模型便于描述局域 σ 键方向'], ['B', '分子轨道模型更适合讨论离域、磁性和能级'], ['C', '两者必须互相排斥'], ['D', '模型都是对电子结构的近似描述']], 'A', 'A、B、D 都正确；模型服务于不同问题，不应把一种模型当作唯一真实图像。', 'medium', ['models', 'hybridization']),
      many('q010', 'VSEPR 预测分子几何时需要先统计……', [['A', '中心原子周围的电子域'], ['B', '孤对电子域'], ['C', '多重键作为一个电子域'], ['D', '远离中心的所有氢原子']], ['A', 'B', 'C'], 'VSEPR 先数中心原子周围电子域，再考虑孤对电子和键域的排斥。多重键通常作为一个电子域处理。', 'medium', ['VSEPR', 'molecular geometry']),
      one('q011', '“有极性键”不能直接推出“分子有净偶极矩”，关键还要看……', [['A', '分子几何中各键偶极是否抵消'], ['B', '样品颜色'], ['C', '核素半衰期'], ['D', '是否含有金属']], 'A', '键偶极是矢量，分子几何可能使它们相互抵消，例如线形 CO₂。', 'medium', ['polarity', 'geometry']),
      one('q012', 'σ 键与 π 键相比，通常具有哪项特征？', [['A', 'σ 键沿核间轴正面重叠，圆柱对称性更高'], ['B', 'σ 键一定比 π 键更弱'], ['C', 'π 键可以独立存在而没有 σ 骨架'], ['D', '两者完全相同']], 'A', 'σ 键沿核间轴正面重叠，通常是两个原子之间首先形成的骨架键；π 键依赖平行轨道侧向重叠。', 'medium', ['sigma', 'pi']),
      tf('q013', '分子轨道相位的正负表示电子带正电或负电。', false, '轨道相位是波函数的符号，不是电子电荷符号；相位决定组合时的干涉方式。', 'medium', ['orbital phase']),
      one('q014', '氯甲烷中 C–Cl 键的极性主要来自……', [['A', 'Cl 的电负性比 C 大，键电子密度偏向 Cl'], ['B', 'C 的电负性比 Cl 大'], ['C', 'C–Cl 键没有共享电子'], ['D', '氯原子一定带正电']], 'A', '电负性差使共享电子密度偏向氯，但这不等于分子中存在游离氯离子。', 'easy', ['bond polarity'], { ...img('org-chloromethane-chloromethane-neutral.svg', '氯甲烷结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES CCl 渲染') }),
      one('q015', '对 CH₃Cl 与 OH⁻ 的反应，若从 HOMO–LUMO 和弯箭头角度描述，最合理的是……', [['A', 'OH⁻ 的孤对电子进攻 C–Cl 键的受体区域，同时 C–Cl 键电子离去到 Cl'], ['B', 'Cl⁻ 的孤对电子进攻 OH⁻'], ['C', '两个分子只发生电子自旋翻转'], ['D', 'C–Cl 键断裂但没有电子去向']], 'A', 'OH⁻ 是电子供体，CH₃Cl 的碳中心是亲电受体；形成 C–O 键的同时，C–Cl 键电子归于 Cl。', 'hard', ['extension', 'HOMO-LUMO', 'SN2'], { ...img('org-chloromethane-chloromethane-neutral.svg', '氯甲烷结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES CCl 渲染') })
    ]
  },
  {
    id: 'ORG-L03', title: '酸碱理论：强度与结构效应', subject: 'organic-chemistry', chapter: 'Chapter 3 · Acidity and basicity', lesson: 'Acid-base theory and structural effects', description: '练习 Arrhenius、Brønsted–Lowry、Lewis 定义，Ka/pKa 与共轭碱稳定性。', tags: ['pKa', 'conjugate base', 'inductive effect', 'resonance'], knowledgePoints: ['acid-base definitions', 'acid strength', 'resonance stabilization', 'curved arrows'], relatedNotes: ['/organic/dist/lesson-03.html'], questions: [
      one('q001', 'Arrhenius 酸在水溶液中的定义是……', [['A', '使 H₃O⁺ 浓度增加的物质'], ['B', '使电子对增加的物质'], ['C', '接受电子对的物质'], ['D', '一定含有碳的物质']], 'A', 'Arrhenius 定义针对水溶液，酸使 H₃O⁺ 浓度增加，碱使 OH⁻ 浓度增加。', 'easy', ['Arrhenius']),
      one('q002', 'Brønsted–Lowry 酸碱理论的核心是……', [['A', '质子转移'], ['B', '电子从金属流向非金属'], ['C', '光子吸收'], ['D', '只讨论盐的溶解']], 'A', 'Brønsted–Lowry 酸是质子供体，碱是质子受体，并自然引出共轭酸碱对。', 'easy', ['Bronsted-Lowry']),
      one('q003', 'Lewis 碱的定义是……', [['A', '电子对供体'], ['B', '电子对受体'], ['C', '质子供体且只能在水中存在'], ['D', '中子供体']], 'A', 'Lewis 碱提供电子对，Lewis 酸接受电子对。', 'easy', ['Lewis acid-base']),
      one('q004', 'Ka 越大通常意味着……', [['A', '酸解离平衡更偏向产物，酸性更强'], ['B', '酸一定越弱'], ['C', 'pKa 越大'], ['D', '共轭碱一定带正电']], 'A', 'Ka 越大表示 HA 更容易失去质子；因为 pKa=−log Ka，所以 Ka 大对应 pKa 小。', 'easy', ['Ka', 'pKa']),
      one('q005', '下列关于 pKa 的说法正确的是……', [['A', 'pKa 越小，酸通常越强'], ['B', 'pKa 越大，酸一定越强'], ['C', 'pKa 与 Ka 没有关系'], ['D', 'pKa 只由分子量决定']], 'A', 'pKa 是 Ka 的负常用对数，数值越小代表酸解离常数越大。', 'easy', ['pKa']),
      one('q006', '“共轭碱越稳定，原酸越强”的原因是……', [['A', '失去 H⁺ 后的产物能量较低，更容易形成'], ['B', '稳定共轭碱一定更强地夺回 H⁺'], ['C', '共轭碱稳定会让 Ka 变小'], ['D', '酸强度与共轭碱无关']], 'A', '共轭碱稳定会降低解离产物的能量，使酸失去质子的过程更有利。', 'easy', ['conjugate base']),
      many('q007', '判断共轭碱稳定性时，常要比较哪些因素？', [['A', '负电荷所在原子的大小和电负性'], ['B', '负电荷能否共振离域'], ['C', '吸电子诱导效应'], ['D', '样品标签的颜色']], ['A', 'B', 'C'], '原子效应、共振离域和诱导效应都会改变负电荷的稳定程度。', 'medium', ['acid strength', 'stability']),
      one('q008', '下图中的乙酸根共振式说明……', [['A', '负电荷可在两个氧之间离域，两个 C–O 键在真实结构中趋于等价'], ['B', '乙酸根在两种结构间来回振荡'], ['C', '其中一个氧原子会消失'], ['D', '这是酸碱平衡箭头']], 'A', '两幅图是同一离域电子结构的共振表示，不是时间上的结构振荡。', 'medium', ['resonance', 'acetate'], { ...img('group-acetate-resonance.svg', '乙酸根的两种共振贡献式', '由 Chemical Structure Renderer 使用同一原子映射生成') }),
      one('q009', '卤素取代通常能增强邻近羧酸的酸性，主要体现……', [['A', '吸电子诱导效应'], ['B', '供电子共振效应必然增强'], ['C', '分子质量守恒被破坏'], ['D', '氢键完全消失']], 'A', '卤素通过 σ 键拉低邻近负电荷能量，诱导效应随距离增加而减弱。', 'medium', ['inductive effect']),
      one('q010', '当负电荷位于 O 与 C 之间时，通常更有利于稳定负电荷的是……', [['A', '电负性更大的 O'], ['B', '电负性更小的 C'], ['C', '两者完全相同'], ['D', '不需要考虑原子性质']], 'A', '同周期比较时，电负性更高的原子通常更能稳定负电荷。', 'easy', ['electronegativity']),
      one('q011', '质子转移平衡通常偏向哪一侧？', [['A', '较弱的酸和较弱的碱一侧'], ['B', '较强的酸和较强的碱一侧'], ['C', '永远偏向反应物'], ['D', '只由分子颜色决定']], 'A', '体系倾向形成更稳定、较弱的共轭酸碱；比较 pKa 时可用较高 pKa 的酸一侧作为近似判断。', 'medium', ['equilibrium', 'pKa']),
      one('q012', '机理弯箭头与共振箭头的主要区别是……', [['A', '机理弯箭头表示电子实际重新分配，共振箭头连接同一结构的表示式'], ['B', '两者完全相同'], ['C', '共振箭头表示分子发生氧化还原'], ['D', '机理弯箭头只能表示单电子移动']], 'A', '机理箭头追踪成键和断键；共振箭头只表示同一量子态的不同 Lewis 画法。', 'medium', ['curved arrows', 'resonance']),
      tf('q013', '甲烷几乎不显酸性，是因为去质子化会形成缺乏稳定化的碳负离子。', true, '负电荷落在相对不电负的碳上，且缺少共振或强诱导稳定，因此甲烷的共轭碱非常不稳定。', 'medium', ['acidity', 'carbon']),
      one('q014', '若 HA 的 pKa=3，HB 的 pKa=5，则更强的酸是……', [['A', 'HA'], ['B', 'HB'], ['C', '两者一样强'], ['D', '无法由 pKa 判断']], 'A', 'pKa 较小表示 Ka 较大，因此 HA 更容易解离，是更强的酸。', 'easy', ['pKa', 'comparison']),
      one('q015', '为什么乙酸比乙醇更容易失去质子？', [['A', '乙酸根的负电荷可在两个氧之间共振离域，而乙醇根缺少同等稳定化'], ['B', '乙醇含有更多氢原子，所以一定更强酸'], ['C', '乙酸根没有负电荷'], ['D', '乙酸的共轭碱比乙醇根更不稳定']], 'A', '乙酸的共轭碱有两个近似等价的氧共同承载负电荷，显著降低能量；这比单纯比较分子大小更关键。', 'hard', ['extension', 'resonance', 'acid strength'], { ...img('group-acetate-resonance.svg', '乙酸根的共振离域', '由 Chemical Structure Renderer 使用同一原子映射生成') })
    ]
  },
  {
    id: 'ORG-L04', title: '烷烃、环烷烃与系统命名', subject: 'organic-chemistry', chapter: 'Chapter 4 · Alkanes and nomenclature', lesson: 'Alkanes, cycloalkanes, and IUPAC naming', description: '练习烃与烷烃、母体链、取代基、CIP 规则以及环、稠环、桥环和螺环。', tags: ['IUPAC', 'alkanes', 'cycloalkanes', 'CIP'], knowledgePoints: ['parent chain', 'locants', 'carbon degree', 'ring nomenclature'], relatedNotes: ['/organic/dist/lesson-04.html'], questions: [
      one('q001', '烃的定义是……', [['A', '只含碳和氢的化合物'], ['B', '只含氧和氢的化合物'], ['C', '所有含碳化合物'], ['D', '只含金属的化合物']], 'A', '烃只由碳和氢组成；含有其他元素的化合物属于取代烃或其他类别。', 'easy', ['hydrocarbons']),
      one('q002', '下图所示正丁烷属于……', [['A', '开链饱和烷烃'], ['B', '芳香烃'], ['C', '烯烃'], ['D', '炔烃']], 'A', '正丁烷只有 C–C 单键和 C–H 键，是开链饱和烷烃。', 'easy', ['alkanes'], { ...img('org-butane-butane-neutral.svg', '正丁烷的骨架结构', '由 Chemical Structure Renderer 根据明确 SMILES CCCC 渲染') }),
      one('q003', '选择 IUPAC 母体链时，通常优先考虑……', [['A', '包含主要官能团或多重键且满足规则的最长连续碳链'], ['B', '任意最短碳链'], ['C', '只含一个碳的链'], ['D', '字母顺序最靠前的链']], 'A', '母体选择受最长链、主要官能团和多重键等规则共同约束，不能只凭视觉挑最直的线。', 'medium', ['IUPAC', 'parent chain']),
      one('q004', '编号时“最低位次组”原则的目的在于……', [['A', '让取代基和多重键获得按规则比较的最低编号集合'], ['B', '让分子量最小'], ['C', '让所有取代基都编号为 1'], ['D', '忽略官能团优先级']], 'A', '从两端编号时要比较位次集合，并遵循官能团、多重键和取代基的优先级规则。', 'easy', ['locants', 'IUPAC']),
      one('q005', '—CH₃ 作为取代基的名称是……', [['A', '甲基'], ['B', '乙基'], ['C', '亚甲基'], ['D', '甲烯基']], 'A', '—CH₃ 是甲基（methyl）。', 'easy', ['substituents']),
      one('q006', '一个碳原子的“级数”由它直接连接的什么数量决定？', [['A', '其他碳原子数'], ['B', '氢原子总数'], ['C', '氧原子数'], ['D', '分子中的总原子数']], 'A', '一级、二级、三级和四级碳分别直接连接 1、2、3、4 个其他碳原子。', 'easy', ['carbon degree']),
      many('q007', '系统命名自检时应核对哪些内容？', [['A', '母体链是否选对'], ['B', '编号方向是否符合最低位次规则'], ['C', '取代基名称和字母顺序是否正确'], ['D', '是否把所有隐含氢都写进名称']], ['A', 'B', 'C'], '母体、编号和取代基书写是命名自检的核心；隐含氢不需要逐个写进系统名称。', 'medium', ['IUPAC', 'checking']),
      one('q008', 'CIP 顺序规则首先比较取代基直接相连原子的……', [['A', '原子序数'], ['B', '颜色'], ['C', '沸点'], ['D', '分子总质量而不看原子序数']], 'A', 'CIP 首先比较直接相连原子的原子序数，若相同再逐层比较下一层原子。', 'easy', ['CIP', 'stereochemistry']),
      one('q009', '当环的碳数不小于连接到环上的最长链时，通常应把……作为母体？', [['A', '环'], ['B', '最短支链'], ['C', '任意含氧片段'], ['D', '只含一个碳的片段']], 'A', '简单环烷烃命名中，环通常作为母体；具体还要结合多重键和主要官能团规则。', 'medium', ['cycloalkanes', 'parent structure']),
      one('q010', '螺环结构的特征是……', [['A', '两个环共享一个原子'], ['B', '两个环共享一条完整边'], ['C', '两个环完全不相连'], ['D', '三个环共享所有原子']], 'A', '螺环的两个环仅共享一个原子；共享边的多环体系属于稠合环等其他拓扑。', 'easy', ['spiro', 'polycycles']),
      one('q011', '环己烷的常见低能构象主要是……', [['A', '椅式'], ['B', '完全平面六边形'], ['C', '线形'], ['D', '正方形']], 'A', '椅式构象能较好地减少扭转张力和空间张力，是环己烷的重要稳定构象。', 'easy', ['cyclohexane', 'conformation'], { ...img('org-cyclohexane-cyclohexane-neutral.svg', '环己烷连接关系示意图', '由 Chemical Structure Renderer 根据明确 SMILES C1CCCCC1 渲染；构象题仍需结合椅式图') }),
      tf('q012', '烷烃的分子式可用 CₙH₂ₙ₊₂ 表示，前提是它是开链饱和烃。', true, '环烷烃因成环少两个氢；含双键或三键也会改变通式。', 'easy', ['alkanes', 'formula']),
      one('q013', '英文系统命名中多个相同取代基通常使用……', [['A', 'di-、tri-、tetra- 等倍数前缀'], ['B', '只使用一个 mono-'], ['C', '用希腊字母表示电荷'], ['D', '用原子序数代替名称']], 'A', '相同取代基可用 di、tri、tetra 等前缀表示数量。', 'easy', ['IUPAC', 'prefixes']),
      one('q014', '稠合环、桥环和螺环的区别主要属于……', [['A', '环系之间共享原子或键的拓扑方式不同'], ['B', '分子中氧原子数量不同'], ['C', '都只由芳香环组成'], ['D', '命名时可以完全互换']], 'A', '这些术语描述环系连接拓扑，不能仅凭环数或分子量互换。', 'medium', ['polycycles', 'topology']),
      one('q015', '对一个含多个取代基的开链烷烃，最可靠的命名步骤是……', [['A', '先确定母体和主要结构特征，再编号、识别取代基、按规则组合名称并复核'], ['B', '先按字母顺序写取代基，再随意选母体'], ['C', '只看最长的视觉水平线'], ['D', '忽略环和多重键的优先级']], 'A', '系统命名应按结构层级推进：母体、主官能团或多重键、编号、取代基和字母顺序，最后复核。', 'hard', ['extension', 'IUPAC', 'workflow'])
    ]
  },
  {
    id: 'ORG-L05', title: '异构、构象、环张力与烷烃反应', subject: 'organic-chemistry', chapter: 'Chapter 5 · Isomerism and conformation', lesson: 'Isomerism, conformation, ring strain, and alkane reactions', description: '练习构造异构、E/Z、Newman 投影、扭转/空间张力、环己烷翻环和烷烃反应。', tags: ['isomerism', 'conformation', 'ring strain', 'alkane reactions'], knowledgePoints: ['constitutional isomers', 'E/Z', 'Newman projection', 'chair conformations'], relatedNotes: ['/organic/dist/lesson-05.html'], questions: [
      one('q001', '构造异构体的定义是……', [['A', '分子式相同但原子连接关系不同的化合物'], ['B', '连接关系相同但颜色不同'], ['C', '只有同位素不同的原子'], ['D', '任何构象变化']], 'A', '构造异构体的原子连接方式不同；仅绕单键旋转产生的是构象异构。', 'easy', ['constitutional isomerism']),
      one('q002', '图中结构对应哪种 2-丁烯立体异构体？', [['A', 'E'], ['B', 'Z'], ['C', '没有几何异构'], ['D', '芳香异构体']], 'A', '双键两端高优先级取代基位于相对两侧时为 E。', 'easy', ['E-Z', 'stereochemistry'], { ...img('org-e-butene-e-butene-E.svg', '(E)-2-丁烯结构示意图', '由 Chemical Structure Renderer 根据明确立体 SMILES C/C=C/C 渲染') }),
      one('q003', '图中结构对应哪种 2-丁烯立体异构体？', [['A', 'E'], ['B', 'Z'], ['C', '只有顺反键旋转'], ['D', '无立体信息']], 'B', '双键两端高优先级取代基位于同侧时为 Z。', 'easy', ['E-Z', 'stereochemistry'], { ...img('org-z-butene-z-butene-Z.svg', '(Z)-2-丁烯结构示意图', '由 Chemical Structure Renderer 根据明确立体 SMILES C/C=C\\C 渲染') }),
      one('q004', '绕乙烷 C–C 单键旋转改变的是……', [['A', '构象'], ['B', '原子连接关系'], ['C', '分子式'], ['D', '元素种类']], 'A', '单键旋转通常只改变构象，不改变原子连接关系或分子式。', 'easy', ['conformation', 'ethane']),
      one('q005', '乙烷交错构象比重叠构象稳定，主要因为……', [['A', '扭转张力较小'], ['B', '碳原子变成芳香原子'], ['C', 'C–C 键断裂'], ['D', '氢原子被移除']], 'A', '交错构象使相邻键电子对尽量错开，降低扭转张力。', 'easy', ['Newman projection', 'torsional strain']),
      one('q006', '正丁烷的 anti 构象相对 gauche 构象通常更稳定，因为……', [['A', '两个甲基相距更远，空间张力更小'], ['B', 'anti 构象没有任何 C–H 键'], ['C', 'gauche 构象为芳香结构'], ['D', 'anti 构象包含离子键']], 'A', 'anti 构象使两个较大的甲基相隔最远，通常具有更低的空间排斥。', 'easy', ['butane', 'steric strain'], { ...img('org-butane-butane-neutral.svg', '正丁烷结构连接关系', '由 Chemical Structure Renderer 根据明确 SMILES CCCC 渲染') }),
      one('q007', '环张力通常包含哪些来源？', [['A', '角张力、扭转张力和非键相互作用'], ['B', '只有分子量'], ['C', '只来自芳香性'], ['D', '只来自氢键']], 'A', '环张力是多种几何和电子因素的总和，包括键角偏离、重叠遮挡和非键排斥。', 'medium', ['ring strain']),
      one('q008', '环己烷椅式构象的优势是……', [['A', '键角接近理想四面体且相邻键多为交错'], ['B', '六个碳全部共面'], ['C', '所有氢重叠在同一方向'], ['D', '必然形成双键']], 'A', '椅式同时减小角张力和扭转张力，因此通常比船式稳定。', 'easy', ['cyclohexane', 'chair']),
      one('q009', '环己烷翻环会……', [['A', '互换同一取代基的轴向与赤道向位置'], ['B', '改变碳骨架连接关系'], ['C', '把单键变成双键'], ['D', '改变分子式']], 'A', '翻环保持连接关系不变，但会使每个位置的 axial/equatorial 属性互换。', 'easy', ['ring flip']),
      one('q010', '对于单取代环己烷，体积较大的取代基通常更偏好……', [['A', '赤道位'], ['B', '轴向位'], ['C', '环外任意位置'], ['D', '不受空间效应影响']], 'A', '赤道位能减少与轴向氢的 1,3-二轴相互作用，因此通常更稳定。', 'medium', ['cyclohexane', 'equatorial']),
      one('q011', '若一个双环体系的两个环只共享一个原子，它属于……', [['A', '螺环体系'], ['B', '稠合环体系'], ['C', '桥环体系'], ['D', '开链体系']], 'A', '螺环的定义是两个环仅共享一个原子。', 'easy', ['polycycles']),
      tf('q012', '构象异构体之间通常不需要断开 σ 键就可以相互转化。', true, '构象变化通常通过绕单键旋转实现；构造异构体则需要改变连接关系。', 'easy', ['conformation']),
      one('q013', '烷烃完全燃烧的主要产物是……', [['A', 'CO₂ 和 H₂O'], ['B', 'NH₃ 和 O₂'], ['C', '只生成 H₂'], ['D', '金属盐和水']], 'A', '含碳、氢的烷烃在充分氧气中燃烧，碳和氢分别主要转化为 CO₂ 与 H₂O。', 'easy', ['alkane reactions', 'combustion']),
      many('q014', '比较烷烃构象稳定性时，通常要考虑……', [['A', '扭转张力'], ['B', '取代基间的空间张力'], ['C', '环的角张力'], ['D', '只看分子量']], ['A', 'B', 'C'], '构象能量来自多个几何因素，不能只凭分子量或画面高度判断。', 'medium', ['conformation', 'strain']),
      one('q015', '甲基环己烷的主要构象通常让甲基处于赤道位，最好的解释是……', [['A', '赤道位减少 1,3-二轴相互作用，降低大取代基的空间张力'], ['B', '赤道位会形成额外双键'], ['C', '轴向位没有任何氢原子'], ['D', '甲基在赤道位时环变成平面']], 'A', '大取代基的赤道位构象通常更稳定；翻环仍会产生轴向异构构象，但比例较低。', 'hard', ['extension', 'chair', 'steric strain'])
    ]
  },
  {
    id: 'INORG-L02', title: '原子结构与周期趋势', subject: 'inorganic-chemistry', chapter: 'Chapter 2 · Atomic structure', lesson: 'Atomic structure and periodic trends', description: '练习量子数、轨道节点、多电子原子、电子排布、屏蔽、半径、电离能与电子亲和能。', tags: ['quantum numbers', 'electron configuration', 'periodic trends', 'shielding'], knowledgePoints: ['wavefunction', 'nodes', 'Aufbau', 'ionization energy'], relatedNotes: ['/inorganic/dist/lesson-02.html'], questions: [
      one('q001', '为什么原子模型需要进入量子力学？', [['A', '经典轨道不能正确描述微观粒子的波动性和离散能级'], ['B', '因为所有电子都静止'], ['C', '因为原子没有核'], ['D', '因为周期表只包含分子']], 'A', '量子力学用波函数和能级描述电子的微观状态，替代了经典确定轨道图像。', 'easy', ['quantum mechanics']),
      one('q002', '波函数 ψ 本身最直接代表……', [['A', '描述电子状态的数学函数'], ['B', '电子的经典运行轨迹'], ['C', '原子质量'], ['D', '分子的沸点']], 'A', 'ψ 是状态的数学描述；|ψ|² 与概率密度相关。', 'easy', ['wavefunction']),
      one('q003', '四个量子数中，主量子数 n 主要决定……', [['A', '主能级和轨道尺度的层次'], ['B', '轨道的自旋方向'], ['C', 'p 轨道的具体取向'], ['D', '电子是否带电']], 'A', 'n 标记主能级并影响轨道的大小和能量层次；其他量子数描述形状、取向和自旋。', 'easy', ['quantum numbers']),
      one('q004', 'p 轨道对应的角量子数 l 是……', [['A', '0'], ['B', '1'], ['C', '2'], ['D', '3']], 'B', 's、p、d、f 分别对应 l=0、1、2、3。', 'easy', ['quantum numbers', 'orbitals']),
      many('q005', '关于轨道节点，下列说法正确的是……', [['A', '节点处波函数为零'], ['B', '节点不等于电子一定不能出现在整个轨道区域'], ['C', '节点数随量子数变化'], ['D', '所有轨道节点都只是一条直线']], ['A', 'B', 'C'], '节点是概率密度为零的区域，可能是径向节点或角节点，形状并不都相同。', 'medium', ['nodes', 'orbitals']),
      one('q006', '径向概率与径向概率密度的区别在于……', [['A', '径向概率还考虑了距离球壳体积因素'], ['B', '两者永远完全相同'], ['C', '径向概率只适用于分子'], ['D', '径向概率不含距离变量']], 'A', '径向概率随球壳体积增长因素变化，不能简单把概率密度峰值当作最可能距离。', 'medium', ['radial probability']),
      one('q007', '多电子原子中，屏蔽效应会使外层电子……', [['A', '感受到的有效核电荷减小'], ['B', '感受到的核电荷无限增大'], ['C', '一定进入原子核'], ['D', '与其他电子完全无关']], 'A', '内层电子部分抵消核电荷，外层电子感受到的有效核电荷小于裸核电荷。', 'easy', ['shielding', 'effective nuclear charge']),
      many('q008', '构造原理、Pauli 原理和 Hund 规则分别涉及……', [['A', '低能轨道先填充'], ['B', '同一轨道最多容纳两个反平行自旋电子'], ['C', '简并轨道先单占且自旋平行'], ['D', '所有电子必须自旋相同']], ['A', 'B', 'C'], '三条规则共同构成基态电子排布的基本框架。', 'easy', ['electron configuration']),
      one('q009', 'Cr 和 Cu 的基态排布常被作为例外，是因为……', [['A', '亚层接近简并时，半充满或全充满 d 亚层可带来额外稳定'], ['B', '它们没有 d 电子'], ['C', 'Pauli 原理对过渡元素失效'], ['D', '原子核没有电荷']], 'A', '实际能量差很小，s 与 d 电子重新分配可能使半充满或全充满 d 亚层更稳定。', 'medium', ['electron configuration', 'transition metals']),
      one('q010', '等电子系列中，核电荷更高的粒子通常半径更小，因为……', [['A', '相同电子数受到更强的核吸引'], ['B', '电子数随核电荷增加而减少为零'], ['C', '核电荷不影响半径'], ['D', '阴离子一定更小']], 'A', '等电子时电子排布相近，核电荷增加会增强有效吸引，半径通常缩小。', 'easy', ['ionic radius', 'isoelectronic']),
      one('q011', '同一周期从左到右，第一电离能总体趋势通常是……', [['A', '增大，但存在由亚层和成对电子造成的局部断点'], ['B', '严格恒定'], ['C', '一直减小'], ['D', '只由原子质量决定']], 'A', '有效核电荷增加使电子更难移除，但 s/p 亚层差异和电子成对会造成例外。', 'medium', ['ionization energy']),
      one('q012', '下图的铵离子带正电，最直接的结构原因是……', [['A', '形式电荷总和为 +1，氮与四个氢形成四个键'], ['B', '氮原子消失了一个质子'], ['C', '所有氢都带负电'], ['D', '分子中没有电子']], 'A', 'NH₄⁺ 的形式电荷总和为 +1；它可由 NH₃ 接受一个质子形成。', 'easy', ['ions', 'formal charge'], { ...img('inorg-ammonium-ammonium-cation.svg', '铵离子结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES [NH4+] 渲染') }),
      one('q013', '电子亲和能的符号讨论中，首先应明确……', [['A', '采用的能量变化约定和电子加入的反应方向'], ['B', '只看元素名称'], ['C', '电子亲和能与电子无关'], ['D', '所有元素数值完全相同']], 'A', '电子亲和能的正负在不同教材约定中可能不同，必须先确认反应和符号定义。', 'medium', ['electron affinity']),
      tf('q014', '“阳离子一定比任何阴离子都小”是普遍成立的规律。', false, '半径比较必须考虑电子层数、等电子关系和有效核电荷；不能脱离具体系列作绝对判断。', 'medium', ['ionic radius']),
      one('q015', '为什么 Mg 的第一电离能通常高于 Al，尽管 Al 位于 Mg 的右侧？', [['A', 'Al 移除的是较高能量的 3p 电子，而 Mg 移除 3s 电子'], ['B', 'Al 没有价电子'], ['C', 'Mg 的核电荷更低所以电子更难移除'], ['D', 'Pauli 原理只适用于 Mg']], 'A', 'Al 的首个被移除电子来自能量较高、穿透性较弱的 3p 亚层，因而出现局部趋势反常。', 'hard', ['extension', 'ionization energy', 'periodic trends'])
    ]
  },
  {
    id: 'INORG-L03', title: '简单成键理论：Lewis 结构、共振与 VSEPR', subject: 'inorganic-chemistry', chapter: 'Chapter 3 · Lewis and VSEPR', lesson: 'Lewis structures, resonance, and VSEPR', description: '练习 Lewis 结构、形式电荷、共振、BF₃、VSEPR、多中心键与配体紧密堆积。', tags: ['Lewis structures', 'resonance', 'VSEPR', 'formal charge'], knowledgePoints: ['electron counting', 'SCN-', 'electron domains', 'hypervalency'], relatedNotes: ['/inorganic/dist/lesson-03.html'], questions: [
      one('q001', 'Lewis 结构最直接记录的是……', [['A', '价电子如何分配到键和孤对电子'], ['B', '电子的精确时间轨迹'], ['C', '晶体的所有长程缺陷'], ['D', '溶液中的反应速率']], 'A', 'Lewis 结构是价层电子计数和局域成键的简化表示，不能单独给出完整量子态。', 'easy', ['Lewis structures']),
      one('q002', '画 Lewis 结构的第一步通常是……', [['A', '统计所有原子的价电子并考虑整体电荷'], ['B', '先随意添加双键'], ['C', '先决定颜色'], ['D', '先忽略氢和卤素']], 'A', '价电子总数和整体电荷是后续连接骨架、补八隅体和计算形式电荷的基础。', 'easy', ['electron counting']),
      one('q003', '形式电荷的总和应当等于……', [['A', '分子或离子的整体电荷'], ['B', '中子总数'], ['C', '原子序数总和'], ['D', '孤对电子数']], 'A', '一幅 Lewis 结构中各原子形式电荷之和必须等于体系净电荷。', 'easy', ['formal charge']),
      one('q004', '共振式之间必须保持不变的是……', [['A', '原子核骨架和 σ 键连接关系'], ['B', '所有 π 电子位置'], ['C', '每个原子的形式电荷'], ['D', '所有构象角']], 'A', '共振只重新分配 π 电子、孤对电子和形式电荷，不改变原子连接。', 'easy', ['resonance']),
      one('q005', '比较 SCN⁻ 的共振贡献式时，最可靠的第一步是……', [['A', '逐式计算形式电荷并检查八隅体、负电荷位置和电荷分离'], ['B', '只选画得最对称的一式'], ['C', '只看硫的原子量'], ['D', '忽略总电荷']], 'A', '共振贡献式需要结合形式电荷、八隅体、负电荷落在何种元素上以及电荷分离程度判断。', 'medium', ['SCN-', 'resonance']),
      one('q006', '下图 BF₃ 的 Lewis 模型最值得强调的特征是……', [['A', '中心 B 周围只有六个共享电子，属于电子缺乏中心'], ['B', 'B 周围一定有完整八隅体'], ['C', 'BF₃ 是线形分子'], ['D', 'B 带四个孤对电子']], 'A', 'BF₃ 的中心硼常以六电子价层表示，是典型 Lewis 酸和电子缺乏体系。', 'medium', ['BF3', 'Lewis acid'], { ...img('inorg-bf3-boron-trifluoride-neutral.svg', '三氟化硼结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES F[B](F)F 渲染') }),
      one('q007', 'VSEPR 中双键通常计作几个电子域？', [['A', '一个电子域'], ['B', '两个电子域'], ['C', '三个电子域'], ['D', '不计入电子域']], 'A', 'VSEPR 关注中心原子周围电子密度区域，多重键作为一个方向上的电子域，但排斥可能更强。', 'easy', ['VSEPR', 'electron domains']),
      one('q008', 'AX₃ 型且中心原子无孤对电子的分子几何通常是……', [['A', '三角平面'], ['B', '三角锥'], ['C', '折线形'], ['D', '四面体']], 'A', '三个成键电子域且无孤对电子时，几何为三角平面。', 'easy', ['VSEPR', 'geometry']),
      one('q009', '孤对电子对键角的影响通常是……', [['A', '孤对–孤对和孤对–键对排斥更强，会压缩键角'], ['B', '孤对电子没有空间效应'], ['C', '孤对电子总会使键角变成 180°'], ['D', '只影响分子量']], 'A', '孤对电子密度更集中在中心原子附近，排斥通常强于键对–键对排斥。', 'easy', ['VSEPR', 'lone pairs']),
      one('q010', '为什么多重键可能比单键更明显地压缩相邻键角？', [['A', '多重键电子密度更集中，电子域排斥通常更强'], ['B', '多重键没有电子'], ['C', '多重键一定是离子键'], ['D', '键角只由原子质量决定']], 'A', 'VSEPR 中多重键虽算一个域，但其电子密度和排斥往往更强。', 'medium', ['multiple bonds', 'bond angles']),
      many('q011', '三角双锥中轴向与赤道位不等价，原因包括……', [['A', '轴向位有三个 90° 相互作用'], ['B', '赤道位只有两个 90° 相互作用'], ['C', '不同配体会偏好不同位置'], ['D', '所有位置在任何体系中都完全等价']], ['A', 'B', 'C'], '三角双锥的几何位置具有不同的 90° 相互作用数，因此取代基大小和孤对电子会影响位置偏好。', 'medium', ['trigonal bipyramidal', 'VSEPR']),
      one('q012', '现代超价键描述通常不主张简单地说中心原子“调用高能 d 轨道扩展八隅体”，而更强调……', [['A', '离域分子轨道、离子性和配体电负性等因素'], ['B', '所有键都是纯粹两中心两电子键'], ['C', '原子核没有作用'], ['D', '电子计数不重要']], 'A', '现代描述将超价键看作离域和离子性贡献的组合，不把旧式杂化图像当成唯一解释。', 'medium', ['hypervalency', 'molecular orbitals']),
      one('q013', '三中心四电子键的定性图景通常包含……', [['A', '三个原子共享成键、非键和反键组合中的四个电子'], ['B', '三个原子只共享一个电子'], ['C', '两个原子核没有轨道相互作用'], ['D', '只有金属原子能形成']], 'A', '三中心四电子模型用离域轨道解释某些桥联或超价体系的稳定性。', 'medium', ['three-center bonding']),
      tf('q014', '任何一个 Lewis 结构都能独立、完整地代表分子的真实电子结构。', false, 'Lewis 结构是有用模型；共振、分子轨道和实验数据可能显示电子离域或其他超出局域图像的内容。', 'medium', ['models', 'Lewis structures']),
      one('q015', '比较一个离子多幅共振式的主要贡献时，最稳妥的综合判断是……', [['A', '优先满足合理八隅体，减少电荷分离，并让负电荷更偏向电负性较大的原子'], ['B', '只选择双键最多的一幅'], ['C', '只选择形式电荷绝对值最大的'], ['D', '忽略原子种类和总电荷']], 'A', '共振贡献式需要综合电子计数、形式电荷、电负性和离域程度；单一规则不能代替完整比较。', 'hard', ['extension', 'resonance', 'formal charge'])
    ]
  },
  {
    id: 'INORG-L04', title: '分子对称性与点群', subject: 'inorganic-chemistry', chapter: 'Chapter 4 · Symmetry and point groups', lesson: 'Molecular symmetry and point groups', description: '练习对称元素、Cₙ、镜面、反演、Sₙ、点群判定及 IR/Raman 选择定则。', tags: ['symmetry', 'point groups', 'IR', 'Raman'], knowledgePoints: ['symmetry operations', 'point-group tree', 'character tables', 'mutual exclusion'], relatedNotes: ['/inorganic/dist/lesson-04.html'], questions: [
      one('q001', '对称元素与对称操作的区别是……', [['A', '元素是几何对象，操作是使体系不可区分的变换'], ['B', '两者完全同义'], ['C', '元素只指电子，操作只指原子'], ['D', '操作不需要保持体系不可区分']], 'A', '例如 C₂ 轴是对称元素，绕该轴旋转 180° 是对称操作。', 'easy', ['symmetry elements', 'operations']),
      one('q002', 'E 操作表示……', [['A', '恒等操作，体系不发生变化'], ['B', '一次旋转'], ['C', '反演'], ['D', '镜面反射']], 'A', 'E 是每个点群都包含的恒等操作。', 'easy', ['identity', 'symmetry']),
      one('q003', '判定主轴时首先寻找……', [['A', '阶数最高的 Cₙ 轴'], ['B', '最低阶的镜面'], ['C', '任意一条键'], ['D', '最短的分子长度']], 'A', '主轴是体系中阶数最高的真旋转轴，后续点群判定围绕它展开。', 'easy', ['C_n', 'point groups']),
      many('q004', '镜面 σ 的命名需要相对于什么来判断？', [['A', '主轴'], ['B', 'σh 与主轴垂直'], ['C', 'σv 包含主轴'], ['D', 'σd 还平分垂直 C₂ 轴间的夹角']], ['A', 'B', 'C', 'D'], 'σh、σv、σd 都是相对主轴定义的几何关系。', 'medium', ['mirror planes']),
      one('q005', '反演操作 i 对坐标的作用是……', [['A', '(x,y,z) 变为 (−x,−y,−z)'], ['B', '只改变 z 坐标'], ['C', '只绕 z 轴旋转'], ['D', '只交换两个氢原子']], 'A', '反演把每个点映射到穿过反演中心、距离相等的相反位置。', 'easy', ['inversion']),
      one('q006', 'Sₙ 操作的顺序是……', [['A', '先绕轴旋转 360°/n，再关于垂直于该轴的平面反射'], ['B', '先反演再平移'], ['C', '只做一次镜面反射'], ['D', '先改变键级再旋转']], 'A', 'Sₙ 是非真旋转，包含一次 Cₙ 旋转和一次垂直镜面反射。', 'easy', ['improper rotation']),
      one('q007', '若存在主轴 Cₙ 以及 n 条与其垂直的 C₂ 轴，点群判定应优先考虑……', [['A', 'D 类点群'], ['B', 'C 类点群'], ['C', 'S 类点群'], ['D', '只能是 C₁']], 'A', '垂直 C₂ 轴是 D 类点群与普通 C 类点群分流的重要依据。', 'medium', ['point-group tree']),
      one('q008', 'C₁ 点群表示……', [['A', '除 E 外没有非平凡对称操作'], ['B', '有一个 C₁ 旋转轴之外还有 i'], ['C', '一定具有反演中心'], ['D', '一定是线形分子']], 'A', 'C₁ 只有恒等操作 E；名称中的 C₁ 不应误解为存在额外非平凡旋转。', 'easy', ['C1', 'point groups']),
      one('q009', '线形异核分子通常属于……', [['A', 'C∞v'], ['B', 'D∞h'], ['C', 'Td'], ['D', 'Oh']], 'A', '异核线形分子通常没有反演中心，因此为 C∞v；同核对称线形分子常为 D∞h。', 'medium', ['linear molecules', 'point groups']),
      one('q010', '苯的高对称性来自……', [['A', '平面六元环和规则取代关系共同提供多条旋转轴、镜面和反演对称'], ['B', '苯是开链分子'], ['C', '苯没有任何 C–C 键'], ['D', '苯只含一个原子']], 'A', '苯的平面规则六元环具有丰富对称操作，属于高对称点群。', 'medium', ['benzene', 'symmetry'], { ...img('org-benzene-benzene-neutral.svg', '苯的六元环结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES c1ccccc1 渲染') }),
      one('q011', 'CO₂ 的线形、同核两端结构使其具有……', [['A', '反演中心，属于 D∞h 类型'], ['B', '手性 C₁ 点群'], ['C', '四面体几何'], ['D', '没有任何旋转轴']], 'A', '对称线形分子具有主轴、无穷多垂直 C₂ 轴和反演中心等特征。', 'medium', ['CO2', 'D-infinity-h'], { ...img('inorg-carbon-dioxide-carbon-dioxide-neutral.svg', '二氧化碳线形结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES O=C=O 渲染') }),
      one('q012', '读取 C₂v 特征标表时，x、y、z 的标签主要帮助判断……', [['A', '平移或振动是否具有红外活性'], ['B', '样品的沸点'], ['C', '分子量'], ['D', '是否存在同位素']], 'A', 'IR 活性要求振动与 x、y 或 z 等偶极矩分量同对称。', 'easy', ['character table', 'IR']),
      one('q013', 'Raman 活性通常与哪些二次函数相关？', [['A', 'x²、y²、z²、xy、xz、yz'], ['B', '只有 x'], ['C', '只有 z'], ['D', '原子质量平方']], 'A', 'Raman 活性与极化率张量变化有关，对应二次函数的对称性标签。', 'easy', ['Raman', 'selection rules']),
      tf('q014', '含反演中心的分子中，同一个正常振动模式可以同时具有 IR 和 Raman 活性。', false, '中心对称分子遵循互斥规则：同一模式不能同时属于 IR 活性的 u 类和 Raman 活性的 g 类。', 'medium', ['mutual exclusion', 'IR', 'Raman']),
      one('q015', '利用 IR 与 Raman 区分具有或不具有反演中心的构型时，最关键的推理是……', [['A', '先判定点群和反演中心，再根据极矢量与二次函数的对称性判断选择定则'], ['B', '只比较分子量'], ['C', '只看峰的颜色'], ['D', '假定所有理论振动都一定能看见']], 'A', '结构、点群、反演中心和选择定则必须连成证据链；理论模式数也不等于实验中一定可分辨的峰数。', 'hard', ['extension', 'spectroscopy', 'point groups'])
    ]
  },
  {
    id: 'PCHEM-L02', title: '真实气体与状态方程', subject: 'physical-chemistry', chapter: 'Chapter 2 · Real gases', lesson: 'Real gases and equations of state', description: '练习气体动理论参照、分子间作用、压缩因子、维里方程、临界现象和 van der Waals 方程。', tags: ['real gases', 'compressibility', 'virial equation', 'van der Waals'], knowledgePoints: ['molecular attraction', 'Z factor', 'critical point', 'Maxwell construction'], relatedNotes: ['/physical/dist/lesson-02.html'], questions: [
      one('q001', '理想气体模型在真实气体课程中的作用是……', [['A', '作为比较真实偏差的参照模型'], ['B', '宣称所有气体在所有条件下都理想'], ['C', '只用于固体'], ['D', '替代所有实验数据']], 'A', '真实气体的吸引、排斥和有限体积效应都可通过与理想模型比较来量化。', 'easy', ['ideal gas', 'real gas']),
      one('q002', '气体压力的微观来源是……', [['A', '大量分子撞击器壁时传递动量'], ['B', '分子静止地压在器壁上'], ['C', '只有分子间吸引'], ['D', '容器颜色']], 'A', '压力是单位面积、单位时间内分子撞壁产生的平均动量传递。', 'easy', ['kinetic theory', 'pressure']),
      one('q003', '分子间吸引作用会使实际压力相对理想预测……', [['A', '偏低，因为分子被拉回气体内部'], ['B', '一定偏高'], ['C', '完全不变'], ['D', '变成零']], 'A', '靠近器壁的分子受到内部吸引，撞壁动量传递减小，实际压力可能低于理想值。', 'easy', ['intermolecular attraction']),
      one('q004', '高压下真实气体常出现 Z>1，主要反映……', [['A', '短程排斥和有限体积效应占主导'], ['B', '分子间吸引无限增强'], ['C', '分子全部消失'], ['D', '温度必然为零']], 'A', '高压使分子靠近，排斥和不可穿透体积效应会使气体比理想模型更难压缩。', 'easy', ['repulsion', 'compressibility']),
      one('q005', '压缩因子 Z 的定义是……', [['A', 'pVₘ/(RT)'], ['B', 'RT/(pVₘ)'], ['C', 'pT/Vₘ'], ['D', 'Vₘ/(pT)']], 'A', 'Z=pVₘ/RT；理想气体在相同条件下 Z=1。', 'easy', ['compressibility factor']),
      one('q006', '低密度极限下，真实气体的压缩因子趋向……', [['A', '1'], ['B', '0'], ['C', '无穷大'], ['D', '−1']], 'A', '密度趋近零时分子间作用影响减弱，Z→1。', 'easy', ['virial equation']),
      one('q007', '维里方程的低密度展开中，第二维里系数 B 主要反映……', [['A', '二体相互作用的首阶修正'], ['B', '容器的颜色'], ['C', '只有三体碰撞'], ['D', '样品质量的单位']], 'A', 'B(T) 是低密度展开的首个偏离项，主要承载二体相互作用信息。', 'medium', ['virial equation']),
      one('q008', '若 B(T)<0，低密度下通常意味着……', [['A', '吸引作用在首阶偏差中占优势'], ['B', '排斥作用绝对占优势'], ['C', 'Z 必然大于 1'], ['D', '体系没有分子']], 'A', '负的第二维里系数通常对应吸引作用使 Z 从 1 的下方偏离。', 'medium', ['virial coefficient']),
      one('q009', '临界点的特征是……', [['A', '气液两相界面消失，超过该点不能靠加压单独液化'], ['B', '所有分子停止运动'], ['C', '压力为零'], ['D', '温度必然为 0 K']], 'A', '临界点是气液相区分消失的边界；超过临界温度，单纯加压不能得到通常意义上的液气相变。', 'easy', ['critical point']),
      one('q010', 'van der Waals 方程中的 Vₘ−b 修正用于表示……', [['A', '分子自身有限体积使可用空间减少'], ['B', '吸引作用使压力降低'], ['C', '分子质量变为零'], ['D', '所有分子变成离子']], 'A', 'b 是排除体积参数，反映分子不能相互穿透导致的可用体积减少。', 'easy', ['van der Waals']),
      one('q011', 'van der Waals 方程中的 a/Vₘ² 压力修正来自……', [['A', '分子间吸引导致实测压力降低'], ['B', '分子完全没有体积'], ['C', '电子亲和能'], ['D', '容器的重力']], 'A', '加上内压力项可补偿吸引使撞壁动量减小的效果。', 'easy', ['van der Waals']),
      one('q012', 'Maxwell 等面积构造的水平线用于……', [['A', '替代不稳定回线并满足气液两相化学势相等的条件'], ['B', '把所有温度变成相同'], ['C', '计算原子半径'], ['D', '删除液相']], 'A', '等面积构造给出气液共存平台的压力，是相平衡条件在 p–V 图上的表达。', 'medium', ['Maxwell construction']),
      one('q013', '对应状态原理的基本思想是……', [['A', '用约化变量比较不同物质在相似约化条件下的行为'], ['B', '所有物质的临界常数完全相同'], ['C', '只适用于固体'], ['D', '不需要温度和压力']], 'A', '约化温度、压力和体积把不同物质的状态变量按临界常数归一化，便于比较。', 'medium', ['corresponding states']),
      tf('q014', '真实气体偏离理想行为的方向在所有压力下都相同。', false, '中压吸引可能令 Z<1，高压排斥又可能令 Z>1，偏差方向取决于条件和相互作用。', 'medium', ['compressibility factor']),
      one('q015', '某气体的 Z–p 曲线先低于 1、再高于 1，最合理的解释是……', [['A', '中压时吸引占优势，高压时短程排斥和有限体积最终占优势'], ['B', '气体先变成固体再变回元素'], ['C', 'Z 的定义随压力改变'], ['D', '所有分子间作用都被忽略']], 'A', '同一气体在不同密度下可能由不同相互作用主导，因而出现先负偏差后正偏差。', 'hard', ['extension', 'Z factor', 'molecular interactions'])
    ]
  },
  {
    id: 'PCHEM-L03', title: '气体动理论与分子速率', subject: 'physical-chemistry', chapter: 'Chapter 3 · Kinetic theory', lesson: 'Kinetic theory and molecular speeds', description: '练习动理论假设、碰撞压强、温度与速率、Maxwell 分布、碰撞频率和平均自由程。', tags: ['kinetic theory', 'Maxwell distribution', 'molecular speed', 'mean free path'], knowledgePoints: ['model assumptions', 'rms speed', 'relative speed', 'collision frequency'], relatedNotes: ['/physical/dist/lesson-03.html'], questions: [
      one('q001', '理想气体动理论的基本假设之一是……', [['A', '分子体积相对容器体积可忽略'], ['B', '分子永远静止'], ['C', '分子间有强定向键'], ['D', '所有分子速度相同']], 'A', '理想模型把分子视为小粒子，并在适用条件下忽略自身总体积和相互作用。', 'easy', ['kinetic theory', 'assumptions']),
      one('q002', '气体撞壁产生压力的关键微观量是……', [['A', '动量变化率'], ['B', '分子颜色'], ['C', '原子序数之和'], ['D', '电子自旋总和']], 'A', '分子每次撞壁改变动量，单位时间和面积上的平均动量传递就是压力。', 'easy', ['pressure', 'momentum']),
      one('q003', '理想气体动理论常写出的压力关系是……', [['A', 'p=⅓ρ⟨c²⟩'], ['B', 'p=3ρ⟨c²⟩'], ['C', 'p=ρ/⟨c²⟩'], ['D', 'p=0']], 'A', '各向同性运动给出 ⟨cₓ²⟩=⅓⟨c²⟩，从而得到压力与密度及均方速率的关系。', 'medium', ['kinetic theory', 'pressure']),
      one('q004', '温度在动理论中的微观含义与什么量相关？', [['A', '分子的平均平动动能'], ['B', '分子的颜色'], ['C', '分子总数本身'], ['D', '容器壁厚度']], 'A', '理想气体温度与粒子平均平动动能成正比。', 'easy', ['temperature', 'kinetic energy']),
      one('q005', '理想气体分子的均方根速率为……', [['A', '√(3RT/M)'], ['B', '√(M/3RT)'], ['C', '3RT/M'], ['D', 'RTM']], 'A', '由平均平动动能与温度关系得到 cᵣₘₛ=√(3RT/M)。', 'easy', ['rms speed']),
      one('q006', '同一温度下，对同一气体通常有怎样的速率大小规律？', [['A', '最概然速率 < 平均速率 < 均方根速率'], ['B', '三者永远相等'], ['C', '均方根速率 < 最概然速率'], ['D', '速率没有分布']], 'A', 'Maxwell 分布不对称，三种特征速率通常按该顺序大小规律。', 'medium', ['Maxwell distribution']),
      one('q007', '为什么需要 Maxwell 速率分布而不能只用一个速率？', [['A', '气体分子速率具有统计分布，不是所有分子都一样快'], ['B', '分子没有速度'], ['C', '温度只影响颜色'], ['D', '分布只用于液体']], 'A', '宏观温度对应统计平均，单个分子的速率会分布在一系列范围内。', 'easy', ['Maxwell distribution']),
      one('q008', '同一温度下，较重分子的典型速率通常……', [['A', '较低'], ['B', '较高'], ['C', '与质量无关且为零'], ['D', '一定等于光速']], 'A', '平均动能由温度决定，M 越大时 √(1/M) 使典型速率降低。', 'easy', ['molecular speed', 'molar mass']),
      one('q009', '分子间平均相对速率用于描述……', [['A', '两个分子相互接近时的相对运动快慢'], ['B', '单个分子的电荷'], ['C', '容器总体积'], ['D', '液体黏度的唯一来源']], 'A', '碰撞过程取决于分子间的相对速度，而不只是某个分子的实验室系速度。', 'medium', ['relative speed', 'collisions']),
      one('q010', '碰撞频率通常会随数密度增加而……', [['A', '增加，因为单位体积内可碰撞粒子更多'], ['B', '降低到零'], ['C', '完全不变'], ['D', '只由颜色决定']], 'A', '在其他条件相近时，粒子越密集，单位时间发生的碰撞越多。', 'easy', ['collision frequency']),
      one('q011', '平均自由程表示……', [['A', '分子两次连续碰撞之间平均走过的距离'], ['B', '分子从容器到真空的距离'], ['C', '分子轨道半径'], ['D', '分子总路程']], 'A', '平均自由程是粒子连续两次碰撞之间自由飞行距离的平均值。', 'easy', ['mean free path']),
      tf('q012', '在温度不变时，提高气体压力通常会使平均自由程变长。', false, '压力升高通常意味着数密度增加，碰撞更频繁，平均自由程缩短。', 'medium', ['mean free path', 'pressure']),
      one('q013', '气体动理论中的“分子体积可忽略”是……', [['A', '模型近似，适用于分子间距远大于分子尺度的条件'], ['B', '说分子没有原子'], ['C', '所有压力下都绝对成立'], ['D', '说分子质量为零']], 'A', '理想化假设有适用范围；高压下有限体积效应不能忽略。', 'easy', ['model assumptions']),
      one('q014', '计算速率时摩尔质量 M 必须使用什么单位才能与 SI 中的 R 匹配？', [['A', 'kg·mol⁻¹'], ['B', '只写化学式不换算'], ['C', 'g 但不换算'], ['D', 'L·mol⁻¹']], 'A', '若 R 使用 J·mol⁻¹·K⁻¹，M 应使用 kg·mol⁻¹ 以保证量纲一致。', 'medium', ['units', 'rms speed']),
      one('q015', '同温度下 N₂ 与 O₂ 的均方根速率比 cᵣₘₛ(N₂)/cᵣₘₛ(O₂) 最接近……', [['A', '√(32/28)'], ['B', '√(28/32)'], ['C', '32/28'], ['D', '1']], 'A', 'cᵣₘₛ∝1/√M，因此比值为 √(M(O₂)/M(N₂))=√(32/28)。', 'hard', ['extension', 'rms speed', 'calculation'])
    ]
  },
  {
    id: 'PCHEM-L04', title: '热力学基本概念与第一定律', subject: 'physical-chemistry', chapter: 'Chapter 4 · First law', lesson: 'Thermodynamic concepts and the first law', description: '练习体系与环境、状态函数、热和功、内能、膨胀功、焓、热容与绝热过程。', tags: ['thermodynamics', 'first law', 'enthalpy', 'heat capacity'], knowledgePoints: ['system and surroundings', 'state functions', 'work sign', 'adiabatic process'], relatedNotes: ['/physical/dist/lesson-04.html'], questions: [
      one('q001', '热力学中的体系（system）是……', [['A', '研究时明确选定的物质或空间区域'], ['B', '宇宙中所有物质'], ['C', '只指容器外壁'], ['D', '只能是固体']], 'A', '体系是研究对象；体系之外通过边界与之交换能量或物质的部分是环境。', 'easy', ['system', 'surroundings']),
      one('q002', '状态函数的特点是……', [['A', '只由初态和终态决定，与路径无关'], ['B', '只由反应时间决定'], ['C', '一定等于零'], ['D', '只能用于气体']], 'A', '状态函数如 U、H、T、p、V 的变化只由状态决定。', 'easy', ['state function']),
      many('q003', '下列哪些通常是路径函数？', [['A', '热 q'], ['B', '功 w'], ['C', '内能 U'], ['D', '焓 H']], ['A', 'B'], '热和功描述能量跨边界传递的方式，依赖过程路径；U、H 是状态函数。', 'easy', ['path function', 'state function']),
      one('q004', '采用化学热力学符号约定时，第一定律写作……', [['A', 'ΔU=q+w'], ['B', 'ΔU=q−w，无论 w 定义'], ['C', 'ΔU=qw'], ['D', 'ΔU=0 对所有过程成立']], 'A', '这里 w 表示环境对体系做功；因此吸热 q>0、环境对体系做功 w>0。', 'easy', ['first law', 'sign convention']),
      one('q005', '体系膨胀对环境做功时，按上述约定 w 通常……', [['A', '小于 0'], ['B', '大于 0'], ['C', '一定等于 q'], ['D', '没有符号']], 'A', '膨胀时体系对环境做功，环境对体系做功为负，因此 w<0。', 'easy', ['expansion work']),
      one('q006', '定容且只有 pV 功时，体系吸收的热量满足……', [['A', 'qᵥ=ΔU'], ['B', 'qᵥ=ΔH'], ['C', 'qᵥ=0'], ['D', 'qᵥ=w=−ΔU']], 'A', '定容时 ΔV=0，膨胀功为零，所以热量直接改变内能。', 'easy', ['constant volume', 'internal energy']),
      one('q007', '量热法的核心是……', [['A', '用可测的温度变化和热容联系体系交换的热量'], ['B', '只观察火焰颜色'], ['C', '不需要校准仪器'], ['D', '只适用于气体']], 'A', '量热测量通过热容和温度变化建立热量收支，需要明确边界和校正。', 'easy', ['calorimetry']),
      one('q008', '焓的定义是……', [['A', 'H=U+pV'], ['B', 'H=U−pV'], ['C', 'H=q+w'], ['D', 'H=p/V']], 'A', '焓 H=U+pV，便于处理定压过程中的热效应。', 'easy', ['enthalpy']),
      one('q009', '定压且只有 pV 功时，体系吸收的热量满足……', [['A', 'qₚ=ΔH'], ['B', 'qₚ=ΔU'], ['C', 'qₚ=0'], ['D', 'qₚ=−ΔH']], 'A', '在定压且仅有 pV 功的条件下，定压热等于焓变。', 'easy', ['enthalpy', 'constant pressure']),
      one('q010', '理想气体中 Cp 与 Cv 的差异主要来自……', [['A', '定压加热还需要体系膨胀做功'], ['B', '理想气体没有内能'], ['C', '定容体积会无限增加'], ['D', 'Cp 和 Cv 完全没有区别']], 'A', '定压过程伴随体积变化，需要额外能量做膨胀功，因此 Cp>Cv。', 'medium', ['heat capacity', 'ideal gas']),
      one('q011', '可逆绝热膨胀的两个关键词是……', [['A', 'q=0 且过程可逆'], ['B', 'p=0 且 T=0'], ['C', 'V=0 且 q>0'], ['D', '只要不可逆就一定绝热']], 'A', '绝热表示 q=0；可逆是另一项过程条件，不能把绝热自动等同于可逆。', 'easy', ['adiabatic', 'reversible']),
      one('q012', '压缩过程按化学热力学约定通常有……', [['A', 'w>0，因为环境对体系做功'], ['B', 'w<0，因为体系对环境做功'], ['C', 'w=0'], ['D', 'w 只由温度决定']], 'A', '压缩时环境对体系做功，体系获得功，故 w 为正。', 'easy', ['work', 'compression']),
      tf('q013', '内能 U 是状态函数，而热 q 和功 w 不是状态函数。', true, 'U 只由状态决定；热和功是达到状态变化的不同能量传递路径。', 'easy', ['state function', 'path function']),
      one('q014', '判断一个热力学公式能否使用前，最重要的第一步是……', [['A', '先确认体系、路径条件和功的类型'], ['B', '先把所有变量设为零'], ['C', '只看公式最长不最长'], ['D', '忽略温度和体积条件']], 'A', '定容、定压、绝热、可逆等条件决定可用的关系式。', 'medium', ['problem solving', 'thermodynamics']),
      one('q015', '某过程体系吸收 q=+50 J，同时对环境做功 20 J。按 w 为环境对体系做功的约定，ΔU 为……', [['A', '+30 J'], ['B', '+70 J'], ['C', '−30 J'], ['D', '−70 J']], 'A', '体系对环境做功意味着 w=−20 J，因此 ΔU=q+w=50−20=+30 J。', 'hard', ['extension', 'first law', 'calculation'])
    ]
  },
  {
    id: 'ANA-L02', title: '基本操作与样品制备', subject: 'analytical-chemistry', chapter: 'Chapter 2 · Operations and sample preparation', lesson: 'Laboratory operations and sample preparation', description: '练习 GLP、方法验证、称量与容量器皿、标准溶液、稀释、消解和分离。', tags: ['GLP', 'sample preparation', 'volumetric glassware', 'method validation'], knowledgePoints: ['SOP', 'accuracy and precision', 'primary standard', 'dilution'], relatedNotes: ['/analytical/dist/chapter-2.html'], questions: [
      one('q001', 'GLP 的核心目标是……', [['A', '让实验过程、记录和结果可追溯、可复核'], ['B', '让所有结果都自动正确'], ['C', '取消原始记录'], ['D', '只提高仪器颜色饱和度']], 'A', '良好实验规范强调人员、仪器、操作、记录和数据完整性，使结果可追溯。', 'easy', ['GLP', 'data integrity']),
      one('q002', 'SOP 指的是……', [['A', '标准操作规范'], ['B', '样品氧化压力'], ['C', '溶剂沸点'], ['D', '统计离群点']], 'A', 'SOP 将关键操作步骤、条件和注意事项标准化，降低人员和批次差异。', 'easy', ['SOP']),
      one('q003', '实验记录本中最重要的原始数据原则是……', [['A', '及时、完整、可追溯地记录实际观察和操作'], ['B', '只保留最后计算结果'], ['C', '事后凭记忆重写'], ['D', '删除所有异常现象']], 'A', '原始记录应保留实际操作、仪器状态、观察和修改痕迹，而不是只保存漂亮的最终数字。', 'easy', ['lab notebook', 'GLP']),
      one('q004', '方法验证中的选择性主要考察……', [['A', '目标物信号能否与基质和干扰物区分'], ['B', '实验室墙面颜色'], ['C', '样品是否透明'], ['D', '称量纸品牌']], 'A', '选择性是方法在复杂基质中识别和测量目标物的能力。', 'easy', ['selectivity', 'validation']),
      one('q005', '线性度描述的是……', [['A', '响应与浓度在指定范围内的关系是否符合模型'], ['B', '天平是否水平'], ['C', '样品是否有气味'], ['D', '所有数据是否完全相同']], 'A', '线性度需在规定浓度范围和统计模型下评估，不能只看一条视觉上直的线。', 'easy', ['linearity', 'validation']),
      many('q006', '准确度与精密度的判断分别关注……', [['A', '准确度接近真值的程度'], ['B', '精密度重复结果的一致性'], ['C', '精密但有偏差是可能的'], ['D', '精密度高必然无系统误差']], ['A', 'B', 'C'], '准确度和精密度是不同性能指标；重复性好不能自动消除系统偏差。', 'medium', ['accuracy', 'precision']),
      one('q007', '灵敏度通常描述……', [['A', '校准曲线响应对浓度变化的斜率或响应变化能力'], ['B', '样品质量必然越大越好'], ['C', '只看空白颜色'], ['D', '仪器是否联网']], 'A', '灵敏度与单位浓度变化带来的响应变化有关，但不等同于选择性或检出限。', 'medium', ['sensitivity', 'validation']),
      one('q008', 'LOD 与 LOQ 的区别通常是……', [['A', 'LOD 关注可靠检出，LOQ 还要求达到规定定量性能'], ['B', '两者永远相同'], ['C', 'LOD 只用于称量'], ['D', 'LOQ 不需要精密度']], 'A', '检出限和定量限回答不同问题，LOQ 通常要求更可靠的定量准确度和精密度。', 'easy', ['LOD', 'LOQ']),
      one('q009', '方法的耐用性或鲁棒性考察……', [['A', '小幅改变条件时方法性能是否仍可接受'], ['B', '方法是否只在一个理想点有效'], ['C', '样品是否必须无水'], ['D', '结果是否可以不报告']], 'A', '鲁棒方法对温度、流速、时间等小变化不应过度敏感。', 'easy', ['robustness', 'validation']),
      one('q010', '分析天平称量时考虑空气浮力，是因为……', [['A', '空气对样品和砝码的浮力会造成表观质量偏差'], ['B', '空气会改变元素种类'], ['C', '真空中质量为零'], ['D', '浮力只存在于液体']], 'A', '精密称量中空气密度、物体体积和砝码密度会影响浮力修正。', 'medium', ['analytical balance', 'buoyancy']),
      one('q011', '容量瓶主要用于……', [['A', '配制一定体积的标准溶液或稀释液'], ['B', '直接称量固体质量'], ['C', '过滤沉淀'], ['D', '加热至沸腾']], 'A', '容量瓶在校准刻度处提供准确体积，适合定容配液。', 'easy', ['volumetric flask']),
      one('q012', '移液管和滴定管通常更接近哪种容量标记？', [['A', 'TD（量出）器具，需要考虑排出方式'], ['B', '只用于量入的烧杯'], ['C', '无刻度器具'], ['D', '一定是容量瓶']], 'A', '移液管和滴定管按量出设计，残留液膜和排液操作属于使用校准的一部分。', 'medium', ['pipette', 'burette']),
      one('q013', '一级标准物质通常应具备……', [['A', '高纯度、组成稳定、易干燥称量且反应计量明确'], ['B', '极易吸水且组成不稳定'], ['C', '颜色越深越好'], ['D', '分子量越小越好而不考虑纯度']], 'A', '一级标准物质要能准确称量并以明确计量关系制备标准溶液。', 'easy', ['primary standard', 'standard solution']),
      one('q014', '稀释计算的基本关系是……', [['A', 'C₁V₁=C₂V₂'], ['B', 'C₁+C₂=V₁+V₂'], ['C', 'C₁/V₁=C₂/V₂ 对所有操作成立'], ['D', '只看溶剂质量']], 'A', '理想稀释中溶质物质的量守恒，故 C₁V₁=C₂V₂。', 'easy', ['dilution', 'standard solution']),
      one('q015', '配制 500.0 mL、0.2000 mol·L⁻¹ Na₂CO₃ 溶液，若无水 Na₂CO₃ 的摩尔质量取 106.0 g·mol⁻¹，应称取约多少质量？', [['A', '1.060 g'], ['B', '5.300 g'], ['C', '10.60 g'], ['D', '106.0 g']], 'C', 'n=CV=0.2000×0.5000=0.1000 mol，m=nM=0.1000×106.0=10.60 g。', 'hard', ['extension', 'calculation', 'standard solution'])
    ]
  },
  {
    id: 'BIOC-L02', title: '氨基酸：侧链把骨架写成化学性格', subject: 'biochemistry', chapter: 'Chapter 2 · Amino acids', lesson: 'Amino acids and side chains', description: '练习氨基酸共同骨架、侧链分类、pKa/pI、电荷状态和残基微环境。', tags: ['amino acids', 'side chains', 'pKa', 'pI'], knowledgePoints: ['alpha-amino-acid backbone', 'classification', 'ionization', 'microenvironment'], relatedNotes: ['/biochem/dist/chapter-02.html'], questions: [
      one('q001', '标准 α-氨基酸共同的主链包括……', [['A', 'α-碳、α-氨基和 α-羧基'], ['B', '磷酸、核糖和碱基'], ['C', '脂肪酸和甘油'], ['D', '两个芳香环']], 'A', '标准 α-氨基酸的变化主要来自 R 基团，主链提供共同的连接框架。', 'easy', ['amino acid backbone'], { ...img('bioc-glycine-glycine-neutral.svg', '甘氨酸的 α-氨基酸骨架', '由 Chemical Structure Renderer 根据明确 SMILES NCC(=O)O 渲染') }),
      one('q002', 'R 基团最直接影响氨基酸的……', [['A', '疏水性、极性、电荷、体积和反应性'], ['B', '原子序数总和但不影响折叠'], ['C', '所有氨基酸都相同的主链键'], ['D', '水的沸点']], 'A', '侧链化学性格决定残基偏好的微环境、相互作用和反应性。', 'easy', ['side chain']),
      one('q003', 'Gly 不构成手性中心的原因是……', [['A', 'R=H，α-碳连接两个相同取代基'], ['B', 'Gly 没有羧基'], ['C', 'Gly 没有氮'], ['D', 'Gly 一定带负电']], 'A', '两个氢取代基使 α-碳不满足手性中心的四个不同取代基条件。', 'easy', ['glycine', 'chirality']),
      one('q004', 'L/D 构型与旋光正负号的关系是……', [['A', 'L/D 是相对构型，不直接决定旋光正负'], ['B', 'L 必然为正旋'], ['C', 'D 必然为负旋'], ['D', '两者完全没有结构意义']], 'A', 'L/D 不能替代旋光实验结果。', 'easy', ['stereochemistry']),
      many('q005', '按侧链性质分类时，下列说法正确的是……', [['A', '非极性侧链常偏好疏水核心'], ['B', '带电侧链会受 pH 影响'], ['C', '芳香侧链可参与疏水和 π 相互作用'], ['D', '分类只按单字母缩写决定']], ['A', 'B', 'C'], '分类的价值在于预测残基在蛋白质中的化学环境和可能作用。', 'medium', ['classification', 'side chains']),
      one('q006', 'pH=pKa 时，某可电离基团的质子化态与去质子化态约为……', [['A', '1:1'], ['B', '1:10'], ['C', '1:100'], ['D', '0:1']], 'A', 'Henderson–Hasselbalch 关系给出 pH=pKa 时两态比例为 1。', 'easy', ['pKa']),
      one('q007', 'pI 的定义是……', [['A', '平均净电荷为零的 pH'], ['B', '所有局部电荷都消失的 pH'], ['C', '一定等于 7 的 pH'], ['D', '所有 pKa 相等的 pH']], 'A', '等电点是平均净电荷为零，不代表分子内部没有正、负局部电荷。', 'easy', ['pI', 'net charge']),
      one('q008', '当环境 pH 高于氨基酸 pI 时，平均净电荷通常更偏向……', [['A', '负'], ['B', '正'], ['C', '绝对为零'], ['D', '无法判断任何趋势']], 'A', '较高 pH 促进去质子化；相对于 pI，分子平均净电荷趋向负。', 'easy', ['pI', 'charge state']),
      many('q009', '下列哪些属于成人常见必需氨基酸？', [['A', 'Leu'], ['B', 'Trp'], ['C', 'His'], ['D', 'Gly']], ['A', 'B', 'C'], 'Leu、Trp 和 His 属于常见成人必需氨基酸；Gly 通常不列为成人必需氨基酸。', 'medium', ['essential amino acids']),
      one('q010', '茚三酮反应中 Pro 常见的颜色表现是……', [['A', '黄色'], ['B', '蓝紫色且与所有氨基酸完全相同'], ['C', '无色且没有反应'], ['D', '金属银色']], 'A', 'Pro 是亚氨基酸，茚三酮产物常呈黄色而区别于多数 α-氨基酸。', 'easy', ['proline', 'ninhydrin']),
      one('q011', '下图苯丙氨酸骨架中的芳香环最可能带来……', [['A', '疏水和 π 相互作用倾向'], ['B', '必然的负电荷'], ['C', '肽键断裂'], ['D', '硫醇反应性']], 'A', '苯丙氨酸侧链的苯环具有疏水性和芳香相互作用潜力；此图明确不指定 L/D 构型。', 'medium', ['phenylalanine', 'aromatic'], { ...img('bioc-phenylalanine-phenylalanine-neutral.svg', '苯丙氨酸骨架，立体化学未指定', '由 Chemical Structure Renderer 根据未指定手性的明确连接关系渲染') }),
      one('q012', '含硫侧链的模型结构中，—SH 的重要化学特征是……', [['A', '硫可参与氧化还原和亲核反应'], ['B', '硫不能发生任何反应'], ['C', '—SH 必然带正电'], ['D', '它与羧基完全等价']], 'A', '半胱氨酸类硫醇可参与亲核反应、氧化成二硫键等过程。', 'medium', ['sulfur', 'cysteine'], { ...img('bioc-cysteamine-cysteamine-model-neutral.svg', '含硫侧链模型结构', '由 Chemical Structure Renderer 根据明确 SMILES NCCS 渲染') }),
      one('q013', '蛋白质内部微环境改变侧链 pKa 的原因可包括……', [['A', '邻近电荷、氢键、介电环境和溶剂暴露度'], ['B', '氨基酸名称字母顺序'], ['C', '所有残基都处于纯水中'], ['D', '只由分子量决定']], 'A', '蛋白质内部不是均一水溶液，局部环境可显著调节酸碱平衡。', 'medium', ['pKa', 'microenvironment']),
      tf('q014', '硒代半胱氨酸可视为把半胱氨酸的硫换成硒的相关氨基酸。', true, 'Sec 的硒醇化学性与 Cys 不同，并可在特殊机制下由 UGA 编码。', 'medium', ['selenocysteine']),
      one('q015', '若埋藏在疏水口袋中的 Asp 比游离状态更倾向质子化，最合理解释是……', [['A', '疏水环境不利于带负电的去质子化形式，局部 pKa 可能升高'], ['B', 'Asp 在蛋白质里不再含羧基'], ['C', '所有埋藏残基 pKa 必然为 7'], ['D', '蛋白质内部不受 pH 影响']], 'A', '低介电疏水环境可能不利于负电荷，使 Asp 的质子化状态被稳定。', 'hard', ['extension', 'Asp', 'microenvironment'])
    ]
  },
  {
    id: 'BIOC-L03', title: '蛋白质结构：从肽平面到折叠', subject: 'biochemistry', chapter: 'Chapter 3 · Protein structure', lesson: 'Protein structure and folding', description: '练习肽键部分双键、ω 角、Ramachandran 图、二级结构、三级/四级结构和结构测定。', tags: ['peptide bond', 'Ramachandran', 'secondary structure', 'folding'], knowledgePoints: ['planarity', 'backbone torsion', 'hydrogen bonds', 'structure determination'], relatedNotes: ['/biochem/dist/chapter-03.html'], questions: [
      one('q001', '肽键的部分双键性质使相邻原子呈现……', [['A', '近似平面、旋转受限的肽基单元'], ['B', '完全自由旋转的单键'], ['C', '离子晶体结构'], ['D', '无任何几何约束']], 'A', '酰胺共振使 C–N 键具有部分双键性质，肽基通常近似平面。', 'easy', ['peptide bond', 'planarity'], { ...img('bioc-gly-gly-gly-gly-peptide-neutral.svg', '甘氨酰甘氨酸的肽键结构', '由 Chemical Structure Renderer 根据明确 SMILES NCC(=O)NCC(=O)O 渲染') }),
      one('q002', '肽键平面中的 ω 角主要描述……', [['A', '肽键 C–N 周围的扭转构型'], ['B', '侧链电荷总和'], ['C', '蛋白质分子量'], ['D', '氧气结合常数']], 'A', 'ω 角反映肽键平面两侧主链原子的相对扭转，通常接近 trans 或较少见 cis。', 'medium', ['omega angle', 'backbone']),
      one('q003', '肽键 C–N 不能像普通 C–C 单键那样自由旋转，主要因为……', [['A', 'N 的孤对电子与羰基 π 系统共振离域'], ['B', 'N 没有电子'], ['C', '羰基没有氧'], ['D', '蛋白质没有主链']], 'A', '酰胺共振降低旋转自由度，使肽基具有刚性。', 'easy', ['peptide bond', 'resonance']),
      one('q004', 'Ramachandran 图主要表示……', [['A', '主链 φ/ψ 二面角的允许和受限区域'], ['B', '蛋白质的原子序数表'], ['C', '所有配体浓度'], ['D', '氨基酸的 pKa 表']], 'A', 'Ramachandran 图用空间位阻筛选主链 φ、ψ 角的可行组合。', 'easy', ['Ramachandran plot']),
      one('q005', 'Ramachandran 图中大片空白区域主要来自……', [['A', '原子间空间排斥使某些主链构象不允许'], ['B', '蛋白质没有氢原子'], ['C', '所有角度能量完全相同'], ['D', '测量仪器没有颜色']], 'A', '主链原子和侧链的空间冲突会使某些 φ/ψ 组合能量很高。', 'easy', ['Ramachandran plot', 'sterics']),
      one('q006', 'α 螺旋中典型主链氢键模式是……', [['A', '一个残基的 C=O 与约 i+4 残基的 N–H 相互作用'], ['B', '只由侧链 C–C 键形成'], ['C', '所有氢键都在同一原子内'], ['D', '必须由二硫键维持']], 'A', 'α 螺旋的主链氢键沿螺旋轴重复，常用 i→i+4 描述。', 'easy', ['alpha helix', 'hydrogen bonding']),
      one('q007', 'β 折叠的稳定主要来自……', [['A', '相邻或不同链段主链之间的氢键排列'], ['B', '只有芳香侧链'], ['C', '所有肽键都断裂'], ['D', '分子变成环烷烃']], 'A', 'β 链通过主链间氢键形成折叠片层，可为平行或反平行排列。', 'easy', ['beta sheet', 'hydrogen bonding']),
      one('q008', '二级结构与三级结构的区别是……', [['A', '二级结构是局部主链规则，三级结构是整条链的三维组织'], ['B', '二级结构只存在于 DNA'], ['C', '三级结构只由肽键决定'], ['D', '两者完全同义']], 'A', '局部 α 螺旋/β 折叠是二级结构，更大尺度的疏水、静电、氢键和二硫键组织构成三级结构。', 'easy', ['secondary structure', 'tertiary structure']),
      many('q009', '蛋白质折叠稳定性可能涉及哪些相互作用？', [['A', '疏水效应'], ['B', '氢键和静电作用'], ['C', '二硫键（在适当环境中）'], ['D', '只由肽键长度决定']], ['A', 'B', 'C'], '蛋白质折叠是多种相互作用与构象熵共同作用的结果。', 'medium', ['protein folding']),
      one('q010', '四级结构指的是……', [['A', '多个多肽亚基的空间装配'], ['B', '单个肽键的几何'], ['C', '单个氨基酸的 pKa'], ['D', '一条链的一级序列']], 'A', '四级结构描述多个独立或半独立亚基的组装和相互作用。', 'easy', ['quaternary structure']),
      one('q011', '疏水残基常在可溶性球状蛋白中偏好……', [['A', '埋在内部形成疏水核心'], ['B', '全部暴露在水中'], ['C', '只出现在 N 端'], ['D', '永远形成二硫键']], 'A', '疏水效应促使非极性侧链减少与水接触，常形成内部核心。', 'easy', ['hydrophobic core']),
      one('q012', '“折叠不是盲试”最准确的含义是……', [['A', '能量地形、序列和局部相互作用限制了可行路径'], ['B', '所有蛋白质都只有一个瞬间构象'], ['C', '折叠与序列无关'], ['D', '预测模型不需要实验验证']], 'A', '折叠受能量景观约束，但真实体系仍可能有中间态、动力学陷阱和多个状态。', 'medium', ['folding', 'energy landscape']),
      one('q013', '单晶 X 射线与溶液 NMR 的结构信息侧重点分别是……', [['A', '晶态空间结构；溶液中局部环境、动态和约束信息'], ['B', '两者都只测分子量'], ['C', 'X 射线只测 pH，NMR 只测颜色'], ['D', '两者都不提供结构信息']], 'A', '不同方法观察不同状态和时间尺度，互相补充而非简单互相替代。', 'medium', ['structure determination', 'NMR', 'X-ray']),
      tf('q014', '一级序列改变一定只会影响蛋白质外观，不会影响折叠和功能。', false, '序列改变可能改变局部相互作用、折叠稳定性、结合位点和构象平衡，进而影响功能。', 'medium', ['sequence-function']),
      one('q015', 'Proline 常使 α 螺旋出现弯折或中断，主要因为……', [['A', '其环状侧链限制主链 φ 角，并缺少可供出的普通主链 N–H'], ['B', 'Pro 没有任何碳原子'], ['C', 'Pro 总是带负电'], ['D', 'Pro 会自动形成二硫键']], 'A', 'Pro 的吡咯烷环限制主链构象，且其肽键氮通常没有可供出的 N–H，常破坏规则氢键网络。', 'hard', ['extension', 'proline', 'alpha helix'])
    ]
  },
  {
    id: 'BIOC-L04', title: '蛋白质的功能：结构、配体与构象平衡', subject: 'biochemistry', chapter: 'Chapter 4 · Protein function', lesson: 'Protein function, ligands, and conformational equilibria', description: '练习纤维蛋白、肌红蛋白、血红蛋白、协同效应、BPG、HbS 与无序蛋白。', tags: ['myoglobin', 'hemoglobin', 'allostery', 'protein function'], knowledgePoints: ['structure-function', 'cooperativity', 'P50', 'intrinsically disordered proteins'], relatedNotes: ['/biochem/dist/chapter-04.html'], questions: [
      one('q001', '蛋白质功能最合理的概括是……', [['A', '由结构、配体相互作用和构象变化共同产生'], ['B', '只由氨基酸数量决定'], ['C', '只要有酶字样就能催化'], ['D', '与环境无关']], 'A', '功能不仅来自静态结构，还来自结合、运动和状态之间的平衡。', 'easy', ['structure-function']),
      one('q002', '纤维状蛋白通常更突出……', [['A', '重复结构带来的力学或材料性质'], ['B', '可逆结合氧的单一口袋'], ['C', '四个亚基协同'], ['D', '完全无序且无重复']], 'A', '纤维状蛋白通过重复序列和规则组装形成拉伸、支撑等材料功能。', 'easy', ['fibrous proteins']),
      one('q003', '肌红蛋白（Mb）最适合被描述为……', [['A', '单亚基、具有一个主要氧结合位点的氧储存蛋白'], ['B', '四亚基协同运输蛋白'], ['C', '无配体结合位点的结构蛋白'], ['D', '只存在于细菌细胞壁']], 'A', 'Mb 通常为单体，适合储存或缓冲氧，不表现 Hb 那样的亚基协同。', 'easy', ['myoglobin']),
      one('q004', '血红蛋白（Hb）的四级结构重要性在于……', [['A', '多个亚基之间的相互作用可产生协同和别构调节'], ['B', '它只有一条多肽链'], ['C', '亚基之间不能通信'], ['D', '四级结构只决定分子量']], 'A', 'Hb 的亚基装配使一个亚基的构象变化能够影响其他亚基的配体亲和力。', 'easy', ['hemoglobin', 'quaternary structure']),
      one('q005', 'Hb 的氧结合曲线呈 S 形通常反映……', [['A', '协同结合'], ['B', '完全没有亚基相互作用'], ['C', '只存在一个固定构象'], ['D', '氧气被不可逆消耗']], 'A', 'S 形曲线是多亚基协同效应的典型表现。', 'easy', ['cooperativity']),
      one('q006', 'BPG 增加通常使 Hb 氧解离曲线……', [['A', '右移，P₅₀ 增大，释放氧更容易'], ['B', '左移，P₅₀ 减小，完全不释放氧'], ['C', '变成水平直线'], ['D', '与 Hb 没有关系']], 'A', 'BPG 稳定低亲和力状态，降低 Hb 对氧的亲和力，使曲线右移、P₅₀ 增大。', 'medium', ['BPG', 'P50', 'allostery']),
      one('q007', 'HbS 中导致镰状细胞病经典分子变化是……', [['A', 'β 链一个 Glu 被 Val 替换，改变表面疏水性'], ['B', '所有 Gly 被删除'], ['C', '血红素被完全移除'], ['D', '所有亚基变成脂质']], 'A', 'Glu→Val 的单残基替换可产生异常疏水表面并促进聚集。', 'easy', ['HbS', 'mutation']),
      one('q008', '内在无序蛋白（IDP）的特点是……', [['A', '缺少单一稳定折叠，但可通过动态构象参与调控或结合'], ['B', '完全没有氨基酸序列'], ['C', '一定不能与任何配体结合'], ['D', '只有在晶体中才存在']], 'A', '无序并不等于无功能；动态和可调的构象集合可能正是其功能基础。', 'easy', ['intrinsically disordered protein']),
      one('q009', '别构调节的核心是……', [['A', '一个位点的结合或状态变化影响另一个位点的性质'], ['B', '所有位点永远互不影响'], ['C', '只改变分子式'], ['D', '只能发生在小分子中']], 'A', '别构效应通过构象平衡和亚基/结构域耦合改变远端功能位点。', 'easy', ['allostery']),
      one('q010', 'P₅₀ 的含义通常是……', [['A', '达到半数饱和时的氧分压，反映相对亲和力'], ['B', '蛋白质质量为 50 Da'], ['C', '温度达到 50 K'], ['D', '五个亚基的数量']], 'A', 'P₅₀ 越大通常表示在相同条件下氧亲和力越低。', 'easy', ['P50', 'oxygen binding']),
      many('q011', '结构—功能分析中值得同时检查的因素包括……', [['A', '配体结合位点的化学环境'], ['B', '亚基界面和构象平衡'], ['C', '序列突变造成的表面性质变化'], ['D', '只看一张静态结构图']], ['A', 'B', 'C'], '功能解释需要把局部化学、整体装配、动态平衡和突变效应联系起来。', 'medium', ['structure-function', 'allostery']),
      tf('q012', '肌红蛋白和血红蛋白的氧结合曲线必须完全相同，因为它们都含血红素。', false, '共同含血红素不意味着结构和装配相同；Mb 单体、Hb 多亚基，协同效应不同。', 'easy', ['myoglobin', 'hemoglobin']),
      one('q013', '如果一个配体稳定蛋白质的低亲和力构象，结果通常是……', [['A', '结合曲线向较低亲和力方向移动'], ['B', '所有配体都变成共价键'], ['C', 'P₅₀ 必然减小'], ['D', '构象平衡不变']], 'A', '稳定低亲和力状态会让达到相同占据率需要更高配体浓度或分压。', 'medium', ['allostery', 'conformation']),
      one('q014', '“结构决定功能”在学习蛋白质时更好的改写是……', [['A', '结构约束功能，但功能也来自动态状态、环境和相互作用'], ['B', '只有静态晶体结构有意义'], ['C', '序列和环境都不重要'], ['D', '任何结构都能执行同一功能']], 'A', '结构—功能关系是可检验的因果链，不应被简化为静态形状决定一切。', 'medium', ['structure-function']),
      one('q015', '若组织代谢状态升高使 BPG 浓度增加，最可能的生理效果是……', [['A', 'Hb 在组织处降低氧亲和力，更有利于释放氧'], ['B', 'Hb 在组织完全锁住氧'], ['C', 'Mb 变成四聚体'], ['D', 'P₅₀ 降为零']], 'A', 'BPG 增加稳定 Hb 的低亲和力状态，曲线右移、P₅₀ 增大，从而促进组织释氧。', 'hard', ['extension', 'BPG', 'physiology'])
    ]
  }
];

function makeQuiz(set) {
  return {
    id: set.id,
    title: set.title,
    description: set.description,
    subject: set.subject,
    chapter: set.chapter,
    version: '1.0.0',
    totalPoints: set.questions.reduce((sum, question) => sum + question.points, 0),
    selection: { mode: 'fixed' },
    questions: set.questions
  };
}

function manifestEntry(set) {
  return {
    id: set.id,
    title: set.title,
    description: set.description,
    subject: set.subject,
    type: 'lesson',
    lessonNumber: Number(set.id.match(/L(\d+)/)?.[1] || 1),
    topicNumber: null,
    examNumber: null,
    chapter: set.chapter,
    lesson: set.lesson,
    questionCount: set.questions.length,
    difficulty: 'intermediate',
    tags: set.tags,
    knowledgePoints: set.knowledgePoints,
    createdAt: '2026-09-20',
    updatedAt: '2026-09-20',
    relatedNotes: set.relatedNotes,
    path: `${set.id.toLowerCase()}.json`,
    mode: 'fixed'
  };
}

for (const set of sets) {
  const body = JSON.stringify(makeQuiz(set), null, 2) + '\n';
  const distBody = body.replaceAll('assets/structure-renders/', 'assets/structures/');
  fs.writeFileSync(path.join(rootData, `${set.id.toLowerCase()}.json`), body, 'utf8');
  fs.writeFileSync(path.join(distData, `${set.id.toLowerCase()}.json`), distBody, 'utf8');
}

for (const manifestPath of [path.join(rootData, 'index.json'), path.join(distData, 'index.json')]) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const additions = sets.map(manifestEntry);
  const existing = manifest.quizzes.filter((entry) => !additions.some((item) => item.id === entry.id));
  manifest.quizzes = [...existing, ...additions];
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

console.log(`Built ${sets.length} course quiz sets with ${sets.reduce((n, set) => n + set.questions.length, 0)} questions.`);
