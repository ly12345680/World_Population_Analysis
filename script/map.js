var getName;
var width = window.innerWidth;
var height = window.innerHeight - 80;
var padding = window.innerWidth / 30;
var svgLineChart = d3
  .select("#lineChart1")
  .attr("width", width)
  .attr("height", height);
var svgMap = d3.select(".map").attr("width", width).attr("height", height);

// Select the divs
let div1 = d3.select("#map"); // Replace "#div1" with the actual selector for your div
let div2 = d3.select("#lineChart"); // Replace "#div2" with the actual selector for your div
let backBtn = d3.select("#backToMap");

// Initially hide div2
div2.style("display", "none");

// ----------------------------- Map --------------------------------
const gMap = svgMap.append("g");

const projection = d3
  .geoNaturalEarth1()
  .fitSize([width, height], { type: "Sphere" });

const pathGenerator = d3.geoPath().projection(projection);

gMap
  .append("path")
  .attr("class", "sphere")
  .attr("d", pathGenerator({ type: "Sphere" }));

// Create a zoom behavior and apply it to the SVGMap
const zoom = d3.zoom().on("zoom", () => {
  gMap.attr("transform", d3.event.transform);
});

svgMap.call(zoom);

Promise.all([
  d3.tsv("https://unpkg.com/world-atlas@1.1.4/world/110m.tsv"),
  d3.csv("../asset/data/world_population.csv"),
  d3.json("https://unpkg.com/world-atlas@1.1.4/world/110m.json"),
]).then(([tsvData, csvData, topoJSONdata]) => {
  const countryName = tsvData.reduce((accumulator, d) => {
    accumulator[d.iso_n3] = d.name;
    return accumulator;
  }, {});
  console.log(topoJSONdata);

  const countries = topojson.feature(
    topoJSONdata,
    topoJSONdata.objects.countries
  );
  console.log(countries);
  countries.features.forEach((feature) => {
    const countryData = csvData.find(
      (d) => d["Country/Territory"] === countryName[feature.id]
    );
    feature.properties.growthRate = countryData
      ? +countryData["Growth Rate"]
      : null;
  });
  // console.log(countries);

  // Create a color scale
  const maxGrowthRate = d3.extent(
    countries.features,
    (d) => d.properties.growthRate
  );
  console.log(maxGrowthRate);
  const colorScale = d3
    .scaleLinear()
    .domain(maxGrowthRate)
    .range(["#cce599", "#004045"]);
  // console.log(colorScale.domain());

  gMap
    .selectAll("path")
    .data(countries.features)
    .enter()
    .append("path")
    .attr("class", "country")
    .attr("d", pathGenerator)
    .attr("fill", (d) => colorScale(d.properties.growthRate))
    .on("click", (d) => {
      getName = countryName[d.id];
      console.log(getName);
      displayLineChart();
    })
    .append("title")
    .text((d) => countryName[d.id]);

  // Legend(colorScale, {
  //   title: "Your Legend Title"
  // });
});
window.addEventListener("resize", () => {
  svgMap.attr("width", window.innerWidth).attr("height", window.innerHeight);
  projection.fitSize([window.innerWidth, window.innerHeight], {
    type: "Sphere",
  });
  svgMap.selectAll("path").attr("d", pathGenerator);
});

// ----------------------------- Line Chart --------------------------------


function displayLineChart() {
  div1.style("display", "none");
    div2.style("display", "block");
  Promise.all([
    d3.csv("../asset/data/world_population.csv"),
    d3.csv("../asset/data/world_population2.csv"),
    d3.csv("../asset/data/Map/new_dataset2.csv"),
  ]).then(([data1, data2, data3]) => {
    // console.log(data1);
    // console.log(data2);
    console.log(data3);
  
    var nestedData = d3
      .nest()
      .key(function (d) {
        return d["Country/Territory"];
      })
      .entries(data3);
      console.log(getName);
    
    var country = nestedData.find((d) => d.key === getName);
    // Sort the values array by year
    country.values.sort((a, b) => a["Year"] - b["Year"]);
    console.log(country);
  
    // console.log(window.innerWidth);
  
    // Define scales
    // const data4 = data1.forEach(d => console.log(Object.values(d).slice(3, 11)));
  
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(country.values, (d) => d["Year"]))
      .range([0, width - padding * 5]);
  
    var domainY = d3.extent(country.values, (d) => Number(d["Population"]));
    domainY[0] = parseInt(domainY[0] - (domainY[1] - domainY[0]) / 12);
    domainY[1] = parseInt(domainY[1])
    console.log(domainY);
    const yScale = d3
      .scaleLinear()
      .domain(domainY)
      .range([height - padding, padding]);
    // console.log(d3.extent(data2, (d) => d["Total Population"]));
    // Rest of the code...
  
    var xAxis = svgLineChart
      .append("g")
      .attr("class", "axis")
      .attr(
        "transform",
        "translate(" +
          padding * 3 +
          "," +
          (svgLineChart.attr("height") - padding) +
          ")"
      )
      .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("fill", "white");
    var yAxis = svgLineChart
      .append("g")
      .attr("class", "axis")
      .attr("transform", "translate(" + padding * 3 + ",0)")
      .call(d3.axisLeft(yScale).ticks(12))
      .selectAll("text")
      .style("text-anchor", "end")
      .style("fill", "white");
  
    // Create the line generator outside
  
    var g = svgLineChart
      .append("g")
      .attr("transform", "translate(" + padding * 3 + ",0)");
  
    var line = d3
      .line()
      .x(function (d) {
        return xScale(d["Year"]);
      })
      .y(function (d) {
        return yScale(d["Population"]);
      });
  
    var path = g
      .append("path")
      .datum(country.values)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      .attr("d", line);
  
    // Get the length of the path
    var totalLength = path.node().getTotalLength();
  
    // Set up the animation
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0)
      .delay(1500)
      .duration(1000);
  
    // Add the Y gridlines
    svgLineChart
      .append("g")
      .attr("class", "grid")
      .attr("transform", "translate(" + padding * 3 + ",0)")
      .call(
        d3
          .axisLeft(yScale)
          .ticks(12)
          .tickSize(-width + padding * 5)
          .tickFormat("")
      );
  
    // Add the X gridlines
    svgLineChart
      .append("g")
      .attr("class", "grid")
      .attr(
        "transform",
        "translate(" + padding * 3 + "," + (height - padding) + ")"
      )
      .call(
        d3
          .axisBottom(xScale)
          .tickSize(-(height - 2 * padding))
          .tickFormat("")
      );
    // Add label for the y axis
    svgLineChart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", padding)
      .attr("x", 0 - height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Population")
      .style("text-anchor", "end")
      .style("fill", "Yellow");
  
    // Add label for the x axis
    svgLineChart
      .append("text")
      .attr(
        "transform",
        "translate(" + (width - padding) + " ," + (height - padding + 30) + ")"
      )
      .style("text-anchor", "middle")
      .text("Year")
      .style("text-anchor", "end")
      .style("fill", "yellow");
  });
}
function displayMap() {
  div1.style("display", "block");
  div2.style("display", "none");
  svgLineChart.selectAll("*").remove();
}

// ----------------------------- Back Button --------------------------------

backBtn.on("click", () => {
  displayMap();
})