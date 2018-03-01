$.ajaxSetup({

    cache: false
});

var data = []; 

data.push($.getJSON('json/cy-style.json'));
data.push($.getJSON('json/latest.json'));

var cy = window.cy = cytoscape({
    container: $('#cy'),
    style: data[0],
    elements: data[1],
    layout: {
        name: 'cola',
        randomize: true,
        //edgeLength: function (edge) { return 200; },
        infinite: true,
        fit: false
    },
    ready: function(){
        cy.elements().forEach(function (ele) {
            setSize(ele);
            setImage(ele);
            //setQtip(ele);
        });
    }
});

cy.on('tap', 'node', function(evt){
    var node = evt.target;
    
    var ticker = $('.coin-page__symbol');
    var symbol = $('.coin-page__icon-img');

    console.log( 'tapped ' + node.id() );
    console.log(ticker);

    ticker.text(node.id());
    symbol.attr("src", "img/svg/" + node.id().toLowerCase() + ".svg");
    
});


setInterval(function () {

    $.getJSON('json/latest.json', function (data) {

        cy.json({elements: data});
        cy.nodes().forEach(function (ele) {
            setSize(ele);
        });
    });

}, 1900);

function setSize(ele) {

    ele.animate(
        {
            style: {
                width: ele.data('size'), height: ele.data('size') 
            },
            duration: 1000,
            easing: 'ease-in-out'
        }
    );
}

function setImage(ele) {

    var icon = "img/white/" + ele.data('id'.toLowerCase()) + '.png';    
    ele.style('background-color', window.getComputedStyle(document.body, null).getPropertyValue('background-color'));
    ele.style('background-image', icon);
}

/*
    function setQtip(ele)
    {
    ele.qtip({
    content: {
        text: qtipText(ele),
        title: ele.data('id')
    },
    events: {
        render: function (event, api) {
        // Second qTip call which searches for li items within the first tooltips content

        // Metric
        $('#' + ele.data('id')).each(function (sparklineId) {

            var th = $(this),

            // Instead of splitting with "," we are passing the data in JSON format
            // Because splitting may cause getting datas as string
            // And that breaks scale calculators
            // Also this chain clears the HTML content
            data = [
                {
                'date': 'Jan-2014',
                'value': 0
                },
                {
                'date': 'Feb-2014',
                'value': 26
                },
                {
                'date': 'Mar-2014',
                'value': 14
                },
                {
                'date': 'Apr-2014',
                'value': 67
                },
                {
                'date': 'May-2014',
                'value': 54
                },
                {
                'date': 'Jun-2014',
                'value': 100
                },
                {
                'date': 'Jul-2014',
                'value': 90
                },
                {
                'date': 'Aug-2014',
                'value': 60
                }
            ];
            console.log(data);
            var parseDate = d3.time.format("%b-%Y");

            data.forEach(function (d) {
            d.date = parseDate.parse(d.date);
            d.value = +d.value;
            });


            // Get width and height of the container
            var w = th.width(),
            h = th.height(),

            // Setting the margins
            // You may set different margins for X/Y
            xMargin = 10,
            yMargin = 20,

            // Scale functions
            // Setting the range with the margin
            y = d3.scale.linear()
                .domain([0, 100])
                .range([h - yMargin, yMargin]),
            x = d3.time.scale()
                .domain(d3.extent(data, function (d) { return d.date; }))
                .range([xMargin, w - xMargin]),

            // Scale functions for creating the gradient fill/stroke
            // Calculating the color according to data in the range of colors
            // That user has passed with the data-range-[high-low]-color attributes
            gradientY = d3.scale.linear()
                .domain([0, 5, 25, 40, 75, 100]),
            // This is a different margin than the one for the chart
            // Setting the gradient stops from 0% to 100% will cause wrong color ranges
            // Because data points are positioned in the center of containing rect
            percentageMargin = 100 / data.length,
            percentageX = d3.scale.linear()
                .domain([0, data.length - 1])
                .range([percentageMargin, 100 - percentageMargin]),

            // Create S
            container = d3.select(this).append("div"),

            // Create SVG object and set dimensions
            vis = container
                .append("svg:svg")
                .attr("width", w)
                .attr("height", h)

            // Create the group object and set styles for gradient definition
            // Which is about to add in a few lines
            xAxis = vis.append("svg:g")
            .attr("class", "x-axis")
            .attr("transform", "translate(" + 0 + "," + (h - yMargin) + ")")
            .call(
            d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .ticks(data.length)
                .tickSize(-h + (yMargin * 2), 0, 0)
                .tickFormat(d3.time.format("%b"))
            );
            xAxis.selectAll("text")
            .attr("transform", "translate(0,5)")
            .attr("stroke-width", "0");

            yAxis = vis.append("svg:g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + xMargin + "," + 0 + ")")
            .attr("stroke", "black")
            .call(d3.svg.axis()
                .scale(y)
                .orient("left")
                .ticks(4)
                .tickSize(-w + (xMargin * 2), 0, 0)
                .tickFormat(function (d, i) { return d + "%" })
            );

            g = vis.append("svg:g")
            .attr("stroke", "url(#sparkline-gradient-" + sparklineId + ")")
            .attr("fill", "url(#sparkline-gradient-" + sparklineId + ")"),


            // Create the line
            // Using cardinal interpolation because we need
            // The line to pass on every point
            area = d3.svg.area()
                .interpolate("linear")
                .x(function (d, i) { return x(d.date); })
                .y0(h)
                .y1(function (d) { return y(d.value); }),
            line = d3.svg.line()
                .interpolate("linear")
                .x(function (d) { return x(d.date); })
                .y(function (d) { return y(d.value); });




            g.append("svg:path").attr("class", "area").attr("d", area(data)).attr("style", "fill:url(#area-fill)");

            // Create points
            // We are only creating points for first and last data
            // Because that looks cooler :)
            var points = g.selectAll(".point")
            .data(data)
            .enter().append("svg:circle")
            .attr("class", function (d, i) { return (i === (data.length - 1) || i === 0) ? "point end" : "point"; })
            .attr("cx", function (d, i) { return x(d.date) })
            .attr("cy", function (d, i) { return y(d.value) })
            .attr("r", function (d, i) { return (i === (data.length - 1) || i === 0) ? 5 : 3; });

            // Append the line to the group
            g.append("svg:path").attr("d", line(data));

            for (i = 0; i < data.length; ++i) {
            var tooltip = container
                .append("div")
                .attr("class", "chart-tooltip")
                .attr("data-index", i).html(data[i].value + "%");
            $tooltip = $(".chart-tooltip[data-index=" + i + "]");
            $tooltip.data({
                calcY: y,
                calcX: x
            });
            var tooltipLeft = $tooltip.data("calcX")(data[i].date) + ($tooltip.width() / 2);
            var tooltipTop = $tooltip.data("calcY")(data[i].value) - 30;
            // Position it again
            $tooltip.css({
                left: tooltipLeft + "px",
                top: tooltipTop + "px"
            });
            }
            // Create tooltip

            // Bind calculator functions to tooltip


            // Create the gradient effect
            // This is where the magic happens
            // We get datas and create gradient stops with calculated colors
            var defs = vis.append("svg:defs");
            defs.append("svg:linearGradient")
            .attr("id", "sparkline-gradient-" + sparklineId)
            .attr("x1", "0%").attr("y1", "0%").attr("x2", "100%").attr("y2", "0%")
            .attr("gradientUnits", "userSpaceOnUse")
            .selectAll(".gradient-stop")
            .data(data)
            .enter()
            .append("svg:stop").attr('offset', function (d, i) {
                return ((percentageX(i))) + "%";
            }).attr("style", function (d) {
                return "stop-color:#4682B4" + ";stop-opacity:1";
            });
            areaFill = defs.append("svg:linearGradient");
            areaFill.attr("id", "area-fill");
            areaFill.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
            areaFill.append("svg:stop").attr('offset', "0%").attr("style", 'stop-color:#5CACEE;stop-opacity:0.2');
            areaFill.append("svg:stop").attr('offset', "100%").attr("style", 'stop-color:#5CACEE;stop-opacity:0.1');


            // Creating invisible rectangles for a better hover interaction
            // Because otherwise user would need to hover to the line or point
            // Which is a terrible experience
            // Creating full height invisible bars and binding mouse events
            // To do some special stuff like showing data or adding classes to
            // The point in the targeted area

            var rect = g.selectAll(".bar-rect")
            .data(data)
            .enter().append("svg:rect")
            .attr("class", "bar-rect")
            .attr("x", function (d, i) { return x(d.date) - (w / data.length / 2) })
            .attr("y", 0)
            .attr("width", w / data.length)
            .attr("height", h)
            .on("mouseenter", function (d, i) {
                $('.chart-tooltip[data-index=' + i + ']').addClass('hover');
                // Add hover class to the targeted point
                var thisPoint = $(this).parent().parent().find('.point:eq(' + i + ')');
                thisPoint.attr('class', (i === 0 || i === (data.length - 1)) ? 'end point hover' : 'point hover');
            }).on("mouseleave", function (d, i) {
                $('.chart-tooltip').removeClass('hover');
                // Remove hover class from the targeted point
                var thisPoint = $(this).parent().parent().find('.point:eq(' + i + ')');
                thisPoint.attr('class', (i === 0 || i === (data.length - 1)) ? 'end point' : 'point');
            });

            // Helper function to calculate the HTML content of the tooltip
            // Tooltip may contain any HTML
            function formatTooltip(d, i) {
            return '<div class="title">' + d.value + '</div>'
            }
        });
        }

    },
    style: {
        classes: 'qtip-bootstrap'
    },
    position: {
        my: 'bottom center',
        at: 'top center',
        target: ele
    },
    show: {
        event: 'cxttap'
    },
    hide: {
        event: 'mouseout'
    },
    style: {
        classes: 'qtip-bootstrap',
        tip: {
        width: 16,
        height: 8
        }
    }
    });
    }

    function qtipText(node) {

    if (node.isNode()) {
        var balance = 'Balance: ' + node.data('balance');
        var image = '<img src="' + 'img/icon/' + node.data('id') + '.png"' + '" style="float:left;width:48px;height:48px;">';
        return balance + '</p>';
    }
    else {
        data = node.data('id');
        var trade = 'Trade: ' + node.data('trade');

        var div = '<div class="graph" id="' + node.data('id') + '"style="height:120;width:240; "></div>'
        return trade + '<br>' + div;
    }

    }
*/