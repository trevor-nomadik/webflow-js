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

  map.data.loadGeoJson('https://raw.githubusercontent.com/trevor-nomadik/camps-kml/main/austin-camps.geojson');
  /*
  fetch('https://engaging-surely-escargot.ngrok-free.app/api/get_polygons')
    .then(response => response.json())
    .then(geojsonData => {
      // Add the GeoJSON data to the map.data layer
      map.data.addGeoJson(geojsonData);
    })
    .catch(error => {
      console.error('Error loading GeoJSON:', error);
      // Handle the error as needed
  });
  */
  
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

    // Prepare the data to be sent
    var dataToSend = JSON.stringify({ coordinates: coordinates });

    // Sending the data to your endpoint
    
    fetch('https://engaging-surely-escargot.ngrok-free.app/api/polygon', {
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
    /*
    // Send the data to your REST endpoint using a POST request
    fetch('https://engaging-surely-escargot.ngrok-free.app/api/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToSend)
    })
    .then(response => response.json())
    .then(responseData => {
      console.log('Server response:', responseData);
      // Handle the server response as needed
    })
    .catch(error => {
      console.error('Error sending data to server:', error);
      // Handle errors
    });
  */
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
