document.addEventListener("DOMContentLoaded", () => { const sl = document.getElementById("il"); //
const lg = document.getElementById("lg"); if (!sl) return; // prevents crash if element is missing :O
const os = sl.getAttribute("src"); //
function osl() { sl.src = "https://helloiti.github.io/img/helloTop.png"; if (lg) { lg.currentTime = 0; lg.play().catch(() => {}); } } // Hi
function csl() { sl.src = os; } sl.addEventListener("mouseenter", osl); sl.addEventListener("mouseleave", csl); sl.addEventListener("touchstart", osl, { passive: true }); sl.addEventListener("touchend", csl); // better mobile support!!!
sl.addEventListener("click", () => { if (sl.src.includes("helloTop.png")) { csl(); } else { osl(); } }); }); //
