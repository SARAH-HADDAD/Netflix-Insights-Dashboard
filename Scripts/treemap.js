const margin4 = { top: 10, right: 10, bottom: 10, left: 10 },
width = 1100 - margin4.left - margin4.right,
height = 700 - margin4.top - margin4.bottom;

// append the svg object to the body of the page
const svg4 = d3
.select("#treemap")
.append("svg")
.attr("width", width + margin4.left + margin4.right)
.attr("height", height + margin4.top + margin4.bottom)
.append("g")
.attr("transform", `translate(${margin4.left}, ${margin4.top})`);

// read json data
d3.json("lol.json").then(function (data) {
// Give the data to this cluster layout:
const root = d3.hierarchy(data).sum(function (d) {
  return d.value;
}); // Here the size of each leave is given in the 'value' field in input data

// Then d3.treemap computes the position of each element of the hierarchy
d3
  .treemap()
  .size([width, height])
  .paddingTop(28)
  .paddingRight(7)
  .paddingInner(3)(
  // Padding between each rectangle
  //.paddingOuter(6)
  //.padding(20)
  root
);

// prepare a color scale
const color = d3
  .scaleOrdinal()
  .domain(["Movie", "TV Shows"])
  .range(["#FF0000","#FFC0CB"]);

// And a opacity scale
const opacity = d3.scaleLinear().domain([10, 30]).range([0.5, 1]);

// use this information to add rectangles:
svg4
  .selectAll("rect")
  .data(root.leaves())
  .join("rect")
  .attr("x", function (d) {
    return d.x0;
  })
  .attr("y", function (d) {
    return d.y0;
  })
  .attr("width", function (d) {
    return d.x1 - d.x0;
  })
  .attr("height", function (d) {
    return d.y1 - d.y0;
  })
  .style("stroke", "black")
  .style("fill", function (d) {
    return color(d.parent.data.name);
  })
  .style("opacity", function (d) {
    return opacity(d.data.value);
  });

// and to add the text labels
svg4
  .selectAll("text")
  .data(root.leaves())
  .enter()
  .append("text")
  .attr("x", function (d) {
    return d.x0 + 5;
  }) // +10 to adjust position (more right)
  .attr("y", function (d) {
    return d.y0 + 20;
  }) // +20 to adjust position (lower)
  .text(function (d) {
    return d.data.name.replace("mister_", "");
  })
  .attr("font-size", function (d) {
    // Dynamically adjust font size based on the available width
    const boxWidth = d.x1 - d.x0 - 10; // Adjusted width (subtracting 10 for padding)
    const textWidth = this.getComputedTextLength(); // Actual width of the text

    // Set the font size to fit the text within the box
    return Math.min(22, (boxWidth / textWidth) * 10) + "px";
  })
  .attr("fill", "white");

// and to add the text labels
svg4
  .selectAll("vals")
  .data(root.leaves())
  .enter()
  .append("text")
  .attr("x", function (d) {
    return d.x0 + 5;
  }) // +10 to adjust position (more right)
  .attr("y", function (d) {
    return d.y0 + 35;
  }) // +20 to adjust position (lower)
  .text(function (d) {
    return d.data.value;
  })
  .attr("font-size", "11px")
  .attr("fill", "white");

// Add title for the 3 groups
svg4
  .selectAll("titles")
  .data(
    root.descendants().filter(function (d) {
      return d.depth == 1;
    })
  )
  .enter()
  .append("text")
  .attr("x", function (d) {
    return d.x0;
  })
  .attr("y", function (d) {
    return d.y0 + 21;
  })
  .text(function (d) {
    return d.data.name;
  })
  .attr("font-size", "22px")
  .attr("fill", function (d) {
    return color(d.data.name);
  });

});