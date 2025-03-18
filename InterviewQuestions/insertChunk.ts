import fs from "node:fs";
import path from "node:path";

function parseLogEntry(log: string, fileName: string = "") {
  return log;
}

async function insertLargeLog(
  logFile: string,
  option: { maxSizeMB: number; singleLineSizeLimit: number; formats: string[] }
) {
  const {
    singleLineSizeLimit = 65536,
    maxSizeMB: totalFileSizeLimit = 100,
    formats = [".log"],
  } = option;

  let totalLines = 0;
  let normalLines = 0;
  let errorLines = 0;
  try {
    if (!formats.includes(path.extname(logFile))) {
      throw new Error("文件格式错误");
    }
    const statSize = fs.statSync(logFile).size;
    const fileSizeInMB = statSize / (1024 * 1024);
    if (fileSizeInMB > totalFileSizeLimit + 2) {
      throw new Error(`文件过大，超过${totalFileSizeLimit}M`);
    }

    const file_name = path.basename(logFile);
    const timestamp = new Date().getTime();

    const perfStartMark = performance.now();
    const fileStream = fs.createReadStream(logFile);
    let promises = [] as any[];

    const insertChunks2Db = (chunk: Partial<any>[]) => {
      return database.batchInsert(chunk).catch((error) => {
        errorLines += chunk.length;
      });
    };
    this.totalOfflineFilesNum += 1;

    let fragment = Buffer.alloc(0),
      parsedLog,
      lines = [] as any[],
      lfIdx = -1,
      preLfIdx = 0,
      excludedIdx = -1;
    const parseLine = (line: string) => {
      try {
        if (line.length > singleLineSizeLimit) {
          throw new Error("Oversized line");
        }
        if (line) {
          // trim: remove possible \r
          parsedLog = parseLogEntry(line.trim(), file_name);

          if (!parsedLog.component || !parsedLog.level) {
            throw new Error("Invalid log entry format=" + line);
          }
          lines.push(parsedLog);
        }
      } catch (e) {
        errorLines++;
      }
      totalLines++;
    };
    fileStream.on("data", (buffer: Buffer) => {
      buffer = Buffer.concat([fragment, buffer]);
      lfIdx = buffer.indexOf(10, 0);
      preLfIdx = 0;
      lines = [];
      // parsing line by line
      while (lfIdx !== -1) {
        parseLine(buffer.subarray(preLfIdx, lfIdx).toString());

        preLfIdx = lfIdx;
        lfIdx = buffer.indexOf(10, preLfIdx + 1);
      }
      // we reach the eof
      if (fileStream.bytesRead === statSize) {
        parseLine(buffer.subarray(preLfIdx).toString());
      }

      // keep remain fragment to next process
      if (preLfIdx < buffer.length) {
        // +1: exclude the index of lf
        excludedIdx = preLfIdx + 1;
        fragment = Buffer.alloc(buffer.length - excludedIdx, 0);
        buffer.copy(fragment, 0, excludedIdx, buffer.length);
      }

      if (lines.length > 0) {
        promises.push(insertChunks2Db(lines));
        lines = []; // prevent short file will not process this block twice
      }
    });
    await new Promise((res) => {
      fileStream.on("close", res);
    });

    // Process any remaining logs
    if (lines.length > 0) {
      promises.push(insertChunks2Db(lines));
    }
    await Promise.all(promises);

    normalLines = totalLines - errorLines;
    if (normalLines > 0) {
      database.insert({ timestamp, file_name, count: normalLines });
    } else {
      throw new Error("导入文件没有有效数据");
    }

    return {
      lines: totalLines,
      normal: normalLines,
      errors: errorLines,
      perf: (perfStartMark - performance.now()).toFixed(1),
    };
  } catch (err) {
    return {
      lines: totalLines,
      errors: errorLines,
      normal: normalLines,
    };
  }
}
