/* ============================================================================
   theme.js — Falcon Defense & Aerospace
   URL param detection + link propagation + portal picker wiring.
   Default theme: modern-minimalist.
   ============================================================================ */
(function () {
  var DEFAULT_THEME = 'modern-minimalist';

  // Link propagation: when user clicks a same-kit link, carry ?theme= forward.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href || /^(https?:|#|mailto:|javascript:|computer:)/.test(href)) return;
    if (!/\.(html|md)(\?|#|$)/.test(href)) return;
    if (/[?&]theme=/.test(href)) return;
    var theme = document.documentElement.getAttribute('data-theme');
    if (!theme || theme === DEFAULT_THEME) return;
    e.preventDefault();
    var sep = href.indexOf('?') >= 0 ? '&' : '?';
    window.location.href = href + sep + 'theme=' + theme;
  });

  // Wire up the portal theme picker if present.
  document.addEventListener('DOMContentLoaded', function () {
    var sel = document.getElementById('themeSel');
    if (!sel) return;
    sel.value = document.documentElement.getAttribute('data-theme') || DEFAULT_THEME;
    sel.addEventListener('change', function () {
      var u = new URL(window.location.href);
      if (this.value === DEFAULT_THEME) {
        u.searchParams.delete('theme');
      } else {
        u.searchParams.set('theme', this.value);
      }
      window.location.href = u.toString();
    });
  });
})();
