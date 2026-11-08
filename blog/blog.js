/* ?BUILD=1 */
(function () {
  var posts = (window.POSTS || []).slice().sort(function (a, b) {
    return a.date < b.date ? 1 : a.date > b.date ? -1 : 0;
  });

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function slug(tag) {
    return String(tag).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }
  function entry(p, showAbout) {
    return '<div class="entry">' +
      '<span class="d">' + esc(p.date) + '</span> » <a href="' + esc(p.file) + '">' + esc(p.title) + '</a>' +
      (showAbout && p.about ? '<p class="about">' + esc(p.about) + '</p>' : '') +
      '</div>';
  }

  // /* BLOG_LIST */
  var list = document.getElementById("post-list");
  if (list) {
    list.innerHTML = posts.map(function (p) { return entry(p, true); }).join("\n");
  }

  ///* TAG_PAGE */
  var tagList = document.getElementById("tag-list");
  if (tagList) {
    var byTag = {};
    posts.forEach(function (p) {
      (p.tags || []).forEach(function (t) {
        (byTag[t] = byTag[t] || []).push(p);
      });
    });
    var names = Object.keys(byTag).sort();
    tagList.innerHTML = names.map(function (t) {
      return '<div class="mn" id="' + slug(t) + '">' +
        '<center><h1> ' + esc(t) + ' </h1></center>' +
        byTag[t].map(function (p) { return entry(p, false); }).join("\n") +
        '</div>';
    }).join("<br>\n<hr><br>\n");

    if (location.hash) {
      var target = document.getElementById(location.hash.slice(1));
      if (target) target.scrollIntoView();
    }
  }

  /* SING_POST */
  var tagsEl = document.getElementById("post-tags");
  var navEl = document.getElementById("post-nav");
  if (tagsEl || navEl) {
    var current = decodeURIComponent(location.pathname.split("/").pop());
    var i = posts.findIndex(function (p) { return p.file === current; });
    if (i !== -1) {
      var dateEl = document.getElementById("post-date");
      if (dateEl) dateEl.textContent = posts[i].date;
      if (tagsEl) {
        var tags = posts[i].tags || [];
        tagsEl.innerHTML = tags.length
          ? "Tags: " + tags.map(function (t) {
              return '<a href="tags.html#' + slug(t) + '">' + esc(t) + '</a>';
            }).join(", ")
          : "";
      }
      if (navEl) {
        var older = posts[i + 1], newer = posts[i - 1];
        navEl.innerHTML =
          (older ? '<a href="' + esc(older.file) + '">« ' + esc(older.title) + '</a>' : '<span></span>') +
          '<a href="/blog/">All posts</a>' +
          (newer ? '<a href="' + esc(newer.file) + '">' + esc(newer.title) + ' »</a>' : '<span></span>');
      }
    }
  }
})();
