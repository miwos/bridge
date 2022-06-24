#ifndef BridgeLogger_h
#define BridgeLogger_h

#include "SlipSerial.h"
#include <Arduino.h>
#include <OSCMessage.h>

namespace Bridge { namespace Logger {
  enum LogType { LogTypeInfo, LogTypeWarn, LogTypeError, LogTypeDump };

  namespace {
    SlipSerial *serial;

    const char *getOscAddress(LogType type, bool isRaw) {
      if (type == LogTypeInfo) {
        return isRaw ? "/raw/log/info" : "/log/info";
      } else if (type == LogTypeWarn) {
        return isRaw ? "/raw/log/warn" : "/log/warn";
      } else if (type == LogTypeError) {
        return isRaw ? "/raw/log/error" : "/log/error";
      } else if (type == LogTypeDump) {
        return isRaw ? "/raw/log/dump" : "/log/dump";
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
  } // namespace

  void begin(SlipSerial &serial) { Logger::serial = &serial; }

  void log(LogType type, const char *text) {
    OSCMessage message(getOscAddress(type, false));
    message.add(text);
    sendOscMessage(message);
  }

  void info(const char *text) { log(LogTypeInfo, text); }
  void warn(const char *text) { log(LogTypeWarn, text); }
  void error(const char *text) { log(LogTypeError, text); }
  void dump(const char *text) { log(LogTypeDump, text); }

  void beginLog(LogType type) {
    OSCMessage message(getOscAddress(type, true));
    sendOscMessage(message);
    serial->beginPacket();
  }

  void endLog() { serial->endPacket(); }

  void beginError() { beginLog(LogTypeError); }
  void beginWarn() { beginLog(LogTypeWarn); }
  void beginInfo() { beginLog(LogTypeInfo); }
}} // namespace Bridge::Logger

#endif