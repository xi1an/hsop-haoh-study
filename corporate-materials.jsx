const corporateCustomerTypes = [
  {
    id: 'enterprise',
    label: '企业客户',
    description: '企业、公司、个体工商户等',
    icon: 'building',
  },
  {
    id: 'organization',
    label: '单位客户',
    description: '机关、事业单位、社会团体等',
    icon: 'landmark',
  },
];

const corporateBusinessOptions = [
  {
    id: 'open',
    label: '开户',
    description: '对公账户开立',
  },
  {
    id: 'change',
    label: '变更',
    description: '信息变更、证件更新',
  },
  {
    id: 'close',
    label: '销户',
    description: '对公账户销户',
  },
  {
    id: 'ebank',
    label: '网银',
    description: '开通、变更、注销网银功能',
  },
];

const corporateGuideData = {
  enterprise: {
    open: {
      openQuestion: {
        title: '是否已在其他银行开立基本存款账户？',
        description: '如已开立基本存款账户，本次通常按一般存款账户开户资料准备。',
        options: [
          {
            id: 'basic',
            label: '否，未开立过',
            description: '按基本存款账户开户资料准备',
            resultLabel: '基本存款账户开户',
          },
          {
            id: 'general',
            label: '是，已开立过',
            description: '按一般存款账户开户资料准备',
            resultLabel: '一般存款账户开户',
          },
        ],
      },
      branchQuestion: {
        title: '请选择客户主体类型',
        description: '请根据营业执照名称判断属于个体工商户还是公司或企业。',
        rule: '营业执照名称后缀带有“公司”等字样的，一般选择“公司或企业”；未带有“公司”字样且为个体工商户的，选择“个体工商户”。',
      },
      branches: [
        {
          id: 'individual',
          label: '个体工商户开户',
          description: '营业执照名称通常不带“公司”字样',
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '营业执照正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '经营者有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'seal',
              title: '印章及印鉴资料',
              icon: 'seal',
              items: [
                { text: '经公安机关备案的单位印章' },
                { text: '单位公章、财务专用章、经营者名章' },
              ],
            },
            {
              id: 'extra',
              title: '现场核实',
              icon: 'extra',
              items: [
                { text: '提前制作好公司门牌' },
                { text: '银行人员上门拍照', note: '如有疑问，请以柜面或内部咨询口径为准' },
              ],
            },
          ],
        },
        {
          id: 'company',
          label: '公司或企业开户',
          description: '营业执照名称后缀带有“公司”等字样',
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '公司章程', note: '需带有市场监督管理部门电子水印' },
                { text: '营业执照正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '法定代表人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'shareholders',
              title: '股东资料',
              icon: 'shareholders',
              items: [
                { text: '持股比例25%以上自然人股东有效身份证件原件' },
                { text: '控股法人股东营业执照正本复印件2份', note: '存在其他公司控股时提供，复印件请使用A4纸' },
              ],
            },
            {
              id: 'seal',
              title: '印章及印鉴资料',
              icon: 'seal',
              items: [
                { text: '经公安机关备案的单位印章' },
                { text: '单位公章、财务专用章、法定代表人名章' },
              ],
            },
            {
              id: 'extra',
              title: '现场核实',
              icon: 'extra',
              items: [
                { text: '提前制作好公司门牌' },
                { text: '银行人员上门拍照', note: '如有疑问，请以柜面或内部咨询口径为准' },
              ],
            },
          ],
        },
      ],
      notes: ['开户前请确认实际经营地址与门牌地址一致。'],
    },
    change: {
      changeOptions: [
        { id: 'name', label: '企业名称', description: '营业执照名称或账户户名变更' },
        { id: 'address', label: '地址', description: '注册地址、经营地址等信息变更' },
        { id: 'legal-person', label: '法定代表人', description: '法定代表人信息变更' },
        { id: 'contact', label: '联系方式', description: '联系电话等联系方式变更' },
        { id: 'registered-capital', label: '注册资本', description: '注册资本信息变更' },
        { id: 'business-scope', label: '经营范围', description: '经营范围信息变更' },
      ],
      changeMaterials: {
        generic: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '营业执照正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '法定代表人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
          ],
          notes: ['地址、联系方式、注册资本、经营范围变更按通用变更资料准备。'],
        },
        name: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '变更后营业执照正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '法定代表人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'seal',
              title: '印鉴变更材料',
              icon: 'seal',
              items: [
                { text: '旧预留印鉴', note: '旧公章、旧财务章' },
                { text: '新预留印鉴', note: '新公章、新财务章' },
                { text: '旧章缴销证明', note: '旧公章、旧财务章无法提供的，需提供对应缴销证明' },
                { text: '印章遗失登报证明', note: '旧章遗失无法提供的，需提供市级以上报纸登报遗失声明；可在支付宝首页搜索“登报点点”自行登报' },
              ],
            },
          ],
          notes: [],
        },
        legalPerson: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '营业执照正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '变更后法定代表人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'seal',
              title: '印鉴变更材料',
              icon: 'seal',
              items: [
                { text: '旧预留印鉴', note: '旧法人章' },
                { text: '新预留印鉴', note: '新法人章' },
                { text: '原法定代表人名章缴销证明原件', note: '原名章已缴销或无法提供时提供' },
                { text: '印章遗失登报证明', note: '旧章遗失无法提供的，需提供市级以上报纸登报遗失声明；可在支付宝首页搜索“登报点点”自行登报' },
              ],
            },
          ],
          notes: [],
        },
        nameAndLegal: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '变更后营业执照正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '变更后法定代表人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'seal',
              title: '印鉴变更材料',
              icon: 'seal',
              items: [
                { text: '旧预留印鉴', note: '旧公章、旧财务章、旧法人章' },
                { text: '新预留印鉴', note: '新公章、新财务章、新法人章' },
                { text: '旧章缴销证明', note: '旧公章、旧财务章、旧法人章均无法提供的，需提供对应缴销证明' },
                { text: '印章遗失登报证明', note: '旧章遗失无法提供的，需提供市级以上报纸登报遗失声明；可在支付宝首页搜索“登报点点”自行登报' },
              ],
            },
          ],
          notes: ['同时变更企业名称和法定代表人时，请按旧三章和新三章准备印鉴资料。'],
        },
      },
      notes: ['其他变更事项可能涉及补充资料，请以柜面审核为准。'],
    },
    close: {
      closeQuestion: {
        title: '您在我行开立的账户类型是？',
        description: '请选择本次需要销户的账户类型。',
        options: [
          {
            id: 'basic',
            label: '基本账户',
            description: '基本存款账户销户前需确认其他银行账户状态',
            resultLabel: '基本账户销户',
          },
          {
            id: 'general',
            label: '一般账户',
            description: '一般存款账户按销户资料准备',
            resultLabel: '一般账户销户',
          },
        ],
      },
      otherAccountsQuestion: {
        title: '其他银行账户是否已全部注销？',
        description: '办理基本账户销户前，请确认在其他银行开立的相关账户是否已全部注销。',
        options: [
          { id: 'yes', label: '是，已全部注销', description: '继续查看基本账户销户资料' },
          { id: 'no', label: '否，未全部注销', description: '暂不办理基本账户销户' },
        ],
      },
      groups: [
        {
          id: 'base',
          title: '证照及身份证明材料',
          icon: 'base',
          items: [
            { text: '营业执照正本原件及复印件2份', note: '营业执照已注销的可不提供；复印件请使用A4纸' },
            { text: '法定代表人有效身份证件原件' },
            { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
            { text: '开户许可证或基本存款账户信息' },
          ],
        },
        {
          id: 'seal',
          title: '印章及印鉴资料',
          icon: 'seal',
          items: [
            { text: '单位公章、财务专用章、法定代表人名章' },
          ],
        },
      ],
      notes: ['销户前请确认账户相关业务已处理完毕。'],
    },
    ebank: {
      ebankQuestion: {
        title: '请选择网银业务类型',
        description: '请根据本次办理事项选择对应资料清单。',
        options: [
          { id: 'open', label: '开户', description: '开通企业网银功能', resultLabel: '网银开户' },
          { id: 'change', label: '变更', description: '变更企业网银信息或操作员', resultLabel: '网银变更' },
          { id: 'cancel', label: '注销', description: '注销企业网银功能', resultLabel: '网银注销' },
        ],
      },
      groups: [
        {
          id: 'base',
          title: '证照及身份证明材料',
          icon: 'base',
          items: [
            { text: '营业执照正本原件及复印件2份', note: '复印件请使用A4纸' },
            { text: '开户许可证或基本存款账户信息' },
            { text: '法定代表人有效身份证件原件' },
            { text: '2名网银操作员有效身份证件原件' },
          ],
        },
        {
          id: 'seal',
          title: '印章及印鉴资料',
          icon: 'seal',
          items: [
            { text: '单位公章、财务专用章、法定代表人名章' },
          ],
        },
      ],
      notes: ['适用于企业开通、变更、注销网银功能。'],
    },
  },
  organization: {
    open: {
      openQuestion: {
        title: '是否已在其他银行开立基本存款账户？',
        description: '如已开立基本存款账户，本次通常按一般存款账户开户资料准备。',
        options: [
          {
            id: 'basic',
            label: '否，未开立过',
            description: '按基本存款账户开户资料准备',
            resultLabel: '基本存款账户开户',
          },
          {
            id: 'general',
            label: '是，已开立过',
            description: '按一般存款账户开户资料准备',
            resultLabel: '一般存款账户开户',
          },
        ],
      },
      groups: [
        {
          id: 'approval',
          title: '审批资料',
          icon: 'approval',
          items: [
            { text: '财政部门出具的同意开户函' },
          ],
        },
        {
          id: 'base',
          title: '证照及身份证明材料',
          icon: 'base',
          items: [
            { text: '法人资格登记证书正本原件及复印件2份', note: '复印件请使用A4纸' },
            { text: '法定代表人或负责人有效身份证件原件' },
            { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
          ],
        },
        {
          id: 'seal',
          title: '印章及印鉴资料',
          icon: 'seal',
          items: [
            { text: '经公安机关备案的单位印章' },
            { text: '单位公章、财务专用章、法定代表人或负责人名章' },
          ],
        },
      ],
      notes: ['单位客户开户前请先准备同意开户的函。'],
    },
    change: {
      changeOptions: [
        { id: 'name', label: '单位名称', description: '登记证书名称或账户户名变更' },
        { id: 'address', label: '地址', description: '注册地址、办公地址等信息变更' },
        { id: 'legal-person', label: '负责人', description: '法定代表人或负责人信息变更' },
        { id: 'contact', label: '联系方式', description: '联系电话等联系方式变更' },
        { id: 'registered-capital', label: '注册资本', description: '开办资金等登记信息变更' },
        { id: 'business-scope', label: '经营范围', description: '业务范围等登记信息变更' },
      ],
      changeMaterials: {
        generic: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '法人资格登记证书正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '法定代表人或负责人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
          ],
          notes: ['地址、联系方式、注册资本、经营范围变更按通用变更资料准备。'],
        },
        name: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '变更后法人资格登记证书正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '法定代表人或负责人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'seal',
              title: '印鉴变更材料',
              icon: 'seal',
              items: [
                { text: '旧预留印鉴', note: '旧公章、旧财务章' },
                { text: '新预留印鉴', note: '新公章、新财务章' },
                { text: '旧章缴销证明', note: '旧公章、旧财务章无法提供的，需提供对应缴销证明' },
                { text: '印章遗失登报证明', note: '旧章遗失无法提供的，需提供市级以上报纸登报遗失声明；可在支付宝首页搜索“登报点点”自行登报' },
              ],
            },
          ],
          notes: [],
        },
        legalPerson: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '法人资格登记证书正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '变更后法定代表人或负责人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'seal',
              title: '印鉴变更材料',
              icon: 'seal',
              items: [
                { text: '旧预留印鉴', note: '旧负责人章' },
                { text: '新预留印鉴', note: '新负责人章' },
                { text: '原负责人名章缴销证明原件', note: '原名章已缴销或无法提供时提供' },
                { text: '印章遗失登报证明', note: '旧章遗失无法提供的，需提供市级以上报纸登报遗失声明；可在支付宝首页搜索“登报点点”自行登报' },
              ],
            },
          ],
          notes: [],
        },
        nameAndLegal: {
          groups: [
            {
              id: 'base',
              title: '证照及身份证明材料',
              icon: 'base',
              items: [
                { text: '变更后法人资格登记证书正本原件及复印件2份', note: '复印件请使用A4纸' },
                { text: '开户许可证或基本存款账户信息' },
                { text: '变更后法定代表人或负责人有效身份证件原件' },
                { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
              ],
            },
            {
              id: 'seal',
              title: '印鉴变更材料',
              icon: 'seal',
              items: [
                { text: '旧预留印鉴', note: '旧公章、旧财务章、旧负责人章' },
                { text: '新预留印鉴', note: '新公章、新财务章、新负责人章' },
                { text: '旧章缴销证明', note: '旧公章、旧财务章、旧负责人章均无法提供的，需提供对应缴销证明' },
                { text: '印章遗失登报证明', note: '旧章遗失无法提供的，需提供市级以上报纸登报遗失声明；可在支付宝首页搜索“登报点点”自行登报' },
              ],
            },
          ],
          notes: ['同时变更单位名称和负责人时，请按旧三章和新三章准备印鉴资料。'],
        },
      },
      notes: ['其他变更事项可能涉及补充资料，请以柜面审核为准。'],
    },
    close: {
      closeQuestion: {
        title: '您在我行开立的账户类型是？',
        description: '请选择本次需要销户的账户类型。',
        options: [
          {
            id: 'basic',
            label: '基本账户',
            description: '基本存款账户销户前需确认其他银行账户状态',
            resultLabel: '基本账户销户',
          },
          {
            id: 'general',
            label: '一般账户',
            description: '一般存款账户按销户资料准备',
            resultLabel: '一般账户销户',
          },
        ],
      },
      otherAccountsQuestion: {
        title: '其他银行账户是否已全部注销？',
        description: '办理基本账户销户前，请确认在其他银行开立的相关账户是否已全部注销。',
        options: [
          { id: 'yes', label: '是，已全部注销', description: '继续查看基本账户销户资料' },
          { id: 'no', label: '否，未全部注销', description: '暂不办理基本账户销户' },
        ],
      },
      groups: [
        {
              id: 'base',
          title: '证照及身份证明材料',
          icon: 'base',
          items: [
            { text: '法人资格登记证书正本原件及复印件2份', note: '登记证书已注销的可不提供；复印件请使用A4纸' },
            { text: '法定代表人或负责人有效身份证件原件' },
            { text: '经办人有效身份证件原件', note: '委托经办人办理时提供' },
            { text: '开户许可证或基本存款账户信息' },
          ],
        },
        {
          id: 'seal',
          title: '印章及印鉴资料',
          icon: 'seal',
          items: [
            { text: '单位公章、财务专用章、法定代表人或负责人名章' },
          ],
        },
      ],
      notes: ['销户前请确认账户相关业务已处理完毕。'],
    },
    ebank: {
      ebankQuestion: {
        title: '请选择网银业务类型',
        description: '请根据本次办理事项选择对应资料清单。',
        options: [
          { id: 'open', label: '开户', description: '开通单位网银功能', resultLabel: '网银开户' },
          { id: 'change', label: '变更', description: '变更单位网银信息或操作员', resultLabel: '网银变更' },
          { id: 'cancel', label: '注销', description: '注销单位网银功能', resultLabel: '网银注销' },
        ],
      },
      groups: [
        {
          id: 'note',
          title: '办理范围',
          icon: 'note',
          items: [
            { text: '目前单位客户开通网银仅支持单位工会账户开通' },
          ],
        },
        {
          id: 'base',
          title: '证照及身份证明材料',
          icon: 'base',
          items: [
            { text: '法人资格登记证书正本原件及复印件2份', note: '复印件请使用A4纸' },
            { text: '开户许可证或基本存款账户信息' },
            { text: '法定代表人或负责人有效身份证件原件' },
            { text: '2名网银操作员有效身份证件原件' },
          ],
        },
        {
          id: 'seal',
          title: '印章及印鉴资料',
          icon: 'seal',
          items: [
            { text: '单位公章、财务专用章、法定代表人或负责人名章' },
          ],
        },
      ],
      notes: ['适用于单位客户开通、变更、注销网银功能。'],
    },
  },
};

Object.assign(window, {
  corporateCustomerTypes,
  corporateBusinessOptions,
  corporateGuideData,
});
