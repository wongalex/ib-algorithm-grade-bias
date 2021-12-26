

class initialBar {
    // Constructor method to initialize Timeline object
    constructor(parentElement){
        this.parentElement = parentElement;

        this.initVis()
    }

    initVis(){
        let vis = this;

        //Set margin
        vis.margin = {top: 60, right: 15, bottom: 20, left: 50};

        //Set width and height
        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // SVG drawing area for UPrep chart
        vis.svg_UPrep = d3.select("#initialbarDiv_UPrep").append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.x_UPrep = d3.scaleBand()
            .rangeRound([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])

        vis.y_UPrep = d3.scaleLinear()
            .range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.xAxis_UPrep = d3.axisBottom()
            .scale(vis.x_UPrep)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.yAxis_UPrep = d3.axisLeft()
            .scale(vis.y_UPrep);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg_UPrep.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.svg_UPrep.append("g")
            .attr("class", "y-axis axis");

        vis.wrangleData()
    }

    wrangleData(category){
        let vis = this

        vis.data = [
            {
                Location: "Global",
                Year: "2019",
                Average_Score: 4.64
            },
            {
                Location: "Global",
                Year: "2020",
                Average_Score: 4.95
            },
            {
                Location: "UPrep",
                Year: "2019",
                Average_Score: 2.87
            },
            {
                Location: "UPrep",
                Year: "2020",
                Average_Score: 2.58
            },
            {
                Location: "UPrep",
                Year: "2020",
                Average_Score: 3.18
            }
        ]
        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        //Update domains
        vis.x.domain(vis.data.map(d => d.Year))
        vis.y.domain([0,7])

        //Update axes
        vis.svg.select(".x-axis").call(vis.xAxis)
        vis.svg.select(".y-axis").call(vis.yAxis)

        // Get font sie from axes
        let fontSize = parseInt($(".y-axis").attr("font-size")) * 1.25;
        let fontSizeTitle = parseInt($(".y-axis").attr("font-size")) * 1.7;
        fontSize = fontSize.toString() + "px";
        fontSizeTitle = fontSizeTitle.toString() + "px";

        //Title for Global
        vis.svg.append("g")
            .attr("transform", "translate(" + vis.width/2 + ",-15)")
            .append("text")
            .attr("class", "bar-chart-titles")
            .attr("text-anchor", "middle")
            .attr("font-size", fontSizeTitle)
            .text("Global");

        //Title for UPrep chart
        vis.svg_UPrep.append("g")
            .attr("transform", "translate(" + vis.width/2 + ",-15)")
            .append("text")
            .attr("class", "bar-chart-titles")
            .attr("text-anchor", "middle")
            .attr("font-size", fontSizeTitle)
            .text("KIPP");

        // Label left vertical axis
        vis.svg.append("g")
            .attr("transform", `translate(-${vis.margin.left - 15}, ${vis.height / 2}) rotate(-90)`)
            .append("text")
            .attr("text-anchor", "middle")
            .style("font-size", fontSizeTitle)
            .text("Average Exam Score");

        ///Code adapted from function provided in lab instructions document
        // Data-join (rectangle now contains the update selection)
        vis.rectangle = vis.svg.selectAll(".bar")
            .data(vis.data.filter(d => d.Location === "Global"))

        //append rects
        vis.rectangle.enter()
            .append("g")
            .append("rect")
            .attr("class", "bar")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.rectangle)
            .attr("x", d => vis.x(d.Year) + 2)
            .attr("y", d => vis.y(d.Average_Score))
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.height - vis.y(d.Average_Score))
            .attr("fill", '#B6B1D5')

        // Exit
        vis.rectangle.exit().remove();

        //Labels
        vis.labels = vis.svg.selectAll(".labels")
            .data(vis.data.filter(d => d.Location === "Global"))

        //append labels
        vis.labels.enter()
            .append("g")
            .append("text")
            .attr("class", "labels")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.labels)
            .attr("x", d => vis.x(d.Year) + vis.x.bandwidth() / 2)
            .attr("y", d => vis.y(d.Average_Score) + 30)
            .attr('font-weight','bold')
            .attr('font-size', fontSize)
            .attr('text-anchor', 'middle')
            .text(d => d.Average_Score)

        // Exit
        vis.labels.exit().remove();

        //Set domains for exam graph
        vis.x_UPrep.domain(vis.data.map(d => d.Year))
        vis.y_UPrep.domain([0,7])

        //Call exam axes
        vis.svg_UPrep.select(".x-axis").call(vis.xAxis_UPrep)
        vis.svg_UPrep.select(".y-axis").call(vis.yAxis_UPrep)

        //Make exam bar graph
        vis.rectangle_UPrep = vis.svg_UPrep.selectAll(".bar")
            .data(vis.data.filter(d => d.Location === "UPrep"))

        //append rects
        vis.rectangle_UPrep.enter()
            .append("g")
            .append("rect")
            .attr("class", "bar")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.rectangle_UPrep)
            .attr("x", d => vis.x_UPrep(d.Year) + 2)
            .attr("y", d => vis.y_UPrep(d.Average_Score))
            .attr("width", vis.x_UPrep.bandwidth())
            .attr("height", d => vis.height - vis.y_UPrep(d.Average_Score))
            .attr("fill", function(d){
                if (d.Average_Score === 3.18){
                    return "none"
                } else {
                    return '#B6B1D5'
                }
            })
            .attr("stroke", "black")
            .attr("stroke-width", function(d){
                if (d.Average_Score === 3.18){
                    return "2px"
                } else {
                    return "0px"
                }
            })
        // Exit
        vis.rectangle_UPrep.exit().remove();

        //Labels for exam graph
        vis.labels_UPrep = vis.svg_UPrep.selectAll(".labels")
            .data(vis.data.filter(d => d.Location === "UPrep"))

        //append labels
        vis.labels_UPrep.enter()
            .append("g")
            .append("text")
            .attr("class", "labels")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.labels_UPrep)
            .attr("x", d => vis.x_UPrep(d.Year) + vis.x_UPrep.bandwidth() / 2)
            .attr("y", function(d){
                if (d.Average_Score === 3.18){
                    return vis.y_UPrep(d.Average_Score) - 10
                } else {
                    return vis.y_UPrep(d.Average_Score) + 30
                }
            })
            .attr('font-weight','bold')
            .attr('text-anchor', 'middle')
            .attr('font-size', fontSize)
            .text(d => d.Average_Score)

        // Exit
        vis.labels_UPrep.exit().remove();

        //Append a line for key
        vis.line = vis.svg_UPrep.selectAll('legend').data(vis.data)

        vis.line.enter()
            .append("line")
            .attr("class","legend")

            //Style line
            .attr('x1', vis.width - 10)
            .attr('y1', vis.y_UPrep(3.18))
            .attr('x2', vis.width - 10)
            .attr('y2', vis.height/2.5)
            .attr('stroke', 'black')
            .attr('stroke-width','2px')
            .style('stroke-dasharray', ('3,3'))

        //Append text for key
        vis.text = vis.svg_UPrep.selectAll('legend').data(vis.data)

        vis.text = vis.text.enter()
            .append("text")
            .attr("class","legend")

            //Style line
            .attr('x', vis.width - 120)
            .attr('y', vis.height/2.5 - 35)
            .attr('font-size', fontSize)
            //.html(" as world")
            .style("font-size", fontSize)
            .attr('text-anchor', 'end')
            .attr('alignment-baseline', 'right');

        vis.text
            .append('tspan')
            .attr("x", vis.width)
            .attr("dy", "1.2em")
            .html("If same growth");

        vis.text
            .append('tspan')
            .attr("x", vis.width)
            .attr("dy", "1.2em")
            .html("as world");
    }
}