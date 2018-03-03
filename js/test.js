$.ajaxSetup({

    cache: false
});

var data = [];

data.push($.getJSON('json/cy-style.json'));
data.push($.getJSON('json/latest.json'));
var total_usd = 0;
var date;

var ticker = $('.coin-page__symbol');
var symbol = $('.coin-page__icon-img');
var balanceTicker = $('#balance');
var balanceUSDTicker = $('#balanceUSD');
var balanceBTCTicker = $('#balanceBTC');
var dateTicker = $('#date');

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

var onNode = null;

cy.on('tap', 'node', function (evt) {

    var node = evt.target;

    onNode = node;

    ticker.text(node.id());
    symbol.attr("src", "img/svg/" + node.id().toLowerCase() + ".svg");

    updateTicker(node);

});

var onNodes = [];

cy.on('cxttap', function (event) {
    var eventTarget = event.target;
    if (eventTarget === cy) {
        //Destroy all pie nodes

    } else if (eventTarget.isNode()) {
        if (onNodes.includes(eventTarget)) {
            onNodes.pop(eventTarget);
            eventTarget.css({
                'pie-1-background-opacity': 0,
            });
        } else {
            onNodes.push(eventTarget);
            updateNodes();
        }

    }
});

setInterval(function () {

    $.getJSON('json/latest.json', function (data) {
        total_usd = data['global']['total_usd'];
        date = data['global']['date'];
        cy.json({ elements: data });
        cy.nodes().forEach(function (ele) {
            setSize(ele);
        });

        updateNodes();
        updateTicker(onNode);
    });

}, 500);

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

}

function setSize(ele) {

    ele.animate(
        {
            style: {
                width: ele.data('size'), height: ele.data('size')
            },
            duration: 400,
            easing: 'ease-in-out'
        }
    );
}

function setImage(ele) {

    var icon = "img/white/" + ele.data('id'.toLowerCase()) + '.png';
    ele.style('background-color', 'black');
    ele.style('background-image', icon);
}

function round(value, decimals) {
    return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
  }