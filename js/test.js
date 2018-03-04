$.ajaxSetup({

    cache: false
});

var data = [];

data.push($.getJSON('json/cy-style.json'));
data.push($.getJSON('json/latest.json'));

var tickers = {};

var total_usd = 0;
var date;

var nameTicker = $('.coin-page__name');
var symbolTicker = $('.coin-page__symbol');
var iconTicker = $('.coin-page__icon-img');
var totalTicker = $('#total');
var balanceTicker = $('#balance');
var balanceUSDTicker = $('#balanceUSD');
var balanceBTCTicker = $('#balanceBTC');
var dateTicker = $('#date');

var onNodes = [];
var onNode = null;
var animationLength = 500;
var names = {};



/*

function update() {

    var cy = window.cy = cytoscape({
        container: $('#cy'),
        style: data[0],
        elements: data[1],
        layout: {
            name: 'cola',
            randomize: true,
            edgeLength: function (edge) { return 200; },
            infinite: true,
            fit: false
        },
        ready: function () {
    
            cy.elements().forEach(function (ele) {
                setSize(ele);
                setImage(ele);
                //setQtip(ele);
            });
        }
    });
}

function render() {

}

function loop(timeStep) {
    var progress = timeStep - lastStep;

    update(progress);
    render();

    lastStep = timestep;

    window.requestAnimationFrame(loop);
}

var lastStep = 0;
window.requestAnimationFrame(loop);
*/

$( function() {

    //$.getJSON('json/crypto.json', function (data) {
    //    $.each(data, function(key, data) {
    //       console.log(key[5]);
    //        tickers.push([key, data]);
    //    });
    //});

    //console.log(tickers);

var cy = window.cy = cytoscape({
    container: $('#cy'),
    style: data[0],
    elements: data[1],
    layout: {
        name: 'cola',
        randomize: true,
        edgeLength: function (edge) { return 200; },
        infinite: true,
        fit: true
    },
    ready: function () {

        cy.elements().forEach(function (ele) {
            setSize(ele);
            setImage(ele);
            //setQtip(ele);
        });
    }
});

var d = {};

$.ajax({
    async: false,
    type: "GET",
    url: "json/crypto.json",
	dataType: "json",
    success: function(data)
    {
		names = data;
        //for (var key in data) {
        //    d[key] = data[key];
        //    //console.log(d[key]);    
        //}
		
    }
});


cy.on('tap', 'node', function (evt) {
    onNode = evt.target;

    updateTicker(onNode);
	
	

});

cy.on('cxttap', 'node', function (event) {
    var eventTarget = event.target;
	updateTicker(eventTarget);
	if (onNodes.includes(eventTarget)) {
		var index = onNodes.indexOf(eventTarget);
		onNodes.splice(index, 1);
		eventTarget.css({
			'pie-1-background-opacity': 0,
		});
	} else {
		onNodes.push(eventTarget);
		updateNodes();
		
	}
});

setInterval(updateData, 500);

});

function updateData() {
    $.getJSON('json/latest.json', function (data) {
        total_usd = data['global']['total_usd'];
        date = data['global']['date'];
    
    
        cy.json({ elements: data });
        cy.nodes().forEach(function (ele) {
            setSize(ele);
        });
		change(getData());
        updateNodes();
        updateTicker(onNode);

    });

    $.getJSON('json/crypto.json', function (data) {
    
        if(onNode !== null) {
            var id = onNode.data('id')
        }        
        
        //var cache = $(nameTicker).children();
        //nameTicker.text(data[id]).append(cache);
    
    });

}

function updateNodes() {
    for (var i = 0; i < onNodes.length; i++) {
        onNodes[i].css({
            'pie-1-background-opacity': 0.8,
            'pie-1-background-color': '#1e2b34',
            'pie-1-background-size': 100 - 100 * onNodes[i].data('balance_usd') / total_usd

        });

    }
}

function updateTicker(node) {

    balanceTicker.text(round(node.data('balance'), 8));
    balanceUSDTicker.text(round(node.data('balance_usd'), 2));

    
    dateTicker.text(date.toString());
    totalTicker.text("$" + round(total_usd, 2));
	
	symbolTicker.text(node.id());
    iconTicker.attr("src", "img/black/" + node.id().toLowerCase() + ".png");
	
	var cache = $(nameTicker).children();
	var id = node.data('id').toString();
    nameTicker.text(names[id]).append(cache);


}

function setSize(ele) {

    ele.animate(
        {
            style: {
                width: ele.data('size'), height: ele.data('size')
            },
            duration: animationLength / 2,
            easing: 'ease-in-out-sine'
        }
    );
}

function setImage(ele) {

    var icon = "img/white/" + ele.data('id'.toLowerCase()) + '.png';
    ele.style('background-image', icon);
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }