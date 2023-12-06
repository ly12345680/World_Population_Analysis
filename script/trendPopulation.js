// Prepare your data
// function rowConverter(d) {
//     // Retrieve all attributes of data
//     return {
//         ...d
//     };
// }


Promise.all([
    d3.csv('../asset/data/world_population.csv'),
    d3.csv('../asset/data/world_population2.csv')
]).then(([data1, data2]) => {
    // console.log(data1);
    // console.log(data2);
    const svg = d3.select('#lineChart1')
    
    
    // Define scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(data2, d => d['Year']))
        .range([50, svg.attr('width') - 50]);

    const yScale = d3.scaleLinear()
        .domain(d3.extent(data2, d => d['Total Population']))
        .range([window.innerHeight - 50, 50]);

    // Rest of the code...
    
    // console.log(xScale.domain());
    // console.log(yScale.domain());
    svg.append('g')
        .attr('transform', 'translate(0,0)')
        .call(d3.axisBottom(xScale).ticks(data2.length));
    svg.append('g')
        .attr('transform', 'translate(50,0)')
        .call(d3.axisLeft(yScale));
})





// svg.append('g')
//     .call(d3.axisBottom(xScale).ticks(data.length));
// // Define the line generator
// const line = d3.line()
//     .x(d => xScale(d.year))
//     .y(d => yScale(d.population));

// // Draw the line
// svg.append('path')
//     .datum(data)
//     .attr('fill', 'none')
//     .attr('stroke', 'steelblue')
//     .attr('stroke-width', 1.5)
//     .attr('d', line);

// // Draw the axes
// svg.append('g')
//     .attr('transform', 'translate(0,250)')
//     .call(d3.axisBottom(xScale).ticks(data.length));

// svg.append('g')
//     .attr('transform', 'translate(50,0)')
//     .call(d3.axisLeft(yScale));