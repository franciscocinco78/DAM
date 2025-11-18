import { database } from './firebase.js';
import { ref, onChildAdded, get, set, onChildChanged, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Reference to the messages node
// const messagesRef = ref(database, 'messages');
const layoutRef = ref(database, 'layout');
var darkModeVar = false; // Variable to set light or dark mode
const darkModeVarKey = 'darkModeVar'; // Key to save dark mode variable in local storage

// // Listen for new messages
// onChildAdded(messagesRef, (data) => {
//   const message = data.val();
//   // @todo process received messages
//   // displayMessage(message.name, message.text, message.type);
// });

// // Function to display message
// function displayMessage(name, text, type) {
//     const alertDiv = document.createElement('div');
//     alertDiv.className = `alert alert-${type}`;
//     alertDiv.textContent = text;
//     alertDiv.sensorName = name;
//     const messagesContainer = document.getElementById('messages');
//     messagesContainer.insertBefore(alertDiv, messagesContainer.firstChild);
// }

$(document).ready(function () {

  const pageNum = $('#pageID').val();
  if (pageNum === '1') {
    page1();
  } else if (pageNum === '2') {
    page2();
  } else if (pageNum === '3') {
    page3();
  } else {
    console.error('Something went wrong with the page identifier.');
  }


});



// ------------------- dark mode code: -------------------

const funcDarkModeSwitch = $('#darkModeSwitch');
funcDarkModeSwitch.on('click', function () {
  //console.log(`darkModeVar was: ${darkModeVar}`);
  //console.log(`darkModeVar will be: ${!darkModeVar}`);
  darkModeVar = !darkModeVar;
  if (darkModeVar) {
    darkMode()
  } else {
    lightMode()
  }
  //console.log(`darkModeVar set to: ${darkModeVar}`);
});

function darkMode() {
  let element = document.body;
  //let content = document.getElementById("DarkModetext");
  element.className = "dark-mode";
  //console.log(`-- set dark mode`);
}
function lightMode() {
  let element = document.body;
  //let content = document.getElementById("DarkModetext");
  element.className = "light-mode";
  //console.log(`-- set light mode`);
}

// ------------------- on load function -------------------

$(window).on('load', function () {
  darkModeVar = localStorage.getItem(darkModeVarKey) === 'true';
  if (darkModeVar) {
    darkMode();
    funcDarkModeSwitch.prop('checked', true);
  } else { // just in case the default workflow is changed in the future..
    lightMode();
    funcDarkModeSwitch.prop('checked', false);
  }
});

// ------------------- local storage & before unload function -------------------

// Save variables to local storage just before leaving the page
window.addEventListener('beforeunload', function () {
  localStorage.clear();
  localStorage.setItem(darkModeVarKey, darkModeVar);
  //console.log(`saved dark mode variabe: ${darkModeVar}`);
  // e.preventDefault(); // ask confirmation when closing the window
  return null;
});


// ------------------- page 1 functions -------------------

function page1() {
  // Info Button Alert
  // document.getElementById('info-btn').addEventListener('click', () => {
  //   alert(
  //     "Welcome to Perfect Greenhouse!\n\n" +
  //     "- Use the Dark Mode switch to toggle the webpage theme.\n" +
  //     "- Click 'Show Map' to display the location map and pick a location by clicking on the map.\n" +
  //     "- View current, max, and min temperatures in the Temperature Data card.\n\n" +
  //     "Explore and manage your greenhouse with ease!"
  //   );
  //});

  // Initialize the map
  const map = L.map('map').setView([39.833333, -8.612222], 13); // Default to Leiria, Portugal
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 25,
  }).addTo(map);

  // Define the marker variable
  const marker = L.marker([39.833333, -8.612222]).addTo(map);
  function updateLocations() {
    const locations = [];
    get(ref(database, 'locations')).then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const key = childSnapshot.key;
          const value = childSnapshot.val();
          console.log('Vaule:', value);
          if (value.sectionName) {
            locations.push({ lat: value.lat, lng: value.lng, sectionName: value.sectionName });
          }
        });
      }
      console.log(locations);
    }).catch((error) => {
      console.error('Error fetching locations from database:', error);
    });
    return locations;
  }

  let locations = updateLocations();

  // Highlight the current marker
  function highlightMarker(index) {
    locations.forEach((location, i) => {
      if (i === index) {
        marker.setLatLng([location.lat, location.lng]);
        map.setView(marker.getLatLng(), 13); // Center on the selected marker
        fetchLocation(location.lat, location.lng);
      }
    });
  }



  // // Add markers and store them in a list
  // const markers = [
  //   L.marker([39.833333, -8.612222]).addTo(map), // Leiria
  //   L.marker([38.716667, -9.133333]).addTo(map), // Lisbon
  //   L.marker([41.14961, -8.61099]).addTo(map), // Porto
  // ];

  let selectedIndex = 0; // Track the current selected marker
  // highlightMarker(selectedIndex);

  // // Fetch location data for each marker
  // markers.forEach(marker => {
  //   fetchLocation(marker.getLatLng().lat, marker.getLatLng().lng);
  // });

  // Fetch location data
  async function fetchLocation(lat, lng) {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await response.json();
      console.log(data);
      const city = data.address.city || "Unknown location";
      const town = data.address.county || "Unknown location";
      const village = data.address.city_district || "Unknown location";
      const city_name = $('#city-name');
      const town_name = $('#town-name');
      const village_name = $('#village-name');
      localStorage.setItem('city_map', city);
      localStorage.setItem('town_map', town);
      localStorage.setItem('village_map', village);
      city_name.text(city);
      town_name.text(town);
      village_name.text(village);
      return { city, town, village };
    } catch (error) {
      console.error('Error fetching location data:', error);
    }
  }
  // Highlight the current marker
  function highlightMarker(index) {
    locations.forEach((location, i) => {
      if (i === index) {
        marker.setLatLng([location.lat, location.lng]);
        map.setView(marker.getLatLng(), 13); // Center on the selected marker
        fetchLocation(location.lat, location.lng);
      }
    });
  }

  document.getElementById('left-btn').addEventListener('click', () => {

    selectedIndex = (selectedIndex - 1 + locations.length) % locations.length; // Wrap around
    highlightMarker(selectedIndex);
    updateZoneLabel();
    fetchWeatherForLocation(locations[selectedIndex].lat, locations[selectedIndex].lng);
  });
  document.getElementById('right-btn').addEventListener('click', () => {
    selectedIndex = (selectedIndex + 1) % locations.length; // Wrap around
    highlightMarker(selectedIndex);
    updateZoneLabel();
    fetchWeatherForLocation(locations[selectedIndex].lat, locations[selectedIndex].lng);
  });

  function fetchWeatherForLocation(lat, lng) {
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/weather?units=metric&lat=${lat}&lon=${lng}&appid=cedf58223ea889a325c281a9a5a62999`,
      dataType: 'json'
    }).done(function (data) {
      console.log(data);
      const temp = data.main.temp;
      const max = data.main.temp_max;
      const min = data.main.temp_min;
      const hum = data.main.humidity;
      const feels = data.main.feels_like;
      const press = data.main.pressure;
      const temperature = $('#current-temp');
      const max_temp = $('#max-temperature');
      const min_temp = $('#min-temperature');
      const humidity = $('#humidity');
      const feels_like = $('#feels-like');
      const pressure = $('#pressure');
      temperature.text(temp);
      max_temp.text(max);
      min_temp.text(min);
      humidity.text(hum);
      feels_like.text(feels);
      pressure.text(press);
    }).fail(function () {
      console.error('Error fetching weather data');
    });
  }

  function updateZoneLabel() {
    const zoneLabel = document.getElementById('zone-label');
    console.log('hiiiiiiiii');
    console.log(locations[selectedIndex]);  
    if (locations[selectedIndex]) {
      if (zoneLabel) {
        zoneLabel.textContent = `${locations[selectedIndex].sectionName}`;
      } else {
        console.error('Element with id "zone-label" not found.');
      }
    } else {
      zoneLabel.textContent = 'Zone: Unknown';
    }
  }

  // Update location on map click
  map.on('click', function (e) {
    const { lat, lng } = e.latlng;
    marker.setLatLng([lat, lng]);
    fetchLocation(lat, lng);
  });

  // Toggle Map Visibility
  const mapCard = document.querySelector('.map-card');
  const toggleMapBtn = document.getElementById('toggle-map-btn');

  toggleMapBtn.addEventListener('click', () => {

    if (mapCard.style.display === 'none') {
      updateLocations();
      mapCard.style.display = 'block';
      toggleMapBtn.textContent = 'Hide Map';

      // Notify Leaflet to resize the map
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    } else {
      mapCard.style.display = 'none';
      toggleMapBtn.textContent = 'Show Map';
    }
  });

  // let lastFetchTime;
  // let tempChartInstance;

  function fetchWeather() {
    const temperature = $('#current-temp');
    const max_temp = $('#max-temperature');
    const min_temp = $('#min-temperature');
    const humidity = $('#humidity');
    const feels_like = $('#feels-like');
    const pressure = $('#pressure');

    // const lastUpdate = $('#last-update');

    var city_ = 'Leiria';
    localStorage.setItem('city', city_);
    console.log(city_)
    $.ajax({
      url: `https://api.openweathermap.org/data/2.5/weather?units=metric&q=${city_}&appid=cedf58223ea889a325c281a9a5a62999`,
      dataType: 'json'
    }).done(function (data) {
      console.log(data);
      const temp = data.main.temp;
      const max = data.main.temp_max;
      const min = data.main.temp_min;
      const hum = data.main.humidity;
      const feels = data.main.feels_like;
      const press = data.main.pressure;
      const lastUpdateDate = new Date(data.dt * 1000);
      console.log(lastUpdateDate);
      temperature.text(temp);
      max_temp.text(max);
      min_temp.text(min);
      humidity.text(hum);
      feels_like.text(feels);
      pressure.text(press);


    }).fail(function () {
      console.error('Error fetching weather data');
      // alert("Could not fetch weather data. Please check the city name.");
    });
  }
  $('#get-weather').click(function () {
    fetchWeather();
  });
  fetchWeather();
  const sectionNamesList = [];
  
  function updateSensorCards() {
    get(ref(database, 'layout')).then((snapshot) => {
      console.log(snapshot);
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const sectionName = childSnapshot.key;
          if (!sectionNamesList.includes(sectionName)) {
            sectionNamesList.push(sectionName);
          }
        });
      } else {
        console.log('No sections found in layout.');
      }
    }).catch((error) => {
      console.error('Error fetching layout:', error);
    });

    if (sectionNamesList.length === 1 && sectionNamesList[0] === 'default') {
      get(ref(database, `layout/default`)).then((sectionSnapshot) => {
      if (sectionSnapshot.exists()) {
        sectionSnapshot.forEach(() => {
        // const messageKey = messageSnapshot.key;
        // const messageData = messageSnapshot.val();
        // console.log(`Section: default, Message Key: ${messageKey}, Message Data:`, messageData);
        });
      }
      });
      updateZoneLabel();
      updateLocations();
      // Create cards for each sensor type and number
      get(ref(database, 'messages')).then((snapshot) => {
      if (snapshot.exists()) {
        const sensorTypeCounts = {};
        snapshot.forEach((childSnapshot) => {
        const messageKey = childSnapshot.key;
        const sensorType = messageKey.slice(0, -2); // Extract sensor type
        console.log(`Sensor type for ${messageKey}: ${sensorType}`);
        if (sensorTypeCounts[sensorType]) {
          sensorTypeCounts[sensorType]++;
        } else {
          sensorTypeCounts[sensorType] = 1;
        }
        });

        const maxCount = Math.max(...Object.values(sensorTypeCounts));
        console.log('Sensor type counts:', sensorTypeCounts);
        console.log('Max count:', maxCount);

        const cardsContainer = document.getElementById('cards-container') || document.createElement('div');
        if (!cardsContainer.id) {
        cardsContainer.id = 'cards-container';
        document.body.appendChild(cardsContainer);
        console.log('Created element with ID "cards-container".');
        }

        // Clear existing cards
        cardsContainer.innerHTML = '';

        for (let i = 0; i < maxCount; i += 2) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'row';

        for (let j = 0; j < 2; j++) {
          if (i + j < maxCount) {
          const colDiv = document.createElement('div');
          colDiv.className = 'col-md-6';

          const cardDiv = document.createElement('div');
          cardDiv.className = 'card mb-3';
          cardDiv.style.marginTop = '10px'; // Add space above the new card
          const cardNumber = i + j + 1;
          cardDiv.innerHTML = `
            <div class="card-header">Zone ${cardNumber}</div>
            <div class="card-body" id="card-body-${cardNumber}">
            </div>
            <div class="card-footer" id="card-footer-${cardNumber}">
            Last updated: N/A
            </div>
          `;

          colDiv.appendChild(cardDiv);
          rowDiv.appendChild(colDiv);
          }
        }

        cardsContainer.appendChild(rowDiv);
        }

        // Add sensors to each card
        snapshot.forEach((childSnapshot) => {
        const messageKey = childSnapshot.key;
        const sensorNumber = parseInt(messageKey.slice(-2)); // Extract sensor number
        const cardBody = document.getElementById(`card-body-${sensorNumber}`);
        const cardFooter = document.getElementById(`card-footer-${sensorNumber}`);
        if (cardBody) {
          const sensorDetail = document.createElement('p');
          sensorDetail.className = 'card-text d-flex justify-content-between';
          const messageKeySpan = document.createElement('span');

          // Change the name of the sensor based on its prefix
          let sensorName = messageKey;
          // let dataRef; // Removed as it is not used
          if (messageKey.startsWith('hum_') || messageKey.startsWith('light_') || messageKey.startsWith('temp_') || messageKey.startsWith('button_')) {
          dataRef = ref(database, `messages/${messageKey}`);
          } else if (messageKey.startsWith('light_01_a') || messageKey.startsWith('water_') || messageKey.startsWith('BlueLED_') || messageKey.startsWith('YellowLED_') || messageKey.startsWith('RedLED_') || messageKey.startsWith('WhiteLED_') || messageKey.startsWith('GreenLED_')) {
          dataRef = ref(database, `actuators/${messageKey}`);
          }
          if (messageKey.startsWith('hum_')) {
          sensorName = 'Humidity ' + sensorNumber;
          } else if (messageKey.startsWith('light_')) {
          sensorName = 'Light ' + sensorNumber;
          } else if (messageKey.startsWith('temp_')) {
          sensorName = 'Temperature ' + sensorNumber;
          } else if (messageKey.startsWith('button_')) {
          sensorName = 'Button ' + sensorNumber;
          } else if (messageKey.startsWith('light_01_a') || messageKey.startsWith('water_') || messageKey.startsWith('BlueLED_') || messageKey.startsWith('YellowLED_') || messageKey.startsWith('RedLED_') || messageKey.startsWith('WhiteLED_') || messageKey.startsWith('GreenLED_')) {
          dataRef = ref(database, `actuators/${messageKey}`);
          if (messageKey.startsWith('light_01_a')) {
            sensorName = 'Light 01 A ' + sensorNumber;
          } else if (messageKey.startsWith('water_')) {
            sensorName = 'Water Pump ' + sensorNumber;
          } else if (messageKey.startsWith('BlueLED_')) {
            sensorName = 'Blue LED ' + sensorNumber;
          } else if (messageKey.startsWith('YellowLED_')) {
            sensorName = 'Yellow LED ' + sensorNumber;
          } else if (messageKey.startsWith('RedLED_')) {
            sensorName = 'Red LED ' + sensorNumber;
          } else if (messageKey.startsWith('WhiteLED_')) {
            sensorName = 'White LED ' + sensorNumber;
          } else if (messageKey.startsWith('GreenLED_')) {
            sensorName = 'Green LED ' + sensorNumber;
          }
          }

          messageKeySpan.textContent = sensorName;
          const contentSpan = document.createElement('span');

          // Fetch the sensor data from the appropriate reference
          function updateSensorData() {
          get(dataRef).then((messageSnapshot) => {
            if (messageSnapshot.exists()) {
            const messageData = messageSnapshot.val();
            contentSpan.textContent = messageData.content;
            const lastUpdate = new Date(messageSnapshot.val().datetime || Date.now());
            const timeAgo = Math.floor((Date.now() - lastUpdate.getTime()) / 1000);
            let timeAgoText = `${timeAgo} seconds ago`;
            if (timeAgo > 86400) {
              const days = Math.floor(timeAgo / 86400);
              const hours = Math.floor((timeAgo % 86400) / 3600);
              const minutes = Math.floor((timeAgo % 3600) / 60);
              const seconds = timeAgo % 60;
              timeAgoText = `${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds ago`;
            } else if (timeAgo > 3600) {
              const hours = Math.floor(timeAgo / 3600);
              const minutes = Math.floor((timeAgo % 3600) / 60);
              const seconds = timeAgo % 60;
              timeAgoText = `${hours} hours, ${minutes} minutes, and ${seconds} seconds ago`;
            } else if (timeAgo > 60) {
              const minutes = Math.floor(timeAgo / 60);
              const seconds = timeAgo % 60;
              timeAgoText = `${minutes} minutes and ${seconds} seconds ago`;
            }
            cardFooter.textContent = `Last updated: ${timeAgoText}`;
            } else {
            contentSpan.textContent = 'No data';
            }
          }).catch((error) => {
            console.error('Error fetching sensor data:', error);
            contentSpan.textContent = 'Error';
          });
          }

          if (dataRef) {
          updateSensorData();
          const intervalId = setInterval(updateSensorData, 2000);
          cardBody.dataset.intervalId = intervalId;
          } else {
          console.error('dataRef is not defined for messageKey:', messageKey);
          }

          sensorDetail.appendChild(messageKeySpan);
          sensorDetail.appendChild(contentSpan);
          cardBody.appendChild(sensorDetail);
        }
        });

        // Center the last card if the total number of cards is odd
        if (maxCount % 2 !== 0) {
        const lastCard = cardsContainer.lastChild.lastChild;
        lastCard.className += ' mx-auto';
        }
      }
      }).catch((error) => {
      console.error('Error fetching messages:', error);
      });
    } else {
      sectionNamesList.forEach((sectionName) => {
      if (sectionName !== 'default') {
        get(ref(database, `layout/${sectionName}`)).then((sectionSnapshot) => {
        if (sectionSnapshot.exists()) {
          sectionSnapshot.forEach((messageSnapshot) => {
          const messageKey = messageSnapshot.key;
          const messageData = messageSnapshot.val();
          if (messageKey !== 'null') {
            console.log(`Section: ${sectionName}, Message Key: ${messageKey}, Message Data:`, messageData);
            if (!document.getElementById(`card-body-${sectionName}`)) {
            const sectionCard = document.createElement('div');
            sectionCard.className = 'card mb-3';
            sectionCard.innerHTML = `
              <div class="card-header d-flex justify-content-between align-items-center">
              <button class="btn btn-primary btn-sm" id="new_loc_${sectionName}">Set Location</button>
              <span class="mx-auto">${sectionName}</span>
              </div>
              <div class="card-body" id="card-body-${sectionName}">
              </div>
              <div class="card-footer" id="card-footer-${sectionName}">
              Last updated: N/A
              </div>
            `;
            const cardsContainer = document.getElementById('cards-container') || document.createElement('div');
            if (!cardsContainer.id) {
              cardsContainer.id = 'cards-container';
              document.body.appendChild(cardsContainer);
            }
            let rowDiv = cardsContainer.querySelector('.row:last-child');
            if (!rowDiv || rowDiv.children.length >= 2) {
              rowDiv = document.createElement('div');
              rowDiv.className = 'row';
              cardsContainer.appendChild(rowDiv);
            }
            const colDiv = document.createElement('div');
            colDiv.className = 'col-md-6';
            colDiv.appendChild(sectionCard);
            rowDiv.appendChild(colDiv);

            // Center the last card if the total number of cards is odd
            if (rowDiv.children.length === 1) {
              colDiv.className += ' mx-auto';
            }

            // Add event listener to the button to toggle the map visibility
            const toggleMapBtn = document.getElementById(`new_loc_${sectionName}`);
            toggleMapBtn.addEventListener('click', () => {
              console.log(`Button pressed from section: ${sectionName}`);
              if (mapCard.style.display === 'none') {
              updateLocations();
              mapCard.style.display = 'block';
              toggleMapBtn.textContent = 'Hide Map';
              const storedLocation = sessionStorage.getItem(`${sectionName}_location`);
              if (storedLocation) {
                const { lat, lng } = JSON.parse(storedLocation);
                marker.setLatLng([lat, lng]);
                map.setView([lat, lng], 13);
                fetchLocation(lat, lng);
              }
              const zoneNameElement = document.getElementById('zone-label');
              if (zoneNameElement) {
                zoneNameElement.textContent = `${sectionName}`;
              } else {
                console.error('Element with id "zone-label" not found.');
              }
              map.once('click', function (e) {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]);
                fetchLocation(lat, lng).then(({ city, town, village }) => {
                console.log(`Location set for ${sectionName}:`, { lat, lng, city, town, village });
                sessionStorage.setItem(`${sectionName}_location`, JSON.stringify({ lat, lng, name: 'Location', city, town, village }));
                set(ref(database, `locations/${sectionName}`), { lat, lng, city, town, village, sectionName});
                updateLocations();
                });
              });
              } else {
              mapCard.style.display = 'none';
              toggleMapBtn.textContent = 'Show Map';
              }
              setTimeout(() => {
              map.invalidateSize();
              }, 100);
            });
            }

            // Add sensor data to the card if it doesn't already exist
            const cardBody = document.getElementById(`card-body-${sectionName}`);
            const cardFooter = document.getElementById(`card-footer-${sectionName}`);
            if (cardBody && !cardBody.querySelector(`#sensor-${messageKey}`)) {
            const sensorDetail = document.createElement('p');
            sensorDetail.className = 'card-text d-flex justify-content-between';
            sensorDetail.id = `sensor-${messageKey}`;
            const messageKeySpan = document.createElement('span');

            // Change the name of the sensor based on its prefix and add appropriate icon
            let sensorName = messageKey;
            let iconClass = '';
            let iconColor = '';
            let dataRef;
            if (messageKey.startsWith('hum_')) {
              sensorName = 'Humidity ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-tint';
              iconColor = 'lightblue';
              dataRef = ref(database, `messages/${messageKey}`);
            } else if (messageKey.startsWith('LDR_')) {
              sensorName = 'Light Sensor ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-lightbulb';
              iconColor = 'yellow';
              dataRef = ref(database, `messages/${messageKey}`);
            } else if (messageKey.startsWith('temp_')) {
              sensorName = 'Temperature ' + parseInt(messageKey.slice(-2));
              iconClass = 'fa-solid fa-thermometer-half';
              iconColor = 'lightcoral';
              dataRef = ref(database, `messages/${messageKey}`);
            } else if (messageKey.startsWith('button_')) {
              sensorName = 'Button ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-toggle-on';
              iconColor = 'gray';
              dataRef = ref(database, `messages/${messageKey}`);
            } else if (messageKey.startsWith('water_')) {
              sensorName = 'Water Pump ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-water';
              iconColor = 'lightblue';
              dataRef = ref(database, `actuators/${messageKey}`);
            } else if (messageKey.startsWith('GreenLED_')) {
              sensorName = 'Green LED ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-lightbulb';
              iconColor = 'green';
              dataRef = ref(database, `actuators/${messageKey}`);
            } else if (messageKey.startsWith('YellowLED_')) {
              sensorName = 'Yellow LED ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-lightbulb';
              iconColor = 'yellow';
              dataRef = ref(database, `actuators/${messageKey}`);
            } else if (messageKey.startsWith('RedLED_')) {
              sensorName = 'Red LED ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-lightbulb';
              iconColor = 'red';
              dataRef = ref(database, `actuators/${messageKey}`);
            } else if (messageKey.startsWith('BlueLED_')) {
              sensorName = 'Blue LED ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-lightbulb';
              iconColor = 'lightblue';
              dataRef = ref(database, `actuators/${messageKey}`);
            } else if (messageKey.startsWith('WhiteLED_')) {
              sensorName = 'White LED ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-lightbulb';
              iconColor = 'lightw';
              dataRef = ref(database, `actuators/${messageKey}`);
            }  else if (messageKey.startsWith('light_')) {
              sensorName = 'Light Sensor ' + parseInt(messageKey.slice(-2));
              iconClass = 'fas fa-lightbulb';
              iconColor = 'yellow';
            }

            messageKeySpan.innerHTML = `<i class="${iconClass}" style="color: ${iconColor};"></i> ${sensorName}`;
            const contentSpan = document.createElement('span');

            // Fetch the sensor data from the messages node contentSpan = document.createElement('span');

            // Fetch the sensor data from the messages or actuators node
            function updateSensorData() {
              console.log(`Fetching sensor data`);
              get(dataRef).then((messageSnapshot) => {
              if (messageSnapshot.exists()) {
                const messageData = messageSnapshot.val();
                contentSpan.textContent = messageData.content;
              } else {
                contentSpan.textContent = 'No data';
              }
              }).catch((error) => {
              console.error('Error fetching sensor data:', error);
              contentSpan.textContent = 'Error';
              });
            }

            if (messageKey.startsWith('water_') || messageKey.includes('LED')) {
              dataRef = ref(database, `actuators/${messageKey}`);
            } else {
              dataRef = ref(database, `messages/${messageKey}`);
            }

            updateSensorData();
            setInterval(updateSensorData, 2000);

            sensorDetail.appendChild(messageKeySpan);
            sensorDetail.appendChild(contentSpan);
            cardBody.appendChild(sensorDetail);



            }
            // Update the card footer with the most recent datetime of the sensors
            function updateCardTimestamps() {
            sectionNamesList.forEach((sectionName) => {
              const cardFooter = document.getElementById(`card-footer-${sectionName}`);
              if (cardFooter) {
              get(ref(database, `layout/${sectionName}`)).then((snapshot) => {
                if (snapshot.exists()) {
                const sensors = snapshot.val();
                const sensorKeys = Object.keys(sensors);
                let mostRecentDatetime = 'N/A';

                const promises = sensorKeys.map((sensorKey) => {
                  return get(ref(database, `messages/${sensorKey}`)).then((sensorSnapshot) => {
                  if (sensorSnapshot.exists()) {
                    const sensorData = sensorSnapshot.val();
                    const datetime = sensorData.datetime || 'N/A';
                    if (datetime !== 'N/A' && (mostRecentDatetime === 'N/A' || new Date(datetime) > new Date(mostRecentDatetime))) {
                    mostRecentDatetime = datetime;
                    }
                  }
                  }).catch((error) => {
                  console.error('Error fetching sensor data:', error);
                  });
                });

                Promise.all(promises).then(() => {
                  cardFooter.textContent = `Last updated: ${mostRecentDatetime}`;
                }).catch((error) => {
                  console.error('Error processing sensor data:', error);
                  cardFooter.textContent = 'Last updated: Error';
                });
                } else {
                cardFooter.textContent = 'Last updated: N/A';
                }
              }).catch((error) => {
                console.error('Error fetching layout data:', error);
                cardFooter.textContent = 'Last updated: Error';
              });
              }
            });
            }

          // Call the function immediately and then every 5 seconds
          updateCardTimestamps();
          setInterval(updateCardTimestamps, 5000);
          }
          });
        }
        }).catch((error) => {
        console.error(`Error fetching section ${sectionName}:`, error);
        });
        
      }
      });
    }
    const cardNames = [];
  
    


  }

  // Call the function immediately and then every 5 seconds
  updateSensorCards();
  onChildChanged(ref(database, 'layout'), updateSensorCards);
  onChildChanged(ref(database, 'messages'), updateSensorCards);
  setInterval(updateLocations, 5000);
  setInterval(updateSensorCards, 2000);
}

