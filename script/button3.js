const h = 500, w = 1500, padding = 30

async function loadData(url) {
  try {
    const data = await d3.csv(url, d3.rowConverter);
    console.log(data)
    return data
  } catch (error) {
    console.error(error);
  }
}

async function scaleConstBar(){
    const dataRaw = await loadData("../asset/data/Global_annual_population.csv")
    let data = []
    for(let i = 10; i < dataRaw.length; i++){
        data.push({"year": dataRaw[i]["Year"],"population": dataRaw[i][" Population"]})
    }

    // const xScale = d3.scaleLinear()
    // .domain([0, d3.max(data, function(d) { return d.population; })])
    // .range([padding, w - padding]);

    const yScale = d3.scaleLinear()
    .domain([d3.max(data, function(d) { return d.population; }), 0])
    .range([h - padding, padding]);

    const colorScale = d3.scaleLinear()
    .domain([d3.max(data, (d) => {return d.population}),d3.min(data, (d) => {return d.population})])
    .range([50,255])

    return {'data': data, 'xScale':null, 'yScale':yScale, 'colorScale': colorScale}
}

async function drawBarChart(){
    const object = await scaleConstBar()
    const xScale = object.xScale
    const yScale = object.yScale
    const colorScale = object.colorScale
    const data = object.data
    const width = 18
    const middlePadding = 9.6
    const tooltip = d3.select(".container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
   
    console.log(data)

    let svg = d3.select(".container").append("div")
        .attr("class", "barchart")
        .append("svg")
        .attr("height", h)
        .attr("width", w)

        const xScaleForYears = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([padding, w - padding])
        .padding(0.1);

    const xAxis = d3.axisBottom(xScaleForYears);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${h - padding})`)
        .call(xAxis)
        .attr("fill", "white");

    svg.selectAll(".tick text") // Change the color of x-axis tick values to white
        .attr("fill", "white");

    // Create y-axis scale and axis
    

    const yScaleForPop = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return Math.ceil(d.population); })]) // Reversed domain
    .range([h - padding, padding]);

    const yAxis = d3.axisLeft(yScaleForPop);

    svg.append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis)
        .attr("fill", "white");

    svg.selectAll(".y-axis .tick text") // Change the color of y-axis tick values to white
        .attr("fill", "white");
    
    

    let xLabel = svg.selectAll('xLabel').data(data).enter().append('text')
    let yLabel = svg.selectAll('yLabel').data(data).enter().append('text')

    let rect =  svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect");

    rect.attr("width", () => {
        return width
    }).attr("height", (d) => {
        return yScale(d.population) - 39.3
    }).attr("y", (d) => {
        return h - yScale(d.population) - padding + 35
    }).attr("x", (d, i) => {
        return i * width + i * middlePadding + padding + 7
    })
    .attr("fill", (d) => {
        return `rgb(${colorScale(parseFloat(d.population))},${colorScale(parseFloat(d.population))}, ${colorScale(parseFloat(d.population))})`
    })

    .on("mouseover", function (event, d) {
        d3.select(this)
        .attr("fill", (d) => {
            // Adjust brightness or color for glowing effect
            return "rgb(255," + (colorScale(parseFloat(d.population))) + ",0)";
        });

    tooltip.transition()
        .duration(200)
        .style("opacity", 0.9);
    tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Population:</strong> ${d.population}`+" Billion")
        .style("left", event.clientX + "px")
        .style("top", event.clientY - 28 + "px")
        .style("z", 5)
        .style("background_color", "red")
        .style("color","white");
    })
    .on("mouseout", function () {
        d3.select(this)
        .attr("fill", (d) => {
            return `rgb(${colorScale(parseFloat(d.population))},${colorScale(parseFloat(d.population))},${colorScale(parseFloat(d.population))})`;
        });

    tooltip.transition()
        .duration(500)
        .style("opacity", 0);
    });


    xLabel.text("Year")
    .attr("x", w/3)
    .attr("y", h)
    .style("fill", "white")

    yLabel.text('Population')
    .attr('x', -h/1.5)
    .attr('y', -3)
    .attr("dy", "1em")
    .attr('transform', 'rotate(-90)')
    .style("fill", "white")

    
    
    // svg.append("g")
    // .attr("class", "axis")
    // .attr("transform", "translate(" + 20 + "," + (h) + ")")
    // .call(xAxis = d3.axisBottom().scale(xScale));
}
drawBarChart()


async function scaleConstLine(){
    const dataRaw = await loadData('../asset/data/Global_annual_mean_temp.csv')
    let data = []
    for(let i = 0; i < dataRaw.length-1; i++){
        data.push({"year": +dataRaw[i]["Year"], "no_smoothing": +dataRaw[i]["No_Smoothing"]})
    }

    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
        .range([padding, w - padding]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.no_smoothing), d3.max(data, d => d.no_smoothing)])
        .range([h - padding - 200, padding + 30]);

    const colorScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.no_smoothing), d3.max(data, d => d.no_smoothing)])
        .range([0, 255]);

    return {'data': data, 'xScale': xScale, 'yScale': yScale, 'colorScale': colorScale};
}

async function drawLineChart(){
    const object = await scaleConstLine();
    const yScale = object.yScale;
    const colorScale = object.colorScale;
    const data = object.data;
    const tooltip = d3.select(".container").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    let svg = d3.select("svg")

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([padding, w - padding])
        .padding(0.1);

    const line = d3.line()
        .x(d => xScale(d.year) + 13)
        .y(d => yScale(d.no_smoothing) - 30);

    svg.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "red") // Adjust color as needed
        .attr("stroke-width", 2)
        .attr("d", line);

    svg.selectAll(".dot")
        .data(data)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => xScale(d.year) + 13)
        .attr("cy", d => yScale(d.no_smoothing) - 30)
        .attr("r", 4)
        .attr("fill", "red") // Adjust color as needed

        .on("mouseover", function (event, d) {
            d3.select(this).attr("r", 6); // Enlarge the dot on hover

            tooltip.transition()
                .duration(200)
                .style("opacity", 0.9);
            tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>No_Smoothing:</strong> ${d.no_smoothing}`)
                .style("left", event.clientX + "px")
                .style("top", event.clientY - 28 + "px")
                .style("z", 5)
                .style("background_color", "red")
                .style("color", "white");
        })

        .on("mouseout", function () {
            d3.select(this).attr("r", 4); // Revert dot size on mouseout

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

        const yAxisForNoSmoothing = d3.axisRight(yScale);

        svg.append("g")
            .attr("class", "y-axis-no-smoothing")
            .attr("transform", `translate(${padding}, 0)`)
            .call(yAxisForNoSmoothing)
            .attr("fill", "white");
    
        svg.selectAll(".y-axis-no-smoothing .tick text") 
            .attr("fill", "white");
    
        
        svg.append("text")
            .attr("transform", `translate(${w - padding}, ${h / 2}) rotate(-90)`)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "white")
            .text("No_Smoothing");
    }

// Call the function to draw the line chart
drawLineChart();

  


  
    
