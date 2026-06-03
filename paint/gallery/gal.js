// hi mt-tools!!! 🤣🤣🤣
const firebaseConfig = {
  apiKey: "AIzaSyBlzXn9bygeN_0AyDQHYDf2T2vO66WAzfw",
  authDomain: "paint-project-e3ecd.firebaseapp.com",
  projectId: "paint-project-e3ecd",
  storageBucket: "paint-project-e3ecd.firebasestorage.app",
  messagingSenderId: "141114177317",
  appId: "1:141114177317:web:9ca63f9d8cc1975c4a0ccc",
  measurementId: "G-Y7188HLWD8"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const $ = id => document.getElementById(id);

const gallery = $('gal');
const favG = $('fG');
const input = $('dLI');
const addBtn = $('aDB');
const pOvr = $('pO');
const pMsg = $('pM');
const edit = $('eB');
const remix = $('rB');
const clPo = $('ok');
const togFavB = $('tF');

clPo.addEventListener('click', () => pOvr.style.display = 'none');

let drawings = [];
let drawingIds = [];
let authorUsernames = {};
let drawID = null;

edit.onclick = () => drawID && (location.href = `/paint/#id=${drawID}`);
remix.onclick = () => drawID && (location.href = `/paint/#id=${drawID}`);

function cSI(src) {
  const img = document.createElement('img');
  img.src = src || '';
  img.onerror = () =>
    img.src = 'https://helloiti.github.io/assets/paint.png';
  return img;
}

async function fetchUsername(uid) {
  if (!uid) return "@unknown";
  if (authorUsernames[uid]) return authorUsernames[uid];

  try {
    const snap = await db.ref(`users/${uid}/username`).get();

    if (snap.exists()) {
      const val = snap.val();

      authorUsernames[uid] =
        "@" + (typeof val === 'string'
          ? val
          : val.username || "unknown");

      return authorUsernames[uid];
    }
  } catch {}

  return "@unknown";
}

async function sPFD(d, id) {
  drawID = id;

  const user = auth.currentUser;
  const username = await fetchUsername(d.authorId);

  pMsg.textContent = ` Drawing by: ${username} `;

  if (user && d.authorId === user.uid && !user.isAnonymous) {
    edit.style.display = 'inline-block';
    remix.style.display = 'none';
  } else {
    edit.style.display = 'none';
    remix.style.display = 'inline-block';
  }

  pOvr.style.display = 'flex';
}

async function loadDrawings() {
  try {
    const gSnap = await db.ref('gD').get();

    if (!gSnap.exists()) {
      gallery.innerHTML = '<p style="color:white;font-size:20px;">There is no drawings yet, maybe try uploading one?</p>';
      return;
    }

    drawingIds = Object.keys(gSnap.val());
    drawings = [];

    for (const id of drawingIds) {
      const dSnap = await db.ref('drawings/' + id).get();

      drawings.push(
        dSnap.exists()
          ? dSnap.val()
          : null
      );
    }

    displayGallery();
    displayFavorites();

  } catch (err) {
    console.error(err);
  }
}

function displayGallery() {
  gallery.innerHTML = '';

  const user = auth.currentUser;

  drawings.forEach((d, i) => {
    if (!d) return;

    const id = drawingIds[i];

    const div = document.createElement('div');
    div.className = 'g-i';

    if (
      user &&
      d.authorId === user.uid &&
      !user.isAnonymous
    ) {
      div.classList.add('g-i-o');
    }

    const img = cSI(d.image);

    img.addEventListener('click', () =>
      sPFD(d, id)
    );

    const btn = document.createElement('button');
    btn.className = 'l-b';

    const likes = d.likes || 0;

    const liked =
      JSON.parse(localStorage.getItem('lD') || '{}');

    btn.textContent =
      liked[id]
        ? `💖 ${likes}`
        : `❤️ ${likes}`;

    btn.addEventListener('click', async e => {
      e.stopPropagation();

      if (btn._busy) return;
      btn._busy = true;

      const ref =
        db.ref("drawings/" + id + "/likes");

      const map =
        JSON.parse(localStorage.getItem("lD") || "{}");

      const wasLiked = !!map[id];

      try {
        const result =
          await ref.transaction(cur =>
            wasLiked
              ? Math.max(0, (cur || 0) - 1)
              : (cur || 0) + 1
          );

        const newLikes =
          result.snapshot.val() || 0;

        if (wasLiked) {
          delete map[id];

          btn.textContent = `💔 ${newLikes}`;

          setTimeout(() => {
            btn.textContent = `❤️ ${newLikes}`;
          }, 600);

        } else {
          map[id] = true;
          btn.textContent = `💖 ${newLikes}`;
        }

        localStorage.setItem(
          'lD',
          JSON.stringify(map)
        );

        displayFavorites();

      } catch {}

      btn._busy = false;
    });

    div.append(img, btn);
    gallery.appendChild(div);
  });
}

function displayFavorites() {
  favG.innerHTML = '';

  const liked =
    JSON.parse(localStorage.getItem("lD") || "{}");

  drawingIds.forEach((id, i) => {
    if (!liked[id] || !drawings[i]) return;

    const div = document.createElement('div');
    div.className = 'g-i';

    const img = cSI(drawings[i].image);

    img.addEventListener('click', () =>
      sPFD(drawings[i], id)
    );

    div.appendChild(img);
    favG.appendChild(div);
  });
}

addBtn.addEventListener('click', async () => {
  const url = input.value.trim();

  const match =
    url.match(/#id=([A-Za-z0-9_-]+)/);

  if (!match) return;

  await db.ref('gD/' + match[1]).set(true);

  input.value = '';

  loadDrawings();
});

togFavB.addEventListener('click', () => {
  const hidden =
    favG.style.display === 'none';

  favG.style.display =
    hidden
      ? 'grid'
      : 'none';

  togFavB.textContent =
    hidden
      ? '※ Hide ※'
      : '※ Show ※';
});
