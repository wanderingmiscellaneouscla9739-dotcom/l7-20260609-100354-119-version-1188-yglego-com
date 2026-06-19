(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (toggle && panel) {
            toggle.addEventListener("click", function () {
                panel.classList.toggle("is-open");
            });
        }

        var hero = document.querySelector("[data-hero]");
        if (hero) {
            setupHero(hero);
        }

        setupSearchPage();
        setupFilterPanel();
    });

    function setupHero(hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
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

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

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

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupSearchPage() {
        var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
        var params = new URLSearchParams(window.location.search);
        var query = (params.get("q") || "").trim().toLowerCase();
        forms.forEach(function (form) {
            var input = form.querySelector("input[name='q']");
            if (input) {
                input.value = query;
            }
        });
        var list = document.querySelector("[data-search-results]");
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search-card]"));
        var empty = document.querySelector("[data-empty-result]");
        var shown = 0;
        cards.forEach(function (card) {
            var text = (card.getAttribute("data-text") || "").toLowerCase();
            var match = !query || text.indexOf(query) !== -1;
            card.classList.toggle("is-hidden-card", !match);
            if (match) {
                shown += 1;
            }
        });
        if (empty) {
            empty.classList.toggle("is-visible", shown === 0);
        }
    }

    function setupFilterPanel() {
        var form = document.querySelector("[data-filter-form]");
        var list = document.querySelector("[data-filter-list]");
        if (!form || !list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-filter-card]"));
        var empty = document.querySelector("[data-empty-result]");

        function value(name) {
            var field = form.elements[name];
            return field ? String(field.value || "").trim().toLowerCase() : "";
        }

        function apply() {
            var keyword = value("keyword");
            var region = value("region");
            var year = value("year");
            var type = value("type");
            var shown = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-text") || "").toLowerCase();
                var cardRegion = (card.getAttribute("data-region") || "").toLowerCase();
                var cardYear = (card.getAttribute("data-year") || "").toLowerCase();
                var cardType = (card.getAttribute("data-type") || "").toLowerCase();
                var match = true;
                if (keyword && text.indexOf(keyword) === -1) {
                    match = false;
                }
                if (region && cardRegion !== region) {
                    match = false;
                }
                if (year && cardYear !== year) {
                    match = false;
                }
                if (type && cardType !== type) {
                    match = false;
                }
                card.classList.toggle("is-hidden-card", !match);
                if (match) {
                    shown += 1;
                }
            });
            if (empty) {
                empty.classList.toggle("is-visible", shown === 0);
            }
        }

        form.addEventListener("input", apply);
        form.addEventListener("change", apply);
        form.addEventListener("reset", function () {
            window.setTimeout(apply, 0);
        });
        apply();
    }

    window.initMoviePlayer = function (source) {
        ready(function () {
            var video = document.querySelector("[data-player-video]");
            var trigger = document.querySelector("[data-player-trigger]");
            var status = document.querySelector("[data-player-status]");
            var loaded = false;
            var hls = null;

            if (!video || !trigger || !source) {
                return;
            }

            function setStatus(text) {
                if (status) {
                    status.textContent = text || "";
                }
            }

            function beginPlayback() {
                trigger.classList.add("is-hidden");
                video.setAttribute("controls", "controls");
                setStatus("");
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setStatus("请点击播放");
                    });
                }
            }

            function loadSource() {
                if (loaded) {
                    beginPlayback();
                    return;
                }
                loaded = true;
                setStatus("正在加载...");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = source;
                    video.addEventListener("loadedmetadata", beginPlayback, { once: true });
                    video.load();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(source);
                    hls.attachMedia(video);
                    hls.on(window.Hls.Events.MANIFEST_PARSED, beginPlayback);
                    hls.on(window.Hls.Events.ERROR, function (event, data) {
                        if (!data || !data.fatal) {
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                            hls.startLoad();
                            return;
                        }
                        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                            hls.recoverMediaError();
                            return;
                        }
                        setStatus("视频加载失败，请稍后重试");
                    });
                    return;
                }
                setStatus("视频加载失败，请稍后重试");
            }

            trigger.addEventListener("click", loadSource);
            video.addEventListener("click", function () {
                if (!loaded) {
                    loadSource();
                    return;
                }
                if (video.paused) {
                    beginPlayback();
                } else {
                    video.pause();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    };
})();
