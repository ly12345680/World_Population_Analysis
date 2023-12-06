
const svg = d3.select('.map')
  .attr('width', window.innerWidth)
  .attr('height', window.innerHeight-80);

const g = svg.append('g');

const projection = d3.geoNaturalEarth1()
  .fitSize([window.innerWidth, window.innerHeight], {type: 'Sphere'});

const pathGenerator = d3.geoPath().projection(projection);

g.append('path')
  .attr('class', 'sphere')
  .attr('d', pathGenerator({type: 'Sphere'}));

// Create a zoom behavior and apply it to the SVG
const zoom = d3.zoom().on('zoom', () => {
  g.attr('transform', d3.event.transform);
});

svg.call(zoom);


Promise.all([
  d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/110m.tsv'),
  d3.csv('../asset/data/world_population.csv'),
  d3.json('https://unpkg.com/world-atlas@1.1.4/world/110m.json')
]).then(([tsvData, csvData, topoJSONdata]) => {
  const countryName = tsvData.reduce((accumulator, d) => {
    accumulator[d.iso_n3] = d.name;
    return accumulator;
  }, {});

  
  const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
  countries.features.forEach(feature => {
    const countryData = csvData.find(d => d['Country/Territory'] === countryName[feature.id]);
    feature.properties.growthRate = countryData ? +countryData['Growth Rate'] : null;
  });
  // console.log(countries);
  
  // Create a color scale
  const maxGrowthRate = d3.extent(countries.features, d => d.properties.growthRate);
  const colorScale = d3.scaleLinear()
    .domain(maxGrowthRate)
    .range(["#cce599", "#004045"]);
  // console.log(colorScale.domain());

  g.selectAll('path').data(countries.features)
    .enter().append('path')
    .attr('class', 'country')
    .attr('d', pathGenerator)
    .attr('fill', d => colorScale(d.properties.growthRate))
    .on('click', d => window.open("../html/button4.html", "_blank", "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=400,height=400"))
    .append('title')
    .text(d => countryName[d.id]);

    Legend(colorScale, {
      title: "Your Legend Title"
    });
})



window.addEventListener('resize', () => {
  svg.attr('width', window.innerWidth)
     .attr('height', window.innerHeight);
  projection.fitSize([window.innerWidth, window.innerHeight], {type: 'Sphere'});
  svg.selectAll('path').attr('d', pathGenerator);
});