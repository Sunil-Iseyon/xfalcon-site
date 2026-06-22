var pptxgen = require("pptxgenjs");
var fs = require("fs");
var path = require("path");

// ── CLI Args ──
var configPath = process.argv[2] || "config.json";
var cliQuarter = null;
var cliYear = null;
for (var a = 3; a < process.argv.length; a++) {
  if (process.argv[a] === "--quarter" && process.argv[a + 1]) cliQuarter = parseInt(process.argv[a + 1]);
  if (process.argv[a] === "--year" && process.argv[a + 1]) cliYear = parseInt(process.argv[a + 1]);
}

var config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
var outputDir = config.outputDir || "./";
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

// ── Theme: strip # from hex colors ──
var C = {};
var thm = config.theme || {};
var defaultTheme = { bgDark: "0D0D0D", bgCard: "1A1A1A", bgCardLight: "222222", primary: "7CB701", secondary: "95D600", textWhite: "FFFFFF", textGray: "9B999B", danger: "FF4444", warning: "FFB800", info: "00BCD4", purple: "9C27B0", orange: "FF6F00", success: "4CAF50" };
var themeKeys = Object.keys(defaultTheme);
for (var ti = 0; ti < themeKeys.length; ti++) {
  var tk = themeKeys[ti];
  var val = thm[tk] || defaultTheme[tk];
  C[tk] = val.replace("#", "");
}
C.accentBlue = "2196F3";
C.accentTeal = "009688";

var makeShadow = function() { return { type: "outer", blur: 6, offset: 2, angle: 135, color: "000000", opacity: 0.3 }; };

var PERIODS = { 1: "Jan - Mar", 2: "Apr - Jun", 3: "Jul - Sep", 4: "Oct - Dec" };

// ── Helper functions ──
function pctChange(curr, prev) {
  if (!prev || prev === 0) return "N/A";
  var chg = ((curr - prev) / Math.abs(prev) * 100).toFixed(1);
  return (chg >= 0 ? "+" : "") + chg + "%";
}

function fmt(n) {
  if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return "$" + (n / 1000).toFixed(1) + "K";
  return "$" + n.toFixed(2);
}

function fmtNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

