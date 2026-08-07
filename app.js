document.addEventListener('DOMContentLoaded', () => {
  const yamlUrl = 'bookmarks.yaml';
  const importantKey = 'Important';
  const collapsedKey = 'collapsedCategories:v1';

  const els = {
    importantGrid: document.getElementById('important-grid'),
    categoriesRoot: document.getElementById('categories-root'),
    error: document.getElementById('error'),
  };

  const collapsed = new Set(JSON.parse(localStorage.getItem(collapsedKey) || '[]'));

  fetch(yamlUrl, { cache: 'no-store' })
    .then(r => {
      if (!r.ok) throw new Error('Failed to load ' + yamlUrl + ' (' + r.status + ')');
      return r.text();
    })
    .then(text => jsyaml.load(text))
    .then(data => render(data))
    .catch(err => {
      console.error(err);
      els.error.textContent = 'Could not load bookmarks.yaml: ' + err.message;
      els.error.classList.remove('hidden');
    });

  function render(data) {
    if (!data || typeof data !== 'object') return;

    // Render "Important" grid
    const important = Array.isArray(data[importantKey]) ? data[importantKey] : [];
    renderImportant(important);

    // Render other categories
    const categories = Object.keys(data)
      .filter(k => k !== importantKey)
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    categories.forEach(cat => {
      const items = Array.isArray(data[cat]) ? data[cat] : [];
      els.categoriesRoot.appendChild(renderCategory(cat, items));
    });
  }

  function renderImportant(items) {
    const section = document.getElementById('important-section');
    els.importantGrid.innerHTML = '';
    if (!items.length) {
      section.classList.add('hidden');
      return;
    } else {
      section.classList.remove('hidden');
    }

    items.forEach(item => {


      // <div class="col">
      const col = document.createElement('div');
      col.className = 'col';

      // <div class="card custom-card">
      //const card = document.createElement('div');
      //card.className = 'card custom-card';

      const cardLink = document.createElement('a');
      cardLink.className = 'card custom-card text-reset text-decoration-none h-100';
      cardLink.href = item.url || '#';
      // if you want links to open in a new tab:
      // cardLink.target = '_blank';
      // cardLink.rel = 'noopener noreferrer';

      // <div class="card-body">
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      // <h6 class="card-title text-truncate"> ... </h6>
      const h6 = document.createElement('h6');
      h6.className = 'text-truncate';

      // Insert favicon and title
      const favicon = item.icon || `https://www.google.com/s2/favicons?domain=${item.url}&sz=32`;
      const img = document.createElement('img');
      img.src = favicon;
      img.width = 20;
      img.height = 20;
      img.className = 'd-inline-block align-text-top';
      // Append img and title text with a non-breaking space
      h6.appendChild(img);
      h6.appendChild(document.createTextNode('\u00A0 ' + (item.title || '')));

      // Insert URL as text
      const p = document.createElement('p');
      p.className = 'card-text text-body-secondary text-truncate';
      p.style.fontSize = '0.9em';
      p.textContent = item.url || '';

      //<a href="${item.url}" class="stretched-link"></a>
      const a = document.createElement('a');
      a.className = 'stretched-link';
      a.href = item.url || '#';
      // Optionally add aria-label for accessibility:
      //a.setAttribute('aria-label', item.title || item.url || '');

      // assemble
      cardBody.appendChild(h6);
      cardBody.appendChild(p);
      //cardBody.appendChild(a);
      cardLink.appendChild(cardBody);
      col.appendChild(cardLink);


      els.importantGrid.appendChild(col);
    });
  }

  function renderCategory(name, items) {

    const sectionId = ('section' + name.replace(/[^a-zA-Z0-9]/g, ""));
    
    const section = document.createElement('section');
    section.className = 'container p-2';
    section.dataset.category = name;

    const header = document.createElement('a');
    header.className = 'btn category-header my-3';
    header.setAttribute('href', ('#' + sectionId));
    header.setAttribute('data-bs-toggle', 'collapse')
    header.setAttribute('role', 'button')

    const headerText = document.createElement('h5');
    headerText.textContent = name;
    header.appendChild(headerText);

    const grid = document.createElement('grid')
    grid.className = "row row-cols-1 row-cols-md-2 g-2 collapse";
    grid.id = sectionId;

    items.forEach(item => {


      // <div class="col">
      const col = document.createElement('div');
      col.className = 'col';

      // <div class="card custom-card">
      //const card = document.createElement('div');
      //card.className = 'card custom-card';

      const cardLink = document.createElement('a');
      cardLink.className = 'text-reset text-decoration-none h-100';
      cardLink.href = item.url || '#';
      // if you want links to open in a new tab:
      // cardLink.target = '_blank';
      // cardLink.rel = 'noopener noreferrer';

      // <div class="card-body">
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body text-truncate';



      // Insert favicon and title
      const favicon = item.icon || `https://www.google.com/s2/favicons?domain=${item.url}&sz=32`;
      const img = document.createElement('img');
      img.src = favicon;
      img.width = 15;
      img.height = 15;
      img.className = 'd-inline-block align-text-top';
      // Append img and title text with a non-breaking space
      cardBody.appendChild(img);
      cardBody.appendChild(document.createTextNode('\u00A0 ' + (item.title || '') + '\u00A0'));

      // Insert URL as text
      const span = document.createElement('span');
      span.className = 'card-text text-body-secondary text-truncate';
      span.style.fontSize = '0.9em';
      span.textContent = (item.url) || '';
      cardBody.appendChild(span)

      //cardBody.appendChild(a);
      cardLink.appendChild(cardBody);
      col.appendChild(cardLink);

      section.appendChild(header);
      section.appendChild(grid);
      grid.appendChild(col)
    });
      return section;

  }

  function slug(s) {
    return String(s)
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-]/g, '');
  }
  function extractHost(url) {
    try {
      return new URL(url, location.origin).host;
    } catch {
      return '';
    }
  }
  function normalizeUrl(url) {
    if (typeof url !== 'string') return '#';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) return url;
    if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) return 'https://' + url;
    return url;
  }
});
