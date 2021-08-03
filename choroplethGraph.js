const colors = ["#bcd9ea", "#5ba4cf", "#0079bf", "#055a8c"];

function drawChoroChart(countyShapeData, countyEducationData) {
    console.log("countyShape:", countyShapeData);
    console.log("countyEducation:", countyEducationData);

    let choroMargin =
    {
        top: 50,
        right: 120,
        bottom: 60,
        left: 90 
    };

    width = 1200 - choroMargin.left - choroMargin.right,
    height = 630 - choroMargin.top - choroMargin.bottom;

    var choroSvg = d3.select("#choropleth-chart").
    append("svg").
    attr("width", width + choroMargin.left + choroMargin.right).
    attr("height", height + choroMargin.top + choroMargin.bottom).
    attr("class", "graph").
    append("g").
    attr("transform",
    "translate(" +
    choroMargin.left +
    "," +
    choroMargin.top + ")");

    var choroZScale = d3.scaleQuantile().
    domain([d3.min(countyEducationData, d => d.bachelorsOrHigher),
    d3.max(countyEducationData, d => d.bachelorsOrHigher)]).
    range(colors);

    var choroLegend = choroSvg.selectAll('.legend').
    data([0].concat(choroZScale.quantiles()), function (d) {return d;}).
    enter().
    append('g').
    attr("id", "legend").
    attr('transform', function (d, i) {return 'translate(' + (width + 20) + ',' + (20 + i * 20) + ')';});

    choroLegend.append('rect').
    attr('width', 20).
    attr('height', 20).
    style('fill', choroZScale);

    choroLegend.append('text').
    text(function (d, i) {return d.toFixed(2);}).
    attr('x', 30).
    attr('y', 15);

    const path = d3.geoPath();
    const geojson = topojson.feature(countyShapeData, countyShapeData.objects.counties);

    let getColorFromEducationDatum = educationDatum => {
        const bachelorsPercentage = educationDatum.bachelorsOrHigher;
        if (bachelorsPercentage < 16.5) {
            return "#bcd9ea";
        } else
        if (bachelorsPercentage < 33) {
            return "#5ba4cf";
        } else
        if (bachelorsPercentage < 49.5) {
            return "#0079bf";
        } 
        else {
            return "#055a8c";
        }
    };

    let choroTool = d3.select("body").
    append("div").
    attr("id", "tooltip").
    style("opacity", 0);

    handleMouseOver = (event, chartData) => {
        console.log("handleMouseOver. event:", event);
        const eduData =
        countyEducationData.find((ed) =>
        {
            return chartData.id === ed.fips;
        });

        //choroTool.classList.remove("hidden");
        choroTool.style("opacity", .9).
        attr("data-education", eduData.bachelorsOrHigher).
        style("left", event.pageX + 15 + "px").
        style("top", event.pageY + 15 + "px").
        html(`state: ${eduData.state} 
                             <br/>
                             county: ${eduData.area_name}
                             <br/>
                             degree %: ${eduData.bachelorsOrHigher}`);
    };

    handleMouseOut = () => {
        //choroTool.classList.add("hidden");
        choroTool.style("opacity", 0);
        choroTool.style("left", "-100px");
    };

    choroSvg.selectAll('path').
    data(geojson.features).
    enter().
    append('path').
    attr('d', path).
    attr('fill', (d) =>
    {
        return getColorFromEducationDatum(
        countyEducationData.find(ed => {return d.id === ed.fips;}));
    }).
    attr('data-fips', (d) =>
    {
        return countyEducationData.find(ed => d.id === ed.fips).fips;
    }).
    attr('data-education', (d) =>
    {
        return countyEducationData.find(ed => d.id === ed.fips).bachelorsOrHigher;
    }).
    attr("class", "county").
    on("mouseover", (e, d) => handleMouseOver(e, d)).
    on("mouseout", () => handleMouseOut());
}

document.addEventListener('DOMContentLoaded', () =>
{
    const countyShapesURL =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";
    const countyEducationURL =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";

    const treeDatasetURL =
    "https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json";
    const heatMapDataUrl =
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";

    d3.json(heatMapDataUrl)
      .then(drawHeatChart);

    d3.json(treeDatasetURL)
      .then(drawTreeChart);

    Promise.all([d3.json(countyShapesURL), d3.json(countyEducationURL)]).
    then(datasets => {
        drawChoroChart(datasets[0], datasets[1]);
    });
});
