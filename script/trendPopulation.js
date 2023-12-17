Promise.all([
  d3.csv("../asset/data/world_population.csv"),
  d3.csv("../asset/data/world_population2.csv"),
  d3.csv("../asset/data/Map/new_dataset.csv"),
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
  var country = nestedData.find((d) => d.key === "Afghanistan");

  console.log(country);

  // console.log(window.innerWidth);
  const width = 1500;
  const height = 800;
  const padding = 50;
  const svg = d3
    .select("#lineChart1")
    .attr("width", width)
    .attr("height", height);

  // Define scales
  // const data4 = data1.forEach(d => console.log(Object.values(d).slice(3, 11)));
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(country.values, (d) => d["Year"]))
    .range([0, width - padding * 4]);
  // console.log(d3.extent(data2, (d) => d["Year"]));
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(country.values, (d) => d["Population"]))
    .range([height - padding, 50]);
  // console.log(d3.extent(data2, (d) => d["Total Population"]));
  // Rest of the code...

  // console.log(xScale.domain());
  // console.log(yScale.domain());
  svg
    .append("g")
    .attr(
      "transform",
      "translate(" + padding * 3 + "," + (svg.attr("height") - padding) + ")"
    )
    .call(d3.axisBottom(xScale).ticks(data2.length));
  svg
    .append("g")
    .attr("transform", "translate(" + padding * 3 + ",0)")
    .call(d3.axisLeft(yScale));

  // Create the line generator outside
  var lineGenerator = d3.line()
    .x(function(d) { return xScale(d["Year"]); })
    .y(function(d) { return yScale(d["Population"]); });

  var lines = svg
    .selectAll(".line")
    .data(country.values)
    .enter()
    .append("path")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", lineGenerator) // Call the line generator with the data
    .attr("transform", "translate(100, " + padding + ")");
});
