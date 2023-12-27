const netflixData = (callback) => {
    d3.csv("Data/netflix_titles.csv").then((data) => {
      let dataset = data.map((d) => {
        return {
          show_id: d.show_id,
          type: d.type,
          title: d.title,
          director: d.director,
          cast: d.cast,
          country: d.country,
          date_added: d.date_added,
          release_year: parseInt(d.release_year),
          rating: d.rating,
          duration: d.duration,
          listed_in: d.listed_in,
          description: d.description,
        };
      });
      callback(dataset);
    });
  };

  netflixData((data) => {
    const filteredData = data.filter(
      (d) => d.release_year >= 2000 && d.release_year < 2024
    );

    const margin = { top: 20, right: 30, bottom: 40, left: 45 };
    const width = 550 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;


    const svg = d3
      .select("#release_year")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
      );

    const counts = d3.rollup(
      filteredData,
      (v) => v.length,
      (d) => d.release_year
    );
    const countsArray = Array.from(counts, ([release_year, count]) => ({
      release_year,
      count,
    }));

    countsArray.sort((a, b) => a.release_year - b.release_year);

    const colorScale = d3.scaleSequential()
        .domain([0, d3.max(countsArray, d => d.count)])
        .interpolator(d3.interpolate("#FFC0CB", "#FF0000"));

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(countsArray, (d) => d.count)])
      .range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain(countsArray.map((d) => d.release_year))
      .range([height, 0])
      .padding(0.1);

    svg
      .selectAll("rect")
      .data(countsArray)
      .enter()
      .append("rect")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.release_year))
      .attr("width", (d) => xScale(d.count))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => colorScale(d.count));

    svg.append("g").call(d3.axisLeft(yScale))
    ;

    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.top + 20)
      .attr("text-anchor", "middle")
      .attr("font-size", "12px")
      .attr("fill", "white")
      .text("Count");
  });