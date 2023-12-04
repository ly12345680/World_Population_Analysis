let w = 600, h = 300;
let padding = 30;
let svg = d3.append("svg").attr("width",w).attr("height",h);
svg.style("background-color","Yellow");

        Promise.all([
            d3.csv('Global_annual_population.csv'),
            d3.csv('Blobal_annual_mean_temp.csv')
        ]).then(function (data) {
            const populationData = data[0];
            const temperatureData = data[1];

            // Parse CSV data
            populationData.forEach(d => {
                d.year = +d.year;
                d.population = +d.population;
            });

            temperatureData.forEach(d => {
                d.year = +d.year;
                d.temperature = +d.temperature;
            });

            // Set up the dimensions and margins for the chart
            const margin = { top: 20, right: 50, bottom: 50, left: 70 };
            const width = 800 - margin.left - margin.right;
            const height = 500 - margin.top - margin.bottom;

            // Create SVG element
            const svg = d3.select('svg')
                .attr('width', width + margin.left + margin.right)
                .attr('height', height + margin.top + margin.bottom)
                .append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // X scale for years
            const x = d3.scaleBand()
                .domain(populationData.map(d => d.year))
                .range([0, width])
                .padding(0.1);

            // Y scale for population
            const yPopulation = d3.scaleLinear()
                .domain([0, d3.max(populationData, d => d.population)])
                .range([height, 0]);

            // Y scale for temperature
            const yTemperature = d3.scaleLinear()
                .domain([d3.min(temperatureData, d => d.temperature), d3.max(temperatureData, d => d.temperature)])
                .range([height, 0]);

            // Add bars for population
            svg.selectAll('.bar')
                .data(populationData)
                .enter().append('rect')
                .attr('class', 'bar')
                .attr('x', d => x(d.year))
                .attr('y', d => yPopulation(d.population))
                .attr('width', x.bandwidth())
                .attr('height', d => height - yPopulation(d.population))
                .attr('fill', 'steelblue');

            // Line for temperature
            const line = d3.line()
                .x(d => x(d.year) + x.bandwidth() / 2)
                .y(d => yTemperature(d.temperature));

            svg.append('path')
                .datum(temperatureData)
                .attr('fill', 'none')
                .attr('stroke', 'red')
                .attr('stroke-width', 2)
                .attr('d', line);

            // Add X and Y axis
            svg.append('g')
                .attr('transform', `translate(0, ${height})`)
                .call(d3.axisBottom(x));

            svg.append('g')
                .call(d3.axisLeft(yPopulation))
                .append('text')
                .attr('fill', '#000')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '-3em')
                .attr('text-anchor', 'end')
                .text('Population');

            svg.append('g')
                .attr('transform', `translate(${width}, 0)`)
                .call(d3.axisRight(yTemperature))
                .append('text')
                .attr('fill', '#000')
                .attr('transform', 'rotate(-90)')
                .attr('y', 6)
                .attr('dy', '-3em')
                .attr('text-anchor', 'end')
                .text('Temperature');
        }).catch(function (error) {
            console.log(error);
        });
 