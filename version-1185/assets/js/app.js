(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function initMobileMenu() {
    var button = document.querySelector("[data-mobile-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      button.textContent = panel.classList.contains("is-open") ? "×" : "☰";
    });
  }

  function initHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === current);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    setInterval(function () {
      show(current + 1);
    }, 5000);
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var yearSelect = scope.querySelector("[data-filter-year]");
      var genreSelect = scope.querySelector("[data-filter-genre]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-search-card]"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }
      function apply() {
        var q = text(input && input.value);
        var y = text(yearSelect && yearSelect.value);
        var g = text(genreSelect && genreSelect.value);
        cards.forEach(function (card) {
          var haystack = text(card.getAttribute("data-keywords") + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-genre"));
          var year = text(card.getAttribute("data-year"));
          var genre = text(card.getAttribute("data-genre"));
          var ok = (!q || haystack.indexOf(q) !== -1) && (!y || year === y) && (!g || genre.indexOf(g) !== -1);
          card.classList.toggle("is-filtered-out", !ok);
        });
      }
      [input, yearSelect, genreSelect].forEach(function (node) {
        if (node) {
          node.addEventListener("input", apply);
          node.addEventListener("change", apply);
        }
      });
      apply();
    });
  }

  ready(function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
