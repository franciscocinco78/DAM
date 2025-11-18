#include <WiFi.h>
#include "time.h"
#include <Firebase_ESP_Client.h>
#include "DHT.h"
#include <addons/TokenHelper.h>
#include <addons/RTDBHelper.h>
#include <ArduinoJson.h>
#include <vector>
#define WIFI_SSID "Vodafone-EED7BD"
#define WIFI_PASSWORD "@Chico788>"
#define API_KEY "AIzaSyDHYEkn7yZt40C7bEHDlAfA2DxsdluL8Q4"
#define DHTPIN 32     // Digital pin connected to the DHT sensor
#define USER_EMAIL "franciscocinco78@gmail.com"
#define USER_PASSWORD "@If(30Dv02"
#define DHTTYPE DHT11   // DHT 11
#define DATABASE_URL "https://cad2425-project-default-rtdb.europe-west1.firebasedatabase.app"
#define LIGHT_SENSOR_PIN 39 

int ledpin = 22;
const char* ntpServer = "pool.ntp.org";
const long  gmtOffset_sec = 0;
const int   daylightOffset_sec = 3600;
struct Rule {
    String condition;
    float conditionValue;
    String target;
    String targetValue;
    String trigger;
};
std::vector<Rule> rules; // Dynamic list to hold all rules

FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
unsigned long dataMillis = 0;
int count = 0;

const char* ssid = "Vodafone-EED7BD";        // Your Wi-Fi SSID
const char* password = "@Chico788"; // Your Wi-Fi Password
DHT dht(DHTPIN, DHTTYPE);
// PWM Configuration
const int escPin = 27;           // GPIO pin connected to the ESC signal wire
const int pwmFrequency = 100;    // ESC operates at 50Hz (standard for RC ESCs)
const int pwmChannel = 0;       // Use PWM channel 0
const int pwmResolution = 10;   // 10-bit resolution (0 to 1023)

// Throttle range
const int throttleMin = 0;      // Minimum throttle (adjust based on ESC)
const int throttleMax = 1023;   // Maximum throttle (adjust based on ESC)
int throttle = 0;
int a = 0;



void setup() {
  Serial.begin(115200);
  delay(100);
  dht.begin();
  Serial.println();
  Serial.println("Connecting to Wi-Fi...");
  
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.println("Connected to Wi-Fi");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);
  config.token_status_callback = tokenStatusCallback; //see addons/TokenHelper.h
  config.max_token_generation_retry = 5;
  Firebase.begin(&config, &auth);
  configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
  analogSetAttenuation(ADC_11db);
  pinMode(ledpin,OUTPUT);
    // Configure PWM channel
  ledcSetup(pwmChannel, pwmFrequency, pwmResolution);
  // Attach PWM channel to the specified GPIO pin
  ledcAttachPin(escPin, pwmChannel);
  // Print instructions
  ledcWrite(pwmChannel, 100); // Set the PWM value
  delay(1000);

}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  struct tm timeinfo;
  int analogValue = analogRead(LIGHT_SENSOR_PIN);
  float voltage = analogValue * (3.3 / 4095.0);
  float lux = voltage * (1000.0 / 3.3);
  if (!getLocalTime(&timeinfo)) {
    Serial.println("Failed to obtain time");
    return;
  }

  char datetime[20];  
  strftime(datetime, sizeof(datetime), "%Y/%m/%d %H:%M:%S", &timeinfo);
//  if (a==0){
//    Serial.print("Here only");
//    setMotorActuatorData("water_02", LOW, datetime);
//    a=1;
//  }

  if (millis() - dataMillis > 6000 && Firebase.ready()) {
    dataMillis = millis();

    // set data for humidity sensor
    Serial.print("set data for humidity sensor\n");
    setHumidityData("hum_02",h,datetime);
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/hum_02/type", "Sensor") ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/hum_02/content", h) ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/hum_02/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
    Serial.print("\n");

    // set data for temperature sensor
    Serial.print("set data for temperature sensor\n");
    setTemperatureData("temp_02", t, datetime);

//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/temp_02/type", "Sensor") ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/temp_02/content", t) ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/temp_02/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
    Serial.print("\n");

    // set data for light sensor
    Serial.print("set data for light sensor\n");
    setLightSensorData("LDR_02", lux, datetime);

//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/light_02/type", "Sensor") ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/light_02/content", lux) ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/light_02/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
    Serial.print("\n");

    // set data for motor
    Serial.print("set data for motor act\n");
    //setMotorActuatorData("water_02", 0, datetime);
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/water_02/type", "Actuator") ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/water_02/content", 0) ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/water_02/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
    Serial.print("\n");

    // set data for light actuator
    Serial.print("set data for light act\n");
    //setLightActuatorData("light_02_a", 0, datetime);

