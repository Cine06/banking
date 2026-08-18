// Template module - handles loading of HTML templates via data-include attributes
async function loadTemplates() {
  const includes = document.querySelectorAll('[data-include]');
  const promises = Array.from(includes).map(async (el) => {
    const file = el.getAttribute('data-include');
    try {
      const res = await fetch(file);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      el.outerHTML = html;
    } catch (err) {
      console.error(`Error loading template ${file}:`, err);
    }
  });
  await Promise.all(promises);
}

export { loadTemplates };