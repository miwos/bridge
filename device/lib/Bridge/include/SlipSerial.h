#ifndef SlipSerial_h
#define SlipSerial_h

#include <Arduino.h>
#include <SPI.h>
#include <Stream.h>
#include <usb_serial.h>

static const uint8_t eot = 0300;
static const uint8_t slipEsc = 0333;
static const uint8_t slipEscEnd = 0334;
static const uint8_t slipEscEsc = 0335;

/**
 * Slightly modified version of the SlipEncodedSerial class in CNMAT's OSC
 * library for arduino.
 * https://github.com/CNMAT/OSC
 */
class SlipSerial : public Stream {
private:
  enum RState { CHAR, FIRSTEOT, SECONDEOT, SLIPESC } rstate;
  usb_serial_class *serial;

public:
  SlipSerial(usb_serial_class &serial) {
    this->serial = &serial;
    rstate = CHAR;
  }

  void begin(unsigned long baudrate) { serial->begin(baudrate); }

  int available() {
  back:
    int count = serial->available();

    if (count == 0) {
      return 0;
    }

    if (rstate == CHAR) {
      uint8_t c = serial->peek();
      if (c == slipEsc) {
        rstate = SLIPESC;
        serial->read();
        goto back;
      } else if (c == eot) {
        rstate = FIRSTEOT;
        serial->read();
        goto back;
      }
      return 1;
    } else if (rstate == SLIPESC) {
      return 1;
    } else if (rstate == FIRSTEOT) {
      if (serial->peek() == eot) {
        rstate = SECONDEOT;
        serial->read();
        return 0;
      }
      rstate = CHAR;
    } else if (rstate == SECONDEOT) {
      rstate = CHAR;
    }

    return 0;
  }

  int read() {
  back:
    uint8_t c = serial->read();
    if (rstate == CHAR) {
      if (c == slipEsc) {
        rstate = SLIPESC;
        goto back;
      } else if (c == eot) {
        return -1;
      }
      return c;
    } else if (rstate == SLIPESC) {
      rstate = CHAR;
      if (c == slipEscEnd) {
        return eot;
      } else if (c == slipEscEsc) {
        return slipEsc;
      } else {
        return -1;
      }
    } else {
      return -1;
    }
  }

  int readBytes(uint8_t *buffer, size_t size);

  size_t write(uint8_t b) {
    if (b == eot) {
      serial->write(slipEsc);
      return serial->write(slipEscEnd);
    } else if (b == slipEsc) {
      serial->write(slipEsc);
      return serial->write(slipEscEsc);
    } else {
      return serial->write(b);
    }
  }

  size_t write(const uint8_t *buffer, size_t size) {
    size_t result = 0;
    while (size--) {
      result = write(*buffer++);
    }
    return result;
  }

  int peek() {
    uint8_t c = serial->peek();
    if (rstate == SLIPESC) {
      if (c == slipEscEnd) {
        return eot;
      } else if (c == slipEscEsc) {
        return slipEsc;
      }
    }
    return c;
  }

  bool endOfPacket() {
    if (rstate == SECONDEOT) {
      rstate = CHAR;
      return true;
    }

    if (rstate == FIRSTEOT) {
      if (serial->available()) {
        uint8_t c = serial->peek();
        if (c == eot) {
          serial->read();
        }
      }
      rstate = CHAR;
      return true;
    }

    return false;
  }

  void beginPacket() { serial->write(eot); }

  void endPacket() {
    serial->write(eot);
    serial->send_now();
  }

  void flush() { serial->flush(); }

  operator bool() const { return *serial; }
};

#endif