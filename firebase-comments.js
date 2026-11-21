document.addEventListener("DOMContentLoaded", () => {
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

  let rawPath = location.pathname;
  const normalizedPageId = ["/", "/index.html", "/index-en.html"].includes(rawPath) ? "home" : rawPath;

  const form = document.getElementById("commentForm");
  const commentsList = document.getElementById("commentsList");
  const nameInput = document.getElementById("name");
  const commentInput = document.getElementById("comment");
  const status = document.getElementById("commentsStatus");
  const isEnglish = document.documentElement.lang === "en";
  const messages = isEnglish
    ? { sent: "Your comment has been sent.", failed: "The comment could not be sent. Please try again.", loading: "Loading comments failed. Please try again later.", length: "Please use 2–80 characters for your name and 3–1000 for your comment.", sending: "Sending…" }
    : { sent: "Tu comentario se ha enviado.", failed: "No se pudo enviar el comentario. Vuelve a intentarlo.", loading: "No se pudieron cargar los comentarios.", length: "Utiliza entre 2 y 80 caracteres para el nombre y entre 3 y 1000 para el comentario.", sending: "Enviando…" };

  function setStatus(text) {
    if (status) status.textContent = text;
  }

  function renderComment(data) {
    // Firestore content is untrusted user input. Never insert it with innerHTML.
    const wrapper = document.createElement("div");
    wrapper.className = "comment";
    const author = document.createElement("strong");
    author.textContent = typeof data.name === "string" ? data.name.slice(0, 80) : "";
    const message = document.createElement("span");
    message.textContent = typeof data.comment === "string" ? data.comment.slice(0, 1000) : "";
    wrapper.append(author, document.createTextNode(": "), message);
    return wrapper;
  }

  if (form && commentsList && nameInput && commentInput) {
    const sendButton = form.querySelector('[type="submit"]');
    nameInput.setAttribute("maxlength", "80");
    commentInput.setAttribute("maxlength", "1000");
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const name = nameInput.value.trim();
      const comment = commentInput.value.trim();
      if (name.length < 2 || name.length > 80 || comment.length < 3 || comment.length > 1000) {
        setStatus(messages.length);
        return;
      }
      if (sendButton) sendButton.disabled = true;
      setStatus(messages.sending);
      try {
        await db.collection("comments").add({
          page: normalizedPageId,
          name: name,
          comment: comment,
          timestamp: Date.now()
        });
        form.reset();
        setStatus(messages.sent);
      } catch (error) {
        console.error("Comment submission error:", error);
        setStatus(messages.failed);
      } finally {
        if (sendButton) sendButton.disabled = false;
      }
    });

    // A single-field query avoids a composite Firestore index for page + timestamp.
    // Sorting happens locally; do not inject data into HTML.
    db.collection("comments")
      .where("page", "==", normalizedPageId)
      .limit(200)
      .onSnapshot((snapshot) => {
        const fragment = document.createDocumentFragment();
        const comments = snapshot.docs.map((doc) => doc.data());
        comments.sort((a, b) =>
          (typeof b.timestamp === "number" ? b.timestamp : 0) -
          (typeof a.timestamp === "number" ? a.timestamp : 0)
        );
        comments.slice(0, 50).forEach((comment) => {
          fragment.appendChild(renderComment(comment));
        });
        commentsList.replaceChildren(fragment);
        setStatus("");
      }, (error) => {
        console.error("Comment loading error:", error);
        setStatus(messages.loading);
      });
  }
});