//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/light_02_a/type", "Actuator") ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/light_02_a/content", HIGH) ? "ok" : fbdo.errorReason().c_str());
//    Serial.printf("Set int... %s\n", Firebase.RTDB.setString(&fbdo, "messages/light_02_a/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
    Serial.print("\n");

    Serial.print("getting data for motor act\n");
    if (Firebase.RTDB.getString(&fbdo, "rules")){
      String rulesData = fbdo.stringData();
      Serial.println("Received rules data:");
      Serial.println(rulesData);
      parseRules(rulesData);

      // Debug output for all rules
      Serial.println("Parsed Rules:");
      for (size_t i = 0; i < rules.size(); i++) {
          Serial.printf("Rule %d:\n", i + 1);
          Serial.println("Condition: " + rules[i].condition);
          Serial.println("Condition Value: " + String(rules[i].conditionValue));
          Serial.println("Target: " + rules[i].target);
          Serial.println("Target Value: " + rules[i].targetValue);
          Serial.println("Trigger: " + rules[i].trigger);
          Serial.println();
          if (rules[i].condition == "if-lower-than"){
            if(Firebase.RTDB.getFloat(&fbdo, "messages/temp_02/content") ){
              float dataa = fbdo.floatData();
              int sep = rules[i].target.indexOf('_');
              String part1 = rules[i].target.substring(0,sep);
              if (dataa < rules[i].conditionValue && part1 == "water" && rules[i].targetValue == "power-on"){
                  ledcWrite(pwmChannel, 119); // Set the PWM value
                  delay(8);
                  setMotorActuatorData("water_02", HIGH, datetime);

                  
              }}
              if(Firebase.RTDB.getFloat(&fbdo, "messages/LDR_02/content")){
                Serial.print("rule light");
                float dataa1 = fbdo.floatData();
                Serial.print(dataa1);
                int sep = rules[i].target.indexOf('_');
                String part1 = rules[i].target.substring(0,sep);
                Serial.print("\n\n\n\n\nGREEN LED 2 test");
                
                Serial.print(part1);
                if (dataa1< rules[i].conditionValue && part1 == "GreenLED" && rules[i].targetValue == "power-on"){
                  digitalWrite(ledpin,HIGH);
                  setLightActuatorData("GreenLED_03", HIGH, datetime);
  
                    
                }
            }

              
            Serial.print("lower");
          }else if(rules[i].condition == "if-higher-than"){
            if(Firebase.RTDB.getFloat(&fbdo, "messages/temp_02/content")){
              float dataa = fbdo.floatData();
              int sep = rules[i].target.indexOf('_');
              String part1 = rules[i].target.substring(0,sep);
              //Serial.print(part1);
              if (dataa > rules[i].conditionValue && part1 == "water" && rules[i].targetValue == "power-off"){
                  ledcWrite(pwmChannel, 100); // Set the PWM value
                  delay(8);
                  setMotorActuatorData("water_02", LOW, datetime);

              }
            }
            if(Firebase.RTDB.getFloat(&fbdo, "messages/LDR_02/content")){
                //Serial.print("rule light");
                float dataa1 = fbdo.floatData();
                //Serial.print(dataa1);
                int sep = rules[i].target.indexOf('_');
                String part1 = rules[i].target.substring(0,sep);
                //Serial.print(part1);
                if (dataa1> rules[i].conditionValue && part1 == "GreenLED" && rules[i].targetValue == "power-off"){
                  digitalWrite(ledpin,LOW);
                  setLightActuatorData("GreenLED_03", LOW, datetime);
  
                    
                }
            }
            Serial.print("greater");
          }else{ // equal something
            
          }
      }

}
}

}

void parseRules(const String& jsonData) {
    StaticJsonDocument<1024> doc; // Adjust the size based on expected JSON complexity

    DeserializationError error = deserializeJson(doc, jsonData);
    if (error) {
        Serial.print("JSON deserialization failed: ");
        Serial.println(error.c_str());
        return;
    }

    rules.clear(); // Clear existing rules to avoid duplication

    // Iterate through all keys in the JSON object
    for (JsonPair keyValue : doc.as<JsonObject>()) {
        JsonObject ruleObj = keyValue.value().as<JsonObject>();

        Rule rule;
        rule.condition = ruleObj["condition"].as<String>();
        rule.conditionValue = ruleObj["conditionValue"].as<float>();
        rule.target = ruleObj["target"].as<String>();
        rule.targetValue = ruleObj["targetValue"].as<String>();
        rule.trigger = ruleObj["trigger"].as<String>();

        rules.push_back(rule);
    }
}

void setHumidityData(String id, float humidity, String datetime) {
  Serial.printf("Set data for humidity sensor %s\n", id.c_str());
  Serial.printf("Set type... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/type", "Sensor") ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set content... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/" + id + "/content", humidity) ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set datetime... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
  Serial.print("\n");
}

void setTemperatureData(String id, float temperature, String datetime) {
  Serial.printf("Set data for temperature sensor %s\n", id.c_str());
  Serial.printf("Set type... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/type", "Sensor") ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set content... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/" + id + "/content", temperature) ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set datetime... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
  Serial.print("\n");
}

void setLightSensorData(String id, float lux, String datetime) {
  Serial.printf("Set data for light sensor %s\n", id.c_str());
  Serial.printf("Set type... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/type", "Sensor") ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set content... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/" + id + "/content", lux) ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set datetime... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
  Serial.print("\n");
}

void setMotorActuatorData(String id, float state, String datetime) {
  Serial.printf("Set data for motor actuator %s\n", id.c_str());
  Serial.printf("Set type... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/type", "Actuator") ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set content... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/" + id + "/content", state) ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set datetime... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
  Serial.print("\n");
}
void setLightActuatorData(String id, float state, String datetime) {
  Serial.printf("Set data for light actuator %s\n", id.c_str());
  Serial.printf("Set type... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/type", "Actuator") ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set content... %s\n", Firebase.RTDB.setFloat(&fbdo, "messages/" + id + "/content", state) ? "ok" : fbdo.errorReason().c_str());
  Serial.printf("Set datetime... %s\n", Firebase.RTDB.setString(&fbdo, "messages/" + id + "/datetime", datetime) ? "ok" : fbdo.errorReason().c_str());
  Serial.print("\n");
}
