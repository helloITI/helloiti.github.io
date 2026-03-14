const firebaseConfig = {
  apiKey: "AIzaSyBVpaaiwzHah24ugYMXPS8F5l_oWi5sdLI",
  authDomain: "draw-e5ea1.firebaseapp.com",
  databaseURL: "https://draw-e5ea1-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "draw-e5ea1",
  storageBucket: "draw-e5ea1.firebasestorage.app",
  messagingSenderId: "749520633273",
  appId: "1:749520633273:web:b7a49d7588fe15e87c8a68"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const auth = firebase.auth();

const $ = id => document.getElementById(id);

const gallery = $('gallery');
const favoritesGallery = $('favoritesGallery');
const input = $('drawingLinkInput');
const addBtn = $('addDrawingBtn');
const popupOverlay = $('popupOverlay');
const popupMessage = $('popupMessage');
const editBtn = $('editBtn');
const remixBtn = $('remixBtn');
const closePopup = $('closePopup');
const toggleFavoritesBtn = $('toggleFavorites');

closePopup.addEventListener('click', () => popupOverlay.style.display = 'none');

let drawings = [];
let drawingIds = [];
let authorUsernames = {};
let currentPopupDrawingId = null;

editBtn.onclick = () => currentPopupDrawingId && (location.href = `/paint/#id=${currentPopupDrawingId}`);
remixBtn.onclick = () => currentPopupDrawingId && (location.href = `/paint/#id=${currentPopupDrawingId}`);

// === FIXED: only sign in anonymously if you're truly not logged in ===
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log(`✅ Logged in: ${user.isAnonymous ? 'Anonymous' : 'Real Account'} (${user.uid})`);
    loadDrawings();
  } else {
    console.log("No user found → signing in anonymously");
    auth.signInAnonymously().catch(err => {
      console.error("Anonymous sign-in failed:", err);
    });
  }
});

function createSafeImage(src) {
  const img = document.createElement('img');
  img.src = src || '';
  img.onerror = () => img.src = 'https://hellot.nekoweb.org/assets/paint.png';
  return img;
}

async function fetchUsername(uid) {
  if (!uid) return "@unknown";
  if (authorUsernames[uid]) return authorUsernames[uid];
  try {
    const snap = await db.ref(`users/${uid}/username`).get();
    if (snap.exists()) {
      const val = snap.val();
      authorUsernames[uid] = "@" + (typeof val === 'string' ? val : val.username || "unknown");
      return authorUsernames[uid];
    }
  } catch(e) {}
  return "@unknown";
}

async function showPopupForDrawing(d, id) {
  currentPopupDrawingId = id;
  const user = auth.currentUser;
  
  const username = await fetchUsername(d.authorId);
  popupMessage.textContent = `※⁜ drawing by: ${username} ⁜※`;

  if (user && d.authorId === user.uid && !user.isAnonymous) {
    editBtn.style.display = 'inline-block';
    remixBtn.style.display = 'none';
  } else {
    editBtn.style.display = 'none';
    remixBtn.style.display = 'inline-block';
  }
  popupOverlay.style.display = 'flex';
}

async function loadDrawings() {
  try {
    const gallerySnap = await db.ref('galleryDrawings').get();
    if (!gallerySnap.exists()) {
      gallery.innerHTML = '<p>No drawings yet.</p>';
      return;
    }
    drawingIds = Object.keys(gallerySnap.val());
    drawings = [];
    for (const id of drawingIds) {
      const dSnap = await db.ref('drawings/' + id).get();
      drawings.push(dSnap.exists() ? dSnap.val() : null);
    }
    displayGallery();
    displayFavorites();
  } catch(err) { console.error(err); }
}

function displayGallery() {
  gallery.innerHTML = '';
  const user = auth.currentUser;
  drawings.forEach((d, i) => {
    if (!d) return;
    const id = drawingIds[i];
    const div = document.createElement('div');
    div.className = 'gallery-item';
    if (user && d.authorId === user.uid && !user.isAnonymous) {
      div.classList.add('gallery-item-owner');
    }

    const img = createSafeImage(d.image);
    img.addEventListener('click', () => showPopupForDrawing(d, id));

    const likeBtn = document.createElement('button');
    likeBtn.className = 'like-btn';
    
    const likesCount = d.likes || 0;
    const likedMap = JSON.parse(localStorage.getItem('likedDrawings') || '{}');
    likeBtn.textContent = likedMap[id] ? `💖 ${likesCount}` : `❤️ ${likesCount}`;

    likeBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (likeBtn._busy) return;
      likeBtn._busy = true;

      const likesRef = db.ref("drawings/" + id + "/likes");
      const likedMapLocal = JSON.parse(localStorage.getItem("likedDrawings") || "{}");
      const wasLiked = !!likedMapLocal[id];

      try {
        const result = await likesRef.transaction(current => {
          return wasLiked ? Math.max(0, (current||0) - 1) : (current||0) + 1;
        });
        const newLikes = result.snapshot.val() || 0;

        if (wasLiked) {
          delete likedMapLocal[id];
          likeBtn.textContent = `💔 ${newLikes}`;
          setTimeout(() => likeBtn.textContent = `❤️ ${newLikes}`, 600);
        } else {
          likedMapLocal[id] = true;
          likeBtn.textContent = `💖 ${newLikes}`;
        }
        localStorage.setItem("likedDrawings", JSON.stringify(likedMapLocal));
        displayFavorites();
      } catch(err) {}
      likeBtn._busy = false;
    });

    div.append(img, likeBtn);
    gallery.appendChild(div);
  });
}

function displayFavorites() {
  favoritesGallery.innerHTML = '';
  const likedMap = JSON.parse(localStorage.getItem("likedDrawings") || "{}");
  drawingIds.forEach((id, i) => {
    if (!likedMap[id] || !drawings[i]) return;
    const div = document.createElement('div');
    div.className = 'gallery-item';
    const img = createSafeImage(drawings[i].image);
    img.addEventListener('click', () => showPopupForDrawing(drawings[i], id));
    div.appendChild(img);
    favoritesGallery.appendChild(div);
  });
}

addBtn.addEventListener('click', async () => {
  const url = input.value.trim();
  const match = url.match(/#id=([A-Za-z0-9_-]+)/);
  if (match) {
    await db.ref('galleryDrawings/' + match[1]).set(true);
    input.value = '';
    loadDrawings();
  }
});

toggleFavoritesBtn.addEventListener('click', () => {
  const hidden = favoritesGallery.style.display === 'none';
  favoritesGallery.style.display = hidden ? 'grid' : 'none';
  toggleFavoritesBtn.textContent = hidden ? '※⁜ hide ⁜※' : '※⁜ show ⁜※';
});