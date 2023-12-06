let chartData = [];

function rowConvertor(row) {
    return {
      country: row['Country/Territory'],
      population: +row['2022 Population']
    };
  }
  
d3.csv("../asset/data/world_population.csv", rowConvertor).then(data => {
    // Sort the data by population in descending order
    data.sort((a, b) => b.population - a.population);

    // Filter only the top 20 countries by population
    const top20 = data.slice(2,20);

    // Create the bar chart
    createBarChart(top20);
  }).catch(error => {
    console.error("Error loading data:", error);
  });


function createBarChart(data) {
    chartData = data;

    const barChart = d3.select("#chartContainer");
  
    const chartWidth = 700;
    const chartHeight = 500;

    const margin = { top: 50, right: 20, bottom: 60, left: 100 };
    const width = chartWidth - margin.left - margin.right;
    const height = chartHeight - margin.top - margin.bottom;
  
    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.population)])
        .range(["#cce599", "#004045"]);

    const svg = barChart.append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Add name of chart
    svg.append("text")
      .attr("class", "Chart-tittle")
      .attr("x", width/2 - 70)
      .attr("y", -30)
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Top Countries by Population");


    const xScale = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, width])
      .padding(0.1);
  
    const yScale = d3.scaleLinear()
      .domain([20, d3.max(data, d => d.population)])
      .range([height, 0]);
  
    svg.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(xScale))
      .style("fill", "white")
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "white");
  
    svg.append("g")
      .call(d3.axisLeft(yScale))
      .style("fill", "white")
      .style("stroke", "white");
  
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

    // Draw vertical bars with colorScale
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.country))
      .attr("width", xScale.bandwidth())
      .attr("y", d => yScale(d.population))
      .attr("height", d => height - yScale(d.population))
      .style("fill", d => colorScale(d.population))
      .on("mouseover", (event, d) => {
        // Show tooltip on mouseover
        tooltip
          .style("opacity", 1)
          .html(`Country: ${d.country}<br>Population: ${d.population}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", () => {
        // Hide tooltip on mouseout
        tooltip.style("opacity", 0);
      });

    
} // end function createBarChart

function addButton() {
  const countryInput = document.getElementById("countryInput").value;
  const countryData = chartData.find(d => d.country === countryInput);

  if (countryData) {
    // Add the country to the chart
    chartData.push(countryData);
    updateChart();
  } else {
    console.log("Country not found.");
  }
}

function deleteButton() {
  const countryInput = document.getElementById("countryInput").value;
  const countryIndex = chartData.findIndex(d => d.country === countryInput);

  if (countryIndex !== -1) {
    // Delete the country from the chart
    chartData.splice(countryIndex, 1);
    updateChart();
  } else {
    console.log("Country not found.");
  }
}

function updateChart() {
  const svg = d3.select("svg");

  const xScale = d3.scaleBand()
    .domain(chartData.map(d => d.country))
    .range([0, width])
    .padding(0.1);

  const yScale = d3.scaleLinear()
    .domain([20, d3.max(chartData, d => d.population)])
    .range([height,0]);

  const colorScale = d3.scaleLinear()
    .domain([0, d3.max(chartData, d => d.population)])
    .range(["#cce599", "#004045"]);

  svg.selectAll(".bar")
    .data(chartData)
    .join(
      enter => enter.append("rect")
        .attr("class", "bar")
        .attr("x", d => xScale(d.country))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.population))
        .attr("height", d => height - yScale(d.population))
        .style("fill", d => colorScale(d.population)),
      update => update
        .attr("x", d => xScale(d.country))
        .attr("width", xScale.bandwidth())
        .attr("y", d => yScale(d.population))
        .attr("height", d => height - yScale(d.population))
        .style("fill", d => colorScale(d.population)),
      exit => exit.remove()
    );
}