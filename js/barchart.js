

class BarChart {
    // Constructor method to initialize Timeline object
    constructor(parentElement, IBData){
        this.parentElement = parentElement;
        this.Data = IBData;
        this.initVis()
    }

    initVis(){
        let vis = this;

        //Define margin sizes
        vis.margin = {top: 20, right: 60, bottom: 225, left: 30};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.legend_height = 20
        vis.legend_width = 150

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.x0 = d3.scaleBand()
            .range([0, vis.width])
            .padding(0.1);

        vis.x1 = d3.scaleBand();

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x0)
            .tickSize(0);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .ticks(7);

        vis.color = d3.scaleOrdinal()
            .range(["#d5d5d5", "#ca0020"]);

        vis.courseNames = [];

        vis.keyedDisplayData = [];

        vis.displayData = [];

        vis.wrangleData()
    }

    wrangleData(category){
        let vis = this;

        // Inserting global grades into keyedDisplayData object.
        d3.csv("data/ib_globalgrades.csv").then(function(data) {

            data.forEach(function (d) {
                // Convert quantitative values to 'numbers'
                d.Global_Mean_Grade = +d.Global_Mean_Grade;
                d.Global_Candidates = +d.Global_Candidates;

                // Shorten some course names
                if (d.Course == "ENVIRONMENTAL SYSTEMS AND SOCIETIES, SL") {
                    d.Course = "ENVIRONMENTAL STUDIES, SL";
                }
                if (d.Course == "ENGLISH A: Language and Literature, HL") {
                    d.Course = "ENGLISH, HL";
                }

                vis.keyedDisplayData[d.Course] = {};
                vis.keyedDisplayData[d.Course]["Course"] = d.Course;
                vis.keyedDisplayData[d.Course]["Global_Mean_Grade"] = d.Global_Mean_Grade;
                vis.keyedDisplayData[d.Course]["Global_Candidates"] = d.Global_Candidates;
                vis.keyedDisplayData[d.Course]["Eco_Dis_Sum_Grade"] = 0;
                vis.keyedDisplayData[d.Course]["Eco_Dis_Candidates"] = 0;
            });
            // Inserting Eco Dis data into display Data.
            for (let i = 0; i < vis.Data.length; i++) {
                if (vis.Data[i].Eco_Dis === "1") {
                    vis.keyedDisplayData[vis.Data[i].Course].Eco_Dis_Sum_Grade += vis.Data[i].Final_Grade;
                    vis.keyedDisplayData[vis.Data[i].Course].Eco_Dis_Candidates += 1;
                }
            }

            // Calculating mean grade for Eco Dis students.
            Object.keys(vis.keyedDisplayData).forEach(key => {
                vis.courseNames.push(key);
                vis.keyedDisplayData[key]["Eco_Dis_Mean_Grade"] = (vis.keyedDisplayData[key]["Eco_Dis_Sum_Grade"]) / (vis.keyedDisplayData[key]["Eco_Dis_Candidates"]);
                vis.keyedDisplayData[key]["Eco_Dis_Mean_Grade"] = vis.keyedDisplayData[key]["Eco_Dis_Mean_Grade"].toFixed(2);
                vis.keyedDisplayData[key]["Eco_Dis_Mean_Grade"] = +vis.keyedDisplayData[key]["Eco_Dis_Mean_Grade"];
                vis.displayData.push(vis.keyedDisplayData[key]);
            })
            vis.updateVis();
        });
    }

    updateVis() {
        let vis = this;
        // Each group of bars will be separated by subject.
        vis.x0.domain(vis.courseNames);

        // Each group of bars will consist of the global mean grade and the eco dis students' mean grade.
        vis.x1.domain(["Global_Mean_Grade", "Eco_Dis_Mean_Grade"])
            .range([0, (vis.x0.bandwidth() / 2)]);
        ;

        // Domain on y axis is 0-7 to correlate with min/max IB scores.
        vis.y.domain([0, 7]);

        // Select each subject/course to append 2 different bars to.
        vis.courses = vis.svg.selectAll(".course")
            .data(vis.displayData)
            .enter()
            .append("g")
            .attr("class", "course")
            .attr("transform", function (d) {
                return "translate(" + (vis.x0(d.Course)) + ", -60)"
            });

        // Drawing global mean grade bar for each course/subject.
        vis.svg.selectAll(".course")
            .data(vis.displayData)
            .append("rect")
            .attr("id", (d, i) => "g" + i)
            .style("fill", "#d5d5d5")
            .attr("x", (vis.x1("Global_Mean_Grade") + vis.margin.left))
            .attr("y", d => vis.y(d["Global_Mean_Grade"]) + 130)
            .attr("width", (vis.x1.bandwidth()))
            .attr("height", function (d) {
                return vis.height - vis.y(d["Global_Mean_Grade"]);
            })
            .attr("stroke", "#858585")
            .attr("stroke-width", "2")
            .on("mouseover", function (d) {
                let id = d.srcElement.id;
                id = id.substring(1, id.length);
                id = parseInt(id);
                vis.svg.select("#e" + id)
                    .attr("fill-opacity", "0.15")
                    .attr("stroke-opacity", "0.15");
                vis.svg.select("#g" + id)
                    .attr("fill-opacity", "0.15")
                    .attr("stroke-opacity", "0.15");
                vis.svg.select("#bar-subject")
                    .text("Subject: " + vis.displayData[id]["Course"]);
                vis.svg.select("#bar-gscore")
                    .text("Global Average Score: " + vis.displayData[id]["Global_Mean_Grade"]);
                vis.svg.select("#bar-escore")
                    .text("Eco. Dis. Student Average Score: " + vis.displayData[id]["Eco_Dis_Mean_Grade"]);
            })
            .on("mouseout", function (d) {
                let id = d.srcElement.id;
                id = id.substring(1, id.length);
                vis.svg.select("#e" + id)
                    .attr("fill-opacity", "1")
                    .attr("stroke-opacity", "1");
                vis.svg.select("#g" + id)
                    .attr("fill-opacity", "1")
                    .attr("stroke-opacity", "1");
                vis.svg.select("#bar-subject")
                    .text("");
                vis.svg.select("#bar-gscore")
                    .text("");
                vis.svg.select("#bar-escore")
                    .text("");
            });

        // Drawing eco dis mean grade bar for each course/subject.
        vis.svg.selectAll(".course")
            .data(vis.displayData)
            .append("rect")
            .attr("id", (d, i) => "e" + i)
            .style("fill", "#b6b1d5")
            .attr("x", (vis.x1("Eco_Dis_Mean_Grade") + vis.margin.left))
            .attr("y", d => vis.y(d["Eco_Dis_Mean_Grade"]) + 130)
            .attr("width", (vis.x1.bandwidth()))
            .attr("height", d => {
                return vis.height - vis.y(d["Eco_Dis_Mean_Grade"]);
            })
            .attr("stroke", "#8079ad")
            .attr("stroke-width", "2")
            .on("mouseover", function (d) {
                let id = d.srcElement.id;
                id = id.substring(1, id.length);
                id = parseInt(id);
                vis.svg.select("#e" + id)
                    .attr("fill-opacity", "0.15")
                    .attr("stroke-opacity", "0.15");
                vis.svg.select("#g" + id)
                    .attr("fill-opacity", "0.15")
                    .attr("stroke-opacity", "0.15");
                vis.svg.select("#bar-subject")
                    .text("Subject: " + vis.displayData[id]["Course"]);
                vis.svg.select("#bar-gscore")
                    .text("Global Average Score: " + vis.displayData[id]["Global_Mean_Grade"]);
                vis.svg.select("#bar-escore")
                    .text("Eco. Dis. Student Average Score: " + vis.displayData[id]["Eco_Dis_Mean_Grade"]);
            })
            .on("mouseout", function (d) {
                let id = d.srcElement.id;
                id = id.substring(1, id.length);
                vis.svg.select("#e" + id)
                    .attr("fill-opacity", "1")
                    .attr("stroke-opacity", "1");
                vis.svg.select("#g" + id)
                    .attr("fill-opacity", "1")
                    .attr("stroke-opacity", "1");
                vis.svg.select("#bar-subject")
                    .text("");
                vis.svg.select("#bar-gscore")
                    .text("");
                vis.svg.select("#bar-escore")
                    .text("");
            });

        // Add the X Axis
        vis.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(${vis.margin.left},${vis.height + 70})`)
            .call(vis.xAxis)
            .selectAll("text")
            .attr("transform", "translate(-8, 5), rotate(45)")
            .style("text-anchor", "start")
            .style("font-size", "12px")
            .style("font-weight", "bolder");

        // Add the Y Axis
        vis.svg.append("g")
            .attr("class", "y axis")
            .attr("transform", `translate(${vis.margin.left},70)`)
            .call(vis.yAxis)
            .selectAll("text")
            .style("font-size", "12px")
            .style("font-weight", "bolder");

        // Add Legend
        vis.legend = vis.svg.append("g");
        vis.legend.append("rect")
            .attr("height", 12)
            .attr("width", 12)
            .style("fill", "#d5d5d5")
            .attr("transform", "translate(" + (vis.width - 310) + ", 20)");
        vis.legend.append("text")
            .text("Global Average Score")
            .style("font-size", "14px")
            .attr("transform", "translate(" + (vis.width - 290) + ", 31)");
        vis.legend.append("rect")
            .attr("height", 12)
            .attr("width", 12)
            .style("fill", "#b6b1d5")
            .attr("transform", "translate(" + (vis.width - 310) + ", 40)");
        vis.legend.append("text")
            .text("Economically Disadvantaged Students' Average Score")
            .style("font-size", "14px")
            .attr("transform", "translate(" + (vis.width - 290) + ", 51)");
        vis.legend.append("text")
            .text("SL = Standard Level, HL = Higher Level")
            .style("font-size", "14px")
            .attr("transform", "translate(" + (vis.width - 290) + ", 85)");

        // Tooltip text showing Subject, global mean score, and eco dis mean score.
        vis.tooltipText = vis.svg.append("g");
        vis.tooltipText.append("text")
            .attr("id", "bar-subject")
            .text("")
            .style("font-size", "18px")
            .attr("transform", "translate(" + 100 + ", 55)");
        vis.tooltipText.append("text")
            .attr("id", "bar-gscore")
            .text("")
            .style("font-size", "18px")
            .attr("transform", "translate(" + 100 + ", 80)");
        vis.tooltipText.append("text")
            .attr("id", "bar-escore")
            .text("")
            .style("font-size", "18px")
            .attr("transform", "translate(" + 100 + ", 105)");
    }
}