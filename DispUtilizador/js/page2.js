import { database } from './firebase.js';
import { ref, onChildAdded, get, set, onChildChanged, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const debug = false;

function debugLog(message) {
    if (debug) {
        console.log(`page2.js | ${message}`);
    }
}

/* variable 'ruleNames' is used to store the rule names 

*/
$(document).ready(function () {

    var sensorNames = [];
    var actuatorNames = [];

    // runs by default on start, so every name is retreived
    // it is running multiple times on start, which is not ideal..
    onChildAdded(ref(database, 'messages'), (data) => {
        const item = data.val();
        debugLog(`Item added: ${item}`);
        // console.log(item);
        if (item.type === 'sensor') { // if a sensor updated its value..
            get(ref(database, 'messages')).then((snapshot) => {
                if (snapshot.exists()) {
                    snapshot.forEach((childSnapshot) => {
                        const childItem = childSnapshot.val();
                        debugLog(`Item: ${childItem}`);
                        if (!childItem.type) {
                            console.log(`Item with key ${childSnapshot.key} has no type defined.`);
                        } else {
                            if (childItem.type.toLowerCase() === 'sensor' && !sensorNames.includes(childSnapshot.key)) {
                                sensorNames.push(childSnapshot.key);
                            } else if (childItem.type.toLowerCase() === 'actuator' && !actuatorNames.includes(childSnapshot.key)) {
                                actuatorNames.push(childSnapshot.key);
                            }
                        }
                    });
                    // console.log('Sensor names: ', sensorNames);
                } else {
                    console.warn('No messages found in database.');
                }
            });
        }
        updateLists();
    });

    // update all the dropdown lists every 10 seconds
    function updateLists() {
        const dropdownCount1 = $(`[id$='-drop-target-device-select']`).length;
        const dropdownCount2 = $(`[id$='-drop-trigger-device-select']`).length;
        const totalDropdownCount = dropdownCount1 + dropdownCount2;

        for (let i = 0; i < totalDropdownCount; i++) {
            const dropdown = $(`[id$='-drop-trigger-device-select']`).eq(i);
            dropdown.empty(); // Clear existing items
            for (const sensorName of sensorNames) {
                dropdown.append(`<li><a class="dropdown-item" href="#">${sensorName}</a></li>`);
            }
            const dropdown2 = $(`[id$='-drop-target-device-select']`).eq(i);
            dropdown2.empty(); // Clear existing items
            for (const actuatorName of actuatorNames) {
                dropdown2.append(`<li><a class="dropdown-item" href="#">${actuatorName}</a></li>`);
            }
        }
        // console.log('Updating lists...');
    }
    setInterval(updateLists, 20000); // update every 20 seconds, or using the onChildAdded callback
    setTimeout(updateLists, 1000);
    onChildAdded(ref(database, 'messages'), updateLists);
    onChildChanged(ref(database, 'messages'), updateLists);

    var ruleNames = [];
    // load things from database
    /* 
    @summary This code will load the sections and sensors from the database and display them in the page.
             It also ensures the 'default' section exists.
    Relevant ids:
    - categories-row, used by this code to knw where to add the sections
    - ${ruleName}-save-button-placeholder, div where the save button should be inserted (only when changes are pending)
    - ${ruleName}-action-save, send card content to firebase and remove the 'unsaved' id flag
    - ${ruleName}-unsaved, this is a flag to indicate that the card has pending changes, the background color is changed
    - ${ruleName}-action-delete, deletes the card 
    - ${ruleName}-rule, identifies the whole card, required for deletion
    - ${ruleName}-drop-trigger-device-name, text shown on the trigger device dropdown button
    - ${ruleName}-operatorDropdownMenuButton, text shown on the operator dropdown button
    - ${ruleName}-value, value input field
    - ${ruleName}-drop-target-device-name, text shown on the target device dropdown button
    - ${ruleName}-drop-action-name, text shown on the action dropdown button
    - ${ruleName}-drop-trigger-device-select, dropdown list for possible trigger devices
    - ${ruleName}-operator, dropdown list for possible operators
    - ${ruleName}-drop-target-device-select, dropdown list for possible target devices
    - ${ruleName}-drop-action-select, dropdown list for possible actions
    */
    get(ref(database, 'rules')).then((snapshot) => {
        // create cards for the existing rules
        if (snapshot.exists()) {
            snapshot.forEach((childSnapshot) => {
                const ruleName = childSnapshot.key;
                ruleNames.push(ruleName); // add item to out-of-scope variable
                // console.log(`Found section: ${ruleName}`);
                const cardsContainer = $('#categories-row'); // cards container name
                const ruleDiv = createRuleDiv(ruleName, false);
                cardsContainer.append(ruleDiv); // add div to html code (display content)
            });
            // set parameters of each rule
            for (const ruleName of ruleNames) {
                get(ref(database, `rules/${ruleName}`)).then((snapshot) => {
                    if (snapshot.exists()) {
                        snapshot.forEach((childSnapshot) => { // for each item under rules/sensorName (5 total)
                            const sensorName = childSnapshot.key;

                            if (sensorName === 'null') return; // always skip null items
                            if (sensorName === 'condition') {
                                const sensorItem = childSnapshot.val();
                                if (sensorItem === 'if-higher-than') {
                                    $(`#${ruleName}-operatorDropdownMenuButton`).text('>');
                                } else if (sensorItem === 'if-lower-than') {
                                    $(`#${ruleName}-operatorDropdownMenuButton`).text('<');
                                } else if (sensorItem === 'if-equal-to') {
                                    $(`#${ruleName}-operatorDropdownMenuButton`).text('=');
                                } else if (sensorItem === 'if-is-active') {
                                    $(`#${ruleName}-operatorDropdownMenuButton`).text('On');
                                } else if (sensorItem === 'if-is-deactivated') {
                                    $(`#${ruleName}-operatorDropdownMenuButton`).text('Off');
                                }

                            } else if (sensorName === 'conditionValue') {
                                const sensorItem = childSnapshot.val();
                                $(`#${ruleName}-value`).attr('placeholder', sensorItem);
                            } else if (sensorName === 'target') {
                                const sensorItem = childSnapshot.val();
                                $(`#${ruleName}-drop-target-device-name`).text(sensorItem);
                            } else if (sensorName === 'targetValue') {
                                const sensorItem = childSnapshot.val();
                                if (sensorItem === 'power-on') {
                                    $(`#${ruleName}-drop-action-name`).text('Power On');
                                } else if (sensorItem === 'power-off') {
                                    $(`#${ruleName}-drop-action-name`).text('Power Off');
                                } else if (sensorItem === 'toggle') {
                                    $(`#${ruleName}-drop-action-name`).text('Toggle');
                                }
                            } else if (sensorName === 'trigger') {
                                const sensorItem = childSnapshot.val();
                                $(`#${ruleName}-drop-trigger-device-name`).text(sensorItem);
                                //$(`#${ruleName}-drop-trigger-device-name`).append(sensorItem);
                            }
                            // console.log(`Added sensor: ${sensorName}`);
                        });
                        $(`#${ruleName}-unsaved`).attr('id', `${ruleName}-saved`);
                    } else {
                        console.warn(`No content found in rules for sensor ${ruleName}`);
                    }
                });
            }
        } else {
            if (!snapshot.exists()) {
                console.log('No rules found in database.');
                layoutRef.child('rules').set({});
            }
        }
    }); // end of get rules

    // on-click DELETE
    $(document).on('click', '[id$="-action-delete"]', function () {
        const ruleName = $(this).attr('id').replace('-action-delete', '');//$(this).attr('id').split('-')[0];
        if ($(`#${ruleName}-unsaved`).length) {
            const confirmDelete = confirm('This rule has unsaved changes. Are you sure you want to delete it?');
            if (!confirmDelete) {
                return;
            }
            $(`#${ruleName}-unsaved`).remove();
        } else {
            // console.log(`Delete button clicked for section: ${ruleName}`);
            const confirmDelete = confirm('Are you sure you want to delete this?');
            if (!confirmDelete) {
                return;
            }
            remove(ref(database, `rules/${ruleName}`)).then(() => {
                $(`#${ruleName}-rule`).remove();
                ruleNames = ruleNames.filter(name => name !== ruleName);
            }).catch((error) => {
                console.error("Error removing document: ", error);
            });

        }
    });

    // on-change VALUE FIELD
    $(document).on('input', `[id$='-value']`, function () {
        const ruleName = $(this).attr('id').replace('-value', '');
        setAsUnsaved(ruleName);
    });

    // on-click SAVE
    $(document).on('click', '[id$="-action-save"]', function () {
        const ruleName = $(this).attr('id').replace('-action-save', '');//$(this).attr('id').split('-')[0];
        // console.log(`Save button clicked for section: ${ruleName}`);
        const triggerDevice = $(`#${ruleName}-drop-trigger-device-name`).text();
        const operator = $(`#${ruleName}-operatorDropdownMenuButton`).text();
        const value = $(`#${ruleName}-value`).val();
        const targetDevice = $(`#${ruleName}-drop-target-device-name`).text();
        const action = $(`#${ruleName}-drop-action-name`).text().toLowerCase();
        if (!sensorNames.includes(triggerDevice)) {
            alert('Please select a valid trigger device.');
            return;
        }
        if (!actuatorNames.includes(targetDevice)) {
            alert('Please select a valid actuator device.');
            return;
        }
        if (triggerDevice === targetDevice) {
            alert('Trigger and target devices cannot be the same.');
            return;
        }
        const validActions = ['power on', 'power off', 'toggle'];
        if (!validActions.includes(action)) {
            alert('Please select an action.');
            return;
        }
        if (!value) {
            alert('Please enter a valid value.');
            return;
        }
        if (isNaN(value)) {
            alert('Please enter a numeric value.');
            return;
        }

        let dbOperator = '';
        if (operator === '>') {
            dbOperator = 'if-higher-than';
        } else if (operator === '<') {
            dbOperator = 'if-lower-than';
        } else if (operator === '=') {
            dbOperator = 'if-equal-to';
        } else {
            dbOperator = 'if-equal-to';
        } 
        // else if (operator === 'On') {
        //     dbOperator = 'if-is-active';
        // } else if (operator === 'Off') {
        //     dbOperator = 'if-is-deactivated';
        // }
        let dbAction = '';
        if (action.toLowerCase() === 'power on') {
            dbAction = 'power-on';
        } else if (action.toLowerCase() === 'power off') {
            dbAction = 'power-off';
        } else if (action.toLowerCase() === 'toggle') {
            dbAction = 'toggle';
        }
        const ruleData = {
            trigger: triggerDevice,
            condition: dbOperator,
            conditionValue: value,
            target: targetDevice,
            targetValue: dbAction
        };

        set(ref(database, `rules/${ruleName}`), ruleData).then(() => {
            // updating html when firebase is updated
            $(`#${ruleName}-unsaved`).attr('id', `${ruleName}-saved`);
            $(`#${ruleName}-save-button-placeholder`).empty();
        }).catch((error) => {
            console.error("Error saving document: ", error);
        });
    });

    // on-click TRIGGER DEVICE
    $(document).on('click', `[id$='-drop-trigger-device-select']`, function (event) {
        event.preventDefault();
        // console.log('this: ', $(this));
        const ruleName = $(this).attr('id').replace('-drop-trigger-device-select', '');//$(this).attr('id').split('-')[0];
        // console.log('ruleName: ', ruleName);
        const selectedDevice = $(this).find('.dropdown-item:hover').text();
        // console.log('selectedDevice: ', selectedDevice);
        $(`#${ruleName}-drop-trigger-device-name`).text(selectedDevice);
        setAsUnsaved(ruleName);
    });

    // on-click TARGET DEVICE
    $(document).on('click', `[id$='-drop-target-device-select']`, function (event) {
        event.preventDefault();
        // console.log('this: ', $(this));
        const ruleName = $(this).attr('id').replace('-drop-target-device-select', '');
        // console.log('ruleName: ', ruleName);
        const selectedDevice = $(this).find('.dropdown-item:hover').text();
        // console.log('selectedDevice: ', selectedDevice);
        $(`#${ruleName}-drop-target-device-name`).text(selectedDevice);
        setAsUnsaved(ruleName);
    });

    // on-click ACTION
    $(document).on('click', `[id$='-drop-action-select']`, function (event) {
        event.preventDefault();
        // console.log('this: ', $(this));
        const ruleName = $(this).attr('id').replace('-drop-action-select', '');
        // console.log('ruleName: ', ruleName);
        const selectedDevice = $(this).find('.dropdown-item:hover').text();
        // console.log('selectedDevice: ', selectedDevice);
        $(`#${ruleName}-drop-action-name`).text(selectedDevice);
        setAsUnsaved(ruleName);
    });

    // on-click OPERATOR
    $(document).on('click', `[id$='-operator']`, function (event) {
        event.preventDefault();
        // console.log('this: ', $(this));
        const ruleName = $(this).attr('id').replace('-operator', '');
        // console.log('ruleName: ', ruleName);
        const selectedDevice = $(this).find('.dropdown-item:hover').text();
        // console.log('selectedDevice: ', selectedDevice);
        $(`#${ruleName}-operatorDropdownMenuButton`).text(selectedDevice);
        setAsUnsaved(ruleName);
    });

    // function to update html code for showing that a card has pending changes
    function setAsUnsaved(ruleName) {
        if ($(`#${ruleName}-saved`).length) {
            $(`#${ruleName}-saved`).attr('id', `${ruleName}-unsaved`);
            const saveButtonHtml = `
                <button class="btn btn-primary"
                    id="${ruleName}-action-save"
                    style="background-color: yellow; border-color: yellow;">
                    <i class="fas fa-save"></i>
                </button>`;
            $(`#${ruleName}-save-button-placeholder`).html(saveButtonHtml);
        }
    }

    // on-click ADD RULE
    $('#page2-add-rule').click(function () {
        let newRuleName = prompt('Please enter the name of the new rule:');
        const validSectionName = /^[a-zA-Z0-9 ]+$/;
        newRuleName = newRuleName.trim();
        if (!newRuleName) return;
        if (!validSectionName.test(newRuleName)) {
            alert('Section name can only contain alphanumeric characters and spaces.');
            return;
        } else if (newRuleName.toLowerCase() === 'default') {
            alert('The "default" already exists.');
            return;
        } else if (newRuleName.toLowerCase() === 'null') {
            alert('The "null" name is reserved.');
            return;
        } else if (newRuleName.trim() === '') {
            alert('Section name cannot be empty or contain only spaces.');
            return;
        } else if (newRuleName.length > 15) {
            alert('Section name is too long. Please use a maximum of 15 characters.');
            return;
        }
        const newRuleNameParsed = newRuleName.replace(/\s+/g, '-');
        if (ruleNames.includes(newRuleNameParsed)) {
            alert('A rule with this name already exists.');
            return;
        }
        ruleNames.push(newRuleNameParsed);
        const cardsContainer = $('#categories-row');
        const ruleDiv = createRuleDiv(newRuleNameParsed);
        cardsContainer.append(ruleDiv);
        updateLists();
    });

    // info button stuff
    document.getElementById('toggle-info').addEventListener('click', function () {
        var infoContent = document.getElementById('info-content');
        if (infoContent.style.display === 'none') {
            infoContent.style.display = 'block';
        } else {
            infoContent.style.display = 'none';
        }
    });
    // // Info Button Alert -> removed
    // document.getElementById('info-btn').addEventListener('click', () => {
    //     var infoContent = document.getElementById('info-content');
    //     if (infoContent.style.display === 'none') {
    //         infoContent.style.display = 'block';
    //     } else {
    //         infoContent.style.display = 'none';
    //     }
    // });
});

// @todo manage the dropdown lists
function createRuleDiv(ruleName, unsaved = true) {
    if (unsaved) {
        return $(`
      <div class="col-md-4" id="${ruleName}-rule">
                      <div class="card mb-3" id="${ruleName}-unsaved"> <!-- id 'unsaved' sets a distinct border color -->
                          <div>
                              <h4 class="text-center">
                                  <div
                                      class="card-header d-flex justify-content-between align-items-center">${ruleName}
                                      <div id="${ruleName}-save-button-placeholder">
                                          <button class="btn btn-primary"
                                              id="${ruleName}-action-save"
                                              style="background-color: yellow; border-color: yellow;">
                                              <i class="fas fa-save"></i>
                                          </button>
                                      </div>
                                      <div>
                                          <button class="btn btn-danger"
                                              id="${ruleName}-action-delete">
                                              <i class="fas fa-times"></i>
                                          </button>
                                      </div>
                                  </div>
                              </h4>
                          </div>
                          <div class="card">
                              <div class="card-body">
                                  <p class="mb-1"> Trigger device: </p>
                                  <div class="d-flex justify-content-between">
                                      <div class="dropdown">
                                          <button
                                              class="btn btn-secondary dropdown-toggle"
                                              type="button"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false"
                                              id="${ruleName}-drop-trigger-device-name">
                                              Device
                                          </button>
                                          <ul class="dropdown-menu"
                                              aria-labelledby="${ruleName}-drop-trigger-device-name"
                                              id="${ruleName}-drop-trigger-device-select">
                                              <!-- sensor list -->
                                          </ul>
                                      </div>
                                      <div class="dropdown">
                                          <button
                                              class="btn btn-secondary dropdown-toggle"
                                              type="button"
                                              id="${ruleName}-operatorDropdownMenuButton"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false">
                                              =
                                          </button>
                                          <ul class="dropdown-menu"
                                              aria-labelledby="${ruleName}-operatorDropdownMenuButton"
                                              id="${ruleName}-operator">
                                              <li><a class="dropdown-item"
                                                      href="#">&gt;</a></li>
                                              <li><a class="dropdown-item"
                                                      href="#">&lt;</a></li>
                                              <li><a class="dropdown-item"
                                                      href="#">=</a></li>
                                          </ul>
                                      </div>
                                      <div>
                                          <p>&nbsp;</p>
                                      </div>
                                      <div>
                                          <input type="number"
                                              class="form-control"
                                              placeholder="value"
                                              id="${ruleName}-value">
                                      </div>
                                  </div>
                                  <p class="mb-1"> Target device: </p>
                                  <div class="d-flex justify-content-between">
                                      <div class="dropdown">
                                          <button
                                              class="btn btn-secondary dropdown-toggle"
                                              type="button"
                                              id="${ruleName}-drop-target-device-name"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false">
                                              Device
                                          </button>
                                          <ul class="dropdown-menu"
                                              aria-labelledby="dropdownMenuButton3"
                                              id="${ruleName}-drop-target-device-select">
                                              <!-- sensor list -->
                                          </ul>
                                      </div>
                                      <div>
                                          <i class="fas fa-arrow-right"></i>
                                      </div>
                                      <div class="dropdown">
                                          <button
                                              class="btn btn-secondary dropdown-toggle"
                                              type="button"
                                              id="${ruleName}-drop-action-name"
                                              data-bs-toggle="dropdown"
                                              aria-expanded="false">
                                              Action
                                          </button>
                                          <ul class="dropdown-menu"
                                              aria-labelledby="dropdownMenuButton3"
                                              id="${ruleName}-drop-action-select">
                                              <li><a class="dropdown-item"
                                                      href="#">Power on</a></li>
                                              <li><a class="dropdown-item"
                                                      href="#">Power off</a></li>
                                            <!-- <li><a class="dropdown-item"
                                                    href="#">Toggle</a></li> -->
                                          </ul>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
      `);
    } else {
        return $(`
            <div class="col-md-4" id="${ruleName}-rule">
                            <div class="card mb-3" id="${ruleName}-saved"> <!-- id 'unsaved' sets a distinct border color -->
                                <div>
                                    <h4 class="text-center">
                                        <div
                                            class="card-header d-flex justify-content-between align-items-center">${ruleName}
                                            <div id="${ruleName}-save-button-placeholder">
                                            </div>
                                            <div>
                                                <button class="btn btn-danger"
                                                    id="${ruleName}-action-delete">
                                                    <i class="fas fa-times"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </h4>
                                </div>
                                <div class="card">
                                    <div class="card-body">
                                        <p class="mb-1"> Trigger device: </p>
                                        <div class="d-flex justify-content-between">
                                            <div class="dropdown">
                                                <button
                                                    class="btn btn-secondary dropdown-toggle"
                                                    type="button"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false"
                                                    id="${ruleName}-drop-trigger-device-name">
                                                    Device
                                                </button>
                                                <ul class="dropdown-menu"
                                                    aria-labelledby="${ruleName}-drop-trigger-device-name"
                                                    id="${ruleName}-drop-trigger-device-select">
                                                    <!-- sensor list -->
                                                </ul>
                                            </div>
                                            <div class="dropdown">
                                                <button
                                                    class="btn btn-secondary dropdown-toggle"
                                                    type="button"
                                                    id="${ruleName}-operatorDropdownMenuButton"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false">
                                                    =
                                                </button>
                                                <ul class="dropdown-menu"
                                                    aria-labelledby="${ruleName}-operatorDropdownMenuButton"
                                                    id="${ruleName}-operator">
                                                    <li><a class="dropdown-item"
                                                            href="#">&gt;</a></li>
                                                    <li><a class="dropdown-item"
                                                            href="#">&lt;</a></li>
                                                    <li><a class="dropdown-item"
                                                            href="#">=</a></li>
                                                </ul>
                                            </div>
                                            <div>
                                                <p>&nbsp;</p>
                                            </div>
                                            <div>
                                                <input type="number"
                                                    class="form-control"
                                                    placeholder="value"
                                                    id="${ruleName}-value">
                                            </div>
                                        </div>
                                        <p class="mb-1"> Target device: </p>
                                        <div class="d-flex justify-content-between">
                                            <div class="dropdown">
                                                <button
                                                    class="btn btn-secondary dropdown-toggle"
                                                    type="button"
                                                    id="${ruleName}-drop-target-device-name"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false">
                                                    Device
                                                </button>
                                                <ul class="dropdown-menu"
                                                    aria-labelledby="dropdownMenuButton3"
                                                    id="${ruleName}-drop-target-device-select">
                                                    <!-- sensor list -->
                                                </ul>
                                            </div>
                                            <div>
                                                <i class="fas fa-arrow-right"></i>
                                            </div>
                                            <div class="dropdown">
                                                <button
                                                    class="btn btn-secondary dropdown-toggle"
                                                    type="button"
                                                    id="${ruleName}-drop-action-name"
                                                    data-bs-toggle="dropdown"
                                                    aria-expanded="false">
                                                    Action
                                                </button>
                                                <ul class="dropdown-menu"
                                                    aria-labelledby="dropdownMenuButton3"
                                                    id="${ruleName}-drop-action-select">
                                                    <li><a class="dropdown-item"
                                                            href="#">Power on</a></li>
                                                    <li><a class="dropdown-item"
                                                            href="#">Power off</a></li>
                                                    <!-- <li><a class="dropdown-item"
                                                            href="#">Toggle</a></li> -->
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
            `);
    }
}