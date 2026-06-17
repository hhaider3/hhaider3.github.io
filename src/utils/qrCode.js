const QR_LOW_EC = [
  null,
  { dataCodewords: 19, ecCodewords: 7, alignment: [] },
  { dataCodewords: 34, ecCodewords: 10, alignment: [6, 18] },
  { dataCodewords: 55, ecCodewords: 15, alignment: [6, 22] },
  { dataCodewords: 80, ecCodewords: 20, alignment: [6, 26] },
];

const textEncoder = new TextEncoder();

const gfExp = new Array(512);
const gfLog = new Array(256);

let gfValue = 1;
for (let i = 0; i < 255; i += 1) {
  gfExp[i] = gfValue;
  gfLog[gfValue] = i;
  gfValue <<= 1;
  if (gfValue & 0x100) {
    gfValue ^= 0x11d;
  }
}

for (let i = 255; i < gfExp.length; i += 1) {
  gfExp[i] = gfExp[i - 255];
}

const gfMultiply = (a, b) => {
  if (a === 0 || b === 0) {
    return 0;
  }

  return gfExp[gfLog[a] + gfLog[b]];
};

const appendBits = (bits, value, length) => {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
};

const chooseVersion = (bytes) => {
  for (let version = 1; version < QR_LOW_EC.length; version += 1) {
    const capacityBits = QR_LOW_EC[version].dataCodewords * 8;
    const requiredBits = 4 + 8 + bytes.length * 8;

    if (requiredBits <= capacityBits) {
      return version;
    }
  }

  throw new Error('QR payload is too long for the built-in encoder.');
};

const createDataCodewords = (text, version) => {
  const bytes = Array.from(textEncoder.encode(text));
  const dataCodewords = QR_LOW_EC[version].dataCodewords;
  const capacityBits = dataCodewords * 8;
  const bits = [];

  appendBits(bits, 0b0100, 4);
  appendBits(bits, bytes.length, 8);
  bytes.forEach(byte => appendBits(bits, byte, 8));

  const terminatorLength = Math.min(4, capacityBits - bits.length);
  appendBits(bits, 0, terminatorLength);

  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  const codewords = [];
  for (let i = 0; i < bits.length; i += 8) {
    let codeword = 0;
    for (let j = 0; j < 8; j += 1) {
      codeword = (codeword << 1) | bits[i + j];
    }
    codewords.push(codeword);
  }

  let padByteIndex = 0;
  const padBytes = [0xec, 0x11];
  while (codewords.length < dataCodewords) {
    codewords.push(padBytes[padByteIndex % 2]);
    padByteIndex += 1;
  }

  return codewords;
};

const multiplyPolynomials = (left, right) => {
  const result = new Array(left.length + right.length - 1).fill(0);

  left.forEach((leftValue, leftIndex) => {
    right.forEach((rightValue, rightIndex) => {
      result[leftIndex + rightIndex] ^= gfMultiply(leftValue, rightValue);
    });
  });

  return result;
};

const createGeneratorPolynomial = (degree) => {
  let polynomial = [1];

  for (let i = 0; i < degree; i += 1) {
    polynomial = multiplyPolynomials(polynomial, [1, gfExp[i]]);
  }

  return polynomial;
};

const createErrorCorrection = (dataCodewords, ecCodewords) => {
  const generator = createGeneratorPolynomial(ecCodewords);
  const message = [...dataCodewords, ...new Array(ecCodewords).fill(0)];

  dataCodewords.forEach((_, index) => {
    const coefficient = message[index];

    if (coefficient === 0) {
      return;
    }

    for (let offset = 1; offset < generator.length; offset += 1) {
      message[index + offset] ^= gfMultiply(generator[offset], coefficient);
    }
  });

  return message.slice(dataCodewords.length);
};

const createBlankMatrix = (size) => ({
  modules: Array.from({ length: size }, () => new Array(size).fill(false)),
  reserved: Array.from({ length: size }, () => new Array(size).fill(false)),
});

