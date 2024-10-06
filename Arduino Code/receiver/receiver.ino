#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>

const char* ssid = "WIFI SSID"; 
const char* password = "WIFI Password";
const char* serverUrl = "http://192.168.10.104:3000/data";  // Replace with your server IP or domain

RF24 radio(D2, D8);

const byte address[6] = "00001";
char receivedData[240];
int dataSize = 0;

void setup() {
  Serial.begin(9600);

  Serial.println("Initializing NRF24L01");
  if (!radio.begin()) {
    Serial.println("NRF24L01 initialization failed");
    while (1);
  }
  Serial.println("NRF24L01 initialization succeeded");

  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_LOW);
  radio.startListening();

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi...");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("Connected to WIFI.");
}

void loop() {
  if (radio.available()) {
    char tempBuf[32] = {0};
    while (radio.available()) {
      radio.read(&tempBuf, sizeof(tempBuf));
      strncat(receivedData, tempBuf, sizeof(tempBuf));
      dataSize += sizeof(tempBuf);
    }
    Serial.println("Data received:");
    Serial.println(receivedData);

    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;

      Serial.println("Connecting to server...");
      http.begin(client, serverUrl);
      http.addHeader("Content-Type", "application/json");

      String jsonPayload = "{\"data\": \"" + String(receivedData) + "\"}";
      Serial.println("JSON Payload: " + jsonPayload);
      
      int httpResponseCode = http.POST(jsonPayload);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println("HTTP Response code: " + String(httpResponseCode));
        Serial.println("Response: " + response);
      } else {
        Serial.println("Error on sending POST: " + String(httpResponseCode));
        Serial.println("Error message: " + http.errorToString(httpResponseCode));
      }

      http.end();
    } else {
      Serial.println("WiFi not connected");
    }
    memset(receivedData, 0, sizeof(receivedData));
    dataSize = 0;
  } else {
    Serial.println("No data available.");
  }
  delay(5000);
}
