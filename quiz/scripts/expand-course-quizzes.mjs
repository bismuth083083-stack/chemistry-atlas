import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const quizRoot = path.resolve(here, '..');
const rootData = path.join(quizRoot, 'data');
const distData = path.join(quizRoot, 'dist', 'data');

const image = (file, alt, caption) => ({ image: { src: `assets/structure-renders/${file}`, alt, ...(caption ? { caption } : {}) } });
const one = (id, question, choices, answer, explanation, tags = [], extra = {}) => ({ id, type: 'single-choice', question, options: choices.map(([optionId, text]) => ({ id: optionId, text })), answer, points: 1, explanation, difficulty: 'medium', tags, ...extra });
const many = (id, question, choices, answers, explanation, tags = [], extra = {}) => ({ id, type: 'multiple-choice', question, options: choices.map(([optionId, text]) => ({ id: optionId, text })), answers, points: 1, explanation, difficulty: 'medium', tags, ...extra });
const tf = (id, question, answer, explanation, tags = [], extra = {}) => ({ id, type: 'true-false', question, answer, points: 1, explanation, difficulty: 'medium', tags, ...extra });
const fill = (id, question, answer, explanation, tags = [], acceptableAnswers = [], extra = {}) => ({ id, type: 'fill-in-the-blank', question, answer, acceptableAnswers, grading: { caseSensitive: false, collapseWhitespace: true }, points: 1, explanation, difficulty: 'medium', tags, ...extra });

