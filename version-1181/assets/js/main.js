(function() {
  var navToggle = document.querySelector(".nav-toggle");
  var mobileNav = document.querySelector(".mobile-nav");

  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function() {
      var open = mobileNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  var hero = document.querySelector("[data-hero]");
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var next = hero.querySelector("[data-hero-next]");
    var prev = hero.querySelector("[data-hero-prev]");
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function startTimer() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        showSlide(index + 1);
      }, 6000);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        startTimer();
      });
    });

    if (next) {
      next.addEventListener("click", function() {
        showSlide(index + 1);
        startTimer();
      });
    }

    if (prev) {
      prev.addEventListener("click", function() {
        showSlide(index - 1);
        startTimer();
      });
    }

    startTimer();
  }

  function normalize(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupFilters(scopeSelector) {
    var scope = document.querySelector(scopeSelector);
    if (!scope) {
      return;
    }
    var searchInput = scope.querySelector(".live-search");
    var typeSelect = scope.querySelector(".live-type");
    var resultLine = scope.querySelector("[data-result-line]") || document.querySelector("[data-result-line]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

    function runFilter() {
      var query = normalize(searchInput ? searchInput.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var shown = 0;

      cards.forEach(function(card) {
        var haystack = normalize(card.getAttribute("data-search") + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-year"));
        var cardType = normalize(card.getAttribute("data-type"));
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !type || cardType.indexOf(type) !== -1;
        var visible = matchQuery && matchType;
        card.hidden = !visible;
        if (visible) {
          shown += 1;
        }
      });

      if (resultLine) {
        resultLine.textContent = query || type ? "匹配影片：" + shown + " 部" : "频道片单";
      }
    }

    if (searchInput) {
      searchInput.addEventListener("input", runFilter);
    }
    if (typeSelect) {
      typeSelect.addEventListener("change", runFilter);
    }

    return runFilter;
  }

  document.querySelectorAll(".catalog-main, .search-results").forEach(function(area) {
    var parent = area.classList.contains("search-results") ? area.parentElement : area;
    if (parent) {
      var id = "filter-scope-" + Math.random().toString(36).slice(2);
      parent.setAttribute("data-filter-scope", id);
      var run = setupFilters('[data-filter-scope="' + id + '"]');
      if (run) {
        run();
      }
    }
  });

  var queryInput = document.querySelector("[data-query-input]");
  if (queryInput) {
    var params = new URLSearchParams(window.location.search);
    var value = params.get("q") || "";
    if (value) {
      queryInput.value = value;
      queryInput.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
})();