// ------------------- page 2 functions -------------------
// Associate actions 
function page2() {
  // leave empty..
}

// ------------------- page 3 functions -------------------
// Manage sections and associated sensors
function page3() {
  console.log(`page 3 function called`);
  // dsplay new items added to default section
  onChildAdded(ref(database, 'layout/default'), (data) => {
    const sensorName = data.key;
    if (sensorName === 'null') return; // skip  
    const sensorItem = $('<li>')
      .addClass('list-group-item')
      .attr('draggable', 'true')
      .attr('ondragstart', 'drag(event)')
      .attr('id', sensorName)
      .text(sensorName);
    $('#default-items').append(sensorItem);
    // console.log(`(onChildAdded) displaying sensor: ${sensorName}`);
  });

  onChildAdded(ref(database, 'messages'), (data) => {
    const sensorName = data.key;
    get(ref(database, 'layout')).then((snapshot) => {
      let sectionNames = [];
      // create sections name list
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const sectionName = childSnapshot.key;
          sectionNames.push(sectionName);
        });
      }
      // check if this sensor already exists in any section
      const messageKey = sensorName;
      let found = false;
      const promises = sectionNames.map(sectionName =>
        get(ref(database, `layout/${sectionName}/${messageKey}`)).then((snapshot) => {
          if (snapshot.exists()) {
            found = true;
            console.log(`found ${messageKey} in section ${sectionName}`);
          }
        })
      );
      Promise.all(promises).then(() => {
        if (!found) { // if not found, add to default section
          const defaultRef = ref(database, `layout/default/${messageKey}`);
          set(defaultRef, {
            content: data.val().content,
            datetime: data.val().datetime || null
          });
          console.log(`added ${messageKey}  to default section`);
        }
      });
    });
  });


  // load things from database
  /* 
  @summary This code will load the sections and sensors from the database and display them in the page.
           It also ensures the 'default' section exists.
  Relevant ids:
  - categories-row, used by this code to knw where to add the sections
  - ${sectionName}-items, palced to later identify the zone where item-related html code should be inserted
  - ${sectionName}-section, used to identify the section, may be required for section deletion
  - ${sectionName}-action-delete, used to identify the delete button of each section
  */
  var sectionNames = [];
  get(ref(database, 'layout')).then((snapshot) => {
    // create cards for the existing sections
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const sectionName = childSnapshot.key;
        sectionNames.push(sectionName);
        // console.log(`Found section: ${sectionName}`);
        const categoriesRow = $('#categories-row');
        const zoneDiv = createZoneDiv(sectionName);
        if (sectionName === 'default') {
          categoriesRow.prepend(zoneDiv);
        } else {
          categoriesRow.append(zoneDiv);
        }
      });
      // display items of each section
      for (const sectionName of sectionNames) {
        get(ref(database, `layout/${sectionName}`)).then((snapshot) => {
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const sensorName = childSnapshot.key;
              if (sensorName === 'null') return; // always skip null items
              const sensorItem = $('<li>')
                .addClass('list-group-item')
                .attr('draggable', 'true')
                .attr('ondragstart', 'drag(event)')
                .attr('id', sensorName)
                .text(sensorName);
              $(`#${sectionName}-items`).append(sensorItem);
              // console.log(`Added sensor: ${sensorName}`);
            });
          } else {
            console.log(`No sensors found in section ${sectionName}`);
          }
        });
      }
    } else {
      if (!snapshot.exists()) {
        console.log('No sections found in database.');
        layoutRef.child('default').set({}); // @todo display the created default section
      }
    }
    // Check if 'default' section exists, if not create it
    if (!sectionNames.includes('default')) {
      sectionNames.push('default');
      const categoriesRow = $('#categories-row');
      const zoneDiv = createZoneDiv('default');
      categoriesRow.prepend(zoneDiv);
      set(ref(database, 'layout/default'), { null: true })
        .then(() => {
          console.log("Default section created successfully.");
        })
        .catch((error) => {
          console.error("Error creating default section:", error);
        });
    }
    // ensure all known sensors are shown
    // add non listed sensors to default section, and display them
    get(ref(database, 'messages')).then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          // console.warn(childSnapshot.key);
          const messageKey = childSnapshot.key;
          let found = false;
          const promises = sectionNames.map(sectionName =>
            get(ref(database, `layout/${sectionName}/${messageKey}`)).then((snapshot) => {
              if (snapshot.exists()) {
                found = true;
                // console.log(`Message ${messageKey} found in section ${sectionName}`);
              }
            })
          );
          Promise.all(promises).then(() => {
            if (!found) {
              const defaultRef = ref(database, `layout/default/${messageKey}`);
              set(defaultRef, {
                content: childSnapshot.val().content,
                datetime: childSnapshot.val().datetime || null
              });
              // console.log(`Message ${messageKey} added to default section`);
            }
          });
        });
      } else {
        console.log('No messages found in database.');
      }
    });

  });

  // Handle drag event to change items to another section
  $(document).on('dragstart', '.list-group-item', function (event) {
    event.originalEvent.dataTransfer.setData('text/plain', event.target.id);
  });

  window.allowDrop = function (event) {
    event.preventDefault();
  };

  window.drop = function (event) {
    event.preventDefault();
    const sensorId = event.dataTransfer.getData('text/plain'); // what was dragged
    let targetSectionId = event.target.id.replace('-items', ''); // where it was dropped
    let newTargetSectionId = false;
    const sectionNames = [];
    $('.card-body').each(function () { // get all section names by searching for .card-body class elements
      const sectionId = $(this).attr('id').replace('-items', '');
      sectionNames.push(sectionId);
    });
    if (!sectionNames.includes(targetSectionId)) {  // if the target section is not valid (e.g. the body of the card is valid, a sensor name is invalid)
      newTargetSectionId = $(`#${targetSectionId}`).closest('.card-body').attr('id').replace('-items', ''); // where it was dragged from
      console.warn(`Invalid target section: ${targetSectionId} ; moving to ${newTargetSectionId}`);
    }
    if (newTargetSectionId !== false) {
      targetSectionId = newTargetSectionId;
    }
    const sourceSectionId = $(`#${sensorId}`).closest('.card-body').attr('id').replace('-items', ''); // where it was dragged from

    moveItMoveIt(sensorId, sourceSectionId, targetSectionId);
  };

  // funciton for moving items between sections
  function moveItMoveIt(sensorId, sourceSectionId, targetSectionId) {
    if (sourceSectionId !== targetSectionId) { // if the item was moved to another section
      // Move item in the database
      const sensorDataRef = ref(database, `layout/${sourceSectionId}/${sensorId}`); // reference to the sensor data
      get(sensorDataRef).then((snapshot) => {
        if (snapshot.exists()) {
          const sensorData = snapshot.val();
          set(ref(database, `layout/${targetSectionId}/${sensorId}`), sensorData) // set in target location inside database
            .then(() => {
              remove(sensorDataRef); // remove from source location inside database

              // Move item in the UI
              $(`#${sensorId}`).appendTo(`#${targetSectionId}-items`);

              // Find the item with sensorId contained within the section of sourceSectionId
              const sourceSectionItems = $(`#${sourceSectionId}-items .list-group-item`);
              sourceSectionItems.each(function () {
                if ($(this).attr('id') === sensorId) {
                  $(this).remove();
                  // console.log(`Removed sensor ${sensorId} from ${sourceSectionId}`);
                }
              });

              console.log(`Moved sensor ${sensorId} from ${sourceSectionId} to ${targetSectionId}`);
            })
            .catch((error) => {
              console.error(`Error moving sensor ${sensorId}:`, error);
            });
        }
      });
    } else {
      console.log(`Wont move ${sensorId} into the same section.`);
    }
  }


  // Handle delete section event
  $(document).on('click', '[id$="-action-delete"]', function () {
    const sectionId = $(this).attr('id').replace('-action-delete', '');
    const sectionIndex = sectionNames.indexOf(sectionId);
    if (sectionIndex > -1) {
      const confirmDelete = confirm(`Are you sure you want to delete the section "${sectionId}"?`);
      if (confirmDelete) {

        get(ref(database, `layout/${sectionId}`)).then((snapshot) => { // check if section to be deleted contains something
          if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
              const sensorId = childSnapshot.key;
              if (sensorId !== 'null') {
                moveItMoveIt(sensorId, sectionId, 'default');
              }
            });
          }

          // delete the section only after moving the items to the default section (this has to be inside the other get section)
          sectionNames.splice(sectionIndex, 1);
          $(`#${sectionId}-section`).remove();
          remove(ref(database, `layout/${sectionId}`))
            .then(() => {
              console.log(`Section ${sectionId} deleted successfully.`);
            })
            .catch((error) => {
              console.error(`Error deleting section ${sectionId}:`, error);
            });
        });

      }
    }
  });

  // Handle add section event
  $('#page3-add-section').click(function () {
    let newNewSectionName = prompt('Enter new section name:');
    const validSectionName = /^[a-zA-Z0-9 ]+$/;
    newNewSectionName = newNewSectionName.trim();
    if (!validSectionName.test(newNewSectionName)) {
      alert('Section name can only contain alphanumeric characters and spaces.');
      return;
    } else if (newNewSectionName.toLowerCase() === 'default') {
      alert('The "default" section already exists.');
      return;
    } else if (newNewSectionName.toLowerCase() === 'null') {
      alert('The "null" section name is reserved.');
      return;
    } else if (newNewSectionName.trim() === '') {
      alert('Section name cannot be empty or contain only spaces.');
      return;
    }

    const newSectionName = newNewSectionName.replace(/\s+/g, '-'); // having spaces in the name will cause a lot of trouble
    if (newSectionName && !sectionNames.includes(newSectionName)) {
      sectionNames.push(newSectionName);
      const categoriesRow = $('#categories-row');
      const zoneDiv = createZoneDiv(newSectionName);
      if (newSectionName === 'default') {
        categoriesRow.prepend(zoneDiv);
      } else {
        categoriesRow.append(zoneDiv);
      }
      set(ref(database, `layout/${newSectionName}`), { null: true })
        .then(() => {
          // console.log("New section created successfully.");
        })
        .catch((error) => {
          console.error("Error creating new section:", error);
        });
      // remove(ref(database, `layout/${newSectionName}/null`)) // if the object is empty it wont be shown, so this option wont work
      //   .then(() => {
      //     console.log("Null property removed from new section.");
      //   })
      //   .catch((error) => {
      //     console.error("Error removing null property from new section:", error);
      //   });
    } else {
      alert('Section name is either empty or already exists.');
    }
  });

  document.getElementById('toggle-info').addEventListener('click', function () {
    var infoContent = document.getElementById('info-content');
    if (infoContent.style.display === 'none') {
      infoContent.style.display = 'block';
    } else {
      infoContent.style.display = 'none';
    }
  });

  // Trigger the toggle once on load
  document.getElementById('toggle-info').click();

  // // Info Button Alert -> removed
  // document.getElementById('info-btn').addEventListener('click', () => {
  //   var infoContent = document.getElementById('info-content');
  //   if (infoContent.style.display === 'none') {
  //     infoContent.style.display = 'block';
  //   } else {
  //     infoContent.style.display = 'none';
  //   }
  // });
}

