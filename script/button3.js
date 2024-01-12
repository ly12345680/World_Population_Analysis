const h = 1500, w = 2500, padding = 30

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

    const yScale = d3.scaleLinear()
    .domain([d3.max(data, function(d) { return d.population; }), 0])
    .range([500 - padding, padding]);

    const colorScale = d3.scaleLinear()
    .domain([d3.max(data, (d) => {return d.population}),d3.min(data, (d) => {return d.population})])
    .range([100,255])

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
    const tooltip = d3.select(".container")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "fixed")
        .style("background-color", "rgba(255, 255, 255, 0.8)") // Transparent grey background
        .style("border", "1px solid #fff") // 1px white border
        .style("pointer-events", "none") // Disable pointer events
        .style("color", "black")
        .style("border-radius", "3px");
   
    let svg = d3.select(".container").append("div")
        .attr("class", "barchart")
        .append("svg")
        .attr("height", h)
        .attr("width", w)

        const xScaleForYears = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([padding, 1500 - padding])
        .padding(0.1);

    const xAxis = d3.axisBottom(xScaleForYears);

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${500 - padding})`)
        .call(xAxis)
        .attr("fill", "white");

    svg.selectAll(".tick text") // Change the color of x-axis tick values to white
        .attr("fill", "white");

    // Create y-axis scale and axis
    

    const yScaleForPop = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return Math.ceil(d.population); })]) // Reversed domain
    .range([500 - padding, padding]);

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
        return h
    }).attr("y", (d) => {
        return h
    }).attr("x", (d, i) => {
        return i * width + i * middlePadding + padding + 7
    })
    .attr("fill", (d) => {
        return `rgb(100, ${colorScale(parseFloat(d.population))}, ${colorScale(parseFloat(d.population))})`
    })    
    .on("mouseover", function (event, d) {
        d3.select(this)
        .attr("fill", (d) => {
            // Adjust brightness or color for glowing effect
            return "rgb(255,150,50)";
        });

    tooltip.transition()
        .duration(20)
        .style("opacity", 0.9);
    tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Population:</strong> ${d.population}`+" Billion")
        .style("left", event.clientX + "px")
        .style("top", event.clientY - 28 + "px")
        .style("z", 5)
        .style("background_color", "red")
        .style("color","black");
    })

    .on("mouseout", function () {
        d3.select(this)
        .attr("fill", (d) => {
            return `rgb(100, ${colorScale(parseFloat(d.population))}, ${colorScale(parseFloat(d.population))})`;
        });

    tooltip.transition()
        .duration(500)
        .style("opacity", 0)
    })
    .transition()
    .duration(1000) // Set the duration of the transition in milliseconds
    .attr("height", (d) => {
        return  yScale(d.population) - 39.3
    })
    .attr("y", (d) => {
        return 500 - yScale(d.population) - padding + 35
    });

    xLabel.text("Year")
    .attr("x", 1475)
    .attr("y", 490)
    .style("fill", "white")
    .style("font-size","20px")

    yLabel.text('Population (in Billion)')
    .attr('x', -500/3)
    .attr('y', 30)
    .attr("dy", "1em")
    .attr('transform', 'rotate(-90)')
    .style("fill", "white")
}
async function scaleConstLine(){
    const dataRaw = await loadData('../asset/data/Global_annual_mean_temp.csv')
    let data = []
    for(let i = 0; i < dataRaw.length-1; i++){
        data.push({"year": +dataRaw[i]["Year"], "no_smoothing": +dataRaw[i]["No_Smoothing"]})
    }

    const xScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
        .range([padding, 1500 - padding]);

    const yScale = d3.scaleLinear()
        .domain([d3.min(data, d => d.no_smoothing), d3.max(data, d => d.no_smoothing)])
        .range([500 - padding - 200, padding - 25]);

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
    const tooltip = d3.select(".tooltip")

    let svg = d3.select("svg")

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([padding, 1500 - padding])
        .padding(0.1);

    const line = d3.line()
        .x(d => xScale(d.year) + 13)
        .y(d => yScale(d.no_smoothing) +  100);

    const yScaleForTemp = d3.scaleLinear()
        .domain([d3.min(data, d => d.no_smoothing), d3.max(data, d => d.no_smoothing)])
        .range([500 - padding - 200, padding - 25]);

    const yAxisForTemp = d3.axisRight(yScaleForTemp); // Use axisRight for y-axis on the right

    svg.append("g")
        .attr("class", "y-axis-right") // Add a class for styling
        .attr("transform", `translate(${1475}, 100)`) // Position on the right side
        .call(yAxisForTemp)
        .attr("fill", "red");

    svg.selectAll(".y-axis-right .tick text") // Change the color of y-axis tick values to white
        .attr("fill", "white");
    
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
        .attr("cy", d => yScale(d.no_smoothing) + 100)
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

        })

        .on("mouseout", function () {
            d3.select(this).attr("r", 4); // Revert dot size on mouseout

            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        svg.append("text")
            .attr("x", 500)
            .attr("y", 520)
            .attr("class", "smoothingLabel")
            .text("Temperature with no smoothing")
            .attr("fill", "red")
            .style("font-size", "15px");

        svg.append("path")
            .attr("d","M 495 515 435 515")
            .attr("fill", "none")
            .attr("stroke", "red") // Adjust color as needed
            .attr("stroke-width", 2)
            .attr("d", line);
}

        async function scaleConstLine1(){
            const dataRaw = await loadData('../asset/data/Global_annual_mean_temp.csv')
            let data = []

            console.log(dataRaw)//test to check data

            for(let i = 0; i < dataRaw.length-1; i++){
                data.push({"year": +dataRaw[i]["Year"], "lowess": +dataRaw[i]["Lowess(5)"]})

            }
            
            const xScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.year), d3.max(data, d => d.year)])
                .range([padding, 1500 - padding]);

            const yScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.lowess), d3.max(data, d => d.lowess)])
                .range([500 - padding - 200, padding + 30]);

            const colorScale = d3.scaleLinear()
                .domain([d3.min(data, d => d.lowess), d3.max(data, d => d.lowess)])
                .range([0, 255]);

            return {'data': data, 'xScale': xScale, 'yScale': yScale, 'colorScale': colorScale};
        }

        async function drawLineChart1(){
            const object = await scaleConstLine1();
            const yScale = object.yScale;
            const colorScale = object.colorScale;
            const data = object.data;
            const tooltip = d3.select(".tooltip")

            let svg = d3.select("svg")

            const yScaleForLowess = d3.scaleLinear()
                .domain([d3.min(data, d => d.lowess), d3.max(data, d => d.lowess)])
                .range([500 - padding - 200, padding + 30]);

            const yAxisForLowess = d3.axisRight(yScaleForLowess); // Use axisRight for y-axis on the right

            svg.append("g")
                .attr("class", "y-axis-right") // Add a class for styling
                .attr("transform", `translate(${1505}, -49)`) // Position on the right side
                .call(yAxisForLowess)
                .attr("fill", "orange");

            svg.selectAll(".y-axis-right .tick text") // Change the color of y-axis tick values to white
                .attr("fill", "white");

            const xScale = d3.scaleBand()
                .domain(data.map(d => d.year))
                .range([padding, 1500 - padding])
                .padding(0.1);

            const line = d3.line()
                .x(d => xScale(d.year) + 13)
                .y(d => yScale(d.lowess) - 50);

            svg.append("path")
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "orange") // Adjust color as needed
                .attr("stroke-width", 2)
                .attr("d", line);

            svg.selectAll(".dot1")
                .data(data)
                .enter().append("circle")
                .attr("class", "dot")
                .attr("cx", d => xScale(d.year) + 13)
                .attr("cy", d => yScale(d.lowess) - 50)
                .attr("r", 4)
                .attr("fill", "orange") // Adjust color as needed



                .on("mouseover", function (event, d) {
                    d3.select(this).attr("r", 6); // Enlarge the dot on hover

                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltip.html(`<strong>Year:</strong> ${d.year}<br/><strong>Lowess:</strong> ${d.lowess}`)
                        .style("left", event.clientX + "px")
                        .style("top", event.clientY - 28 + "px")
                        .style("z", 5)

                })

                .on("mouseout", function () {
                    d3.select(this).attr("r", 4); // Revert dot size on mouseout

                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                svg.append("text")
                    .attr("x", 825)
                    .attr("y", 520 )
                    .text("Temperature with Lowess smoothing")
                    .attr("fill", "orange")
                    .style("font-size", "15px");
                
                svg.append("path")
                    .attr("d","M 820 515 760 515")
                    .attr("fill", "none")
                    .attr("stroke", "orange") // Adjust color as needed
                    .attr("stroke-width", 2)
                    .attr("d", line);

            }
        // Call the function to draw the line chart
function createButton(){
    let button1 = document.createElement("button")
    button1.className="option1"
    button1.textContent="option1"

    let button2 = document.createElement("button")
    button2.className="option2"
    button2.textContent="option2"

    console.log(button1)

    document.querySelector(".barchart").appendChild(button1)
}

async function Drawchart(){
    drawBarChart()
    drawLineChart()
    drawLineChart1()
    createButton()
}
Drawchart()


  


  
    
