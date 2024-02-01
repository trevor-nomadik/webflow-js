function initMap() {// Create a new container div for the map and sidebar
  var container = document.createElement('div');
  container.style.display = 'flex';
  container.style.height = '100vh'; // Ensure the container fills the viewport height

  // Reference the existing map div and adjust styles if necessary
  var mapDiv = document.getElementById('map');
  mapDiv.style.height = '100vh'; // Match the map height to the viewport or adjust as needed
  mapDiv.style.flexGrow = '1'; // Allow the map to fill the available space

  // Create the sidebar
  var sidebar = document.createElement('div');
  sidebar.id = 'sidebar';
  sidebar.style.width = '250px'; // Set the sidebar width
  sidebar.style.overflowY = 'auto'; // Enable vertical scrolling for the sidebar
  sidebar.style.height = '100vh'; // Match the sidebar height to the viewport or to the map height

  // Insert the new container into the DOM, replacing the map div temporarily
  mapDiv.parentNode.insertBefore(container, mapDiv);

  // Move the map div and insert the sidebar into the new container
  container.appendChild(mapDiv); // Add the map to the container
  container.appendChild(sidebar); // Add the sidebar to the container

  // Initialize the map in the mapDiv as before
  var map = new google.maps.Map(mapDiv, {
      zoom: 12,
      center: {lat: 30.266666, lng: -97.733330},
      mapTypeId: 'satellite',
      mapTypeControl: false,
      streetViewControl: false,
      styles: [{
          featureType: 'poi', // Hide all points of interest
          stylers: [{ visibility: 'off' }]
      }]
  });

  // Adjust the map div style
  var mapDiv = document.getElementById('map');
  mapDiv.style.flexGrow = '1';

  var polygonList = document.createElement('ul');
  sidebar.appendChild(polygonList); // Append an unordered list to the sidebar for listing polygons

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
  
      // Populate sidebar with polygon names
      content.features.forEach((feature, index) => {
          const listItem = document.createElement('li');
          listItem.textContent = feature.properties.name; // Assuming each feature has a 'name' property
          listItem.style.cursor = 'pointer'; // Make it look clickable
          listItem.addEventListener('click', function() { zoomToFeature(feature); });
          document.getElementById('sidebar').appendChild(listItem);
          polygonList.appendChild(listItem);
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
  
    var drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_CENTER,
      drawingModes: ['polygon']
    },
    polygonOptions: {
      editable: true, // Set to false if you don't want the polygon to be editable
      draggable: true // Set to false if you don't want the polygon to be draggable
    }
    });
    drawingManager.setMap(map);
  
  google.maps.event.addListenerOnce(map, 'idle', setDefaultClickMode);
  google.maps.event.addListener(drawingManager, 'polygoncomplete', function(polygon) {
    // Extracting the coordinates of the polygon
    var path = polygon.getPath();
    var coordinates = [];
    path.forEach(function(latlng) {
      coordinates.push({ lat: latlng.lat(), lng: latlng.lng() });
    });

    // TAK CoT polygon
    // Extract the first coordinate's latitude and longitude
    var firstLon = coordinates[0]['lng'];
    var firstLat = coordinates[0]['lat'];

    // Generate UUID
    var uuid = generateUUID();

    // Time calculations
    var now = new Date();
    var oneMonthLater = new Date(now.getTime() + 30*24*60*60*1000);
    var timeString = now.toISOString();
    var staleTimeString = oneMonthLater.toISOString();

    // Construct XML string with first coordinate
    var xmlString = `<event version="2.0" type="u-d-f" uid="${uuid}" how="m-g" time="${timeString}" start="${timeString}" stale="${staleTimeString}"><point lat="${firstLat}" lon="${firstLon}" hae="0.0" le="9999999.0" ce="9999999.0" /><detail>`;
    coordinates.forEach(function(coord) {
      xmlString += `<link point="${coord}" />`;
    });
    xmlString += `<contact callsign="test_callsign" /><fillColor value="-1761607936" /><strokeColor value="-256" /><strokeWeight value="4.0" /></detail></event>`;

    // Convert XML string to byte string
    var byteString = new TextEncoder().encode(xmlString);
    console.log(byteString)

    // Prepare the data to be sent
    var dataToSend = JSON.stringify({ coordinates: coordinates });

    // Sending the data to your endpoint
    
    fetch('https://yourserver.com/api/polygon', {
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
        // Handle errors
      });
    });
  
  
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

  // Zoom to Feature function
  function zoomToFeature(feature, map) {
      const bounds = new google.maps.LatLngBounds();
      feature.geometry.coordinates[0].forEach(coord => {
          bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
      });
      map.fitBounds(bounds); // Zooms the map to the bounds
  }

  // Example function to send data to a server
  function sendDataToServer(data, lat, lng) {
    // Create a data object that includes userInput, lat, and lng
    var sendData = {
      userInput: data,
      latitude: lat,
      longitude: lng
    };

    // Use AJAX, Fetch API, or other methods to send sendData to a server
    // For demonstration purposes, we'll just log the data
    console.log("Data to send:", sendData);
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