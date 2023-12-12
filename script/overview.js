var chartData = [];
var svg;

const barChart = d3.select("#barChart");
const chartWidth = 700;
const chartHeight = 400;

const margin = { top: 50, right: 20, bottom: 60, left: 100 };
const width = chartWidth - margin.left - margin.right;
const height = chartHeight - margin.top - margin.bottom;
const tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);



function rowConvertor(row) {
    return {
      country: row['Country/Territory'],
      population: +row['2022 Population'],
      continent: row['Continent']
    };
  }

d3.csv(
  "../asset/data/world_population.csv", 
  rowConvertor
  ).then(data => {
    // Sort the data by population in descending order
    data.sort((a, b) => b.population - a.population);

    // Filter only the top 20 countries by population
    const top20 = data.slice(0,20);

    const percentageData = calculatePopulationPercentage(data);

    // Create the bar chart
    createBarChart(top20);
    addButton(data);
    deleteButton(data);

    createPieChart(percentageData);

  }).catch((error) => {
    console.log(error);
  });

/* ************* for the bar chart part ************* */
function createBarChart(data) {
    chartData = data;

    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.population)])
        .range(["#cce599", "#004045"]);

    const colorScale2 = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.population)])
        .range(["#f7dfb5", "#d12421"]);

    svg = barChart.append("svg")
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
    // Add name of chart
    svg.append("text")
      .attr("class", "Chart-tittle")
      .attr("x", width/2 - 150)
      .attr("y", -30)
      .style("font-weight", "bold")
      .style("fill", "white")
      .text("Top Countries by Population in 2022");


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
        d3.select(event.currentTarget)
          .style("fill", d => colorScale2(d.population));
        // Show tooltip on mouseover
        tooltip
          .style("opacity", 1)
          .html(`Country: ${d.country}<br>Population: ${d.population}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget)
          .style("fill", d => colorScale(d.population));
        // Hide tooltip on mouseout
        tooltip.style("opacity", 0);
      });

    
} // end function createBarChart

function addButton() {
  const countryInput = document.getElementById("countryInput").value;
  const existingCountry = chartData.find(d => d.country.toLowerCase() === countryInput.toLowerCase());

  if (existingCountry) {
    alert("Country already exists in the chart!");
    return;
  } else {
    const newData = {
      country: countryInput,
      population: countryInput.population
    };

    chartData.push(newData);
    updateChart(chartData);
  }
} // end addButton

function deleteButton() {
  const countryInput = document.getElementById("countryInput").value;
  const index = chartData.findIndex(d => d.country.toLowerCase() === countryInput.toLowerCase());

  if (index === -1) {
    alert("Country does not exist in the chart!");
    return;
  }

  chartData.splice(index, 1);
  updateChart(chartData);
} // end deleteButton

function updateChart() {
  // Remove existing SVG chart
  barChart.select("svg").remove();
  
  chartData.sort((a, b) => b.population - a.population)
  createBarChart(chartData);
} // end function updateChart
/* ************* end of bar chart part ************* */

/* ************* for the pie chart part ************* */

function calculatePopulationPercentage(data) {
  const continentPopulation = d3.rollups(data, v => d3.sum(v, d => d.population), d => d.continent);
  const totalPopulation = d3.sum(data, d => d.population);

  const percentageData = continentPopulation.map(([continent, population]) => ({
    continent: continent,
    percentage: (population / totalPopulation) * 100
  }));

  return percentageData;
}

function createPieChart(data) {
  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);
  const radius = Math.min(width, height) / 2;

  const arc = d3.arc()
    .innerRadius(60)
    .outerRadius(radius - 2);

  const pie = d3.pie()
    .value(d => d.percentage);

  const pieChart = d3.select("#pieChart")
    .append("svg")
    .attr("width", chartWidth)
    .attr("height", chartHeight)
    .append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight / 2})`);

  pieChart.append("text")
    .attr("class", "Chart-tittle")
    .attr("x", - 150)
    .attr("y", -radius - 30)
    .style("font-weight", "bold")
    .style("fill", "white")
    .text("Population Percentage by Continent in 2022");

  const arcs = pieChart.selectAll("arc")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "arc")
    .attr("stroke", "black")
    //.attr("stroke-width", 1.5);

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => colorScale(i));

  const legend = pieChart.selectAll(".legend")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", (d, i) => `translate(${radius + 20}, ${-radius + i * 20})`);
  
  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", (d, i) => colorScale(i));

  legend.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .style("font-size", "14px")
    .style("fill", "white")
    .text(d => `${d.continent}: ${d.percentage.toFixed(2)}%`);
}
// var groupedData = d3.group(data, d => d["Continent"]);
// var totalPopulation = d3.sum(data, d => parseInt(d["2022 Population"]));

// var continentPopulations = [];
// groupedData.forEach(function(continentData, continent) {
//   //var population = d3.sum(continentData, d => parseInt(d['2022 Popultion']));
//   var percentage = (population / totalPopulation) * 100;
//   continentPopulations.push({ continent: continent, percentage: percentage });
// });



// function createPieChart(){
//   const pieChart = d3.select("#chartContainer");

//   const pieWidth = 400;
//   const pieHeight = 300;
//   const pieRadius = Math.min(pieWidth, pieHeight) / 2;

//   const pieSvg = pieChart.append("svg")
//   .attr("width", pieWidth)
//   .attr("height", pieHeight)
//   .append("g")
//   .attr("transform", "translate(" + pieWidth / 2 + "," + pieHeight / 2 + ")")
//   .attr("stroke", "black")
//   .attr("stroke-width", 1);

//   const pieColor = d3.scaleOrdinal()
//     .domain(continentPopulations.map(function(d) { return d.continent; }))
//     .range(d3.schemeCategory10);

//   const pie = d3.pie()
//     .value(function(d) { return d.percentage; });

//   const piePath = d3.arc()
//     .outerRadius(pieRadius - 2)
//     .innerRadius(60);

//   const pieArc = pieSvg.selectAll("arc")
//     .data(pie(continentPopulations))
//     .enter().append("g")
//     .attr("class", "arc");

//   pieArc.append("path")
//     .attr("d", piePath)
//     .attr("fill", function(d) { return pieColor(d.data.continent); });

//   // Add labels to the pie chart
//   // const pieLabels = pieSvg.selectAll("text")
//   //   .data(pie(continentPopulations))
//   //   .enter().append("text")
//   //   .attr("transform", function(d) { return "translate(" + piePath.centroid(d) + ")"; })
//   //   .attr("dy", "0.35em")
//   //   .text(function(d) { return d.data.continent + " (" + d.data.percentage.toFixed(2) + "%)"; })
//   //   .attr("text-anchor", "middle")
//   //   .attr("fill", "white");

//   // Add legend to the pie chart
//   const legend = pieSvg.selectAll(".legend")
//     .data(pie(continentPopulations))
//     .enter().append("g")
//     .attr("class", "legend")
//     .attr("transform", (d, i) => "translate(180," + (i * 25 - 80) + ")");

//   legend.append("rect")
//     .attr("x", pieWidth - 18)
//     .attr("width", 18)
//     .attr("height", 18)
//     .attr("fill", (d, i) => pieColor(i));

//   legend.append("text")
//     .attr("x", pieWidth - 24)
//     .attr("y", 9)
//     .attr("dy", "0.35em")
//     .style("text-anchor", "end")
//     .text((d, i) => `${continentPopulations[i].continent} (${continentPopulations[i].percentage.toFixed(2)}%)`);
// }
/* ************* end of pie chart part ************* */