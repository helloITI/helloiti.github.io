if ( location.pathname.startsWith('/mae/') &&location.pathname !== '/mae/404.html' ) {
document.title = 'Page not found';
let favicon = document.querySelector('link[rel="icon"]');
if (!favicon) { favicon = document.createElement('link');favicon.rel = 'icon';document.head.appendChild(favicon); }
favicon.type = 'image/x-icon';favicon.href = 'https://helloiti.github.io/mae/favicon.ico';document.body.innerHTML = '';document.body.style.cssText = ` background: none;margin: 0;padding: 0;height: 100vh;display: block;overflow: hidden; `;
const iframe = document.createElement('iframe');iframe.src = '/mae/404.html';iframe.style.width = '100vw';iframe.style.height = '100vh';iframe.style.border = 'none';iframe.style.display = 'block';iframe.addEventListener('load', function () {
try { const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
function hijackLinks(doc) {
doc.querySelectorAll('a[href]').forEach(function (link) {
if (link.dataset._hijacked) return;link.dataset._hijacked = '1';
link.addEventListener('click', function (e) {
e.preventDefault();const dest = new URL(link.getAttribute('href'), iframe.contentWindow.location.href).href;window.top.location.href = dest;
}); }); }
hijackLinks(innerDoc);
const observer = new MutationObserver(function () {
hijackLinks(innerDoc); });
observer.observe(innerDoc.body, { childList: true, subtree: true });
} catch (err) {
console.log('Could not hook iframe links:', err); } }); document.body.appendChild(iframe); }
