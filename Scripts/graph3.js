// Set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

// Append the SVG object to the body of the page
const svg = d3.select("#linePlot")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Read the data
const movieGenreCount = {};

const netflixData = (callback) => {
  d3.csv("Data/netflix_titles.csv").then((data) => {
    let dataset = data
      .filter((d) => d.type && d.release_year && d.rating && d.release_year >= 2010) // Filter data for years starting from 2000
      .map((d) => {
        const countries = d.country ? d.country.split(",") : [];
        const genres = d.listed_in ? d.listed_in.split(",") : [];

        return {
          show_id: d.show_id,
          type: d.type,
          title: d.title,
          director: d.director,
          cast: d.cast,
          country: countries.map((c) => c.trim()),
          date_added: d.date_added,
          release_year: parseInt(d.release_year),
          rating: d.rating,
          duration: d.duration,
          listed_in: genres.map((g) => g.trim()),
          description: d.description,
        };
      });
    callback(dataset);
  });
};

netflixData((data) => {
  const movieGenreCount = {};

  data.forEach((d) => {
    const releaseYear = d.release_year;
    const genres = d.listed_in;
    const type = d.type;

    genres.forEach((genre) => {

      if (type === "TV Show") {
        // Initialize the count for the genre and release year if not present
        movieGenreCount[genre] = movieGenreCount[genre] || {};
        movieGenreCount[genre][releaseYear] = movieGenreCount[genre][releaseYear] || 0;

        // Increment the count for the genre and release year
        movieGenreCount[genre][releaseYear] += 1;
      }
    });
  });

  // Now the movieGenreCount object contains the count of movie titles released in each genre for each year
  console.log(movieGenreCount);

  const genres = Object.keys(movieGenreCount);

  // Get all release years and sort them
  const releaseYears = [...new Set(data.map((d) => d.release_year))].sort((a, b) => a - b);

  const x = d3.scalePoint()
    .domain(releaseYears)
    .range([0, width]);

  svg.append("g")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickValues(x.domain().filter((d, i) => !(i % 2))))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  const y = d3.scaleLinear()
    .domain([0, d3.max(genres, genre => d3.max(releaseYears, year => movieGenreCount[genre][year] || 0))])
    .range([height, 0]);

  svg.append("g")
    .call(d3.axisLeft(y));

  const color = d3.scaleOrdinal()
    .range(d3.schemeCategory10);

  svg.selectAll(".line")
    .data(genres)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", genre => color(genre))
    .attr("stroke-width", 1.5)
    .attr("d", genre => d3.line()
      .x(year => x(year))
      .y(year => y(movieGenreCount[genre][year] || 0))
    (releaseYears));
});