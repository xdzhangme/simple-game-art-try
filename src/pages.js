import pages from './content/pages.json';

function fill(el, section) {
  el.replaceChildren();
  const h = document.createElement('h2');
  h.textContent = section.title;
  el.append(h);
  if (section.intro) {
    const p = document.createElement('p');
    p.textContent = section.intro;
    el.append(p);
  }
  (section.paragraphs || []).forEach((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    el.append(p);
  });
  if (section.steps) {
    const ol = document.createElement('ol');
    section.steps.forEach((text) => {
      const li = document.createElement('li');
      li.textContent = text;
      ol.append(li);
    });
    el.append(ol);
  }
}

// Fills every [data-content="<key>"] element from src/content/pages.json.
export function renderPages(lang, root = document) {
  const set = pages[lang] || pages.en;
  root.querySelectorAll('[data-content]').forEach((el) => {
    const section = set[el.dataset.content] || pages.en[el.dataset.content];
    if (section) fill(el, section);
  });
}