// ── Transform config data into QBR data format ──
function buildQData(d, year, quarter) {
  var exec = null;
  var prevExec = null;
  var prevQ = quarter - 1;
  var prevY = year;
  if (prevQ < 1) { prevQ = 4; prevY = year - 1; }

  // Find executive summary for this quarter and previous
  var es = d.executiveSummary || [];
  for (var i = 0; i < es.length; i++) {
    if (es[i].year === year && es[i].quarter === quarter) exec = es[i];
    if (es[i].year === prevY && es[i].quarter === prevQ) prevExec = es[i];
  }
  if (!exec) exec = { netRevenue: 0, grossProfit: 0, avgMarginPct: 0, ebitda: 0, netProfit: 0, totalUnits: 0, mktSpend: 0 };
  if (!prevExec) prevExec = { netRevenue: 0, grossProfit: 0, avgMarginPct: 0, ebitda: 0, netProfit: 0, totalUnits: 0, mktSpend: 0 };

  // Sales by category for this quarter
  var catData = (d.salesByCategory || []).filter(function(r) { return r.year === year && r.quarter === quarter; });
  var salesByCategory = catData.map(function(r) { return { name: r.category, revenue: r.revenue / 1000 }; });

  // Sales by channel
  var chData = (d.salesByChannel || []).filter(function(r) { return r.year === year && r.quarter === quarter; });
  var salesByChannel = chData.map(function(r) { return { name: r.channel, revenue: r.revenue / 1000 }; });

  // Sales by region
  var rgData = (d.salesByRegion || []).filter(function(r) { return r.year === year && r.quarter === quarter; });
  var salesByRegion = rgData.map(function(r) { return { name: r.region, revenue: r.revenue / 1000 }; });

  // Inventory
  var invRow = (d.inventoryHealth || []).filter(function(r) { return r.year === year && r.quarter === quarter; })[0];
  var inventory = invRow ? {
    daysOfStock: invRow.daysOfStock, stockouts: invRow.stockouts, stockoutRate: invRow.stockoutRatePct,
    slowMoving: invRow.slowMoving, nearExpiry: invRow.nearExpiry, expired: invRow.expired
  } : { daysOfStock: 0, stockouts: 0, stockoutRate: 0, slowMoving: 0, nearExpiry: 0, expired: 0 };

  // Supply chain
  var scRow = (d.supplyChain || []).filter(function(r) { return r.year === year && r.quarter === quarter; })[0];
  var supplyChain = scRow ? {
    leadDays: scRow.avgLeadDays, lateDeliveryPct: scRow.lateDeliveryPct, rejectionPct: scRow.rejectionPct,
    reliability: scRow.reliabilityRating, totalOrders: scRow.totalOrders, lateDeliveries: scRow.lateDeliveries, cost: scRow.totalCost
  } : { leadDays: 0, lateDeliveryPct: 0, rejectionPct: 0, reliability: 0, totalOrders: 0, lateDeliveries: 0, cost: 0 };

  // Production
  var prRow = (d.productionEfficiency || []).filter(function(r) { return r.year === year && r.quarter === quarter; })[0];
  var production = prRow ? {
    utilization: prRow.utilizationPct, yieldPct: prRow.yieldPct, defectPct: prRow.defectPct,
    downtime: prRow.downtimeHrs, costPerUnit: prRow.costPerUnit, unitsProduced: prRow.unitsProduced, recalls: prRow.recalledBatches
  } : { utilization: 0, yieldPct: 0, defectPct: 0, downtime: 0, costPerUnit: 0, unitsProduced: 0, recalls: 0 };

  // Quality
  var qlRow = (d.qualityCompliance || []).filter(function(r) { return r.year === year && r.quarter === quarter; })[0];
  var quality = qlRow ? {
    passRate: qlRow.passRatePct, fdaViolations: qlRow.fdaViolations, recalls: qlRow.recalls,
    recallUnits: qlRow.recallUnits, labelingIssues: qlRow.labelingIssues, unitsInspected: qlRow.unitsInspected, fdaViolationRate: qlRow.fdaViolationRatePct
  } : { passRate: 0, fdaViolations: 0, recalls: 0, recallUnits: 0, labelingIssues: 0, unitsInspected: 0, fdaViolationRate: 0 };

  // ESG
  var esRow = (d.esgScorecard || []).filter(function(r) { return r.year === year && r.quarter === quarter; })[0];
  var esg = esRow ? {
    carbonTonnes: esRow.carbonTonnes, waterM3: esRow.waterM3, renewablePct: esRow.renewablePct,
    wasteKg: esRow.wasteKg, ecoPackagingPct: esRow.ecoPackagingPct, glassRecycled: esRow.glassRecycled, bottlesReturned: esRow.bottlesReturned
  } : { carbonTonnes: 0, waterM3: 0, renewablePct: 0, wasteKg: 0, ecoPackagingPct: 0, glassRecycled: 0, bottlesReturned: 0 };

  // Marketing - find closest available quarter
  var mktAll = d.marketingROI || [];
  var mktRow = mktAll.filter(function(r) { return r.year === year && r.quarter === quarter; })[0];
  var mktNote = "Q" + quarter + " " + year;
  if (!mktRow) {
    // Find the most recent available marketing data
    mktAll.sort(function(a, b) { return (b.year * 10 + b.quarter) - (a.year * 10 + a.quarter); });
    if (mktAll.length > 0) {
      mktRow = mktAll[0];
      mktNote = "Latest available: Q" + mktRow.quarter + " " + mktRow.year;
    }
  }
  var marketing = mktRow ? {
    roi: mktRow.roi, cpa: mktRow.cpa, cvr: mktRow.cvrPct, ctr: mktRow.ctrPct,
    spend: mktRow.totalSpend, attributedRev: mktRow.attributedRevenue, note: mktNote
  } : { roi: 0, cpa: 0, cvr: 0, ctr: 0, spend: 0, attributedRev: 0, note: "No data available" };

  var ebitdaM = exec.ebitda >= 1000000 ? exec.ebitda / 1000000 : exec.ebitda;
  var netProfitM = exec.netProfit >= 1000000 ? exec.netProfit / 1000000 : exec.netProfit;
  var prevEbitdaM = prevExec.ebitda >= 1000000 ? prevExec.ebitda / 1000000 : prevExec.ebitda;
  var prevNetProfitM = prevExec.netProfit >= 1000000 ? prevExec.netProfit / 1000000 : prevExec.netProfit;
  var mktSpendM = exec.mktSpend >= 1000000 ? (exec.mktSpend / 1000000).toFixed(2) : (exec.mktSpend / 1000000).toFixed(2);

  return {
    quarter: "Q" + quarter, year: year, period: PERIODS[quarter] + " " + year,
    prevQuarter: "Q" + prevQ,
    exec: { revenue: exec.netRevenue, grossProfit: exec.grossProfit, margin: exec.avgMarginPct, ebitda: parseFloat(ebitdaM.toFixed(2)), netProfit: parseFloat(netProfitM.toFixed(2)), units: exec.totalUnits, mktSpend: parseFloat(mktSpendM) },
    prevExec: { revenue: prevExec.netRevenue, grossProfit: prevExec.grossProfit, margin: prevExec.avgMarginPct, ebitda: parseFloat(prevEbitdaM.toFixed(2)), netProfit: parseFloat(prevNetProfitM.toFixed(2)), units: prevExec.totalUnits, mktSpend: parseFloat((prevExec.mktSpend >= 1000000 ? prevExec.mktSpend / 1000000 : prevExec.mktSpend).toFixed(2)) },
    salesByCategory: salesByCategory,
    salesByChannel: salesByChannel,
    salesByRegion: salesByRegion,
    inventory: inventory,
    supplyChain: supplyChain,
    production: production,
    quality: quality,
    esg: esg,
    marketing: marketing,
  };
}

