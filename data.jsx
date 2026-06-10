const hsopDefaultTasks = [
  {
    id: "bank-law",
    title: "银行法：银行的设立与变更",
    module: "银行知识",
    minutes: 40,
    progress: 60,
    priority: "今天先推进",
  },
  {
    id: "economist-reading",
    title: "英语阅读：The Economist 文章精读",
    module: "英语学习",
    minutes: 30,
    progress: 0,
    priority: "晚间阅读",
  },
  {
    id: "python-list-dict",
    title: "Python 练习：List 与 Dict 综合题",
    module: "编程练习",
    minutes: 50,
    progress: 0,
    priority: "保留手感",
  },
  {
    id: "principles-note",
    title: "《原则》阅读笔记整理",
    module: "阅读笔记",
    minutes: 30,
    progress: 40,
    priority: "输出笔记",
  },
  {
    id: "bank-mock",
    title: "错题回顾：银行从业模拟题",
    module: "银行知识",
    minutes: 30,
    progress: 0,
    priority: "查漏补缺",
  },
  {
    id: "word-day45",
    title: "单词背诵：Day 45",
    module: "英语学习",
    minutes: 20,
    progress: 100,
    priority: "保持连续",
  },
];

const hsopModules = [
  {
    id: "bank",
    title: "银行知识",
    desc: "从业知识、法律法规、业务流程和错题复盘。",
    progress: 68,
    tags: ["法规", "题库", "业务流程"],
  },
  {
    id: "english",
    title: "英语学习",
    desc: "词汇、长文阅读、写作和原版内容精读。",
    progress: 62,
    tags: ["词汇", "精读", "写作"],
  },
  {
    id: "code",
    title: "编程练习",
    desc: "Python、网页基础、脚本工具和真实小项目。",
    progress: 55,
    tags: ["Python", "网页", "算法"],
  },
  {
    id: "reading",
    title: "阅读笔记",
    desc: "书单、课程摘录、思维导图和个人知识库。",
    progress: 70,
    tags: ["书单", "摘录", "复盘"],
  },
];

const hsopResources = [
  {
    type: "资料",
    name: "银行从业教材（电子版）",
    desc: "官方教材 PDF 版本，适合按章节推进。",
    date: "2026-05-10",
    task: "阅读银行从业教材重点章节",
    module: "银行知识",
  },
  {
    type: "资料",
    name: "银行从业真题汇编",
    desc: "近五年真题及解析，用来做阶段检测。",
    date: "2026-05-08",
    task: "完成银行从业真题一套",
    module: "银行知识",
  },
  {
    type: "笔记",
    name: "银行知识思维导图",
    desc: "知识点关系图，复盘时先看框架。",
    date: "2026-05-12",
    task: "复习银行知识思维导图",
    module: "银行知识",
  },
  {
    type: "工具",
    name: "Python 常用代码片段",
    desc: "常用语法、文件处理和数据处理小函数。",
    date: "2026-05-09",
    task: "整理 Python 常用代码片段",
    module: "编程练习",
  },
  {
    type: "链接",
    name: "The Economist 官网",
    desc: "英文阅读材料入口，适合做精读训练。",
    date: "2026-05-01",
    task: "精读一篇英文长文",
    module: "英语学习",
  },
];

const hsopPlan = [
  {
    day: "周一",
    focus: "银行法规",
    items: ["法规章节 40 分钟", "错题 20 分钟", "复盘 10 分钟"],
  },
  {
    day: "周二",
    focus: "英语阅读",
    items: ["单词 20 分钟", "长文精读 30 分钟", "摘录 10 分钟"],
  },
  {
    day: "周三",
    focus: "编程练习",
    items: ["Python 题 40 分钟", "代码整理 20 分钟", "提交复盘"],
  },
  {
    day: "周四",
    focus: "综合巩固",
    items: ["银行题库 30 分钟", "英语复述 20 分钟", "笔记归档"],
  },
  {
    day: "周五",
    focus: "周复盘",
    items: ["检查目标", "整理错题", "下周计划"],
  },
];

const hsopAppCategories =
  window.hsopAppCategories || ["全部", "对公指南", "表格识别", "吞卡提醒", "可拓展"];

const hsopApps = window.hsopApps || [
  {
    id: "corporate-guide",
    title: "对公指南",
    shortTitle: "对公指南",
    category: "对公指南",
    icon: "briefcase",
    launchType: "native",
    status: "已接入",
    summary: "按客户类型和办理业务生成资料清单。",
    detail: "保留企业/单位客户，开户、变更、销户、网银等办理分支。",
    privacy: "私用版本，不展示个人联系方式；具体资料以柜面审核为准。",
    accent: "red",
  },
  {
    id: "payroll-tool",
    title: "表格识别",
    shortTitle: "表格识别",
    category: "表格识别",
    icon: "spreadsheet",
    launchType: "embedded",
    path: "apps/payroll-tool/index.html",
    status: "独立工具",
    summary: "导入工资表或压缩包，识别明细、预览问题并导出多张表。",
    detail: "保留原有 JSZip/XLSX 引擎和单位词库；文件只在浏览器本地读取。",
    privacy: "不要上传真实样例到公开页面；导入文件不会离开当前浏览器。",
    accent: "red",
  },
  {
    id: "atm-card-expiry-reminder",
    title: "吞卡作废提醒",
    shortTitle: "吞卡提醒",
    category: "吞卡提醒",
    icon: "card",
    launchType: "embedded",
    path: "apps/atm-card-expiry-reminder/index.html",
    status: "独立工具",
    summary: "录入吞卡领取日期，计算最后可处理日和作废日。",
    detail: "支持工作日/自然日、包含当天切换、作废日计算和本次日历提醒导出。",
    privacy: "银行卡号仅用于本次计算；网页和小程序都不保存历史记录。",
    accent: "red",
  },
  {
    id: "future-tools",
    title: "可拓展功能",
    shortTitle: "可拓展",
    category: "可拓展",
    icon: "apps",
    launchType: "native",
    status: "可拓展",
    summary: "以后新增应用时，从这里进入扩展中心。",
    detail: "适合继续加入小程序、报价工具、文档模板、数据查询等个人工具。",
    privacy: "默认按私用工具处理，发布前再清理敏感信息。",
    accent: "dark",
  },
];

Object.assign(window, {
  hsopDefaultTasks,
  hsopModules,
  hsopResources,
  hsopPlan,
  hsopAppCategories,
  hsopApps,
});
