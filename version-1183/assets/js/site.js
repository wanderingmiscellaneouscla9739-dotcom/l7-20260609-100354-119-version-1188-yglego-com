(function () {
  const toggle = document.querySelector('[data-nav-toggle]');
  const links = document.querySelector('[data-nav-links]');

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const input = form.querySelector('input[name="q"]');
      const query = input ? input.value.trim() : '';
      if (!query) {
        event.preventDefault();
        return;
      }
      event.preventDefault();
      window.location.href = './search.html?q=' + encodeURIComponent(query);
    });
  });

  const hero = document.querySelector('[data-hero]');
  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const previous = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let index = 0;
    let timer = null;

    const activate = function (nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    };

    const start = function () {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        activate(index + 1);
      }, 5200);
    };

    const restart = function () {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    };

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        activate(dotIndex);
        restart();
      });
    });

    if (previous) {
      previous.addEventListener('click', function () {
        activate(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        activate(index + 1);
        restart();
      });
    }

    start();
  }

  const filterForm = document.querySelector('[data-filter-form]');
  if (filterForm) {
    const keyword = filterForm.querySelector('[name="keyword"]');
    const year = filterForm.querySelector('[name="year"]');
    const type = filterForm.querySelector('[name="type"]');
    const cards = Array.from(document.querySelectorAll('[data-filter-card] .movie-card'));
    const status = document.querySelector('[data-filter-status]');

    const applyFilter = function () {
      const q = keyword ? keyword.value.trim().toLowerCase() : '';
      const y = year ? year.value : '';
      const t = type ? type.value : '';
      let visible = 0;

      cards.forEach(function (card) {
        const haystack = [card.dataset.title, card.dataset.region, card.dataset.type, card.dataset.category, card.dataset.tags]
          .join(' ')
          .toLowerCase();
        const matchedKeyword = !q || haystack.includes(q);
        const matchedYear = !y || card.dataset.year === y;
        const matchedType = !t || card.dataset.type.includes(t);
        const matched = matchedKeyword && matchedYear && matchedType;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (status) {
        status.textContent = '当前显示 ' + visible + ' 部影片';
      }
    };

    filterForm.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    [keyword, year, type].forEach(function (input) {
      if (input) {
        input.addEventListener('input', applyFilter);
        input.addEventListener('change', applyFilter);
      }
    });
    applyFilter();
  }
}());
