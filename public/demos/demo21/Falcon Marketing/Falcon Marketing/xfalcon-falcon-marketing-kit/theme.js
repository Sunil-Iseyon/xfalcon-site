/* Falcon Marketing — theme persistence + URL propagation across dashboards.
   Default theme: midnight (no ?theme= param needed). Alt: sunset. */
(function () {
  var DEFAULT = 'midnight';

  // Rewrite internal HTML/MD links on click to carry the active theme.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    if (/^(https?:|#|mailto:|javascript:|computer:)/.test(href)) return;
    if (!/\.(html|md)(\?|#|$)/.test(href)) return;
    if (/[?&]theme=/.test(href)) return;
    var theme = document.documentElement.getAttribute('data-theme');
    if (!theme || theme === DEFAULT) return;
    e.preventDefault();
    var sep = href.indexOf('?') >= 0 ? '&' : '?';
    window.location.href = href + sep + 'theme=' + theme;
  });

  // Wire up portal theme picker if present.
  document.addEventListener('DOMContentLoaded', function () {
    var sel = document.getElementById('themeSel');
    if (!sel) return;
    var current = document.documentElement.getAttribute('data-theme') || DEFAULT;
    sel.value = current;
    sel.addEventListener('change', function () {
      var u = new URL(window.location.href);
      if (this.value === DEFAULT) u.searchParams.delete('theme');
      else u.searchParams.set('theme', this.value);
      window.location.href = u.toString();
    });
  });
})();
