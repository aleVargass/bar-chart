let width = 800,
    height = 400,
    barWidth = width / 275;

let svgContainer = d3
    .select("#visHolder")
    .append("svg")
    .attr("width", width + 100)
    .attr("height", height + 60);

let overlay = d3
    .select("#visHolder")
    .append("div")
    .attr("class", "overlay")
    .style("opacity", 0)

let tooltip = d3
    .select("#visHolder")
    .append("div")
    .attr("id", "tooltip")
    .style("opacity", 0);

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
d3.json(url).then(data => {
    const dataset = data.data;

    svgContainer
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -200)
        .attr('y', 80)
        .text('Gross Domestic Product');

    let years = dataset.map(year => {
        let quarter;
        let temp = year[0].substring(5, 7);
        switch (temp) {
            case "01":
                quarter = "Q1";
                break;
            case "04":
                quarter = "Q2";
                break;
            case "07":
                quarter = "Q3";
                break;
            case "10":
                quarter = "Q4";
                break;
            default:
                break;
        }
        return year[0].substring(0, 4) + " " + quarter
    })

    let yearsDate = dataset.map(data => new Date(data[0]));
    let xMax = new Date(d3.max(yearsDate));
    xMax.setMonth(xMax.getMonth() + 3);
    let xScale = d3.scaleTime()
        .domain([d3.min(yearsDate), xMax])
        .range([0, width]);
    let xAxis = d3.axisBottom().scale(xScale);
    svgContainer.append("g")
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("transform", "translate(60, 400)");

    let GDP = dataset.map(data => data[1]);
    let gdpMax = d3.max(GDP);
    let linearScale = d3.scaleLinear()
        .domain([0, gdpMax])
        .range([0, height]);
    let scaledGDP = GDP.map(data => linearScale(data));
    let yScale = d3.scaleLinear()
        .domain([0, gdpMax])
        .range([height, 0]);
    let yAxis = d3.axisLeft(yScale);
    svgContainer.append("g")
        .call(yAxis)
        .attr("id", "y-axis")
        .attr("transform", "translate(60, 0)");

    d3.select("svg")
        .selectAll("rect")
        .data(scaledGDP)
        .enter()
        .append("rect")
        .attr("data-date", (d, i) => dataset[i][0])
        .attr("data-gdp", (d, i) => GDP[i])
        .attr("class", "bar")
        .attr("x", (d, i) => xScale(yearsDate[i]))
        .attr("y", d => height - d)
        .attr("width", barWidth)
        .attr("height", d => d)
        .attr("index", (d, i) => i)
        .attr("fill", "#33adff")
        .attr("transform", "translate(60, 0)")
        .on("mouseover", function (e, d) {
            let i = this.getAttribute("index");
            tooltip.transition().duration(0).style("opacity", .9);
            tooltip.html(years[i] + "<br>$ " + GDP[i] + " Billion")
                .attr("data-date", dataset[i][0])
                .style("left", i * barWidth + 30 + "px")
                .style("top",  height - 100 + "px")
                .style("transform", "translateX(60px)");
            overlay.transition().duration(0)
                .style("height", d + "px")
                .style("width", barWidth + "px")
                .style("opacity", .9)
                .style("left", i * barWidth + 0 + "px")
                .style("top",  height - d  + "px")
                .style("transform", "translate(60px)")
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
            overlay.transition().duration(200).style("opacity", 0);
        })
})