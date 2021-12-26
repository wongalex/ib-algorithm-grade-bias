

class LineChart {
    // Constructor method to initialize Timeline object
    constructor(parentElement, IBData){
        this.parentElement = parentElement;
        this.Data = IBData;
        this.filtered_data = [];
        this.sorted_data = [];
        this.exam_data = []
        this.initVis()
    }

    initVis(){
        let vis = this;

        //Set margin
        vis.margin = {top: 50, right: 55, bottom: 90, left: 130};

        //Set width and height
        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area for exam chart
        vis.svg_exam = d3.select("#exambarDiv").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.x_exam = d3.scaleLinear()
            .range([0, vis.width])

        vis.y_exam = d3.scaleBand()
            .rangeRound([vis.height, 0])
            .paddingInner(0.1);

        //For formatting percents
        vis.formatPercent = d3.format(".0%");

        vis.xAxis_exam = d3.axisBottom()
            .scale(vis.x_exam)
            .tickFormat(vis.formatPercent)
            .ticks(5)

        vis.yAxis_exam = d3.axisLeft()
            .scale(vis.y_exam);

        vis.svg_exam.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg_exam.append("g")
            .attr("class", "y-axis axis");

        vis.wrangleData()
    }

    wrangleData(category) {
        let vis = this

        //Classes with best overexam performance
        vis.over_exam = ['Biology SL','History HL','Math Studies SL','English HL','Biology HL']

        // Get data on exam performance by subject level
        d3.csv("data/exam_performance.csv").then(function (data) {
            //Sort the data according to exam performance
            vis.exam_data = data.sort((a, b) => a.exam_greater_final - b.exam_greater_final)
            vis.updateVis()
        });
    }

    updateVis(){
        let vis = this;

        //Set domains for exam graph
        vis.x_exam.domain([0, d3.max(vis.exam_data, d => d.exam_greater_final)])
        vis.y_exam.domain(vis.exam_data.map(d => d.Combined))

        //Call exam axes
        vis.svg_exam.select(".x-axis").call(vis.xAxis_exam)
        vis.svg_exam.select(".y-axis").call(vis.yAxis_exam)

        // Get font sie from axes
        let fontSize = parseInt($(".y-axis").attr("font-size")) * 1.1;
        let fontSizeTitle = parseInt($(".y-axis").attr("font-size")) * 1.4;
        let fontShift = fontSize / 2;
        let fontShiftTitle = fontSizeTitle / 2;
        fontSize = fontSize.toString() + "px";
        fontSizeTitle = fontSizeTitle.toString() + "px";

        //Title for Exam Graph
        vis.titleGroup = vis.svg_exam.append("g")
            .attr("transform", "translate(" + vis.width/2 + ",-23)");

        vis.titleGroup.append("text")
            .attr("class", "bar-chart-titles")
            .attr("text-anchor", "middle")
            .attr("font-size", fontSizeTitle)
            .text("Proportion of KIPP Students Whose Exam Scores");
        vis.titleGroup.append("text")
            .attr("class", "bar-chart-titles")
            .attr("text-anchor", "middle")
            .attr("font-size", fontSizeTitle)
            .attr("y", fontSizeTitle)
            .text("Outperform Project/Predicted Scores (2019)");

        //Make exam bar graph
        vis.rectangle_exam = vis.svg_exam.selectAll(".bar")
            .data(vis.exam_data)

        //append rects
        vis.rectangle_exam.enter()
            .append("g")
            .append("rect")
            .attr("class", "bar")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.rectangle_exam)
            .attr("x", 2)
            .attr("y", d => vis.y_exam(d.Combined))
            .attr("width", d => vis.x_exam(d.exam_greater_final) - 2)
            .attr("height", vis.y_exam.bandwidth())
            .attr("fill", function(d){
                if (vis.over_exam.includes(d.Combined)){
                    return '#FCBD74'
                } else {
                    return 'lightgray'
                }
            })

        // Exit
        vis.rectangle_exam.exit().remove();

        //Labels for exam graph
        vis.labels_exam = vis.svg_exam.selectAll(".labels")
            .data(vis.exam_data)

        //append labels
        vis.labels_exam.enter()
            .append("g")
            .append("text")
            .attr("class", "labels")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.labels_exam)
            .attr("x", d => vis.x_exam(d.exam_greater_final) + 5)
            .attr("y", d => vis.y_exam(d.Combined) + vis.y_exam.bandwidth() / 2 + fontShift - 2)
            .attr("font-size", fontSize)
            .text(d => (d.exam_greater_final * 100).toFixed(1) + "%")

        // Exit
        vis.labels_exam.exit().remove();

        // Add Legend
        vis.legend = vis.svg_exam.append("g")

        vis.legend.append("rect")
            .attr("height", fontSizeTitle)
            .attr("width", fontSizeTitle)
            .style("fill", '#FCBD74')
            .attr("transform", "translate(" + (vis.width / 2 - (19 * fontShiftTitle)) + "," + (vis.height + 50 - (fontShiftTitle * 2 - 3)) + ")")

        vis.legend.append("text")
            .text("- Top 5 Exam Performing Subjects")
            .style("font-size", fontSizeTitle)
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (vis.width / 2) + "," + (vis.height + 50) + ")")

        vis.legend.append("text")
            .text("SL = Standard Level, HL = Higher Level")
            .style("font-size", fontSizeTitle)
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (vis.width / 2) + "," + (vis.height + 75) + ")")
    }
}