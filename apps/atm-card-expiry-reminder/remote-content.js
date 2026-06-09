(function () {
  const remoteUrl = window.HSOP_REMOTE_CONTENT_URL || "https://www.xi1an.xyz/hsop-content/manifest.json";
  const storageKey = "hsop-remote-content-package";

  function isObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function isValidPackage(payload) {
    return isObject(payload)
      && typeof payload.version === "string"
      && isObject(payload.atmCardExpiryReminder);
  }

  function applyAtmConfig(payload, source) {
    if (!isValidPackage(payload)) return false;
    window.HSOP_ATM_CONFIG = payload.atmCardExpiryReminder;
    window.HSOP_ATM_REMOTE_VERSION = payload.version;
    window.HSOP_ATM_REMOTE_SOURCE = source || "unknown";
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
    const before = window.HSOP_ATM_REMOTE_VERSION || "";
    const response = await fetch(remoteUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`远程内容返回 ${response.status}`);
    const payload = await response.json();
    if (!isValidPackage(payload)) throw new Error("远程内容结构不完整");
    localStorage.setItem(storageKey, JSON.stringify(payload));
    applyAtmConfig(payload, "network");
    if (payload.version !== before) {
      window.dispatchEvent(new CustomEvent("atm-remote-content-updated", {
        detail: { version: payload.version },
      }));
    }
    return payload;
  }

  const cached = readCachedPackage();
  if (cached) applyAtmConfig(cached, "cache");

  window.HSOP_ATM_REMOTE_CONTENT = { refreshPackage, readCachedPackage, applyAtmConfig };
  refreshPackage().catch((error) => {
    window.HSOP_ATM_REMOTE_ERROR = error.message;
  });
}());
