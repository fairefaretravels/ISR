// Island Spice Radio — Hero + Radio Controller

(function () {
  'use strict';

  const hero = document.getElementById('heroSection');
  const reel = document.getElementById('reel');

  const audio = document.getElementById('audioEl');
  const listenBtn = document.getElementById('listenBtn');
  const listenLabel = document.getElementById('listenLabel');

  const soundBtn = document.getElementById('soundBtn');

  const menu = document.getElementById('menu');
  const menuBtn = document.getElementById('menuBtn');

  const reelIndex = document.getElementById('reelIndex');
  const reelButtons = reelIndex
    ? Array.from(reelIndex.querySelectorAll('button'))
    : [];

  const videos = Array.from(
    document.querySelectorAll('.hero-clip')
  );

  const vingleVideo = document.getElementById('vingleVideo');

  // =========================================================
  // RADIO STREAM
  // =========================================================

  // IMPORTANT:
  // Replace this with your actual working radio stream URL
  // if your current site uses a different stream.
  const RADIO_STREAM =
    'https://listen.streamaudio.co/proxy/sanecatv/stream';

  let radioPlaying = false;

  function updateRadioButton() {
    listenBtn.dataset.playing = radioPlaying ? 'true' : 'false';
    listenBtn.setAttribute(
      'aria-pressed',
      radioPlaying ? 'true' : 'false'
    );

    if (listenLabel) {
      listenLabel.textContent = radioPlaying
        ? 'Stop listening'
        : 'Listen live';
    }

    if (radioPlaying) {
      hero.dataset.mode = 'listen';
    } else {
      hero.dataset.mode = 'reel';
    }
  }

  async function startRadio() {
    try {
      // Only assign the source when necessary.
      if (!audio.src || !audio.src.includes(RADIO_STREAM)) {
        audio.src = RADIO_STREAM;
      }

      await audio.play();

      radioPlaying = true;
      updateRadioButton();

      // Stop hero videos while radio is playing.
      videos.forEach(video => {
        video.pause();
      });

      if (vingleVideo) {
        vingleVideo.pause();
      }

    } catch (error) {
      console.error('Island Spice Radio could not start:', error);

      radioPlaying = false;
      updateRadioButton();

      alert(
        'The radio stream could not start. Please tap Listen live again.'
      );
    }
  }

  function stopRadio() {
    audio.pause();

    // Don't clear src — keeping it makes restarting faster.
    radioPlaying = false;

    updateRadioButton();

    // Return to the hero reel.
    playCurrentReel();
  }

  listenBtn.addEventListener('click', function () {
    if (radioPlaying) {
      stopRadio();
    } else {
      startRadio();
    }
  });

  audio.addEventListener('playing', function () {
    radioPlaying = true;
    updateRadioButton();
  });

  audio.addEventListener('pause', function () {
    if (!audio.ended) {
      radioPlaying = false;
      updateRadioButton();
    }
  });

  audio.addEventListener('error', function () {
    console.error('Radio stream error:', audio.error);

    radioPlaying = false;
    updateRadioButton();
  });


  // =========================================================
  // HERO VIDEO REEL
  // =========================================================

  let currentVideo = 0;

  function showVideo(index) {
    if (!videos.length) return;

    currentVideo =
      (index + videos.length) % videos.length;

    videos.forEach((video, i) => {
      const active = i === currentVideo;

      video.classList.toggle('is-active', active);

      if (active) {
        video.currentTime = 0;

        if (!radioPlaying) {
          video.play().catch(() => {
            // Browser may block autoplay.
            // That's okay — the video will still work
            // after the user interacts with the page.
          });
        }
      } else {
        video.pause();
      }
    });

    reelButtons.forEach((button, i) => {
      button.classList.toggle(
        'is-active',
        i === currentVideo
      );
    });
  }

  function playCurrentReel() {
    if (radioPlaying) return;

    showVideo(currentVideo);
  }

  videos.forEach((video, index) => {
    video.addEventListener('ended', function () {
      if (radioPlaying) return;

      const next =
        (index + 1) % videos.length;

      showVideo(next);
    });
  });

  reelButtons.forEach(button => {
    button.addEventListener('click', function () {
      const index = Number(this.dataset.i);

      if (!Number.isNaN(index)) {
        // If radio is playing, stop it first.
        if (radioPlaying) {
          stopRadio();
        }

        showVideo(index);
      }
    });
  });


  // =========================================================
  // REEL SOUND / MUTE
  // =========================================================

  let reelMuted = true;

  function updateSoundButton() {
    soundBtn.dataset.muted =
      reelMuted ? 'true' : 'false';

    soundBtn.setAttribute(
      'aria-pressed',
      reelMuted ? 'false' : 'true'
    );

    soundBtn.setAttribute(
      'aria-label',
      reelMuted
        ? 'Unmute reel audio'
        : 'Mute reel audio'
    );
  }

  function setReelMute(muted) {
    reelMuted = muted;

    videos.forEach(video => {
      video.muted = muted;
    });

    if (vingleVideo) {
      vingleVideo.muted = muted;
    }

    updateSoundButton();
  }

  soundBtn.addEventListener('click', function () {
    setReelMute(!reelMuted);

    // Make sure the active video is actually playing.
    if (!radioPlaying) {
      const activeVideo = videos[currentVideo];

      if (activeVideo) {
        activeVideo.play().catch(() => {});
      }
    }
  });


  // =========================================================
  // MENU
  // =========================================================

  function openMenu() {
    menu.classList.add('is-open');
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    menu.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  menuBtn.addEventListener('click', function (event) {
    event.stopPropagation();

    if (menu.classList.contains('is-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', function (event) {
    if (!menu.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  });


  // =========================================================
  // MENU LINKS
  // =========================================================

  const menuLinks = menu.querySelectorAll(
    '.menu-panel a'
  );

  menuLinks.forEach(link => {
    link.addEventListener('click', function () {
      closeMenu();
    });
  });


  // =========================================================
  // INITIAL STATE
  // =========================================================

  updateRadioButton();
  updateSoundButton();

  // Make all reel videos muted initially.
  videos.forEach(video => {
    video.muted = true;
  });

  if (vingleVideo) {
    vingleVideo.muted = true;
  }

  // Start the first hero video.
  showVideo(0);

})();
