
const children = [];
const usageLogs = JSON.parse(localStorage.getItem('usageLogs')) || [];
const appLogs = JSON.parse(localStorage.getItem('appLogs')) || {};

function addChild() {
  const name = document.getElementById('childNameInput').value;
  if (name && children.length < 5) {
    children.push(name);
    document.getElementById('childNameInput').value = '';
    updateChildSelectors();
    displayChildren();
  }
}

function updateChildSelectors() {
  const selects = [document.getElementById('childSelect'), document.getElementById('appChildSelect')];
  selects.forEach(select => {
    select.innerHTML = '';
    children.forEach(name => {
      const option = document.createElement('option');
      option.value = name;
      option.textContent = name;
      select.appendChild(option);
    });
  });
}

function displayChildren() {
  const summary = document.getElementById('childrenSummary');
  summary.innerHTML = '<strong>Children being tracked:</strong><br>' + children.join(', ');
}

function logUsage() {
  const child = document.getElementById('childSelect').value;
  const device = document.getElementById('deviceSelect').value;
  const usage = document.getElementById('usageSelect').value;
  const duration = document.getElementById('durationInput').value;
  const date = document.getElementById('dateInput').value;
  if (child && duration && date) {
    const log = { child, device, usage, duration, date };
    usageLogs.push(log);
    localStorage.setItem('usageLogs', JSON.stringify(usageLogs));
    updateTrackerTable();
    updateChart();
  }
}

function updateTrackerTable() {
  const tbody = document.getElementById('trackerBody');
  tbody.innerHTML = '';
  usageLogs.forEach(log => {
    const row = `<tr><td>${log.child}</td><td>${log.device}</td><td>${log.usage}</td><td>${log.duration} min</td><td>${log.date}</td></tr>`;
    tbody.innerHTML += row;
  });
}

function updateChart() {
  const ctx = document.getElementById('usageChart').getContext('2d');
  const grouped = usageLogs.reduce((acc, log) => {
    const key = `${log.child} (${log.date})`;
    acc[key] = (acc[key] || 0) + parseInt(log.duration);
    return acc;
  }, {});

  const labels = Object.keys(grouped);
  const data = Object.values(grouped);

  if (window.usageChartInstance) window.usageChartInstance.destroy();
  window.usageChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Screen Time (min)',
        data,
        backgroundColor: '#3c84ff'
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function addApp() {
  const child = document.getElementById('appChildSelect').value;
  const app = document.getElementById('appInput').value;
  if (!appLogs[child]) appLogs[child] = [];
  if (app) {
    appLogs[child].push(app);
    document.getElementById('appInput').value = '';
    localStorage.setItem('appLogs', JSON.stringify(appLogs));
    displayApps();
  }
}

function displayApps() {
  const container = document.getElementById('appsUsed');
  container.innerHTML = '';
  for (const child in appLogs) {
    const apps = appLogs[child].join(', ');
    const div = document.createElement('div');
    div.innerHTML = `<strong>${child}:</strong> ${apps}`;
    container.appendChild(div);
  }
}

function downloadSummary() {
  let content = 'Digital Habits Summary\n\n';
  content += 'Children: ' + children.join(', ') + '\n\n';
  content += 'Usage Logs:\n';
  usageLogs.forEach(log => {
    content += `${log.child} - ${log.device} - ${log.usage} - ${log.duration} min - ${log.date}\n`;
  });
  content += '\nApps Used:\n';
  for (const child in appLogs) {
    content += `${child}: ${appLogs[child].join(', ')}\n`;
  }
  const blob = new Blob([content], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'digital_habits_summary.txt';
  a.click();
}

window.onload = () => {
  updateChildSelectors();
  displayChildren();
  updateTrackerTable();
  displayApps();
  updateChart();
};
