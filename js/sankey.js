

class Sankey {
    // constructor method to initialize Timeline object
    constructor(parentElement, IBData){
        this.parentElement = parentElement;
        this.Data = IBData;
        this.initVis()
    }

    initVis(){
        let vis = this;

        // Define margin sizes
        vis.margin = {top: 60, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.legendHeight = 20
        vis.legendWidth = 150

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", "translate(0,0)");

        // Sankey initialize
        vis.sankey = d3.sankey()
            .nodeId(d => d.name)
            .nodeWidth(5)
            .nodePadding(25)
            .nodeSort(null)
            .extent([[vis.margin.left * 8,vis.margin.top], [vis.width - (vis.margin.right * 6.5), vis.height - (vis.margin.bottom * 2)]]);

        vis.formatNumber = d3.format(",.0f"); // zero decimal places
        vis.format = function(d) { return vis.formatNumber(d); }

        vis.graph;

        vis.nodeList;

        vis.color = ["#7E3C0B", "#D17515", "#FBC47F", "#848484", "#BDBAD9", "#7259A0", "#2D004B"]

        // Counts of each predicted grade to project grade link.
        vis.projectPredictedCount;

        // Counts of each project grade to final grade link.
        vis.predictedFinalCount;

        vis.wrangleData();
    }

    wrangleData(category){
        let vis = this;

        // Reinitializing each variable for each time the year selector changes.
        vis.graph = {"nodes" : [], "links" : []};
        vis.nodeList = [];
        vis.projectPredictedCount = Array(8).fill().map(() => Array(8).fill(0));
        vis.predictedFinalCount = Array(8).fill().map(() => Array(8).fill(0));

        // 2020 indicator variable
        vis.year = $("#sankeyCategorySelector").val();
        vis.yearIndicator;
        if (vis.year === "2020") {
            vis.yearIndicator = "1";
        } else {
            vis.yearIndicator = "0";
        }

        // Getting node names along with count of links from Predicted to Project grades
        // and Projected to Final grades.
        for (let i = 0; i < vis.Data.length; i++) {
            vis.nodeList.push({"name": "Predicted Grade " + vis.Data[i].Predicted_Grade});
            vis.nodeList.push({"name": "Project Grade " + vis.Data[i].Project_Grade});
            vis.nodeList.push({"name": "Final Grade " + vis.Data[i].Final_Grade});
            if (vis.yearIndicator === vis.Data[i]["2020_indicator"]) {
                vis.projectPredictedCount[parseInt(vis.Data[i].Project_Grade)][parseInt(vis.Data[i].Predicted_Grade)] += 1;
                vis.predictedFinalCount[parseInt(vis.Data[i].Predicted_Grade)][parseInt(vis.Data[i].Final_Grade)] += 1;
            }
        }

        // Make the nodes list a set of distinct values.
        vis.nodeList = new Set(vis.nodeList.map(d => d.name));

        // Push the distinct nodes into graph.nodes.
        vis.nodeList.forEach(function(d) {
            let newObj = {};
            newObj["name"] = d;
            vis.graph.nodes.push(newObj);
        });

        // Get the links and their value/thickness based on the 2d arrays we created.
        let idCounter = 1;
        for (let i = 0; i <= 7; i++) {
            for (let j = 0; j <= 7; j++) {
                // Checking to see if any value is present or else we don't make a link
                // from predicted grade to project grade.
                if (vis.projectPredictedCount[i][j] > 0) {
                    vis.graph.links.push({ "source" : "Project Grade " + i,
                        "target" : "Predicted Grade " + j,
                        "value" : vis.projectPredictedCount[i][j],
                        "id" : idCounter});
                    idCounter += 1;
                }
                // Checking to see if any value is present or else we don't make a link
                // from project grade to final grade.
                if (vis.predictedFinalCount[i][j] > 0) {
                    vis.graph.links.push({ "source" : "Predicted Grade " + i,
                        "target" : "Final Grade " + j,
                        "value" : vis.predictedFinalCount[i][j],
                        "id" : idCounter});
                    idCounter += 1;
                }
            }
        }

        // Making sure both nodes and links are objects in order to comply with
        // how d3 sankey library is set up.
        vis.graph.nodes.map(d => Object.assign({}, d));
        vis.graph.links.map(d => Object.assign({}, d));

        // Sort nodes by reverse order so that 7 is at top and 0 at bottom of
        // sankey diagram.
        vis.graph.nodes.sort(function(a, b) {
            if (a.name < b.name) {
                return -1;
            } else if (a.name > b.name) {
                return 1;
            }
            return 0;
        });
        vis.graph.nodes.reverse();

        // Remove visualizations if already present.
        if (vis.link) {
            vis.link.remove();
        }
        if (vis.node) {
            vis.node.remove();
        }
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // Making our graph variable now hold the processed sankey variables.
        vis.graph = vis.sankey(vis.graph);

        // Creating the links between nodes.
        vis.link = vis.svg.append("g").selectAll("link")
            .data(vis.graph.links)
            .enter().append("path")
            .attr("class", "link")
            .attr("id", function(d) { return "link" + d.id; })
            .attr("fill", "none")
            .attr("stroke", "#000")
            .attr("stroke-opacity", 0.15)
            .attr("d", d3.sankeyLinkHorizontal())
            .attr("stroke-width", function(d) { return d.width; })
            .on("mouseover", function(d) {
                let dElement = $(d.srcElement);
                // Separate text to fill in for tooltip.
                let text = dElement[0].textContent.split("N");
                text[1] = "N" + text[1];
                dElement.attr("stroke-opacity", 0.35);
                vis.svg.select("#sankey-path")
                    .text(text[0]);
                vis.svg.select("#sankey-numscores")
                    .text(text[1]);
            })
            .on("mouseout", function(d) {
                $(d.srcElement).attr("stroke-opacity", 0.15);
                vis.svg.select("#sankey-path")
                    .text("");
                vis.svg.select("#sankey-numscores")
                    .text("");
            });

        // Add the link titles.
        vis.link.append("title")
            .text(function(d) {
                return d.source.name + " → " + d.target.name + "\n" + "Number of scores: " + vis.format(d.value);
            });

        // Add in the nodes.
        vis.node = vis.svg.append("g").selectAll(".node")
            .data(vis.graph.nodes)
            .enter().append("g")
            .attr("class", "node")

        // Add the rectangles for the nodes.
        vis.node.append("rect")
            .attr("x", function(d) { return d.x0; })
            .attr("y", function(d) { return d.y0; })
            .attr("height", function(d) { return d.y1 - d.y0; })
            .attr("width", vis.sankey.nodeWidth())
            .style("fill", function(d, i) {
                return d.color = vis.color[i % 8];})
            .attr("stroke", "#000")
            .attr("id", function(d) { return d.name })
            .on("mouseover", function(d) {
                // Get the id/name of this rectangle/node to compare
                // to all the links to find all the associated links to
                // highlight.
                let dName = this.id;
                for (let i = 0; i < vis.graph.links.length; i++) {
                    if (vis.graph.links[i].target.name === dName) {
                        let idName = "#link" + vis.graph.links[i].id;
                        vis.svg.select(idName).attr("stroke-opacity", 0.55);
                    }
                }
            })
            .on("mouseout", function(d) {
                let dName = this.id;
                for (let i = 0; i < vis.graph.links.length; i++) {
                    if (vis.graph.links[i].target.name === dName) {
                        let idName = "#link" + vis.graph.links[i].id;
                        vis.svg.select(idName).attr("stroke-opacity", 0.15);
                    }
                }
            })

        // Add in the title for the nodes.
        vis.node.append("text")
            .attr("x", function(d) { return d.x0 - 6; })
            .attr("y", function(d) {
                // Making sure text doesn't get cut off at top.
                if (d.y0 === 0) {
                    return 7;
                } else {
                    return (d.y1 + d.y0) / 2;
                }
            })
            .attr("dy", "0.35em")
            .attr("text-anchor", "end")
            .text(function(d) { return d.name; })
            .attr("font-family", "sans-serif")
            .attr("font-size", 16)
            .filter(function(d) { return d.x0 < vis.width / 2; })
            .attr("x", function(d) { return d.x1 + 6; })
            .attr("text-anchor", "start");

        // Tooltip text
        vis.tooltipText = vis.svg.append("g");
        vis.tooltipText.append("text")
        vis.tooltipText.append("text")
            .attr("id", "sankey-path")
            .text("")
            .style("font-size", "18px")
            .attr("transform", "translate(" + 100 + ", 20)");
        vis.tooltipText.append("text")
            .attr("id", "sankey-numscores")
            .text("")
            .style("font-size", "18px")
            .attr("transform", "translate(" + 100 + ", 45)");
    }
}