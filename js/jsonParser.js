var updated;

function isUpdated(jsonTimestamp) {
    var storedTimestamp = localStorage.getItem("last-updated");
    if (storedTimestamp === null) {
      localStorage.setItem("last-updated", jsonTimestamp);
      return false;
    }
  
    if (storedTimestamp === jsonTimestamp) {
      return false;
    } else {
      localStorage.setItem("last-updated", jsonTimestamp);
      return true;
    }
  }
  
  function checkJsonFeed() {
    $.getJSON("coins.json", function(data) {
      var entry = data.feed.entry;
  
      $(entry).each(function() {
        $('.data').append('<h2>'+this.gsx$title.$t+'</h2><p>'+this.gsx$text.$t+'</p>');
      });
  
      if (isUpdated(data.feed.updated.$t)) {
        
        updated =true;
        console.log ('updated');
      }
      else{
          updated= false;
      }
    });
  }
  
  checkJsonFeed();