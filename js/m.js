document.addEventListener("click", function playMusic() {
const audio = document.getElementById("404");
audio.play().catch(err => console.log(err));
document.removeEventListener("click", playMusic);
});
