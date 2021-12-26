

class ChordDiagram {
    // Constructor method to initialize Timeline object
    constructor(parentElement, IBData, valueMap){
        this.parentElement = parentElement;
        this.Data = IBData;
        this.valueMap = valueMap;

        // Outcome map
        this.outcomeMap = new Map([[0, "Fail (0-3)"], [1, "Pass (4-7)"]]);
        this.initVis()
    }

    initVis(){
        let vis = this;

        //Define margin sizes
        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;
        vis.padding = 150;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.width)
            .append("g")
            .attr('transform', `translate (${vis.width / 2}, ${vis.width / 2})`);

        // Color scale for arcs
        vis.colors = ["#B6B1D5", "#FCBD74"]

        // Create chord
        vis.chord = d3.chord()
            .padAngle(0.05)
            .sortSubgroups(d3.descending);

        vis.wrangleData()
    }

    wrangleData(){
        let vis = this

        // Data field for LHS
        vis.indepVar = $("#chordCategorySelector").val();

        // Data year
        vis.indepYear = $("#chordYearSelector").val();

        // Data field for RHS
        vis.depVar = "Final_Grade";

        // Iterate through data to find range of values
        vis.indepIdx = new Map();
        vis.indepArr = [];

        let indepNum = 3;

        // Count frequencies of LHS values
        vis.indepFreq = new Map();

        // Deep copy data
        vis.binnedData = JSON.parse(JSON.stringify(this.Data));

        // Consolidate data
        vis.binnedData = this.binnedData.map((d) => {
            d["Final_Grade"] = d["Final_Grade"] < 4 ? 0 : 1;
            return d;
        });

        // Filter data
        vis.binnedData = vis.binnedData.filter((d) => {
            if (vis.indepYear == 2020 && d["2020_indicator"] == "1") {
                return true;
            }
            if (vis.indepYear == 2019 && d["2020_indicator"] == "0") {
                return true;
            }
            return false;
        });

        vis.binnedData.forEach((d) => {
            // Set indices of LHS value
            if (!vis.indepIdx.has(d[vis.indepVar])) {
                vis.indepIdx.set(d[vis.indepVar], indepNum);
                vis.indepArr.push(d[vis.indepVar]);
                indepNum++;
            }

            // Count frequencies
            let idx = vis.indepIdx.get(d[vis.indepVar]);

            if (!vis.indepFreq.has(idx)) {
                vis.indepFreq.set(idx, 1);
            } else {
                vis.indepFreq.set(idx, vis.indepFreq.get(idx) + 1);
            }
        });

        // Invert LHS variable
        vis.indepInv = Array.from(vis.indepIdx, ([c, i]) => (c));

        // Dimension of data array
        vis.nIndep = vis.indepIdx.size;
        vis.nDep = 2;
        let n = vis.nIndep + vis.nDep + 4;

        // Record indices of separation values
        vis.sepIdx = [0, vis.nDep + 1, vis.nDep + 2, n - 1];

        // Form data matrix showing flow
        vis.dataMatrix = [];

        for (let i = 0; i < n; i++) {
            vis.dataMatrix.push(Array(n).fill(0));
        }

        vis.binnedData.forEach((d) => {
            // Take care for dummy bins
            vis.dataMatrix[vis.indepIdx.get(d[vis.indepVar]) + vis.nDep][d[vis.depVar] + 1]++;
            vis.dataMatrix[d[vis.depVar] + 1][vis.indepIdx.get(d[vis.indepVar]) + vis.nDep]++;
        });

        // Add dummy data for separation
        let sepAmt = 0;
        vis.indepFreq.forEach((d) => { sepAmt += d});
        sepAmt /= 4;

        vis.dataMatrix[0][n - 3 - vis.nIndep] = sepAmt;
        vis.dataMatrix[n - 3 - vis.nIndep][0] = sepAmt; // Extra factor to account for padding?
        vis.dataMatrix[n - 2 - vis.nIndep][n - 1] = sepAmt;
        vis.dataMatrix[n - 1][n - 2 - vis.nIndep] = sepAmt;

        // Remove existing visualization
        if (vis.arcs) {
            vis.arcs.remove();
        }
        if (vis.groups) {
            vis.groups.remove();
        }
        vis.updateVis();
    }

    updateVis(){
        let vis = this;

        // Bind chord to data
        vis.newChord = vis.chord(vis.dataMatrix);

        // Add group for regions
        vis.groups = vis.svg.datum(vis.newChord)
            .append("g")
            .selectAll("g")
            .data((d) => { return d.groups; });

        vis.groups = vis.groups
            .enter()
            .append("g");

        // Add labels
        vis.groups
            .append("g")
            .attr("transform", (d) => {
                // Get angle at center of arc
                let avgAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;

                // Shift angle
                avgAngle = avgAngle - (Math.PI / 2);
                avgAngle = avgAngle % (2 * Math.PI);

                // Get r
                let r = (vis.width / 2) - (7 * vis.padding / 8);

                // Convert polar to Cartesian
                let x = r * Math.cos(avgAngle);
                let y = r * Math.sin(avgAngle);

                // Get angle of rotation
                let rotAngle = ((d.endAngle - d.startAngle) / 2) + d.startAngle;
                rotAngle = rotAngle * 180 / Math.PI;

                // Add 90 regrees
                rotAngle += 90;
                rotAngle %= 360;
                if (d.index < vis.nDep + 1) {
                    rotAngle += 180;
                }
                // Translate
                return "translate(" + x + ", " + y + ") rotate(" + rotAngle + ")";
            })
            .append("text")
            .attr("class", (d, i) => { return `chordLabel chord-label-${i}`; })
            .transition()
            .attr("text-anchor", (d) => {
                if (d.index < vis.nDep + 1) {
                    return "start";
                }
                else {
                    return "end";
                }
            })
            .text((d) => {
                if (vis.sepIdx.includes(d.index)) {
                    return "";
                }
                else if (d.index >= vis.nDep + 1) {
                    return vis.valueMap.get(vis.indepArr[d.index - vis.nDep - 3]);
                }
                else {
                    return vis.outcomeMap.get(d.index - 1);
                }
            });

        // Add border
        vis.groups
            .append("g")
            .append("path")
            .transition()
            .style("fill", (d) => {
                if (vis.sepIdx.includes(d.index)) {
                    return "none";
                }
                return "grey";
            })
            .style("stroke", (d) => {
                if (vis.sepIdx.includes(d.index)) {
                    return "none";
                }
                return "black";
            })
            .attr("class", (d, i) => { return `chordBorder chord-border-${i}`; })
            .attr("d", d3.arc()
                .innerRadius(vis.width / 2 - 10 - vis.padding)
                .outerRadius(vis.width / 2 - vis.padding));

        // Add arcs
        vis.arcs = vis.svg.datum(vis.newChord)
            .append("g")
            .selectAll("path")
            .data((d) => { return d; });

        vis.arcs = vis.arcs
            .enter()
            .append("path");

        vis.arcs
            .transition()
            .attr("class", (d) => { return `chord-path chord-path-${d.source.index - 1}-${d.target.index - vis.nDep - 3}`; })
            .attr("d", d3.ribbon()
                .radius((vis.width / 2) - 10 - vis.padding))
            .style("fill", (d, i) => {
                if (vis.sepIdx.includes(d.source.index)) {
                   return "none";
                }
                return vis.colors[d.source.index - 1];
            })
            .style("stroke", (d) => {
                if (vis.sepIdx.includes(d.source.index)) {
                    return "none";
                }
                return "black";
            })
            .attr("fill-opacity", "0.8")
            .attr("stroke-opacity", "0.8");

        // Hover behavior
        vis.arcs
            .on("mouseover", (d, i) => {
                // Filter out separation
                if (vis.sepIdx.includes(i.source.index)) {
                    return;
                }
                // Adjust opacities
                let end = i.source.index - 1;
                let start = i.target.index - vis.nDep - 3;
                chordTooltipIn(start, end);
            })
            .on("mouseout", (d, i) => {
                // Restore opacities
                chordTooltipOut();
            });
    }
}