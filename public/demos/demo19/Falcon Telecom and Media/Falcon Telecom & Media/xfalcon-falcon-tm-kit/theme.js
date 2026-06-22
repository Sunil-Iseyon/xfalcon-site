/* theme.js — Runtime theme switcher
 * Default theme: spectrum (loaded when ?theme= absent)
 * Alternate: tech (dark techno — neon cyan + electric purple on near-black)
 */
(function () {

  // Click handler — propagate ?theme= on internal navigation
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || /^(https?:|#|mailto:|javascript:|computer:)/.test(href)) return;
    if (!/\.(html|md)(\?|#|$)/.test(href)) return;
    if (/[?&]theme=/.test(href)) return;
    var theme = document.documentElement.getAttribute('data-theme');
    if (!theme || theme === 'spectrum') return;
    e.preventDefault();
    var sep = href.indexOf('?') >= 0 ? '&' : '?';
    window.location.href = href + sep + 'theme=' + theme;
  });

  // Wire up theme picker (portal only)
  document.addEventListener('DOMContentLoaded', function () {
    var sel = document.getElementById('themeSel');
    if (!sel) return;
    sel.value = document.documentElement.getAttribute('data-theme') || 'spectrum';
    sel.addEventListener('change', function () {
      var u = new URL(window.location.href);
      if (this.value === 'spectrum') {
        u.searchParams.delete('theme');
      } else {
        u.searchParams.set('theme', this.value);
      }
      window.location.href = u.toString();
    });
  });
})();
