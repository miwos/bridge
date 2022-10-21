#ifndef Bridge_h
#define Bridge_h

#include "Logger.h"
#include "SlipSerial.h"
#include <Arduino.h>
#include <OSCMessage.h>

namespace Bridge {
  enum ReadSerialMode { ReadSerialModeOsc, ReadSerialModeRaw };
  enum ResponseType { ResponseSuccess, ResponseError };
  typedef OSCMessage Data;
  typedef uint16_t RequestId;

  typedef void (*RawInputHandler)(byte b);
  typedef void (*RawInputEndHandler)();

  typedef void (*MethodHandler)(OSCMessage &data);
  struct Method {
    const char *name;
    MethodHandler handler;
  };

  namespace {
    SlipSerial *serial;
    ReadSerialMode readSerialMode = ReadSerialModeOsc;
    RawInputHandler handleRawInput;
    RawInputEndHandler handleRawInputEnd;

    static const byte maxMethods = 32;
    Method methods[maxMethods];
    byte methodsCount = 0;

    const char *getResponseAddress(ResponseType type, bool isRaw) {
      if (type == ResponseSuccess) {
        return isRaw ? "/raw/r/success" : "/r/success";
      } else if (type == ResponseError) {
        return isRaw ? "/raw/r/error" : "/r/error";
      } else {
        return "/undefined";
      }
    }

    void sendOscMessage(OSCMessage &message) {
      serial->beginPacket();
      message.send(*serial);
      serial->endPacket();
      message.empty();
    }

    void handleOscInput(OSCMessage &oscInput) {
      char addressStart[6] = {0};
      oscInput.getAddress(addressStart, 0, 5);
      if (!strcmp(addressStart, "/raw/")) {
        readSerialMode = ReadSerialModeRaw;
      }

      for (byte i = 0; i < methodsCount; i++) {
        oscInput.dispatch(methods[i].name, methods[i].handler);
      }
    }

  }; // namespace

  void addMethod(const char *name, MethodHandler method) {
    methodsCount++;
    if (methodsCount < maxMethods) {
      methods[methodsCount - 1] = {name, method};
    } else {
      Logger::error("maximum amount of methods reached");
    }
  }

  void respond(RequestId id) {
    OSCMessage message(getResponseAddress(ResponseSuccess, false));
    message.add(id);
    sendOscMessage(message);
  }

  void respondError(RequestId id) {
    OSCMessage message(getResponseAddress(ResponseError, false));
    message.add(id);
    sendOscMessage(message);
  }

  template <typename T> void respond(RequestId id, T arg) {
    OSCMessage message(getResponseAddress(ResponseSuccess, false));
    message.add(id);
    message.add(arg);
    sendOscMessage(message);
  }

  template <typename T> void respondError(RequestId id, T arg) {
    OSCMessage message(getResponseAddress(ResponseError, false));
    message.add(id);
    message.add(arg);
    sendOscMessage(message);
  }

  void beginRespond(RequestId id) {
    OSCMessage message(getResponseAddress(ResponseSuccess, true));
    message.add(id);
    sendOscMessage(message);
    serial->beginPacket();
  }

  void beginRespondError(RequestId id) {
    OSCMessage message(getResponseAddress(ResponseError, true));
    message.add(id);
    sendOscMessage(message);
    serial->beginPacket();
  }

  void endRespond() { serial->endPacket(); }

  void begin(SlipSerial &serial) {
    Bridge::serial = &serial;
    Logger::begin(serial);
  }

  void update() {
    OSCMessage oscInput;

    if (serial->available()) {
      while (!serial->endOfPacket()) {
        while (serial->available()) {
          int c = serial->read();
          if (readSerialMode == ReadSerialModeOsc) {
            oscInput.fill(c);
          } else if (readSerialMode == ReadSerialModeRaw) {
            if (handleRawInput != NULL) handleRawInput(c);
          }
        }
      }

      if (readSerialMode == ReadSerialModeOsc) {
        if (oscInput.hasError()) {
          Logger::error("OSC input error");
        } else {
          handleOscInput(oscInput);
        }
      } else if (readSerialMode == ReadSerialModeRaw) {
        if (handleRawInputEnd != NULL) handleRawInputEnd();
        readSerialMode = ReadSerialModeOsc;
      }
    }
  }

  bool validateData(Data &data, const char *types, byte numArguments) {
    byte receivedNumArguments = data.size();

    if (receivedNumArguments != numArguments) {
      Logger::beginError();
      serial->printf(F("expected %d arguments got %d"), numArguments,
          receivedNumArguments);
      Logger::endLog();
      return false;
    }

    for (int i = 0; i < numArguments; i++) {
      char receivedType = data.getType(i);
      char expectedType = types[i];

      if (receivedType != expectedType) {
        Logger::beginError();
        serial->printf(F("wrong type for argument %d, expected '%c' got '%c'"),
            i, expectedType, receivedType);
        Logger::endLog();

        return false;
      }
    }
    return true;
  }

  void onRawInput(RawInputHandler handler) { handleRawInput = handler; }
  void onRawInputEnd(RawInputEndHandler handler) {
    handleRawInputEnd = handler;
  }
}; // namespace Bridge

#endif