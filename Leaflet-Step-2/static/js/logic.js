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

function colorFill(depth) {
  if (depth > 90) {
    return "#EA2C2C"//"#ea2c2c"
  } else if (depth > 70) {
    return "#D3631F" //"#ea822c"
  } else if (depth > 50) {
    return "#ee9c00"
  } else if (depth > 30) {
    return "#eecc00"
  } else if (depth > 10) {
    return "#d4ee00"
  } else {
    return "#98ee00"
  }
};

function createFeatures(earthquakeData) {

  // Define a function we want to run once for each feature in the features array
  // Give each feature a popup describing the place and time of the earthquake
  function onEachFeature(feature, layer) {
      layer.bindPopup(`<p>Magnitiude: ${feature.properties.mag}</p><p>Depth: 
      ${feature.geometry.coordinates[2]}</p><p>Location: ${feature.properties.place}</p>`);
  };

   function markerSize(magnitude) {
        if (magnitude === 0) {
         return 1;}
        // return magnitude / 40;
        else {return (magnitude)*50000
        }
    };

    // function colorFill(depth) {
    //   if (depth > 90) {
    //     return "#ea2c2c"
    //   } else if (depth > 70) {
    //     return "#ea822c"
    //   } else if (depth > 50) {
    //     return "#ee9c00"
    //   } else if (depth > 30) {
    //     return "#eecc00"
    //   } else if (depth > 10) {
    //     return "#d4ee00"
    //   } else {
    //     return "#98ee00"
    //   }
    // };
    

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
        fillColor: colorFill(feature.geometry.coordinates[2]),
        fillOpacity: 0.8,
        color: "black",
        weight: 0.5
      });
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(earthquakes, mags);
}

function createMap(earthquakes, mags) {

    // Define streetmap and darkmap layers
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
        tileSize: 512,
        maxZoom: 18,
        zoomOffset: -1,
        id: "mapbox/satellite-v9",
        accessToken: API_KEY
    });

    var grayscale = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "light-v10",
        accessToken: API_KEY
    });

    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "outdoors-v11",
        accessToken: API_KEY
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": grayscale,
        "Outdoors": outdoors
    };

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        "Tectonic Plates": earthquakes,
        Earthquakes: mags
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        center: [
            37.09, -95.71
            //15.5994, -28.6731
        ],
        zoom: 4,
        layers: [satellite, mags]
    });

    // Create a layer control
    // Pass in our baseMaps and overlayMaps
    // Add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Add legend to map
    var legend = L.control({position: "bottomright"});

    legend.onAdd = function () {
        var div = L.DomUtil.create("div", "info legend"),
        depths = [-9, 11, 31, 51, 71, 91];
        //labels = [];

        // loop through the depth intervals and generate a label with a colored square for each interval
        for (var i = 0; i < depths.length; i++) {
        div.innerHTML += 
            // `<i style="background:` + colorFill(depths[i] + 1) + `"></i> ` + 
            // depths[i] + (depths[i + 1] ? `&ndash;` + depths[i + 1] + `<br>` : `+`);
            '<i style="background:' + colorFill(depths[i] + 1) + '"></i> ' +
            depths[i] + (depths[i + 1] ? '&ndash;' + (depths[i + 1] - 1) + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(myMap);
}
