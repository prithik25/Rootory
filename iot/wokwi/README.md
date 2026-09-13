# Rootory simulated moisture demo

This is an ESP32 + potentiometer simulation, not physical hardware or calibrated soil moisture. Rootory stores an arbitrary 0–100 input scale. It does not automatically recommend watering or feed these readings into Gemini/weather decisions.

## Website setup

Migration `202609130006_simulated_sensors.sql` is required (applied to the connected project). Open https://rootory-seven.vercel.app, sign in, open a plant, and find **Soil moisture simulation**. Select **Connect / simulate sensor → Create device key**. The key is plant-scoped, write-only, revocable, valid for 24 hours, and only displayed in the current browser session. Do not put it in public code or the recording. At most ten devices per account; replacing a key keeps the same device ID and invalidates the old key.

Saved project: https://wokwi.com/projects/475004097624927233 (source contains no device credential).

## Wokwi setup

1. Open https://wokwi.com/projects/new/esp32.
2. Replace `sketch.ino` and `diagram.json` with the files in this folder.
3. Add a `root_ca.h` file and paste its contents from this folder. No third-party Arduino libraries are required.
4. Start the simulation. In the serial monitor, paste Device ID and press Enter; then paste the temporary key and press Enter. Do this BEFORE recording. The sketch does not print the key; the monitor may show input history, so clear/hide that history before recording.
5. Wait for “Connected”. Turn the potentiometer. HTTP 201 in the monitor means the API stored the value. The plant panel refreshes every five seconds. The sketch sends every six seconds, so allow roughly 6–11 seconds for a knob change to show.
6. Stop the simulator and revoke its access when finished. Restarting requires entering the credentials again; no secret is stored in the sketch.

Wiring: potentiometer SIG → ESP32 GPIO34 (ADC1), VCC → 3V3, GND → GND. The simulation connects to Wokwi-GUEST. HTTPS validates the server certificate using the included Google Trust Services root and network time. If the hosting certificate chain changes, refresh the appropriate public trust root; do not disable TLS verification.

## Immediate backup demo

If Wokwi is unavailable, use the plant panel's **Browser simulation** slider and **Send simulated reading**. This still goes through the actual Next.js endpoint and Supabase. Label this as a browser simulation, not ESP32 hardware. Do not click more than once every five seconds.

## Recording (about 35 seconds)

Arrange Wokwi and Rootory side by side. Hide the temporary key and credentials.

Say: “Rootory also accepts device readings. Here we use a simulated ESP32 and potentiometer; this is not a physical moisture probe.”

Set the knob near 68%. Show HTTP 201 and Rootory's matching reading. Lower it near 24% and show the low demo range and timestamp. Expand Recent readings.

Say: “The reading travels through our protected API into this plant's private history. A physical sensor could replace the input after calibration. These are prototype ranges, not irrigation advice.”

## API

POST https://rootory-seven.vercel.app/api/iot/moisture
Authorization: Bearer YOUR_TEMPORARY_DEVICE_KEY
Content-Type: application/json

{"deviceId":"YOUR_DEVICE_UUID","moisture":24,"source":"simulation"}

The plant and owner are resolved from the device credential; do not send userId or plantId. Responses: 201 stored, 401 invalid/expired/revoked key, 429 reading too frequent, 410 deleted plant, 503 storage unavailable. Last 100 readings retained per device; panel shows ten. No Supabase admin key is needed.

## Verification boundary

Build +16 tests pass. Live database valid write, bad/null key denial, throttling, private history, hidden hashes and revocation were checked. The saved Wokwi sketch compiled and started successfully. Browser simulation -> production API -> visible 0% reading passed. Wokwi ESP32 over verified HTTPS returned HTTP201 for 68% and 20%; Rootory independently showed both values and the low-range label at20%. Runtime credentials are never stored in the public project.

Official references: https://docs.wokwi.com/guides/esp32-wifi and https://docs.wokwi.com/parts/wokwi-potentiometer. Root certificate source: https://pki.goog/repo/certs/gtsr1.pem.
