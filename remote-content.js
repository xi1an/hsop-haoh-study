(function () {
  const remoteUrl = window.HSOP_REMOTE_CONTENT_URL || "https://www.xi1an.xyz/hsop-content/manifest.json";
  const storageKey = "hsop-remote-content-package";

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isValidPackage(payload) {
    return isPlainObject(payload)
      && typeof payload.version === "string"
      && typeof payload.updatedAt === "string"
      && Array.isArray(payload.apps)
      && isPlainObject(payload.corporateGuide)
      && isPlainObject(payload.payrollTool)
      && isPlainObject(payload.atmCardExpiryReminder);
  }

  function toWebApps(apps) {
    return apps.map((item) => ({
      id: item.appId,
      title: item.title,
      shortTitle: item.shortTitle,
      category: item.category,
      icon: item.icon,
      launchType: item.webEntry?.type || "native",
      path: item.webEntry?.path,
      status: item.status,
      summary: item.summary,
      detail: item.detail,
      privacy: item.privacy,
      accent: item.accent,
    }));
  }

  function categoriesFromApps(apps) {
    return ["全部", ...Array.from(new Set(apps.map((item) => item.category)))];
  }

  function applyPackage(payload, source) {
    if (!isValidPackage(payload)) return false;
    window.HSOP_CONTENT_PACKAGE = payload;
    window.HSOP_CONTENT_SOURCE = source || "unknown";
    window.HSOP_APP_MANIFEST = payload.apps;
    window.hsopApps = toWebApps(payload.apps);
    window.hsopAppCategories = categoriesFromApps(payload.apps);

    if (isPlainObject(payload.corporateGuide)) {
      window.corporateCustomerTypes = payload.corporateGuide.customerTypes || window.corporateCustomerTypes;
      window.corporateBusinessOptions = payload.corporateGuide.businessOptions || window.corporateBusinessOptions;
      window.corporateGuideData = payload.corporateGuide.guideData || window.corporateGuideData;
    }

    window.dispatchEvent(new CustomEvent("hsop-content-updated", {
      detail: { package: payload, source: window.HSOP_CONTENT_SOURCE },
    }));
    return true;
  }

  function readCachedPackage() {
    try {
      const cached = localStorage.getItem(storageKey);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  }

  async function refreshPackage() {
    const response = await fetch(remoteUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`远程内容返回 ${response.status}`);
    const payload = await response.json();
    if (!isValidPackage(payload)) throw new Error("远程内容结构不完整");
    localStorage.setItem(storageKey, JSON.stringify(payload));
    applyPackage(payload, "network");
    return payload;
  }

  window.HSOP_REMOTE_CONTENT = {
    url: remoteUrl,
    applyPackage,
    readCachedPackage,
    refreshPackage,
  };

  const cached = readCachedPackage();
  if (cached) applyPackage(cached, "cache");

  refreshPackage().catch((error) => {
    window.HSOP_CONTENT_ERROR = error.message;
  });
}());
