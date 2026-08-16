
document.addEventListener('DOMContentLoaded', () => {
  const yamlUrl = 'bookmarks.yaml';
  const importantKey = 'Important';

  const els = {
    importantGrid: document.getElementById('important-grid'),
    categoriesRoot: document.getElementById('categories-root'),
    error: document.getElementById('error'),
  };


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
    const important = data[importantKey];
    renderImportant(important);

    // Render other categories
    const categories = Object.keys(data)
      .filter(k => k !== importantKey);
      // .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

    categories.forEach(cat => {
      const items = data[cat];
      els.categoriesRoot.appendChild(renderCategory(cat, items));
    });
  }

  // --------------------------------------------------------------------------
  // Render important entries as bigger cards
  function renderImportant(items) {
    const section = document.getElementById('important-section');
    els.importantGrid.innerHTML = '';

    // remove? 
    if (!items.links.length) {
      section.classList.add('hidden');
      return;
    } else {
      section.classList.remove('hidden');
    }

    links = items.links || [];

    links.forEach(item => {

      const col = document.createElement('div');
      col.className = 'col';

      const cardLink = document.createElement('a');
      cardLink.className = 'card custom-card text-reset text-decoration-none h-100';
      cardLink.href = item.url || '#';
      // Open links in a new tab:
      // cardLink.target = '_blank';
      // cardLink.rel = 'noopener noreferrer';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      const header = document.createElement('h6');
      header.className = 'text-truncate';

      // Insert favicon and title
      const favicon = item.icon || `https://www.google.com/s2/favicons?domain=${item.url}&sz=32`;
      const img = document.createElement('img');
      img.src = favicon;
      img.width = 20;
      img.height = 20;
      img.className = 'd-inline-block align-text-top';
      header.appendChild(img);
      header.appendChild(document.createTextNode('\u00A0 ' + (item.title || '')));

      // Insert URL as text
      const p = document.createElement('p');
      p.className = 'card-text text-black-50 text-truncate';
      p.style.fontSize = '0.9em';
      p.textContent = item.url || '';

      cardBody.appendChild(header);
      cardBody.appendChild(p);
      cardLink.appendChild(cardBody);
      col.appendChild(cardLink);
      els.importantGrid.appendChild(col);
    });
  }

  // --------------------------------------------------------------------------
  // Render categories as entries in the accordion
  function renderCategory(name, items) {
    
    collapsed = items.collapsed || false;
    links = items.links || [];
    
    const sectionId = ('section' + name.replace(/[^a-zA-Z0-9]/g, ""));

    const accordion = document.createElement('div')
    accordion.className = 'accordion'
    
    const section = document.createElement('div')
    section.className = 'accordion-item m-2'
    
    const header = document.createElement('h4');
    header.className = 'accordion-header';
    
    const button = document.createElement('button');
    button.className = 'accordion-button';
    button.textContent = name;
    button.setAttribute('data-bs-toggle', 'collapse');
    button.setAttribute('data-bs-target', ('#' + sectionId));
    button.setAttribute('type', 'button');
    header.appendChild(button);
    section.appendChild(header);

    const sectionContent = document.createElement('div');
    sectionContent.className = 'accordion-collapse collapse';
    if (!collapsed) {
      sectionContent.className += ' show';
    } 
    sectionContent.id = sectionId;

    const sectionBody = document.createElement('div');
    sectionBody.className = 'accordion-body';
    
    const grid = document.createElement('grid');
    grid.className = "row row-cols-1 row-cols-md-2 g-2";

    links.forEach(item => {

      const col = document.createElement('div');
      col.className = 'col';

      const cardLink = document.createElement('a');
      cardLink.className = 'text-reset text-decoration-none h-100';
      cardLink.href = item.url || '#';
      // Open links in a new tab:
      // cardLink.target = '_blank';
      // cardLink.rel = 'noopener noreferrer';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body text-truncate';
      
      // Insert favicon and title
      const favicon = item.icon || `https://www.google.com/s2/favicons?domain=${item.url}&sz=32`;
      const img = document.createElement('img');
      img.src = favicon;
      img.width = 15;
      img.height = 15;
      img.className = 'd-inline-block align-text-top';
      cardBody.appendChild(img);
      cardBody.appendChild(document.createTextNode('\u00A0 ' + (item.title || '') + '\u00A0'));

      // Insert URL as text
      const span = document.createElement('span');
      span.className = 'card-text text-black-50 text-truncate';
      span.style.fontSize = '0.9em';
      span.textContent = (item.url) || '';
      cardBody.appendChild(span)

      cardLink.appendChild(cardBody);
      col.appendChild(cardLink);
      grid.appendChild(col)
    });

    sectionBody.appendChild(grid);
    sectionContent.appendChild(sectionBody);
    section.appendChild(sectionContent);
    accordion.appendChild(section);
  
    return accordion;

  }
});
