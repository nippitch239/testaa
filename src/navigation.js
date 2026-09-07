export function navigate(path, options = {}) {
  const method = options.replace ? "replaceState" : "pushState";
  window.history[method](null, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
}
