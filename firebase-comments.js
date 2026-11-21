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

  // Recommendations are private: no public Firestore read or rendering.
  if (form && nameInput && commentInput) {
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

  }
});
