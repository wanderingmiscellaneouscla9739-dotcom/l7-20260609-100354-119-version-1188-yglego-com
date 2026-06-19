(function () {
  var menuButton = document.querySelector('[data-mobile-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
      document.body.classList.toggle('is-menu-open', mobileMenu.classList.contains('is-open'));
    });
  }

  var backToTop = document.querySelector('[data-back-to-top]');

  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 420);
    });

    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var thumbs = Array.prototype.slice.call(document.querySelectorAll('[data-hero-thumb]'));
    var current = 0;
    var timer = null;

    function setHero(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });

      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === current);
      });
    }

    function restartHeroTimer() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        setHero(current + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        setHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        restartHeroTimer();
      });
    });

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('mouseenter', function () {
        setHero(Number(thumb.getAttribute('data-hero-thumb')) || 0);
      });
    });

    setHero(0);
    restartHeroTimer();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var keyword = scope.querySelector('[data-filter-keyword]');
    var region = scope.querySelector('[data-filter-region]');
    var type = scope.querySelector('[data-filter-type]');
    var reset = scope.querySelector('[data-filter-reset]');
    var section = scope.closest('.content-section') || document;
    var cards = Array.prototype.slice.call(section.querySelectorAll('.movie-card'));
    var status = section.querySelector('[data-filter-status]');

    function matches(card) {
      var q = normalize(keyword && keyword.value);
      var selectedRegion = region ? region.value : '全部地区';
      var selectedType = type ? type.value : '全部类型';
      var text = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-tags'),
        card.textContent
      ].join(' '));
      var cardRegion = card.getAttribute('data-region') || '';
      var cardType = card.getAttribute('data-type') || '';
      var regionOk = selectedRegion === '全部地区' || cardRegion.indexOf(selectedRegion) !== -1 || (selectedRegion === '其他' && !/日本|韩国|中国大陆|中国台湾|美国|欧美/.test(cardRegion));
      var typeOk = selectedType === '全部类型' || cardType.indexOf(selectedType) !== -1;
      var keywordOk = !q || text.indexOf(q) !== -1;

      return regionOk && typeOk && keywordOk;
    }

    function applyFilter() {
      var shown = 0;

      cards.forEach(function (card) {
        var visible = matches(card);
        card.classList.toggle('is-hidden-by-filter', !visible);
        shown += visible ? 1 : 0;
      });

      if (status) {
        status.textContent = '当前显示 ' + shown + ' / ' + cards.length + ' 部影片';
      }
    }

    [keyword, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    if (reset) {
      reset.addEventListener('click', function () {
        if (keyword) {
          keyword.value = '';
        }
        if (region) {
          region.value = '全部地区';
        }
        if (type) {
          type.value = '全部类型';
        }
        applyFilter();
      });
    }

    applyFilter();
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function movieCard(movie) {
    return [
      '<article class="movie-card" data-title="', escapeHtml(movie.title), '" data-region="', escapeHtml(movie.region), '" data-type="', escapeHtml(movie.type), '" data-year="', escapeHtml(movie.year), '" data-tags="', escapeHtml((movie.tags || []).join(' ')), '">',
      '<a class="movie-card__link" href="', escapeHtml(movie.page), '" aria-label="观看 ', escapeHtml(movie.title), '">',
      '<div class="movie-card__poster">',
      '<img src="', escapeHtml(movie.cover), '" alt="', escapeHtml(movie.title), '" loading="lazy" decoding="async">',
      '<div class="movie-card__shade"></div>',
      '<span class="movie-card__category">', escapeHtml(movie.category), '</span>',
      '<span class="movie-card__duration">', escapeHtml(movie.year), '</span>',
      '</div>',
      '<div class="movie-card__body">',
      '<h3>', escapeHtml(movie.title), '</h3>',
      '<p>', escapeHtml(movie.oneLine), '</p>',
      '<div class="movie-card__meta"><span>', escapeHtml(movie.region), '</span><span>', escapeHtml(movie.type), '</span><span>', escapeHtml(movie.year), '</span></div>',
      '</div>',
      '</a>',
      '</article>'
    ].join('');
  }

  var searchForm = document.querySelector('[data-search-form]');
  var searchInput = document.querySelector('[data-search-input]');
  var searchResults = document.querySelector('[data-search-results]');
  var searchSummary = document.querySelector('[data-search-summary]');

  if (searchResults && searchInput && window.MOVIE_SEARCH_DATA) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    searchInput.value = initialQuery;

    function runSearch() {
      var q = normalize(searchInput.value);
      var terms = q.split(/\s+/).filter(Boolean);
      var movies = window.MOVIE_SEARCH_DATA;
      var results = !terms.length
        ? movies.slice(0, 48)
        : movies.filter(function (movie) {
            var text = normalize([
              movie.title,
              movie.region,
              movie.type,
              movie.year,
              movie.category,
              movie.oneLine,
              (movie.tags || []).join(' ')
            ].join(' '));

            return terms.every(function (term) {
              return text.indexOf(term) !== -1;
            });
          }).slice(0, 120);

      searchResults.innerHTML = results.length
        ? results.map(movieCard).join('')
        : '<div class="empty-state">没有找到匹配影片，请尝试更换关键词。</div>';

      if (searchSummary) {
        searchSummary.textContent = terms.length
          ? '找到 ' + results.length + ' 条结果，最多展示前 120 条。'
          : '默认展示最新 48 部影片，可输入关键词继续筛选。';
      }
    }

    if (searchForm) {
      searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        var url = new URL(window.location.href);
        url.searchParams.set('q', searchInput.value.trim());
        window.history.replaceState({}, '', url.toString());
        runSearch();
      });
    }

    searchInput.addEventListener('input', runSearch);
    runSearch();
  }
})();
