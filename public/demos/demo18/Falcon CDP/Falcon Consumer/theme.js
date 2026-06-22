// Falcon Consumer theme handling
// - Detects ?theme=... from URL (set by index picker)
// - Propagates the theme across internal links so all reports stay on-theme
// - Theme attribute is set EARLY (inline in each HTML <head>) to avoid flash

(function () {
  // Rewrite all internal .html / .md links to carry the current theme param
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (!href) return;
    // Skip external, anchor, mailto, javascript, computer://, etc.
    if (/^(https?:|#|mailto:|javascript:|computer:)/.test(href)) return;
    // Only propagate to our own .html / .md files
    if (!/\.(html|md)(\?|#|$)/.test(href)) return;
    // Already has a theme param — leave it
    if (/[?&]theme=/.test(href)) return;
    var theme = document.documentElement.getAttribute('data-theme');
    if (!theme || theme === 'retailedge') return;
    e.preventDefault();
    var sep = href.indexOf('?') >= 0 ? '&' : '?';
    window.location.href = href + sep + 'theme=' + theme;
  });

  // If a themeSel dropdown exists (index page), wire it up
  document.addEventListener('DOMContentLoaded', function () {
    var sel = document.getElementById('themeSel');
    if (!sel) return;
    var cur = document.documentElement.getAttribute('data-theme') || 'retailedge';
    sel.value = cur;
    sel.addEventListener('change', function () {
      var u = new URL(window.location.href);
      if (this.value === 'retailedge') {
        u.searchParams.delete('theme');
      } else {
        u.searchParams.set('theme', this.value);
      }
      window.location.href = u.toString();
    });
  });
})();
