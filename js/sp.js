document.addEventListener("DOMContentLoaded", () => {
    const si = document.getElementById("hs");
    const pop = document.getElementById("pop");

    function pl() {
        if (!pop) return;

        pop.currentTime = 0;
        pop.play().catch(() => {});
    }

    if (si) {
        si.addEventListener("mouseenter", pl);
        si.addEventListener("touchstart", pl, { passive: true });
        si.addEventListener("click", pl);
    } else {
        console.warn('element with id="hs" was not found');
    }
});
