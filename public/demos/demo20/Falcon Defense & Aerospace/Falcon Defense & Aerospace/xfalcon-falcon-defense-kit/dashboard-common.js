/* ============================================================================
   dashboard-common.js — Falcon Defense & Aerospace
   Shared helpers: Chart.js defaults, mk(), fitKpiText(), palette resolver.
   ============================================================================ */
var chartInstances = {};

function mk(id, cfg) {
  if (chartInstances[id]) chartInstances[id].destroy();
  var el = document.getElementById(id);
  if (!el) return null;
  var ctx = el.getContext('2d');
  chartInstances[id] = new Chart(ctx, cfg);
  return chartInstances[id];
}

function fitKpiText() {
  var els = document.querySelectorAll('.kpi-value');
  for (var i = 0; i < els.length; i++) {
    var len = els[i].textContent.length;
    if (len > 12) els[i].style.fontSize = '18px';
    else if (len > 8) els[i].style.fontSize = '22px';
    else els[i].style.fontSize = '28px';
  }
}

function fdPalette() {
  var t = document.documentElement.getAttribute('data-theme') || 'modern-minimalist';
  if (t === 'clean-light') {
    return {
      primary:  '#006AFF',
      secondary:'#1A7F64',
      tertiary: '#94A3B8',
      amber:    '#F59E0B',
      lightBlue:'#0EA5E9',
      grid:     '#E5E7EB',
      axisText: '#475569',
      positive: '#059669',
      negative: '#D32F2F'
    };
  }
  return {
    primary:  '#36454F',
    secondary:'#708090',
    tertiary: '#94A3B8',
    amber:    '#F59E0B',
    lightBlue:'#0EA5E9',
    grid:     '#E2E8F0',
    axisText: '#5A6472',
    positive: '#059669',
    negative: '#D32F2F'
  };
}

function fdYearPalette() {
  // Year palette stays CONSTANT across themes (data semantic stability)
  return {
    '2020': '#CBD5E1',
    '2021': '#94A3B8',
    '2022': '#64748B',
    '2023': '#475569',
    '2024': '#006AFF'
  };
}

// Apply Chart.js defaults once Chart is loaded
(function () {
  if (typeof Chart === 'undefined') return;
  var p = fdPalette();
  Chart.defaults.font.family = "'Inter', system-ui, -apple-system, sans-serif";
  Chart.defaults.font.size = 12;
  Chart.defaults.color = p.axisText;
  Chart.defaults.plugins.legend.labels.boxWidth = 12;
  Chart.defaults.plugins.legend.labels.boxHeight = 12;
})();

function fmtMoney(v) {
  if (v == null) return '—';
  var abs = Math.abs(v);
  if (abs >= 1000)    return '$' + (v/1000).toFixed(1) + 'B';
  if (abs >= 1)       return '$' + v.toFixed(0) + 'M';
  return '$' + (v*1000).toFixed(0) + 'K';
}
function fmtInt(v) { if (v == null) return '—'; return Math.round(v).toLocaleString(); }
function fmtPct(v, d) { if (v == null) return '—'; return (v).toFixed(d || 1) + '%'; }
function fmtRatio(v) { if (v == null) return '—'; return v.toFixed(2); }
function fmtDelta(cur, prior, fmt) {
  if (cur == null || prior == null || prior === 0) return { txt: '—', cls: 'neutral' };
  var pct = (cur - prior) / Math.abs(prior) * 100;
  var sign = pct >= 0 ? '↑' : '↓';
  var cls = pct >= 0 ? 'positive' : 'negative';
  return { txt: sign + ' ' + Math.abs(pct).toFixed(1) + '% vs ' + prior, cls: cls, pct: pct };
}
function fmtDeltaLabel(cur, prior, unit, priorLabel) {
  var d = fmtDelta(cur, prior);
  if (d.txt === '—') return { txt: '—', cls: 'neutral' };
  var sign = d.pct >= 0 ? '↑' : '↓';
  return { txt: sign + ' ' + Math.abs(d.pct).toFixed(1) + '% vs ' + priorLabel, cls: d.cls };
}
