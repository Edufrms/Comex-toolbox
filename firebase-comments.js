// Firebase SDKs
const firebaseConfig = {
  apiKey: "AIzaSyAuVJynIyGExA2rMjOTUt8JuRxmxnYoRCM",
  authDomain: "comextoolbox.firebaseapp.com",
  projectId: "comextoolbox",
  storageBucket: "comextoolbox.appspot.com",
  messagingSenderId: "822470767336",
  appId: "1:822470767336:web:3ddee1fe58209444934f5d"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Detecta la página actual para guardar los comentarios por URL
let rawPath = location.pathname;
const normalizedPageId = ["/", "/index.html", "/index-en.html"].includes(rawPath) ? "home" : rawPath;
const form = document.getElementById("commentForm");
const commentsList = document.getElementById("commentsList");

if (form && commentsList) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value.trim();
    const comment = document.getElementById("comment").value.trim();
    if (!name || !comment) return;

    await db.collection("comments").add({
      page: pageId,
      name: name,
      comment: comment,
      timestamp: Date.now()
    });

    form.reset();
  });

  db.collection("comments")
    .where("page", "==", pageId)
    .orderBy("timestamp", "desc")
    .onSnapshot((snapshot) => {
      commentsList.innerHTML = "";
      snapshot.forEach((doc) => {
        const c = doc.data();
        commentsList.innerHTML += `
          <div class="comment">
            <strong>${c.name}</strong>: ${c.comment}
          </div>
        `;
      });
    });
}
