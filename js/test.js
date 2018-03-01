$.ajaxSetup({

    cache: false
});

var data = []; 

data.push($.getJSON('json/cy-style.json'));
data.push($.getJSON('json/latest.json'));
var total_usd = 0;

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
    ready: function(){
        cy.elements().forEach(function (ele) {
            setSize(ele);
            setImage(ele);
            //setQtip(ele);
        });
    }
});

cy.on('tap', 'node', function(evt){
var on_nodes = [];
    var node = evt.target;
    
    var ticker = $('.coin-page__symbol');
    var symbol = $('.coin-page__icon-img');

cy.on('cxttap', function(event){
	var eventTarget = event.target;
	if (eventTarget === cy){
		//Destroy all pie nodes
		
	} else if (eventTarget.isNode()){
		if (on_nodes.includes(eventTarget)){
			on_nodes.pop(eventTarget);
			eventTarget.css({
				'pie-1-background-opacity': 0,
			});
		} else {
			on_nodes.push(eventTarget);
			}

    ticker.text(node.id());
    symbol.attr("src", "img/svg/" + node.id().toLowerCase() + ".svg");
	}	
});


setInterval(function () {

    $.getJSON('json/latest.json', function (data) {
		total_usd = data['global']['total_usd']
        cy.json({elements: data});
        cy.nodes().forEach(function (ele) {
            setSize(ele);
        });
				for (var i = 0; i < on_nodes.length; i++){
			on_nodes[i].css({
				'pie-1-background-opacity': 0.8,
				'pie-1-background-color': '#1e2b34',
				'pie-1-background-size': 100 - 100 * on_nodes[i].data('balance_usd') / total_usd

			});
	  
		}
    });

}, 500);

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
    ele.style('background-color', window.getComputedStyle(document.body, null).getPropertyValue('background-color'));
    ele.style('background-image', icon);
}
