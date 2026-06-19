import { H as Hls } from './hls.js';

const video = document.querySelector('[data-player]');
const overlay = document.querySelector('[data-player-overlay]');
const playButton = document.querySelector('[data-play-button]');
const statusText = document.querySelector('[data-player-status]');
let initialized = false;
let hlsInstance = null;

function setStatus(message) {
  if (statusText) {
    statusText.textContent = message;
  }
}

function attachSource() {
  if (!video || initialized) {
    return;
  }

  const source = video.dataset.src;
  if (!source) {
    setStatus('未找到播放源');
    return;
  }

  if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = source;
    initialized = true;
    setStatus('播放器已就绪');
    return;
  }

  if (Hls && Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: false,
      backBufferLength: 90
    });

    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus('HLS 播放源已加载');
    });
    hlsInstance.on(Hls.Events.ERROR, function (_, data) {
      if (data && data.fatal) {
        setStatus('播放源加载异常，请刷新后重试');
      }
    });
    initialized = true;
    return;
  }

  setStatus('当前浏览器暂不支持 HLS 播放');
}

function beginPlayback() {
  attachSource();
  if (!video) {
    return;
  }
  if (overlay) {
    overlay.classList.add('is-hidden');
  }
  video.controls = true;
  const attempt = video.play();
  if (attempt && typeof attempt.catch === 'function') {
    attempt.catch(function () {
      setStatus('请再次点击播放器开始播放');
    });
  }
}

if (playButton) {
  playButton.addEventListener('click', beginPlayback);
}

if (video) {
  video.addEventListener('click', function () {
    if (!initialized) {
      beginPlayback();
    }
  });
  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });
  video.addEventListener('pause', function () {
    setStatus('播放器已暂停');
  });
}

window.addEventListener('beforeunload', function () {
  if (hlsInstance) {
    hlsInstance.destroy();
  }
});
