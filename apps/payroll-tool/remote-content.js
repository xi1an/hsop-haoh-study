(function () {
  const remoteUrl = window.HSOP_REMOTE_CONTENT_URL || "https://www.xi1an.xyz/hsop-content/manifest.json";
  const storageKey = "hsop-remote-content-package";

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isValidPackage(payload) {
    return isObject(payload)
      && typeof payload.version === "string"
      && isObject(payload.payrollTool);
  }

  function applyPayrollConfig(payload, source) {
    if (!isValidPackage(payload)) return false;
    const config = payload.payrollTool;
    window.PAYROLL_REMOTE_VERSION = payload.version;
    window.PAYROLL_REMOTE_SOURCE = source || "unknown";
    window.PAYROLL_CONFIG = config;
    if (Array.isArray(config.unitReferences)) window.PAYROLL_UNIT_REFERENCES = config.unitReferences;
    if (isObject(config.unitAliases)) window.PAYROLL_UNIT_ALIASES = config.unitAliases;
    if (isObject(config.unitFolders)) window.PAYROLL_UNIT_FOLDERS = config.unitFolders;
    if (isObject(config.townFolders)) window.PAYROLL_TOWN_FOLDERS = config.townFolders;
    if (Array.isArray(config.villageFolders)) window.PAYROLL_VILLAGE_FOLDERS = config.villageFolders;
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
    const before = window.PAYROLL_REMOTE_VERSION || "";
    const response = await fetch(remoteUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`远程内容返回 ${response.status}`);
    const payload = await response.json();
    if (!isValidPackage(payload)) throw new Error("远程内容结构不完整");
    localStorage.setItem(storageKey, JSON.stringify(payload));
    applyPayrollConfig(payload, "network");
    if (payload.version !== before) {
      window.dispatchEvent(new CustomEvent("payroll-remote-content-updated", {
        detail: { version: payload.version },
      }));
    }
    return payload;
  }

  const cached = readCachedPackage();
  if (cached) applyPayrollConfig(cached, "cache");

  window.PAYROLL_REMOTE_CONTENT = { refreshPackage, readCachedPackage, applyPayrollConfig };
  refreshPackage().catch((error) => {
    window.PAYROLL_REMOTE_ERROR = error.message;
  });
}());