const extraQuestions = {
  'ORG-L01': [
    one('q016', '氯甲烷中 C–Cl 键的极性方向最合理的是……', [['A', 'Cδ+–Clδ−'], ['B', 'Cδ−–Clδ+'], ['C', '没有极性'], ['D', '只能写成离子键']], 'A', '氯的电负性高于碳，共享电子密度偏向氯；这表示键极性，不等于完全电离。', ['bond polarity'], image('org-chloromethane-chloromethane-neutral.png', '氯甲烷结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES CCl 渲染')),
    many('q017', '关于共振表示，下列说法正确的是……', [['A', '原子连接关系保持不变'], ['B', '只移动电子，不移动原子核'], ['C', '真实结构可用共振杂化体描述'], ['D', '分子会在贡献式之间来回振荡']], ['A', 'B', 'C'], '共振式是同一电子结构的不同书写方式，不是不同分子之间的快速互变。', ['resonance', 'Lewis structures']),
    fill('q018', '碳原子通常通过形成多少个共价键来满足常见的八隅体？', '4', '中性四价碳在常见有机结构中通常形成四个共价键。', ['carbon valence'], ['四个', '4个']),
    tf('q019', 'London 色散力只存在于极性分子之间。', false, '色散力来自瞬时偶极，所有原子和分子都存在；分子越大、越易极化时通常越显著。', ['intermolecular forces']),
    one('q020', '根据图示骨架，选择符合最长连续碳链与最低定位号规则的名称。', [['A', '2,4-二甲基戊烷'], ['B', '3-乙基-2-甲基丁烷'], ['C', '2-异丙基丁烷'], ['D', '1,3-二甲基己烷']], 'A', '最长碳链为五个碳，两个甲基定位号为 2 和 4；不能把较短链误当作母体。', ['nomenclature', 'parent chain'], image('org-2-4-dimethylpentane-2-4-dimethylpentane-neutral.png', '支链烷烃结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES CC(C)CC(C)C 渲染')),
    fill('q021', '当一个分子同时含有极性键但整体偶极矩因几何抵消时，这种分子整体可称为____分子。', '非极性', '键偶极与分子偶极不是同一层级；几何对称可能使键偶极矢量和为零。', ['polarity'], ['无极性', 'nonpolar']),
    many('q022', '对于一个需要判断反应位点的有机分子，哪些信息应优先综合考虑？', [['A', '官能团和键极性'], ['B', '孤对电子或 π 电子的可供给性'], ['C', '空间位阻与分子几何'], ['D', '只看分子式中的碳原子数']], ['A', 'B', 'C'], '有机反应位点往往由电子效应与立体效应共同决定，单看分子式不足以判断。', ['extension', 'reactivity'])
  ],
  'INORG-L01': [
    one('q016', 'BF₃ 中心硼原子的配位数和局部几何分别最接近……', [['A', '3，三角平面'], ['B', '4，四面体'], ['C', '2，线形'], ['D', '6，八面体']], 'A', 'BF₃ 的硼与三个氟相连，基础 Lewis/VSEPR 模型给出三角平面几何。', ['coordination number', 'geometry'], image('inorg-bf3-boron-trifluoride-neutral.png', '三氟化硼结构示意图', '由 Chemical Structure Renderer 根据明确结构输入渲染')),
    many('q017', '关于无机化学中的桥联配体，下列说法正确的是……', [['A', '一个配体原子或基团可同时连接两个中心'], ['B', '桥联一定意味着两个中心完全等价'], ['C', '桥联可改变中心间电子耦合'], ['D', '桥联与配位数没有任何关系']], ['A', 'C'], '桥联描述连接拓扑，不保证中心等价；它会影响配位环境与金属—金属相互作用。', ['bridging ligand', 'coordination']),
    fill('q018', 'π 配合物中，金属与配体之间常用____作用来描述电子回馈。', 'π回馈', '金属 d 轨道向配体反键 π* 轨道供电子，常称 π 回馈或 back-donation。', ['pi complex', 'back bonding'], ['π回馈', 'π 回馈', 'pi回馈', 'back-donation']),
    tf('q019', '配位数只由配体的个数决定，与配体如何连接中心原子无关。', false, '配位数按与中心直接相连的供体原子数统计；多齿配体和桥联方式都会影响统计。', ['coordination number']),
    one('q020', '下图所示 CO₂ 结构在基础分子模型中最符合哪种描述？', [['A', '线形，中心碳附近有两个电子域'], ['B', '弯曲，中心碳有两个孤对电子'], ['C', '三角平面，中心碳有三个孤对电子'], ['D', '四面体，中心碳与四个氧相连']], 'A', 'CO₂ 的两个成键电子域位于近似相反方向；多重键在 VSEPR 计数中各作为一个电子域。', ['VSEPR', 'molecular formula'], image('inorg-carbon-dioxide-carbon-dioxide-neutral.png', '二氧化碳结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES O=C=O 渲染')),
    many('q021', '判断金属—金属多重键时，哪些证据或模型信息有帮助？', [['A', '金属—金属距离'], ['B', '成键轨道与反键轨道占据'], ['C', '配体对金属电子计数的影响'], ['D', '只看化合物颜色']], ['A', 'B', 'C'], '键级判断要结合结构距离、轨道占据与电子计数，颜色通常不能独立证明键级。', ['metal-metal bond', 'electron counting']),
    fill('q022', '如果一个配体通过多个相邻原子连续与金属结合，常用____值表示其连续配位的原子数。', '齿数', '齿数（denticity）描述一个配体向同一中心提供的直接配位供体原子数。', ['denticity', 'extension'], ['denticity'])
  ],
  'PCHEM-L01': [
    one('q016', '理想气体方程 PV=nRT 中，温度 T 必须使用……', [['A', '热力学温标'], ['B', '摄氏温标'], ['C', '华氏温标'], ['D', '任意相对温度']], 'A', '状态方程中的温度必须以开尔文等绝对温标表示。', ['ideal gas', 'temperature']),
    many('q017', '关于状态函数，下列说法正确的是……', [['A', '只由初态和终态决定'], ['B', '与具体路径无关'], ['C', '内能和焓通常作为状态函数处理'], ['D', '热和功都是状态函数']], ['A', 'B', 'C'], '热和功依赖过程路径；内能、焓等状态函数只由状态决定。', ['state function', 'path function']),
    fill('q018', '在定温、定量气体过程中，压力与体积成____比。', '反', '根据 Boyle 定律，定温定量时 PV 为常数，所以压力与体积成反比。', ['gas laws'], ['反比', 'inverse']),
    tf('q019', '偏摩尔量描述某组分加入混合物时体系广延性质的边际变化。', true, '偏摩尔量是保持其他条件不变时，加入某组分对广延性质的偏导数。', ['partial molar quantity']),
    one('q020', '一个理想气体混合物总压为 1.00 bar，某组分摩尔分数为 0.25，则其分压为……', [['A', '0.25 bar'], ['B', '0.75 bar'], ['C', '1.25 bar'], ['D', '4.00 bar']], 'A', 'Dalton 定律给出 pᵢ=xᵢP，总压乘以摩尔分数得到分压。', ['Dalton law', 'extension']),
    fill('q021', '若一个过程的终态与初态相同，则状态函数的总变化量为____。', '0', '状态函数对闭合循环的积分为零；路径上的热和功仍可能不为零。', ['state function', 'cycle'], ['零', '0']),
    many('q022', '在建立物理化学模型时，下列哪些做法能减少错误解释？', [['A', '明确系统边界和约束条件'], ['B', '检查单位与量纲'], ['C', '区分可测量量和模型假设'], ['D', '只保留最复杂的公式']], ['A', 'B', 'C'], '边界、单位和假设是模型可检验性的基础；复杂并不自动意味着正确。', ['extension', 'modeling'])
  ],
  'ANA-L01': [
    many('q016', '一个可靠的分析结果通常需要哪些配套信息？', [['A', '样品采集与处理记录'], ['B', '校准和质量控制证据'], ['C', '单位、不确定度或报告限制'], ['D', '只给出一个没有单位的数值']], ['A', 'B', 'C'], '分析结果必须能追溯到样品、方法、校准和报告条件。', ['quality assurance', 'reporting']),
    fill('q017', '空白测定用于估计分析流程本身带来的____响应。', '背景', '空白复制主要流程但不含目标分析物，用于评估试剂、容器和仪器背景。', ['blank'], ['背景', 'background']),
    one('q018', '当方法对目标物响应稳定但对共存物也有响应时，最需要关注的方法学性质是……', [['A', '选择性'], ['B', '沸点'], ['C', '颜色'], ['D', '样品名称']], 'A', '选择性衡量方法在干扰物存在下区分目标物的能力。', ['selectivity']),
    tf('q019', '精密度高就能证明测量结果没有系统误差。', false, '重复结果可以很集中但整体偏离真值；精密度不能替代准确度和偏差评估。', ['precision', 'accuracy']),
    one('q020', '某痕量分析方法在复杂基质中出现一个与目标物相同保留时间的峰，最合理的下一步是……', [['A', '用标准、空白和独立检测证据确认身份'], ['B', '立即把峰面积当成目标物含量'], ['C', '删除所有不符合预期的重复'], ['D', '只依据样品颜色确认']], 'A', '保留时间相同不足以排除共洗脱；需要空白、加标、标准或正交方法支持。', ['confirmation', 'extension']),
    fill('q021', '当信号低于方法检出限时，更严谨的报告是“低于____”，而不是“浓度为零”。', '检出限', 'LOD 以下表示当前方法不能可靠检出，不表示样品中绝对不存在目标物。', ['LOD', 'reporting'], ['LOD', '检测限', '检出限']),
    many('q022', '若要比较两个分析方法，哪些维度值得同时考察？', [['A', '准确度和精密度'], ['B', '选择性与检出能力'], ['C', '样品前处理、通量和成本'], ['D', '只比较仪器屏幕上的峰高']], ['A', 'B', 'C'], '方法选择应综合性能、样品链条和实际资源，而不是只比较单一信号。', ['method comparison', 'extension'])
  ],
  'BIOC-L01': [
    one('q016', '甘氨酸与丙氨酸在中性水溶液中都常以两性离子形式存在，关键结构特征是……', [['A', '同时含有 NH₃⁺ 与 COO⁻'], ['B', '只含有中性胺'], ['C', '只含有羧酸阴离子而无铵基'], ['D', '没有可电离基团']], 'A', '氨基酸骨架中的氨基和羧基可在水中发生质子转移，形成两性离子。', ['zwitterion', 'amino acid']),
    many('q017', '下列哪些侧链分类与常见生化语境相符？', [['A', '亮氨酸为疏水侧链'], ['B', '天冬氨酸在中性附近通常带负电倾向'], ['C', '赖氨酸侧链含可质子化胺'], ['D', '所有氨基酸侧链都芳香']], ['A', 'B', 'C'], '侧链的疏水性、酸碱性和芳香性不同，决定其在蛋白质中的角色。', ['side-chain classification']),
    fill('q018', '等电点通常记作 p____。', 'I', '等电点常写作 pI，表示净电荷平均为零的 pH 条件。', ['pI'], ['I', 'i']),
    tf('q019', '甘氨酸的侧链是氢原子，因此它没有手性中心。', true, '甘氨酸的 α 碳连接两个氢，不构成四个不同取代基。', ['glycine', 'chirality']),
    one('q020', '图示结构最适合用来说明哪类侧链化学性格？', [['A', '芳香、疏水且可参与 π 相互作用'], ['B', '带永久正电的季铵盐'], ['C', '含硫的可氧化侧链'], ['D', '只有一个羟基而无芳环']], 'A', '苯丙氨酸侧链含苯环，通常归入芳香疏水侧链；具体电离状态仍取决于环境。', ['phenylalanine', 'aromatic side chain'], image('bioc-phenylalanine-phenylalanine-neutral.png', '苯丙氨酸骨架示意图', '立体化学未指定；由 Chemical Structure Renderer 根据明确 SMILES 渲染')),
    fill('q021', '当 pH 高于某酸性侧链的 pKa 时，该侧链去质子化比例通常____。', '增加', 'Henderson–Hasselbalch 关系说明 pH 升高会推动酸性基团去质子化。', ['pKa', 'charge'], ['增加', '上升']),
    many('q022', '蛋白质序列中的侧链微环境可能改变局部 pKa，原因包括……', [['A', '邻近电荷的静电作用'], ['B', '氢键和溶剂暴露程度'], ['C', '局部介电环境'], ['D', '只由该氨基酸的分子量决定']], ['A', 'B', 'C'], '蛋白质内部环境会改变质子化平衡，不能只用游离氨基酸的 pKa 机械套用。', ['extension', 'microenvironment'])
  ],
  'ORG-L02': [
    fill('q016', '乙烯的两个碳原子通常采用____杂化来描述其局域 σ 键方向。', 'sp2', '双键碳周围近似三角平面，常用 sp² 杂化描述三个 σ 键方向。', ['hybridization'], ['sp2', 'sp²']),
    many('q017', '关于 HOMO–LUMO 相互作用，下列说法正确的是……', [['A', 'HOMO 可作为电子供体轨道'], ['B', 'LUMO 可作为电子受体轨道'], ['C', '轨道能级差较小通常有利于相互作用'], ['D', '相位对组合完全没有影响']], ['A', 'B', 'C'], '轨道能级、空间重叠和相位共同决定有效相互作用。', ['HOMO-LUMO', 'orbital interaction']),
    tf('q018', 'π 键的侧向重叠要求相关 p 轨道大致平行。', true, '平行 p 轨道的侧向重叠形成 π 成键或反键组合。', ['pi bond']),
    one('q019', 'CO₂ 整体没有净偶极矩的主要原因是……', [['A', '线形结构使两个相反方向的键偶极抵消'], ['B', 'C=O 键完全没有极性'], ['C', '氧原子没有电负性'], ['D', '分子中没有电子']], 'A', '每个 C=O 键有极性，但线形对称几何使偶极矢量相互抵消。', ['polarity']),
    one('q020', '对一个 sp³ 碳中心，最合理的局域几何描述是……', [['A', '四面体'], ['B', '三角平面'], ['C', '线形'], ['D', '正方平面']], 'A', '四个 sp³ 方向在空间中近似四面体排列。', ['geometry', 'extension']),
    fill('q021', '成键电子数为 6、反键电子数为 2 时，简单分子轨道模型给出的键级为____。', '2', '键级=(成键电子数−反键电子数)/2=(6−2)/2=2。', ['bond order', 'calculation'], ['2', '二']),
    many('q022', '选择一个反应轨道模型时，哪些因素必须同时检查？', [['A', '供体与受体能级'], ['B', '轨道空间重叠与方向'], ['C', '电子相位'], ['D', '只看两个分子的分子量']], ['A', 'B', 'C'], 'HOMO–LUMO 分析不是单纯能级排序，还需要空间与相位匹配。', ['extension', 'orbital symmetry'])
  ],
  'ORG-L03': [
    fill('q016', 'pKa = −log Ka，因此酸性增强通常对应 pKa____。', '减小', 'Ka 增大时 pKa 减小，代表更有利于失去质子。', ['pKa'], ['减小', '降低']),
    many('q017', '稳定共轭碱的常见因素包括……', [['A', '负电荷共振离域'], ['B', '吸电子诱导效应'], ['C', '负电荷位于更适合承载它的原子上'], ['D', '只要分子量大就一定稳定']], ['A', 'B', 'C'], '共轭、诱导和原子效应都能降低共轭碱能量。', ['conjugate base', 'stability']),
    tf('q018', '酸碱反应的平衡方向通常偏向形成较弱的酸和较弱的碱。', true, '比较两侧共轭酸碱的相对稳定性，是判断质子转移方向的常用方法。', ['equilibrium', 'acid-base']),
    one('q019', '在弯箭头表示中，箭头起点通常应放在……', [['A', '孤对电子或成键电子对'], ['B', '质子符号的中心'], ['C', '没有电子的原子核'], ['D', '溶剂名称上']], 'A', '弯箭头追踪电子对的移动，起点必须来自已有电子。', ['curved arrows']),
    one('q020', '图示乙酸根的两个贡献式之间，最合理的关系是……', [['A', '共振贡献式，真实结构是离域杂化体'], ['B', '两个不同化合物的酸碱平衡'], ['C', '先后发生的两步反应'], ['D', '两个互不相关的同分异构体']], 'A', '原子骨架不变、负电荷在两个氧之间离域，因此是共振表示。', ['resonance', 'extension'], image('group-acetate-resonance.png', '乙酸根的两种共振贡献式', '由 Chemical Structure Renderer 使用同一原子映射生成')),
    fill('q021', '在 Brønsted–Lowry 质子转移中，失去质子的物种称为质子____体。', '供', 'Brønsted–Lowry 酸是质子供体，碱是质子受体。', ['Bronsted-Lowry'], ['供体', '供']),
    many('q022', '若要比较两个有机酸的相对强弱，哪些证据组合最有用？', [['A', '共轭碱的共振稳定性'], ['B', '吸电子/给电子取代基效应'], ['C', '原子大小与电负性'], ['D', '只比较未电离酸的颜色']], ['A', 'B', 'C'], '酸强度来自解离热力学；共轭碱稳定性和结构效应比颜色等表面信息更关键。', ['extension', 'acid strength'])
  ],
  'ORG-L04': [
    one('q016', '下图长链支链烷烃的系统命名是……', [['A', '2,5,7,9-四甲基癸烷'], ['B', '2,4,6,8-四甲基壬烷'], ['C', '3,6,8,10-四甲基癸烷'], ['D', '4-乙基-2,5,7-三甲基壬烷']], 'A', '最长连续碳链含 10 个碳，为癸烷；从任一端编号都得到 2,5,7,9 的四个甲基定位号。', ['nomenclature', 'longest chain', 'branched alkane'], image('org-2-5-7-9-tetramethyldecane-2-5-7-9-tetramethyldecane-neutral.png', '长链四甲基癸烷结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES CC(C)CCC(C)CC(C)CC(C)C 渲染')),
    one('q017', '下图结构的系统命名是……', [['A', '4-环己基庚烷'], ['B', '1-庚基环己烷'], ['C', '4-乙基环己烷'], ['D', '4-环己基己烷']], 'A', '最长的开链部分含 7 个碳，多于环中的 6 个碳，因此以庚烷为母体，在 4 位连接环己基。', ['nomenclature', 'cycloalkyl substituent', 'parent structure'], image('org-4-cyclohexylheptane-4-cyclohexylheptane-neutral.png', '环己基取代庚烷结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES CCCC(C1CCCCC1)CCC 渲染')),
    one('q018', '下图稠合双环烷烃的系统命名是……', [['A', 'bicyclo[4.4.0]decane'], ['B', 'spiro[4.4]nonane'], ['C', 'bicyclo[3.3.1]nonane'], ['D', 'cyclodecane']], 'A', '两个桥头原子之间有三条路径，其中两条各含 4 个中间原子，第三条不含中间原子，因此为 bicyclo[4.4.0]decane。', ['nomenclature', 'fused bicyclic', 'bicyclo'], image('org-bicyclo-4-4-0-decane-bicyclo-4-4-0-decane-neutral.png', '稠合双环癸烷结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES C1CCC2CCCCC2C1 渲染')),
    many('q019', '处理长链支链烷烃和环烷基取代结构时，哪些判断可靠？', [['A', '先比较所有连续路径，确定最长母体链'], ['B', '母体链长度不能由图上“最水平”的画法决定'], ['C', '确定母体后再从正确方向比较最低定位号组'], ['D', '看到环就无条件把环作为母体']], ['A', 'B', 'C'], '母体选择由碳骨架拓扑和命名规则决定；环并不总是自动优先，必须比较环与开链部分的碳数及其他结构特征。', ['nomenclature', 'parent chain', 'cycloalkyl substituent']),
    one('q020', '下图螺环烷烃的系统命名是……', [['A', 'spiro[4.5]decane'], ['B', 'bicyclo[4.5.0]decane'], ['C', 'bicyclo[3.3.1]nonane'], ['D', 'cyclodecane']], 'A', '两个环只共享一个螺原子；从螺原子到各环的另一端分别有 4 和 5 个原子，因此为 spiro[4.5]decane。', ['nomenclature', 'spiro', 'polycycles'], image('org-spiro-4-5-decane-spiro-4-5-decane-neutral.png', '螺环癸烷结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES C1CC2(CC1)CCCCC2 渲染')),
    fill('q021', '下图金刚烷的系统命名为____。', 'tricyclo[3.3.1.1^3,7]decane', '金刚烷的系统桥环名称为 tricyclo[3.3.1.1^3,7]decane；adamantane 是保留名称。', ['nomenclature', 'adamantane', 'bridged polycycle'], ['tricyclo[3.3.1.1³,⁷]decane', 'tricyclo[3.3.1.1(3,7)]decane', '金刚烷', '三环[3.3.1.1^3,7]癸烷'], image('org-adamantane-adamantane-neutral.png', '金刚烷笼状结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES C1C2CC3CC1CC(C2)C3 渲染')),
    many('q022', '关于多环烷烃系统命名，下列说法正确的是……', [['A', 'spiro 括号中的数字统计各环中除螺原子外的原子数'], ['B', 'bicyclo 括号中的桥长按从大到小排列'], ['C', '桥环名称需要先识别桥头原子和它们之间的独立路径'], ['D', '只要分子含有两个环，就可以直接用 cycloalkane 加倍数前缀命名']], ['A', 'B', 'C'], '螺环和桥环的括号数字来自不同的拓扑计数规则；不能把所有多环体系简化为环烷烃倍数前缀。', ['extension', 'polycycles', 'spiro', 'bicyclo'])
  ],
  'ORG-L05': [
    one('q016', 'E/Z 命名中，双键两端优先级较高的基团位于相反侧时应标记为……', [['A', 'E'], ['B', 'Z'], ['C', 'R'], ['D', 'S']], 'A', 'E 来自 entgegen，表示高优先级基团位于相反侧；Z 表示同侧。', ['E/Z', 'CIP']),
    many('q017', '关于构象与构造异构，下列说法正确的是……', [['A', '单键旋转可产生构象异构'], ['B', '改变原子连接关系会产生构造异构'], ['C', '构象异构通常不需要断键'], ['D', 'E/Z 异构总是单键自由旋转造成的']], ['A', 'B', 'C'], '构象来自同一连接关系下的空间取向变化；构造异构改变连接关系。', ['conformation', 'constitutional isomer']),
    fill('q018', '正丁烷中两个甲基二面角为 180° 的构象称为____构象。', 'anti', 'anti 构象中两个较大基团相隔 180°，通常比 gauche 构象更稳定。', ['Newman projection'], ['anti']),
    tf('q019', '环己烷翻环会改变轴向与赤道向位置，但不会改变顺反关系。', true, '翻环互换 axial/equatorial，取代基相对同侧或异侧关系保持不变。', ['ring flip', 'cyclohexane']),
    one('q020', '下列哪项最能解释多取代环烷烃中优先选择赤道向取代基？', [['A', '可减少 1,3-二轴相互作用'], ['B', '赤道向一定使所有键变成 π 键'], ['C', '轴向取代基没有电子'], ['D', '赤道向会改变原子连接关系']], 'A', '较大的取代基置于赤道向通常可减少轴向拥挤和 1,3-二轴相互作用。', ['ring strain', 'extension']),
    fill('q021', '烷烃自由基卤化的选择性通常与生成的自由基____性有关。', '稳定', '更稳定的自由基中间体通常对应更有利的抽氢路径。', ['alkane reaction', 'radical'], ['稳定性', '稳定']),
    many('q022', '分析一个环状分子的立体异构时，哪些信息需要同时记录？', [['A', '取代基的相对同侧/异侧关系'], ['B', '环翻转前后的轴向/赤道向状态'], ['C', '取代基大小与构象能量'], ['D', '只记录平面结构式而忽略空间关系']], ['A', 'B', 'C'], '环构象和立体关系共同决定稳定性与命名，单一平面图可能丢失关键信息。', ['extension', 'stereochemistry'])
  ],
  'INORG-L02': [
    fill('q016', '主量子数 n 主要决定电子所在能级层的大小和____。', '能量', 'n 反映壳层尺度和能量层级；在多电子原子中还要结合其他量子数。', ['quantum numbers'], ['能量', 'energy']),
    many('q017', '关于多电子原子的轨道能级，下列说法正确的是……', [['A', '屏蔽效应会改变有效核电荷'], ['B', '穿透效应会影响轨道能量'], ['C', '同一主量子数下的轨道不一定简并'], ['D', '所有电子都感受到完整核电荷']], ['A', 'B', 'C'], '多电子相互作用使轨道能级受屏蔽和穿透影响，不再只由 n 决定。', ['shielding', 'penetration']),
    tf('q018', '磁量子数 mₗ 的允许取值范围由轨道角量子数 l 决定。', true, 'mₗ 可取 −l 到 +l 的整数值，代表同一亚层中不同空间取向。', ['quantum numbers']),
    one('q019', '沿周期从左到右，原子半径总体减小的主要原因是……', [['A', '有效核电荷增大而屏蔽变化相对有限'], ['B', '电子层数立即减少'], ['C', '核电荷逐渐减小'], ['D', '所有价电子消失']], 'A', '同一主量子层中核吸引增强，使电子云平均收缩。', ['periodic trends']),
    one('q020', '对一个多电子原子，若外层电子受到更强的有效核电荷吸引，最可能出现……', [['A', '原子半径变小、第一电离能增大'], ['B', '原子半径变大、第一电离能减小'], ['C', '半径和电离能都不变'], ['D', '电子层数自动增加']], 'A', '更强的有效核吸引通常使电子更难移除且平均距离变小。', ['effective nuclear charge', 'extension']),
    fill('q021', '泡利不相容原理要求同一原子中不能有两个电子具有完全相同的四个____数。', '量子', '每个电子的四个量子数集合必须不同。', ['Pauli principle'], ['量子', 'quantum']),
    many('q022', '判断周期趋势时，哪些因素应同时考虑？', [['A', '核电荷变化'], ['B', '电子层数变化'], ['C', '屏蔽和穿透效应'], ['D', '只看元素在页面上的位置'],], ['A', 'B', 'C'], '周期趋势是多个电子结构因素的合成结果，不是简单的二维位置记忆。', ['extension', 'periodic trends'])
  ],
  'INORG-L03': [
    one('q016', 'BF₃ 的形式电荷分析中，中心硼通常表现为……', [['A', '形式电荷为 0，但电子不足八隅体'], ['B', '形式电荷为 −3 且满足八隅体'], ['C', '形式电荷为 +3 且有四个键'], ['D', '没有中心原子']], 'A', '三条 B–F 单键的 Lewis 结构中各原子的常见形式电荷为 0，但硼只有六个共享电子。', ['formal charge', 'BF3'], image('inorg-bf3-boron-trifluoride-neutral.png', '三氟化硼结构示意图', '由 Chemical Structure Renderer 根据明确结构输入渲染')),
    many('q017', 'Lewis 结构中的形式电荷有助于……', [['A', '比较不同电子分配的合理性'], ['B', '检查总电荷守恒'], ['C', '识别可能的共振贡献式'], ['D', '直接等同于原子上的真实电荷密度']], ['A', 'B', 'C'], '形式电荷是记账工具，不等同于量子化学意义上的真实电荷分布。', ['formal charge', 'resonance']),
    fill('q018', 'VSEPR 的基本思想是电子域之间相互____。', '排斥', '中心原子周围的成键电子域和孤对电子域相互排斥并趋向最大分离。', ['VSEPR'], ['排斥', 'repel']),
    tf('q019', '共振贡献式代表同一分子在不同时间点之间来回切换。', false, '真实结构是共振杂化体；贡献式不是时间平均的分子快照。', ['resonance']),
    one('q020', 'SO₂ 的 Lewis/共振模型最适合强调哪一点？', [['A', 'S–O 电子密度可用多个贡献式描述，分子整体为弯曲几何'], ['B', '分子必为线形且没有孤对电子'], ['C', '只存在单一完全局域结构'], ['D', '硫与三个氧相连']], 'A', 'SO₂ 的中心硫有孤对电子，电子域几何与分子几何不同；S–O 键可用共振语言描述。', ['SO2', 'VSEPR', 'resonance'], image('inorg-sulfur-dioxide-sulfur-dioxide-neutral.png', '二氧化硫结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES O=S=O 渲染')),
    fill('q021', 'NO₂ 含有奇数价电子总数，因此 Lewis 模型中需要考虑一个未成对____。', '电子', 'NO₂ 是典型奇电子分子，简单八隅体表示不能让所有原子同时满足闭壳层。', ['NO2', 'radical'], ['电子', 'electron']),
    many('q022', '评估一个无机 Lewis 结构时，哪些检查最重要？', [['A', '总价电子数是否守恒'], ['B', '形式电荷是否合理'], ['C', '几何与孤对电子是否一致'], ['D', '只看是否画得对称']], ['A', 'B', 'C'], '价电子账、形式电荷与 VSEPR 几何应相互校验；对称性不是唯一标准。', ['extension', 'Lewis structure'])
  ],
  'INORG-L04': [
    one('q016', '判断一个分子是否具有反演中心，需要检查……', [['A', '任一点经中心反演后是否映射到等价点'], ['B', '是否存在任意一条键'], ['C', '是否含有氢原子'], ['D', '只看分子量']], 'A', '反演操作把每个点映射到中心另一侧等距离的对应点。', ['inversion center', 'symmetry']),
    many('q017', '下列哪些属于分子对称操作或对称元素相关概念？', [['A', 'Cₙ 旋转轴'], ['B', '镜面'], ['C', '反演中心'], ['D', '样品颜色']], ['A', 'B', 'C'], '旋转轴、镜面和反演中心是点群分析的基本语言。', ['point groups']),
    fill('q018', '绕轴旋转 360°/n 后分子重合时，该轴记作____轴。', 'Cₙ', 'n 重旋转轴 Cₙ 表示最小重复旋转角为 360°/n。', ['C_n axis'], ['Cn', 'Cₙ']),
    tf('q019', '存在一条对称轴就足以唯一确定分子的点群。', false, '点群判定还要结合镜面、反演、垂直轴和其他操作的组合。', ['point group']),
    one('q020', '对线形 CO₂，最重要的对称特征之一是……', [['A', '沿分子轴存在高阶旋转与多个镜面操作'], ['B', '只有一个 C₂ 轴且无镜面'], ['C', '分子一定属于手性点群'], ['D', '不能进行振动光谱分析']], 'A', '线形分子通常具有丰富对称操作；其振动模式还可据此讨论 IR/Raman 活性。', ['CO2', 'symmetry', 'extension'], image('inorg-carbon-dioxide-carbon-dioxide-neutral.png', '二氧化碳结构示意图', '由 Chemical Structure Renderer 根据明确 SMILES O=C=O 渲染')),
    fill('q021', '在振动光谱中，某振动模式若引起偶极矩变化，通常具有____活性。', '红外', 'IR 活性的关键是振动过程中偶极矩发生变化。', ['IR selection rule'], ['红外', 'IR']),
    many('q022', '点群判定对分子性质分析可能提供哪些信息？', [['A', '振动模式的简并性'], ['B', 'IR/Raman 选择定则'], ['C', '轨道或振动的对称适配组合'], ['D', '直接给出所有反应速率常数']], ['A', 'B', 'C'], '对称性约束表示与光谱，但不能单独决定完整动力学。', ['extension', 'spectroscopy'])
  ],
  'PCHEM-L02': [
    one('q016', '压缩因子 Z=PV/(nRT) 对理想气体等于……', [['A', '1'], ['B', '0'], ['C', 'RT'], ['D', 'P/V']], 'A', '理想气体满足 PV=nRT，所以 Z=1。', ['compressibility factor']),
    many('q017', '真实气体偏离理想行为的原因包括……', [['A', '分子间吸引'], ['B', '分子自身占据体积'], ['C', '高压或接近临界区'], ['D', '气体一定没有质量']], ['A', 'B', 'C'], '理想模型忽略分子体积和相互作用，在高密度条件下偏差更明显。', ['real gas']),
    fill('q018', 'van der Waals 方程中的 b 参数主要修正分子占据的____体积。', '有效', 'b 代表排除体积的近似修正，反映分子有限大小。', ['van der Waals'], ['有效', 'excluded']),
    tf('q019', '在临界点以上，气体可以通过单纯加压转变为清晰分开的液相。', false, '临界温度以上不存在气液两相边界，单纯加压不会产生普通意义上的相分离液体。', ['critical point']),
    one('q020', '当气体处于中等压力且吸引作用暂时占主导时，Z 通常可能……', [['A', '小于 1'], ['B', '大于 1'], ['C', '必为 0'], ['D', '无量纲但只能为 1']], 'A', '吸引使实际压力或 PV 相对理想值偏低，Z 可能小于 1；排斥主导时则可能大于 1。', ['compressibility factor', 'extension']),
    fill('q021', '临界温度是气体能够被单纯加压液化的最高____。', '温度', '高于临界温度时不存在普通气液相变边界。', ['critical phenomena'], ['温度', 'temperature']),
    many('q022', '比较真实气体模型时，哪些判断更可靠？', [['A', '检查适用压力和温度范围'], ['B', '比较模型预测与实验状态数据'], ['C', '注意参数的物理意义和单位'], ['D', '只在一个点拟合后外推所有条件']], ['A', 'B', 'C'], '模型必须在适用范围内检验，单点拟合不能保证全域可靠。', ['extension', 'model validity'])
  ],
  'PCHEM-L03': [
    fill('q016', '理想气体分子的平均平动动能与绝对温度____正比。', '成', '平均平动动能与 T 成正比，温度反映分子热运动的能量尺度。', ['kinetic theory'], ['成', '成正比']),
    many('q017', 'Maxwell 速率分布的温度升高通常会导致……', [['A', '分布峰向更高速率移动'], ['B', '分布变宽'], ['C', '平均速率增大'], ['D', '所有分子速率相同']], ['A', 'B', 'C'], '温度升高使速率分布更宽且中心向高速度方向移动，并非所有分子同速。', ['Maxwell distribution']),
    tf('q018', '气体分子碰撞本身是产生宏观压强的重要微观来源。', true, '分子与容器壁碰撞并传递动量，宏观上表现为压力。', ['pressure', 'collisions']),
    one('q019', '平均自由程主要受哪些因素控制？', [['A', '数密度和碰撞截面'], ['B', '样品颜色'], ['C', '容器标签'], ['D', '只由摩尔质量决定']], 'A', '平均自由程与分子间平均距离和有效碰撞截面有关。', ['mean free path']),
    one('q020', '若同一气体温度升高而数密度保持不变，碰撞频率的典型趋势是……', [['A', '通常增大，因为平均速度升高'], ['B', '一定降为零'], ['C', '与速度无关'], ['D', '只由气体颜色决定']], 'A', '更高温度增加平均速度，使单位时间内的碰撞机会通常增加。', ['collision frequency', 'extension']),
    fill('q021', '分子速率分布的横轴通常表示分子的____。', '速率', 'Maxwell 速率分布统计的是分子速率，而不是单一方向的速度分量。', ['Maxwell distribution'], ['速率', 'speed']),
    many('q022', '在从微观动理论推导宏观性质时，哪些假设需要明确？', [['A', '分子是否视为点粒子'], ['B', '碰撞是否近似弹性'], ['C', '是否忽略长程相互作用'], ['D', '直接把平均值当成每个分子相同的值']], ['A', 'B', 'C'], '宏观公式的适用性取决于微观假设；平均量不能误读为每个分子的确定值。', ['extension', 'kinetic theory'])
  ],
  'PCHEM-L04': [
    one('q016', '下列哪一项是状态函数？', [['A', '内能'], ['B', '热'], ['C', '功'], ['D', '摩擦路径长度']], 'A', '内能由状态决定；热和功是过程量。', ['first law', 'state function']),
    many('q017', '关于第一定律符号约定，下列说法正确的是……', [['A', '必须先声明功的正负号约定'], ['B', '同一约定下 ΔU=q+w 可保持一致'], ['C', '不同教材可能采用不同功号约定'], ['D', '符号约定可以随每一步随意改变']], ['A', 'B', 'C'], '关键是全程保持同一符号约定并清晰定义系统边界。', ['sign convention']),
    fill('q018', '定容且只做体积功时，体系吸收的热量等于内能变化____。', '量', '定容时 w=0，因此 qᵥ=ΔU；题目中的“变化量”完整写作内能变化量。', ['heat', 'internal energy'], ['量', 'ΔU']),
    tf('q019', '焓是状态函数，但在所有过程中都等于体系吸收的热量。', false, '只有特定条件（如定压且仅体积功）下 qₚ=ΔH；一般过程不能直接等同。', ['enthalpy']),
    one('q020', '理想气体自由膨胀进入真空且与环境无热交换时，最合理的结论是……', [['A', 'q=0、w=0，因此 ΔU=0'], ['B', 'q>0 且 w>0'], ['C', 'ΔU 只由体积增加决定'], ['D', '一定发生相变']], 'A', '真空无外压，膨胀功为零；绝热又使 q=0，所以第一定律给出 ΔU=0。', ['free expansion', 'extension']),
    fill('q021', '对理想气体，内能主要是温度的函数；若温度不变，ΔU 通常为____。', '0', '理想气体内能只依赖温度，等温过程中内能变化为零。', ['ideal gas', 'internal energy'], ['零', '0']),
    many('q022', '分析一个热力学过程时，哪些步骤可以减少符号错误？', [['A', '先画出系统边界'], ['B', '定义 q 和 w 的正负号'], ['C', '写出状态初末和约束条件'], ['D', '只凭“膨胀一定吸热”判断']], ['A', 'B', 'C'], '热力学判断必须以边界、约定和约束为基础，不能用单一过程直觉替代方程。', ['extension', 'thermodynamic bookkeeping'])
  ],
  'ANA-L02': [
    one('q016', '容量瓶最适合用于……', [['A', '配制已知体积和浓度的标准溶液'], ['B', '直接称量固体质量'], ['C', '强力研磨样品'], ['D', '加热至恒重']], 'A', '容量瓶的刻度和校准体积适合定容配液，不是称量或加热器皿。', ['volumetric flask']),
    many('q017', '良好实验操作（GLP）通常包括……', [['A', '记录样品和试剂批次'], ['B', '记录仪器状态和关键操作'], ['C', '保留原始数据与更改痕迹'], ['D', '只记录最终数字']], ['A', 'B', 'C'], 'GLP 强调可追溯性、完整记录和数据完整性。', ['GLP', 'traceability']),
    fill('q018', '由浓标准溶液配制低浓度溶液时，常用关系式为 C₁V₁=C₂____。', 'V₂', '稀释前后溶质的量相等，故 C₁V₁=C₂V₂。', ['dilution'], ['V2', 'V₂']),
    tf('q019', '移液管吹掉尖端残留液体可以提高所有容量器皿的准确度。', false, '是否吹液取决于器皿校准类型和制造规范；不能一概而论。', ['pipette', 'volumetric glassware']),
    one('q020', '若样品基质会堵塞仪器或造成严重基线干扰，最合理的制样策略是……', [['A', '先进行适当过滤、消解或分离，并验证回收率'], ['B', '直接稀释到不可检出'], ['C', '删去异常结果而不调查原因'], ['D', '只更换显示器颜色']], 'A', '制样要降低基质影响，同时用回收率、空白或加标实验确认处理没有损失目标物。', ['sample preparation', 'extension']),
    fill('q021', '分析天平称量时，记录的有效数字应与仪器的____分辨率相匹配。', '显示', '记录位数不能超过仪器分辨率，也不应少到丢失有用信息。', ['balance', 'significant figures'], ['显示', 'display']),
    many('q022', '验证一种样品前处理流程时，哪些实验最有信息量？', [['A', '空白实验'], ['B', '加标回收实验'], ['C', '重复制样或平行样'], ['D', '只做一次未经记录的试验']], ['A', 'B', 'C'], '空白查背景、回收查损失与基质效应、平行样查重复性，三者共同构成证据链。', ['extension', 'method validation'])
  ],
  'BIOC-L02': [
    one('q016', '氨基酸侧链的 pKa 发生变化时，最直接受影响的是……', [['A', '该残基在特定 pH 下的电荷比例'], ['B', '碳原子数自动改变'], ['C', '肽键必然断裂'], ['D', '所有蛋白质都变性']], 'A', 'pKa 改变会改变质子化平衡，从而改变侧链的平均电荷。', ['pKa', 'charge']),
    many('q017', '判断一个侧链是否适合埋藏在蛋白质内部时，可考虑……', [['A', '疏水性'], ['B', '氢键和离子相互作用潜力'], ['C', '侧链体积与堆积'], ['D', '只看单字母代码']], ['A', 'B', 'C'], '蛋白质折叠把疏水、极性、电荷和体积共同纳入空间组织。', ['side chain', 'protein folding']),
    fill('q018', '半胱氨酸的硫醇侧链可形成二硫键，氧化后的连接形式常写作____键。', '二硫', '两个半胱氨酸残基的硫原子氧化偶联形成二硫键。', ['cysteine', 'disulfide'], ['二硫', 'disulfide']),
    tf('q019', '同一个氨基酸残基在蛋白质内部和水溶液中的 pKa 必然完全相同。', false, '局部介电环境、氢键、邻近电荷和溶剂暴露都会改变有效 pKa。', ['microenvironment', 'pKa']),
    one('q020', '苯丙氨酸骨架中的苯环最可能贡献哪类相互作用？', [['A', '疏水堆积与芳香 π 相互作用'], ['B', '永久负电的磷酸基团'], ['C', '二硫键'], ['D', '肽键平面本身']], 'A', '苯环通常提供疏水表面，也可能参与芳香环之间的 π 相互作用。', ['phenylalanine', 'aromatic'], image('bioc-phenylalanine-phenylalanine-neutral.png', '苯丙氨酸骨架示意图', '立体化学未指定；由 Chemical Structure Renderer 渲染')),
    fill('q021', '若 pH 低于羧基 pKa，羧基以未解离的____形式比例更高。', 'COOH', '低于酸性基团 pKa 时，质子化的 COOH 形式比例更高。', ['acid-base', 'carboxyl'], ['COOH', '羧酸']),
    many('q022', '解释蛋白质中残基电荷时，哪些陈述更谨慎？', [['A', '应说明 pH 条件'], ['B', '要考虑局部微环境'], ['C', '净电荷是多个残基状态的合计'], ['D', '只根据游离氨基酸的颜色判断']], ['A', 'B', 'C'], '残基电荷具有条件依赖性，不能脱离 pH 和结构环境讨论。', ['extension', 'residue charge'])
  ],
  'BIOC-L03': [
    one('q016', '肽键具有部分双键性质的主要后果是……', [['A', '肽平面内旋转受限'], ['B', '所有单键都完全不能旋转'], ['C', '肽键没有极性'], ['D', '蛋白质只能形成直线']], 'A', '共振使肽键接近平面结构，ω 角旋转受到限制。', ['peptide bond', 'planarity']),
    many('q017', 'Ramachandran 图主要用于分析……', [['A', '主链 φ/ψ 二面角组合'], ['B', '构象允许区域'], ['C', '局部立体冲突'], ['D', '直接测定氨基酸序列'],], ['A', 'B', 'C'], 'Ramachandran 图反映主链构象空间，不直接给出序列。', ['Ramachandran plot']),
    fill('q018', '蛋白质二级结构中，α-螺旋和 β-折叠的主要稳定力之一是主链之间的____键。', '氢', '主链 C=O 与 N–H 之间的氢键是二级结构的重要稳定因素。', ['secondary structure'], ['氢键', '氢']),
    tf('q019', '四级结构只适用于含有多个多肽链的蛋白质复合体。', true, '四级结构描述多个独立折叠亚基的空间组装；单链蛋白没有通常意义上的四级结构。', ['quaternary structure']),
    one('q020', '甘氨酸残基在 Ramachandran 图中允许区域更宽，主要因为……', [['A', '侧链只有氢，空间位阻较小'], ['B', '它含有芳香环'], ['C', '它总是带正电'], ['D', '它没有肽键']], 'A', '甘氨酸侧链最小，因此主链二面角受到的立体阻碍较少。', ['glycine', 'extension'], image('bioc-gly-gly-gly-gly-peptide-neutral.png', '甘氨酸二肽结构示意图', '由 Chemical Structure Renderer 根据明确结构输入渲染')),
    fill('q021', '蛋白质结构从一级到四级的组织层级中，一级结构指氨基酸的____序列。', '线性', '一级结构是共价连接的氨基酸线性序列。', ['protein structure'], ['线性', 'linear']),
    many('q022', '判断一个蛋白质结构模型是否可信时，可以检查……', [['A', '键长、键角和立体冲突'], ['B', 'Ramachandran 图分布'], ['C', '实验数据与模型的独立一致性'], ['D', '只看模型渲染得是否好看']], ['A', 'B', 'C'], '结构模型要同时满足化学几何、构象合理性和实验约束。', ['extension', 'structure validation'])
  ],
  'BIOC-L04': [
    one('q016', '肌红蛋白与血红蛋白在氧结合功能上的经典差异是……', [['A', '肌红蛋白更接近单亚基、非协同结合'], ['B', '肌红蛋白由四个相同亚基组成'], ['C', '血红蛋白不能结合氧'], ['D', '二者都没有血红素']], 'A', '肌红蛋白通常作为单体储氧；血红蛋白的多亚基组装产生协同效应。', ['myoglobin', 'hemoglobin']),
    many('q017', '血红蛋白氧结合曲线发生协同变化时，哪些因素可能参与？', [['A', '亚基间构象耦合'], ['B', 'pH 和 Bohr 效应'], ['C', '2,3-BPG 对构象平衡的影响'], ['D', '只由蛋白质分子量决定']], ['A', 'B', 'C'], '配体、质子和 BPG 都能改变 T/R 构象平衡。', ['cooperativity', 'BPG']),
    fill('q018', '血红蛋白氧结合的低亲和构象常记作____态。', 'T', 'T（tense）态相对低亲和，R（relaxed）态相对高亲和。', ['T/R state'], ['T', '紧张']),
    tf('q019', '无序蛋白没有固定折叠结构，因此不可能具有生物学功能。', false, '无序区域可通过结合伙伴、翻译后修饰和构象转换发挥调控功能。', ['intrinsically disordered protein']),
    one('q020', 'HbS 的经典结构—功能联系最能说明……', [['A', '单个残基替换可通过疏水表面改变多聚与细胞性质'], ['B', '蛋白质序列变化永远不影响功能'], ['C', '血红蛋白没有亚基界面'], ['D', '所有突变只改变颜色']], 'A', 'HbS 中的点突变改变表面化学，促进异常聚集并影响红细胞性质。', ['HbS', 'structure-function', 'extension']),
    fill('q021', '配体结合使蛋白质在两种或多种构象之间重新分配，这类描述常称为构象____。', '平衡', '配体通过稳定某些构象，改变构象平衡和宏观亲和力。', ['conformational equilibrium'], ['平衡', 'conformational equilibrium']),
    many('q022', '解释蛋白质功能时，哪些层次应该联系起来？', [['A', '序列与局部化学基团'], ['B', '三维折叠与亚基界面'], ['C', '配体、环境和构象动力学'], ['D', '只看蛋白质的总原子数']], ['A', 'B', 'C'], '蛋白质功能是序列、结构、环境和动态共同作用的结果。', ['extension', 'structure-function'])
  ]
};

