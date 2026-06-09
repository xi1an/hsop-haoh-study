(function () {
  window.HSOP_APP_MANIFEST = [
  {
    "appId": "corporate-guide",
    "title": "对公指南",
    "shortTitle": "对公指南",
    "category": "对公指南",
    "icon": "briefcase",
    "targets": [
      "web",
      "miniprogram"
    ],
    "webEntry": {
      "type": "native"
    },
    "miniProgramEntry": "/pages/corporate-guide/index",
    "privacyLevel": "publish-sanitized",
    "status": "已接入",
    "summary": "按客户类型和办理业务生成资料清单。",
    "detail": "保留企业/单位客户，开户、变更、销户、网银等办理分支。",
    "privacy": "公开版本不展示个人联系方式；具体资料以柜面审核为准。",
    "accent": "red"
  },
  {
    "appId": "payroll-tool",
    "title": "表格识别",
    "shortTitle": "表格识别",
    "category": "表格识别",
    "icon": "spreadsheet",
    "targets": [
      "web"
    ],
    "webEntry": {
      "type": "embedded",
      "path": "apps/payroll-tool/index.html"
    },
    "miniProgramEntry": "/pages/payroll-tool/index",
    "privacyLevel": "local-sensitive",
    "status": "网页完整",
    "summary": "导入工资表或压缩包，识别明细、预览问题并导出多张表。",
    "detail": "保留原有 JSZip/XLSX 引擎和单位词库；小程序端先保留说明入口。",
    "privacy": "导入文件只在浏览器本地读取，不进入公开产物。",
    "accent": "red"
  },
  {
    "appId": "atm-card-expiry-reminder",
    "title": "吞卡作废提醒",
    "shortTitle": "吞卡提醒",
    "category": "吞卡提醒",
    "icon": "card",
    "targets": [
      "web",
      "miniprogram"
    ],
    "webEntry": {
      "type": "embedded",
      "path": "apps/atm-card-expiry-reminder/index.html"
    },
    "miniProgramEntry": "/pages/atm-card-expiry-reminder/index",
    "privacyLevel": "local-sensitive",
    "status": "已接入",
    "summary": "录入吞卡领取日期，计算最后可处理日和作废日。",
    "detail": "支持工作日/自然日、包含当天切换、本机记录筛选和手机日历提醒导出。",
    "privacy": "银行卡号只保存在当前浏览器本机；小程序端不上传银行卡号。",
    "accent": "red"
  },
  {
    "appId": "future-tools",
    "title": "可拓展功能",
    "shortTitle": "可拓展",
    "category": "可拓展",
    "icon": "apps",
    "targets": [
      "web"
    ],
    "webEntry": {
      "type": "native"
    },
    "privacyLevel": "internal",
    "status": "可拓展",
    "summary": "以后新增应用时，从这里进入扩展中心。",
    "detail": "适合继续加入小程序、报价工具、文档模板、数据查询等个人工具。",
    "privacy": "默认按私用工具处理，发布前再清理敏感信息。",
    "accent": "dark"
  }
];
  window.hsopApps = [
  {
    "id": "corporate-guide",
    "title": "对公指南",
    "shortTitle": "对公指南",
    "category": "对公指南",
    "icon": "briefcase",
    "launchType": "native",
    "status": "已接入",
    "summary": "按客户类型和办理业务生成资料清单。",
    "detail": "保留企业/单位客户，开户、变更、销户、网银等办理分支。",
    "privacy": "公开版本不展示个人联系方式；具体资料以柜面审核为准。",
    "accent": "red"
  },
  {
    "id": "payroll-tool",
    "title": "表格识别",
    "shortTitle": "表格识别",
    "category": "表格识别",
    "icon": "spreadsheet",
    "launchType": "embedded",
    "path": "apps/payroll-tool/index.html",
    "status": "网页完整",
    "summary": "导入工资表或压缩包，识别明细、预览问题并导出多张表。",
    "detail": "保留原有 JSZip/XLSX 引擎和单位词库；小程序端先保留说明入口。",
    "privacy": "导入文件只在浏览器本地读取，不进入公开产物。",
    "accent": "red"
  },
  {
    "id": "atm-card-expiry-reminder",
    "title": "吞卡作废提醒",
    "shortTitle": "吞卡提醒",
    "category": "吞卡提醒",
    "icon": "card",
    "launchType": "embedded",
    "path": "apps/atm-card-expiry-reminder/index.html",
    "status": "已接入",
    "summary": "录入吞卡领取日期，计算最后可处理日和作废日。",
    "detail": "支持工作日/自然日、包含当天切换、本机记录筛选和手机日历提醒导出。",
    "privacy": "银行卡号只保存在当前浏览器本机；小程序端不上传银行卡号。",
    "accent": "red"
  },
  {
    "id": "future-tools",
    "title": "可拓展功能",
    "shortTitle": "可拓展",
    "category": "可拓展",
    "icon": "apps",
    "launchType": "native",
    "status": "可拓展",
    "summary": "以后新增应用时，从这里进入扩展中心。",
    "detail": "适合继续加入小程序、报价工具、文档模板、数据查询等个人工具。",
    "privacy": "默认按私用工具处理，发布前再清理敏感信息。",
    "accent": "dark"
  }
];
  window.hsopAppCategories = [
  "全部",
  "对公指南",
  "表格识别",
  "吞卡提醒",
  "可拓展"
];
}());
