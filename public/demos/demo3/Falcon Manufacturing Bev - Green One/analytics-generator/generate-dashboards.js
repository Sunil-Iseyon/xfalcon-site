var fs = require('fs');
var path = require('path');

// Read config file
var configPath = process.argv[2] || './config.json';
var config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

var company = config.company || 'Company';
var division = config.division || 'Division';
var outputDir = config.outputDir || './output/';
var theme = config.theme || {};
var data = config.data || {};

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Helper functions
function generateCSS(thm) {
  return 'body { margin: 0; padding: 0; box-sizing: border-box; font-family: "Segoe UI", Arial, sans-serif; background: ' + thm.bgDark + '; color: ' + thm.textWhite + '; min-height: 100vh; } * { margin: 0; padding: 0; box-sizing: border-box; } .header { background: ' + thm.bgCard + '; padding: 15px 30px; display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid ' + thm.primary + '; } .header h1 { font-size: 1.4rem; color: ' + thm.textWhite + '; letter-spacing: 2px; } .back-link { color: ' + thm.primary + '; text-decoration: none; font-size: 0.9rem; margin-right: 30px; } .back-link:hover { text-decoration: underline; } .filters { display: flex; gap: 15px; padding: 15px 30px; background: ' + thm.bgCard + '; border-bottom: 1px solid ' + thm.bgCardLight + '; flex-wrap: wrap; } .filter-group { display: flex; align-items: center; gap: 10px; } .filter-group label { font-size: 0.9rem; color: ' + thm.textGray + '; } .filters select { background: ' + thm.bgCardLight + '; color: ' + thm.textWhite + '; border: 1px solid #333; padding: 8px 15px; border-radius: 5px; font-size: 0.9rem; cursor: pointer; } .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; padding: 20px 30px; } .kpi-card { background: ' + thm.bgCard + '; border-radius: 8px; padding: 20px; border-left: 4px solid ' + thm.primary + '; } .kpi-card .label { font-size: 0.8rem; color: ' + thm.textGray + '; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; } .kpi-card .value { font-size: 1.8rem; font-weight: bold; color: ' + thm.secondary + '; } .kpi-card .change { font-size: 0.85rem; margin-top: 5px; } .change.positive { color: ' + thm.success + '; } .change.negative { color: ' + thm.danger + '; } .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 20px; padding: 20px 30px; } .chart-card { background: ' + thm.bgCard + '; border-radius: 8px; padding: 20px; } .chart-card h3 { font-size: 1rem; color: ' + thm.textGray + '; margin-bottom: 15px; } .insights { margin: 20px 30px; background: ' + thm.bgCard + '; border-radius: 8px; padding: 20px; border-left: 4px solid ' + thm.info + '; margin-bottom: 30px; } .insights h3 { color: ' + thm.info + '; margin-bottom: 10px; } .insights ul { list-style: none; padding: 0; } .insights li { padding: 8px 0; color: ' + thm.textGray + '; border-bottom: 1px solid ' + thm.bgCardLight + '; } .insights li:last-child { border-bottom: none; } .dashboard-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; padding: 20px 30px; } .dashboard-card { background: ' + thm.bgCard + '; border-radius: 8px; padding: 20px; cursor: pointer; text-decoration: none; color: inherit; transition: transform 0.2s; border-top: 4px solid ' + thm.primary + '; } .dashboard-card:hover { transform: translateY(-5px); } .dashboard-card h3 { color: ' + thm.secondary + '; margin-bottom: 10px; } .dashboard-card p { color: ' + thm.textGray + '; font-size: 0.9rem; } .metrics-table { width: 100%; background: ' + thm.bgCard + '; border-radius: 8px; padding: 20px; margin: 20px 30px; border-collapse: collapse; } .metrics-table th { background: ' + thm.bgCardLight + '; color: ' + thm.textWhite + '; padding: 12px; text-align: left; border-bottom: 2px solid ' + thm.primary + '; } .metrics-table td { padding: 12px; border-bottom: 1px solid ' + thm.bgCardLight + '; color: ' + thm.textGray + '; } .metrics-table tr:hover { background: ' + thm.bgCardLight + '; } .metrics-section { padding: 20px 30px; } .metrics-section h2 { color: ' + thm.secondary + '; margin-bottom: 15px; }';
}

function formatNumber(num) {
  if (num === null || num === undefined || isNaN(num)) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(2) + 'K';
  return num.toFixed(2);
}

function formatPercent(num) {
  if (num === null || num === undefined || isNaN(num)) return '0%';
  return num.toFixed(1) + '%';
}

function getYearsAndQuarters(dataArray) {
  var years = {};
  if (!Array.isArray(dataArray)) return { years: [], quarters: {} };

  var i;
  for (i = 0; i < dataArray.length; i++) {
    var item = dataArray[i];
    if (item.year) {
      if (!years[item.year]) {
        years[item.year] = {};
      }
      if (item.quarter) {
        years[item.year][item.quarter] = true;
      }
    }
  }

  var yearList = Object.keys(years).sort();
  return { years: yearList, quarters: years };
}

function createFilterDropdowns(dataArray, thm) {
  var info = getYearsAndQuarters(dataArray);
  var html = '<div class="filters">';
  html += '<div class="filter-group"><label>Year:</label><select id="yearFilter" onchange="filterData()"><option value="">All</option>';

  var i;
  for (i = 0; i < info.years.length; i++) {
    html += '<option value="' + info.years[i] + '">' + info.years[i] + '</option>';
  }

  html += '</select></div>';
  html += '<div class="filter-group"><label>Quarter:</label><select id="quarterFilter" onchange="filterData()"><option value="">All</option><option value="Q1">Q1</option><option value="Q2">Q2</option><option value="Q3">Q3</option><option value="Q4">Q4</option></select></div>';
  html += '</div>';

  return html;
}

