const translations = {
      en: {
        title: "seal of HelloT", h1: "Each click updates a global counter!", button: "Yap Yoo!",
        messages: ["1 click = 1 seal will appear on someone's door /j","1 click = 100000 slay rizz 💅","1 click = +1 Baddie 😍","1 click = the seal will fly (not really)","1 click = 1 more minute of screentime for me 🤤","1 click = 1 more day of summer (NOT REAL :(( )","1 click = You become immortal 😱 (NO)","1 click = MrBreast will give you 1000000 BILKION 🤑","1 click = Donation to TEAM SEALS, (i'm poor ok?)","1 click = GTA6 will come 1 hour earlier","1 click = 1 glass of Fart Free Water!","1 click = parapa 🥹","1 click = + 0.0001% possibility of Hellot seal cameo in webroom.","1 click = 1 temu ad terminated 💅","1 click = MORE SEALS 🤑 /j","1 click = Update to the global counter! /srs","1 click = Good luck","1 click = 1 italian brainrot meme killed.","1 click = 1 labubu will explode!!!!"]
      },
      es: {
        title: "foca de HelloT", h1: "¡Cada clic actualiza un contador global!", button: "¡Yap Yoo!",
        messages: ["1 clic = 1 foca aparecerá en la puerta de alguien /j","1 clic = 100000 slay rizz 💅","1 clic = +1 Baddie 😍","1 clic = el foca volará (no realmente)","1 clic = 1 minuto más de tiempo frente a la pantalla 🤤","1 clic = 1 día más de verano (NO REAL :(( )","1 clic = Te vuelves inmortal 😱 (NO)","1 clic = MrBreast te dará 1000000 BILKION 🤑","1 clic = Donación a TEAM SEALS, (estoy pobre ok?)","1 clic = GTA6 llegará 1 hora antes","1 clic = 1 vaso de agua libre de pedos!","1 clic = parapa 🥹","1 clic = + 0.0001% posibilidad de cameo del foca Hellot en webroom.","1 clic = 1 anuncio de temu terminado 💅","1 clic = MÁS FOCAS 🤑 /j","1 clic = Actualiza el contador global! /srs","1 clic = Buena suerte","1 clic = 1 meme italiano eliminado.","1 clic = 1 labubu explotará!!!!"]
      },
      fi: {
        title: "HelloT:n hylje", h1: "Jokainen klikkaus päivittää julkisen laskurin!", button: "Jäp Joo!",
        messages: ["1 klikki = 1 hylje teleportaalisesti ilmestyy jonkun ovelle /j","1 klikki = 100000 slay rizz 💅","1 klikki = +1 Baddie 😍","1 klikki = hylje lentää (nah bro)","1 klikki = 1 minuutti lisää ruutuaikaa mulle 🤤","1 klikki = 1 päivä lisää kesälomaa (EI AITO BRO :(( )","1 klikki = Susta tulee immortaali 😱 (EI OIKEESTI)","1 klikki = MrBreast(herra tissi :D) antaa sulle 1000000 MILJARDEITA 🤑","1 klikki = Lahjoitus TEAM SEALS järjrstölle, (oon käyhö okei?)","1 klikki = GTA6 julkaistaan tunti aikaisemmin","1 klikki = 1 lasillinen Pierun vapaata vettä!","1 klikki = parapa 🥹","1 klikki = + 0.0001% mahdollisuutta että HelloT hylje saapuu WebRoomiin.","1 klikki = 1 temu mainos poistettu 💅","1 klikki = LISÄÄ HYLJEITÄ 🤑 /j","1 klikki = Päivitys laskuriin! /srs","1 klikki = Hyvää onnea","1 klikki = 1 italian brainrot meemi kuolee fyysisesti.","1 klikki = 1 labubu räjähtää lol!!!!"]
      },
      fr: {
        title: "Le phoque de HelloT", h1: "Chaque clic met à jour un compteur global.", button: "Yap Yoo!",
        messages: ["1 clic = 1 phoque apparaîtra sur la porte de quelqu'un /j","1 clic = 100000 slay rizz 💅","1 clic = +1 Baddie 😍","1 clic = le phoque volera (pas vraiment)","1 clic = 1 autre minute de temps d'écran pour moi🤤","1 clic = 1 autre journée des vacances d'été (PAS RÉEL :(( )","1 clic = Tu deviens immortel😱 (NON)","1 clic = MrBreast te donnera 1000000 MILLIARDS🤑","1 clic = Don pour TEAM SEALS, (je suis pauvre ok?)","1 clic = GTA6 sortira 1 heure plus tôt","1 clic = 1 verre d'eau sans pets","1 clic = parapa 🥹","1 clic = + 0.0001% de possibilité d'un caméo du phoque HelloT dans Webroom","1 clic = 1 publicité temu tuée 💅","1 clic = PLUS DE PHOQUES 🤑 /j","1 clic = Mise à jour au compteur global /srs","1 clic = Bonne chance","1 clic = 1 mème brainrot italien tué","1 clic = 1 labubu explosera!!!!"]
      }
    };
    function setLanguage(lang = 'en') {
      const t = translations[lang] || translations['en'];
      document.title = t.title;
      document.querySelector('h1').textContent = t.h1;
      document.getElementById('seal-btn').textContent = t.button;
      document.getElementById('click-message').textContent = t.messages[Math.floor(Math.random() * t.messages.length)];
    }
    const langSelector = document.getElementById('lang-selector');
    langSelector.addEventListener('change', e => setLanguage(e.target.value));
    setLanguage('en');
