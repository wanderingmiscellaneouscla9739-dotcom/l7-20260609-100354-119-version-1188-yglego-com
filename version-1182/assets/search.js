import { movieIndex } from './search-index.js';

const form = document.querySelector('[data-search-form]');
const input = document.querySelector('[data-search-input]');
const results = document.querySelector('[data-search-results]');
const heading = document.querySelector('[data-search-heading]');
const params = new URLSearchParams(window.location.search);
const initialQuery = params.get('q') || '';

if (input) {
  input.value = initialQuery;
}

const normalize = (value) => String(value || '').trim().toLowerCase();

const cardTemplate = (movie) => `
  <article class="movie-card">
    <a href="${movie.url}" class="card-link" aria-label="${escapeHtml(movie.title)}">
      <div class="cover-frame">
        <img src="${movie.cover}" alt="${escapeHtml(movie.title)}" loading="lazy">
        <div class="cover-shine"></div>
      </div>
      <div class="card-body">
        <h3>${escapeHtml(movie.title)}</h3>
        <p class="card-meta">${escapeHtml(movie.year)} · ${escapeHtml(movie.region)} · ${escapeHtml(movie.type)}</p>
        <p class="card-desc">${escapeHtml(movie.oneLine)}</p>
        <div class="tag-row">${(movie.tags || []).slice(0, 3).map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    </a>
  </article>
`;

function escapeHtml(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function render(query) {
  const keyword = normalize(query);
  const source = keyword
    ? movieIndex.filter((movie) => {
        const target = normalize([
          movie.title,
          movie.year,
          movie.region,
          movie.type,
          movie.genre,
          movie.oneLine,
          ...(movie.tags || [])
        ].join(' '));
        return target.includes(keyword);
      })
    : movieIndex.slice(0, 60);

  const limited = source.slice(0, 120);

  if (heading) {
    heading.textContent = keyword ? `搜索结果：${query}` : '热门内容';
  }

  if (results) {
    results.innerHTML = limited.length
      ? limited.map(cardTemplate).join('')
      : '<p class="empty-state">暂未找到匹配影片</p>';
  }
}

if (form) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const query = input ? input.value.trim() : '';
    const nextUrl = new URL(window.location.href);
    if (query) {
      nextUrl.searchParams.set('q', query);
    } else {
      nextUrl.searchParams.delete('q');
    }
    window.history.replaceState({}, '', nextUrl);
    render(query);
  });
}

render(initialQuery);
