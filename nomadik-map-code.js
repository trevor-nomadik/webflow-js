function initMap() {
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {lat: 30.266666, lng: -97.733330} ,
    mapTypeId: 'satellite',
    mapTypeControl: false,
    streetViewControl: false,
    styles: [
        {
            featureType: 'poi',   // Hide all points of interest
            stylers: [{ visibility: 'off' }]
        }
    ]
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
  searchInput.setAttribute('placeholder', 'Search polygons...');
  searchInput.style.width = '100%';
  searchInput.style.padding = '10px';
  searchInput.style.marginBottom = '10px';
  searchInput.style.boxSizing = 'border-box';
  polygonList.insertBefore(searchInput, polygonList.firstChild);

  fetch(
    'https://f99lmwcs34.execute-api.us-east-2.amazonaws.com/beta/campPolygons',
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
  
  
   // Set style based on feature properties
  map.data.setStyle(function(feature) {
    return {
      strokeColor: feature.getProperty('stroke'),
      strokeWeight: feature.getProperty('stroke-width')
    };
  });
  
  google.maps.event.addListenerOnce(map, 'idle', setDefaultClickMode);
  
  // Create an info window to display the polygon's name
  var infoWindow = new google.maps.InfoWindow();
  var infoWindowOpened = false;

  // Add a click event listener to the polygons
  map.data.addListener('click', function(event) {
  		infoWindowOpened = true;
      // Get the name property of the clicked polygon
      var name = event.feature.getProperty('name');
      var url = event.feature.getProperty('url'); 

      var population = event.feature.getProperty('population');
      // Check if population is not a number or undefined
      if (typeof population !== 'number' || isNaN(population)) {
        population = "Unknown";
      }

      // Check if URL is valid
      var isUrlValid = url && (url.startsWith('http://') || url.startsWith('https://'));

      // Modify contentString based on whether the URL is valid
      var contentString;
      if (isUrlValid) {
          contentString = '<div><strong><a href="' + url + '" target="_blank">' + name + '</a></strong></div>';
      } else {
          contentString = '<div><strong>' + name + '</strong></div>'; // Name is not clickable
          console.log("url not clickable.")
      }

      contentString += '<div>Population Estimate: ' + population + '</div>' +
                      '<div>Still here?</div>' +
                      '<button id="yesBtn">Yes</button>' +
                      '<button id="noBtn">No</button>';

      // Set the content of the info window
      infoWindow.setContent(contentString);

      // Position the info window on the clicked location
      infoWindow.setPosition(event.latLng);

      // Open the info window
      infoWindow.open(map);

      // Attach event listeners to the buttons after a slight delay to ensure DOM 				elements are created
      google.maps.event.addListenerOnce(infoWindow, 'domready', function(){
          document.getElementById('yesBtn').addEventListener('click', function() {
              console.log('User clicked Yes');
              // Handle the "Yes" response here
              infoWindow.close();
          });

          document.getElementById('noBtn').addEventListener('click', function() {
              console.log('User clicked No');
              // Handle the "No" response here
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

  // Example function to send data to a server
  function sendDataToServer(userInput, lat, lng) {
    // Create a data object that includes userInput, lat, and lng
    if (userInput !== null && userInput.trim() !== "") {
      // Prepare the data to be sent
      var dataToSend = JSON.stringify({
        location: { lat: lat, lng: lng },
        description: userInput
      });

      // Sending the data to your endpoint
      fetch('https://yourserver.com/api/point', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
        // Handle errors, by removing the marker
        map.removeOverlay(marker);
      });
    } else {
      // Remove the marker if no input was provided
      marker.setMap(null);
    }
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
  
  function setDefaultClickMode() {
    drawingManager.setDrawingMode(null); // Set to null to enable clicking
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
