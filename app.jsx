const { useEffect, useMemo, useRef, useState } = React;

const taskStorageKey = "hsop-baoyu-tasks";
const noteStorageKey = "hsop-baoyu-week-note";
const densityStorageKey = "hsop-baoyu-density";
const recentAppsStorageKey = "hsop-portal-recent-apps";

function readJson(key, fallback) {
  const saved = localStorage.getItem(key);
  if (!saved) return fallback;

  try {
    return JSON.parse(saved);
  } catch {
    return fallback;
  }
}

function cloneTasks() {
  return window.hsopDefaultTasks.map((task) => ({ ...task }));
}

function readTasks() {
  const parsed = readJson(taskStorageKey, null);
  return Array.isArray(parsed) ? parsed : cloneTasks();
}

function statusFromProgress(progress) {
  if (progress >= 100) return { text: "已完成", className: "done" };
  if (progress > 0) return { text: "进行中", className: "doing" };
  return { text: "待开始", className: "waiting" };
}

function App() {
  const apps = window.hsopApps;
  const [modalAppId, setModalAppId] = useState("");
  const [category, setCategory] = useState("全部");
  const [appQuery, setAppQuery] = useState("");
  const [resourceQuery, setResourceQuery] = useState("");
  const [toast, setToast] = useState("");
  const [tasks, setTasks] = useState(readTasks);
  const [recentAppIds, setRecentAppIds] = useState(() => {
    const parsed = readJson(recentAppsStorageKey, []);
    return Array.isArray(parsed) ? parsed : [];
  });
  const [density, setDensity] = useState(
    localStorage.getItem(densityStorageKey) || "comfortable"
  );
  const [weekNote, setWeekNote] = useState(
    localStorage.getItem(noteStorageKey) ||
      "本周银行法规推进比较稳定，英语阅读容易被挤掉。下周固定晚间 30 分钟精读，不和其他任务抢时间。"
  );
  const taskDialogRef = useRef(null);

  const modalApp = apps.find((app) => app.id === modalAppId);

  useEffect(() => {
    localStorage.setItem(taskStorageKey, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(recentAppsStorageKey, JSON.stringify(recentAppIds));
  }, [recentAppIds]);

  useEffect(() => {
    localStorage.setItem(noteStorageKey, weekNote);
  }, [weekNote]);

  useEffect(() => {
    localStorage.setItem(densityStorageKey, density);
  }, [density]);

  useEffect(() => {
    if (!modalAppId) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setModalAppId("");
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalAppId]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const stats = useMemo(() => {
    const done = tasks.filter((task) => task.progress >= 100).length;
    const total = tasks.length || 1;
    const progress = Math.round(
      tasks.reduce((sum, task) => sum + task.progress, 0) / total
    );
    const todayHours = (
      tasks.reduce((sum, task) => sum + (task.progress / 100) * task.minutes, 0) / 60
    ).toFixed(1);
    return {
      done,
      total: tasks.length,
      progress,
      todayHours,
      weekHours: Math.min(13, Number(todayHours) + 6.2).toFixed(1),
    };
  }, [tasks]);

  const filteredResources = useMemo(() => {
    const text = resourceQuery.trim().toLowerCase();
    if (!text) return window.hsopResources;
    return window.hsopResources.filter((resource) =>
      `${resource.type}${resource.name}${resource.desc}${resource.module}`
        .toLowerCase()
        .includes(text)
    );
  }, [resourceQuery]);

  function openApp(appId) {
    const app = apps.find((item) => item.id === appId);
    if (!app) return;

    setModalAppId(appId);
    setRecentAppIds((current) => [appId, ...current.filter((id) => id !== appId)].slice(0, 6));
  }

  function updateTaskProgress(taskId, progress) {
    setTasks((current) =>
      current.map((task) => (task.id === taskId ? { ...task, progress } : task))
    );
    setToast(progress >= 100 ? "任务已完成" : "任务进度已更新");
  }

  function advanceTask(taskId) {
    setTasks((current) =>
      current.map((task) =>
        task.id === taskId
          ? { ...task, progress: Math.min(100, task.progress + 20) }
          : task
      )
    );
    setToast("进度已推进 20%");
  }

  function addTask(task) {
    const exists = tasks.some((item) => item.title === task.title);
    if (exists) {
      setToast("今日任务里已经有这项内容");
      return;
    }

    setTasks((current) => [
      ...current,
      {
        id: `task-${Date.now()}`,
        title: task.title,
        module: task.module,
        minutes: Number(task.minutes),
        progress: 0,
        priority: task.priority || "新增任务",
      },
    ]);
    setToast("已加入今日任务");
  }

  function handleTaskSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    addTask({
      title: formData.get("title").trim(),
      module: formData.get("module"),
      minutes: formData.get("minutes"),
      priority: "手动添加",
    });
    event.currentTarget.reset();
    taskDialogRef.current?.close();
  }

  function resetTasks() {
    setTasks(cloneTasks());
    setToast("默认任务已恢复");
  }

  return (
    <div className="app portal-app" data-density={density}>
      <header className="topbar">
        <button className="brand brand-button" type="button" onClick={() => setModalAppId("")}>
          <span className="brand-code">HSOP</span>
          <span>
            <span className="brand-title">昊昊学习</span>
            <span className="brand-subtitle">个人业务工具门户</span>
          </span>
        </button>
        <div className="topbar-center">
          <div className="date-strip">
            <span>门户首页</span>
            <strong>应用启动台</strong>
            <span>{apps.length} 个功能</span>
          </div>
        </div>
        <div className="topbar-actions">
          <button
            className="secondary-button"
            type="button"
            onClick={() =>
              setDensity((current) =>
                current === "comfortable" ? "compact" : "comfortable"
              )
            }
          >
            {density === "comfortable" ? "紧凑模式" : "舒展模式"}
          </button>
        </div>
      </header>

      <div className="app-shell portal-shell">
        <main className="main-panel portal-main">
          <AppLauncher apps={apps} onOpen={openApp} />
        </main>
      </div>

      {modalApp && (
        <AppModalHost
          app={modalApp}
          onClose={() => setModalAppId("")}
          onToast={setToast}
        />
      )}

      <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
        {toast}
      </div>
    </div>
  );
}

function AppModalHost({ app, onClose, onToast }) {
  function handleBackdropMouseDown(event) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className="app-modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropMouseDown}
    >
      <section
        className={`app-modal app-modal-${app.id}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="appModalTitle"
      >
        <div className="app-modal-head">
          <div className="app-modal-title">
            <span className="module-icon">
              <HSOPIcon name={app.icon} />
            </span>
            <div>
              <p>{app.category}</p>
              <h2 id="appModalTitle">{app.title}</h2>
              <span>{app.summary}</span>
            </div>
          </div>
          <button className="icon-button" type="button" aria-label="关闭弹窗" onClick={onClose}>
            <HSOPIcon name="close" />
          </button>
        </div>
        <div className="app-modal-content">
          {app.launchType === "embedded" && <EmbeddedApp app={app} />}
          {app.id === "future-tools" && <FutureToolsApp app={app} />}
        </div>
      </section>
    </div>
  );
}

function PortalProfile({ apps }) {
  return (
    <section className="profile-card" aria-label="门户状态">
      <div className="profile-top">
        <span className="avatar">昊</span>
        <div>
          <p className="profile-name">HSOP 应用门户</p>
          <p className="profile-sub">对公指南 · 表格识别 · 吞卡提醒 · 可拓展</p>
        </div>
      </div>
      <div className="progress-compact">
        <div className="progress-line">
          <span>已接入功能</span>
          <strong>{apps.length}</strong>
        </div>
        <div className="bar" aria-hidden="true">
          <span style={{ width: `${Math.min(100, apps.length * 33.34)}%` }}></span>
        </div>
      </div>
    </section>
  );
}

function AppLauncher({ apps, onOpen }) {
  return (
    <section className="screen portal-screen" data-screen-label="HSOP 应用启动台">
      <div className="screen-header portal-hero">
        <div>
          <p className="screen-kicker">功能入口</p>
          <h1>选择一个功能，直接开始使用。</h1>
          <p className="screen-copy">
            这里只显示已经接入的功能。对公指南、表格识别、吞卡提醒和可拓展功能分开进入，后续新增应用也按这个入口方式接入。
          </p>
        </div>
        <div className="portal-hero-card">
          <strong>{apps.length}</strong>
          <span>个功能入口</span>
        </div>
      </div>

      <section className="section-block">
        <div className="block-head">
          <div>
            <h2>主功能</h2>
            <p>每个功能都是独立入口，点开后进入自己的主界面。</p>
          </div>
          <span className="small-tag">当前 {apps.length} 个</span>
        </div>
        <div className="app-card-grid">
          {apps.map((app) => (
            <article className={`app-card app-card-${app.id}`} key={app.id}>
              <div className="app-card-top">
                <span className="module-icon">
                  <HSOPIcon name={app.icon} />
                </span>
                <span className="small-tag">{app.category}</span>
              </div>
              <h3>{app.title}</h3>
              <p>{app.summary}</p>
              <div className="app-card-meta">
                <span>{app.launchType === "embedded" ? "独立嵌入" : "功能主界面"}</span>
                <span>{app.status}</span>
              </div>
              <button className="primary-button" type="button" onClick={() => onOpen(app.id)}>
                打开
              </button>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}

function LearningWorkspace({
  tasks,
  stats,
  resources,
  resourceQuery,
  weekNote,
  onResourceQuery,
  onOpenDialog,
  onAdvance,
  onComplete,
  onAddTask,
  onResetTasks,
  onNote,
}) {
  return (
    <section className="screen" data-screen-label="HSOP 学习工作台">
      <div className="screen-header">
        <div>
          <p className="screen-kicker">学习工作台</p>
          <h1>把今天的学习推进到可复盘。</h1>
          <p className="screen-copy">
            学习应用保留原来的任务、资源、计划和复盘能力，只是从门户首页退到独立应用里。
          </p>
        </div>
        <button className="primary-button" type="button" onClick={onOpenDialog}>
          <span className="button-icon">
            <HSOPIcon name="plus" />
          </span>
          添加任务
        </button>
      </div>

      <div className="hero-grid">
        <article className="focus-card">
          <div>
            <p className="focus-title">当前重点：银行从业资格考试 · 法律法规</p>
            <p className="focus-body">
              今天先推进法规章节，再用错题做校验。英语阅读放到晚间，不和主任务抢注意力。
            </p>
            <div className="focus-actions">
              <button className="primary-button" type="button" onClick={() => onAdvance("bank-law")}>
                继续当前任务
              </button>
              <button className="secondary-button" type="button" onClick={onResetTasks}>
                恢复默认任务
              </button>
            </div>
          </div>
          <div className="focus-image">
            <img src="study-desk.png" alt="带有 HSOP 笔记本的学习桌面" />
          </div>
        </article>

        <div className="metric-grid" aria-label="学习统计">
          <Metric label="今日任务" value={`${stats.done}/${stats.total}`} desc="已完成" />
          <Metric label="今日学习" value={stats.todayHours} desc="小时" />
          <Metric label="本周学习" value={stats.weekHours} desc="目标 13 小时" />
          <Metric label="整体进度" value={`${stats.progress}%`} desc="按任务平均" />
        </div>
      </div>

      <section className="section-block">
        <div className="block-head">
          <div>
            <h2>今日任务</h2>
            <p>完成、推进、恢复默认，都会保存在本地。</p>
          </div>
        </div>
        <TaskBoard tasks={tasks} onAdvance={onAdvance} onComplete={onComplete} />
      </section>

      <ModuleGrid />
      <PlanBlock />
      <ResourceBlock
        resources={resources}
        query={resourceQuery}
        onQuery={onResourceQuery}
        onAddTask={onAddTask}
      />
      <ReviewBlock stats={stats} weekNote={weekNote} onNote={onNote} />
    </section>
  );
}

function Metric({ label, value, desc }) {
  return (
    <article className="metric-card">
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{desc}</small>
    </article>
  );
}

function TaskBoard({ tasks, onAdvance, onComplete }) {
  return (
    <div className="task-board" aria-label="今日任务列表">
      {tasks.map((task) => {
        const status = statusFromProgress(task.progress);
        return (
          <article className="task-card" key={task.id}>
            <input
              className="task-check"
              type="checkbox"
              checked={task.progress >= 100}
              aria-label={`完成 ${task.title}`}
              onChange={(event) => onComplete(task.id, event.target.checked ? 100 : 0)}
            />
            <div className="task-name">
              <strong title={task.title}>{task.title}</strong>
              <span>
                {task.module} · {task.minutes} 分钟 · {task.priority}
              </span>
            </div>
            <span className={`status-pill ${status.className}`}>{status.text}</span>
            <button className="resource-button" type="button" onClick={() => onAdvance(task.id)}>
              {task.progress >= 100 ? "再复习" : task.progress > 0 ? "推进" : "开始"}
            </button>
            <div className="progress-cell">
              <span>{task.progress}%</span>
              <div className="bar">
                <span style={{ width: `${task.progress}%` }}></span>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ModuleGrid() {
  const iconMap = {
    bank: "bank",
    english: "english",
    code: "code",
    reading: "bookmark",
  };

  return (
    <section className="section-block">
      <div className="block-head">
        <div>
          <h2>学习模块</h2>
          <p>四条主线，分别积累，不混成一团。</p>
        </div>
      </div>
      <div className="content-grid">
        {window.hsopModules.map((module) => (
          <article className="module-card" key={module.id}>
            <div className="module-top">
              <div>
                <h3>{module.title}</h3>
                <p>{module.desc}</p>
              </div>
              <span className="module-icon">
                <HSOPIcon name={iconMap[module.id]} />
              </span>
            </div>
            <div className="bar" aria-label={`${module.title}进度 ${module.progress}%`}>
              <span style={{ width: `${module.progress}%` }}></span>
            </div>
            <div className="module-meta">
              {module.tags.map((tag) => (
                <span className="small-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function PlanBlock() {
  return (
    <section className="section-block">
      <div className="block-head">
        <div>
          <h2>学习计划</h2>
          <p>一周只排五个稳定节奏。</p>
        </div>
      </div>
      <div className="weekly-grid">
        {window.hsopPlan.map((plan) => (
          <article className="plan-card" key={plan.day}>
            <div className="plan-day">
              <span>{plan.day}</span>
              <span className="small-tag">{plan.focus}</span>
            </div>
            <ul>
              {plan.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function ResourceBlock({ resources, query, onQuery, onAddTask }) {
  return (
    <section className="section-block">
      <div className="block-head">
        <div>
          <h2>资源入口</h2>
          <p>点“加入今日”会把资源转成今天的学习任务。</p>
        </div>
      </div>
      <div className="resource-tools">
        <input
          className="search-input"
          value={query}
          type="search"
          placeholder="搜索资料、笔记、工具"
          onChange={(event) => onQuery(event.target.value)}
        />
        <span className="small-tag">共 {resources.length} 条</span>
      </div>
      <div className="resource-list">
        {resources.length ? (
          resources.map((resource) => (
            <article className="resource-row" key={resource.name}>
              <span className="resource-type">{resource.type}</span>
              <div>
                <strong>{resource.name}</strong>
                <p>{resource.desc}</p>
              </div>
              <span className="resource-date">{resource.date}</span>
              <button
                className="resource-button"
                type="button"
                onClick={() =>
                  onAddTask({
                    title: resource.task,
                    module: resource.module,
                    minutes: 30,
                    priority: "资源转任务",
                  })
                }
              >
                加入今日
              </button>
            </article>
          ))
        ) : (
          <div className="empty-state">没有找到匹配资料。</div>
        )}
      </div>
    </section>
  );
}

function ReviewBlock({ stats, weekNote, onNote }) {
  const score = Math.max(1, stats.progress);

  return (
    <section className="section-block">
      <div className="block-head">
        <div>
          <h2>复盘记录</h2>
          <p>记录要短，结论要能执行。</p>
        </div>
      </div>
      <div className="review-grid">
        <article className="review-card">
          <h3>本周完成度</h3>
          <div className="review-score">
            <div className="score-ring" style={{ "--score": `${score}%` }}>
              <div className="score-ring-inner">
                <div>
                  <strong>{score}%</strong>
                  <span>任务平均</span>
                </div>
              </div>
            </div>
          </div>
        </article>
        <article className="note-card">
          <h3>本周结论</h3>
          <textarea
            value={weekNote}
            aria-label="本周复盘记录"
            onChange={(event) => onNote(event.target.value)}
          ></textarea>
        </article>
      </div>
    </section>
  );
}

function EmbeddedApp({ app }) {
  return (
    <section className="screen embedded-screen" data-screen-label={`HSOP ${app.title}`}>
      <div className="screen-header">
        <div>
          <p className="screen-kicker">{app.category}</p>
          <h1>{app.title}</h1>
          <p className="screen-copy">{app.detail}</p>
        </div>
        <span className="small-tag">{app.privacy}</span>
      </div>
      <div className="embedded-frame-wrap">
        <iframe className="embedded-frame" title={app.title} src={app.path}></iframe>
      </div>
    </section>
  );
}

function FutureToolsApp({ app }) {
  return (
    <section className="screen future-screen" data-screen-label={`HSOP ${app.title}`}>
      <div className="screen-header">
        <div>
          <p className="screen-kicker">扩展中心</p>
          <h1>以后新增功能，从这里接入。</h1>
          <p className="screen-copy">
            这里先作为扩展软件的主界面。后续增加新工具时，只需要补应用清单和对应页面文件。
          </p>
        </div>
        <span className="small-tag">{app.status}</span>
      </div>
      <div className="future-board">
        <article className="future-card">
          <span className="module-icon">
            <HSOPIcon name="apps" />
          </span>
          <h2>新增应用清单</h2>
          <p>为新功能补充名称、分类、图标、简介、启动方式和入口路径。</p>
        </article>
        <article className="future-card">
          <span className="module-icon">
            <HSOPIcon name="briefcase" />
          </span>
          <h2>功能独立运行</h2>
          <p>轻量工具放在门户内部，复杂工具继续用独立页面嵌入。</p>
        </article>
        <article className="future-card">
          <span className="module-icon">
            <HSOPIcon name="spreadsheet" />
          </span>
          <h2>私用优先</h2>
          <p>默认本地处理，不内置真实样例，发布前再检查隐私信息。</p>
        </article>
      </div>
    </section>
  );
}

function RightRail({ activeApp, apps, onOpen }) {
  const currentTitle = activeApp ? activeApp.title : "门户首页";
  const currentCopy = activeApp
    ? activeApp.privacy
    : "主界面只显示你已经接入的功能，其他功能不出现在入口里。";

  return (
    <aside className="right-rail" aria-label="右侧门户摘要">
      <section className="rail-card quote-card">
        <h3>{currentTitle}</h3>
        <p>{currentCopy}</p>
      </section>
      <section className="rail-card">
        <h3>已接入功能</h3>
        <ul className="rail-list">
          {apps.map((app) => (
            <li key={app.id}>
              <button className="rail-link" type="button" onClick={() => onOpen(app.id)}>
                <strong>{app.title}</strong>
                <span>{app.category} · {app.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
      <section className="rail-card">
        <h3>扩展规则</h3>
        <p className="rail-muted">新增功能先补应用清单，再放入应用目录；涉及真实资料时先做隐私检查。</p>
      </section>
    </aside>
  );
}

function TaskDialog({ refObject, onSubmit }) {
  return (
    <dialog className="task-dialog" ref={refObject} aria-labelledby="taskDialogTitle">
      <form className="dialog-content" onSubmit={onSubmit}>
        <div className="dialog-head">
          <h2 id="taskDialogTitle">添加今日任务</h2>
          <button
            className="icon-button"
            type="button"
            aria-label="关闭"
            onClick={() => refObject.current?.close()}
          >
            <HSOPIcon name="close" />
          </button>
        </div>
        <label>
          任务名称
          <input className="task-input" name="title" maxLength="28" required />
        </label>
        <label>
          所属模块
          <select className="task-select" name="module">
            <option>银行知识</option>
            <option>英语学习</option>
            <option>编程练习</option>
            <option>阅读笔记</option>
            <option>复盘记录</option>
          </select>
        </label>
        <label>
          预计时长
          <select className="task-select" name="minutes" defaultValue="30">
            <option value="20">20 分钟</option>
            <option value="30">30 分钟</option>
            <option value="40">40 分钟</option>
            <option value="50">50 分钟</option>
          </select>
        </label>
        <div className="dialog-actions">
          <button className="secondary-button" type="button" onClick={() => refObject.current?.close()}>
            取消
          </button>
          <button className="primary-button" type="submit">
            添加
          </button>
        </div>
      </form>
    </dialog>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
