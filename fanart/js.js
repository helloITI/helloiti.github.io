  document.addEventListener("click", function playMusic() {
    const audio = document.getElementById("ok");
    audio.play().catch(err => console.log(err));
    
    document.removeEventListener("click", playMusic);
  });
