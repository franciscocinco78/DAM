import { database } from './firebase.js';
import { ref, onChildAdded, get, set, update, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

// Reference to the messages node
const messagesRef = ref(database, 'messages');
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
window.addEventListener('beforeunload', function (e) {
  localStorage.clear();
  localStorage.setItem(darkModeVarKey, darkModeVar);
  //console.log(`saved dark mode variabe: ${darkModeVar}`);
  e.preventDefault();
  return null;
});


// ------------------- page 1 functions -------------------

function page1() {
  // Info Button Alert
  document.getElementById('info-btn').addEventListener('click', () => {
    alert(
      "Welcome to Perfect Greenhouse!\n\n" +
      "- Use the Dark Mode switch to toggle the webpage theme.\n" +
      "- Click 'Show Map' to display the location map and pick a location by clicking on the map.\n" +
      "- View current, max, and min temperatures in the Temperature Data card.\n\n" +
      "Explore and manage your greenhouse with ease!"
    );
  });

    // Initialize the map
    const map = L.map('map').setView([39.833333, -8.612222], 13); // Default to Leiria, Portugal
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 25,
    }).addTo(map);

    // Add markers and store them in a list
    const markers = [
      L.marker([39.833333, -8.612222]).addTo(map), // Leiria
      L.marker([38.716667, -9.133333]).addTo(map), // Lisbon
      L.marker([41.14961, -8.61099]).addTo(map), // Porto
    ];

    let selectedIndex = 0; // Track the current selected marker
    highlightMarker(selectedIndex);

    // Fetch location data for each marker
    markers.forEach(marker => {
      fetchLocation(marker.getLatLng().lat, marker.getLatLng().lng);
    });

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
      } catch (error) {
        console.error('Error fetching location data:', error);
      }
    }

    // Highlight the current marker
    function highlightMarker(index) {
      markers.forEach((marker, i) => {
        console.log(marker);
        if (i === index) {
          marker.setIcon(L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          }));
          map.setView(marker.getLatLng(), 13); // Center on the selected marker
          fetchLocation(marker.getLatLng().lat, marker.getLatLng().lng);
        } else {
          marker.setIcon(L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
          }));
        }
      });
    }

    document.getElementById('left-btn').addEventListener('click', () => {
      selectedIndex = (selectedIndex - 1 + markers.length) % markers.length; // Wrap around
      highlightMarker(selectedIndex);
    });
    document.getElementById('right-btn').addEventListener('click', () => {
      selectedIndex = (selectedIndex + 1) % markers.length; // Wrap around
      highlightMarker(selectedIndex);
    });

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

  let lastFetchTime;
  let tempChartInstance;

  function fetchWeather() {
    const temperature = $('#current-temp');
    const max_temp = $('#max-temperature');
    const min_temp = $('#min-temperature');
    const humidity = $('#humidity');
    const feels_like = $('#feels-like');
    const pressure = $('#pressure');

    const lastUpdate = $('#last-update');

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
  setInterval(fetchWeather, 10000);

}

// ------------------- page 2 functions -------------------
// Associate actions 
function page2() {
  document.getElementById('info-btn').addEventListener('click', () => {
    alert(
      "Welcome to Perfect Greenhouse!\n\n" +
      "- Use the Dark Mode switch to toggle the webpage theme.\n" +
      "- ...\n" +
      "- ...\n\n" +
      "Explore and manage your greenhouse with ease!"
    );
  });
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
    newNewSectionName = newNewSectionName.trim();

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

  // Trigger the toggle again after 5 seconds
  setTimeout(function () {
    document.getElementById('toggle-info').click();
  }, 5000);

  // Info Button Alert
  document.getElementById('info-btn').addEventListener('click', () => {
    var infoContent = document.getElementById('info-content');
    if (infoContent.style.display === 'none') {
      infoContent.style.display = 'block';
    } else {
      infoContent.style.display = 'none';
    }
  });
}
