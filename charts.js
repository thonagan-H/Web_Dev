function updateEntireData(entireData) {
    // Reference to Panel element for entireData
    var PANEL = document.getElementById("entire");
    // Clear any existing metadata
    PANEL.innerHTML = '';
    // Loop through keys in the json response + add tags             
    for(var key in entireData[0]) {
        h6tag = document.createElement("h6");
        int_val = Number(entireData[0][key]).toFixed(0)
        h6Text = document.createTextNode(`${key}: ${int_val}`);
        h6tag.append(h6Text);

        PANEL.appendChild(h6tag);
    }
}

function updatePrivateData(privateData) {
    // Reference to Panel element for privateData
    var PANEL = document.getElementById("private");
    PANEL.innerHTML = '';
    // Loop through keys in the json response + add tags  
    for(var key in privateData[0]) {
        h6tag = document.createElement("h6");
        int_val = Number(privateData[0][key]).toFixed(0)
        h6Text = document.createTextNode(`${key}: ${int_val}`);
        h6tag.append(h6Text);

        PANEL.appendChild(h6tag);
    }
}

function updateSharedData(sharedData) {
    // Reference to Panel element for sharedData
    var PANEL = document.getElementById("shared");
    PANEL.innerHTML = '';
    // Loop through keys in the json response + add tags  
    for(var key in sharedData[0]) {
        h6tag = document.createElement("h6");
        int_val = Number(sharedData[0][key]).toFixed(0)
        h6Text = document.createTextNode(`${key}: ${int_val}`);
        h6tag.append(h6Text);

        PANEL.appendChild(h6tag);
    }
}


function buildCharts(listingData) {

    
    var bubbleLayout = {
        margin: {  
            t: 50,
        },
        hovermode: 'closest',
        title: '<b>BNB Rental Price per BNB ID<b>',
        xaxis: { title: 'BNB ID' },
        yaxis: {title: "Log BNB Rental Price ($)", type: 'log', autorange: true},
        width: 1670,
    };


    var bubbleData = [{
        x: listingData[0]['airbnb_ids'],
        y: listingData[0]['price'],
        text: listingData[0]['room_type'],
        mode: 'markers',
        marker: {
            color: listingData[0]['airbnb_ids'],
            colorscale: "Earth",
            size: listingData[0]['price'].map(el => el/ 30),
        
        }
    }];
    var BUBBLE = document.getElementById('bubble');
    Plotly.plot(BUBBLE, bubbleData, bubbleLayout);

    // Build Pie Chart
    var pieData = [{
        values: listingData[0]['price'].slice(0, 10),
        labels: listingData[0]['airbnb_ids'].slice(0, 10),
        hovertext: listingData[0]['room_type'].slice(0, 10),
        hoverinfo: 'hovertext',
        type: 'pie'
    }];

    var pieLayout = {
        autosize: true,
        hovermode:'closest',
        margin: {
            r: 10,
            t: 45,
            b: 40,
            l: 10
         },
        title: '<b>Top 10 BNB Rental Price by BNBID in Each Neighborhood</b>',
    };

    var PIE = document.getElementById('pie');
    Plotly.plot(PIE, pieData, pieLayout);
};

function updateCharts(listingData) {

    var price = sampleData[0]['price'];
    var airbnb_id = sampleData[0]['airbnb_ids'];
    var labels = listingData[0]['room_type'];

    // Update the Bubble Chart with the new data
    var BUBBLE = document.getElementById('bubble');
    Plotly.restyle(BUBBLE, 'x', [airbnb_id]);
    Plotly.restyle(BUBBLE, 'y', [price]);
    Plotly.restyle(BUBBLE, 'text', [labels]);
    Plotly.restyle(BUBBLE, 'marker.size', [price ]);
    Plotly.restyle(BUBBLE, 'marker.color', [airbnb_id]);

    
    var PIE = document.getElementById('pie');
    var pieUpdate = {
        values: [price.slice(0, 10)],
        labels: [airbnb_id.slice(0, 10)],
        hovertext: [labels.slice(0, 10)],
        hoverinfo: 'hovertext',
        type: 'pie'
    };
    Plotly.restyle(PIE, pieUpdate);
}


