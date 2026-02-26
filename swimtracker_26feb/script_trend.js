let heartChart, distanceChart, styleChart;
let globalParsedData = [];

document.addEventListener("DOMContentLoaded", () => {
  const monthSelect = document.getElementById("month-select");
  const fileInput = document.getElementById("csvFileInput");


  fetch("data/swim_data.csv")
    .then(response => response.text())
    .then(data => {
      globalParsedData = parseCSV(data);
      updateMonthSelect(globalParsedData);
    });

  
  monthSelect.addEventListener("change", () => {
    const currentMonth = monthSelect.value;
    renderChartsForMonth(currentMonth, globalParsedData);
  });

  
  fileInput.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      const text = e.target.result;
      globalParsedData = parseCSV(text);
      updateMonthSelect(globalParsedData);
    };
    reader.readAsText(file);
  });
});


function parseCSV(text) {
  const rows = text.trim().split("\n").slice(1); // skip header
  return rows.map(row => {
    const parts = row.split(",");
    if (parts.length < 6) return null;

    // Normalize date: 2025/6/1 → 2025-06-01
    let rawDate = parts[0].trim();
    if (rawDate.includes("/")) {
      let [year, month, day] = rawDate.split("/");
      if (month.length === 1) month = "0" + month;
      if (day.length === 1) day = "0" + day;
      rawDate = `${year}-${month}-${day}`;
    }

    return {
      date: rawDate,
      stroke: parts[1].trim(),
      distance: parseFloat(parts[2]),
      heartRate: parseInt(parts[5])
    };
  }).filter(d => d !== null);
}


function updateMonthSelect(data) {
  const monthSet = new Set();
  data.forEach(d => {
    if (d.date && d.date.includes("-")) {
      const [year, month] = d.date.split("-");
      if (year && month) {
        monthSet.add(`${year}-${month}`);
      }
    }
  });

  const sortedMonths = Array.from(monthSet).sort();
  const monthSelect = document.getElementById("month-select");
  monthSelect.innerHTML = "";

  sortedMonths.forEach(month => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = formatMonthTitle(month);
    monthSelect.appendChild(option);
  });

  
  const defaultMonth = "2023-02";
  if (sortedMonths.includes(defaultMonth)) {
    monthSelect.value = defaultMonth;
    renderChartsForMonth(defaultMonth, data);
  } else if (sortedMonths.length > 0) {
    const latestMonth = sortedMonths[sortedMonths.length - 1];
    monthSelect.value = latestMonth;
    renderChartsForMonth(latestMonth, data);
  }
}


function renderChartsForMonth(month, data) {
  const filtered = data.filter(d => d.date.startsWith(month));
  document.querySelectorAll(".chart-date").forEach(el => {
    el.textContent = formatMonthTitle(month);
  });

  const dates = filtered.map(d => d.date);
  const heartRates = filtered.map(d => d.heartRate);
  const distances = filtered.map(d => d.distance);

  // Heart Chart
  if (heartChart) heartChart.destroy();
  heartChart = new Chart(document.getElementById("chart-heart"), {
    type: "line",
    data: {
      labels: dates,
      datasets: [{
        label: "Avg Heart Rate",
        data: heartRates,
        borderWidth: 2,
        fill: false
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "white" } }
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });

  // Distance Chart
  if (distanceChart) distanceChart.destroy();
  distanceChart = new Chart(document.getElementById("chart-distance"), {
    type: "bar",
    data: {
      labels: dates,
      datasets: [{
        label: "Distance (km)",
        data: distances,
        backgroundColor: "rgba(75, 192, 192, 0.6)"
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "white" } }
      },
      scales: {
        x: { ticks: { color: "white" } },
        y: { ticks: { color: "white" } }
      }
    }
  });

  // Swim Style Pie Chart
  const styleCount = {};
  filtered.forEach(d => {
    styleCount[d.stroke] = (styleCount[d.stroke] || 0) + 1;
  });
  if (styleChart) styleChart.destroy();
  styleChart = new Chart(document.getElementById("chart-style"), {
    type: "pie",
    data: {
      labels: Object.keys(styleCount),
      datasets: [{
        data: Object.values(styleCount),
        backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#9CCC65"]
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "white" } }
      }
    }
  });
}


function formatMonthTitle(month) {
  const [year, mon] = month.split("-");
  const names = ["January", "February", "March", "April", "May", "June",
                 "July", "August", "September", "October", "November", "December"];
  return `${names[parseInt(mon) - 1]} ${year}`;
}