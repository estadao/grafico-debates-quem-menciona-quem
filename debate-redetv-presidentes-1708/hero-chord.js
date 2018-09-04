/*
TO DO:
Implement in d3 v4
*/

// This viz is an "adaptation" (read as "copy-paste with slight style changes") of https://www.visualcinnamon.com/2015/08/stretched-chord.html

////////////////////////////////////////////////////////////
//////////////////////// Set-up ////////////////////////////
////////////////////////////////////////////////////////////

var screenWidth = $(window).width(),
  mobileScreen = (screenWidth > 400 ? false : true);

var margin = {left: 50, top: 10, right: 50, bottom: 10},
  width = Math.min(screenWidth, 800) - margin.left - margin.right,
  height = (mobileScreen ? 300 : 450) - margin.top - margin.bottom;

var svg = d3.select("#chart").append("svg")
      .attr("id","mySvg")
      .attr("width", (width + margin.left + margin.right))
      .attr("height", (height + margin.top + margin.bottom));
      
var wrapper = svg.append("g").attr("class", "chordWrapper")
      .attr("id", "myWrapper")
      .attr("transform", "translate(" + (width / 2 + margin.left) + "," + (height / 2 + margin.top) + ")");;
      
var outerRadius = Math.min(width, height) / 2  - (mobileScreen ? 5 : 100),
  innerRadius = outerRadius * 0.95,
  opacityDefault = 0.7, //default opacity of chords
  opacityLow = 0.03;


/* 
Note that the first half of the labels stands for a candidate that mentions someone,
while the second stands for a candidate that is mentioned by someone.
Also, a first group entry can't be connected to a second group entry,
and the opposite is also true.

The dummy "" elements serve as placeholders. They have only connection values between themselves.
They only serve to separe the two slices/categories of the chart.
*/


var lessRound = .9
var moreRound = .1

 //Total number of mentions (i.e. the number that makes up the group)
var mentions = 62; // TO DO - make dependent on the sum of the matrix
//What % of the circle should become empty in comparison to the visible arcs
var emptyPerc = lessRound;
//How many "units" would define this empty percentage
var emptyStroke = Math.round(mentions * emptyPerc);
// The ammount of degrees we need to rotate the slices to make them horizontal
var offset = Math.PI * (emptyStroke/(mentions + emptyStroke)) / 2;
//How many pixels should the slices be pulled from the center
var pullOutSize = (mobileScreen? 1 : 15);

var Names = ['Álvaro Dias',
 'Cabo Daciolo',
 'Ciro',
 'Alckmin',
 'Boulos',
 'Meirelles',
 'Bolsonaro',
 'Marina',
 '',
 'Marina ',
 'Bolsonaro ',
 'Meirelles ',
 'Boulos ',
 'Alckmin ',
 'Ciro ',
 'Cabo Daciolo ',
 'Álvaro Dias ',
 '']
 
