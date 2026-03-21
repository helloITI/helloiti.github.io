document.addEventListener("DOMContentLoaded", () => {
  const sl = document.getElementById("il"); // what if helloT LEGO existed IRL? //
  const lg = document.getElementById("lg");

  if (!sl) return; // prevents crash if element is missing!

  const os = sl.getAttribute("src"); // safer than sl.src :D

  function osl() {
    sl.src = "https://helloiti.github.io/img/helloTop.png";
    if (lg) {
      lg.currentTime = 0;
      lg.play().catch(() => {});
    }
  } // Hi

  function csl() {
    sl.src = os;
  }

  sl.addEventListener("mouseenter", osl);
  sl.addEventListener("mouseleave", csl);

  // better mobile support!!!
  sl.addEventListener("touchstart", osl, { passive: true });
  sl.addEventListener("touchend", csl);

  // optional: toggle on click instead of forcing same image... ://
  sl.addEventListener("click", () => {
    if (sl.src.includes("helloTop.png")) {
      csl();
    } else {
      osl();
    }
  });
});
