

class ScatterPlot {
    // Constructor method to initialize Timeline object
    constructor(parentElement_1, parentElement_2, IBData){
        this.parentElement_1 = parentElement_1;
        this.parentElement_2 = parentElement_2;
        this.Data = IBData;
        this.initVis()
    }

    initVis(){
        let vis = this;

        // Append tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip scattertooltip")

        // Set margin
        vis.margin = {top: 35, right: 25, bottom: 65, left: 100};

        // Set width and height
        vis.width = $('#' + vis.parentElement_1).width() - vis.margin.left - vis.margin.right;
        vis.height = $('#' + vis.parentElement_1).height() - vis.margin.top - vis.margin.bottom;

        // SVG drawing areas
        vis.svg_project = d3.select("#" + vis.parentElement_1).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.svg_predicted = d3.select("#" + vis.parentElement_2).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleLinear()
            .domain([-0.2,7])
            .range([0, vis.width])

        vis.y = d3.scaleLinear()
            .domain([-0.2,7])
            .range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)

        vis.svg_project.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis)

        vis.svg_predicted.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis)

        vis.svg_project.append("g")
            .attr("class", "y-axis axis")
            .call(vis.yAxis)

        vis.svg_predicted.append("g")
            .attr("class", "y-axis axis")
            .call(vis.yAxis)

        // Append line to show the well-predicted scores
        vis.svg_project.append('line')
            .attr('x1',vis.x(-1))
            .attr('x2',vis.x(7))
            .attr('y1',vis.y(-1))
            .attr('y2',vis.y(7))
            .attr('stroke','gray')
            .attr('stroke-width',5)

        // Append line to show the well-predicted scores
        vis.svg_predicted.append('line')
            .attr('x1',vis.x(-1))
            .attr('x2',vis.x(7))
            .attr('y1',vis.y(-1))
            .attr('y2',vis.y(7))
            .attr('stroke','gray')
            .attr('stroke-width',5)

        // x-axis label
        vis.svg_project.append("g")
            .attr("transform", "translate("+(vis.width/2)+"," + (vis.height+50) + ")")
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .text("Project Grades")

        vis.svg_predicted.append("g")
            .attr("transform", "translate("+(vis.width/2)+"," + (vis.height+50) + ")")
            .append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .text("Teacher Predicted Grades")

        // y-axis label
        vis.svg_project.append("g")
            .attr("transform", "translate(-50,"+(vis.height/2)+")")
            .append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Final Course IB Scores");

        vis.svg_predicted.append("g")
            .attr("transform", "translate(-50,"+(vis.height/2)+")")
            .append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .text("Final Course IB Scores");

        // Initialize display data
        vis.displayData_project = []
        vis.displayData_predicted = []

        // Possible IB scores and other scores
        vis.IBScores = [0,1,2,3,4,5,6,7]
        vis.OtherScores = [0,1,2,3,4,5,6,7]

        // Initialize display data with scores
        vis.IBScores.forEach(function(score){

            //Loop over possible Project/Predicted scores
            vis.OtherScores.forEach(function(other_score){

                vis.displayData_project.push({
                    Final_Grade: score,
                    Project_Grade: other_score,
                    count: 0
                })

                vis.displayData_predicted.push({
                    Final_Grade: score,
                    Predicted_Grade: other_score,
                    count: 0
                })
            })
        })

        // Initialize color scale
        vis.colorscale = d3.scaleDiverging()
            .domain([-3, 0, 3])
            .interpolator(d3.interpolatePuOr)

        // Scale for circle size
        vis.circle_scale = d3.scaleSqrt()
            .domain([0, 1])
            .range([0, 100])

        // Legend for circle size
        vis.legend_values = [0.01, 0.05, 0.20]
        vis.legend_height = 120
        vis.legend_width = 175
        vis.legend_x = 50
        vis.legend_y = 100

        vis.svg_legend = d3.select('#circleLegend')
            .append("svg")
            .attr("height", vis.legend_height)
            .attr("width", vis.legend_width)

        // Draw legend circles
        vis.svg_legend.selectAll("legend")
            .data(vis.legend_values)
            .enter()
            .append("circle")
            .attr("class", "legend")

            // Set legend circle attributes
            .attr("cy", d => vis.legend_y - vis.circle_scale(d))
            .attr("cx", vis.legend_x)
            .attr("r", d => vis.circle_scale(d))
            .attr("stroke", "black")
            .attr('stroke-width', '2px')
            .style("fill", "none")

        // Draw legend lines
        vis.svg_legend.selectAll("legend")
            .data(vis.legend_values)
            .enter()
            .append("line")
            .attr("class", "legend")

            // Set line attributes
            .attr('x1', d => vis.legend_x + vis.circle_scale(d))
            .attr('y1', d => vis.legend_y - vis.circle_scale(d))
            .attr('x2', 120)
            .attr('y2', d => vis.legend_y - vis.circle_scale(d))
            .attr('stroke', 'black')
            .style('stroke-dasharray', ('3,3'))

        // Draw legend labels
        vis.svg_legend.selectAll("legend")
            .data(vis.legend_values)
            .enter()
            .append("text")
            .attr("class", "legend")

            //Set legend label attributes
            .attr('x', 125)
            .attr('y', d => vis.legend_y - vis.circle_scale(d) )
            .text( d => (d*100) + '%' )
            .style("font-size", 15)
            .attr('alignment-baseline', 'middle')
        vis.wrangleData()
    }

    wrangleData(category){
        let vis = this;

        // Classes with best overexam performance
        vis.over_exam = ['BIOLOGY, SL','HISTORY, HL','MATH.STUDIES, SL','ENGLISH A: Language and Literature, HL','Biology, HL']

        // Get Year
        vis.year = $("#scatterYearSelector").val();

        // Get Subjects to be displayed
        vis.subject_trigger = $("#scatterSubjectSelector").val();

        // Filter data according to selected year and subjects
        vis.filteredData = vis.Data.filter(function(score){
            // Get filtering by course if selected
            if (vis.subject_trigger === "filter"){
                console.log('triggered')
                return score['2020_indicator'] === vis.year && vis.over_exam.includes(score.Course)
            } else { //Otherwise, return filtering through all courses
                return score['2020_indicator'] === vis.year
            }
        })

        // Refresh display data (set all counts to zero)
        vis.displayData_project.map(function(x) {
            x.count = 0;
            return x
        })

        // Refresh display data (set all counts to zero)
        vis.displayData_predicted.map(function(x) {
            x.count = 0;
            return x
        })

        // Get counts by Final Grades for projects
        d3.rollups(vis.filteredData, v => v.length, d => d.Final_Grade, d => d.Project_Grade)
            // For each final grade
            .forEach(function(final_grade){
                // For each other grade (project or predicted grade)
                final_grade[1].forEach(function(entry){
                        vis.displayData_project.find(d => d.Final_Grade === final_grade[0] && d.Project_Grade === entry[0]).count = entry[1]
                })
            })

        // Get counts by Final Grades for projects
        d3.rollups(vis.filteredData, v => v.length, d => d.Final_Grade, d => d.Predicted_Grade)
            // For each final grade
            .forEach(function(final_grade){
                // For each other grade (project or predicted grade)
                final_grade[1].forEach(function(entry){
                    vis.displayData_predicted.find(d => d.Final_Grade === final_grade[0] && d.Predicted_Grade === entry[0]).count = entry[1]
                })
            })

        // Store amount of student scores that year
        vis.sample_size = d3.sum(vis.displayData_project, d => d.count)
        vis.updateVis()
    }

    updateVis(){
        let vis = this;

        // Data-join (circle now contains the update selection)
        vis.circle_project = vis.svg_project.selectAll(".project_circles")
            .data(vis.displayData_project)

        // Append circles
        vis.circle_project.enter()
            .append("g")
            .append("circle")
            .attr("class", "project_circles")
            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.circle_project)
            // Tooltip properties
            .on('mouseover', function(event, d){
                // Make all circles more transparent
                d3.selectAll(".project_circles").style("opacity", 0.3)

                // Bolden stroke and make opacity 1
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .style("opacity", 1)

                // Add a div for tooltip and move with mouse
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 5px">
                             <h6> <b>Project Grade: ${d.Project_Grade}</b><h6>
                             <h6> <b>Final IB Grade: ${d.Final_Grade}</b><h6>
                             <h6> <b>Percent of Cohort: ${(100 * d.count / vis.sample_size).toFixed(1)}%</b><h6>
                         </div>`
                    );
            })

            // Reset tooltip settings on mouseout
            .on('mouseout', function(event, d){
                //Return transparency
                d3.selectAll(".project_circles").style("opacity", 1)
                d3.select(this)
                    .attr('stroke-width', '0px')
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })

            // Set attributes
            .transition().duration(1000)
            .attr("cx", d => vis.x(d.Project_Grade))
            .attr("cy", d => vis.y(d.Final_Grade))
            .attr("r", function(d){
                //Don't show matching scores
                if (d.Final_Grade === d.Project_Grade) {
                    return 0
                } else { //Show mismatched scores as percent out of total score count
                    return vis.circle_scale(d.count / vis.sample_size)
                }
            })
            .attr("fill", d => vis.colorscale(d.Final_Grade - d.Project_Grade))
        // Exit
        vis.circle_project.exit().remove();

        // Do the same thing, but now for the teacher predicted grades graphic
        // Data-join (circle now contains the update selection)
        vis.circle_predicted = vis.svg_predicted.selectAll(".predicted_circles")
            .data(vis.displayData_predicted)

        // Append circles
        vis.circle_predicted.enter()
            .append("g")
            .append("circle")
            .attr("class", "predicted_circles")

            // Enter and Update (set the dynamic properties of the elements)
            .merge(vis.circle_predicted)

            // Tooltip properties
            .on('mouseover', function(event, d){
                // Make all circles more transparent
                d3.selectAll(".predicted_circles").style("opacity", 0.3)

                // Bolden stroke and make opacity 1
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .style("opacity", 1)

                // Add a div for tooltip and move with mouse
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 5px">
                             <h6> <b>Predicted Grade: ${d.Predicted_Grade}</b><h6>
                             <h6> <b>Final IB Grade: ${d.Final_Grade}</b><h6>
                             <h6> <b>Percent of Cohort: ${(100 * d.count / vis.sample_size).toFixed(1)}%</b><h6>
                         </div>`
                    );
            })
            // Reset tooltip settings on mouseout
            .on('mouseout', function(event, d){
                // Return transparency
                d3.selectAll(".predicted_circles").style("opacity", 1)

                d3.select(this)
                    .attr('stroke-width', '0px')

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            // Set attributes
            .transition().duration(1000)
            .attr("cx", d => vis.x(d.Predicted_Grade))
            .attr("cy", d => vis.y(d.Final_Grade))
            .attr("r", function(d){
                //Don't show matching scores
                if (d.Final_Grade === d.Predicted_Grade) {
                    return 0
                } else { //Show mismatched scores as percent out of total score count
                    return vis.circle_scale(d.count / vis.sample_size)
                }
            })
            .attr("fill", d => vis.colorscale(d.Final_Grade - d.Predicted_Grade))
        // Exit
        vis.circle_predicted.exit().remove();
    }
}