const setModule = (matrix, row, col, isDark, isReserved = true) => {
  if (row < 0 || col < 0 || row >= matrix.modules.length || col >= matrix.modules.length) {
    return;
  }

  matrix.modules[row][col] = Boolean(isDark);
  if (isReserved) {
    matrix.reserved[row][col] = true;
  }
};

const addFinderPattern = (matrix, row, col) => {
  for (let r = -1; r <= 7; r += 1) {
    for (let c = -1; c <= 7; c += 1) {
      const targetRow = row + r;
      const targetCol = col + c;
      const isSeparator = r === -1 || r === 7 || c === -1 || c === 7;
      const isOuterRing = r === 0 || r === 6 || c === 0 || c === 6;
      const isInnerBlock = r >= 2 && r <= 4 && c >= 2 && c <= 4;

      setModule(matrix, targetRow, targetCol, !isSeparator && (isOuterRing || isInnerBlock));
    }
  }
};

const addAlignmentPattern = (matrix, centerRow, centerCol) => {
  for (let r = -2; r <= 2; r += 1) {
    for (let c = -2; c <= 2; c += 1) {
      const distance = Math.max(Math.abs(r), Math.abs(c));
      setModule(matrix, centerRow + r, centerCol + c, distance === 2 || distance === 0);
    }
  }
};

const reserveFormatAreas = (matrix) => {
  const size = matrix.modules.length;

  for (let i = 0; i <= 8; i += 1) {
    if (i !== 6) {
      setModule(matrix, 8, i, false);
      setModule(matrix, i, 8, false);
    }
  }

  for (let i = 0; i < 8; i += 1) {
    setModule(matrix, size - 1 - i, 8, false);
    setModule(matrix, 8, size - 1 - i, false);
  }

  setModule(matrix, size - 8, 8, true);
};

const addFunctionPatterns = (matrix, version) => {
  const size = matrix.modules.length;

  addFinderPattern(matrix, 0, 0);
  addFinderPattern(matrix, 0, size - 7);
  addFinderPattern(matrix, size - 7, 0);

  for (let i = 8; i < size - 8; i += 1) {
    const isDark = i % 2 === 0;
    setModule(matrix, 6, i, isDark);
    setModule(matrix, i, 6, isDark);
  }

  const alignment = QR_LOW_EC[version].alignment;
  alignment.forEach(row => {
    alignment.forEach(col => {
      const overlapsFinder = (
        (row <= 8 && col <= 8)
        || (row <= 8 && col >= size - 9)
        || (row >= size - 9 && col <= 8)
      );

      if (!overlapsFinder) {
        addAlignmentPattern(matrix, row, col);
      }
    });
  });

  reserveFormatAreas(matrix);
};

const getFormatBits = (mask) => {
  const errorCorrectionLevelBits = 0b01;
  const data = (errorCorrectionLevelBits << 3) | mask;
  let remainder = data << 10;
  const generator = 0x537;

  for (let bit = 14; bit >= 10; bit -= 1) {
    if ((remainder >>> bit) & 1) {
      remainder ^= generator << (bit - 10);
    }
  }

  return ((data << 10) | remainder) ^ 0x5412;
};

const drawFormatBits = (matrix, mask) => {
  const size = matrix.modules.length;
  const bits = getFormatBits(mask);
  const getBit = index => ((bits >>> index) & 1) === 1;

  for (let i = 0; i <= 5; i += 1) {
    setModule(matrix, 8, i, getBit(i));
  }
  setModule(matrix, 8, 7, getBit(6));
  setModule(matrix, 8, 8, getBit(7));
  setModule(matrix, 7, 8, getBit(8));
  for (let i = 9; i < 15; i += 1) {
    setModule(matrix, 14 - i, 8, getBit(i));
  }

  for (let i = 0; i < 8; i += 1) {
    setModule(matrix, size - 1 - i, 8, getBit(i));
  }
  for (let i = 8; i < 15; i += 1) {
    setModule(matrix, 8, size - 15 + i, getBit(i));
  }

  setModule(matrix, size - 8, 8, true);
};

const shouldMask = (mask, row, col) => {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    case 7:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return false;
  }
};