var matrix = [[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 1, 1, 2, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 0, 0, 1, 0, 2, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 3, 0, 2, 2, 1, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 5, 0, 0, 1, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 8, 0, 3, 1, 1, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 3, 1, 1, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, emptyStroke, 0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 2, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [1, 2, 4, 3, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 0, 3, 1, 5, 8, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [1, 1, 1, 0, 0, 0, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [0, 1, 0, 2, 0, 0, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [1, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
 [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, emptyStroke]];
//   .padding(.02)
//   // .sortSubgroups(d3.descending) // sort the chords inside an arc from high to low
//   // .sortChords(d3.descending) // which chord should be shown on top when chords cross. Now the biggest chord is at the bottom
//   .matrix(matrix);

// Call the custom layout function instead of d3.layout.chord()
var chord = customChordLayout()
    .padding(.02)
    .sortChords(d3.descending)
    .matrix(matrix);

//Include the offset in the start and end angle to 
//rotate the chord diagram clockwise
function startAngle(d) { return d.startAngle + offset; }
function endAngle(d) { return d.endAngle + offset; }

//startAngle and endAngle now include the offset in degrees
var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(outerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle);

var path = stretchedChord()
    .radius(innerRadius)
    .startAngle(startAngle)
    .endAngle(endAngle)
    .pullOutSize(pullOutSize);
  
// This is the color scale
var fill = d3.scale.ordinal()
    .domain(d3.range(Names.length))
    .range(["#00A0B0","#CC333F","#EDC951","EFEFEF", "#EDC951","#CC333F","#00A0B0", "#EFEFEF"]); // Gray for the mentioned ones, colorful for the metioninß g ones

////////////////////////////////////////////////////////////
//////////////////// Draw outer Arcs ///////////////////////
////////////////////////////////////////////////////////////

var g = wrapper.selectAll("g.group")
  .data(chord.groups) // This is an atribute of the object created using d3.layout.chord()
  .enter().append("g")
  .attr("class", "group") 
  .on("mouseover", fade(opacityLow))
  .on("mouseout", fade(opacityDefault));

g.append("path")
  .style("stroke", function(d,i) {
    if (Names[i] === "") {
      return "none"
    }
    else {
      return "#5B859C"
    }
  })
  .style("fill", function(d,i) {
    if (Names[i] === "") {
      return "none"
    }
    else {
      return "#5B859C"
    }
  })
  .attr("d", arc)
  .attr("transform", function(d, i) {
          //The pullOutSize should be added to the arcs on the right and
          //subtracted from the arcs on the left
          //Therefore check of the starting angle is larger than half of
          //a circle to figure out when to flip between these two options
          //Save the pullOutSize in the data so it can be use again for
          //the text in a following step
          //The 0.01 is for rounding errors
          d.pullOutSize = pullOutSize * ( d.startAngle + 0.01 > Math.PI ? -1 : 1);
          return "translate(" + d.pullOutSize + ',' + 0 + ")";
      });


////////////////////////////////////////////////////////////
////////////////////// Append Names ////////////////////////
////////////////////////////////////////////////////////////

//The text needs to be rotated with the offset in the clockwise direction
g.append("text")
    .each(function(d) { d.angle = ((d.startAngle + d.endAngle) / 2) + offset;})
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) {
        return d.angle > Math.PI ? "end" : null;
    })
    .attr("transform", function(d,i) {
        var c = arc.centroid(d);
        //First move the arc pullOutSize away from the original location
        //along a horizontal line
        return "translate(" + (c[0] + d.pullOutSize) + "," + c[1] + ")"
        //Still the same
        + "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
        //Changed because of the first translate already applied.
        //How far should the label be placed away from the arc itself
        + "translate(" + 8 + ",0)"
        //Still the same
        + (d.angle > Math.PI ? "rotate(180)" : "")
    })
    .text(function(d,i) { return Names[i]; });
////////////////////////////////////////////////////////////
//////////////////// Draw inner chords /////////////////////
////////////////////////////////////////////////////////////

  // Tooltip
  var tip = d3.select("#chart").append("div")
    .attr('class', 'tip')
    .style("top", height + "px")
    .style("left", margin.left + "px")
    .style("visibility", "hidden");

// // A gradient definition
// var defs = svg.append("defs");

// var gradient = defs.append("linearGradient")
//    .attr("id", "svgGradient")
//    .attr("x1", "0%")
//    .attr("x2", "100%")
//    .attr("y1", "0%")
//    .attr("y2", "100%");

// gradient.append("stop")
//    .attr('class', 'start')
//    .attr("offset", "0%")
//    .attr("stop-color", "#006194")
//    .attr("stop-opacity", 1);

// gradient.append("stop")
//    .attr('class', 'end')
//    .attr("offset", "100%")
//    .attr("stop-color", "#bcced8")
//    .attr("stop-opacity", .2);

 
var chords = wrapper.selectAll("path.chord")
  .data(chord.chords)
  .enter().append("path")
  .attr("class", "chord")
  .attr("id", function(d){return d.source.subindex})
  .style("stroke", "none")
  .style("fill", "#e4e4e4")
  .style("opacity", function(d) { return (Names[d.source.index] === "" ? 0 : opacityDefault); })
  .style("visibility", function(d) { return (Names[d.source.index] === "" ? "hidden" : "visible"); })
  .attr("d", path)
  .on("mouseover", function(d){
    var self = this;

    var others = d3.selectAll('path.chord')
      .filter(function (x) { return self != this; })
      .transition("fadeOnArc")
      .style("opacity", opacityLow);

    tip.style("visibility", "visible")
    .html(function() {
      return "<span style='color:#006194'><strong>" + [Names[d.target.index] + "</strong></span>", "mencionou", "<span style='color:#5B859C'><strong>" + Names[d.source.index] + "</strong></span>", Math.round(d.source.value), "vezes",].join(" ");
    });
  })
  .on("mouseout", function(d){
    d3.selectAll('path.chord')
      .transition("fadeOnArc")
      .style("opacity", opacityDefault);

    tip.style("visibility", "hidden");
  });

////////////////////////////////////////////////////////////
///////////////////////// Title element ////////////////////
////////////////////////////////////////////////////////////

//Chords
chords.append("title")
  .text(function(d) {
    return [Names[d.target.index], "mencionou",  Names[d.source.index], Math.round(d.source.value), "vezes",].join(" "); 
  });

////////////////////////////////////////////////////////////
///////////////////////// Extra functions ////////////////////
////////////////////////////////////////////////////////////

// Returns an event handler for fading a given chord group
function fade(opacity) {
  return function(d, i) {
  svg.selectAll("path.chord")
    .filter(function(d) { return d.source.index !== i && d.target.index !== i && Names[d.source.index] !== ""; })
    .transition("fadeOnArc")
    .style("opacity", opacity);
  };
}//fade