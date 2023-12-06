const h = 500, w = 1500, padding = 25

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
    .range([100,255])

    return {'data': data, 'xScale':null, 'yScale':yScale, 'colorScale': colorScale}
}

    // async function scaleConstLine(){
    //     const dataRaw = await loadData('../asset/data/Global_annual_mean_temp.csv')
    //     let data = []
    //     for(let i = 0; i < dataRaw.length-1; i++){
    //         data.push({"year": dataRaw[i]["Year"],"no_smoothing": dataRaw[i]["No_Smoothing"]})
    //     }
    //     console.log(data)
    //     // const xScale = d3.scaleLinear()
    //     // .domain([0, d3.max(data, function(d) { return d.No_Smoothing; })])
    //     // .range([padding, w - padding]);
        
    //     const yScale = d3.scaleLinear()
    //     .domain([d3.max(data, function(d) { return d.No_Smoothing; }), 0])
    //     .range([h - padding, padding]);

    //     const colorScale = d3.scaleLinear()
    //     .domain([d3.min(data, (d) => {return d.No_Smoothing},d3.max(data, (d) => {return d.No_Smoothing}))])
    //     .range([0, 255])

    //     return {'data': data, 'xScale':null, 'yScale':yScale, 'colorScale': colorScale}
    // }

async function drawBarChart(){
    const object = await scaleConstBar()
    const xScale = object.xScale
    const yScale = object.yScale
    const colorScale = object.colorScale
    const data = object.data
    const width = 15
    const middlePadding = 7
    const tooltip = d3.select(".container").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
   
    console.log(data)

    let svg = d3.select(".container").append("div")
    .attr("class", "barchart")
    .append("svg")
    .attr("height", h)
    .attr("width", w)

    let xLabel = svg.selectAll('xLabel').data(data).enter().append('text')
    let yLabel = svg.selectAll('yLabel').data(data).enter().append('text')

    let rect =  svg.selectAll("rect")
        .data(data)
        .enter()
        .append("rect");

    rect.attr("width", () => {
        return width
    }).attr("height", (d) => {
        return yScale(d.population)
    }).attr("y", (d) => {
        return h - yScale(d.population) - padding
    }).attr("x", (d, i) => {
        return i * width + i * middlePadding + padding
    })
    .attr("fill", (d) => {
        return "rgb(0,"+ colorScale(parseFloat(d.population)) + ",0)"
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
            return "rgb(0," + colorScale(parseFloat(d.population)) + ",0)";
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

// async function drawScaleConstLine(){
//     const object = await scaleConstLine()
//     const xScale = object.xScale
//     const yScale = object.yScale
//     const colorScale = object.colorScale
//     const data = object.data
//     const width = 15
//     const middlePadding = 7
//     const tooltip = d3.select(".container").append("div")
//     .attr("class", "tooltip")
//     .style("opacity", 0);
    
//     console.log(data)

//     let svg = d3.select(".container").append("div")
//     .attr("class", "linechart")
//     .append("svg")
//     .attr("height", h)
//     .attr("width", w)

//     let xLabel = svg.selectAll('xLabel').data(data).enter().append('text')
//     let yLabel = svg.selectAll('yLabel').data(data).enter().append('text')

//     let line =  svg.selectAll("line")
//         .data(data)
//         .enter()
//         .append("line");

//     rect.attr("width", () => {
//         return width
//     }).attr("height", (d) => {
//         return yScale(d.No_Smoothing)
//     }).attr("y", (d) => {
//         return h - yScale(d.No_Smoothing) - padding
//     }).attr("x", (d, i) => {
//         return i * width + i * middlePadding + padding
//     })
//     .attr("fill", (d) => {
//         return "rgb(0,"+ colorScale(parseFloat(d.No_Smoothing)) + ",0)"
//     })
// }

drawBarChart()
  


  
    
