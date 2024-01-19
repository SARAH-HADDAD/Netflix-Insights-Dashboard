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

  const movieGenreCount = {};

  data.forEach((d) => {
    const releaseYear = d.release_year;
    const genres = d.listed_in;
    const type = d.type;

    genres.forEach((genre) => {
      // Initialize the count for the genre and release year if not present
      movieGenreCount[genre] = movieGenreCount[genre] || {};
      movieGenreCount[genre][releaseYear] = movieGenreCount[genre][releaseYear] || 0;

      // Increment the count for the genre and release year
      movieGenreCount[genre][releaseYear] += 1;
    });
  });

  // Now the movieGenreCount object contains the count of movie titles released in each genre for each year
  console.log(movieGenreCount);

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
  .attr("x", 125)  // Adjust x position as needed
  .attr("y", 450)  // Adjust y position as needed
  .attr("fill", "#FFFFFF")
  .attr("font-size", "16px")
  .text("3690");

mapSvg
  .append("text")
  .attr("x", 125)  // Adjust x position as needed
  .attr("y", 650)  // Adjust y position as needed
  .attr("fill", "#FFFFFF")
  .attr("font-size", "16px")
  .text("1");
    })
    .catch((error) => {
      console.error(error);
    });

  const totalGenres = uniqueGenres.size;
  d3.select("#TotalGenresNumber").text(totalGenres);

  const filteredData = data.filter(
    (d) => d.release_year >= 2000 && d.release_year < 2024
  );

  const margin = { top: 20, right: 0, bottom: 40, left: 45 };
  const width = 550 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  const svg = d3
    .select("#release_year")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
