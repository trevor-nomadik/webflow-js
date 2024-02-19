function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {lat: 30.266666, lng: -97.733330} ,
    mapTypeId: 'hybrid',
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
        {
            featureType: 'poi',   // Hide all points of interest
            stylers: [{ visibility: 'off' }]
        }
    ]
  });

  // Initialize the Places service
  var service = new google.maps.places.PlacesService(map);
  var resourceWindow = new google.maps.InfoWindow();
  var resourceWindowOpened = false;

  // Function to create a marker for a place
  function createMarkerForPlace(placeId) {
    service.getDetails({placeId: placeId}, function(place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Create a marker for the place
        var marker = new google.maps.Marker({
          map: map,
          position: place.geometry.location,
          title: place.name,
          icon: {
            path: google.maps.SymbolPath.CIRCLE, 
            scale: 5, 
            strokeColor: '#ADD8E6',
            fillColor: '#ADD8E6',
            fillOpacity: 0.8, 
            strokeWeight: 2 
          }
        });

        google.maps.event.addListener(marker, 'click', function() {
          resourceWindowOpened = true;
          resourceWindow.setContent('<div><strong>' + place.name + '</strong><br>' +
            place.formatted_address + '</div>');
            resourceWindow.open(map, this);
        });
      }
    });
  }

  // Resource markers
  const placeIds = [
    'ChIJPXBW86a1RIYRLHKKgjK4Nf0',
    'ChIJba0zGqe1RIYRxXZrt1HYUy8',
    'ChIJT2rMMjVLW4YR75-Nm2Xw9pE',
    'ChIJ3xGz3NVLW4YRh14R2m6ItFY',
    'ChIJV7Qp1jy3RIYRThfOaekUXn4',
    'ChIJjXZz26S3RIYRWikXkKilWBM',
    'ChIJbZNlfIBKW4YRDbSlExVETlQ',
    'ChIJ46yo1pbJRIYR6IsIGmKyat8',
    'ChIJHcmXZBbNRIYRBjw7odKk1RE',
    'ChIJU1B9-bq3RIYRDTvbVJ2alxk',
    'ChIJC4wKqAK1RIYR0dxyI3A9wtE',
    'ChIJF-srX6a1RIYR4sPOhIuCleg',
    'ChIJWzrzburLRIYR5M5XUuslO6U',
    'ChIJq4sFNKe1RIYRuMxP-mYQyps',
    'ChIJ18R8S1KxRIYRUadsdsL4rQU',
    'ChIJB1_oUG22RIYRDKyqXG1oHeA'
  ];

  // Function to create a marker for each Place ID
  placeIds.forEach(placeId => {
    createMarkerForPlace(placeId);
  });

  // Create a button and set its properties
  var pointSelectionButton = document.createElement('button');
  pointSelectionButton.title = 'Select a point on the map and tell us what\'s going on';
  pointSelectionButton.style.backgroundImage = 'url(https://trevor-nomadik.github.io/webflow-js/point_button.png'; 
  pointSelectionButton.style.backgroundSize = 'contain';
  pointSelectionButton.style.backgroundRepeat = 'no-repeat';
  pointSelectionButton.style.backgroundPosition = 'center';
  pointSelectionButton.style.width = '50px'; 
  pointSelectionButton.style.height = '50px'; 
  pointSelectionButton.style.border = 'none';
  pointSelectionButton.style.cursor = 'pointer';
  pointSelectionButton.style.padding = '0';
  pointSelectionButton.style.margin = '10px';
  pointSelectionButton.style.backgroundColor = 'transparent'; 
  // Add the button to the map
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(pointSelectionButton);

  let isPointSelectionModeEnabled = false;

  // Listen for button clicks to toggle point selection mode
  pointSelectionButton.addEventListener('click', () => {
    isPointSelectionModeEnabled = !isPointSelectionModeEnabled;
  });

  // Modify your map click event listener
  google.maps.event.addListener(map, 'click', function(event) {
    if (isPointSelectionModeEnabled) {
      // Capture the clicked location
      var clickedLat = event.latLng.lat();
      var clickedLng = event.latLng.lng();

      // Prompt the user for input
      var userInput = prompt("What's going on here?", "");

      // Reset point selection mode
      isPointSelectionModeEnabled = false;

      // If user input is provided, send data to the server
      if (userInput !== null && userInput !== "") {
        sendDataToServer(userInput, clickedLat, clickedLng);
      }
    }
  });

  var polygonList = document.getElementById('sidebar'); 

  // Create and append the search bar to the sidebar
  const searchInput = document.createElement('input');
  searchInput.setAttribute('type', 'text');
  searchInput.setAttribute('placeholder', 'Search camps...');
  searchInput.style.width = '100%';
  searchInput.style.padding = '10px';
  searchInput.style.marginBottom = '10px';
  searchInput.style.boxSizing = 'border-box';
  polygonList.insertBefore(searchInput, polygonList.firstChild);

  fetch(
    'https://f99lmwcs34.execute-api.us-east-2.amazonaws.com/beta/camps/polygons',
    {
      method: 'GET',
      headers: {
        'Origin': 'https://www.nomadik.ai',
        'Accept': 'application/json',
        'Content-Type': 'application/geo+json'
      }
    })
    .then(response => response.json())
    .then(content => {
      // Add the GeoJSON data to the map.data layer
      map.data.addGeoJson(content);
  
      // Empty the polygonList before adding search results
      function clearPolygonList() {
        while (polygonList.firstChild && polygonList.childElementCount > 1) { // Keep the search input
          polygonList.removeChild(polygonList.lastChild);
        }
      }
  
      // Function to populate sidebar with polygon names
      function populatePolygonList(features) {
        clearPolygonList(); // Clear existing list items before repopulating
        features.forEach(feature => {
          const listItem = document.createElement('li');
          listItem.textContent = feature.properties.name;
          listItem.style.cursor = 'pointer';
          listItem.onclick = function() { zoomToFeature(feature, map); };
          polygonList.appendChild(listItem);
        });
      }
  
      populatePolygonList(content.features); // Initial population of the list
  
      // Implement search functionality
      searchInput.addEventListener('input', function() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredFeatures = content.features.filter(feature => 
          feature.properties.name.toLowerCase().includes(searchTerm)
        );
        populatePolygonList(filteredFeatures);
      });
  })
    .catch(error => {
      console.error('Error loading GeoJSON:', error);
      // Handle the error as needed
  });


  function zoomToFeature(feature, map) {
    const bounds = new google.maps.LatLngBounds();
    const geometry = feature.geometry;
    if (geometry.type === 'Polygon') {
        geometry.coordinates[0].forEach(coord => {
            bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
        });
    } else if (geometry.type === 'MultiPolygon') {
        // For MultiPolygon, iterate through each polygon
        geometry.coordinates.forEach(polygon => {
            polygon[0].forEach(coord => {
                bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
            });
        });
    }
    map.fitBounds(bounds); // Zooms the map to the bounds
  }

  // Create a heatmap data array
  var heatmapData = [];

  // Create a heatmap layer
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    map: map
  });

  // Fetch heatmap data from your server
  fetchHeatmapData().then(data => {
    // Update heatmap data array
    heatmapData = data;
    // Set heatmap data
    heatmap.setData(heatmapData);
  });

  function fetchHeatmapData() {
    return fetch('https://f99lmwcs34.execute-api.us-east-2.amazonaws.com/beta/debris/heatmap')
      .then(response => response.json())
      .then(data => {
        // Check if "debrisHeatmap" array exists in the response
        if (!data.debrisHeatmap) {
          throw new Error('Invalid response format: debrisHeatmap array not found');
        }

        // Extract latitude, longitude, and weight from each data point
        return data.debrisHeatmap.map(point => ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: point.weight
        }));
      })
      .catch(error => {
        console.error('Error fetching heatmap data:', error);
        return []; // Return empty array if there's an error
      });
  }
  
   // Set style based on feature properties
  map.data.setStyle(function(feature) {
    return {
      strokeColor: feature.getProperty('stroke'),
      strokeWeight: feature.getProperty('stroke-width')
    };
  });

  // Create toggle controls
  var toggleCampsControlDiv = document.createElement('div');
  var toggleHeatmapControlDiv = document.createElement('div');

  // Create toggle buttons
  var toggleCampsButton = document.createElement('button');
  var toggleHeatmapButton = document.createElement('button');

  // Customize toggle buttons
  toggleCampsButton.textContent = 'Toggle Camps';
  toggleHeatmapButton.textContent = 'Toggle Debris';

  // Add classes to toggle controls for styling
  toggleCampsControlDiv.className = 'custom-control';
  toggleHeatmapControlDiv.className = 'custom-control';

  // Add event listeners to toggle buttons
  toggleCampsButton.addEventListener('click', function() {
    toggleCamps();
  });

  toggleHeatmapButton.addEventListener('click', function() {
    toggleHeatmap();
  });

  // Append toggle buttons to toggle controls
  toggleCampsControlDiv.appendChild(toggleCampsButton);
  toggleHeatmapControlDiv.appendChild(toggleHeatmapButton);

  // Add toggle controls to the map
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(toggleCampsControlDiv);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(toggleHeatmapControlDiv);

  // Function to toggle Camps visibility
  function toggleCamps() {
    // Toggle visibility of map data layer
    map.data.setMap(map.data.getMap() ? null : map);
  }

  // Function to toggle heatmap visibility
  function toggleHeatmap() {
    // Toggle visibility of heatmap layer
    heatmap.setMap(heatmap.getMap() ? null : map);
  }
  
  // Create an info window to display the polygon's name
  var infoWindow = new google.maps.InfoWindow();
  var infoWindowOpened = false;

  // Add a click event listener to the polygons
  map.data.addListener('click', function(event) {
  		infoWindowOpened = true;
      // Get the name property of the clicked polygon
      var name = event.feature.getProperty('name');

      var population = event.feature.getProperty('population');
      // Check if population is not a number or undefined
      if (typeof population !== 'number' || isNaN(population)) {
        population = "Unknown";
      }

      contentString = '<div><strong>' + name + '</strong></div>' +
                      '<div>Population Estimate: ' + population + '</div>' +
                      '<div>Still here?</div>' +
                      '<button id="yesBtn">Yes</button>' +
                      '<button id="noBtn">No</button>';

      // Set the content of the info window
      infoWindow.setContent(contentString);

      // Position the info window on the clicked location
      infoWindow.setPosition(event.latLng);
      var clickedLat = event.latLng.lat();
      var clickedLng = event.latLng.lng();

      // Open the info window
      infoWindow.open(map);

      // Attach event listeners to the buttons after a slight delay to ensure DOM elements are created
      google.maps.event.addListenerOnce(infoWindow, 'domready', function(){
          document.getElementById('yesBtn').addEventListener('click', function() {
              var descriptionString = JSON.stringify({
                polygonName: name,
                response: true
            });
              sendDataToServer(descriptionString, clickedLat, clickedLng);
              infoWindow.close();
          });

          document.getElementById('noBtn').addEventListener('click', function() {
              var descriptionString = JSON.stringify({
                polygonName: name,
                response: false
            });
              sendDataToServer(descriptionString, clickedLat, clickedLng);
              infoWindow.close();
          });
      });
  });
  
  // Add a click event listener to the map
  google.maps.event.addListener(map, 'click', function() {
      // Check if the info window was just opened
      if (infoWindowOpened) {
          // If it was, set the flag to false and do nothing else
          infoWindowOpened = false;
          infoWindow.close();
      }
      if (resourceWindowOpened) {
        resourceWindowOpened = false;
        resourceWindow.close();
      }
  });

  // Add a right-click event listener to the map
  google.maps.event.addListener(map, 'rightclick', function(event) {
    // Capture the clicked location's latitude and longitude
    var clickedLat = event.latLng.lat();
    var clickedLng = event.latLng.lng();

    // Get user input through a prompt
    var userInput = prompt("What's going on here?", "");

    // Check if the user provided input
    if (userInput !== null && userInput !== "") {
      // Send data to the server, including clickedLat and clickedLng
      sendDataToServer(userInput, clickedLat, clickedLng);
    }
  });

  function sendDataToServer(userInput, lat, lng) {
    // Create a data object that includes userInput, lat, and lng
    if (userInput !== null && userInput.trim() !== "") {
      // Prepare the data to be sent
      var dataToSend = JSON.stringify({
        location: { lat: lat, lng: lng },
        description: userInput
      });

      // Sending the data to your endpoint
      fetch('https://f99lmwcs34.execute-api.us-east-2.amazonaws.com/beta/submitPOI', {
        method: 'POST',
        headers: {
          'Origin': 'https://www.nomadik.ai',
          'Content-Type': 'application/json'
        },
        body: dataToSend
      })
      .then(response => response.json())
      .then(data => {
        console.log('Success:', data);
        showThankYouModal(); // Show the thank you modal
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  function generateUUID() {
    var d = new Date().getTime(); //Timestamp
    var d2 = (performance && performance.now && (performance.now()*1000)) || 0; //Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16; //random number between 0 and 16
        if(d > 0){ //Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else { //Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function showThankYouModal() {
    // Create the modal container
    var modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';
    modal.style.zIndex = '1000';

    // Create the modal content
    var modalContent = document.createElement('div');
    modalContent.style.backgroundColor = '#fff';
    modalContent.style.padding = '20px';
    modalContent.style.borderRadius = '5px';
    modalContent.style.textAlign = 'center';

    // Add text to the modal
    var text = document.createElement('p');
    text.textContent = 'Thank you for submitting the polygon!';
    modalContent.appendChild(text);

    // Close button
    var closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.onclick = function() {
      modal.style.display = 'none';
      modal.remove();
    };
    modalContent.appendChild(closeButton);

    // Append modal content to modal
    modal.appendChild(modalContent);

    // Append modal to the body
    document.body.appendChild(modal);
  }
}


// CoT Functions
function createCotPoint(latitude, longitude, altitude, circularError, heightError) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString('<point></point>', 'text/xml');
  let point = xmlDoc.documentElement;
  point.setAttribute('lat', latitude);
  point.setAttribute('lon', longitude);
  point.setAttribute('hae', altitude);
  point.setAttribute('ce', circularError);
  point.setAttribute('le', heightError);

  return point;
}

function createCotColorFields(affiliation) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString('<colors></colors>', 'text/xml');
  let colors = xmlDoc.documentElement;

  let fillColor = xmlDoc.createElement('fillColor');
  fillColor.setAttribute('value', affiliation);
  colors.appendChild(fillColor);

  let strokeColor = xmlDoc.createElement('strokeColor');
  strokeColor.setAttribute('value', affiliation);
  colors.appendChild(strokeColor);

  let strokeWeight = xmlDoc.createElement('strokeWeight');
  strokeWeight.setAttribute('value', '4.0');
  colors.appendChild(strokeWeight);

  return Array.from(colors.children);
}

function createCotAtomMessage(uid, callsign, cotType, latitude, longitude, altitude, circularError, heightError, courseOverGround, speedOverGround, startTime, staleTime) {
  let parser = new DOMParser();
  let xmlDoc = parser.parseFromString('<event></event>', 'text/xml');
  let root = xmlDoc.documentElement;
  root.setAttribute('version', '2.0');
  root.setAttribute('type', cotType);
  root.setAttribute('uid', uid);
  root.setAttribute('how', 'm-g');
  root.setAttribute('time', startTime.toISOString());
  root.setAttribute('start', startTime.toISOString());
  root.setAttribute('stale', staleTime.toISOString());

  let contact = xmlDoc.createElement('contact');
  contact.setAttribute('callsign', callsign);

  let point = createCotPoint(latitude, longitude, altitude, circularError, heightError);

  let track = xmlDoc.createElement('track');
  track.setAttribute('course', courseOverGround.toString());
  track.setAttribute('speed', speedOverGround.toString());

  let remarks = xmlDoc.createElement('remarks');

  let detail = xmlDoc.createElement('detail');
  detail.appendChild(contact);
  detail.appendChild(track);
  detail.appendChild(remarks);

  root.appendChild(point);
  root.appendChild(detail);

  return root;
}

  function createCotPolygonMessage(uid, callsign, latitude, longitude, polygon, altitude, circularError, heightError, affiliation, startTime, staleTime) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString('<event></event>', 'text/xml');
    let root = xmlDoc.documentElement;
    root.setAttribute('version', '2.0');
    root.setAttribute('type', 'u-d-f');
    root.setAttribute('uid', uid);
    root.setAttribute('how', 'm-g');
    root.setAttribute('time', startTime.toISOString());
    root.setAttribute('start', startTime.toISOString());
    root.setAttribute('stale', staleTime.toISOString());

    let point = createCotPoint(latitude, longitude, altitude, circularError, heightError);

    let contact = xmlDoc.createElement('contact');
    contact.setAttribute('callsign', callsign);

    let colorFields = createCotColorFields(affiliation);

    let detail = xmlDoc.createElement('detail');

    polygon.forEach(coords => {
        let link = xmlDoc.createElement('link');
        link.setAttribute('point', `${coords[1]},${coords[0]},0`);
        detail.appendChild(link);
    });

    colorFields.forEach(field => detail.appendChild(field));

    root.appendChild(point);
    root.appendChild(detail);

    return root;
  }
}