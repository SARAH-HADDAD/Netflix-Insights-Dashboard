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

  const lineChartTooltip = d3
    .select("#linePlot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("color", "black")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("fill", "black")
    .style("padding", "5px");

  const svg2 = d3
    .select("#linePlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
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
    .attr("stroke-width", 2)
    .attr("d", (genre) =>
      d3
        .line()
        .x((year) => x(year))
        .y((year) => y(movieGenreCount[genre][year] || 0))(releaseYears)
    )
    .on("mouseover", function (event, genre) {
      lineChartTooltip
        .style("opacity", 1)
        .html(`Genre: ${genre}`)
        .style("left", `${event.pageX}px`)
        .style("fill", "black")
        .style("top", `${event.pageY}px`);
    })
    .on("mousemove", function (event, genre) {
      lineChartTooltip
        .html(`Genre: ${genre}`)
        .style("left", `${event.pageX}px`)
        .style("top", `${event.pageY}px`);
    })
    .on("mouseout", function () {
      lineChartTooltip.style("opacity", 0);
    });

  svg2.on("click", function () {
    console.log("clicked");

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
    svg2.selectAll(".leText").text("Tv Shows Titles");
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
  const lineMapTooltip = d3
    .select("#linePlot")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "5px")
    .style("border-radius", "5px")
    .style("padding", "5px")
    .style("color", "black");

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

          lineChartTooltip
            .html(`${countryName}: ${titleCount} titles`)
            .style("opacity", 1)
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`);
        })
        .on("mousmove", function (event, d) {
          // Change color on hover
          d3.select(this).attr("fill", "#990000");

          // Add a text element for country name and title count on hover
          const countryName = d.properties.name;
          const titleCount = countryTitleCount[countryName] || 0;

          lineChartTooltip
            .html(`${countryName}: ${titleCount} titles`)
            .style("left", `${event.pageX}px`)
            .style("top", `${event.pageY}px`);
        })
        .on("mouseout", function (event, d) {
          // Revert to the original color on mouseout
          const countryName = d.properties.name;
          const titleCount = countryTitleCount[countryName] || 0;
          d3.select(this).attr(
            "fill",
            titleCount > 0 ? colorScale(titleCount) : "white"
          );
          lineChartTooltip.style("opacity", 0);
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
  const movieDurations = movieData.map((entry) => entry.duration);

  // Assuming duration is in the format "X min", extracting only the numeric part
  const durationValues = movieDurations
    .map((duration) => parseInt(duration.split(" ")[0]))
    .filter((duration) => !isNaN(duration));

  const durationCount = {};

  durationValues.forEach((duration) => {
    // Increment the count for the current duration
    durationCount[duration] = (durationCount[duration] || 0) + 1;
  });

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

  //
  ///
  ////
  /////
  //////
  /////// 5eme graph

  const svg5 = d3
    .select("#my_area_chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x5 = d3
    .scaleLinear()
    .domain([0, d3.max(durationValues)])
    .range([0, width]);

  const y5 = d3
    .scaleLinear()
    .domain([0, d3.max(Object.values(durationCount))])
    .range([height, 0]);

  svg5
    .append("path")
    .datum(Object.entries(durationCount))
    .attr("fill", "#FFC0CB")
    .attr("stroke", "#FF0000")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .area()
        .x((d) => x5(+d[0]))
        .y0(height)
        .y1((d) => y5(+d[1]))
    );

  svg5
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x5));

  svg5.append("g").call(d3.axisLeft(y5));
  // Add X axis label
  svg5
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 15})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "white")
    .text("Duration (minutes)");

  // Add Y axis label
  svg5
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("fill", "white")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Titles");

  ////
  //////////////// 6
  /////

  const tvShowSeasons = tvData.map((entry) => entry.duration);

  // Assuming season is in the format "X Season", extracting only the numeric part
  const seasonValues = tvShowSeasons
    .map((season) => parseInt(season.split(" ")[0]))
    .filter((season) => !isNaN(season));

  const seasonCount = {};

  seasonValues.forEach((season) => {
    // Increment the count for the current season
    seasonCount[season] = (seasonCount[season] || 0) + 1;
  });

  const svg6 = d3
    .select("#my_area_chart2")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  const x6 = d3
    .scaleLinear()
    .domain([0, d3.max(Object.keys(seasonCount).map(Number))])
    .range([0, width]);

  const y6 = d3
    .scaleLinear()
    .domain([0, d3.max(Object.values(seasonCount))])
    .range([height, 0]);

  svg6
    .append("path")
    .datum(Object.entries(seasonCount))
    .attr("fill", "#FFC0CB")
    .attr("stroke", "#FF0000")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .area()
        .x((d) => x6(+d[0]))
        .y0(height)
        .y1((d) => y6(+d[1]))
    );

  svg6
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x6));

  svg6.append("g").call(d3.axisLeft(y6));
  // Add X axis label
  // Add X axis label
  svg6
    .append("text")
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 15})`)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "white")
    .text("Seasons");

  // Add Y axis label
  svg6
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - height / 2)
    .attr("dy", "1em")
    .style("fill", "white")
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Titles");

  const directorsData = {};
  data.forEach((d) => {
    const directors = d.director ? d.director.split(",") : [];
    directors.forEach((director) => {
      const trimmedDirector = director.trim();
      directorsData[trimmedDirector] =
        (directorsData[trimmedDirector] || 0) + 1;
    });
  });

  const topDirectors = Object.entries(directorsData)
    .sort((a, b) => b[1] - a[1]) // Sort in descending order based on title count
    .slice(0, 10); // Take the top 10 directors

  console.log("Top 10 Directors:");
  topDirectors.forEach(([director, count], index) => {
    console.log(`${index + 1}. ${director}: ${count} titles`);
  });

  // Create a bar chart
  const marginChart = { top: 20, right: 20, bottom: 40, left: 120 };
  const widthChart = 500 - marginChart.left - marginChart.right;
  const heightChart = 400 - marginChart.top - marginChart.bottom;

  const xChart = d3
    .scaleLinear()
    .domain([0, d3.max(topDirectors, (d) => d[1])])
    .range([0, widthChart]);
  const yChart = d3
    .scaleBand()
    .domain(topDirectors.map((d) => d[0]))
    .range([heightChart, 0])
    .padding(0.1);

  const svgChart = d3
    .select("#topDirectorsChart")
    .append("svg")
    .attr("width", widthChart + marginChart.left + marginChart.right)
    .attr("height", heightChart + marginChart.top + marginChart.bottom)
    .append("g")
    .attr("transform", `translate(${marginChart.left},${marginChart.top})`);

  svgChart
    .selectAll("rect")
    .data(topDirectors)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d) => yChart(d[0]))
    .attr("width", (d) => xChart(d[1]))
    .attr("height", yChart.bandwidth())
    .attr("fill", "#FF0000");

  svgChart.append("g").call(d3.axisLeft(yChart));

  svgChart
    .append("g")
    .attr("transform", `translate(0, ${heightChart})`)
    .call(d3.axisBottom(xChart).ticks(5));

  svgChart
    .append("text")
    .attr("x", widthChart / 2)
    .attr("y", heightChart + marginChart.top + 20)
    .attr("text-anchor", "middle")
    .attr("font-size", "12px")
    .attr("fill", "white")
    .text("Number of Titles");

  svgChart
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - marginChart.left)
    .attr("x", 0 - heightChart / 2)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("fill", "white")
    .text("Director");
});
