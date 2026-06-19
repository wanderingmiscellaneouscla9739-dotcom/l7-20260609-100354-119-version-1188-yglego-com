(function () {
  function showMessage(player, text) {
    var message = player.querySelector('[data-player-message]');
    if (message) {
      message.textContent = text || '';
    }
  }

  function playVideo(player) {
    var video = player.querySelector('video');
    var source = player.getAttribute('data-src');

    if (!video || !source) {
      showMessage(player, '未找到可用播放源');
      return;
    }

    function startPlayback() {
      player.classList.add('is-playing');
      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          showMessage(player, '浏览器阻止了自动播放，请再次点击播放器。');
        });
      }
    }

    if (video.dataset.loaded === 'true') {
      startPlayback();
      return;
    }

    showMessage(player, '正在加载播放源...');

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });

      hls.loadSource(source);
      hls.attachMedia(video);

      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        video.dataset.loaded = 'true';
        showMessage(player, '');
        startPlayback();
      });

      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }

        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          showMessage(player, '网络加载异常，正在尝试恢复...');
          hls.startLoad();
          return;
        }

        if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          showMessage(player, '媒体解析异常，正在尝试恢复...');
          hls.recoverMediaError();
          return;
        }

        showMessage(player, '当前浏览器暂时无法播放该视频源。');
        hls.destroy();
      });

      player._hls = hls;
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      video.dataset.loaded = 'true';
      video.addEventListener('loadedmetadata', function () {
        showMessage(player, '');
        startPlayback();
      }, { once: true });
      video.load();
      return;
    }

    showMessage(player, '您的浏览器不支持 HLS 播放，请更换浏览器或启用 HLS 支持。');
  }

  document.querySelectorAll('[data-player]').forEach(function (player) {
    var start = player.querySelector('[data-player-start]');
    var video = player.querySelector('video');

    if (start) {
      start.addEventListener('click', function () {
        playVideo(player);
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!video.dataset.loaded) {
          playVideo(player);
          return;
        }

        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
      });
    }
  });
})();
