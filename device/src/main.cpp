#include <Arduino.h>
#include <Bridge.h>
#include <FileSystem.h>
#include <SPI.h>
#include <SlipSerial.h>

SlipSerial serial(Serial);

void setup() {
  Serial.begin(9600);
  while (!Serial) {
  }

  Bridge::begin(serial);
  Bridge::FileSystem::begin();
}

void loop() { Bridge::update(); }