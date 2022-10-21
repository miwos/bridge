#include <Arduino.h>
#include <Bridge.h>
#include <FileSystem.h>
#include <SPI.h>
#include <SlipSerial.h>

using Bridge::Data;
using Bridge::RequestId;

SlipSerial serial(Serial);

void setup() {
  Serial.begin(9600);
  while (!Serial) {
  }

  Bridge::begin(serial);
  FileSystem::begin();

  Bridge::addMethod("/echo/int", [](Data &data) {
    RequestId id = data.getInt(0);
    if (!Bridge::validateData(data, "ii", 2)) return Bridge::respondError(id);
    auto number = data.getInt(1);
    Bridge::respond(id, number);
  });
}

void loop() { Bridge::update(); }