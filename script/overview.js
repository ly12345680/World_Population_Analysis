var chartData = [];
var svg;

const barChart = d3.select("#barChart");
const chartWidth = 750;
const chartHeight = 500;

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
      .attr("transform",  `translate(0, ${height})`)
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

    // Append a text element for the x-axis name
    svg.append("text")
      .attr("class", "axis-label")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5 )
      .attr("text-anchor", "middle")
      .text("Country")
      .style("fill", "white");

    // Append a text element for the y-axis name
    svg.append("text")
      .attr("class", "axis-label")
      .attr("y", - margin.left +13 )
      .attr("x", - height / 2)
      .attr("text-anchor", "middle")
      .attr("transform", "rotate(-90)")
      .text("Population")
      .style("fill", "white");

      // Draw vertical bars with colorScale
    svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d.country))
      .attr("width", xScale.bandwidth())
      .attr("y", yScale(20))
      .attr("height", 0)
      .style("fill", d => colorScale(d.population))
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget)
          .style("fill", d => colorScale2(d.population));

          const formattedPopulation = d.population.toLocaleString();

        // Show tooltip on mouseover
        tooltip
          .style("opacity", 1)
          .html(`Country: ${d.country}<br>Population: ${formattedPopulation}`)
          .style("left", event.pageX + "px")
          .style("top", event.pageY + "px");
      })
      .on("mouseout", (event, d) => {
        d3.select(event.currentTarget)
          .style("fill", d => colorScale(d.population));
        // Hide tooltip on mouseout
        tooltip.style("opacity", 0);
      })
      .transition() // Add transition animation
      .duration(2000) // Set the duration of the animation (in milliseconds)
      .attr("y", d => yScale(d.population)) // Animate the bars to their final height
      .attr("height", d => height - yScale(d.population)); // Animate the bars to their final height;

    
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
    .attr("stroke", "white")
    //.attr("stroke-width", 1.5);

  arcs.append("path")
    .attr("d", arc)
    .attr("fill", (d, i) => colorScale(d.data.continent))
    .transition() // animation
    .duration(2000) // time for animation (in milliseconds)
    .attrTween("d", function (d) {
      const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
      return function (t) {
        return arc(interpolate(t));
      };
    });

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
    .attr("fill", (d, i) => colorScale(d.continent));

  legend.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .style("font-size", "14px")
    .style("fill", "white")
    .text(d => `${d.continent}: ${d.percentage.toFixed(2)}%`);
}
/* ************* end of pie chart part ************* */

/* ************* for the bar chart part ************* */
function rowConvertor2(row) {
  return {
    country: row['Country/Territory'],
    population: +row['Population'],
    continent: row['Continent'],
    year: row['Year']
  };
}
d3.csv(
  "../asset/data/map/new_dataset.csv", 
  rowConvertor2
  ).then(data2 => {
    const groupedData = d3.group(data2, d => d.continent, d => d.year);

    const populationByContinent = new Map();

    groupedData.forEach((continentData, continent) => {
      const populationByYear = new Map();

      continentData.forEach((yearData, year) => {
        const totalPopulation = d3.sum(yearData, d => d.population);
        populationByYear.set(year, totalPopulation);
      });

      populationByContinent.set(continent, populationByYear);
    });

    populationByContinent.forEach((populationByYear, continent) => {
      console.log(`Continent: ${continent}`);

      populationByYear.forEach((population, year) => {
        console.log(`Year:${year}, Population:${population}`);
      });
    })

    createLineChart(populationByContinent);
  }).catch((error) => {
    console.log(error);
  });

function createLineChart(populationByContinent) {

  const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

  const svg = d3.select("#lineChart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left + 50}, ${margin.top})`);

  // Extract unique years from the populationByContinent data
  const years = Array.from(
    new Set(
      Array.from(populationByContinent.values()).flatMap((map) =>
        Array.from(map.keys())
      )
    )
  );

  // Scales for x and y
  const xScale = d3.scalePoint()
    .domain(years)
    .range([width, 0])
    .padding(0);

  const yScale = d3.scaleLinear()
    .domain([
      0,
      d3.max(
        Array.from(populationByContinent.values()).flatMap((map) =>
          Array.from(map.values())
        )
      ),
    ])
    .range([height, 0]);

  // Define the line
  const line = d3.line()
    .x((d) => xScale(d.year))
    .y((d) => yScale(d.population));

  // Append the chart name
  svg.append("text")
    .attr("class", "chart-title")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .text("Population by Continent 1970 - 2022")
    .style("font-weight", "bold")
    .style("fill", "white");

    // Append a text element for the x-axis name
  svg.append("text")
    .attr("class", "axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .text("Year")
    .style("fill", "white");

  // Append a text element for the y-axis name
  svg.append("text")
    .attr("class", "axis-label")
    .attr("y", - margin.left + 10)
    .attr("x", - height / 2)
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Population")
    .style("fill", "white");

  // Create a tooltip element
  // const tooltip = d3
  //   .select("#lineChart")
  //   .append("div")
  //   .attr("class", "tooltip")
  //   .style("opacity", 0);

  populationByContinent.forEach((populationByYear, continent) => {
    // Convert the populationByYear map to an array of objects
    const data = Array.from(populationByYear, ([year, population]) => ({
      year,
      population,
    }));

    // Append a path element for the line chart
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", colorScale(continent))
      .attr("stroke-width", 3)
      .attr("d", line)
      .on("mouseover", (event, d) => {
        d3.select(event.currentTarget).attr("stroke-width", 5); 
      tooltip
        .transition()
        .duration(200)
        .style("opacity", 0.9);
      tooltip
        .html(
          `<strong>${continent}</strong><br/>Year: ${d.year}<br/>Population: ${d.population}`
        )
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).attr("stroke-width", 3); // Reset stroke width on mouseout
      tooltip.transition().duration(500).style("opacity", 0);
    });
  });

  // Add x-axis và y-axis
  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(xScale))
    .attr("fill", "white")
    .selectAll("text")
    .style("text-anchor", "middle")
    .style("fill", "#fff");

  svg.append("g").call(d3.axisLeft(yScale)).attr("fill", "white")
    .selectAll("text")
    .style("text-anchor", "end")
    .style("fill", "#fff");
   
}

/* ************* end of line chart part ************* */