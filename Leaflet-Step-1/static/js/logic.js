// Store our API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Perform a GET request to the query URL
d3.json(queryUrl).then(data => {
  console.log(data);
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// // Function to determine marker size based on magnitude
// function markerSize(magnitude) {
//     // return magnitude / 40;
//     return Math.sqrt(feature.properties.mag)*100;
// }

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
     layer.bindPopup(`<p>Magnitiude: ${feature.properties.mag}</p><p>Depth: 
     ${feature.geometry.coordinates[2]}</p><p>Location: ${feature.properties.place}</p>`);
  }

   function markerSize(magnitude) {
        if (magnitude === 0) {
         return 1;}
        // return magnitude / 40;
        else {return (magnitude)*50000//50000
        }
    };

    // function colorFill(depth) {
    //     switch 
    // }
    // Update tip text
    // switch(chosenYAxis) {
    //   case 'smokes':
    //     chosenYAxisBubble = "Smokes";  
    //     break;
    //   case 'healthcare':
    //     chosenYAxisBubble = "Lacks Healthcare";
    //     console.log(chosenYAxis);
    //     break;
    //   case 'obesity':
    //     chosenYAxisBubble = "Obese";
    //     console.log(chosenYAxis);
    //     break;
    // }

  // Create a GeoJSON layer containing the features array on the earthquakeData object
  // Run the onEachFeature function once for each piece of data in the array
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
  });

  var mags = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: (feature, latlng) => {
      return new L.Circle(latlng, {
        radius: markerSize(feature.properties.mag),//Math.sqrt(feature.properties.mag)*100,//markerSize(feature.properties.mag),//feature.properties.mag*20000,
        fillColor: "red",
        fillOpacity: .25,
        stroke: false 
      });
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, mags);
}

function createMap(earthquakes, mags) {

  // Define streetmap and darkmap layers
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/light-v10",
    accessToken: API_KEY
  });

//   var darkmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
//     attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
//     maxZoom: 18,
//     id: "dark-v10",
//     accessToken: API_KEY
//   });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "Light Map": lightmap,
    // "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    Earthquakes: earthquakes,
    Magnitudes: mags
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load
  var myMap = L.map("map", {
    center: [
        37.09, -95.71
        //15.5994, -28.6731
    ],
    zoom: 4,
    layers: [lightmap, mags]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
}
