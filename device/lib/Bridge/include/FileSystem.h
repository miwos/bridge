#ifndef BridgeFileSystem_h
#define BridgeFileSystem_h

#include "Bridge.h"
#include "SlipSerial.h"
#include <CRC16.h>
#include <SdFat.h>

namespace Bridge { namespace FileSystem {
  using Logger::error;
  using Logger::info;

  namespace {
    FatFile file;
    SdFat sd;
    CRC16 crc;
    uint16_t checkSum;
    RequestId requestId;

    // 256 ist the actual max file name length. But we have to make sure that
    // there is enough room for the temp prefix `__`.
    static const uint16_t maxFileNameLength = 254;
    static const uint16_t maxTempFileNameLength = 256;
    char tempFileName[maxFileNameLength];
    char dirName[maxFileNameLength];
    char baseName[maxFileNameLength];
    char fileName[maxFileNameLength];

    void startWriteFile(Data &data) {
      // Save the request id so we can use it to respond in `endWrite()`.
      RequestId id = requestId = data.getInt(0);
      data.getString(1, dirName);
      data.getString(2, baseName);
      checkSum = data.getInt(3);

      if (!validateData(data, "issi", 4)) return respondError(id);

      strcpy(fileName, dirName);
      strcat(fileName, "/");
      strcat(fileName, baseName);

      strcpy(tempFileName, dirName);
      strcat(tempFileName, "/__");
      strcat(tempFileName, baseName);

      // Always override old content with new content.
      if (sd.exists(tempFileName)) sd.remove(tempFileName);

      // Create all missing parent directories.
      sd.mkdir(dirName);

      file.open(tempFileName, FILE_WRITE);
      crc.reset();

      if (!file) {
        Bridge::respondError(id, "failed to open file for writing");
      }
    }

    void writeFile(uint8_t b) {
      file.write(b);
      crc.add(b);
    }

    void endWriteFile() {
      file.close();

      if (crc.getCRC() == checkSum) {
        if (sd.exists(fileName)) sd.remove(fileName);
        sd.rename(tempFileName, fileName);
        respond(requestId);
      } else {
        respondError(requestId, "checksum isn't matching");
      }

      sd.remove(tempFileName);
    }

    void readFile(Data &data) {
      RequestId id = data.getInt(0);
      data.getString(1, fileName, maxFileNameLength);

      if (!validateData(data, "is", 2)) return respondError(id);

      if (!sd.exists(fileName)) return respondError(id, "file doesn't exist");

      file.open(fileName, O_READ);
      if (!file) return respondError(id, "failed to open file");

      beginRespond(id);
      while (file.available()) {
        serial->write(file.read());
      }
      endRespond();

      file.close();
    }

    void removeFile(Data &data) {
      RequestId id = data.getInt(0);
      data.getString(1, fileName, maxFileNameLength);

      if (!validateData(data, "is", 2)) return respondError(id);

      if (!sd.remove(fileName)) respondError(id);

      respond(id);
    }

    void removeDir(Data &data) {
      RequestId id = data.getInt(0);
      data.getString(1, dirName, maxFileNameLength);

      if (!validateData(data, "is", 2)) return respondError(id);

      if (sd.exists(dirName)) {
        file.open(dirName);
        if (!file.rmRfStar()) return respondError(id);
      }

      respond(id);
    }

    // Thanks J-M-L!
    // https://forum.arduino.cc/t/solved-list-all-directory-and-file-with-levels-using-sdfat-h/923938/2
    void listDir(FatFile &dir, byte depth) {
      FatFile file;

      if (!dir.isDir()) return;
      dir.rewind();

      while (file.openNext(&dir, O_READ)) {
        if (!file.isHidden()) {
          for (byte i = 0; i < depth; i++) {
            serial->write('\t');
          }

          file.getName(fileName, sizeof(fileName));
          serial->print(fileName);

          if (file.isDir()) {
            serial->println(F("/"));
            listDir(file, depth + 1);
          } else {
            serial->println();
          }
        }
        file.close();
      }
    }

    void startListDir(Data &data) {
      RequestId id = data.getInt(0);
      data.getString(1, fileName, maxFileNameLength);
      int recursive = data.getInt(2);

      if (!validateData(data, "isi", 3)) return respondError(id);

      file.open(fileName);
      if (!file) return respondError(id, "failed to open file");

      beginRespond(id);
      listDir(file, 0);
      endRespond();
    }

  } // namespace

  void begin() {
    if (!sd.begin(SdioConfig(FIFO_SDIO))) {
      error("SD initialization failed");
    }

    Bridge::onRawInput(writeFile);
    Bridge::onRawInputEnd(endWriteFile);

    Bridge::addMethod("/file/read", readFile);
    Bridge::addMethod("/file/remove", removeFile);
    Bridge::addMethod("/raw/file/write", startWriteFile);
    Bridge::addMethod("/dir/list", startListDir);
    Bridge::addMethod("/dir/remove", removeDir);
  }
}} // namespace Bridge::FileSystem

#endif