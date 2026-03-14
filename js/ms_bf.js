    const mu = document.getElementById("bg"); // ok mañana 🤣🫱 //
    let bf = '';
    window.addEventListener('keydown', (e) => {
      bf += e.key.toLowerCase();
      if (bf.length > 10) bf = bf.slice(-10);
      if (bf.includes('mii')) {
        mu.src = 'https://file.garden/aRzXHaa7jkbrRXjj/seal_song.mp3'; // Ameebo 💜 //
        mu.loop = true;
        mu.play().catch(() => {});
        bf = '';
      }
      if (bf.includes('creator')) {
        mu.src = 'https://file.garden/aRzXHaa7jkbrRXjj/0.mp3'; // Petah, the Creator is here. //
        mu.loop = true;
        mu.play().catch(() => {});
        bf = '';
      }
      if (bf.includes('armin')) { // this society is so AR AR ARMIN 💜 //
        window.location.href = "https://hellot.nekoweb.org/assets/How_Did_You_Found_This.mp4"; // ar ar armin //
      }
      if (bf.includes('w')) {
        mu.src = 'https://file.garden/aRzXHaa7jkbrRXjj/PEAK.mp3'; // again, creds to RottenMemsYT for making the music!! //
        mu.loop = true;
        mu.play().catch(() => {});
        bf = '';
      }
    });
    document.addEventListener("click", function pm() {
      mu.play().catch(err => {});
      document.removeEventListener("click", pm);
    });
    // poop ♪ //