// hi mt-tools!!! 🤣🤣🤣
const [_a,_b,_c,_d,_e,_f,_g,_h] = ["QUl6YVN5Qmx6WG45YnlnZU5fMEF5RFFIWURmMlQydk82NldBemZ3","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZWFwcC5jb20","aHR0cHM6Ly9wYWludC1wcm9qZWN0LWUzZWNkLWRlZmF1bHQtcnRkYi5ldXJvcGUtd2VzdDEuZmlyZWJhc2VkYXRhYmFzZS5hcHA","cGFpbnQtcHJvamVjdC1lM2VjZA","cGFpbnQtcHJvamVjdC1lM2VjZC5maXJlYmFzZXN0b3JhZ2UuYXBw","MTQxMTE0MTc3MzE3","MToxNDExMTQxNzczMTc6d2ViOmQ2Yzc4MTU1ZjI4MzdlN2I0YTBjY2M","Ry0yNTNDMUhaQjFW"].map(atob);
const firebaseConfig = {apiKey:_a,authDomain:_b,databaseURL:_c,projectId:_d,storageBucket:_e,messagingSenderId:_f,appId:_g,measurementId:_h};
firebase.initializeApp(firebaseConfig);const db = firebase.database();const auth = firebase.auth();const $ = id => document.getElementById(id);
const gallery = $('gal');const favG = $('fG');const input = $('dLI');const addBtn = $('aDB');const pOvr = $('pO');const pMsg = $('pM');const edit = $('eB');const remix = $('rB');const clPo = $('ok');const togFavB = $('tF');
clPo.addEventListener('click', () => pOvr.style.display = 'none');
let drawings = [];let drawingIds = [];let authorUsernames = {};let drawID = null;
edit.onclick = () => drawID && (location.href = `/paint/#id=${drawID}`);remix.onclick = () => drawID && (location.href = `/paint/#id=${drawID}`);
function cSI(src) {const img = document.createElement('img');img.src = src || '';img.onerror = () =>img.src = 'https://helloiti.github.io/assets/paint.png';return img;}

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
