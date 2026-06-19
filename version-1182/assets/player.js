import { H as Hls } from './hls.js';

const players = document.querySelectorAll('[data-player]');

for (const player of players) {
  const video = player.querySelector('video');
  const startButton = player.querySelector('.player-start');
  const message = player.querySelector('[data-player-message]');
  const source = video ? video.dataset.hlsSource : '';
  let hls = null;
  let prepared = false;

  const showMessage = (text) => {
    if (!message) {
      return;
    }
    message.textContent = text;
    message.hidden = false;
  };

  const prepareVideo = () => {
    if (!video || prepared || !source) {
      return;
    }

    prepared = true;

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
          hls.startLoad();
          return;
        }
        if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
          hls.recoverMediaError();
          return;
        }
        showMessage('播放暂时不可用，请稍后再试');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else {
      showMessage('播放暂时不可用，请稍后再试');
    }
  };

  const playVideo = async () => {
    prepareVideo();
    if (!video) {
      return;
    }
    video.setAttribute('controls', 'controls');
    try {
      await video.play();
      player.classList.add('is-playing');
    } catch (error) {
      showMessage('点击播放器后即可继续观看');
    }
  };

  if (startButton) {
    startButton.addEventListener('click', playVideo);
  }

  if (video) {
    video.addEventListener('click', () => {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', () => {
      player.classList.add('is-playing');
    });
    video.addEventListener('pause', () => {
      player.classList.remove('is-playing');
    });
  }

  window.addEventListener('pagehide', () => {
    if (hls) {
      hls.destroy();
    }
  });
}
