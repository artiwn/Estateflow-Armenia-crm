export function bindTabs(scopeSelector: string) {
  const scope = document.querySelector<HTMLElement>(scopeSelector);
  if (!scope) return;

  const tabs = Array.from(scope.querySelectorAll<HTMLElement>("[data-tab-target]"));
  const panels = Array.from(scope.querySelectorAll<HTMLElement>("[data-tab-panel]"));
  const tabList = tabs[0]?.parentElement;
  tabList?.setAttribute("role", "tablist");

  const activate = (tab: HTMLElement, moveFocus = false) => {
    const target = tab.dataset.tabTarget;
    if (!target) return;
    tabs.forEach((x, index) => {
      const active = x === tab;
      x.classList.toggle("active", active);
      x.setAttribute("role", "tab");
      x.setAttribute("aria-selected", String(active));
      x.tabIndex = active ? 0 : -1;
      const panel = panels.find(p => p.dataset.tabPanel === x.dataset.tabTarget);
      if (panel) {
        if (!panel.id) panel.id = `${scope.id || "tabs"}-panel-${index}`;
        x.setAttribute("aria-controls", panel.id);
      }
    });
    panels.forEach((panel, index) => {
      const active = panel.dataset.tabPanel === target;
      panel.hidden = !active;
      panel.classList.toggle("active", active);
      panel.setAttribute("role", "tabpanel");
      const owner = tabs.find(x => x.dataset.tabTarget === panel.dataset.tabPanel);
      if (owner) {
        if (!owner.id) owner.id = `${scope.id || "tabs"}-tab-${index}`;
        panel.setAttribute("aria-labelledby", owner.id);
      }
    });
    if (moveFocus) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener("click", () => activate(tab));
    tab.addEventListener("keydown", event => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
      if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      activate(tabs[next], true);
    });
  });

  activate(tabs.find(x => x.classList.contains("active")) ?? tabs[0]);
}
