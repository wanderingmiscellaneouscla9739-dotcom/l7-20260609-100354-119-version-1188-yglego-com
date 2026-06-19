(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero]').forEach(function(hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dotsHost = hero.querySelector('[data-hero-dots]');
    var index = 0;
    if (!slides.length) {
      return;
    }
    function setActive(next) {
      index = next;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      if (dotsHost) {
        Array.prototype.slice.call(dotsHost.children).forEach(function(dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }
    }
    if (dotsHost) {
      slides.forEach(function(_, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', '切换第' + (i + 1) + '屏');
        dot.addEventListener('click', function() {
          setActive(i);
        });
        dotsHost.appendChild(dot);
      });
    }
    setActive(0);
    window.setInterval(function() {
      setActive((index + 1) % slides.length);
    }, 5200);
  });

  document.querySelectorAll('[data-filter-scope]').forEach(function(scope) {
    var input = scope.querySelector('[data-search-input]');
    var year = scope.querySelector('[data-year-filter]');
    var region = scope.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      cards.forEach(function(card) {
        var text = (card.getAttribute('data-text') || '').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var cardRegion = card.getAttribute('data-region') || '';
        var show = true;
        if (query && text.indexOf(query) === -1) {
          show = false;
        }
        if (yearValue && cardYear !== yearValue) {
          show = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          show = false;
        }
        card.hidden = !show;
      });
    }
    [input, year, region].forEach(function(item) {
      if (item) {
        item.addEventListener('input', applyFilter);
        item.addEventListener('change', applyFilter);
      }
    });
  });
})();
