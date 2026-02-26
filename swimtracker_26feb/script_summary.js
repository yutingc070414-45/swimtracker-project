document.addEventListener("DOMContentLoaded", function () {
  const fileInput = document.getElementById("csvFile");
  const dateSelect = document.getElementById("dateSelect");
  const container = document.querySelector(".summary-container");

  let csvData = [];

  // Default data
  csvData = [{
    "Date": "2023-02-17",
    "Stroke": "Butterfly",
    "Distance (km)": "3.93",
    "Time (min)": "72",
    "Calories": "630.0",
    "Avg Heart Rate": "140"
  }];
  dateSelect.innerHTML = '<option value="2023-02-17" selected>2023-02-17</option>';
  renderSummary("2023-02-17");

  function renderSummary(selectedDate) {
    const filtered = csvData.filter(row => row["Date"] === selectedDate);
    container.innerHTML = "";

    const headerBox = document.createElement("div");
    headerBox.className = "summary-box";
    headerBox.innerHTML = `<h2>Today: ${selectedDate}</h2>`;
    container.appendChild(headerBox);

    filtered.forEach(entry => {
      const stroke = entry["Stroke"];
      const distance = entry["Distance (km)"];
      const time = entry["Time (min)"];
      const calories = entry["Calories"];
      const heartRate = entry["Avg Heart Rate"];

      const box = document.createElement("div");
      box.className = "summary-box";
      box.innerHTML = `
        <h2>${stroke}</h2>
        <p>Distance: ${parseFloat(distance).toFixed(2)} km</p>
        <p>Time: ${time} min</p>
        <p>Calories: ${calories} kcal</p>
        <p>Avg Heart Rate: ${heartRate} bpm</p>
      `;
      container.appendChild(box);
    });
  }

  fileInput.addEventListener("change", function (e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const text = event.target.result;
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",");
      const rows = lines.slice(1).map(line => line.split(","));

      csvData = rows.map(row => {
        const entry = {};
        headers.forEach((header, i) => {
          entry[header.trim()] = row[i]?.trim();
        });
        return entry;
      });

      const uniqueDates = [...new Set(csvData.map(row => row["Date"]))];
      dateSelect.innerHTML = '<option value="">-- Select a date --</option>';
      uniqueDates.forEach(date => {
        const option = document.createElement("option");
        option.value = date;
        option.textContent = date;
        dateSelect.appendChild(option);
      });
    };
    reader.readAsText(file);
  });

  dateSelect.addEventListener("change", function () {
    renderSummary(this.value);
  });
});