/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

let ibSankey;
let ibChordDiagram;
let ibChordBarChart;
let ibLineChart;
let ibScatterPlot;
let ibBarChart;

//Read in data and instantiate visualizations
d3.csv("data/ib_data.csv").then(function(data){

    data.forEach(function(d){
        // Convert quantitative values to 'numbers'
        d.Predicted_Grade = +d.Predicted_Grade;
        d.Project_Grade = +d.Project_Grade;
        d.Final_Grade = +d.Final_Grade;

        // Shorten some course names
        if (d.Course == "ENVIRONMENTAL SYSTEMS AND SOCIETIES, SL") {
            d.Course = "ENVIRONMENTAL STUDIES, SL";
        }
        if (d.Course == "ENGLISH A: Language and Literature, HL") {
            d.Course = "ENGLISH, HL";
        }
    });

    // User-friendly translations of data values
    let dataValueMap = new Map([
        ["M", "Male"],
        ["F", "Female"],
        ["H", "Hispanic"],
        ["W", "White"],
        ["B", "Black"],
        ["1", "Disadvantaged"],
        ["0", "Not Disadvantaged"]
        ]
    );

    // Instantiate objects
    ibinitialBarChart = new initialBar("initialbarDiv_world")
    ibSankey = new Sankey("sankeyDiv", data);
    ibChordDiagram = new ChordDiagram("chordDiv", data, dataValueMap);
    ibChordBarChart = new ChordBarChart("chordBarDiv", data);
    ibLineChart = new LineChart("exambarDiv", data);
    ibScatterPlot = new ScatterPlot("scatterDiv_project","scatterDiv_predicted", data);
    ibBarChart = new BarChart("barDiv", data);

});

function chordCategoryChange() {
    ibChordDiagram.wrangleData();
    ibChordBarChart.wrangleData();
}

function sankeyCategoryChange() {
    ibSankey.wrangleData();
}

function scatterCategoryChange() {
    ibScatterPlot.wrangleData();
}

function chordTooltipIn(indep, dep) {
    // Grey out charts
    $(".chord-path").attr("fill-opacity", 0.15).attr("stroke-opacity", 0.15);
    $(".chordBarChartRect").attr("fill-opacity", 0.25);
    $(".chordBarChartText").attr("fill-opacity", 0.25);
    $(".chordLabel").attr("fill-opacity", 0.25);
    $(".chordBorder").attr("fill-opacity", 0.15).attr("stroke-opacity", 0.15);

    // Keep relevant charts visible
    d3.selectAll(`.chord-path-${dep}-${indep}`)
        .attr("fill-opacity", 1);
    d3.selectAll(`.chord-label-${dep + 1}`)
        .attr("fill-opacity", 1);
    d3.selectAll(`.chord-label-${indep + ibChordDiagram.nDep + 3}`)
        .attr("fill-opacity", 1);
    d3.selectAll(`.chord-border-${dep + 1}`)
        .attr("fill-opacity", 1);
    d3.selectAll(`.chord-border-${indep + ibChordDiagram.nDep + 3}`)
        .attr("fill-opacity", 1);
    d3.selectAll(`.chord-g-${indep}`)
        .select(`.chord-rect-${dep}`)
        .attr("fill-opacity", 1);
    d3.selectAll(`.chord-g-${indep}`)
        .select(`.chord-text-${dep}`)
        .attr("fill-opacity", 1);

    // Update label
    let text = "<b>" + ((ibChordDiagram.dataMatrix[dep + 1][indep + ibChordDiagram.nDep + 3] /
        ibChordDiagram.indepFreq.get(indep + 3)) * 100).toFixed(1) + "%</b>";
    text += " of students who are <b>";
    text += ibChordDiagram.valueMap.get(ibChordDiagram.indepInv[indep]).toLowerCase();
    text += "</b> scored a ";
    let outcome = ibChordDiagram.outcomeMap.get(dep).toLowerCase();
    outcome = outcome.slice(0, outcome.length - 6);
    text += "<b>" + outcome + "ing grade</b> in ";
    text += "<b>" + ibChordDiagram.indepYear + "</b>.";

    $("#chord-text").html(text);
}

function chordTooltipOut() {
    // Grey out bar chart
    $(".chordBarChartRect").attr("fill-opacity", 1);
    $(".chordBarChartText").attr("fill-opacity", 1);
    $(".chord-path").attr("fill-opacity", "0.8").attr("stroke-opacity", "0.8");
    $(".chordLabel").attr("fill-opacity", 1);
    $(".chordBorder").attr("fill-opacity", 1).attr("stroke-opacity", 1);;
    $("#chord-text").html("<i>Hover over a segment to find out</i>");
}

function getGradeBin(num) {
    if (0 <= num && num <= 3) {
        return 0;
    } else {
        return 1;
    }
}
