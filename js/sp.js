  const si = document.getElementById("hs");
  const pop = document.getElementById("pop");
  function pl() {
    if (!pop) return;
    pop.currentTime = 0;
    pop.play().catch(() => {});
  }
  si.addEventListener("mouseenter", pl);
  si.addEventListener("touchstart", pl);
  si.addEventListener("click", pl);