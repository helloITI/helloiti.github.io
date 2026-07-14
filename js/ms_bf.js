const mu = document.getElementById("bg"); let bf = ''; window.addEventListener('keydown', (e) => { bf += e.key.toLowerCase(); if (bf.length > 10) bf = bf.slice(-10);
if (bf.includes('mii')) { mu.src = 'https://helloiti.github.io/assets/mk.mp3'; mu.loop = true; mu.play().catch(() => {}); bf = ''; 
}if (bf.includes('creator')) { mu.src = 'https://helloiti.github.io/assets/0.mp3'; mu.loop = true; mu.play().catch(() => {}); bf = '';
}if (bf.includes('armin')) { window.location.href = "https://helloiti.github.io/assets/How_Did_You_Found_This.mp4";
}if (bf.includes('a')) { mu.src = 'https://helloiti.github.io/assets/mii.mp3'; mu.loop = true; mu.play().catch(() => {}); bf = '';
}if (bf.includes('w')) { mu.src = 'https://helloiti.github.io/assets/PEAK.mp3'; mu.loop = true; mu.play().catch(() => {}); bf = ''; } });
document.addEventListener("click", function pm() {if (mu && mu.src) {mu.play().catch(() => {});}document.removeEventListener("click", pm);});