function getData(neighbourhood) {
    
    Plotly.d3.json(`/listprice/${neighbourhood}`, function(error, listingData) {
        if (error) return console.warn(error);

        buildCharts(listingData);
        
    });

    Plotly.d3.json(`/entirehome/${neighbourhood}`, function(error, entireData) {
        if (error) return console.warn(error);

        updateEntireData(entireData);
    });

    Plotly.d3.json(`/privateroom/${neighbourhood}`, function(error, privateData) {
        if (error) return console.warn(error);

        updatePrivateData(privateData);
    });

    Plotly.d3.json(`/sharedroom/${neighbourhood}`, function(error, sharedData) {
        if (error) return console.warn(error);

        updateSharedData(sharedData);
    });


    buildGauge(neighbourhood);

    buildScatter1();
    buildScatter2();

}


var myMap_global = null

function getOptions() {

    
    var selector = document.getElementById('selDataset');
    if(myMap_global != null){
        myMap_global.remove();
    }
    
    Plotly.d3.json('/names', function(error, neighbourhoodNames) {
        for (var i = 0; i < neighbourhoodNames.length;  i++) {
            var currentOption = document.createElement('option');
            currentOption.text = neighbourhoodNames[i];
            currentOption.value = neighbourhoodNames[i]
            selector.appendChild(currentOption);
        }

        getData(neighbourhoodNames[0], buildCharts);

    
    var mapbox = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhvbmFnYW4taCIsImEiOiJjamhiN3ZoMDkwbWVtMzZzMDFxMm9iam13In0.ixvQvlhiz3Ov_WvURTDVMA'

    myMap = L.map('map', {
    center: [41.839832, -87.623177],
    zoom: 9.5
    });

    L.tileLayer(mapbox).addTo(myMap);
    L.geoJSON(geo_data).addTo(myMap);
    var url = "https://data.cityofchicago.org/resource/crimes.json?$limit=10000"

    d3.json(url, function(response){

    var heatArray = [];

    for (var i = 0; i < response.length; i++) {
        var location = response[i].location;

        if (location) {
        heatArray.push([location.latitude, location.longitude])
        }
    }
    
    

    var heat = L.heatLayer(heatArray, {
        radius: 20,
        blur: 35
    }).addTo(myMap)

    });
    myMap_global = myMap;  
    });         
}

function optionChanged(newneighbourhoodname) {
    
    if(myMap_global != null){
        myMap_global.remove();
    }
    getData(newneighbourhoodname, updateCharts);
    var mapbox = 'https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoidGhvbmFnYW4taCIsImEiOiJjamhiN3ZoMDkwbWVtMzZzMDFxMm9iam13In0.ixvQvlhiz3Ov_WvURTDVMA'

    var myMap = L.map('map', {
    center: [41.839832, -87.623177],
    zoom: 10
    });

    L.tileLayer(mapbox).addTo(myMap);
    L.geoJSON(geo_data).addTo(myMap);
    var url = "https://data.cityofchicago.org/resource/crimes.json?$limit=10000"

    d3.json(url, function(response){

    var heatArray = [];

    for (var i = 0; i < response.length; i++) {
        var location = response[i].location;

        if (location) {
        heatArray.push([location.latitude, location.longitude])
        }
    }

    d3.csv("static/js/bnb_listings.csv",function(data){
        for(i = 0; i<data.length; i++){
            if(data[i].neighbourhood == newneighbourhoodname)    
            {
                if(data[i].room_type == "Private room"){
                    var blackIcon = new L.Icon({
                    iconUrl: './static/img/marker-icon-black.png',
                });
                    L.marker([data[i].latitude, data[i].longitude],{icon:blackIcon}).bindTooltip(data[i].room_type+'(Price:$'+data[i].price+')').addTo(myMap);    
                }
                else if(data[i].room_type == "Entire home/apt"){
                    var redIcon = new L.Icon({
                    iconUrl: './static/img/marker-icon-red.png',
                });
                    L.marker([data[i].latitude, data[i].longitude],{icon:redIcon}).bindTooltip(data[i].room_type+'(Price:$'+data[i].price+')').addTo(myMap);    
                }
                else{
                    var blueIcon = new L.Icon({
                    iconUrl: './static/img/marker-icon-blue.png',
                });
                    L.marker([data[i].latitude, data[i].longitude],{icon:blueIcon}).bindTooltip(data[i].room_type+'(Price:$'+data[i].price+')').addTo(myMap);    
                }
            }
        }
    });
    

    var heat = L.heatLayer(heatArray, {
        radius: 20,
        blur: 35
    }).addTo(myMap)

    });       
          myMap_global = myMap;     
}
    
