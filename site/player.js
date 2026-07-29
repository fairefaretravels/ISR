// Island Spice Radio — continuous playlist player
// No time-of-day logic: this just plays videos back to back, in order (or shuffled).
//
// Videos are pulled from the /video folder in the repo (see playlist.json),
// combined across all categories into one continuous playlist.

// This script is loaded by site/index.html, which sits one level down from
// the repo root — so /video (a root-level sibling of /site) is reached with ../
const BASE = '../video';

// Filenames straight from playlist.json's "video" section, plus the vingle clips.
const FOLDERS = {
  am: [
    "Aaliyah - Four Page Letter.mp4",
    "Cool Kids - Black Mags.mp4",
    "Copy of Untitled (2).mp4",
    "Nas - The World Is Yours (Official Music Video).mp4",
    "Seinabo Sey - I Owe You Nothing.mp4",
    "Soul II Soul - Back To Life (However Do You Want Me) (Official Music Video).mp4",
    "production ID_3692634.mp4",
  ],
  day: [
    "Copy of Untitled (2).mp4",
    "Greatest freak out ever 2 (ORIGINAL VIDEO).mp4",
    "vid 2.mp4",
    "vid 3.mp4",
    "vid 4.mp4",
  ],
  late: [
    "Glenn Jones - We've Only Just Begun (The Romance Is Not Over).mp4",
    "Guy - Groove Me.mp4",
    "Isley, Jasper, Isley - Caravan of Love (Official Video).mp4",
    "John Forte - Ninety Nine Flash The Message Featuring Wyclef Jean, Pras & Jenny Fujita.mp4",
    "Mobb Deep - Quiet Storm ft. Lil' Kim (Official Video) ft. Lil' Kim.mp4",
    "Pebbles - Love Makes Things Happen (Official Video).mp4",
    "Yung Bleu - You're Mines Still (feat. Drake) [Official Video].mp4",
  ],
  '10at10': [
    "10.mp4",
    "2.mp4",
    "3.mp4",
    "3MESLOW.mp4",
    "4.mp4",
    "5.mp4",
    "6.mp4",
    "7.mp4",
    "8.mp4",
    "9.mp4",
  ],
  vingle: [
    "COMMERCIAL BREAK.mp4",
    "DJ MACKINTHEDARK.mp4",
  ],
};

function titleFromFilename(name) {
  return name.replace(/\.mp4$/i, '');
}

// Build the flat playlist: { title, src, thumb } — thumb is null since no
// poster images exist for these local files (unlike the old Cloudinary URLs,
// which auto-generated a still via the `so_2` transform).
const PLAYLIST = Object.entries(FOLDERS).flatMap(([folder, files]) =>
  files.map((name) => ({
    title: titleFromFilename(name),
    src: `${BASE}/${folder}/${encodeURIComponent(name)}`,
    thumb: null,
  }))
);

(function () {
  const videoEl      = document.getElementById('nowVideo');
  const titleEl      = document.getElementById('nowTitle');
  const upNextEl     = document.getElementById('nowUpNext');
  const reelEl       = document.getElementById('reel');
  const reelCountEl  = document.getElementById('reelCount');
  const prevBtn      = document.getElementById('prevBtn');
  const nextBtn      = document.getElementById('nextBtn');
  const shuffleBtn   = document.getElementById('shuffleBtn');
  const muteBtn      = document.getElementById('muteBtn');

  let order = PLAYLIST.map((_, i) => i);
  let position = 0; // index into `order`
  let shuffled = false;

  function currentIndex() {
    return order[position];
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function render() {
    const idx = currentIndex();
    const item = PLAYLIST[idx];
    videoEl.src = item.src;
    videoEl.play().catch(() => { /* autoplay may be blocked until user interacts */ });
    titleEl.textContent = item.title;

    const nextItem = PLAYLIST[order[(position + 1) % order.length]];
    upNextEl.innerHTML = `Up next: <b>${escapeHtml(nextItem.title)}</b>`;
    reelCountEl.textContent = `${position + 1} / ${order.length}`;

    // rebuild the reel
    reelEl.innerHTML = '';
    order.forEach((videoIdx, i) => {
      const v = PLAYLIST[videoIdx];
      const card = document.createElement('button');
      card.className = 'reel-card' + (i === position ? ' is-current' : '');
      card.innerHTML = v.thumb
        ? `<img class="reel-thumb" src="${v.thumb}" alt="" loading="lazy">
           <div class="reel-label"><div class="reel-name">${escapeHtml(v.title)}</div></div>`
        : `<div class="reel-label"><div class="reel-name">${escapeHtml(v.title)}</div></div>`;
      card.addEventListener('click', () => {
        position = i;
        render();
      });
      reelEl.appendChild(card);
    });
  }

  function advance(delta) {
    position = (position + delta + order.length) % order.length;
    render();
  }

  function shuffleOrder() {
    const arr = PLAYLIST.map((_, i) => i);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  videoEl.addEventListener('ended', () => advance(1));
  prevBtn.addEventListener('click', () => advance(-1));
  nextBtn.addEventListener('click', () => advance(1));
  shuffleBtn.addEventListener('click', () => {
    shuffled = !shuffled;
    shuffleBtn.classList.toggle('is-active', shuffled);
    const currentVideoIdx = currentIndex();
    order = shuffled ? shuffleOrder() : PLAYLIST.map((_, i) => i);
    position = order.indexOf(currentVideoIdx);
    render();
  });
  muteBtn.addEventListener('click', () => {
    videoEl.muted = !videoEl.muted;
    muteBtn.textContent = videoEl.muted ? 'Unmute' : 'Mute';
  });

  render();
})();