function generateIndexHTML() {
  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>' + company + ' Analytics</title><style>' + generateCSS(theme) + '</style></head><body>';

  html += '<div class="header"><h1>' + company + ' ANALYTICS DASHBOARD</h1><div style="font-size: 0.9rem; color: ' + theme.textGray + ';">' + division + '</div></div>';

  html += '<div class="dashboard-grid">';

  var dashboards = [
    { title: 'Executive Overview', file: 'executive-overview.html', desc: 'High-level business metrics' },
    { title: 'Sales Performance', file: 'sales-performance.html', desc: 'Revenue and sales analytics' },
    { title: 'Inventory Health', file: 'inventory-health.html', desc: 'Stock and inventory metrics' },
    { title: 'Supply Chain', file: 'supply-chain.html', desc: 'Supplier and logistics performance' },
    { title: 'Production Efficiency', file: 'production-efficiency.html', desc: 'Manufacturing metrics' },
    { title: 'Quality & Compliance', file: 'quality-compliance.html', desc: 'Quality and regulatory metrics' },
    { title: 'Marketing ROI', file: 'marketing-roi.html', desc: 'Marketing performance and ROI' },
    { title: 'ESG & Sustainability', file: 'esg-sustainability.html', desc: 'Environmental and social metrics' },
    { title: 'Marketing & Sales Impact', file: 'marketing-sales-impact.html', desc: 'Marketing spend vs sales' },
    { title: 'Forecast Accuracy', file: 'forecast-accuracy.html', desc: 'Planned vs actual analysis' },
    { title: 'Metrics Dictionary', file: 'metrics-dictionary.html', desc: 'KPI definitions and glossary' }
  ];

  var i;
  for (i = 0; i < dashboards.length; i++) {
    html += '<a href="' + dashboards[i].file + '" class="dashboard-card">';
    html += '<h3>' + dashboards[i].title + '</h3>';
    html += '<p>' + dashboards[i].desc + '</p>';
    html += '</a>';
  }

  html += '</div></body></html>';
  return html;
}

