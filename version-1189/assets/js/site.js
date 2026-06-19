(function () {
  function onReady(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-nav]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-slide-target]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    if (slides.length === 0) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = parseInt(dot.getAttribute("data-slide-target"), 10);
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll("[data-filter-scope]"));
    scopes.forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-filter-empty]");
      if (!input || cards.length === 0) {
        return;
      }
      function applyFilter() {
        var term = input.value.trim().toLowerCase();
        var visible = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = term === "" || text.indexOf(term) !== -1;
          card.classList.toggle("hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle("show", visible === 0);
        }
      }
      input.addEventListener("input", applyFilter);
      applyFilter();
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
    players.forEach(function (shell) {
      var video = shell.querySelector("video");
      var button = shell.querySelector("[data-play-button]");
      var status = shell.querySelector("[data-video-status]");
      if (!video || !button) {
        return;
      }
      var src = video.getAttribute("data-src");
      var loaded = false;
      var hls = null;

      function setStatus(message) {
        if (!status) {
          return;
        }
        status.textContent = message || "";
        status.classList.toggle("show", Boolean(message));
      }

      function loadSource(callback) {
        if (loaded) {
          callback();
          return;
        }
        if (!src) {
          setStatus("视频源暂不可用");
          return;
        }
        video.setAttribute("controls", "controls");
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            loaded = true;
            setStatus("");
            callback();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (data && data.fatal) {
              setStatus("视频加载失败，请稍后再试");
            }
          });
          return;
        }
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = src;
          loaded = true;
          setStatus("");
          callback();
          return;
        }
        setStatus("当前浏览器不支持该播放格式");
      }

      function playVideo() {
        loadSource(function () {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              setStatus("点击视频区域可继续播放");
            });
          }
        });
      }

      button.addEventListener("click", playVideo);
      video.addEventListener("click", function () {
        if (video.paused) {
          playVideo();
        } else {
          video.pause();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("playing");
        setStatus("");
      });
      video.addEventListener("pause", function () {
        shell.classList.remove("playing");
      });
      video.addEventListener("error", function () {
        setStatus("视频加载失败，请稍后再试");
      });
      window.addEventListener("beforeunload", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  onReady(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
