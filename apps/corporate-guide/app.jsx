const { useEffect, useState } = React;

function CorporateGuideRoot() {
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <>
      <CorporateGuideApp onToast={setToast} />
      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}

function CorporateGuideApp({ onToast }) {
  const [customerType, setCustomerType] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [openAccountType, setOpenAccountType] = useState("");
  const [branchId, setBranchId] = useState("");
  const [closeAccountType, setCloseAccountType] = useState("");
  const [otherAccountsClosed, setOtherAccountsClosed] = useState("");
  const [ebankAction, setEbankAction] = useState("");
  const [changeItems, setChangeItems] = useState([]);
  const [changeConfirmed, setChangeConfirmed] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  const customer = window.corporateCustomerTypes.find((item) => item.id === customerType);
  const business = window.corporateBusinessOptions.find((item) => item.id === businessType);
  const currentGuide = customerType && businessType
    ? window.corporateGuideData[customerType]?.[businessType]
    : null;

  function resetAll() {
    setCustomerType("");
    setBusinessType("");
    setOpenAccountType("");
    setBranchId("");
    setCloseAccountType("");
    setOtherAccountsClosed("");
    setEbankAction("");
    setChangeItems([]);
    setChangeConfirmed(false);
    setCheckedItems({});
  }

  function selectCustomer(id) {
    setCustomerType(id);
    setBusinessType("");
    setOpenAccountType("");
    setBranchId("");
    setCloseAccountType("");
    setOtherAccountsClosed("");
    setEbankAction("");
    setChangeItems([]);
    setChangeConfirmed(false);
    setCheckedItems({});
  }

  function selectBusiness(id) {
    setBusinessType(id);
    setOpenAccountType("");
    setBranchId("");
    setCloseAccountType("");
    setOtherAccountsClosed("");
    setEbankAction("");
    setChangeItems([]);
    setChangeConfirmed(false);
    setCheckedItems({});
  }

  function toggleChecklist(key) {
    setCheckedItems((current) => ({ ...current, [key]: !current[key] }));
  }

  function toggleChangeItem(id) {
    setChangeItems((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  const stepContent = getCorporateStepContent({
    customerType,
    businessType,
    currentGuide,
    openAccountType,
    branchId,
    closeAccountType,
    otherAccountsClosed,
    ebankAction,
    changeItems,
    changeConfirmed,
    setOpenAccountType,
    setBranchId,
    setCloseAccountType,
    setOtherAccountsClosed,
    setEbankAction,
    toggleChangeItem,
    setChangeConfirmed,
    onToast,
  });

  if (!customerType) {
    return (
      <CorporateShell customer={customer} business={business} onReset={resetAll}>
        <ChoicePanel
          kicker="第一步"
          title="请选择客户类型"
          description="不同客户类型，所需资料可能有所不同。"
          options={window.corporateCustomerTypes}
          onSelect={selectCustomer}
        />
      </CorporateShell>
    );
  }

  if (!businessType) {
    return (
      <CorporateShell customer={customer} business={business} onReset={resetAll}>
        <ChoicePanel
          kicker="第二步"
          title="请选择办理业务"
          description={`当前客户类型：${customer?.label ?? ""}`}
          options={window.corporateBusinessOptions}
          onSelect={selectBusiness}
        />
      </CorporateShell>
    );
  }

  if (stepContent) {
    return (
      <CorporateShell customer={customer} business={business} onReset={resetAll}>
        {stepContent}
      </CorporateShell>
    );
  }

  const guideResult = buildCorporateGuideResult({
    currentGuide,
    businessType,
    openAccountType,
    branchId,
    closeAccountType,
    ebankAction,
    changeItems,
  });
  const total = guideResult.groups.reduce((sum, group) => sum + group.items.length, 0);
  const done = guideResult.groups.reduce(
    (sum, group) =>
      sum + group.items.filter((item) => checkedItems[getChecklistKey(group.id, item.text)]).length,
    0
  );

  return (
    <CorporateShell customer={customer} business={business} onReset={resetAll}>
      <section className="corporate-result">
        <div className="screen-header">
          <div>
            <p className="screen-kicker">资料清单</p>
            <h1>{guideResult.title}</h1>
            <p className="screen-copy">
              {guideResult.detail || `${customer?.label ?? ""} · ${business?.label ?? ""}`}。已勾选 {done} / {total} 项。
            </p>
          </div>
          <button className="secondary-button" type="button" onClick={resetAll}>
            重新选择
          </button>
        </div>
        <div className="corporate-progress">
          <div className="progress-line">
            <span>资料准备进度</span>
            <strong>{total ? Math.round((done / total) * 100) : 0}%</strong>
          </div>
          <div className="bar" aria-hidden="true">
            <span style={{ width: `${total ? (done / total) * 100 : 0}%` }}></span>
          </div>
        </div>
        <div className="corporate-groups">
          {guideResult.groups.map((group) => (
            <article className="corporate-group" key={group.id}>
              <h3>{group.title}</h3>
              <div className="corporate-checklist">
                {group.items.map((item) => {
                  const key = getChecklistKey(group.id, item.text);
                  return (
                    <label className="corporate-check" key={key}>
                      <input
                        type="checkbox"
                        checked={Boolean(checkedItems[key])}
                        onChange={() => toggleChecklist(key)}
                      />
                      <span className="material-copy">
                        <strong className="material-title">{item.text}</strong>
                        {item.note && <small className="material-note">{sanitizeCorporateNote(item.note)}</small>}
                      </span>
                    </label>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
        {guideResult.notes.length > 0 && (
          <div className="corporate-notes">
            <h3>办理提示</h3>
            {guideResult.notes.map((note) => (
              <p key={note}>{sanitizeCorporateNote(note)}</p>
            ))}
          </div>
        )}
      </section>
    </CorporateShell>
  );
}

function CorporateShell({ customer, business, onReset, children }) {
  const steps = [
    { id: "customer", text: "选择客户类型", done: Boolean(customer) },
    { id: "business", text: "选择办理业务", done: Boolean(business) },
    { id: "materials", text: "查看所需资料", done: Boolean(customer && business) },
    { id: "prepare", text: "准备办理", done: false },
  ];

  return (
    <section className="screen corporate-screen" data-screen-label="HSOP 对公业务资料指南">
      <div className="corporate-mini-header">
        <span className="mini-back ghost">‹</span>
        <strong>{business ? "资料清单" : "对公业务资料指南"}</strong>
        <span className="mini-back ghost">‹</span>
      </div>
      <div className="corporate-mini-hero">
        <div>
          <h1>便捷准备 高效办理</h1>
          <p className="service-calligraphy">为人民服务</p>
          <p>提前了解所需资料，一次备齐，减少往返。</p>
        </div>
      </div>
      <div className="corporate-service-note">
        本指南为个人整理的内部辅助工具。如有疑问，请以柜面审核或内部咨询口径为准。
      </div>
      <div className="corporate-steps" aria-label="办理流程">
        <h2>办理流程</h2>
        <div className="corporate-step-grid">
          {steps.map((step, index) => (
            <div className={`corporate-step ${step.done ? "done" : ""}`} key={step.id}>
              <span>{index + 1}</span>
              <strong>{step.text}</strong>
            </div>
          ))}
        </div>
      </div>
      <div className="corporate-toolbar">
        <div className="corporate-trail">
          <span className={customer ? "done" : ""}>客户类型：{customer?.label ?? "未选择"}</span>
          <span className={business ? "done" : ""}>业务类型：{business?.label ?? "未选择"}</span>
        </div>
        {(customer || business) && (
          <button className="secondary-button" type="button" onClick={onReset}>
            从头选择
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function ChoicePanel({ kicker, title, description, options, onSelect }) {
  return (
    <section className="choice-panel">
      <p className="screen-kicker">{kicker}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="choice-grid-portal">
        {options.map((option) => (
          <button className="choice-card-portal" key={option.id} type="button" onClick={() => onSelect(option.id)}>
            <span className="choice-title">{option.label}</span>
            <span className="choice-desc">{option.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function getCorporateStepContent(params) {
  const {
    customerType,
    businessType,
    currentGuide,
    openAccountType,
    branchId,
    closeAccountType,
    otherAccountsClosed,
    ebankAction,
    changeItems,
    changeConfirmed,
    setOpenAccountType,
    setBranchId,
    setCloseAccountType,
    setOtherAccountsClosed,
    setEbankAction,
    toggleChangeItem,
    setChangeConfirmed,
    onToast,
  } = params;

  if (!customerType || !businessType || !currentGuide) return null;

  if (currentGuide.openQuestion && !openAccountType) {
    return (
      <ChoicePanel
        kicker="开户判断"
        title={currentGuide.openQuestion.title}
        description={currentGuide.openQuestion.description}
        options={currentGuide.openQuestion.options}
        onSelect={setOpenAccountType}
      />
    );
  }

  if (currentGuide.branchQuestion && openAccountType && !branchId) {
    return (
      <ChoicePanel
        kicker="主体类型"
        title={currentGuide.branchQuestion.title}
        description={currentGuide.branchQuestion.rule || currentGuide.branchQuestion.description}
        options={currentGuide.branches ?? []}
        onSelect={setBranchId}
      />
    );
  }

  if (currentGuide.closeQuestion && !closeAccountType) {
    return (
      <ChoicePanel
        kicker="销户判断"
        title={currentGuide.closeQuestion.title}
        description={currentGuide.closeQuestion.description}
        options={currentGuide.closeQuestion.options}
        onSelect={setCloseAccountType}
      />
    );
  }

  if (currentGuide.otherAccountsQuestion && closeAccountType === "basic" && !otherAccountsClosed) {
    return (
      <ChoicePanel
        kicker="基本账户销户"
        title={currentGuide.otherAccountsQuestion.title}
        description={currentGuide.otherAccountsQuestion.description}
        options={currentGuide.otherAccountsQuestion.options}
        onSelect={setOtherAccountsClosed}
      />
    );
  }

  if (currentGuide.otherAccountsQuestion && closeAccountType === "basic" && otherAccountsClosed === "no") {
    return (
      <section className="choice-panel warning-panel">
        <p className="screen-kicker">暂不办理</p>
        <h2>请先注销其他银行账户。</h2>
        <p>基本账户销户前，需要先处理其他银行开立的相关账户。处理完成后再回到这里查看资料清单。</p>
      </section>
    );
  }

  if (currentGuide.changeOptions && !changeConfirmed) {
    return (
      <section className="choice-panel">
        <p className="screen-kicker">变更事项</p>
        <h2>请选择本次变更内容</h2>
        <p>可多选。企业名称、法定代表人等关键事项会生成不同印鉴材料。</p>
        <div className="choice-grid-portal">
          {currentGuide.changeOptions.map((option) => (
            <label className={`choice-card-portal check-choice ${changeItems.includes(option.id) ? "active" : ""}`} key={option.id}>
              <input
                type="checkbox"
                checked={changeItems.includes(option.id)}
                onChange={() => toggleChangeItem(option.id)}
              />
              <span className="choice-copy">
                <strong className="choice-title">{option.label}</strong>
                <small className="choice-desc">{option.description}</small>
              </span>
            </label>
          ))}
        </div>
        <button
          className="primary-button"
          type="button"
          onClick={() => {
            if (!changeItems.length) {
              onToast("请至少选择一个变更事项");
              return;
            }
            setChangeConfirmed(true);
          }}
        >
          生成资料清单
        </button>
      </section>
    );
  }

  if (currentGuide.ebankQuestion && !ebankAction) {
    return (
      <ChoicePanel
        kicker="网银业务"
        title={currentGuide.ebankQuestion.title}
        description={currentGuide.ebankQuestion.description}
        options={currentGuide.ebankQuestion.options}
        onSelect={setEbankAction}
      />
    );
  }

  return null;
}

function buildCorporateGuideResult({
  currentGuide,
  businessType,
  openAccountType,
  branchId,
  closeAccountType,
  ebankAction,
  changeItems,
}) {
  if (!currentGuide) return { title: "资料清单", detail: "", groups: [], notes: [] };

  if (currentGuide.openQuestion) {
    const branch = (currentGuide.branches ?? []).find((item) => item.id === branchId);
    const account = currentGuide.openQuestion.options.find((item) => item.id === openAccountType);
    const groups = buildOpenGroups(currentGuide, openAccountType, branch);
    return {
      title: branch?.label ?? account?.resultLabel ?? "开户资料清单",
      detail: account?.resultLabel ?? "",
      groups,
      notes: buildOpenNotes(currentGuide, openAccountType),
    };
  }

  if (currentGuide.changeOptions) {
    const selectedNames = currentGuide.changeOptions
      .filter((item) => changeItems.includes(item.id))
      .map((item) => item.label)
      .join("、");
    return {
      title: "变更资料清单",
      detail: selectedNames,
      groups: buildChangeGroups(currentGuide, changeItems),
      notes: buildChangeNotes(currentGuide, changeItems),
    };
  }

  if (currentGuide.ebankQuestion) {
    const action = currentGuide.ebankQuestion.options.find((item) => item.id === ebankAction);
    return {
      title: action?.resultLabel ?? "网银资料清单",
      detail: action?.description ?? "",
      groups: buildEbankGroups(currentGuide, ebankAction),
      notes: buildEbankNotes(currentGuide, ebankAction),
    };
  }

  if (currentGuide.closeQuestion) {
    const account = currentGuide.closeQuestion.options.find((item) => item.id === closeAccountType);
    return {
      title: account?.resultLabel ?? "销户资料清单",
      detail: account?.description ?? "",
      groups: currentGuide.groups ?? [],
      notes: currentGuide.notes ?? [],
    };
  }

  const branch = (currentGuide.branches ?? [])[0];
  return {
    title: branch?.label ?? businessType ?? "资料清单",
    detail: "",
    groups: branch?.groups ?? currentGuide.groups ?? [],
    notes: currentGuide.notes ?? [],
  };
}

function buildOpenGroups(currentGuide, openAccountType, activeOpenBranch) {
  const sourceGroups = activeOpenBranch?.groups ?? currentGuide.groups ?? [];
  if (openAccountType !== "general") return sourceGroups;
  return addGeneralAccountPermit(sourceGroups);
}

function buildOpenNotes(currentGuide, openAccountType) {
  const notes = [...(currentGuide.notes ?? [])];
  if (openAccountType === "general") {
    return ["一般存款账户开户需在对应开户资料基础上额外提供开户许可证原件。", ...notes];
  }
  return notes;
}

function addGeneralAccountPermit(groups) {
  return groups.map((group) => {
    if (group.id !== "base") return group;
    const hasPermit = group.items.some((item) => item.text === "开户许可证原件");
    if (hasPermit) return group;
    return { ...group, items: [...group.items, { text: "开户许可证原件" }] };
  });
}

function buildEbankGroups(currentGuide, ebankAction) {
  const groups = currentGuide.groups ?? [];
  if (ebankAction !== "change" && ebankAction !== "cancel") return groups;
  return [
    ...groups,
    {
      id: "device",
      title: "网银设备",
      icon: "device",
      items: [{ text: "旧网银 U 盾", note: "办理网银变更或注销时需携带" }],
    },
  ];
}

function buildEbankNotes(currentGuide, ebankAction) {
  const notes = [...(currentGuide.notes ?? [])];
  if (ebankAction === "change" || ebankAction === "cancel") {
    return ["办理网银变更或注销时，请携带旧网银 U 盾。", ...notes];
  }
  return notes;
}

function buildChangeGroups(currentGuide, selectedIds) {
  if (!selectedIds.length) return [];
  const materialKey = getChangeMaterialKey(selectedIds);
  return currentGuide.changeMaterials[materialKey]?.groups ?? currentGuide.changeMaterials.generic.groups;
}

function buildChangeNotes(currentGuide, selectedIds) {
  if (!selectedIds.length) return [];
  const materialKey = getChangeMaterialKey(selectedIds);
  const materialNotes = currentGuide.changeMaterials[materialKey]?.notes ?? [];
  return [...materialNotes, ...(currentGuide.notes ?? [])];
}

function getChangeMaterialKey(selectedIds) {
  const hasName = selectedIds.includes("name");
  const hasLegal = selectedIds.includes("legal-person");
  if (hasName && hasLegal) return "nameAndLegal";
  if (hasName) return "name";
  if (hasLegal) return "legalPerson";
  return "generic";
}

function getChecklistKey(groupId, text) {
  return `${groupId}:${text}`;
}

function sanitizeCorporateNote(text) {
  return String(text)
    .replace(/联系电话[:：]\s*\d+/g, "如有疑问，请以柜面或内部咨询口径为准")
    .replace(/请联系[:：]\s*\d+/g, "请以柜面或内部咨询口径为准");
}

ReactDOM.createRoot(document.getElementById("root")).render(<CorporateGuideRoot />);