const difficultyFor = (index) => index < 5 ? 'easy' : index < 15 ? 'medium' : index < 19 ? 'hard' : 'challenging';
const pointsFor = (difficulty) => difficulty === 'challenging' ? 3 : difficulty === 'hard' ? 2 : 1;

function prepare(quiz, extras) {
  const existing = quiz.questions.filter((question) => !extras.some((item) => item.id === question.id));
  const questions = [...existing, ...extras].slice(0, 22).map((question, index) => {
    const difficulty = difficultyFor(index);
    return { ...question, id: `q${String(index + 1).padStart(3, '0')}`, difficulty, points: pointsFor(difficulty) };
  });
  if (questions.length !== 22) throw new Error(`${quiz.id} has ${questions.length} questions after expansion`);
  return { ...quiz, questions, questionCount: questions.length, totalPoints: questions.reduce((sum, question) => sum + question.points, 0), updatedAt: '2026-09-20' };
}

const rootIndexPath = path.join(rootData, 'index.json');
const rootIndex = JSON.parse(fs.readFileSync(rootIndexPath, 'utf8'));
for (const entry of rootIndex.quizzes) {
  const extras = extraQuestions[entry.id];
  if (!extras) continue;
  const sourcePath = path.join(rootData, entry.path);
  const quiz = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
  const expanded = prepare(quiz, extras);
  const body = JSON.stringify(expanded, null, 2) + '\n';
  const distBody = body.replaceAll('assets/structure-renders/', 'assets/structures/');
  fs.writeFileSync(sourcePath, body, 'utf8');
  fs.writeFileSync(path.join(distData, entry.path), distBody, 'utf8');
  entry.questionCount = expanded.questions.length;
  entry.updatedAt = expanded.updatedAt;
}

fs.writeFileSync(rootIndexPath, JSON.stringify(rootIndex, null, 2) + '\n', 'utf8');
const distIndexPath = path.join(distData, 'index.json');
const distIndex = JSON.parse(fs.readFileSync(distIndexPath, 'utf8'));
for (const entry of distIndex.quizzes) {
  const source = rootIndex.quizzes.find((item) => item.id === entry.id);
  if (source) { entry.questionCount = source.questionCount; entry.updatedAt = source.updatedAt; }
}
fs.writeFileSync(distIndexPath, JSON.stringify(distIndex, null, 2) + '\n', 'utf8');

console.log(`Expanded ${rootIndex.quizzes.length} course quizzes to 22 questions each.`);
