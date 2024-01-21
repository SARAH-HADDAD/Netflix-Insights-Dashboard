const netflixData = (callback) => {
  d3.csv("Data/netflix_titles.csv").then((data) => {
    let dataset = data
      .filter((d) => d.type && d.release_year && d.rating)
      .map((d) => {
        // Split the country string into an array of countries
        const countries = d.country ? d.country.split(",") : [];
        const genres = d.listed_in ? d.listed_in.split(",") : [];

        return {
          show_id: d.show_id,
          type: d.type,
          title: d.title,
          director: d.director,
          cast: d.cast,
          country: countries.map((c) => c.trim()), // Trim whitespaces
          date_added: d.date_added,
          release_year: parseInt(d.release_year),
          rating: d.rating,
          duration: d.duration,
          listed_in: genres.map((g) => g.trim()), // Trim whitespaces
          description: d.description,
        };
      });
    callback(dataset);
  });
};

netflixData((data) => {
  // Extracting unique countries
  const uniqueCountries = new Set();
  const uniqueGenres = new Set();
  const countryTitleCount = {}; // Object to store title count for each country

  data.forEach((d) => {
    d.country.forEach((c) => {
      const trimmedCountry = c.trim();
      uniqueCountries.add(trimmedCountry);

      // Increment title count for the country in the object
      countryTitleCount[trimmedCountry] =
        (countryTitleCount[trimmedCountry] || 0) + 1;
    });
  });

  const totalTitles = data.length;
  d3.select("#TotalTitleNumber").text(totalTitles);

  data.forEach((d) => {
    d.country.forEach((c) => uniqueCountries.add(c));
    d.listed_in.forEach((g) => uniqueGenres.add(g));
  });

  ///
  ////
  /////
  //////
  /////// 3eme graph
  //////
  /////
  ////
  ///

  const movieGenreCount = {};
  const TvShowGenreCount = {};

  data.forEach((d) => {
    const releaseYear = d.release_year;
    const genres = d.listed_in;
    const type = d.type;

    genres.forEach((genre) => {
      if (releaseYear >= 2010 && releaseYear <= 2020) {
        if (type === "Movie") {
          movieGenreCount[genre] = movieGenreCount[genre] || {};
          movieGenreCount[genre][releaseYear] =
          movieGenreCount[genre][releaseYear] || 0;
          movieGenreCount[genre][releaseYear] += 1;
        } else if (type === "TV Show") {
          TvShowGenreCount[genre] = TvShowGenreCount[genre] || {};
          TvShowGenreCount[genre][releaseYear] =
          TvShowGenreCount[genre][releaseYear] || 0;
          TvShowGenreCount[genre][releaseYear] += 1;
        }
      }
    });
  });

  const genres = Object.keys(movieGenreCount);
  const genres2 = Object.keys(TvShowGenreCount);

  const releaseYears = [...new Set(data.map((d) => d.release_year))]
    .filter((year) => year >= 2010 && year <= 2020)
    .sort((a, b) => a - b);

  const totalGenres = uniqueGenres.size;
  d3.select("#TotalGenresNumber").text(totalGenres);

  const filteredData = data.filter(
    (d) => d.release_year >= 2000 && d.release_year < 2024
  );

  const margin = { top: 20, right: 20, bottom: 40, left: 45 };
  const width = 550 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;





    const svg2 = d3
    .select("#linePlot")
    .append("svg")
    .attr("width", width +(margin.left) + margin.right)
    .attr("height", height + margin.top +(margin.bottom))
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  const x = d3.scalePoint().domain(releaseYears).range([0, width]);

  svg2
    .append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");
// X Axis Label
svg2
  .append("text")
  .attr("transform", `translate(${width / 2}, ${height + margin.top + 10})`)
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .style("fill", "white")
  .text("Years");

  const y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(genres, (genre) =>
        d3.max(releaseYears, (year) => movieGenreCount[genre][year] || 0)
      ),
    ])
    .range([height, 0]);

  svg2.append("g").call(d3.axisLeft(y));
  svg2
  .append("text")
  .attr("class", "leText")
  .attr("transform", "rotate(-90)")
  .attr("y", 0 - margin.left)
  .attr("x", 0 - height / 2)
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .style("fill", "white")
  .text("Movies Titles");
  const color = d3.scaleOrdinal().range(d3.schemeCategory10);

  svg2
    .selectAll(".line")
    .data(genres)
    .enter()
    .append("path")
    .attr("class", "line") // Add a class to the lines for easier selection
    .attr("fill", "none")
    .attr("stroke", (genre) => color(genre))
    .attr("stroke-width", 1.5)
    .attr("d", (genre) =>
      d3
        .line()
        .x((year) => x(year))
        .y((year) => y(movieGenreCount[genre][year] || 0))(releaseYears)
    )
    .on("mouseover", function (event, genre) {
      svg2
        .append("text")
        .attr("class", "label")
        .attr("x", event.pageX - svg2.node().getBoundingClientRect().left + 5)
        .attr("y", event.pageY - svg2.node().getBoundingClientRect().top)
        .text(genre)
        .attr("fill", color(genre))
        .attr("text-anchor", "start")
        .attr("font-size", "12px");
    })
    .on("mouseout", function () {
      svg2.selectAll(".label").remove();
    });

  svg2.on("click", function () {
    console.log("clicked");

    console.log(genres2);
    svg2
      .selectAll(".line")
      .data(genres2)
      .transition()
      .duration(1000)
      .attr("d", (genre) =>
        d3
          .line()
          .x((year) => x(year))
          .y((year) => y(TvShowGenreCount[genre][year] || 0))(releaseYears)
      );
      svg2
      .selectAll(".leText")
      .text("Tv Shows Titles");
  });

  ///
  ////
  /////
  //////
  /////// the map
  //////
  /////
  ////
  ///

  const svg = d3
  .select("#release_year")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Removing "null" from unique countries (if necessary)
  uniqueCountries.delete("null");

  // Calculating the total number of countries and genres
  const totalCountries = uniqueCountries.size;
  d3.select("#TotalCountriesNumber").text(totalCountries);

  d3.json("Data/world.json")
    .then((world) => {
      // Set a threshold for the significant number of titles
      const titleThreshold = 100;
      var projection = d3.geoMercator().fitSize([1100, 700], world);
      var path = d3.geoPath().projection(projection);
      // Select the element with ID "map"
      const mapSvg = d3
        .select("#map")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "700px");

      // Add path elements for each country
      mapSvg
        .selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("fill", (d) => {
          const countryName = d.properties.name;
          const titleCount = countryTitleCount[countryName] || 0;

          // Color based on title count
          return titleCount > 0 ? colorScale(titleCount) : "white";
        })
        .attr("d", path)
        // Change the 'mouseover' event handler for the map path
        .on("mouseover", function (event, d) {
          // Change color on hover
          d3.select(this).attr("fill", "#990000");

          // Add a text element for country name and title count on hover
          const countryName = d.properties.name;
          const titleCount = countryTitleCount[countryName] || 0;

          // Get the centroid of the country path
          const centroid = path.centroid(d);

          // Add a text element at the centroid
          mapSvg
            .append("text")
            .attr("id", "hoverText")
            .attr("x", centroid[0])
            .attr("y", centroid[1])
            .attr("text-anchor", "middle")
            .attr("dy", "0.5em")
            .attr("fill", "#00A0B0")
            .attr("font-size", "18px") // Adjust font size as needed
            .text(`${countryName}: ${titleCount} titles`);
        })

        .on("mouseout", function (event, d) {
          // Revert to the original color on mouseout
          const countryName = d.properties.name;
          const titleCount = countryTitleCount[countryName] || 0;
          d3.select(this).attr(
            "fill",
            titleCount > 0 ? colorScale(titleCount) : "white"
          );

          // Remove the added text element on mouseout
          mapSvg.select("#hoverText").remove();
        });

      // Add text elements for significant countries
      mapSvg
        .selectAll("text")
        .data(world.features)
        .enter()
        .filter((d) => {
          const countryName = d.properties.name;
          const titleCount = countryTitleCount[countryName] || 0;

          // Show text only for countries with a significant number of titles
          return titleCount > titleThreshold;
        });
      // Add a gradient legend
      const legendGradient = mapSvg
        .append("defs")
        .append("linearGradient")
        .attr("id", "legendGradient")
        .attr("x1", "0%")
        .attr("y1", "100%")
        .attr("x2", "0%")
        .attr("y2", "0%");

      // Define gradient colors
      const gradientColors = ["#FFC0CB", "#FF0000"];

      // Add color stops to the gradient
      legendGradient
        .selectAll("stop")
        .data(gradientColors)
        .enter()
        .append("stop")
        .attr("offset", (d, i) => i * 100 + "%")
        .attr("stop-color", (d) => d);

      // Create a rectangle to show the gradient
      mapSvg
        .append("rect")
        .attr("x", 100)
        .attr("y", 450)
        .attr("width", 20)
        .attr("height", 200)
        .style("fill", "url(#legendGradient)");

      // Add legend text
      mapSvg
        .append("text")
        .attr("x", 125) // Adjust x position as needed
        .attr("y", 450) // Adjust y position as needed
        .attr("fill", "#FFFFFF")
        .attr("font-size", "16px")
        .text("3690");

      mapSvg
        .append("text")
        .attr("x", 125) // Adjust x position as needed
        .attr("y", 650) // Adjust y position as needed
        .attr("fill", "#FFFFFF")
        .attr("font-size", "16px")
        .text("1");
    })
    .catch((error) => {
      console.error(error);
    });

  ///
  ////
  /////
  //////
  /////// first graph
  //////
  /////
  ////
  ///
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

  const colorScale = d3
    .scaleSequential()
    .domain([0, d3.max(countsArray, (d) => d.count)])
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

  const bars = svg
    .selectAll("rect")
    .data(countsArray)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => yScale(d.release_year))
    .attr("width", (d) => xScale(d.count))
    .attr("height", yScale.bandwidth())
    .attr("fill", (d) => colorScale(d.count));

  svg.append("g").call(d3.axisLeft(yScale));

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

  let currentState = "All";
  const states = ["All", "Movie", "TV Show"];
  const movieData = filteredData.filter((entry) => entry.type === "Movie");
  const tvData = filteredData.filter((entry) => entry.type === "TV Show");

  const totalTVShows = tvData.length;
  d3.select("#TotalTVShowsNumber").text(totalTVShows);

  const totalMovies = movieData.length;
  d3.select("#TotalMoviesNumber").text(totalMovies);

  const movieCounts = d3.rollup(
    movieData,
    (v) => v.length,
    (d) => d.release_year
  );
  const movieCountsArray = Array.from(movieCounts, ([release_year, count]) => ({
    release_year,
    count,
  }));

  const tvCounts = d3.rollup(
    tvData,
    (v) => v.length,
    (d) => d.release_year
  );
  const tvCountsArray = Array.from(tvCounts, ([release_year, count]) => ({
    release_year,
    count,
  }));

  tvCountsArray.sort((a, b) => a.release_year - b.release_year);
  movieCountsArray.sort((a, b) => a.release_year - b.release_year);
  let currentArray = countsArray;

  svg.on("click", function () {
    if (currentState === "All") {
      currentArray = movieCountsArray;
      currentState = "Movie";
    } else if (currentState === "Movie") {
      currentArray = tvCountsArray;
      currentState = "TV Show";
    } else {
      currentArray = countsArray;
      currentState = "All";
    }

    bars
      .data(currentArray, (d) => d.release_year)
      .transition()
      .duration(1000)
      .attr("width", (d) => xScale(d.count))
      .attr("y", (d) => yScale(d.release_year))
      .attr("height", yScale.bandwidth());

    d3.select("#graph1Title").text(`${currentState} Releases by Year`);
  });
});
