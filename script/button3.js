async function fetchData(url) {
    const response = await fetch(url);
    const data = await response.text();
    return data;
  }
  
  function processData(data) {
    const rows = data.split('\n').slice(1);
    const years = [];
    const populations = [];
    const temperatures = [];
  
    rows.forEach(row => {
      const values = row.split(',');
      const year = values[0];
      const population = parseFloat(values[1]);
      const temperature = parseFloat(values[2]);
  
      years.push(year);
      populations.push(population);
      temperatures.push(temperature);
    });
  
    return { years, populations, temperatures };
  }
  
  async function createCharts() {
    const populationData = await fetchData('Global_annual_population.csv');
    const temperatureData = await fetchData('Global_annual_mean_temp.csv');
  
    const { years, populations, temperatures } = processData(populationData);
  
    const ctx = document.getElementById('chart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: years,
        datasets: [{
          label: 'Population',
          data: populations,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  
    const temperatureCtx = document.getElementById('temperature-chart').getContext('2d');
    new Chart(temperatureCtx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [{
          label: 'Average Temperature',
          data: temperatures,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 2,
          fill: false
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }
  
  document.addEventListener('DOMContentLoaded', createCharts);