var chartData = [];
var svg;

const barChart = d3.select("#chartContainer");

const chartWidth = 600;
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

    // Create the bar chart
    createBarChart(top20);
    addButton(data);
    deleteButton(data);

  }).catch((error) => {
    console.log(error);
  });

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
}

function deleteButton() {
  const countryInput = document.getElementById("countryInput").value;
  const index = chartData.findIndex(d => d.country.toLowerCase() === countryInput.toLowerCase());

  if (index === -1) {
    alert("Country does not exist in the chart!");
    return;
  }

  chartData.splice(index, 1);
  updateChart(chartData);
}

function updateChart() {
  // Remove existing SVG chart
  barChart.select("svg").remove();
  
  createBarChart(chartData);
  
  // const chartWidth = 700;
  // const chartHeight = 500;

  // const margin = { top: 50, right: 20, bottom: 60, left: 100 };
  // const width = chartWidth - margin.left - margin.right;
  // const height = chartHeight - margin.top - margin.bottom;
  

  // // Select the SVG element
  // svg = barChart.append("svg")
  //   .attr("width", chartWidth)
  //   .attr("height", chartHeight)
  //   .append("g")
  //   .attr("transform", `translate(${margin.left}, ${margin.top})`);


  // // Define color scale
  // const colorScale = d3.scaleLinear()
  //   .domain([0, d3.max(data, d => d.population)])
  //   .range(["#cce599", "#004045"]);

  // const updatedXScale = d3.scaleBand()
  //   .domain(data.map(d => d.country))
  //   .range([0, width])
  //   .padding(0.1);

  // const updatedYScale = d3.scaleLinear()
  //   .domain([20, d3.max(data, d => d.population)])
  //   .range([height, 0]);

  // svg.select("g")
  //   .attr("transform", `translate(0, ${height})`)
  //   .call(d3.axisBottom(updatedXScale))
  //   .style("fill", "white")
  //   .selectAll("text")
  //   .attr("transform", "rotate(-45)")
  //   .style("text-anchor", "end")
  //   .style("fill", "white");

  // svg.select("g")
  //   .call(d3.axisLeft(updatedYScale))
  //   .style("fill", "white")
  //   .style("stroke", "white");

  // const bars = svg.selectAll(".bar")
  //   .data(data, d => d.country);

  // bars.exit()
  //   .transition()
  //   .duration(500)
  //   .attr("height", 0)
  //   .remove();

  // const tooltip = d3.select("body").append("div")
  //   .attr("class", "tooltip")
  //   .style("opacity", 0);

  // bars.enter().append("rect")
  //   .attr("class", "bar")
  //   .attr("x", d => updatedXScale(d.country))
  //   .attr("width", updatedXScale.bandwidth())
  //   .attr("y", height)
  //   .attr("height", 0)
  //   .merge(bars)
  //   .transition()
  //   .duration(500)
  //   .attr("x", d => updatedXScale(d.country))
  //   .attr("width", updatedXScale.bandwidth())
  //   .attr("y", d => updatedYScale(d.population))
  //   .attr("height", d => height - updatedYScale(d.population))
  //   .style("fill", d => colorScale(d.population))
  //   .on("mouseover", (event, d) => {
  //     d3.select(event.currentTarget)
  //       .style("fill", d => colorScale2(d.population));
  //     // Show tooltip on mouseover
  //     tooltip
  //       .style("opacity", 1)
  //       .html(`Country: ${d.country}<br>Population: ${d.population}`)
  //       .style("left", event.pageX + "px")
  //       .style("top", event.pageY + "px");
  //   })
  //   .on("mouseout", (event, d) => {
  //     d3.select(event.currentTarget)
  //       .style("fill", d => colorScale(d.population));
  //     // Hide tooltip on mouseout
  //     tooltip.style("opacity", 0);
  //   });
}