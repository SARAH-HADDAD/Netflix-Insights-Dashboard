// Sample data (replace with your data)
let data = [6, 2, 8, 4, 10];
const initialData = data.slice(); // Store the initial data

// Define graph dimensions
const width = 800;
const height = 400;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

// Create SVG container
const svg = d3
  .select("#histogram")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

// Set up the initial bar chart
const barWidth = 30;
const barPadding = 5;

const yScale = d3
  .scaleLinear()
  .domain([0, d3.max(data)])
  .range([height - margin.bottom, margin.top]);

const xScale = d3
  .scaleBand()
  .domain(data.map((d, i) => i))
  .range([margin.left, width - margin.right])
  .padding(0.1);

const bars = svg
  .selectAll("rect")
  .data(data)
  .enter()
  .append("rect")
  .attr("class", "bar")
  .attr("x", (d, i) => xScale(i))
  .attr("y", (d) => yScale(d) - margin.bottom / 2)
  .attr("width", xScale.bandwidth())
  .attr("height", (d) => height - yScale(d) - margin.top);

// Add text elements for values
const textLabels = svg
  .selectAll("text")
  .data(data)
  .enter()
  .append("text")
  .text((d) => d)
  .attr("text-anchor", "middle")
  .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
  .attr("y", (d) => yScale(d));

// Create x and y axes
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale).ticks(5);

svg
  .append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0, ${height - margin.bottom})`)
  .call(xAxis);

svg
  .append("g")
  .attr("class", "y-axis")
  .attr("transform", `translate(${margin.left}, 0)`)
  .call(yAxis);

function updateChart(newData) {
  bars
    .data(newData)
    .attr("y", (d) => yScale(d) - margin.bottom / 2)
    .attr("height", (d) => height - yScale(d) - margin.top);

  textLabels
    .data(newData)
    .attr("y", (d) => yScale(d))
    .text((d) => d);
}

async function swap(i, j) {
  const transition = d3.transition().duration(2000).ease(d3.easeCircle);

  bars.transition(transition).attr("x", (d, k) => {
    if (k === i) return xScale(j);
    if (k === j) return xScale(i);
    return xScale(k);
  });
  textLabels
    .transition(transition)
    .attr("x", (d, i) => xScale(i) + xScale.bandwidth() / 2)
    .attr("text-anchor", "middle");

  await new Promise((resolve) => setTimeout(resolve, 1500));

  bars
    .transition()
    .duration(0)
    .attr("x", (d, k) => xScale(k));
}

async function bubbleSort(arr) {
  const len = arr.length;

  async function bubble() {
    for (let i = 0; i < len - 1; i++) {
      for (let j = 0; j < len - 1 - i; j++) {
        if (arr[j] > arr[j + 1]) {
          await swap(j, j + 1);
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;
          updateChart(arr);
        }
      }
    }
  }

  await bubble();
}

// Translation function
function translateLabels() {
  document.querySelector("title").textContent = "Sorting Algorithm Visualization";
  // Add more translations as needed
}

// Call the translation function
translateLabels();

// Call bubbleSort after translation
bubbleSort(data);