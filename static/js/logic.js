// depth by color
function color(depth) {
    if (depth >= 90) {
        return "#330000"
    } else if (depth < 90 && depth >= 70) {
        return "#990000"
    } else if (depth < 70 && depth >= 50) {
        return "#ff1a1a"
    } else if (depth < 50 && depth >= 30) {
        return "#ff6666"
    } else if (depth < 30 && depth >= 10) {
        return "#ffcccc"
    } 
}

// circle function
function circle(features, coordinates) {
    let mag = features.properties.mag
    let depth = features.geometry.coordinates[2]
    return L.circle(coordinates, {
        color: color(depth),
        fillColor: color(depth),
        fillOpacity: 0.75,
        radius: mag * 5000
    })
}

let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_month.geojson"

// get data with d3
d3.json(url).then(function (data) {
    // Once we get a response, send the data.features object to the createFeatures function.
    createFeatures(data.features);
  });

function createFeatures(earthquakeData) {

  // Define a function that we want to run once for each feature in the features array.
  // Give each feature a popup that describes the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><hr><p>magnitude: ${feature.properties.mag}</p><hr><p>depth:${feature.geometry.coordinates[2]}</p>`);
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  let earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,
    pointToLayer: circle
  });

  // Send our earthquakes layer to the createMap function/
  createMap(earthquakes);
}

function createMap(earthquakes) {

    // Create the base layers.
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })
  
    // Create a baseMaps object.
    let baseMaps = {
      "Street Map": street
    };
  
    // Create an overlay object to hold our overlay.
    let overlayMaps = {
      Earthquakes: earthquakes
    };
  
    // Create our map, giving it the streetmap and earthquakes layers to display on load.
    let myMap = L.map("map", {
      center: [
        5.06, 130.88
      ],
      zoom: 5,
      layers: [street, earthquakes]
    });
  
    // Create a layer control.
    // Pass it our baseMaps and overlayMaps.
    // Add the layer control to the map.
    L.control.layers(baseMaps, overlayMaps, {
      collapsed: false
    }).addTo(myMap);

    // Legend information and location
    let legendInfo = L.control({position: "bottomright"});

    // Create the legend with a title
    legendInfo.onAdd = function (map) {
      let div = L.DomUtil.create("div", "legendInfo");
      div.innerHTML += "<h3>Earthquake Depth</h3>";
      return div;
    };

    // Define the color categories and labels
    let depthColors = [
      "#ffcccc",   // 10-30
      "#ff6666",   // 30-50
      "#ff1a1a",   // 50-70
      "#990000",   // 70-90
      "#330000"    // 90+
    ];

    // Give the legend labels names
    let labels = ["10-30", "30-50", "50-70", "70-90", "90+"];

    // Legend display
    let legendDisplay = L.control({ position: "bottomright" });

    // Add features to the legend
    legendDisplay.onAdd = function (map) {
      let div = L.DomUtil.create("div", "legendDisplay");
      div.style.backgroundColor = "white";
      div.style.border = "1px solid #ccc";
      div.innerHTML += "<h3>Earthquake Depth</h3>";

      // Loop through categories and create legend items
      for (let i = 0; i < depthColors.length; i++) {
        div.innerHTML +=
          `<div style="display: flex; align-items: center;">
            <div style="width: 20px; height: 20px; background-color:${depthColors[i]}; margin-right: 5px;"></div>
            <span>${labels[i]}</span>
          </div>`;
      }
      return div;
    };

    legendDisplay.addTo(myMap);
  }
