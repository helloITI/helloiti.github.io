document.addEventListener("DOMContentLoaded", () => {
const mu = document.getElementById("mu");let bf = "";
window.addEventListener("keydown", (e) => {if (!mu) return;
bf += e.key.toLowerCase();if (bf.length > 10) bf = bf.slice(-10);
function ps(src) {mu.pause();mu.src = src;mu.load();mu.loop = true;
mu.play().then(() => {console.log("playing");}).catch(console.error);bf = "";}
if (bf.includes("mii")) {ps("https://helloiti.github.io/assets/mk.mp3");
} else if (bf.includes("creator")) {ps("https://helloiti.github.io/assets/0.mp3");
} else if (bf.includes("armin")) {location.href = "https://helloiti.github.io/assets/How_Did_You_Found_This.mp4";
} else if (bf.includes("wiiu")) {ps("https://helloiti.github.io/assets/mii.mp3");
} else if (bf.includes("w")) {ps("https://helloiti.github.io/assets/PEAK.mp3");}});
document.addEventListener("click", function pm() {mu.play().catch(console.error);document.removeEventListener("click", pm);});});
