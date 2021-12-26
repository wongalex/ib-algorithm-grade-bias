

class ChordBarChart {
    // Constructor method to initialize Timeline object
    constructor(parentElement, IBData){
        this.parentElement = parentElement;
        this.Data = IBData;

        this.values = [
                ["Male", "Sex"],
                ["Female", "Sex"],
                ["Hispanic", "Race-Ethnicity"],
                ["Black", "Race-Ethnicity"],
                ["White", "Race-Ethnicity"],
                ["Disadvantaged", "Eco_Dis"],
                ["Not Disadvantaged", "Eco_Dis"]];

        // Outcome map
        this.outcomeMap = new Map([[0, "Fail (0-3)"], [1, "Pass (4-7)"]]);
        this.outcomes = ["fail", "pass"];

        this.initVis()
    }

    initVis(){
        let vis = this;

        //Define margin sizes
        vis.margin = {top: 40, right: 40, bottom: 40, left: 65};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Color scale for arcs
        vis.colors = ["#B6B1D5", "#FCBD74"]

        // Make scales
        vis.x = d3.scaleBand()
            .padding(0.1)
            .range([0, vis.width - vis.margin.right])
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        // Make axes
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .style("font-size", "15px")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .ticks(5)
            .tickFormat(d3.format(".0%"));
        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Label vertical axis
        vis.svg.append("g")
            .attr("transform", `translate(-${vis.margin.left - 25}, ${vis.height / 2}) rotate(-90)`)
            .append("text")
            .attr("text-anchor", "middle")
            .style("font-size", "15px")
            .text("Students");

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this

        // Get data from chord
        vis.nIndep = ibChordDiagram.nIndep;
        vis.nDep = ibChordDiagram.nDep;

        let dataMatrix = ibChordDiagram.dataMatrix;

        let data = dataMatrix.slice(1, 1 + vis.nDep).map((r) => {
            return r.slice(-(1 + vis.nIndep), -1);
        });

        vis.displayData = [];

        for (let i = 0; i < vis.nIndep; i++) {
            vis.displayData.push({ key:i, values:[data[0][i], data[1][i]] });
        }

        // Convert to percentages
        let sum = 0;
        vis.displayData.forEach((d) => {
            d.values.forEach((f) => { sum += f })
        });
        vis.displayData.forEach((d, i) => {
            vis.displayData[i].values = d.values.map(f => { return f / sum; })
        });

        // Get tick labels
        vis.tickLabels = vis.values.filter((d) => { return d[1] == ibChordDiagram.indepVar; })
        vis.tickLabels = vis.tickLabels.map((d) => { return d[0]; })

        // Remove last group by hand (d3 is finnicky)
        if (vis.gs) {
            if (vis.nIndep < 3) {
                d3.selectAll(".chord-g-2").remove();
            }
        }
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // Get y max
        let yMax = d3.max(vis.displayData, (d) => {
            return d3.max(d.values);
        })

        // Update domains
        vis.x.domain(d3.range(vis.nIndep));
        vis.y.domain([0, yMax]);

        // Set axis tick labels
        vis.xAxis.tickFormat((d) => { return vis.tickLabels[d]; });

        // Bind groups to data
        vis.gs = vis.svg.selectAll(".chordBarG")
            .data(vis.displayData, (d) => { return d.key; });

        // Draw groups
        vis.gs = vis.gs
            .enter()
            .append("g")
            .merge(vis.gs);

        vis.gs
            .attr("class", (d, i) => { return `chordBarG chord-g-${i}` })
            .attr("transform", (d, i) => { return "translate(" + vis.x(i) + ", 0)"; });

        // Bind bars to data
        vis.bars = vis.gs.selectAll("rect")
            .data((d) => { return d.values; });

        vis.bars = vis.bars.enter()
            .append("rect")
            .merge(vis.bars);

        vis.bars
            .transition()
            .attr("class", (d, i) => { return `chordBarChartRect chord-rect-${i}`; })
            .attr("x", (d, i) => { return (vis.x.bandwidth() / vis.nDep) * i; })
            .attr("y", (d) => { return vis.y(d); })
            .attr("height", (d) => { return vis.height - vis.y(d); })
            .attr("width", vis.x.bandwidth() / 2)
            .attr("fill", (d, i) => { return vis.colors[i]; });

        // Hover behavior
        vis.bars.on('mouseover', function(event, d) {
            // Get indices of rects
            let gNum = parseInt(event.path[1].classList[1].slice(-1));
            let rectNum = parseInt(event.path[0].classList[1].slice(-1));

            chordTooltipIn(gNum, rectNum);
        })
            .on('mouseout', (event) => { chordTooltipOut(); });

        // Bind labels to data
        vis.labels = vis.gs.selectAll("text")
            .data((d) => { return d.values; })

        vis.labels = vis.labels.enter()
            .append("text")
            .merge(vis.labels);

        let fontSize = parseInt($(".y-axis").attr("font-size")) * 1.1;

        vis.labels
            .transition()
            .attr("class", (d, i) => { return `chordBarChartText chord-text-${i}`; })
            .attr("x", (d, i) => { return (vis.x.bandwidth() / vis.nDep) * i + (vis.x.bandwidth() / (vis.nDep * 2)); })
            .attr("y", (d) => { return vis.y(d) - 5; })
            .attr("text-anchor", "middle")
            .style("font-size", fontSize + "px")
            .text((d, i) => { return vis.outcomeMap.get(i); });

        // Remove old bars
        vis.bars.exit()
            .transition()
            .remove();

        // Remove old labels
        vis.labels.exit()
            .transition()
            .remove();

        // Remove old groups
        vis.gs.exit()
            .transition()
            .remove();

        // Call the axes
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);
    }
}