function init() {
    getOptions();
    
}

// Initialize the dashboard
init();



function buildGauge(neighbourhood) {

    Plotly.d3.json(`/crimerate/${neighbourhood}`, function(error, crimerateData) {
        if (error) return console.warn(error);
        // Enter the washing frequency between 0 and 180
        var level = crimerateData*20;

        // Trig to calc meter point
        var degrees = 180 - level,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.05 L .0 0.05 L ',
            pathX = String(x),
            space = ' ',
            pathY = String(y),
            pathEnd = ' Z';
        var path = mainPath.concat(pathX,space,pathY,pathEnd);

        var data = [{ type: 'scatter',
        x: [0], y:[0],
            marker: {size: 12, color:'850000'},
            showlegend: false,
            name: 'Crime Rate',
            text: level,
            hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        textinfo: 'text',
        textposition:'inside',
        marker: {
            colors:[
                'rgba(0, 105, 11, .5)', 'rgba(10, 120, 22, .5)',
                'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                'rgba(240, 230, 215, .5)', 'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
        }];

        var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
            }],
        title: '<b>Crime Rate per Neighborhood  </b> <br> Chicago 2017/2018 ',
        // height: 380,
        // width: 500,
        xaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                    showgrid: false, range: [-1, 1]}
        };

        var GAUGE = document.getElementById('gauge');
        Plotly.newPlot(GAUGE, data, layout);
    });
};

function buildScatter1() {

    Plotly.d3.json(`/correlation`, function(error, correlationData) {
        if (error) return console.warn(error);
        correlationData = correlationData[0]
         
        var trace1 = {
            x: correlationData.number_of_crimes,
            y: correlationData.airbnb_counts_per_neighbourhood,
            mode: "markers",
            type: "scatter",
            name: "BNB rental amount",
            marker: {
            color: "#2077b4",
            symbol: "hexagram"
            }
        };

        
        var data = [trace1];

        
        var layout = {
            title: "BNB listing Rental Amount vs Crime Counts in each Neighborhood",
            xaxis: { title: "Crime Counts" },
            yaxis: { title: "BNB listing Rental Amount" }
        };

        
        var Scatter1 = document.getElementById('scatter1');
        Plotly.newPlot("scatter1", data, layout);
    })
}

function buildScatter2() {

    Plotly.d3.json(`/correlation`, function(error, correlationData) {
        if (error) return console.warn(error);
        correlationData = correlationData[0]
         // Create the Traces
        var trace2 = {
            x: correlationData.number_of_crimes,
            y: correlationData.total_reviews_per_neighbourhood,
            mode: "markers",
            type: "scatter",
            name: "BNB Rental Total Reviews",
            marker: {
            color: "orange",
            symbol: "diamond-x"
            }
        };

        
        var data = [trace2];

        
        var layout = {
            title: "BNB listing Total Review vs Crime Counts in each Neighborhood",
            xaxis: { title: "Crime Counts" },
            yaxis: { title: "BNB listing Total Review" }
        };

        
        var Scatter2 = document.getElementById('scatter2');
        Plotly.newPlot("scatter2", data, layout);
    })
}