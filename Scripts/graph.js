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
      countryTitleCount[trimmedCountry] = (countryTitleCount[trimmedCountry] || 0) + 1;
    });
  });

  // Log title count for each country
  for (const country in countryTitleCount) {
    console.log(`${country}: ${countryTitleCount[country]} titles`);
  }
  const totalTitles = data.length;
  d3.select("#TotalTitleNumber").text(totalTitles);

  data.forEach((d) => {
    d.country.forEach((c) => uniqueCountries.add(c));
    d.listed_in.forEach((g) => uniqueGenres.add(g));
  });

  // Removing "null" from unique countries (if necessary)
  uniqueCountries.delete("null");

  // Calculating the total number of countries and genres
  const totalCountries = uniqueCountries.size;
  d3.select("#TotalCountriesNumber").text(totalCountries);

  const path = d3.geoPath().projection(d3.geoMercator());

  d3.json("Data/world.json")
    .then((world) => {
      // Select the element with ID "map"
      const svg = d3.select("#map")
        .append("svg")
        .attr("width", "100%")  // Set the width to 100%
        .attr("height", "500px");  // Set height to auto to maintain aspect ratio
  
      svg.selectAll("path")
        .data(world.features)
        .enter()
        .append("path")
        .attr("fill", "white")
        .attr("d", path);
    })
    .catch((error) => {
      console.error(error); // Log the error to the console
    });
  

 

  const totalGenres = uniqueGenres.size;
  d3.select("#TotalGenresNumber").text(totalGenres);

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
