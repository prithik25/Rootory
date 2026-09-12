#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <time.h>
#include "root_ca.h"

const int POT_PIN = 34;
const char* ENDPOINT = "https://rootory-seven.vercel.app/api/iot/moisture";
String deviceId, deviceKey;

String readLine() {
  String line;
  while (true) {
    if (Serial.available()) {
      char c = Serial.read();
      if (c == '\n') { line.trim(); if (line.length()) return line; }
      else if (c != '\r') line += c;
      if (line.length() > 128) line = "";
    }
    delay(10);
  }
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  pinMode(POT_PIN, INPUT);
  Serial.println("Rootory SIMULATED moisture sensor. No physical measurement.");
  Serial.println("Paste Device ID below and press Enter:");
  deviceId = readLine();
  Serial.println("Paste temporary Device Key and press Enter (do this before recording):");
  deviceKey = readLine();
  Serial.println("Credentials received; they will not be printed by this sketch.");
  WiFi.begin("Wokwi-GUEST", "", 6);
  while (WiFi.status() != WL_CONNECTED) { delay(250); }
  configTime(0, 0, "pool.ntp.org", "time.google.com");
  while (time(nullptr) < 1700000000) { delay(250); }
  Serial.println("Connected. Turn the potentiometer. Sending every 6 seconds.");
}

void loop() {
  if (WiFi.status() != WL_CONNECTED) { delay(1000); return; }
  int moisture = (int)round(analogRead(POT_PIN) * 100.0 / 4095.0);
  WiFiClientSecure transport;
  transport.setCACert(ROOT_CA); // Verify TLS; never use setInsecure().
  HTTPClient http;
  http.setTimeout(10000);
  if (!http.begin(transport, ENDPOINT)) { Serial.println("HTTPS setup failed"); delay(6000); return; }
  http.addHeader("Content-Type", "application/json");
  http.addHeader("Authorization", "Bearer " + deviceKey);
  String payload = "{\"deviceId\":\"" + deviceId + "\",\"moisture\":" + String(moisture) + ",\"source\":\"simulation\"}";
  int status = http.POST(payload);
  Serial.printf("Simulated moisture: %d%% | HTTP %d\n", moisture, status);
  if (status == 401) Serial.println("Key expired or revoked. Restart with a new device key.");
  else if (status != 201) Serial.println("Reading not stored. Check connection / migration / TLS certificate.");
  http.end();
  delay(6000);
}
