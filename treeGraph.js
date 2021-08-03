const category2Color =
{
    "2600": "RoyalBlue",
    "Wii": "AntiqueWhite",
    "NES": "Aqua",
    "GB": "Aquamarine",
    "X360": "Beige",
    "PS3": "#BBC7A4",
    "PS2": "#C2B2B4",
    "SNES": "BurlyWood",
    "GBA": "Coral",
    "PS4": "Crimson",
    "3DS": "DarkCyan",
    "N64": "DarkOrange",
    "PS": "DarkSeaGreen",
    "XB": "Gold",
    "PC": "Fuchsia",
    "PSP": "HotPink",
    "XOne": "LightGreen",
    "DS": "LightSlateGray" 
};

const forSizingChars = document.getElementById("char-sizing");
const charWidth = forSizingChars.scrollWidth;

function splitName(d) {
    console.log("d.data.name", d.data.name);
    let width = d.x1 - d.x0;
    let gameName = d.data.name;
    let lines = [];
    let line = "";
    let count = 0;
    let lineMax = Math.floor(width / charWidth);
    console.log("lineMax:", lineMax);

    if( lineMax === undefined ) {
        lineMax = 10;
    }

    let words = gameName.split(" ");
    for( let i = 0; i < words.length; i++ ) {
        let word = words[i];
        count += word.length + 1;
        if( word.length > lineMax && line == "" ) {
            lines.push(word);
            line = "";
            count = 0;
            continue;
        }
        if( count > lineMax ) {
            lines.push(line);
            line = "";
            count = 0;
            i--;
            continue;
        }
        line += word + " ";
    }
    if( line != "" ) {
        lines.push(line);
    }
    console.log("lines\n", lines);
    return lines;
}

function drawTreeChart(data) {
    console.log("dict test:", category2Color["PSP"]);
    console.log("data:", data);
    let margin =
    {
        top: 10,
        right: 40,
        bottom: 30,
        left: 10 
    };

    width = 1382 - margin.left - margin.right,
    height = 864 - margin.top - margin.bottom;

    let svg = d3.select("#tree-chart").
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

    // Give the data to this cluster layout:
    // Here the size of each leave is given in the 'value' field in input data
    let root = d3.hierarchy(data).sum(function (d) {return d.value;}); 
    // Then d3.treemap computes the position of each element of the hierarchy
    d3.treemap().
    size([width, height]).
    padding(1)(
    root);

    let tool = d3.select("body").
    append("div").
    attr("id", "tooltip");

    handleMouseover = (event, dataLeaf) => {
        //tool.classList.remove("hidden");
        console.log("data leaf data:", dataLeaf);
        tool.style("opacity", 0.9).
        style("left", (event.pageX + 15) + "px").
        style("top", (event.pageY + 15) + "px").
        attr('data-value', dataLeaf.data.value).
        attr("data-year", () => dataLeaf);

        tool.html(`<p> Name: ${dataLeaf.data.name} <br/> Category: ${dataLeaf.data.category} </p>`);
    };

    handleMouseout = () => {
        tool.style("opacity", 0);
        tool.style("left", "-100px");
        //tool.classList.add("hidden");
    };

    const cell = svg.selectAll('g').
    data(root.leaves()).
    enter().
    append('g') // create a group for each cell / movie
    .attr('transform', d => `translate(${d.x0},${d.y0})`) // let the group element handle the general positioning
    .on("mouseover", (e, d) => handleMouseover(e, d)).
    on("mouseout", () => handleMouseout(tool));

    cell.append('rect') // append rect for each cell / movie
    .attr('id', d => d.data.id).
    attr('class', 'tile').
    attr('data-name', d => { return splitName(d) } ).
    attr('data-value', d => d.data.value).
    attr('data-category', d => d.data.category).
    attr('width', d => d.x1 - d.x0).
    attr('height', d => d.y1 - d.y0).
    attr('fill', d => {
        const retColor = category2Color[d.data.category];
        console.log("ret color:", retColor);
        if (retColor === undefined) {
            console.log("undefined:", d.data.category);
        }
        return category2Color[d.data.category];
    });

    cell.append('text') // append text node for each cell / movie
    .selectAll('tspan').
    data(d => splitName(d)) // split the name and use that as data to create indiviual tspan elements
    .enter().
    append('tspan') // append tspan node for each element of the string which got split
    .attr('font-size', '9px').
    attr('x', 4).
    attr('y', (d, i) => 13 + 10 * i) // offset the y positioning with the index of the data
    .text(d => d);

    const legend = d3.select("#tree-legend").
    append("svg").
    attr("width", 960).
    attr("height", 100);

    legend.selectAll("rect").
    data(Object.values(category2Color)).
    enter().
    append("rect").
    attr("class", "legend-item").
    style("stroke", "white").
    attr("y", (d, i) => 20).
    attr("x", (d, i) => i * 49 + 50).
    attr("width", 35).
    attr("height", 20).
    style("fill", d => d);

    legend.selectAll("text").
    data(Object.keys(category2Color)).
    enter().
    append("text").
    attr('x', (d, i) => i * 49 + 50).
    attr('y', 60).
    text(d => d);
}
