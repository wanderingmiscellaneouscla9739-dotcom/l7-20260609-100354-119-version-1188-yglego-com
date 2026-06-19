import { movies } from './search-data.js';

const form = document.querySelector('[data-search-form]');
const input = document.querySelector('[data-search-input]');
const results = document.querySelector('[data-search-results]');
const status = document.querySelector('[data-search-status]');

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function card(movie) {
  return `
<a class="movie-card" href="${escapeHtml(movie.url)}">
  <span class="poster-wrap">
    <img src="${escapeHtml(movie.cover)}" alt="${escapeHtml(movie.title)}" loading="lazy">
    <span class="poster-shade"></span>
    <span class="card-badge">${escapeHtml(movie.category)}</span>
    <span class="card-year">${escapeHtml(movie.year)}</span>
    <span class="play-float">▶</span>
  </span>
  <span class="card-body">
    <strong class="card-title">${escapeHtml(movie.title)}</strong>
    <span class="card-meta">${escapeHtml(movie.region)} · ${escapeHtml(movie.type)} · ${escapeHtml(movie.genre)}</span>
    <span class="card-desc">${escapeHtml(movie.oneLine)}</span>
  </span>
</a>`;
}

function runSearch(query) {
  const words = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const matched = words.length === 0
    ? movies.slice(0, 60)
    : movies.filter(function (movie) {
        const haystack = [
          movie.title,
          movie.year,
          movie.type,
          movie.region,
          movie.category,
          movie.genre,
          movie.tags.join(','),
          movie.oneLine
        ].join(' ').toLowerCase();
        return words.every(function (word) {
          return haystack.includes(word);
        });
      });

  if (status) {
    status.textContent = words.length === 0
      ? '默认展示 60 部热门影片，可输入关键词继续搜索。'
      : '共找到 ' + matched.length + ' 部相关影片。';
  }

  if (results) {
    results.innerHTML = matched.slice(0, 240).map(card).join('');
  }
}

const params = new URLSearchParams(window.location.search);
const initial = params.get('q') || '';
if (input) {
  input.value = initial;
}
runSearch(initial);

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input ? input.value.trim() : '';
    const url = query ? './search.html?q=' + encodeURIComponent(query) : './search.html';
    window.history.replaceState(null, '', url);
    runSearch(query);
  });
}