function createZoneDiv(sectionName) { /* DO NOT EDIT THE CARDS LAYOUT AND RESPECTIVE CLASSES & ID & ETC */
  if (sectionName === 'default') {  // default section is not deletable
    return $(`
      <div class="col-md-4" id="${sectionName}-section">
        <div class="card border-dark mb-3">
          <div>
            <h4 class="text-center">
              <div class="card-header d-flex justify-content-between align-items-center">${sectionName}
              </div>
            </h4>
          </div>
          <div class="card" ondrop="drop(event)" ondragover="allowDrop(event)">
            <div class="card-body" id="${sectionName}-items">
              <p class="card-text"></p>
            </div>
          </div>
        </div>
      </div>
    `);
  }
  return $(`
    <div class="col-md-4" id="${sectionName}-section">
      <div class="card border-dark mb-3">
        <div>
          <h4 class="text-center">
            <div class="card-header d-flex justify-content-between align-items-center">${sectionName}
              <div>
                <button class="btn btn-danger" id="${sectionName}-action-delete">
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>
          </h4>
        </div>
        <div class="card" ondrop="drop(event)" ondragover="allowDrop(event)">
          <div class="card-body" id="${sectionName}-items">
            <p class="card-text"></p>
          </div>
        </div>
      </div>
    </div>
  `);
}