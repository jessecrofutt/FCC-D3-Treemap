const KICKSTARTER_DATA = ' https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json';
const MOVIESALES_DATA = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json';
const VIDEOGAMESALE_DATA = 'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json';

const svgWidth = 1200,
      svgHeight = 600;

let path = d3.geoPath();
let attainment = d3.map();

let tooltip = d3.select("body")
  .append("div")
  .attr("class" , "tooltip")
  .attr("id", "tooltip")
  .style("position", "absolute")
  .style("z-index", "120")

let treemap = data => d3.treemap()
  .size([svgWidth, svgHeight])
  .padding(1)
  (d3.hierarchy(data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value))

let promises = [
  d3.json(KICKSTARTER_DATA),
  d3.json(MOVIESALES_DATA),
  d3.json(VIDEOGAMESALE_DATA),
]

Promise.all(promises).then(ready)



function ready([kickstarter, movies, videogames]) {

  $('#videoLink').click((e) => {
    e.preventDefault();
    render(videogames);});
  $('#movieLink').click((e) => {
    e.preventDefault();
    render(movies);  });
  $('#kickLink').click((e) => {
    e.preventDefault();
    render(kickstarter);  });

  function render(selected) {

    const root = treemap(selected);

    let format = d3.format(",d");
    let color = d3.scaleOrdinal(d3.schemeCategory10);
    let categories = selected.children.map(node => node.name);

    d3.select("svg").remove();
    const svg = d3.select("body").append("svg")
      .attr("id", "treemap")
      .style("width", svgWidth)
      .style("height", svgHeight)
      .style("font", "10px sans-serif");

    const leaf = svg.selectAll("g")
      .data(root.leaves())
      .join("g")
      .attr("transform", d => `translate(${d.x0},${d.y0})`)
      .on("mouseover", d => {
        tooltip
          .attr("class", "tooltip")
          .attr("data-value", d.data.value)
          .style("left", d3.event.pageX - 50 + "px")
          .style("top", d3.event.pageY - 70 + "px")
          .style("display", "inline-block")
          .html(`Name: ${d.data.name}<br>
                 Category: ${d.data.category}<br>
                 Units Sold: ${d.data.value}`);
      })
      .on("mouseout", () => tooltip.style("display", "none"));

    leaf.append("rect")
      .attr("id", d => (d.leafUid = d.value))
      .attr("class", "tile")
      .attr("data-name", d => d.data.name)
      .attr("data-category", d => d.data.category)
      .attr("data-value", d => d.data.value)
      .attr("fill", d => {
        while (d.depth > 1) d = d.parent;
        return color(d.data.name);
      })
      .attr("fill-opacity", 0.6)
      .attr("width", d => d.x1 - d.x0)
      .attr("height", d => d.y1 - d.y0);

    leaf.append("clipPath")
      .attr("id", d => (d.clipUid = `${d.value} clip`).id)
      .append("use")
      .attr("xlink:href", d => d.leafUid.href);

    leaf.append("text")
      .attr("clip-path", d => d.clipUid)
      .selectAll("tspan")
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .join("tspan")
      .style("font-family", "BenchNine")
      .style("font-size", "11px")
      .attr("x", 3)
      .attr("y", function (d, i) {
        return 15 + i * 10;
      })
      .text(d => d);

    let columnSpacing = 40;
    let numberOfColumns = 3;

    d3.select("#legend").remove();
    let legend = d3.select("body")
      .append("svg")
      .attr("id", "legend")
      .attr("width", "100%")

    let box = legend.append("g")
      .attr("transform", "translate(60, 20)")
      .selectAll("g")
      .data(categories)
      .enter().append("g")

    box.append("rect")
      .attr('width', 40)
      .attr('height', 10)
      .attr('x', (d, i) => {
        return (((i + 3) % 3 == 0) ? 0 : ((i + 3) % 3 == 1) ? 180 : 360)
      })
      .attr('y', (d, i) => {
        return (Math.floor(i / 3) * 16 - 8)
      })
      .attr('class', 'legend-item')
      .attr('fill', (d) => {
        return color(d);
      })
      .attr('fill-opacity', 1)
      .style('padding', '5px');

    box.append("g")
      .select('text')
      .data(categories)
      .enter()
      .append('text')
      .attr("class", "legend-labels")
      .style('font-size', '11px')
      .attr('x', (d, i) => {
        return (((i + 3) % 3 == 0) ? 45 : ((i + 3) % 3 == 1) ? 225 : 405)
      })
      .attr('fill', (d) => { return color(d); })
      .attr('y', (d, i) => {
        return (Math.floor(i / 3) * 16 + 1)
      })
      .text(d => d);

    legend.append('div')
      .attr("id", "links")
      .html(`
          <a href='https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx' id="videoLink">Video Game Data Set</a>
          <a href='https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx' id="movieLink">Movies Data Set</a>
          <a href='https://www.ers.usda.gov/data-products/county-level-data-sets/download-data.aspx' id="kickLink">Kickstarter Data Set</a>
      `);

    return svg.node();
  }

  render(kickstarter);

}