const addDataBits = (matrix, codewords, mask) => {
  const size = matrix.modules.length;
  const bits = codewords.flatMap(codeword => {
    const codewordBits = [];
    appendBits(codewordBits, codeword, 8);
    return codewordBits;
  });
  let bitIndex = 0;
  let upward = true;

  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right -= 1;
    }

    for (let vertical = 0; vertical < size; vertical += 1) {
      const row = upward ? size - 1 - vertical : vertical;

      for (let offset = 0; offset < 2; offset += 1) {
        const col = right - offset;

        if (matrix.reserved[row][col]) {
          continue;
        }

        const rawBit = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
        const maskedBit = rawBit !== shouldMask(mask, row, col);
        setModule(matrix, row, col, maskedBit, false);
        bitIndex += 1;
      }
    }

    upward = !upward;
  }
};

const getPenaltyScore = (modules) => {
  const size = modules.length;
  let penalty = 0;

  const scoreRuns = (values) => {
    let runColor = values[0];
    let runLength = 1;

    for (let i = 1; i <= values.length; i += 1) {
      if (i < values.length && values[i] === runColor) {
        runLength += 1;
        continue;
      }

      if (runLength >= 5) {
        penalty += 3 + runLength - 5;
      }

      runColor = values[i];
      runLength = 1;
    }
  };

  for (let row = 0; row < size; row += 1) {
    scoreRuns(modules[row]);
  }
  for (let col = 0; col < size; col += 1) {
    scoreRuns(modules.map(row => row[col]));
  }

  for (let row = 0; row < size - 1; row += 1) {
    for (let col = 0; col < size - 1; col += 1) {
      const color = modules[row][col];
      if (
        modules[row][col + 1] === color
        && modules[row + 1][col] === color
        && modules[row + 1][col + 1] === color
      ) {
        penalty += 3;
      }
    }
  }

  const pattern = '10111010000';
  const reversePattern = '00001011101';
  for (let row = 0; row < size; row += 1) {
    const sequence = modules[row].map(value => (value ? '1' : '0')).join('');
    for (let col = 0; col <= size - 11; col += 1) {
      const chunk = sequence.slice(col, col + 11);
      if (chunk === pattern || chunk === reversePattern) {
        penalty += 40;
      }
    }
  }
  for (let col = 0; col < size; col += 1) {
    const sequence = modules.map(row => (row[col] ? '1' : '0')).join('');
    for (let row = 0; row <= size - 11; row += 1) {
      const chunk = sequence.slice(row, row + 11);
      if (chunk === pattern || chunk === reversePattern) {
        penalty += 40;
      }
    }
  }

  const darkCount = modules.flat().filter(Boolean).length;
  const darkPercent = (darkCount * 100) / (size * size);
  penalty += Math.floor(Math.abs(darkPercent - 50) / 5) * 10;

  return penalty;
};

const createMatrix = (text) => {
  const bytes = Array.from(textEncoder.encode(text));
  const version = chooseVersion(bytes);
  const dataCodewords = createDataCodewords(text, version);
  const ecCodewords = createErrorCorrection(dataCodewords, QR_LOW_EC[version].ecCodewords);
  const codewords = [...dataCodewords, ...ecCodewords];
  const size = 21 + (version - 1) * 4;
  let bestMatrix = null;
  let bestPenalty = Infinity;

  for (let mask = 0; mask < 8; mask += 1) {
    const matrix = createBlankMatrix(size);
    addFunctionPatterns(matrix, version);
    addDataBits(matrix, codewords, mask);
    drawFormatBits(matrix, mask);

    const penalty = getPenaltyScore(matrix.modules);
    if (penalty < bestPenalty) {
      bestPenalty = penalty;
      bestMatrix = matrix.modules;
    }
  }

  return bestMatrix;
};

export const createQrPath = (text, quietZone = 4) => {
  const modules = createMatrix(text);
  const size = modules.length + quietZone * 2;
  const path = [];

  modules.forEach((row, rowIndex) => {
    row.forEach((isDark, colIndex) => {
      if (isDark) {
        path.push(`M${colIndex + quietZone} ${rowIndex + quietZone}h1v1h-1z`);
      }
    });
  });

  return {
    path: path.join(''),
    size,
    modules,
  };
};
