d3.json("json/chart.json", function(error, dataRaw){
	
	
var chart = document.getElementById("chart");	
var totalWidth = chart.clientWidth;
var totalHeight = chart.clientHeight;

var color = window.getComputedStyle(document.body, null).getPropertyValue('background-color');;
console.log(color);

var margin = { top: 10, left: 50, bottom: 30, right: 50 }

var width = totalWidth - margin.left - margin.right;
var height = totalHeight - margin.top - margin.bottom;


window.addEventListener("resize", function (e) {
	totalWidth = chart.clientWidth;
	totalHeight = chart.clientHeight;

	width = totalWidth - margin.left - margin.right;
	height = totalHeight - margin.top - margin.bottom;
	redrawChart()
});

var formatDecimal = d3.format(',.2f');

var parseDate = d3.timeParse("%Y%m%d"); // 20150630

var outputFormat = d3.timeFormat("%d %b %Y") // 30 June 2015

var dataLoaded = null;

var dataModelJSON = function (d) {
	return {

		date: parseDate(+d.date),
		open: +d.open,
		high: +d.high,
		low: +d.low,
		close: +d.close,
		volume: +d.volume,
		openInt: +d.openInt
	}
};

var data = dataRaw.map(dataModelJSON);

function setData(data) {
	dataLoaded = data;
}

function redrawChart() {
	if (dataLoaded) {
		d3.select("#candle-chart").remove();
		prepareForBuild(dataLoaded);
		buildChart(dataLoaded);
	}
}

var xScale, xLabels, xAxis, yIsLinear, yDomain, yRange, yScale, yAxis;

function prepareForBuild(data) {

	xScale = d3.scaleBand()
		.domain(data.map(function (d) { return d.date; }))
		.range([0, width])
		.paddingInner(0.2)
		.paddingOuter(0)
		.align(0.5)


	xLabels = xScale.domain().filter(function (d, i) {

		if (i === data.length - 1) return d;
		var next;

		if (data[i + 1]) {
			next = data[i + 1].date;
		} else {
			return false;
		}

		var monthA = d.getMonth();
		var monthB = next.getMonth();

		return (monthB > monthA ? d : ((monthB === 0 && monthA === 11) ? d : false));

	});

	xAxis = d3.axisBottom(xScale)
		.tickFormat(outputFormat)
		.tickValues(xLabels);

	yIsLinear = true;
	yDomain = [d3.min(data, d => d.low), d3.max(data, d => d.high)];
	yRange = [height, 0];
	yScale = d3.scaleLinear().domain(yDomain).range(yRange).nice(5);
	yAxis = d3.axisLeft(yScale)
		.ticks(5)
		.tickSizeInner(-width)
		.tickFormat(formatDecimal);
}

function buildChart(data) {

	var svg = d3.select('#chart').append('svg')
		.attr("id", "candle-chart")
		.attr("width", totalWidth)
		.attr("height", totalHeight);

	var mainGroup = svg.append("g")
		.attr("id", "mainGroup")
		.attr("transform", "translate( " + margin.left + ", " + margin.top + ")");


	var xAxisGroup = mainGroup.append("g")
		.attr("id", "xAxis")
		.attr("class", "axis")
		.attr("transform", "translate( " + 0 + "," + height + ")")
		.call(customXAxis);

	function customXAxis(g) {
		g.call(xAxis);
		g.select(".domain").attrs({
		})
		g.selectAll(".tick line")
			.attr("y1", -height)
			.attr("y2", 0)
			.attr("stroke", "#777")
			.attr("display", "none")

	}
	var yAxisGroup = mainGroup.append("g")
		.attr("id", "yAxis")
		.attr("class", "axis")
		.call(customYAxis);

	function customYAxis(g) {
		g.call(yAxis);
		g.selectAll(".tick line")
			.attr("x1", 0)
			.attr("x2", width)
			.attr("display", "none")
		g.selectAll(".tick:first-of-type line").remove()

		g.selectAll(".tick text")
			.attr("x", width + 40);

	}
	var eventGroup = mainGroup.append("g")
		.attr('id', 'event-overlay');

	var crosshair = eventGroup.append("g")
		.attr("id", "crosshair");

	var eventRect = eventGroup.append('rect');

	var canvasGroup = eventGroup.append("g")
		.attr("id", "circleGroup");


	// http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
	function getTextWidth(text, font) {
		var textWidth = 0;
		var context = document.createElement("canvas").getContext("2d");
		context.font = font;
		textWidth = context.measureText(text).width;
		return textWidth;
	}

	var crosshairSettings = {

		xLabelTextOffset: height + 12,
		yLabelTextOffset: +9,
		ylabelWidth: getTextWidth(formatDecimal(yDomain[1]), "10px sans-serif") + 9,
		xlabelWidth: getTextWidth("30 September 2000", "10px sans-serif"),
		labelHeight: 14,
		labelColor: "#aaa",
		labelStrokeColor: "none",
		labelStrokeWidth: "0.5px"


	}

	crosshair.append("line")
		.attrs({
			"id": "focusLineX",
			"class": "focusLine",
		});
	crosshair.append("line")
		.attrs({
			"id": "focusLineY",
			"class": "focusLine",
		});

	crosshair.append("rect") // x label bg
		.attrs({
			"id": "focusLineXLabelBackground",
			"class": "focusLineLabelBackground",
			"fill": crosshairSettings.labelColor,
			"stroke": crosshairSettings.labelStrokeColor,
			"stroke-width": crosshairSettings.labelStrokeWidth,
			"width": crosshairSettings.xlabelWidth,
			"height": crosshairSettings.labelHeight,
		});

	crosshair.append("text")
		.attrs({
			"id": "focusLineXLabel",
			"class": "label",
			"text-anchor": "middle",
			"alignment-baseline": "central"
		});



	var ylabel = crosshair.append("g").attr("id", "yLabelGroup");
	ylabel.append("rect")
		.attrs({
			"id": "focusLineYLabelBackground",
			"class": "focusLineLabelBackground",
			"fill": crosshairSettings.labelColor,
			"stroke": crosshairSettings.labelStrokeColor,
			"stroke-width": crosshairSettings.labelStrokeWidth,
			"width": crosshairSettings.ylabelWidth,
			"height": crosshairSettings.labelHeight,
		});
	ylabel.append("text")
		.attrs({
			"id": "focusLineYLabel",
			"class": "label",
			"text-anchor": "left",
			"alignment-baseline": "central"
		});

	setCrosshair(width, 0);

	var candleSettings = {
		fill: color,
		up: "#67b75b",
		down: "#e66341",
		hover: "#c35500",
		lineMode: false
	};

	canvasGroup.selectAll("line")
		.data(data)
		.enter()
		.append('line')
		.attr("x1", function (d, i) { return xScale(d.date) + xScale.bandwidth() * 0.5 })

		.attr("y1", function (d) { return yScale(d['high']) })
		.attr("x2", function (d, i) { return xScale(d.date) + xScale.bandwidth() * 0.5 })

		.attr("y2", function (d) { return yScale(d['low']) })

		.style("stroke", function (d) {
			return d.close > d.open ? candleSettings.up : candleSettings.down;
		})
		.style("stroke-width", "0.5pt")

	if (xScale.bandwidth() > 1) {
		candleSettings.lineMode = false;
		canvasGroup.selectAll("rect")
			.data(data)
			.enter()
			.append('rect')
			.attrs({
				x: function (d, i) {
					return xScale(d.date);
				},
				y: function (d, i) {
					return d.close < d.open ? yScale(d.high) : yScale(d.low);
				},
				width: xScale.bandwidth(),
				height: function (d, i) {

					var max = yScale(Math.min(d.close, d.open));
					var min = yScale(Math.max(d.close, d.open));
					var diff = max - min;
					return diff || 0.1;
				},
			})
			.styles({

				"fill": function (d) {
					return d.close > d.open ? candleSettings.fill : candleSettings.down;
				},
				"stroke": function (d) {
					return d.close > d.open ? candleSettings.up : "none";
				},
				"stroke-width": "0.5pt",
				"shape-rendering": "geometricPrecision"
			})

	} else {
		candleSettings.lineMode = true
	}

	var els = candleSettings.lineMode ? canvasGroup.selectAll('line') : canvasGroup.selectAll('rect');
	els.on("mouseover", function (d, i) {

		d3.select(this)
			.attrs({
				"cursor": "pointer",
			})
			.styles({
				"fill": function (d) {
					return d.close > d.open ? candleSettings.fill : Brighten(candleSettings.down, 0.25);
				},
				"stroke": function (d) {
					return d.close > d.open ? Brighten(candleSettings.up, 0.25) : "none";
				},
				"stroke-width": "0.5pt",
				"shape-rendering": "geometricPrecision"

			});
		crosshair.style('display', null);
		setCrosshair(
			xScale(d.date) + xScale.bandwidth() * 0.5,
			yScale(d.close));

	})
		.on("mouseout", function (d, i) {

			d3.select(this).attrs({

			})
				.styles({
					"fill": function (d) {
						return d.close > d.open ? candleSettings.fill : candleSettings.down;
					},
					"stroke": function (d) {
						return d.close > d.open ? candleSettings.up : "none";
					},
					"stroke-width": "0.5pt",
					"shape-rendering": "geometricPrecision"
				});
		})

		.transition()
		.duration(1500)
		.ease(d3.easeBackInOut)
		.attr("y", function (d) { return yScale(Math.max(d.close, d.open)); });


	eventRect.attrs(
		{
			'width': width,
			'height': height
		})
		.styles({
			'opacity': 0.0,
			'display': null
		})
		.on('mouseover', function () {
	
			crosshair.style('display', null);

		})
		.on('mouseout', function () {
	
			crosshair.style('display', 'none');

		})
		.on('mousemove', function handleMouseMove() {

			var mouse = d3.mouse(this);

			var x = mouse[0];
			var y = mouse[1];

			setCrosshair(x, y);

		});

	function setCrosshair(x, y) {


		d3.select('#focusLineX')
			.attr('x1', x)
			.attr('y1', 0)
			.attr('x2', x)
			.attr('y2', height + 6);

		d3.select('#focusLineY')
			.attr('x1', -6)
			.attr('y1', y)
			.attr('x2', width)
			.attr('y2', y);

		d3.select("#focusLineXLabel")
			.attr("x", x)
			.attr("y", height + 12)
			.text(outputFormat(xScale.domain()[Math.floor(x / xScale.step())]));

		d3.select("#focusLineXLabelBackground")
			.attr("transform", "translate( " + (x - crosshairSettings.xlabelWidth * 0.5) + " , " + (height + 6) + " )")
			.text(outputFormat(xScale.domain()[Math.floor(x / xScale.step())]));

		d3.select("#focusLineYLabel")
			.attr("transform", "translate( " + (width + 6) + ", " + y + ")")
			.text(formatDecimal(yScale.invert(y)));
		d3.select("#focusLineYLabelBackground")
			.attr("transform", "translate( " + width + ", " + (y - 6) + ")")

	}
}

(function (data) {
	setData(data);
	prepareForBuild(data);
	buildChart(data);
})(data);

});