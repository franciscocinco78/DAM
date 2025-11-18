import { database } from './firebase.js';
import { ref, onChildAdded, get, set, onChildChanged, remove } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-database.js";

const debug = false;

function debugLog(message) {
    if (debug) {
        console.log(message);
    }
}

$(document).ready(function () {
    const dbRef = ref(database, 'messages');
    const rulesRef = ref(database, 'rules');

    const actuatorsRef = ref(database, 'actuators');
    get(actuatorsRef).then((snapshot) => {
        if (!snapshot.exists()) {
            set(actuatorsRef, {});
            console.log("Created 'actuators' folder in the database.");
        }
    }).catch((error) => {
        console.error("Error checking 'actuators' folder:", error);
    });

    onChildAdded(dbRef, processRule);
    onChildAdded(rulesRef,processRule);
    onChildChanged(dbRef, processRule);
    onChildChanged(rulesRef, processRule);

    function processRule() {
        debugLog("Processing rules...");
        const rulesRef = ref(database, 'rules');
        get(rulesRef).then((snapshot) => {
            if (snapshot.exists()) {
                snapshot.forEach((childSnapshot) => {
                    const rule = childSnapshot.val();
                    //const trigger = rule.trigger;
                    const condition = rule.condition;
                    const conditionValue = rule.conditionValue;
                    const target = rule.target;
                    const targetValue = rule.targetValue;
                    const triggerItem = ref(database, `messages/${rule.trigger}`);
                    debugLog(`Processing rule: ${rule.name}`);
                    get(triggerItem).then((triggerSnapshot) => { // Get the sensor details from the 'messages' folder
                        let activated = false;
                        debugLog(`Processing trigger: ${rule.trigger}`);
                        if (triggerSnapshot.exists()) {
                            const sensorDetails = triggerSnapshot.val();
                            debugLog(`Sensor details: ${sensorDetails.content}`);
                            // Check if the condition is met using if-else
                            if (condition === 'if-higher-than') {
                                if (Number(sensorDetails.content) > Number(conditionValue)) {
                                    activated = true;
                                }
                            } else if (condition === 'if-lower-than') {
                                if (Number(sensorDetails.content) < Number(conditionValue)) {
                                    activated = true;
                                }
                            } else if (condition === 'if-equal-to') {
                                if (Number(sensorDetails.content) === Number(conditionValue)) {
                                    activated = true;
                                }
                            } else {
                                console.log("Invalid condition:", condition);
                            }

                            if (activated === true) { // If the condition is met, update the actuator state under 'actuators' folder
                                const actuatorRef = ref(database, `actuators/${target}`);
                                // const sensorRef = ref(database, `messages/${target}`);
                                // CANNOT WRITE TO "MESSAGES" due to active onChildChange callback
                                set(actuatorRef, {
                                    content: targetValue,
                                    type: 'actuator'
                                }).then(() => {
                                    // console.log(`Actuator ${target} updated with value ${targetValue}`);
                                }).catch((error) => {
                                    console.error("Error updating actuator:", error);
                                });
                            }
                        } else {
                            console.warn("No data available for trigger:", rule.trigger);
                        }
                    }).catch((error) => {
                        console.error("Error getting sensor details:", error);
                    });

                }); // end of ofr each
            } else {
                console.log("No rules available");
            }
        }).catch((error) => {
            console.error("Error getting rules:", error);
        });
    }

    setInterval(processRule, 5000); // required because rule eddition doesnt trigger the callbacks
});