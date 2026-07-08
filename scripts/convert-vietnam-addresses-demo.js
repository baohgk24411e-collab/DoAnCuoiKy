const fs = require("fs");
const path = require("path");

const INPUT_FILE = path.resolve(
  process.argv[2] || "C:/Users/asus/Downloads/danh-sach-3321-xa-phuong.xls"
);
const OUTPUT_FILE = path.resolve(
  process.argv[3] || path.join(__dirname, "../data/vietnam-addresses-demo.json")
);
const EXPECTED_PROVINCE_COUNT = 34;

function stripDiacritics(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

function normalizeText(value) {
  return stripDiacritics(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compareVietnameseName(a, b) {
  return String(a || "").localeCompare(String(b || ""), "vi", {
    sensitivity: "base",
    numeric: true,
  });
}

function formatCode(value, width) {
  const text = String(value == null ? "" : value).trim();
  if (!text) return "";
  if (/^\d+$/.test(text)) return text.padStart(width, "0");
  if (/^\d+\.0+$/.test(text)) return text.split(".")[0].padStart(width, "0");
  return text;
}

function findColumn(headers, candidates) {
  const normalizedHeaders = headers.map(normalizeText);
  let bestIndex = -1;
  let bestScore = 0;

  normalizedHeaders.forEach((header, index) => {
    const score = candidates.reduce((total, candidate) => {
      const terms = candidate.split(" ");
      return terms.every((term) => header.includes(term))
        ? total + terms.length
        : total;
    }, 0);

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  return bestIndex;
}

function detectHeaderRow(rows) {
  for (let index = 0; index < Math.min(rows.length, 30); index += 1) {
    const row = rows[index];
    if (
      /^\d+$/.test(String(row[0] || "").trim()) &&
      /^\d+$/.test(String(row[4] || "").trim())
    ) {
      continue;
    }

    const headers = rows[index].map(normalizeText);
    const joined = headers.join(" ");
    const score = [
      /ma.*(tinh|tp|thanh pho)/.test(joined),
      /(ten.*)?(tinh|tp|thanh pho)/.test(joined),
      /ma.*(xa|phuong)/.test(joined),
      /(ten.*)?(xa|phuong)/.test(joined),
    ].filter(Boolean).length;

    if (score >= 3) return index;
  }

  return -1;
}

function normalizeVietnamAddressData(rows) {
  const nonEmptyRows = rows.filter((row) =>
    row.some((cell) => String(cell == null ? "" : cell).trim())
  );
  const headerRowIndex = detectHeaderRow(nonEmptyRows);
  const hasHeader = headerRowIndex >= 0;
  const headers = hasHeader ? nonEmptyRows[headerRowIndex] || [] : [];
  const dataRows = hasHeader ? nonEmptyRows.slice(headerRowIndex + 1) : nonEmptyRows;

  let provinceCodeIndex = findColumn(headers, [
    "ma tinh",
    "ma tp",
    "ma thanh pho",
    "tinh ma",
  ]);
  let provinceNameIndex = findColumn(headers, [
    "ten tinh",
    "ten tp",
    "ten thanh pho",
    "tinh thanh pho",
    "tinh",
  ]);
  let wardCodeIndex = findColumn(headers, [
    "ma xa",
    "ma phuong",
    "ma phuong xa",
    "xa ma",
  ]);
  let wardNameIndex = findColumn(headers, [
    "ten xa",
    "ten phuong",
    "ten phuong xa",
    "phuong xa",
    "xa",
  ]);

  const normalizedHeaders = headers.map(normalizeText);
  const looksLikeOfficialHeaderLayout =
    normalizedHeaders.length >= 6 &&
    normalizedHeaders[0].includes("ma") &&
    normalizedHeaders[1].includes("ten") &&
    normalizedHeaders[4].includes("ma") &&
    (normalizedHeaders[5].includes("tinh") ||
      normalizedHeaders[5].includes("thanh pho"));

  if (looksLikeOfficialHeaderLayout) {
    wardCodeIndex = 0;
    wardNameIndex = 1;
    provinceCodeIndex = 4;
    provinceNameIndex = 5;
  }

  if (
    provinceCodeIndex >= 0 &&
    provinceNameIndex >= 0 &&
    wardCodeIndex < 0 &&
    wardNameIndex < 0 &&
    headers.length >= 2 &&
    String(headers[0] || "").trim() &&
    String(headers[1] || "").trim()
  ) {
    wardCodeIndex = 0;
    wardNameIndex = 1;
  }

  if (
    headers.length >= 6 &&
    Object.values({
      provinceCodeIndex,
      provinceNameIndex,
      wardCodeIndex,
      wardNameIndex,
    }).some((index) => index < 0)
  ) {
    wardCodeIndex = 0;
    wardNameIndex = 1;
    provinceCodeIndex = 4;
    provinceNameIndex = 5;
  }

  if (!hasHeader) {
    const sample =
      nonEmptyRows.find(
        (row) =>
          row.length >= 6 &&
          /^\d+$/.test(String(row[0] || "").trim()) &&
          /^\d+$/.test(String(row[4] || "").trim())
      ) || [];
    const looksLikeNoHeaderLayout =
      /^\d+$/.test(String(sample[0] || "").trim()) &&
      /^\d+$/.test(String(sample[4] || "").trim()) &&
      String(sample[1] || "").trim() &&
      String(sample[5] || "").trim();

    if (looksLikeNoHeaderLayout) {
      wardCodeIndex = 0;
      wardNameIndex = 1;
      provinceCodeIndex = 4;
      provinceNameIndex = 5;
    }
  }

  const indexes = {
    provinceCodeIndex,
    provinceNameIndex,
    wardCodeIndex,
    wardNameIndex,
  };

  if (Object.values(indexes).some((index) => index < 0)) {
    throw new Error(
      `Khong the xac dinh day du cot du lieu. Dong mau: ${(
        headers.length ? headers : nonEmptyRows[0] || []
      ).join(" | ")}`
    );
  }

  const provinceMap = new Map();
  const wardsMap = new Map();
  const seenWards = new Set();

  dataRows.forEach((row) => {
    const provinceCode = formatCode(row[provinceCodeIndex], 2);
    const provinceName = String(row[provinceNameIndex] || "").trim();
    const wardCode = formatCode(row[wardCodeIndex], 5);
    const wardName = String(row[wardNameIndex] || "").trim();

    if (!provinceCode || !provinceName || !wardCode || !wardName) return;
    if (!/\d/.test(provinceCode) || !/\d/.test(wardCode)) return;

    if (!provinceMap.has(provinceCode)) {
      provinceMap.set(provinceCode, { code: provinceCode, name: provinceName });
    }

    const wardKey = `${provinceCode}|${wardCode}|${normalizeText(wardName)}`;
    if (seenWards.has(wardKey)) return;
    seenWards.add(wardKey);

    if (!wardsMap.has(provinceCode)) wardsMap.set(provinceCode, []);
    wardsMap.get(provinceCode).push({
      code: wardCode,
      name: wardName,
      provinceCode,
    });
  });

  const provinces = Array.from(provinceMap.values()).sort((a, b) =>
    compareVietnameseName(a.name, b.name)
  );
  const wardsByProvince = {};
  let hoChiMinhWardCount = 0;
  let otherDemoWardCount = 0;

  provinces.forEach((province) => {
    const sortedWards = (wardsMap.get(province.code) || []).sort((a, b) =>
      compareVietnameseName(a.name, b.name)
    );
    const isHoChiMinh = normalizeText(province.name).includes("ho chi minh");
    const selectedWards = isHoChiMinh ? sortedWards : sortedWards.slice(0, 10);

    wardsByProvince[province.code] = selectedWards;

    if (isHoChiMinh) {
      hoChiMinhWardCount += selectedWards.length;
    } else {
      otherDemoWardCount += selectedWards.length;
    }
  });

  return {
    data: {
      provinces,
      wardsByProvince,
    },
    stats: {
      provinceCount: provinces.length,
      hoChiMinhWardCount,
      otherDemoWardCount,
      totalOutputWardCount: hoChiMinhWardCount + otherDemoWardCount,
    },
  };
}

function rowsFromXlsxPackage(filePath) {
  const xlsx = require("xlsx");
  const workbook = xlsx.readFile(filePath, { cellDates: false, raw: false });
  const sheetName = workbook.SheetNames[0];
  return xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: false,
  });
}

function readOleSector(buffer, sectorSize, sectorId) {
  const start = (sectorId + 1) * sectorSize;
  return buffer.subarray(start, start + sectorSize);
}

function readOleChain(buffer, fat, sectorSize, startSector) {
  const chunks = [];
  let sector = startSector;
  const visited = new Set();

  while (sector >= 0 && sector !== -2 && !visited.has(sector)) {
    visited.add(sector);
    chunks.push(readOleSector(buffer, sectorSize, sector));
    sector = fat[sector];
  }

  return Buffer.concat(chunks);
}

function readWorkbookStream(filePath) {
  const buffer = fs.readFileSync(filePath);
  if (buffer.readUInt32LE(0) !== 0xe011cfd0) {
    throw new Error("File khong phai dinh dang Excel .xls OLE.");
  }

  const sectorSize = 1 << buffer.readUInt16LE(30);
  const fatSectorCount = buffer.readUInt32LE(44);
  const firstDirectorySector = buffer.readInt32LE(48);
  const difat = [];

  for (let offset = 76; offset < 512 && difat.length < fatSectorCount; offset += 4) {
    const sector = buffer.readInt32LE(offset);
    if (sector >= 0) difat.push(sector);
  }

  const fat = [];
  difat.forEach((sector) => {
    const fatSector = readOleSector(buffer, sectorSize, sector);
    for (let offset = 0; offset < fatSector.length; offset += 4) {
      fat.push(fatSector.readInt32LE(offset));
    }
  });

  const directory = readOleChain(buffer, fat, sectorSize, firstDirectorySector);
  for (let offset = 0; offset + 128 <= directory.length; offset += 128) {
    const entry = directory.subarray(offset, offset + 128);
    const nameLength = entry.readUInt16LE(64);
    if (nameLength < 2) continue;

    const name = entry
      .subarray(0, nameLength - 2)
      .toString("utf16le")
      .replace(/\0/g, "");
    const type = entry.readUInt8(66);
    const startSector = entry.readInt32LE(116);
    const size = entry.readUInt32LE(120);

    if (type === 2 && /^(Workbook|Book)$/i.test(name)) {
      return readOleChain(buffer, fat, sectorSize, startSector).subarray(0, size);
    }
  }

  throw new Error("Khong tim thay stream Workbook trong file .xls.");
}

function parseBiffRecords(workbookStream) {
  const records = [];
  for (let offset = 0; offset + 4 <= workbookStream.length; ) {
    const type = workbookStream.readUInt16LE(offset);
    const length = workbookStream.readUInt16LE(offset + 2);
    const dataStart = offset + 4;
    records.push({
      type,
      data: workbookStream.subarray(dataStart, dataStart + length),
    });
    offset = dataStart + length;
  }
  return records;
}

function makeSegmentReader(segments) {
  let segmentIndex = 0;
  let offset = 0;

  function moveToData() {
    while (
      segmentIndex < segments.length &&
      offset >= segments[segmentIndex].length
    ) {
      segmentIndex += 1;
      offset = 0;
    }
  }

  function readBytes(length) {
    const chunks = [];
    let remaining = length;

    while (remaining > 0) {
      moveToData();
      if (segmentIndex >= segments.length) {
        throw new Error("SST bi cat ngang khi doc chuoi.");
      }

      const segment = segments[segmentIndex];
      const take = Math.min(remaining, segment.length - offset);
      chunks.push(segment.subarray(offset, offset + take));
      offset += take;
      remaining -= take;
    }

    return Buffer.concat(chunks);
  }

  return {
    readUInt8: () => readBytes(1).readUInt8(0),
    readUInt16LE: () => readBytes(2).readUInt16LE(0),
    readUInt32LE: () => readBytes(4).readUInt32LE(0),
    readChars(charCount, isUtf16) {
      const parts = [];
      let remaining = charCount;
      let useUtf16 = isUtf16;

      while (remaining > 0) {
        moveToData();
        if (segmentIndex >= segments.length) {
          throw new Error("SST bi cat ngang khi doc ky tu.");
        }

        let segment = segments[segmentIndex];
        let available = segment.length - offset;

        if (available <= 0) continue;
        const bytesPerChar = useUtf16 ? 2 : 1;
        const charTake = Math.min(remaining, Math.floor(available / bytesPerChar));

        if (charTake > 0) {
          const byteTake = charTake * bytesPerChar;
          const chunk = segment.subarray(offset, offset + byteTake);
          parts.push(chunk.toString(useUtf16 ? "utf16le" : "latin1"));
          offset += byteTake;
          remaining -= charTake;
        }

        moveToData();
        if (remaining > 0 && segmentIndex < segments.length && offset === 0) {
          useUtf16 = Boolean(segments[segmentIndex].readUInt8(offset) & 0x01);
          offset += 1;
        }
      }

      return parts.join("");
    },
    readRaw: readBytes,
  };
}

function parseSst(records) {
  const sstIndex = records.findIndex((record) => record.type === 0x00fc);
  if (sstIndex < 0) return [];

  const segments = [records[sstIndex].data];
  for (let index = sstIndex + 1; index < records.length; index += 1) {
    if (records[index].type !== 0x003c) break;
    segments.push(records[index].data);
  }

  const reader = makeSegmentReader(segments);
  reader.readUInt32LE();
  const uniqueCount = reader.readUInt32LE();
  const strings = [];

  for (let index = 0; index < uniqueCount; index += 1) {
    const charCount = reader.readUInt16LE();
    const flags = reader.readUInt8();
    const isUtf16 = Boolean(flags & 0x01);
    const hasRichText = Boolean(flags & 0x08);
    const hasExt = Boolean(flags & 0x04);
    const richTextRuns = hasRichText ? reader.readUInt16LE() : 0;
    const extSize = hasExt ? reader.readUInt32LE() : 0;
    const text = reader.readChars(charCount, isUtf16);

    if (richTextRuns) reader.readRaw(richTextRuns * 4);
    if (extSize) reader.readRaw(extSize);
    strings.push(text);
  }

  return strings;
}

function decodeRk(buffer, offset) {
  const value = buffer.readUInt32LE(offset);
  let result;

  if (value & 0x02) {
    result = value >> 2;
  } else {
    const temp = Buffer.alloc(8);
    temp.writeUInt32LE(value & 0xfffffffc, 4);
    result = temp.readDoubleLE(0);
  }

  return value & 0x01 ? result / 100 : result;
}

function setCell(rows, rowIndex, columnIndex, value) {
  if (!rows[rowIndex]) rows[rowIndex] = [];
  rows[rowIndex][columnIndex] = value == null ? "" : String(value).trim();
}

function rowsFromBiffXls(filePath) {
  const records = parseBiffRecords(readWorkbookStream(filePath));
  const sharedStrings = parseSst(records);
  const rows = [];

  records.forEach((record) => {
    const data = record.data;

    if (record.type === 0x00fd && data.length >= 10) {
      const row = data.readUInt16LE(0);
      const column = data.readUInt16LE(2);
      const stringIndex = data.readUInt32LE(6);
      setCell(rows, row, column, sharedStrings[stringIndex] || "");
    }

    if (record.type === 0x0203 && data.length >= 14) {
      const row = data.readUInt16LE(0);
      const column = data.readUInt16LE(2);
      setCell(rows, row, column, data.readDoubleLE(6));
    }

    if (record.type === 0x027e && data.length >= 10) {
      const row = data.readUInt16LE(0);
      const column = data.readUInt16LE(2);
      setCell(rows, row, column, decodeRk(data, 6));
    }

    if (record.type === 0x00bd && data.length >= 6) {
      const row = data.readUInt16LE(0);
      const firstColumn = data.readUInt16LE(2);
      const lastColumn = data.readUInt16LE(data.length - 2);
      for (let column = firstColumn; column <= lastColumn; column += 1) {
        const rkOffset = 4 + (column - firstColumn) * 6 + 2;
        if (rkOffset + 4 <= data.length - 2) {
          setCell(rows, row, column, decodeRk(data, rkOffset));
        }
      }
    }

    if (record.type === 0x0204 && data.length >= 8) {
      const row = data.readUInt16LE(0);
      const column = data.readUInt16LE(2);
      const charCount = data.readUInt16LE(6);
      const flags = data.readUInt8(8);
      const start = 9;
      const byteLength = charCount * (flags & 0x01 ? 2 : 1);
      setCell(
        rows,
        row,
        column,
        data.subarray(start, start + byteLength).toString(flags & 0x01 ? "utf16le" : "latin1")
      );
    }
  });

  return rows.filter(Boolean);
}

function convertVietnamAddressExcelToJson(inputFile, outputFile) {
  let rows;

  try {
    rows = rowsFromXlsxPackage(inputFile);
  } catch (error) {
    if (error.code !== "MODULE_NOT_FOUND") throw error;
    rows = rowsFromBiffXls(inputFile);
  }

  const { data, stats } = normalizeVietnamAddressData(rows);

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");

  console.log(`Tong so tinh/thanh pho: ${stats.provinceCount}`);
  console.log(
    `Tong so phuong/xa cua TP. Ho Chi Minh: ${stats.hoChiMinhWardCount}`
  );
  console.log(
    `Tong so phuong/xa demo cua cac tinh/thanh con lai: ${stats.otherDemoWardCount}`
  );
  console.log(
    `Tong so phuong/xa trong file JSON dau ra: ${stats.totalOutputWardCount}`
  );
  console.log(`Duong dan file JSON da tao: ${outputFile}`);

  if (stats.provinceCount !== EXPECTED_PROVINCE_COUNT) {
    console.warn(
      `Canh bao: so tinh/thanh pho la ${stats.provinceCount}, khac ${EXPECTED_PROVINCE_COUNT}.`
    );
  }

  return data;
}

if (require.main === module) {
  convertVietnamAddressExcelToJson(INPUT_FILE, OUTPUT_FILE);
}

module.exports = {
  convertVietnamAddressExcelToJson,
  normalizeVietnamAddressData,
};
