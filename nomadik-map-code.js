function initMap() {
  // Function to get URL parameters
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  // Extract parameters from URL
  var paramLat = parseFloat(getUrlParameter('lat'));
  var paramLng = parseFloat(getUrlParameter('lng'));
  var paramZoom = parseInt(getUrlParameter('zoom'), 10);

  // Set default map center and zoom if URL parameters are not provided
  var defaultCenter = {lat: 31.563130439077945, lng: -97.17369405983729};
  var defaultZoom = 7;

  var mapCenter = (paramLat && paramLng) ? {lat: paramLat, lng: paramLng} : defaultCenter;
  var mapZoom = paramZoom || defaultZoom;

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: mapZoom,
    center: mapCenter,
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

  // Define the topographic map layer
  var topoMapType = new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      return 'https://tile.opentopomap.org/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
    },
    tileSize: new google.maps.Size(256, 256),
    name: 'Topographic',
    maxZoom: 17
  });

  // Add the topographic map layer to the map
  map.mapTypes.set('topographic', topoMapType);

  // Enable map type control to allow users to switch map types
  map.setOptions({
    mapTypeControl: true,
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      mapTypeIds: ['hybrid', 'topographic'] // Include your custom map type here
    }
  });

  // Initialize the Places service
  // var service = new google.maps.places.PlacesService(map);
  var resourceWindow = new google.maps.InfoWindow();
  var resourceWindowOpened = false;
  var markers = [];

  // Function to create a marker for a place
  function createMarkerForPlace(placeId) {
    var marker = new google.maps.Marker({
      map: map,
      position: {lat: placeId.lat, lng: placeId.lng},
      title: placeId.title,
      icon: {
        url: 'https://trevor-nomadik.github.io/webflow-js/assets/resource.png',
        scaledSize: new google.maps.Size(25, 25), // Size of the icon
      }
    });

    markers.push(marker);

    google.maps.event.addListener(marker, 'click', function() {
      resourceWindowOpened = true;
      resourceWindow.setContent('<div><strong>' + placeId.title + '</strong><br>' +
      placeId.info + '</div>');
        resourceWindow.open(map, this);
    });
  }

  // Resource markers
  const placeIds = [
    {lat: 30.26774146155133, lng: -97.73753706227464, title: 'Austin Resource Center for the Homeless (ARCH)', info: 'Address: 500 E 7th St, Austin, TX 78701'},
    {lat: 30.268497261509022, lng: -97.73946040980792, title: 'Trinity Center Austin', info: 'Address: 304 E 7th St, Austin, TX 78701'},
    {lat: 30.26849667265927, lng: -97.73947541693146, title: 'Texas Homeless Network', info: 'Address: 3000 S I-35 Frontage Rd Suite 100, Austin, TX 78704'},
    {lat: 30.228698875231068, lng: -97.78958929041364, title: 'Sunrise Homeless Navigation Center', info: 'Address: 4430 Menchaca Rd, Austin, TX 78745'},
    {lat: 30.282746342716603, lng: -97.66879679538734, title: 'Austin Shelter for Women and Children', info: 'Address: 4613 Tannehill Ln Bldg 3, Austin, TX 78721'},
    {lat: 30.283141995464007, lng: -97.67069734815385, title: 'The Salvation Army Rathgeber Center', info: 'Address: 4613 Tannehill Ln Bldg 1, Austin, TX 78721'},
    {lat: 30.280876916425328, lng: -97.62264094499601, title: 'Mobile Loaves & Fishes', info: 'Address: 9301 Hog Eye Rd Suite 950, Austin, TX 78724'},
    {lat: 30.289115627599863, lng: -97.82614561990913, title: 'Mobile Loaves & Fishes - Food Distribution Center', info: 'Address: 903 S Capital of Texas Hwy, Austin, TX 78746'},
    {lat: 30.335209549437014, lng: -97.72008111674216, title: 'Foundation For the Homeless', info: 'Address: 6719 N Lamar Blvd Suite D, Austin, TX 78752'},
    {lat: 30.432696502633007, lng: -97.76480269563608, title: 'The Charlie Center', info: 'Address: 12675 Research Blvd, Austin, TX 78759'},
    {lat: 30.230085901310634, lng: -97.68664458699638, title: 'Esperanza Community', info: 'Address: 780 Bastrop Hwy, Austin, TX 78741'},
    {lat: 30.230853716975894, lng: -97.70592322727704, title: 'SAFE', info: 'Address: 1515 Grove Blvd, Austin, TX 78741'},
    {lat: 30.370212492285955, lng: -97.71639161397448, title: 'Caritas of Austin North', info: 'Address: 9027 Northgate Blvd, Austin, TX 78758'},
    {lat: 30.26994235159411, lng: -97.73990412989762, title: 'Caritas Of Austin - Food Distribution Center', info: 'Address: Parking lot, Austin, TX 78701'},
    {lat: 30.267501851630694, lng: -97.73777855397638, title: 'Caritas Of Austin', info: 'Address: 611 Neches St, Austin, TX 78701'},
    {lat: 30.20603224134893, lng: -97.69028333172862, title: 'Austin VA', info: 'Address: 7600 Metropolis Dr Building 5, Austin, TX 78744'},
    {lat: 30.27863040901693, lng: -97.6869438054589, title: 'Hungry Hill Foundation', info: 'Address: 1189 Springdale Rd, Austin, TX 78721'},
    {lat: 32.774284562329434, lng: -96.78347780833613, title: 'OurCalling', info: 'Address: 1702 S Cesar Chavez Blvd, Dallas, TX 75215'},
    {lat: 32.77609360079064, lng: -96.7916827976674, title: 'The Bridge Homeless Recovery Center', info: 'Address: 1818 Corsicana St, Dallas, TX 75201'},
    {lat: 32.77837315130932, lng: -96.77639948380472, title: 'Austin Street Center', info: 'Address: 1717 Jeffries St, Dallas, TX 75226'},
    {lat: 32.77875652148801, lng: -96.77579330456533, title: 'Shelter Minitries', info: 'Address: 2929 Hickory St, Dallas, TX 75226'},
    {lat: 32.77191778092708, lng: -96.79806134027845, title: 'Dallas Life', info: 'Address: 1100 Cadiz St, Dallas, TX 75215'},
    {lat: 32.77063567359763, lng: -96.7659641725375, title: 'Dallas Homeless Services Department', info: 'Address: 2922 Martin Luther King Jr Blvd, Dallas, TX 75215'},
    {lat: 32.77868800756224, lng: -96.79368221768196, title: 'The Stewpot', info: 'Address: 1835 Young St, Dallas, TX 75201'},
    {lat: 32.79218507125334, lng: -96.76507172523488, title: 'Shared Housing Center', info: 'Address: 4611 Eastside Ave, Dallas, TX 75226'},
    {lat: 32.789385558655404, lng: -96.78805729984441, title: 'Housing Crisis Center', info: 'Address: 2800 Live Oak St, Dallas, TX 75204'},
    {lat: 32.80706641343638, lng: -96.82818108932344, title: 'Genesis Women\'s Shelter Outreach Office', info: 'Address: 2023 Lucas Dr, Dallas, TX 75219'},
    {lat: 32.812817884822564, lng: -96.82914523482917, title: 'Union Gospel Mission - Center of Hope', info: 'Address: 4815 Cass St, Dallas, TX 75235'},
    {lat: 32.81351829635036, lng: -96.83738458875744, title: 'Salvation Army', info: 'Address: 5302 Harry Hines Blvd, Dallas, TX 75235'},
    {lat: 32.81018263143326, lng: -96.86007046383432, title: 'Housing Forward', info: 'Address: 3000 Pegasus Park Dr, Dallas, TX 75247'},
    {lat: 32.82290266615259, lng: -96.8631133177535, title: 'Simmons Family Gateway Resource Center', info: 'Address: 1421 W Mockingbird Ln Suite C, Dallas, TX 75247'}
  ]

  const eventIDs = [{lat: 30.25962444640977, lng: -97.70933145235303, title: 'We Can Now Outreach', info: '12 pm: water, food, hygeine, clothes', day: 7, hour: 12}]

  // Get the current date
  var currentDate = new Date();
  // Get the current day of the week as a number (1-7)
  var currentDay = currentDate.getDay();

  eventIDs.forEach(event => {
    if (event.day === currentDay) {
      createMarkerForPlace(event);
    }
  });

  // Function to create a marker for each Place ID
  placeIds.forEach(placeId => {
    createMarkerForPlace(placeId);
  });

  // Update marker opacity based on zoom level
  function updateMarkerVisibility() {
    var zoom = map.getZoom();
    var visible = zoom < 15;
    markers.forEach(marker => {
      marker.setVisible(visible);
    });
  }

  map.addListener('zoom_changed', updateMarkerVisibility);
  updateMarkerVisibility();

  // Create a button and set its properties
  var pointSelectionButton = document.createElement('button');
  pointSelectionButton.title = 'Select a point on the map and tell us what\'s going on';
  pointSelectionButton.style.backgroundImage = 'url(https://trevor-nomadik.github.io/webflow-js/assets/point_button.png)'; 
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
  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(pointSelectionButton);

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
        const descriptionJson = {
          type: 'INFO',
          details: userInput
        };
        const descriptionJsonString = JSON.stringify(descriptionJson);
        const payload = {
            type: "text_observation",
            location: {
                latitude_deg: clickedLat,
                longitude_deg: clickedLng
            },
            description: descriptionJsonString
        };
        sendDataToServer(payload);
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

  // Create a heatmap data array
  var heatmapData = [];

  // Create a heatmap layer
  var heatmap = new google.maps.visualization.HeatmapLayer({
    data: heatmapData,
    map: map
  });

  // Fetch heatmap data from your server
  fetchReport().then(data => {
    // Update heatmap data array
    heatmapData = data;
    // Set heatmap data
    heatmap.setData(heatmapData);
  });


  function fetchReport() {
    return fetch('https://f99lmwcs34.execute-api.us-east-2.amazonaws.com/beta/reports/latest')
      .then(response => response.json())
      .then(data => {
        const debrisHeatmap = data["DEBRIS_REPORT"]["heatmap"];
        const fireReports = data["ONGOING_FIRE_REPORT"]["features"];
        const polygons = data["ENCAMPMENT_REPORT"];
        const trailMapData = data["TRAILMAP_REPORT"]["features"];
        addTrailsToMap(trailMapData); 

        map.data.addGeoJson(polygons);

        const encampmentCounts = {
          greenBeltCamps: 31, // 5/22
          parkCamps: 18,
          campsNearSchools: 24
        };
      
        // Update the text values
        document.getElementById('total-camps').innerText = `Total Camps: (${polygons.features.length})`;
        document.getElementById('greenbelt-camps').innerText = `Green Belt Camps: (${encampmentCounts.greenBeltCamps})`;
        document.getElementById('park-camps').innerText = `Park Camps: (${encampmentCounts.parkCamps})`;
        document.getElementById('camps-near-schools').innerText = `Camps Near Schools: (${encampmentCounts.campsNearSchools})`;

        // Handle Debris Heatmap
        const debrisHeatmapData = debrisHeatmap.map(point => ({
          location: new google.maps.LatLng(point.lat, point.lng),
          weight: point.weight
        }));

        // Handle Fire Reports
        fireReports.forEach(report => {
          createFireReportMarker(report);
        });
    
        populatePolygonList(polygons.features); // Initial population of the list

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
    
        searchInput.addEventListener('input', function() {
          const searchTerm = searchInput.value.toLowerCase();
          const filteredFeatures = polygons.features.filter(feature => 
            feature.properties.name.toLowerCase().includes(searchTerm)
          );
          populatePolygonList(filteredFeatures);
        });

        return debrisHeatmapData;
      })
      .catch(error => {
        console.error('Error fetching report data:', error);
        return []; 
      });
  }

  function addTrailsToMap(trailMapData) {
    trailMapData.forEach(trail => {
      const trailCoordinates = trail.geometry.coordinates.map(coord => ({ lat: coord[1], lng: coord[0] }));
      const trailPolyline = new google.maps.Polyline({
        path: trailCoordinates,
        geodesic: true,
        strokeColor: trail.properties.stroke,
        strokeOpacity: 1.0,
        strokeWeight: 4
      });
      trailPolyline.setMap(map);
    });
  }

  function createFireReportMarker(report) {
    const coords = report.geometry.coordinates;
    const fireReportLatLng = new google.maps.LatLng(coords[1], coords[0]); // Note: GeoJSON coordinates are [lng, lat]
    
    const marker = new google.maps.Marker({
      map: map,
      position: fireReportLatLng,
      title: report.properties.description,
      icon: {
        url: 'https://trevor-nomadik.github.io/webflow-js/assets/fire_dept.png',
        scaledSize: new google.maps.Size(25, 25),
      }
    });

    google.maps.event.addListener(marker, 'click', function() {
      resourceWindow.setContent('<div><strong>' + report.properties.description + '</strong><br>');
      resourceWindow.open(map, this);
      resourceWindowOpened = true;
    });
  }

  function zoomToFeature(feature, map) {
    const bounds = new google.maps.LatLngBounds();
    const geometry = feature.geometry;
    if (geometry.type === 'Polygon') {
        geometry.coordinates[0].forEach(coord => {
            bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
        });
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
            polygon[0].forEach(coord => {
                bounds.extend(new google.maps.LatLng(coord[1], coord[0]));
            });
        });
    }
    map.fitBounds(bounds);
  }
  
  map.data.setStyle(function(feature) {
    return {
      strokeColor: feature.getProperty('stroke'),
      strokeWeight: feature.getProperty('stroke-width')
    };
  });

  var toggleCampsControlDiv = document.createElement('div');
  var toggleHeatmapControlDiv = document.createElement('div');

  var toggleCampsButton = document.createElement('button');
  var toggleHeatmapButton = document.createElement('button');

  toggleCampsButton.textContent = 'Toggle Camps';
  toggleHeatmapButton.textContent = 'Toggle Debris';

  toggleCampsControlDiv.className = 'custom-control';
  toggleHeatmapControlDiv.className = 'custom-control';

  toggleCampsButton.addEventListener('click', function() {
    toggleCamps();
  });

  toggleHeatmapButton.addEventListener('click', function() {
    toggleHeatmap();
  });

  toggleCampsControlDiv.appendChild(toggleCampsButton);
  toggleHeatmapControlDiv.appendChild(toggleHeatmapButton);

  map.controls[google.maps.ControlPosition.TOP_LEFT].push(toggleCampsControlDiv);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(toggleHeatmapControlDiv);

  function toggleCamps() {
    map.data.setMap(map.data.getMap() ? null : map);
  }

  function toggleHeatmap() {
    heatmap.setMap(heatmap.getMap() ? null : map);
  }
  
  var infoWindow = new google.maps.InfoWindow();
  var infoWindowOpened = false;

  map.data.addListener('click', function(event) {
    infoWindowOpened = true;
    var name = event.feature.getProperty('name');
    var inventory = event.feature.getProperty('inventory');
    var populationAVG = inventory ? inventory.populationAVG : "Unknown";
    var cityCouncilDistrict = event.feature.getProperty('council-district');
    var apdDistrict = event.feature.getProperty('police-district');
  
    cityCouncilDistrict = cityCouncilDistrict.length > 0 ? cityCouncilDistrict.join(", ") : "None";
    apdDistrict = apdDistrict.length > 0 ? apdDistrict.join(", ") : "None";
  
    var hazardIcons = {
      "PROPANE": 'https://trevor-nomadik.github.io/webflow-js/assets/hazard_pictograms/explosive.png',
      "GASOLINE": 'https://trevor-nomadik.github.io/webflow-js/assets/hazard_pictograms/flammable.png',
      "NEEDLES": 'https://trevor-nomadik.github.io/webflow-js/assets/hazard_pictograms/harmful.png',
      "CHEMICAL WASTE": 'https://trevor-nomadik.github.io/webflow-js/assets/hazard_pictograms/corrosive.png',
      "HUMAN WASTE": 'https://trevor-nomadik.github.io/webflow-js/assets/hazard_pictograms/health_hazard.png',
      "HEROIN": 'https://trevor-nomadik.github.io/webflow-js/assets/hazard_pictograms/toxic.png'
    };
  
    var combinedItems = [];
    if (inventory) {
      combinedItems = (inventory.materialsReported || []).concat(inventory.paraphernaliaReported || []);
    }
    var toxicItems = ["HEROIN", "METH", "FENTANYL"];
    var iconsHtml = '';
    
    combinedItems.forEach(function(item) {
      if (toxicItems.includes(item)) {
        iconsHtml += `
          <div class="icon-container" style="display:inline-block;position:relative;">
            <img src="https://trevor-nomadik.github.io/webflow-js/assets/hazard_pictograms/toxic.png" style="width:24px;height:24px;vertical-align:middle;margin-right:5px;">
            <span class="tooltip-text" style="visibility:hidden;width:120px;background-color:black;color:#fff;text-align:center;border-radius:5px;padding:5px;position:absolute;bottom:125%;left:50%;transform:translateX(-50%);">Toxic substances reported: ${item}</span>
          </div>`;
      } else if (hazardIcons[item]) {
        iconsHtml += `
          <div class="icon-container" style="display:inline-block;position:relative;">
            <img src="${hazardIcons[item]}" style="width:24px;height:24px;vertical-align:middle;margin-right:5px;">
            <span class="tooltip-text" style="visibility:hidden;width:120px;background-color:black;color:#fff;text-align:center;border-radius:5px;padding:5px;position:absolute;bottom:125%;left:50%;transform:translateX(-50%);">Hazard reported: ${item}</span>
          </div>`;
      }
    });
  
    var contentString = `
    <div style="position:relative;">
      <div style="position:absolute;bottom:0;right:0;">
        <img src="https://img.icons8.com/ios-filled/50/000000/share.png" id="shareIcon" style="width:16px;height:16px;cursor:pointer;">
      </div>
      <div>
        <strong>${name}</strong>
      </div>
      <div>
        Population Estimate: ${populationAVG}
      </div>
      <div>
        City Council District(s): ${cityCouncilDistrict}
      </div>
      <div>
        APD District(s): ${apdDistrict}
      </div>
      <div>
        ${iconsHtml}
      </div>
      <div>Still here?</div>
      <button id="yesBtn">Yes</button>
      <button id="noBtn">No</button>
    </div>
  `;
  
    infoWindow.setContent(contentString);
  
    infoWindow.setPosition(event.latLng);
    var clickedLat = event.latLng.lat();
    var clickedLng = event.latLng.lng();
  
    infoWindow.open(map);
  
    google.maps.event.addListenerOnce(infoWindow, 'domready', function() {
      document.getElementById('yesBtn').addEventListener('click', function() {
        var descriptionString = JSON.stringify({
          polygonName: name,
          'type': 'PRESENCE',
          response: true
        });
        var payload = { 
          type: "polygon_observation",
          location: {
              latitude_deg: clickedLat,
              longitude_deg: clickedLng
          },
          description: descriptionString
        }
        sendDataToServer(payload);
        infoWindow.close();
      });
  
      document.getElementById('noBtn').addEventListener('click', function() {
        var descriptionString = JSON.stringify({
          polygonName: name,
          'type': 'PRESENCE',
          response: false
        });
        var payload = { 
          type: "polygon_observation",
          location: {
              latitude_deg: clickedLat,
              longitude_deg: clickedLng
          },
          description: descriptionString
        }
        sendDataToServer(payload);
        infoWindow.close();
      });

      document.getElementById('shareIcon').addEventListener('click', function() {
        var shareUrl = `https://nomadik.ai/?lat=${clickedLat}&lng=${clickedLng}&zoom=15`;
        navigator.clipboard.writeText(shareUrl).then(function() {
          alert('URL copied to clipboard: ' + shareUrl);
        }).catch(function(error) {
          console.error('Error copying URL: ', error);
        });
      });
  
      var iconContainers = document.getElementsByClassName('icon-container');
      for (var i = 0; i < iconContainers.length; i++) {
        iconContainers[i].addEventListener('mouseover', function() {
          var tooltip = this.querySelector('.tooltip-text');
          var rect = this.getBoundingClientRect();
          tooltip.style.visibility = 'visible';
          tooltip.style.bottom = '125%';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translateX(-50%)';

          var infoWindowRect = document.querySelector('.gm-style-iw').getBoundingClientRect();

          if (rect.left + tooltip.offsetWidth / 2 > infoWindowRect.right) {
            tooltip.style.left = 'auto';
            tooltip.style.right = '0';
            tooltip.style.transform = 'translateX(0)';
          } else if (rect.right - tooltip.offsetWidth / 2 < infoWindowRect.left) {
            tooltip.style.left = '0';
            tooltip.style.right = 'auto';
            tooltip.style.transform = 'translateX(0)';
          }
        });
        iconContainers[i].addEventListener('mouseout', function() {
          this.querySelector('.tooltip-text').style.visibility = 'hidden';
        });
      }
    });
  });
  
  google.maps.event.addListener(map, 'click', function() {
      if (infoWindowOpened) {
          infoWindowOpened = false;
          infoWindow.close();
      }
      if (resourceWindowOpened) {
        resourceWindowOpened = false;
        resourceWindow.close();
      }
  });

  google.maps.event.addListener(map, 'rightclick', function(event) {
    var clickedLat = event.latLng.lat();
    var clickedLng = event.latLng.lng();

    var userInput = prompt("What's going on here?", "");

    if (userInput !== null && userInput !== "") {
      const descriptionJson = {
        type: 'INFO',
        details: userInput
      };
      const descriptionJsonString = JSON.stringify(descriptionJson);
      const payload = {
          type: "text_observation",
          location: {
              latitude_deg: clickedLat,
              longitude_deg: clickedLng
          },
          description: descriptionJsonString
      };
      sendDataToServer(payload);
    }
  });

  function sendDataToServer(payload) {
      fetch('https://f99lmwcs34.execute-api.us-east-2.amazonaws.com/beta/submitPOI', {
        method: 'POST',
        headers: {
          'Origin': 'https://www.nomadik.ai',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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