// ── buildQBR: The proven, working presentation builder ──
function buildQBR(qData, outputPath) {
  var pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = config.company || "Analytics";
  pres.title = "QBR " + qData.quarter + " " + qData.year;

  // ─── SLIDE 1: Title ───
  var s1 = pres.addSlide();
  s1.background = { color: C.bgDark };
  s1.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s1.addText("QUARTERLY BUSINESS REVIEW", {
    x: 0.8, y: 1.2, w: 8.4, h: 0.7, fontSize: 32, fontFace: "Arial",
    color: C.textWhite, bold: true, charSpacing: 4,
  });
  s1.addText(qData.quarter + " " + qData.year + "  |  " + qData.period, {
    x: 0.8, y: 2.0, w: 8.4, h: 0.5, fontSize: 20, fontFace: "Arial", color: C.primary, bold: true,
  });
  s1.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 2.7, w: 2.5, h: 0.04, fill: { color: C.primary } });
  s1.addText(config.division || config.company || "", {
    x: 0.8, y: 3.0, w: 8.4, h: 0.4, fontSize: 16, fontFace: "Arial", color: C.textGray,
  });
  s1.addText("Confidential  |  Prepared for Leadership Review", {
    x: 0.8, y: 4.8, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.textGray, italic: true,
  });

  // ─── SLIDE 2: Agenda ───
  var s2 = pres.addSlide();
  s2.background = { color: C.bgDark };
  s2.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s2.addText("AGENDA", {
    x: 0.8, y: 0.3, w: 8.4, h: 0.6, fontSize: 24, fontFace: "Arial", color: C.textWhite, bold: true,
  });
  var agendaItems = [
    "Executive Summary & Key Metrics", "Revenue & Profitability Analysis",
    "Sales Performance Deep Dive", "Inventory & Supply Chain Health",
    "Production Efficiency & Quality", "Marketing Performance",
    "ESG & Sustainability Scorecard", "Strategic Recommendations & Next Steps",
  ];
  for (var i = 0; i < agendaItems.length; i++) {
    var yPos = 1.2 + i * 0.48;
    s2.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: yPos, w: 8.4, h: 0.38, fill: { color: i % 2 === 0 ? C.bgCard : C.bgCardLight } });
    s2.addText((i + 1).toString().padStart(2, "0"), { x: 1.0, y: yPos, w: 0.5, h: 0.38, fontSize: 14, fontFace: "Arial", color: C.primary, bold: true, valign: "middle" });
    s2.addText(agendaItems[i], { x: 1.6, y: yPos, w: 7.0, h: 0.38, fontSize: 14, fontFace: "Arial", color: C.textWhite, valign: "middle" });
  }

  // ─── SLIDE 3: Executive Summary KPIs ───
  var s3 = pres.addSlide();
  s3.background = { color: C.bgDark };
  s3.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s3.addText("EXECUTIVE SUMMARY", { x: 0.8, y: 0.2, w: 6, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  s3.addText(qData.quarter + " " + qData.year + " vs " + qData.prevQuarter + " " + qData.year, { x: 6.8, y: 0.2, w: 2.6, h: 0.5, fontSize: 12, fontFace: "Arial", color: C.textGray, align: "right" });

  var kpis = [
    { label: "Net Revenue", value: fmt(qData.exec.revenue), change: pctChange(qData.exec.revenue, qData.prevExec.revenue), color: C.primary },
    { label: "Gross Profit", value: fmt(qData.exec.grossProfit), change: pctChange(qData.exec.grossProfit, qData.prevExec.grossProfit), color: C.info },
    { label: "Gross Margin", value: qData.exec.margin + "%", change: pctChange(qData.exec.margin, qData.prevExec.margin), color: C.success },
    { label: "EBITDA", value: "$" + qData.exec.ebitda + "M", change: pctChange(qData.exec.ebitda, qData.prevExec.ebitda), color: C.warning },
    { label: "Net Profit", value: "$" + qData.exec.netProfit + "M", change: pctChange(qData.exec.netProfit, qData.prevExec.netProfit), color: C.accentBlue },
    { label: "Units Sold", value: fmtNum(qData.exec.units), change: pctChange(qData.exec.units, qData.prevExec.units), color: C.purple },
  ];
  for (var k = 0; k < kpis.length; k++) {
    var col = k % 3; var row = Math.floor(k / 3);
    var kx = 0.8 + col * 2.9; var ky = 1.0 + row * 2.1;
    s3.addShape(pres.shapes.RECTANGLE, { x: kx, y: ky, w: 2.7, h: 1.8, fill: { color: C.bgCard }, shadow: makeShadow() });
    s3.addShape(pres.shapes.RECTANGLE, { x: kx, y: ky, w: 0.06, h: 1.8, fill: { color: kpis[k].color } });
    s3.addText(kpis[k].label, { x: kx + 0.2, y: ky + 0.15, w: 2.3, h: 0.35, fontSize: 11, fontFace: "Arial", color: C.textGray });
    s3.addText(kpis[k].value, { x: kx + 0.2, y: ky + 0.55, w: 2.3, h: 0.6, fontSize: 24, fontFace: "Arial", color: C.textWhite, bold: true });
    var chgColor = kpis[k].change.startsWith("+") ? C.success : C.danger;
    if (kpis[k].change === "N/A") chgColor = C.textGray;
    s3.addText(kpis[k].change + " QoQ", { x: kx + 0.2, y: ky + 1.2, w: 2.3, h: 0.4, fontSize: 12, fontFace: "Arial", color: chgColor, bold: true });
  }

  // ─── SLIDE 4: Revenue & Profitability ───
  var s4 = pres.addSlide();
  s4.background = { color: C.bgDark };
  s4.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s4.addText("REVENUE & PROFITABILITY", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  s4.addChart(pres.charts.BAR, [{
    name: qData.prevQuarter, labels: ["Revenue", "Gross Profit", "EBITDA", "Net Profit"],
    values: [qData.prevExec.revenue, qData.prevExec.grossProfit, qData.prevExec.ebitda * 1000, qData.prevExec.netProfit * 1000],
  }, {
    name: qData.quarter, labels: ["Revenue", "Gross Profit", "EBITDA", "Net Profit"],
    values: [qData.exec.revenue, qData.exec.grossProfit, qData.exec.ebitda * 1000, qData.exec.netProfit * 1000],
  }], {
    x: 0.5, y: 0.9, w: 5.5, h: 3.5, barDir: "col", chartColors: [C.textGray, C.primary],
    chartArea: { fill: { color: C.bgCard } }, plotArea: { fill: { color: C.bgCard } },
    catAxisLabelColor: C.textGray, catAxisLabelFontSize: 10, valAxisLabelColor: C.textGray, valAxisLabelFontSize: 9,
    valGridLine: { color: C.bgCardLight, size: 0.5 }, catGridLine: { style: "none" },
    showLegend: true, legendPos: "b", legendColor: C.textGray,
    showTitle: true, title: "Quarter-over-Quarter ($K)", titleColor: C.textGray, titleFontSize: 11,
  });
  s4.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 0.9, w: 3.3, h: 3.5, fill: { color: C.bgCard }, shadow: makeShadow() });
  s4.addShape(pres.shapes.RECTANGLE, { x: 6.3, y: 0.9, w: 0.06, h: 3.5, fill: { color: C.info } });
  s4.addText("Key Insights", { x: 6.5, y: 1.0, w: 3.0, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.textWhite, bold: true });
  var revChange = qData.prevExec.revenue ? ((qData.exec.revenue - qData.prevExec.revenue) / qData.prevExec.revenue * 100).toFixed(1) : "0";
  var marginDelta = (qData.exec.margin - qData.prevExec.margin).toFixed(1);
  var profitChange = qData.prevExec.netProfit ? ((qData.exec.netProfit - qData.prevExec.netProfit) / qData.prevExec.netProfit * 100).toFixed(1) : "0";
  var insights4 = [];
  insights4.push({ text: "Revenue " + (revChange >= 0 ? "grew " + revChange : "declined " + Math.abs(revChange)) + "% QoQ to " + fmt(qData.exec.revenue), options: { bullet: true, breakLine: true, fontSize: 11, color: C.textWhite, fontFace: "Arial" } });
  insights4.push({ text: "Gross margin " + (marginDelta >= 0 ? "expanded" : "contracted") + " by " + Math.abs(marginDelta) + " bps to " + qData.exec.margin + "%", options: { bullet: true, breakLine: true, fontSize: 11, color: C.textWhite, fontFace: "Arial" } });
  insights4.push({ text: "Net profit " + (profitChange >= 0 ? "up" : "down") + " " + Math.abs(profitChange) + "% to $" + qData.exec.netProfit + "M", options: { bullet: true, breakLine: true, fontSize: 11, color: C.textWhite, fontFace: "Arial" } });
  insights4.push({ text: "EBITDA at $" + qData.exec.ebitda + "M (" + pctChange(qData.exec.ebitda, qData.prevExec.ebitda) + " QoQ)", options: { bullet: true, fontSize: 11, color: C.textWhite, fontFace: "Arial" } });
  s4.addText(insights4, { x: 6.5, y: 1.5, w: 2.9, h: 2.5, valign: "top", paraSpaceAfter: 8 });

  // ─── SLIDE 5: Sales by Category ───
  var s5 = pres.addSlide();
  s5.background = { color: C.bgDark };
  s5.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s5.addText("SALES BY CATEGORY", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  if (qData.salesByCategory.length > 0) {
    var catLabels = qData.salesByCategory.map(function(c) { return c.name; });
    var catValues = qData.salesByCategory.map(function(c) { return c.revenue; });
    var catColors = [C.primary, C.info, C.warning, C.purple, C.orange, C.success];
    s5.addChart(pres.charts.DOUGHNUT, [{ name: "Revenue", labels: catLabels, values: catValues }], {
      x: 0.5, y: 0.8, w: 4.5, h: 4.0, chartColors: catColors, chartArea: { fill: { color: C.bgDark } },
      showPercent: true, dataLabelColor: C.textWhite, dataLabelFontSize: 11,
      showLegend: true, legendPos: "b", legendColor: C.textGray, legendFontSize: 10,
      showTitle: true, title: "Revenue by Category ($K)", titleColor: C.textGray, titleFontSize: 11,
    });
    var catTotal = catValues.reduce(function(a, b) { return a + b; }, 0);
    for (var ci = 0; ci < Math.min(qData.salesByCategory.length, 6); ci++) {
      var cy = 0.9 + ci * 0.85;
      s5.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: cy, w: 4.0, h: 0.75, fill: { color: C.bgCard }, shadow: makeShadow() });
      s5.addShape(pres.shapes.RECTANGLE, { x: 5.5, y: cy, w: 0.06, h: 0.75, fill: { color: catColors[ci] || C.primary } });
      s5.addText(qData.salesByCategory[ci].name, { x: 5.7, y: cy + 0.05, w: 2.5, h: 0.3, fontSize: 13, fontFace: "Arial", color: C.textWhite, bold: true });
      var catPct = (qData.salesByCategory[ci].revenue / catTotal * 100).toFixed(1);
      s5.addText("$" + qData.salesByCategory[ci].revenue.toFixed(1) + "K  |  " + catPct + "% share", { x: 5.7, y: cy + 0.38, w: 3.5, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.textGray });
    }
  } else {
    s5.addText("No category data available", { x: 2, y: 2.5, w: 6, h: 1, fontSize: 16, fontFace: "Arial", color: C.textGray, align: "center" });
  }

  // ─── SLIDE 6: Sales by Channel & Region ───
  var s6 = pres.addSlide();
  s6.background = { color: C.bgDark };
  s6.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s6.addText("SALES BY CHANNEL & REGION", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  if (qData.salesByChannel.length > 0) {
    s6.addChart(pres.charts.BAR, [{ name: "Revenue ($K)", labels: qData.salesByChannel.map(function(c) { return c.name; }), values: qData.salesByChannel.map(function(c) { return c.revenue; }) }], {
      x: 0.3, y: 0.8, w: 4.5, h: 3.8, barDir: "bar", chartColors: [C.primary],
      chartArea: { fill: { color: C.bgCard } }, plotArea: { fill: { color: C.bgCard } },
      catAxisLabelColor: C.textGray, catAxisLabelFontSize: 10, valAxisLabelColor: C.textGray, valAxisLabelFontSize: 9,
      valGridLine: { color: C.bgCardLight, size: 0.5 }, catGridLine: { style: "none" },
      showValue: true, dataLabelColor: C.textWhite, dataLabelPosition: "outEnd", showLegend: false,
      showTitle: true, title: "Revenue by Channel", titleColor: C.textGray, titleFontSize: 11,
    });
  }
  if (qData.salesByRegion.length > 0) {
    s6.addChart(pres.charts.BAR, [{ name: "Revenue ($K)", labels: qData.salesByRegion.map(function(c) { return c.name; }), values: qData.salesByRegion.map(function(c) { return c.revenue; }) }], {
      x: 5.2, y: 0.8, w: 4.5, h: 3.8, barDir: "bar", chartColors: [C.info],
      chartArea: { fill: { color: C.bgCard } }, plotArea: { fill: { color: C.bgCard } },
      catAxisLabelColor: C.textGray, catAxisLabelFontSize: 10, valAxisLabelColor: C.textGray, valAxisLabelFontSize: 9,
      valGridLine: { color: C.bgCardLight, size: 0.5 }, catGridLine: { style: "none" },
      showValue: true, dataLabelColor: C.textWhite, dataLabelPosition: "outEnd", showLegend: false,
      showTitle: true, title: "Revenue by Region", titleColor: C.textGray, titleFontSize: 11,
    });
  }

  // ─── SLIDE 7: Inventory & Supply Chain ───
  var s7 = pres.addSlide();
  s7.background = { color: C.bgDark };
  s7.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s7.addText("INVENTORY & SUPPLY CHAIN", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  s7.addText("Inventory Health", { x: 0.8, y: 0.8, w: 4, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.primary, bold: true });
  var invKpis = [
    { label: "Days of Stock", value: qData.inventory.daysOfStock.toString(), color: C.primary },
    { label: "Stockout Rate", value: qData.inventory.stockoutRate + "%", color: qData.inventory.stockoutRate > 8 ? C.danger : C.warning },
    { label: "Near Expiry Units", value: fmtNum(qData.inventory.nearExpiry), color: C.warning },
    { label: "Expired Units", value: fmtNum(qData.inventory.expired), color: C.danger },
  ];
  for (var iv = 0; iv < invKpis.length; iv++) {
    var ivCol = iv % 2; var ivRow = Math.floor(iv / 2);
    var ivx = 0.8 + ivCol * 2.2; var ivy = 1.25 + ivRow * 1.3;
    s7.addShape(pres.shapes.RECTANGLE, { x: ivx, y: ivy, w: 2.0, h: 1.1, fill: { color: C.bgCard }, shadow: makeShadow() });
    s7.addShape(pres.shapes.RECTANGLE, { x: ivx, y: ivy, w: 0.05, h: 1.1, fill: { color: invKpis[iv].color } });
    s7.addText(invKpis[iv].label, { x: ivx + 0.15, y: ivy + 0.1, w: 1.7, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textGray });
    s7.addText(invKpis[iv].value, { x: ivx + 0.15, y: ivy + 0.45, w: 1.7, h: 0.5, fontSize: 20, fontFace: "Arial", color: C.textWhite, bold: true });
  }
  s7.addText("Supply Chain", { x: 5.4, y: 0.8, w: 4, h: 0.35, fontSize: 14, fontFace: "Arial", color: C.info, bold: true });
  var scKpis = [
    { label: "Avg Lead Time", value: qData.supplyChain.leadDays + " days", color: C.info },
    { label: "Late Delivery %", value: qData.supplyChain.lateDeliveryPct + "%", color: qData.supplyChain.lateDeliveryPct > 10 ? C.danger : C.success },
    { label: "Rejection Rate", value: qData.supplyChain.rejectionPct + "%", color: C.success },
    { label: "Supplier Rating", value: qData.supplyChain.reliability + "/5", color: C.primary },
  ];
  for (var sc = 0; sc < scKpis.length; sc++) {
    var scCol = sc % 2; var scRow = Math.floor(sc / 2);
    var scx = 5.4 + scCol * 2.2; var scy = 1.25 + scRow * 1.3;
    s7.addShape(pres.shapes.RECTANGLE, { x: scx, y: scy, w: 2.0, h: 1.1, fill: { color: C.bgCard }, shadow: makeShadow() });
    s7.addShape(pres.shapes.RECTANGLE, { x: scx, y: scy, w: 0.05, h: 1.1, fill: { color: scKpis[sc].color } });
    s7.addText(scKpis[sc].label, { x: scx + 0.15, y: scy + 0.1, w: 1.7, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textGray });
    s7.addText(scKpis[sc].value, { x: scx + 0.15, y: scy + 0.45, w: 1.7, h: 0.5, fontSize: 20, fontFace: "Arial", color: C.textWhite, bold: true });
  }
  // Bottom commentary
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.0, w: 8.6, h: 1.2, fill: { color: C.bgCard }, shadow: makeShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.0, w: 0.05, h: 1.2, fill: { color: C.warning } });
  var invInsights = [];
  if (qData.inventory.stockoutRate > 8) invInsights.push("Stockout rate at " + qData.inventory.stockoutRate + "% requires attention");
  else invInsights.push("Stockout rate at " + qData.inventory.stockoutRate + "% - inventory controls effective");
  invInsights.push("Total procurement cost: " + fmt(qData.supplyChain.cost) + " across " + qData.supplyChain.totalOrders + " orders");
  if (qData.supplyChain.lateDeliveryPct > 10) invInsights.push("Late delivery rate elevated at " + qData.supplyChain.lateDeliveryPct + "%");
  var invText = invInsights.map(function(t, idx) { return { text: t, options: { bullet: true, breakLine: idx < invInsights.length - 1, fontSize: 11, color: C.textWhite, fontFace: "Arial" } }; });
  s7.addText(invText, { x: 1.0, y: 4.1, w: 8.2, h: 1.0, valign: "top", paraSpaceAfter: 4 });

  // ─── SLIDE 8: Production & Quality ───
  var s8 = pres.addSlide();
  s8.background = { color: C.bgDark };
  s8.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s8.addText("PRODUCTION EFFICIENCY & QUALITY", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  s8.addText("Production", { x: 0.8, y: 0.8, w: 4, h: 0.3, fontSize: 14, fontFace: "Arial", color: C.primary, bold: true });
  var prodKpis = [
    { label: "Capacity Utilization", value: qData.production.utilization + "%", target: "60%", color: C.primary },
    { label: "Yield Rate", value: qData.production.yieldPct + "%", target: "95%", color: C.success },
    { label: "Defect Rate", value: qData.production.defectPct + "%", target: "<1%", color: qData.production.defectPct > 1 ? C.warning : C.success },
    { label: "Downtime (hrs)", value: qData.production.downtime.toString(), target: "<80", color: qData.production.downtime > 80 ? C.warning : C.success },
    { label: "Cost per Unit", value: "$" + qData.production.costPerUnit, target: "$0.35", color: C.info },
    { label: "Units Produced", value: fmtNum(qData.production.unitsProduced), target: "-", color: C.primary },
  ];
  for (var pi = 0; pi < prodKpis.length; pi++) {
    var pCol = pi % 3; var pRow = Math.floor(pi / 3);
    var px = 0.8 + pCol * 2.9; var py = 1.2 + pRow * 1.15;
    s8.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: 2.7, h: 1.0, fill: { color: C.bgCard }, shadow: makeShadow() });
    s8.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: 0.05, h: 1.0, fill: { color: prodKpis[pi].color } });
    s8.addText(prodKpis[pi].label, { x: px + 0.15, y: py + 0.05, w: 2.4, h: 0.25, fontSize: 10, fontFace: "Arial", color: C.textGray });
    s8.addText(prodKpis[pi].value, { x: px + 0.15, y: py + 0.3, w: 1.5, h: 0.45, fontSize: 20, fontFace: "Arial", color: C.textWhite, bold: true });
    s8.addText("Target: " + prodKpis[pi].target, { x: px + 1.5, y: py + 0.65, w: 1.1, h: 0.25, fontSize: 9, fontFace: "Arial", color: C.textGray, align: "right" });
  }
  s8.addText("Quality & Compliance", { x: 0.8, y: 3.55, w: 4, h: 0.3, fontSize: 14, fontFace: "Arial", color: C.info, bold: true });
  var qualKpis = [
    { label: "Pass Rate", value: qData.quality.passRate + "%", color: C.success },
    { label: "FDA Violations", value: qData.quality.fdaViolations.toString(), color: qData.quality.fdaViolations > 1 ? C.warning : C.success },
    { label: "Recalls", value: qData.quality.recalls.toString(), color: qData.quality.recalls > 0 ? C.danger : C.success },
    { label: "Labeling Issues", value: qData.quality.labelingIssues.toString(), color: C.warning },
    { label: "Units Inspected", value: fmtNum(qData.quality.unitsInspected), color: C.info },
    { label: "FDA Violation Rate", value: qData.quality.fdaViolationRate + "%", color: qData.quality.fdaViolationRate > 5 ? C.danger : C.warning },
  ];
  for (var qi = 0; qi < qualKpis.length; qi++) {
    var qCol = qi % 3; var qRow = Math.floor(qi / 3);
    var qx = 0.8 + qCol * 2.9; var qy = 3.95 + qRow * 0.8;
    s8.addShape(pres.shapes.RECTANGLE, { x: qx, y: qy, w: 2.7, h: 0.65, fill: { color: C.bgCard } });
    s8.addShape(pres.shapes.RECTANGLE, { x: qx, y: qy, w: 0.05, h: 0.65, fill: { color: qualKpis[qi].color } });
    s8.addText(qualKpis[qi].label, { x: qx + 0.15, y: qy + 0.02, w: 1.4, h: 0.3, fontSize: 9, fontFace: "Arial", color: C.textGray });
    s8.addText(qualKpis[qi].value, { x: qx + 1.5, y: qy + 0.02, w: 1.1, h: 0.6, fontSize: 18, fontFace: "Arial", color: C.textWhite, bold: true, align: "right", valign: "middle" });
  }

  // ─── SLIDE 9: Marketing ───
  var s9 = pres.addSlide();
  s9.background = { color: C.bgDark };
  s9.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s9.addText("MARKETING PERFORMANCE", { x: 0.8, y: 0.2, w: 6, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  s9.addText(qData.marketing.note, { x: 6.5, y: 0.2, w: 3, h: 0.5, fontSize: 10, fontFace: "Arial", color: C.warning, align: "right", italic: true });
  var mktKpis = [
    { label: "Marketing ROI", value: qData.marketing.roi + "x", color: C.primary },
    { label: "Cost per Acquisition", value: "$" + qData.marketing.cpa, color: C.info },
    { label: "Conversion Rate", value: qData.marketing.cvr + "%", color: C.success },
    { label: "Click-Through Rate", value: qData.marketing.ctr + "%", color: C.warning },
    { label: "Total Spend", value: fmt(qData.marketing.spend), color: C.purple },
    { label: "Attributed Revenue", value: fmt(qData.marketing.attributedRev), color: C.primary },
  ];
  for (var mi = 0; mi < mktKpis.length; mi++) {
    var mCol = mi % 3; var mRow = Math.floor(mi / 3);
    var mx = 0.8 + mCol * 2.9; var my = 1.0 + mRow * 1.6;
    s9.addShape(pres.shapes.RECTANGLE, { x: mx, y: my, w: 2.7, h: 1.3, fill: { color: C.bgCard }, shadow: makeShadow() });
    s9.addShape(pres.shapes.RECTANGLE, { x: mx, y: my, w: 0.06, h: 1.3, fill: { color: mktKpis[mi].color } });
    s9.addText(mktKpis[mi].label, { x: mx + 0.2, y: my + 0.1, w: 2.3, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.textGray });
    s9.addText(mktKpis[mi].value, { x: mx + 0.2, y: my + 0.45, w: 2.3, h: 0.6, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  }
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.3, w: 8.6, h: 0.9, fill: { color: C.bgCard } });
  s9.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.3, w: 0.05, h: 0.9, fill: { color: C.warning } });
  s9.addText([
    { text: qData.quarter + " Marketing Spend: ", options: { bold: true, fontSize: 12, color: C.textWhite, fontFace: "Arial" } },
    { text: "$" + qData.exec.mktSpend + "M (from executive summary).", options: { fontSize: 12, color: C.textGray, fontFace: "Arial" } },
  ], { x: 1.0, y: 4.35, w: 8.2, h: 0.8, valign: "middle" });

  // ─── SLIDE 10: ESG ───
  var s10 = pres.addSlide();
  s10.background = { color: C.bgDark };
  s10.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s10.addText("ESG & SUSTAINABILITY SCORECARD", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  var esgKpis = [
    { label: "Carbon Emissions", value: qData.esg.carbonTonnes + "t", sub: "CO2 Tonnes", color: C.danger },
    { label: "Water Usage", value: fmtNum(qData.esg.waterM3) + " m\u00B3", sub: "Cubic Meters", color: C.info },
    { label: "Renewable Energy", value: qData.esg.renewablePct + "%", sub: "of total energy", color: C.success },
    { label: "Total Waste", value: fmtNum(qData.esg.wasteKg) + " kg", sub: "Kilograms", color: C.warning },
    { label: "Eco Packaging", value: qData.esg.ecoPackagingPct + "%", sub: "Sustainable materials", color: C.primary },
    { label: "Bottles Returned", value: fmtNum(qData.esg.bottlesReturned), sub: "Units collected", color: C.accentTeal },
  ];
  for (var ei = 0; ei < esgKpis.length; ei++) {
    var eCol = ei % 3; var eRow = Math.floor(ei / 3);
    var ex = 0.8 + eCol * 2.9; var ey = 0.9 + eRow * 1.8;
    s10.addShape(pres.shapes.RECTANGLE, { x: ex, y: ey, w: 2.7, h: 1.5, fill: { color: C.bgCard }, shadow: makeShadow() });
    s10.addShape(pres.shapes.RECTANGLE, { x: ex, y: ey, w: 0.06, h: 1.5, fill: { color: esgKpis[ei].color } });
    s10.addText(esgKpis[ei].label, { x: ex + 0.2, y: ey + 0.1, w: 2.3, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.textGray });
    s10.addText(esgKpis[ei].value, { x: ex + 0.2, y: ey + 0.45, w: 2.3, h: 0.55, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
    s10.addText(esgKpis[ei].sub, { x: ex + 0.2, y: ey + 1.05, w: 2.3, h: 0.3, fontSize: 10, fontFace: "Arial", color: C.textGray, italic: true });
  }
  s10.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.6, w: 8.6, h: 0.7, fill: { color: C.bgCard } });
  s10.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.6, w: 0.05, h: 0.7, fill: { color: C.success } });
  s10.addText([
    { text: "Glass Recycled: ", options: { bold: true, fontSize: 12, color: C.success, fontFace: "Arial" } },
    { text: fmtNum(qData.esg.glassRecycled) + " units  |  Eco-packaging at " + qData.esg.ecoPackagingPct + "% adoption", options: { fontSize: 12, color: C.textWhite, fontFace: "Arial" } },
  ], { x: 1.0, y: 4.6, w: 8.2, h: 0.7, valign: "middle" });

  // ─── SLIDE 11: Key Wins & Challenges ───
  var s11 = pres.addSlide();
  s11.background = { color: C.bgDark };
  s11.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s11.addText("KEY WINS & CHALLENGES", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  // Wins
  s11.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 0.9, w: 4.3, h: 4.2, fill: { color: C.bgCard }, shadow: makeShadow() });
  s11.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 0.9, w: 4.3, h: 0.45, fill: { color: C.success } });
  s11.addText("WINS", { x: 0.7, y: 0.9, w: 4.0, h: 0.45, fontSize: 14, fontFace: "Arial", color: C.textWhite, bold: true, valign: "middle" });
  var wins = [];
  if (qData.exec.margin > qData.prevExec.margin) wins.push("Margin expansion to " + qData.exec.margin + "% (+0." + Math.round((qData.exec.margin - qData.prevExec.margin) * 10) + " bps QoQ)");
  if (qData.quality.passRate >= 99) wins.push("Quality pass rate maintained at " + qData.quality.passRate + "%");
  if (qData.production.recalls === 0) wins.push("Zero product recalls for the quarter");
  wins.push("Stockout rate at " + qData.inventory.stockoutRate + "%");
  wins.push("Production output: " + fmtNum(qData.production.unitsProduced) + " units");
  if (qData.esg.ecoPackagingPct > 50) wins.push("Eco-packaging adoption exceeded 50% at " + qData.esg.ecoPackagingPct + "%");
  var winsText = wins.map(function(w, idx) { return { text: w, options: { bullet: true, breakLine: idx < wins.length - 1, fontSize: 11, color: C.textWhite, fontFace: "Arial" } }; });
  s11.addText(winsText, { x: 0.7, y: 1.5, w: 3.9, h: 3.4, valign: "top", paraSpaceAfter: 10 });
  // Challenges
  s11.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 0.9, w: 4.3, h: 4.2, fill: { color: C.bgCard }, shadow: makeShadow() });
  s11.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: 0.9, w: 4.3, h: 0.45, fill: { color: C.danger } });
  s11.addText("CHALLENGES", { x: 5.4, y: 0.9, w: 4.0, h: 0.45, fontSize: 14, fontFace: "Arial", color: C.textWhite, bold: true, valign: "middle" });
  var challenges = [];
  if (qData.production.utilization < 55) challenges.push("Capacity utilization below target at " + qData.production.utilization + "% (target: 60%)");
  if (qData.supplyChain.lateDeliveryPct > 10) challenges.push("Late delivery rate spiked to " + qData.supplyChain.lateDeliveryPct + "%");
  if (qData.quality.fdaViolationRate > 5) challenges.push("FDA violation rate at " + qData.quality.fdaViolationRate + "%");
  if (qData.inventory.expired > 20000) challenges.push("Expired inventory: " + fmtNum(qData.inventory.expired) + " units");
  if (qData.production.downtime > 80) challenges.push("Production downtime at " + qData.production.downtime + " hrs (target: <80)");
  if (qData.esg.renewablePct < 35) challenges.push("Renewable energy at " + qData.esg.renewablePct + "% - below 35% target");
  if (qData.production.costPerUnit > 0.35) challenges.push("Cost per unit at $" + qData.production.costPerUnit + " vs $0.35 target");
  var challengesText = challenges.map(function(ch, idx) { return { text: ch, options: { bullet: true, breakLine: idx < challenges.length - 1, fontSize: 11, color: C.textWhite, fontFace: "Arial" } }; });
  s11.addText(challengesText, { x: 5.4, y: 1.5, w: 3.9, h: 3.4, valign: "top", paraSpaceAfter: 10 });

  // ─── SLIDE 12: Strategic Recommendations ───
  var s12 = pres.addSlide();
  s12.background = { color: C.bgDark };
  s12.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s12.addText("STRATEGIC RECOMMENDATIONS", { x: 0.8, y: 0.2, w: 8.4, h: 0.5, fontSize: 22, fontFace: "Arial", color: C.textWhite, bold: true });
  var recs = [];
  if (qData.production.utilization < 55) recs.push({ title: "Optimize Capacity Utilization", desc: "Current " + qData.production.utilization + "% utilization indicates idle capacity. Target 60%+.", priority: "HIGH", color: C.danger });
  if (qData.inventory.stockoutRate > 5) recs.push({ title: "Strengthen Inventory Management", desc: "Reduce stockout rate from " + qData.inventory.stockoutRate + "% through improved demand forecasting.", priority: "HIGH", color: C.danger });
  recs.push({ title: "Accelerate Sustainability Goals", desc: "Renewable energy at " + qData.esg.renewablePct + "% needs acceleration to reach 35% target.", priority: "MEDIUM", color: C.warning });
  if (qData.supplyChain.lateDeliveryPct > 10) recs.push({ title: "Supplier Performance Review", desc: "Late delivery rate of " + qData.supplyChain.lateDeliveryPct + "% requires supplier scorecard review.", priority: "HIGH", color: C.danger });
  recs.push({ title: "Expand Digital Channels", desc: "Online and DTC channels show growth potential. Invest in e-commerce optimization.", priority: "MEDIUM", color: C.warning });
  for (var ri = 0; ri < Math.min(recs.length, 5); ri++) {
    var ry = 0.85 + ri * 0.92;
    s12.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: ry, w: 8.6, h: 0.8, fill: { color: C.bgCard }, shadow: makeShadow() });
    s12.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: ry, w: 0.06, h: 0.8, fill: { color: recs[ri].color } });
    s12.addShape(pres.shapes.RECTANGLE, { x: 8.2, y: ry + 0.15, w: 1.0, h: 0.3, fill: { color: recs[ri].color } });
    s12.addText(recs[ri].priority, { x: 8.2, y: ry + 0.15, w: 1.0, h: 0.3, fontSize: 9, fontFace: "Arial", color: C.textWhite, bold: true, align: "center", valign: "middle" });
    s12.addText(recs[ri].title, { x: 1.0, y: ry + 0.05, w: 6.8, h: 0.3, fontSize: 13, fontFace: "Arial", color: C.textWhite, bold: true });
    s12.addText(recs[ri].desc, { x: 1.0, y: ry + 0.38, w: 6.8, h: 0.35, fontSize: 10, fontFace: "Arial", color: C.textGray });
  }

  // ─── SLIDE 13: Thank You ───
  var s13 = pres.addSlide();
  s13.background = { color: C.bgDark };
  s13.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: 10, h: 0.06, fill: { color: C.primary } });
  s13.addShape(pres.shapes.RECTANGLE, { x: 0, y: 5.565, w: 10, h: 0.06, fill: { color: C.primary } });
  s13.addText("THANK YOU", { x: 0.8, y: 1.5, w: 8.4, h: 0.8, fontSize: 36, fontFace: "Arial", color: C.textWhite, bold: true, align: "center", charSpacing: 6 });
  s13.addText(qData.quarter + " " + qData.year + " Quarterly Business Review", { x: 0.8, y: 2.4, w: 8.4, h: 0.5, fontSize: 16, fontFace: "Arial", color: C.primary, align: "center" });
  s13.addShape(pres.shapes.RECTANGLE, { x: 4.0, y: 3.1, w: 2.0, h: 0.04, fill: { color: C.primary } });
  s13.addText("Questions & Discussion", { x: 0.8, y: 3.4, w: 8.4, h: 0.5, fontSize: 18, fontFace: "Arial", color: C.textGray, align: "center" });
  s13.addText((config.division || config.company || "") + "  |  Confidential", { x: 0.8, y: 4.8, w: 8.4, h: 0.3, fontSize: 11, fontFace: "Arial", color: C.textGray, align: "center", italic: true });

  return pres.writeFile({ fileName: outputPath });
}

// ── Determine quarters to generate ──
var quarters = [];
if (cliQuarter && cliYear) {
  quarters.push({ year: cliYear, quarter: cliQuarter });
} else {
  // Find last 2 quarters from executive summary
  var es = config.data.executiveSummary || [];
  var sorted = es.slice().sort(function(a, b) { return (b.year * 10 + b.quarter) - (a.year * 10 + a.quarter); });
  for (var q = 0; q < Math.min(sorted.length, 2); q++) {
    quarters.push({ year: sorted[q].year, quarter: sorted[q].quarter });
  }
  quarters.reverse(); // chronological order
}

// ── Generate ──
async function main() {
  for (var g = 0; g < quarters.length; g++) {
    var yr = quarters[g].year;
    var qt = quarters[g].quarter;
    var qData = buildQData(config.data, yr, qt);
    var outFile = path.join(outputDir, "QBR_Q" + qt + "_" + yr + ".pptx");
    await buildQBR(qData, outFile);
    console.log("Generated: QBR_Q" + qt + "_" + yr + ".pptx");
  }
}

main().catch(function(e) { console.error(e); process.exit(1); });