function generateExecutiveOverviewHTML() {
  var execData = data.executiveSummary || [];
  var info = getYearsAndQuarters(execData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Executive Overview</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>EXECUTIVE OVERVIEW</h1></div>';

  html += createFilterDropdowns(execData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(execData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var revenueChart = null;';
  html += 'var profitChart = null;';
  html += 'var marginChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.getElementById("kpiGrid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    document.getElementById("chartContainer").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var totalRevenue = 0;';
  html += '  var totalProfit = 0;';
  html += '  var totalMargin = 0;';
  html += '  var totalEbitda = 0;';
  html += '  var totalNetProfit = 0;';
  html += '  var totalUnits = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    totalRevenue += filtered[i].revenue || 0;';
  html += '    totalProfit += filtered[i].grossProfit || 0;';
  html += '    totalMargin += filtered[i].marginPercent || 0;';
  html += '    totalEbitda += filtered[i].ebitda || 0;';
  html += '    totalNetProfit += filtered[i].netProfit || 0;';
  html += '    totalUnits += filtered[i].unitsSold || 0;';
  html += '  }';
  html += '  var avgMargin = filtered.length > 0 ? totalMargin / filtered.length : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Revenue</div><div class=\"value\">$' + "' + formatNumber(totalRevenue) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Gross Profit</div><div class=\"value\">$' + "' + formatNumber(totalProfit) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Margin %</div><div class=\"value\">' + "' + formatPercent(avgMargin) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">EBITDA</div><div class=\"value\">$' + "' + formatNumber(totalEbitda) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Net Profit</div><div class=\"value\">$' + "' + formatNumber(totalNetProfit) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Units Sold</div><div class=\"value\">' + "' + formatNumber(totalUnits) + '" + '</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var revenues = [];';
  html += '  var profits = [];';
  html += '  var margins = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    revenues.push(filtered[i].revenue || 0);';
  html += '    profits.push(filtered[i].grossProfit || 0);';
  html += '    margins.push(filtered[i].marginPercent || 0);';
  html += '  }';
  html += '  if (revenueChart) revenueChart.destroy();';
  html += '  revenueChart = new Chart(document.getElementById("revenueChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Revenue", data: revenues, borderColor: "' + thm.primary + '", backgroundColor: "rgba(124, 183, 1, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { display: true, labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (profitChart) profitChart.destroy();';
  html += '  profitChart = new Chart(document.getElementById("profitChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Gross Profit", data: profits, backgroundColor: "' + thm.secondary + '" }, { label: "Net Profit", data: filtered.map(function(d) { return d.netProfit || 0; }), backgroundColor: "' + thm.info + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { display: true, labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (marginChart) marginChart.destroy();';
  html += '  marginChart = new Chart(document.getElementById("marginChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Margin %", data: margins, borderColor: "' + thm.warning + '", backgroundColor: "rgba(255, 184, 0, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { display: true, labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Revenue Trend</h3><canvas id="revenueChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Profitability Breakdown</h3><canvas id="profitChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Margin Trend</h3><canvas id="marginChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Revenue shows steady growth across quarters with Q4 peak performance</li>';
  html += '<li>Profit margins remain consistent, indicating stable operational efficiency</li>';
  html += '<li>EBITDA trends align with revenue, suggesting good cost management</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateSalesPerformanceHTML() {
  var salesCat = data.salesByCategory || [];
  var salesChan = data.salesByChannel || [];
  var salesReg = data.salesByRegion || [];
  var execData = data.executiveSummary || [];
  var allData = salesCat.concat(salesChan).concat(salesReg).concat(execData);
  var info = getYearsAndQuarters(allData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Sales Performance</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>SALES PERFORMANCE</h1></div>';

  html += createFilterDropdowns(allData, thm);

  html += '<script>';
  html += 'var SALES_CAT = ' + JSON.stringify(salesCat) + ';';
  html += 'var SALES_CHAN = ' + JSON.stringify(salesChan) + ';';
  html += 'var SALES_REG = ' + JSON.stringify(salesReg) + ';';
  html += 'var EXEC_DATA = ' + JSON.stringify(execData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var catChart = null;';
  html += 'var chanChart = null;';
  html += 'var regChart = null;';
  html += 'var trendChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filterFunc = function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  };';
  html += '  var filtCat = SALES_CAT.filter(filterFunc);';
  html += '  var filtChan = SALES_CHAN.filter(filterFunc);';
  html += '  var filtReg = SALES_REG.filter(filterFunc);';
  html += '  var filtExec = EXEC_DATA.filter(filterFunc);';
  html += '  updateDashboard(filtCat, filtChan, filtReg, filtExec);';
  html += '}';

  html += 'function updateDashboard(filtCat, filtChan, filtReg, filtExec) {';
  html += '  var totalRev = 0;';
  html += '  var totalUnits = 0;';
  html += '  var avgMargin = 0;';
  html += '  var topCat = "N/A";';
  html += '  var i;';
  html += '  for (i = 0; i < filtExec.length; i++) {';
  html += '    totalRev += filtExec[i].revenue || 0;';
  html += '    totalUnits += filtExec[i].unitsSold || 0;';
  html += '    avgMargin += filtExec[i].marginPercent || 0;';
  html += '  }';
  html += '  avgMargin = filtExec.length > 0 ? avgMargin / filtExec.length : 0;';
  html += '  var maxCat = 0;';
  html += '  for (i = 0; i < filtCat.length; i++) {';
  html += '    if (filtCat[i].revenue > maxCat) { maxCat = filtCat[i].revenue; topCat = filtCat[i].category; }';
  html += '  }';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Total Revenue</div><div class=\"value\">$' + "' + formatNumber(totalRev) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Units Sold</div><div class=\"value\">' + "' + formatNumber(totalUnits) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Avg Margin %</div><div class=\"value\">' + "' + formatPercent(avgMargin) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Top Category</div><div class=\"value\">' + "' + topCat + '" + '</div></div>";';
  html += '  updateCharts(filtCat, filtChan, filtReg, filtExec);';
  html += '}';

  html += 'function updateCharts(filtCat, filtChan, filtReg, filtExec) {';
  html += '  var catLabels = [];';
  html += '  var catData = [];';
  html += '  var chanLabels = [];';
  html += '  var chanData = [];';
  html += '  var regLabels = [];';
  html += '  var regData = [];';
  html += '  var trendLabels = [];';
  html += '  var trendData = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtCat.length; i++) {';
  html += '    catLabels.push(filtCat[i].category || "");';
  html += '    catData.push(filtCat[i].revenue || 0);';
  html += '  }';
  html += '  for (i = 0; i < filtChan.length; i++) {';
  html += '    chanLabels.push(filtChan[i].channel || "");';
  html += '    chanData.push(filtChan[i].revenue || 0);';
  html += '  }';
  html += '  for (i = 0; i < filtReg.length; i++) {';
  html += '    regLabels.push(filtReg[i].region || "");';
  html += '    regData.push(filtReg[i].revenue || 0);';
  html += '  }';
  html += '  for (i = 0; i < filtExec.length; i++) {';
  html += '    trendLabels.push(filtExec[i].year + " " + (filtExec[i].quarter || ""));';
  html += '    trendData.push(filtExec[i].revenue || 0);';
  html += '  }';
  html += '  if (catChart) catChart.destroy();';
  html += '  catChart = new Chart(document.getElementById("catChart"), {';
  html += '    type: "doughnut",';
  html += '    data: { labels: catLabels, datasets: [{ data: catData, backgroundColor: ["' + thm.primary + '", "' + thm.secondary + '", "' + thm.info + '", "' + thm.warning + '", "' + thm.danger + '"] }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } } }';
  html += '  });';
  html += '  if (chanChart) chanChart.destroy();';
  html += '  chanChart = new Chart(document.getElementById("chanChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: chanLabels, datasets: [{ label: "Revenue", data: chanData, backgroundColor: "' + thm.secondary + '" }] },';
  html += '    options: { indexAxis: "y", responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (regChart) regChart.destroy();';
  html += '  regChart = new Chart(document.getElementById("regChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: regLabels, datasets: [{ label: "Revenue", data: regData, backgroundColor: "' + thm.info + '" }] },';
  html += '    options: { indexAxis: "y", responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (trendChart) trendChart.destroy();';
  html += '  trendChart = new Chart(document.getElementById("trendChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: trendLabels, datasets: [{ label: "Revenue", data: trendData, borderColor: "' + thm.primary + '", backgroundColor: "rgba(124, 183, 1, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Revenue by Category</h3><canvas id="catChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Revenue by Channel</h3><canvas id="chanChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Revenue by Region</h3><canvas id="regChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Revenue Trend</h3><canvas id="trendChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Strong performance across all sales channels with online channel showing growth</li>';
  html += '<li>Regional distribution shows balanced contribution to overall revenue</li>';
  html += '<li>Product categories performing well, with consistent demand patterns</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateInventoryHealthHTML() {
  var invData = data.inventoryHealth || [];
  var info = getYearsAndQuarters(invData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Inventory Health</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>INVENTORY HEALTH</h1></div>';

  html += createFilterDropdowns(invData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(invData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var stockoutChart = null;';
  html += 'var valueChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.getElementById("kpiGrid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var avgDOS = 0;';
  html += '  var avgStockout = 0;';
  html += '  var totalNearExpiry = 0;';
  html += '  var totalExpired = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    avgDOS += filtered[i].daysOfStock || 0;';
  html += '    avgStockout += filtered[i].stockoutRate || 0;';
  html += '    totalNearExpiry += filtered[i].nearExpiryUnits || 0;';
  html += '    totalExpired += filtered[i].expiredUnits || 0;';
  html += '  }';
  html += '  avgDOS = filtered.length > 0 ? avgDOS / filtered.length : 0;';
  html += '  avgStockout = filtered.length > 0 ? avgStockout / filtered.length : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Days of Stock</div><div class=\"value\">' + "' + avgDOS.toFixed(1) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Stockout Rate</div><div class=\"value\">' + "' + formatPercent(avgStockout) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Near Expiry Units</div><div class=\"value\">' + "' + totalNearExpiry.toFixed(0) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Expired Units</div><div class=\"value\">' + "' + totalExpired.toFixed(0) + '" + '</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var stockouts = [];';
  html += '  var values = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    stockouts.push(filtered[i].stockoutRate || 0);';
  html += '    values.push(filtered[i].inventoryValue || 0);';
  html += '  }';
  html += '  if (stockoutChart) stockoutChart.destroy();';
  html += '  stockoutChart = new Chart(document.getElementById("stockoutChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Stockout Rate %", data: stockouts, backgroundColor: "' + thm.danger + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (valueChart) valueChart.destroy();';
  html += '  valueChart = new Chart(document.getElementById("valueChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Inventory Value", data: values, borderColor: "' + thm.secondary + '", backgroundColor: "rgba(149, 214, 0, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Stockout Trend</h3><canvas id="stockoutChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Inventory Value Trend</h3><canvas id="valueChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Inventory levels are well-managed with optimal days of stock</li>';
  html += '<li>Stockout rates are minimal, indicating strong supply chain coordination</li>';
  html += '<li>Near-expiry management needs attention to reduce waste</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateSupplyChainHTML() {
  var scData = data.supplyChain || [];
  var info = getYearsAndQuarters(scData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Supply Chain</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>SUPPLY CHAIN PERFORMANCE</h1></div>';

  html += createFilterDropdowns(scData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(scData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var leadTimeChart = null;';
  html += 'var deliveryChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.querySelector(".kpi-grid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var avgLeadTime = 0;';
  html += '  var avgLateDelivery = 0;';
  html += '  var avgRejection = 0;';
  html += '  var avgSupplierRating = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    avgLeadTime += filtered[i].avgLeadTimeDays || 0;';
  html += '    avgLateDelivery += filtered[i].lateDeliveryPercent || 0;';
  html += '    avgRejection += filtered[i].rejectionRate || 0;';
  html += '    avgSupplierRating += filtered[i].supplierRating || 0;';
  html += '  }';
  html += '  avgLeadTime = filtered.length > 0 ? avgLeadTime / filtered.length : 0;';
  html += '  avgLateDelivery = filtered.length > 0 ? avgLateDelivery / filtered.length : 0;';
  html += '  avgRejection = filtered.length > 0 ? avgRejection / filtered.length : 0;';
  html += '  avgSupplierRating = filtered.length > 0 ? (avgSupplierRating / filtered.length).toFixed(1) : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Avg Lead Time</div><div class=\"value\">' + "' + avgLeadTime.toFixed(1) + '" + ' days</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Late Delivery %</div><div class=\"value\">' + "' + formatPercent(avgLateDelivery) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Rejection Rate</div><div class=\"value\">' + "' + formatPercent(avgRejection) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Supplier Rating</div><div class=\"value\">' + "' + avgSupplierRating + '" + '/5.0</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var leadTimes = [];';
  html += '  var lateDeliveries = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    leadTimes.push(filtered[i].avgLeadTimeDays || 0);';
  html += '    lateDeliveries.push(filtered[i].lateDeliveryPercent || 0);';
  html += '  }';
  html += '  if (leadTimeChart) leadTimeChart.destroy();';
  html += '  leadTimeChart = new Chart(document.getElementById("leadTimeChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Lead Time (Days)", data: leadTimes, borderColor: "' + thm.primary + '", backgroundColor: "rgba(124, 183, 1, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (deliveryChart) deliveryChart.destroy();';
  html += '  deliveryChart = new Chart(document.getElementById("deliveryChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Late Delivery %", data: lateDeliveries, backgroundColor: "' + thm.warning + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Lead Time Trend</h3><canvas id="leadTimeChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Delivery Performance</h3><canvas id="deliveryChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Lead times are stable and within acceptable ranges</li>';
  html += '<li>Late delivery rates are low, indicating reliable supplier performance</li>';
  html += '<li>Supplier ratings remain strong, reflecting quality partnerships</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateProductionEfficiencyHTML() {
  var prodData = data.productionEfficiency || [];
  var info = getYearsAndQuarters(prodData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Production Efficiency</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>PRODUCTION EFFICIENCY</h1></div>';

  html += createFilterDropdowns(prodData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(prodData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var utilizationChart = null;';
  html += 'var defectChart = null;';
  html += 'var costChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.querySelector(".kpi-grid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var avgUtil = 0;';
  html += '  var avgYield = 0;';
  html += '  var avgDefect = 0;';
  html += '  var totalDowntime = 0;';
  html += '  var avgCost = 0;';
  html += '  var totalUnits = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    avgUtil += filtered[i].utilizationPercent || 0;';
  html += '    avgYield += filtered[i].yieldRate || 0;';
  html += '    avgDefect += filtered[i].defectRate || 0;';
  html += '    totalDowntime += filtered[i].downtimeHours || 0;';
  html += '    avgCost += filtered[i].costPerUnit || 0;';
  html += '    totalUnits += filtered[i].unitsProduced || 0;';
  html += '  }';
  html += '  avgUtil = filtered.length > 0 ? avgUtil / filtered.length : 0;';
  html += '  avgYield = filtered.length > 0 ? avgYield / filtered.length : 0;';
  html += '  avgDefect = filtered.length > 0 ? avgDefect / filtered.length : 0;';
  html += '  avgCost = filtered.length > 0 ? avgCost / filtered.length : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Utilization %</div><div class=\"value\">' + "' + formatPercent(avgUtil) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Yield Rate</div><div class=\"value\">' + "' + formatPercent(avgYield) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Defect Rate</div><div class=\"value\">' + "' + formatPercent(avgDefect) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Downtime Hours</div><div class=\"value\">' + "' + totalDowntime.toFixed(0) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Cost/Unit</div><div class=\"value\">$' + "' + avgCost.toFixed(2) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Units Produced</div><div class=\"value\">' + "' + formatNumber(totalUnits) + '" + '</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var utils = [];';
  html += '  var defects = [];';
  html += '  var yields = [];';
  html += '  var costs = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    utils.push(filtered[i].utilizationPercent || 0);';
  html += '    defects.push(filtered[i].defectRate || 0);';
  html += '    yields.push(filtered[i].yieldRate || 0);';
  html += '    costs.push(filtered[i].costPerUnit || 0);';
  html += '  }';
  html += '  if (utilizationChart) utilizationChart.destroy();';
  html += '  utilizationChart = new Chart(document.getElementById("utilizationChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Utilization %", data: utils, borderColor: "' + thm.primary + '", backgroundColor: "rgba(124, 183, 1, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (defectChart) defectChart.destroy();';
  html += '  defectChart = new Chart(document.getElementById("defectChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Defect Rate %", data: defects, backgroundColor: "' + thm.danger + '" }, { label: "Yield Rate %", data: yields, backgroundColor: "' + thm.success + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (costChart) costChart.destroy();';
  html += '  costChart = new Chart(document.getElementById("costChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Cost per Unit", data: costs, borderColor: "' + thm.warning + '", backgroundColor: "rgba(255, 184, 0, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Utilization Trend</h3><canvas id="utilizationChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Defect vs Yield</h3><canvas id="defectChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Cost per Unit Trend</h3><canvas id="costChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Production utilization is consistently high, indicating efficient capacity management</li>';
  html += '<li>Defect rates are well-controlled with strong yield performance</li>';
  html += '<li>Cost per unit remains stable with slight downward trend</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateQualityComplianceHTML() {
  var qualData = data.qualityCompliance || [];
  var info = getYearsAndQuarters(qualData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Quality & Compliance</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>QUALITY & COMPLIANCE</h1></div>';

  html += createFilterDropdowns(qualData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(qualData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var qualityChart = null;';
  html += 'var complianceChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.querySelector(".kpi-grid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var avgPassRate = 0;';
  html += '  var totalViolations = 0;';
  html += '  var totalRecalls = 0;';
  html += '  var totalLabelingIssues = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    avgPassRate += filtered[i].passRate || 0;';
  html += '    totalViolations += filtered[i].fdaViolations || 0;';
  html += '    totalRecalls += filtered[i].recalls || 0;';
  html += '    totalLabelingIssues += filtered[i].labelingIssues || 0;';
  html += '  }';
  html += '  avgPassRate = filtered.length > 0 ? avgPassRate / filtered.length : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Pass Rate</div><div class=\"value\">' + "' + formatPercent(avgPassRate) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">FDA Violations</div><div class=\"value\">' + "' + totalViolations.toFixed(0) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Recalls</div><div class=\"value\">' + "' + totalRecalls.toFixed(0) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Labeling Issues</div><div class=\"value\">' + "' + totalLabelingIssues.toFixed(0) + '" + '</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var passRates = [];';
  html += '  var violations = [];';
  html += '  var recalls = [];';
  html += '  var labelingIssues = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    passRates.push(filtered[i].passRate || 0);';
  html += '    violations.push(filtered[i].fdaViolations || 0);';
  html += '    recalls.push(filtered[i].recalls || 0);';
  html += '    labelingIssues.push(filtered[i].labelingIssues || 0);';
  html += '  }';
  html += '  if (qualityChart) qualityChart.destroy();';
  html += '  qualityChart = new Chart(document.getElementById("qualityChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Pass Rate %", data: passRates, borderColor: "' + thm.success + '", backgroundColor: "rgba(76, 175, 80, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (complianceChart) complianceChart.destroy();';
  html += '  complianceChart = new Chart(document.getElementById("complianceChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "FDA Violations", data: violations, backgroundColor: "' + thm.danger + '" }, { label: "Recalls", data: recalls, backgroundColor: "' + thm.warning + '" }, { label: "Labeling Issues", data: labelingIssues, backgroundColor: "' + thm.info + '" }] },';
  html += '    options: { responsive: true, stacked: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Quality Metrics Trend</h3><canvas id="qualityChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Compliance Issues</h3><canvas id="complianceChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Quality pass rates are consistently high, reflecting strong QC processes</li>';
  html += '<li>Compliance violations are minimal and well-managed</li>';
  html += '<li>Labeling issues are under control with proactive monitoring</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateMarketingROIHTML() {
  var marData = data.marketingROI || [];
  var info = getYearsAndQuarters(marData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Marketing ROI</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>MARKETING ROI</h1></div>';

  html += createFilterDropdowns(marData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(marData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var roiChart = null;';
  html += 'var spendChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.querySelector(".kpi-grid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var avgROI = 0;';
  html += '  var avgCPA = 0;';
  html += '  var avgConversion = 0;';
  html += '  var avgCTR = 0;';
  html += '  var totalSpend = 0;';
  html += '  var totalRevenue = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    avgROI += filtered[i].roi || 0;';
  html += '    avgCPA += filtered[i].cpa || 0;';
  html += '    avgConversion += filtered[i].conversionRate || 0;';
  html += '    avgCTR += filtered[i].ctr || 0;';
  html += '    totalSpend += filtered[i].totalSpend || 0;';
  html += '    totalRevenue += filtered[i].attributedRevenue || 0;';
  html += '  }';
  html += '  avgROI = filtered.length > 0 ? avgROI / filtered.length : 0;';
  html += '  avgCPA = filtered.length > 0 ? avgCPA / filtered.length : 0;';
  html += '  avgConversion = filtered.length > 0 ? avgConversion / filtered.length : 0;';
  html += '  avgCTR = filtered.length > 0 ? avgCTR / filtered.length : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">ROI %</div><div class=\"value\">' + "' + formatPercent(avgROI) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">CPA</div><div class=\"value\">$' + "' + avgCPA.toFixed(2) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Conversion Rate</div><div class=\"value\">' + "' + formatPercent(avgConversion) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">CTR</div><div class=\"value\">' + "' + formatPercent(avgCTR) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Total Spend</div><div class=\"value\">$' + "' + formatNumber(totalSpend) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Attributed Revenue</div><div class=\"value\">$' + "' + formatNumber(totalRevenue) + '" + 'M</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var rois = [];';
  html += '  var spends = [];';
  html += '  var revenues = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    rois.push(filtered[i].roi || 0);';
  html += '    spends.push(filtered[i].totalSpend || 0);';
  html += '    revenues.push(filtered[i].attributedRevenue || 0);';
  html += '  }';
  html += '  if (roiChart) roiChart.destroy();';
  html += '  roiChart = new Chart(document.getElementById("roiChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "ROI %", data: rois, borderColor: "' + thm.success + '", backgroundColor: "rgba(76, 175, 80, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (spendChart) spendChart.destroy();';
  html += '  spendChart = new Chart(document.getElementById("spendChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Spend", data: spends, backgroundColor: "' + thm.primary + '" }, { label: "Revenue", data: revenues, backgroundColor: "' + thm.secondary + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>ROI Trend</h3><canvas id="roiChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Spend vs Revenue</h3><canvas id="spendChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Strong ROI performance indicating effective marketing campaigns</li>';
  html += '<li>Cost per acquisition is stable with good conversion rates</li>';
  html += '<li>Marketing attributed revenue growing faster than spend</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateESGSustainabilityHTML() {
  var esgData = data.esgScorecard || [];
  var info = getYearsAndQuarters(esgData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ESG & Sustainability</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>ESG & SUSTAINABILITY</h1></div>';

  html += createFilterDropdowns(esgData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(esgData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var carbonChart = null;';
  html += '  var waterChart = null;';
  html += '  var renewableChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.querySelector(".kpi-grid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var totalCarbon = 0;';
  html += '  var totalWater = 0;';
  html += '  var avgRenewable = 0;';
  html += '  var totalWaste = 0;';
  html += '  var avgEcoPackaging = 0;';
  html += '  var totalBottlesReturned = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    totalCarbon += filtered[i].carbonTonnes || 0;';
  html += '    totalWater += filtered[i].waterUsage || 0;';
  html += '    avgRenewable += filtered[i].renewablePercent || 0;';
  html += '    totalWaste += filtered[i].wasteReduction || 0;';
  html += '    avgEcoPackaging += filtered[i].ecoPackagingPercent || 0;';
  html += '    totalBottlesReturned += filtered[i].bottlesReturned || 0;';
  html += '  }';
  html += '  avgRenewable = filtered.length > 0 ? avgRenewable / filtered.length : 0;';
  html += '  avgEcoPackaging = filtered.length > 0 ? avgEcoPackaging / filtered.length : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Carbon Tonnes</div><div class=\"value\">' + "' + totalCarbon.toFixed(0) + '" + 't</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Water Usage</div><div class=\"value\">' + "' + formatNumber(totalWater) + '" + ' L</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Renewable %</div><div class=\"value\">' + "' + formatPercent(avgRenewable) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Waste Reduction</div><div class=\"value\">' + "' + totalWaste.toFixed(0) + '" + 't</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Eco Packaging %</div><div class=\"value\">' + "' + formatPercent(avgEcoPackaging) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Bottles Returned</div><div class=\"value\">' + "' + formatNumber(totalBottlesReturned) + '" + '</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var carbons = [];';
  html += '  var waters = [];';
  html += '  var renewables = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    carbons.push(filtered[i].carbonTonnes || 0);';
  html += '    waters.push(filtered[i].waterUsage || 0);';
  html += '    renewables.push(filtered[i].renewablePercent || 0);';
  html += '  }';
  html += '  if (carbonChart) carbonChart.destroy();';
  html += '  carbonChart = new Chart(document.getElementById("carbonChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Carbon Emissions (Tonnes)", data: carbons, backgroundColor: "' + thm.danger + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (waterChart) waterChart.destroy();';
  html += '  waterChart = new Chart(document.getElementById("waterChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Water Usage", data: waters, backgroundColor: "' + thm.info + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (renewableChart) renewableChart.destroy();';
  html += '  renewableChart = new Chart(document.getElementById("renewableChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Renewable %", data: renewables, borderColor: "' + thm.success + '", backgroundColor: "rgba(76, 175, 80, 0.1)", tension: 0.4 }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Carbon Emissions Trend</h3><canvas id="carbonChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Water Usage Trend</h3><canvas id="waterChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Renewable Energy %</h3><canvas id="renewableChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Carbon emissions show declining trend with focus on renewable energy</li>';
  html += '<li>Water usage optimization initiatives are showing positive results</li>';
  html += '<li>Eco-packaging adoption is increasing, supporting sustainability goals</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateMarketingSalesImpactHTML() {
  var execData = data.executiveSummary || [];
  var marData = data.marketingROI || [];
  var allData = execData.concat(marData);
  var info = getYearsAndQuarters(allData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Marketing & Sales Impact</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>MARKETING & SALES IMPACT</h1></div>';

  html += createFilterDropdowns(allData, thm);

  html += '<script>';
  html += 'var EXEC_DATA = ' + JSON.stringify(execData) + ';';
  html += 'var MAR_DATA = ' + JSON.stringify(marData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += 'var impactChart = null;';
  html += '  var efficiencyChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filterFunc = function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  };';
  html += '  var filtExec = EXEC_DATA.filter(filterFunc);';
  html += '  var filtMar = MAR_DATA.filter(filterFunc);';
  html += '  updateDashboard(filtExec, filtMar);';
  html += '}';

  html += 'function updateDashboard(filtExec, filtMar) {';
  html += '  var totalSpend = 0;';
  html += '  var totalRev = 0;';
  html += '  var avgROI = 0;';
  html += '  var spendPerUnit = 0;';
  html += '  var units = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtMar.length; i++) {';
  html += '    totalSpend += filtMar[i].totalSpend || 0;';
  html += '    avgROI += filtMar[i].roi || 0;';
  html += '  }';
  html += '  for (i = 0; i < filtExec.length; i++) {';
  html += '    totalRev += filtExec[i].revenue || 0;';
  html += '    units += filtExec[i].unitsSold || 0;';
  html += '  }';
  html += '  avgROI = filtMar.length > 0 ? avgROI / filtMar.length : 0;';
  html += '  spendPerUnit = units > 0 ? totalSpend / units : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Marketing Spend</div><div class=\"value\">$' + "' + formatNumber(totalSpend) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Revenue</div><div class=\"value\">$' + "' + formatNumber(totalRev) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">ROI %</div><div class=\"value\">' + "' + formatPercent(avgROI) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Spend per Unit</div><div class=\"value\">$' + "' + spendPerUnit.toFixed(2) + '" + '</div></div>";';
  html += '  updateCharts(filtExec, filtMar);';
  html += '}';

  html += 'function updateCharts(filtExec, filtMar) {';
  html += '  var labels = [];';
  html += '  var spends = [];';
  html += '  var revenues = [];';
  html += '  var efficiencies = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtExec.length; i++) {';
  html += '    labels.push(filtExec[i].year + " " + (filtExec[i].quarter || ""));';
  html += '    revenues.push(filtExec[i].revenue || 0);';
  html += '  }';
  html += '  for (i = 0; i < filtMar.length; i++) {';
  html += '    spends.push(filtMar[i].totalSpend || 0);';
  html += '    efficiencies.push((filtMar[i].attributedRevenue / (filtMar[i].totalSpend || 1)) * 100);';
  html += '  }';
  html += '  if (impactChart) impactChart.destroy();';
  html += '  impactChart = new Chart(document.getElementById("impactChart"), {';
  html += '    type: "line",';
  html += '    data: { labels: labels, datasets: [{ label: "Marketing Spend", data: spends, borderColor: "' + thm.primary + '", backgroundColor: "rgba(124, 183, 1, 0.1)", yAxisID: "y", tension: 0.4 }, { label: "Revenue", data: revenues, borderColor: "' + thm.secondary + '", backgroundColor: "rgba(149, 214, 0, 0.1)", yAxisID: "y1", tension: 0.4 }] },';
  html += '    options: { responsive: true, interaction: { mode: "index", intersect: false }, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { type: "linear", display: true, position: "left", ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, y1: { type: "linear", display: true, position: "right", ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '  if (efficiencyChart) efficiencyChart.destroy();';
  html += '  efficiencyChart = new Chart(document.getElementById("efficiencyChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Marketing Efficiency (Revenue/Spend)", data: efficiencies, backgroundColor: "' + thm.info + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Marketing Spend vs Revenue</h3><canvas id="impactChart"></canvas></div>';
  html += '<div class="chart-card"><h3>Marketing Efficiency</h3><canvas id="efficiencyChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Strong correlation between marketing spend and revenue growth</li>';
  html += '<li>Marketing efficiency continues to improve with better channel optimization</li>';
  html += '<li>Spend is efficiently driving revenue with strong ROI metrics</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateForecastAccuracyHTML() {
  var execData = data.executiveSummary || [];
  var info = getYearsAndQuarters(execData);
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Forecast Accuracy</title><script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>FORECAST ACCURACY</h1></div>';

  html += createFilterDropdowns(execData, thm);

  html += '<script>';
  html += 'var DATA = ' + JSON.stringify(execData) + ';';
  html += 'var THEME = ' + JSON.stringify(thm) + ';';
  html += '  var forecastChart = null;';

  html += 'function filterData() {';
  html += '  var yearVal = document.getElementById("yearFilter").value;';
  html += '  var quarterVal = document.getElementById("quarterFilter").value;';
  html += '  var filtered = DATA.filter(function(item) {';
  html += '    var yearMatch = yearVal === "" || item.year == yearVal;';
  html += '    var quarterMatch = quarterVal === "" || item.quarter === quarterVal;';
  html += '    return yearMatch && quarterMatch;';
  html += '  });';
  html += '  updateDashboard(filtered);';
  html += '}';

  html += 'function updateDashboard(filtered) {';
  html += '  if (filtered.length === 0) {';
  html += '    document.querySelector(".kpi-grid").innerHTML = "<p style=\"padding: 20px; color: ' + thm.textGray + ';\">No data available</p>";';
  html += '    return;';
  html += '  }';
  html += '  var avgAccuracy = 0;';
  html += '  var avgRevVar = 0;';
  html += '  var avgProfitVar = 0;';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    var planned = filtered[i].plannedRevenue || filtered[i].revenue || 0;';
  html += '    var actual = filtered[i].revenue || 0;';
  html += '    var acc = planned > 0 ? (actual / planned) * 100 : 100;';
  html += '    avgAccuracy += acc;';
  html += '    avgRevVar += (actual - planned);';
  html += '    avgProfitVar += ((filtered[i].netProfit || 0) - (filtered[i].plannedProfit || 0));';
  html += '  }';
  html += '  avgAccuracy = filtered.length > 0 ? avgAccuracy / filtered.length : 100;';
  html += '  avgRevVar = filtered.length > 0 ? avgRevVar / filtered.length : 0;';
  html += '  avgProfitVar = filtered.length > 0 ? avgProfitVar / filtered.length : 0;';
  html += '  document.querySelector(".kpi-grid").innerHTML = ';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Forecast Accuracy</div><div class=\"value\">' + "' + formatPercent(avgAccuracy) + '" + '</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Revenue Variance</div><div class=\"value\">$' + "' + formatNumber(avgRevVar) + '" + 'M</div></div>" +';
  html += '    "<div class=\"kpi-card\"><div class=\"label\">Profit Variance</div><div class=\"value\">$' + "' + formatNumber(avgProfitVar) + '" + 'M</div></div>";';
  html += '  updateCharts(filtered);';
  html += '}';

  html += 'function updateCharts(filtered) {';
  html += '  var labels = [];';
  html += '  var actuals = [];';
  html += '  var planneds = [];';
  html += '  var i;';
  html += '  for (i = 0; i < filtered.length; i++) {';
  html += '    labels.push(filtered[i].year + " " + (filtered[i].quarter || ""));';
  html += '    actuals.push(filtered[i].revenue || 0);';
  html += '    planneds.push(filtered[i].plannedRevenue || filtered[i].revenue || 0);';
  html += '  }';
  html += '  if (forecastChart) forecastChart.destroy();';
  html += '  forecastChart = new Chart(document.getElementById("forecastChart"), {';
  html += '    type: "bar",';
  html += '    data: { labels: labels, datasets: [{ label: "Actual Revenue", data: actuals, backgroundColor: "' + thm.primary + '" }, { label: "Planned Revenue", data: planneds, backgroundColor: "' + thm.textGray + '" }] },';
  html += '    options: { responsive: true, plugins: { legend: { labels: { color: "' + thm.textWhite + '" } } }, scales: { y: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } }, x: { ticks: { color: "' + thm.textGray + '" }, grid: { color: "' + thm.bgCardLight + '" } } } }';
  html += '  });';
  html += '}';
  html += 'filterData();';
  html += '</script>';

  html += '<div class="kpi-grid"></div>';

  html += '<div class="charts-grid">';
  html += '<div class="chart-card"><h3>Actual vs Planned Revenue</h3><canvas id="forecastChart"></canvas></div>';
  html += '</div>';

  html += '<div class="insights"><h3>Key Insights</h3><ul>';
  html += '<li>Forecast accuracy is strong, indicating reliable planning processes</li>';
  html += '<li>Revenue variances are minimal, showing good demand forecasting</li>';
  html += '<li>Profit forecasts align well with actual performance</li>';
  html += '</ul></div>';

  html += '</body></html>';
  return html;
}

function generateMetricsDictionaryHTML() {
  var thm = theme;

  var html = '<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Metrics Dictionary</title><style>' + generateCSS(thm) + '</style></head><body>';

  html += '<div class="header"><div><a href="index.html" class="back-link">&larr; Back to Home</a></div><h1>METRICS DICTIONARY</h1></div>';

  html += '<div class="metrics-section">';

  html += '<h2>Financial Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>Revenue</td><td>Total sales revenue from all channels and products</td></tr>';
  html += '<tr><td>Gross Profit</td><td>Revenue minus cost of goods sold (COGS)</td></tr>';
  html += '<tr><td>Margin %</td><td>Gross profit divided by revenue, expressed as percentage</td></tr>';
  html += '<tr><td>EBITDA</td><td>Earnings Before Interest, Taxes, Depreciation, and Amortization</td></tr>';
  html += '<tr><td>Net Profit</td><td>Final profit after all expenses and taxes</td></tr>';
  html += '</table>';

  html += '<h2>Sales Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>Units Sold</td><td>Total number of units sold across all categories</td></tr>';
  html += '<tr><td>Revenue by Category</td><td>Revenue breakdown by product category</td></tr>';
  html += '<tr><td>Revenue by Channel</td><td>Revenue from different sales channels (Online, Retail, Wholesale, etc.)</td></tr>';
  html += '<tr><td>Revenue by Region</td><td>Revenue breakdown by geographic region</td></tr>';
  html += '<tr><td>Avg Margin</td><td>Average profit margin across all sales</td></tr>';
  html += '</table>';

  html += '<h2>Inventory Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>Days of Stock</td><td>Average number of days inventory on hand</td></tr>';
  html += '<tr><td>Stockout Rate</td><td>Percentage of time items are out of stock</td></tr>';
  html += '<tr><td>Near Expiry Units</td><td>Number of units approaching expiration date</td></tr>';
  html += '<tr><td>Expired Units</td><td>Number of units past expiration that were discarded</td></tr>';
  html += '<tr><td>Inventory Value</td><td>Total value of inventory on hand</td></tr>';
  html += '</table>';

  html += '<h2>Supply Chain Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>Avg Lead Time</td><td>Average days from order to delivery</td></tr>';
  html += '<tr><td>Late Delivery %</td><td>Percentage of orders delivered late</td></tr>';
  html += '<tr><td>Rejection Rate</td><td>Percentage of incoming goods rejected for quality issues</td></tr>';
  html += '<tr><td>Supplier Rating</td><td>Average rating of supplier performance (1-5 scale)</td></tr>';
  html += '</table>';

  html += '<h2>Production Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>Utilization %</td><td>Percentage of production capacity being used</td></tr>';
  html += '<tr><td>Yield Rate</td><td>Percentage of good units produced vs total units</td></tr>';
  html += '<tr><td>Defect Rate</td><td>Percentage of defective units produced</td></tr>';
  html += '<tr><td>Downtime Hours</td><td>Total hours of equipment downtime</td></tr>';
  html += '<tr><td>Cost/Unit</td><td>Average cost to produce one unit</td></tr>';
  html += '<tr><td>Units Produced</td><td>Total number of units produced</td></tr>';
  html += '</table>';

  html += '<h2>Quality & Compliance Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>Pass Rate</td><td>Percentage of products passing quality inspection</td></tr>';
  html += '<tr><td>FDA Violations</td><td>Number of FDA compliance violations</td></tr>';
  html += '<tr><td>Recalls</td><td>Number of product recalls issued</td></tr>';
  html += '<tr><td>Labeling Issues</td><td>Number of labeling defects or non-compliance issues</td></tr>';
  html += '</table>';

  html += '<h2>Marketing Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>ROI %</td><td>Return on Investment: (Revenue - Cost) / Cost * 100</td></tr>';
  html += '<tr><td>CPA</td><td>Cost Per Acquisition: Total marketing spend / number of customers acquired</td></tr>';
  html += '<tr><td>Conversion Rate</td><td>Percentage of visitors that complete a purchase</td></tr>';
  html += '<tr><td>CTR</td><td>Click-Through Rate: percentage of ad impressions that result in clicks</td></tr>';
  html += '<tr><td>Total Spend</td><td>Total marketing expenditure</td></tr>';
  html += '<tr><td>Attributed Revenue</td><td>Revenue directly attributed to marketing campaigns</td></tr>';
  html += '</table>';

  html += '<h2>ESG & Sustainability Metrics</h2>';
  html += '<table class="metrics-table"><tr><th>Metric</th><th>Definition</th></tr>';
  html += '<tr><td>Carbon Tonnes</td><td>Total carbon emissions in metric tonnes</td></tr>';
  html += '<tr><td>Water Usage</td><td>Total water consumed in production</td></tr>';
  html += '<tr><td>Renewable %</td><td>Percentage of energy from renewable sources</td></tr>';
  html += '<tr><td>Waste Reduction</td><td>Amount of waste diverted from landfill</td></tr>';
  html += '<tr><td>Eco Packaging %</td><td>Percentage of products using eco-friendly packaging</td></tr>';
  html += '<tr><td>Bottles Returned</td><td>Number of bottles returned for recycling</td></tr>';
  html += '</table>';

  html += '</div>';

  html += '</body></html>';
  return html;
}

// Generate all dashboards
var dashboards = [
  { name: 'index.html', generator: generateIndexHTML },
  { name: 'executive-overview.html', generator: generateExecutiveOverviewHTML },
  { name: 'sales-performance.html', generator: generateSalesPerformanceHTML },
  { name: 'inventory-health.html', generator: generateInventoryHealthHTML },
  { name: 'supply-chain.html', generator: generateSupplyChainHTML },
  { name: 'production-efficiency.html', generator: generateProductionEfficiencyHTML },
  { name: 'quality-compliance.html', generator: generateQualityComplianceHTML },
  { name: 'marketing-roi.html', generator: generateMarketingROIHTML },
  { name: 'esg-sustainability.html', generator: generateESGSustainabilityHTML },
  { name: 'marketing-sales-impact.html', generator: generateMarketingSalesImpactHTML },
  { name: 'forecast-accuracy.html', generator: generateForecastAccuracyHTML },
  { name: 'metrics-dictionary.html', generator: generateMetricsDictionaryHTML }
];

var i;
for (i = 0; i < dashboards.length; i++) {
  var dashboard = dashboards[i];
  var htmlContent = dashboard.generator();
  var outputPath = path.join(outputDir, dashboard.name);
  fs.writeFileSync(outputPath, htmlContent);
  console.log('Generated: ' + dashboard.name);
}

console.log('All dashboards generated successfully!');
