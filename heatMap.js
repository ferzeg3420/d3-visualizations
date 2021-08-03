// minutes:seconds format (MM:SS) to just seconds 

const months =
[
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

const colorCodes =
[
    "#4475b4", // steelblue
    "#74add1", // cornflowerblue
    "#abd9e9", // lightblue
    "#e0f3f8", // lightcyan
    "#ffffbf", // lemonchiffon
    "#fee090", // khaki
    "#fdae61", // sandybrown
    "#f46d43", // tomato
    "#d73027" // crimson
];

function monthNum2MonthName(monthNum) {
    if (monthNum > 12 || monthNum < 1) {
        return 1;
    }
    let monthName = months[monthNum - 1];
    return monthName;
}

function mouseoverHandler(tool, e, d, baseTemp) {
    //tool.classList.remove("hidden");
    tool.style("opacity", 0.9).
    style("left", (e.pageX + 15) + "px").
    style("top", (e.pageY + 15) + "px").
    attr("data-year", () => d.year);
    tool.html(`<p> Temp: ${d.variance + baseTemp} <br/> Month: ${d.month} <br/>Year: ${d.year} </p>`);
}

function mouseoutHandler(tool) {
    //tool.classList.add("hidden");
    console.log("mouseoutHandler: ", tool);
    tool.style("opacity", 0).
    style("left", "-100px");
}

function drawHeatChart(dataset) {
    let data = dataset.monthlyVariance;
    const baseTemp = dataset.baseTemperature;
    console.log("data:", data);
    console.log("prop:", dataset.baseTemperature);

    let margin =
    {
        top: 50,
        right: 120,
        bottom: 60,
        left: 90 },

    width = 1200 - margin.left - margin.right,
    height = 630 - margin.top - margin.bottom;

    const rectWidth = 6;

    // svg canvas
    let svg = d3.select("#heat-chart").
    append("svg").
    attr("width", width + margin.left + margin.right).
    attr("height", height + margin.top + margin.bottom).
    attr("class", "graph").
    append("g").
    attr("transform",
    "translate(" +
    margin.left +
    "," +
    margin.top + ")");

    let zScale = d3.scaleQuantile().
    domain([d3.min(data, d => d.variance + baseTemp),
    d3.max(data, d => d.variance + baseTemp)]).
    range(colorCodes);

    let xScale = d3.scaleLinear().
    domain([d3.min(data, d => d.year), d3.max(data, d => d.year)]).
    range([0, width]);

    svg.append("g").
    attr("id", "x-axis").
    attr("transform", "translate(0," + height + ")").
    call(d3.axisBottom(xScale).
    tickFormat(d => d.toString()).
    ticks(25));

    let yScale = d3.scaleBand().
    domain(months).
    range([0, height]);

    svg.append("g").
    attr("id", "y-axis").
    call(d3.axisLeft(yScale).
    ticks(12));

    let selectColor = temp => {
        let myTemp = temp + baseTemp;
        //console.log("temperature for select color:", myTemp);
        if (myTemp < 3.9) {
            return colorCodes[0];
        } else
        if (myTemp < 5.0) {
            return colorCodes[1];
        } else
        if (myTemp < 6.1) {
            return colorCodes[2];
        } else
        if (myTemp < 7.2) {
            return colorCodes[3];
        } else
        if (myTemp < 8.3) {
            return colorCodes[4];
        } else
        if (myTemp < 9.5) {
            return colorCodes[5];
        } else
        if (myTemp < 10.6) {
            return colorCodes[6];
        } else
        if (myTemp < 11.7) {
            return colorCodes[7];
        } else
        {
            return colorCodes[8];
        }
    };

    let tool = d3.select("body").
    append("div").
    attr("id", "heat-tooltip");

    svg.selectAll().
    data(data, function (d) {return d.year + ':' + monthNum2MonthName(d.month);}).
    enter().
    append("rect").
    attr("data-month", d => d.month - 1).
    attr("data-year", d => d.year).
    attr("data-temp", d => d.variance + baseTemp).
    attr("class", "cell").
    attr("x", d => xScale(d.year.toString())).
    attr("y", d => yScale(monthNum2MonthName(d.month))).
    attr("width", rectWidth).
    attr("height", yScale.bandwidth()).
    style("fill", d => selectColor(d.variance)).
    on("mouseover", (e, d) => mouseoverHandler(tool, e, d, baseTemp)).
    on("mouseout", () => mouseoutHandler(tool));

    let legend = svg.selectAll('.legend').
    data([0].concat(zScale.quantiles()), function (d) {return d;}).
    enter().
    append('g').
    attr("id", "legend").
    attr('transform', function (d, i) {return 'translate(' + (width + 20) + ',' + (20 + i * 20) + ')';});

    legend.append('rect').
    attr('width', 20).
    attr('height', 20).
    style('fill', zScale);

    legend.append('text').
    text(function (d, i) {return d.toFixed(2);}).
    attr('x', 30).
    attr('y', 15);
}
