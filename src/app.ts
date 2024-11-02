const indicatorsMap = {
  ADFGX: ["A", "D", "F", "G", "X"],
  ADFGVX: ["A", "D", "F", "G", "V", "X"],
};

const spacePlaceholder = "XMZRY";
const numbersPlaceholder = [
  "XZEROY",
  "XONEY",
  "XTWOY",
  "XTHREEY",
  "XFOURY",
  "XFIVEY",
  "XSIXY",
  "XSEVENY",
  "XEIGHTY",
  "XNINEY",
];

// Replace spaces and numbers with placeholders
function applyPlaceholders(text: string): string {
  return text
    .replace(/ /g, spacePlaceholder) // Replace spaces
    .replace(/\d/g, (digit) => numbersPlaceholder[parseInt(digit)]); // Replace numbers
}

// Revert placeholders back to spaces and numbers
function revertPlaceholders(text: string): string {
  let result = text;
  result = result.replace(new RegExp(spacePlaceholder, "g"), " "); // Replace space placeholders
  numbersPlaceholder.forEach((placeholder, index) => {
    result = result.replace(new RegExp(placeholder, "g"), index.toString()); // Replace number placeholders
  });
  return result;
}

function isCharInMatrix(matrix: string[][], char: string): boolean {
  for (const row of matrix) {
    if (row.includes(char)) {
      return true;
    }
  }
  return false;
}

// Filter input
function prepareInput(text: string, variant: "ADFGX" | "ADFGVX"): string {
  if (variant === "ADFGX") {
    text = applyPlaceholders(text); // Apply placeholders for ADFGX variant
  }

  let result = text
    .toUpperCase()
    .replace(/[ÁÀÂÄ]/g, "A")
    .replace(/[Č]/g, "C")
    .replace(/[Ď]/g, "D")
    .replace(/[ÉÈÊËĚ]/g, "E")
    .replace(/[ÍÌÎÏÍ]/g, "I")
    .replace(/[Ň]/g, "N")
    .replace(/[ÓÒÔÖ]/g, "O")
    .replace(/[Ř]/g, "R")
    .replace(/[Š]/g, "S")
    .replace(/[Ť]/g, "T")
    .replace(/[ÚÙÛÜ]/g, "U")
    .replace(/[Ý]/g, "Y")
    .replace(/[Ž]/g, "Z")
    .replace(/[^A-Z0-9]/g, "");

  if (variant === "ADFGX") {
    result = result.replace(/[^A-Z]/g, ""); // Remove non-letter characters
    result = result.replace(/J/g, "I"); // Replace J with I for ADFGX
  }

  return result;
}

// Function for displaying the key in the matrix
function generatePolybiusSquare(
  key: string,
  variant: "ADFGX" | "ADFGVX"
): string[][] {
  const matrixSize = variant === "ADFGX" ? 5 : 6; // Set matrix size based on the variant
  let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (variant === "ADFGX") {
    symbols = symbols.replace(/J/g, "I"); // Merge I and J for the 5x5 matrix
  } else {
    symbols += "0123456789"; // Add digits for the ADFGVX variant
  }

  const matrix: string[][] = Array.from({ length: matrixSize }, () => []);

  // Remove duplicate characters from the key
  const uniqueKeyChars = Array.from(new Set(key));

  let rowIndex = 0;
  let colIndex = 0;

  // Fill the matrix with characters from the key
  for (const char of uniqueKeyChars) {
    if (symbols.includes(char) && !isCharInMatrix(matrix, char)) {
      matrix[rowIndex][colIndex] = char;
      colIndex++;
      if (colIndex === matrixSize) {
        colIndex = 0;
        rowIndex++;
      }
    }
  }

  // Fill the remaining cells in the matrix with leftover symbols
  for (const char of symbols) {
    if (!isCharInMatrix(matrix, char)) {
      matrix[rowIndex][colIndex] = char;
      colIndex++;
      if (colIndex === matrixSize) {
        colIndex = 0;
        rowIndex++;
      }
    }
  }

  return matrix;
}

function displayPolybiusSquare(
  matrix: string[][],
  variant: "ADFGX" | "ADFGVX",
  isEncrypting: boolean
): void {
  const indicators = indicatorsMap[variant];
  let formattedMatrix = "<table><tr><th></th>";

  // Header with column indicators
  for (const indicator of indicators) {
    formattedMatrix += `<th>${indicator}</th>`;
  }
  formattedMatrix += "</tr>";

  // Matrix rows with row indicators
  for (let i = 0; i < matrix.length; i++) {
    formattedMatrix += `<tr><th>${indicators[i]}</th>`;
    for (let j = 0; j < matrix[i].length; j++) {
      formattedMatrix += `<td>${matrix[i][j]}</td>`;
    }
    formattedMatrix += "</tr>";
  }
  formattedMatrix += "</table>";

  // Choose the output element based on the isEncrypting parameter
  const matrixDiv = document.getElementById(
    isEncrypting ? "polybius-square-encrypt" : "polybius-square-decrypt"
  ) as HTMLDivElement;
  if (matrixDiv) {
    matrixDiv.innerHTML = formattedMatrix;
  } else {
    throw new Error(
      `Polybius Square output field not found for ${
        isEncrypting ? "encryption" : "decryption"
      }.`
    );
  }
}

function encryptUsingMatrix(
  plainText: string,
  matrix: string[][],
  variant: "ADFGX" | "ADFGVX"
): string {
  const indicators = indicatorsMap[variant];
  const size = indicators.length;
  let encryptedText = "";

  for (const char of plainText) {
    let found = false;
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (matrix[row][col] === char) {
          encryptedText += indicators[row] + indicators[col];
          found = true;
          break;
        }
      }
      if (found) break;
    }
    if (!found) {
      throw new Error(`Character ${char} not found in cipher matrix.`);
    }
  }
  return encryptedText;
}

function columnarTransposition(encryptedText: string, key: string): string {
  const keyLength = key.length;
  const numRows = Math.ceil(encryptedText.length / keyLength);
  const grid: string[][] = [];

  let index = 0;
  for (let i = 0; i < numRows; i++) {
    grid[i] = [];
    for (let j = 0; j < keyLength; j++) {
      grid[i][j] = encryptedText[index] || "";
      index++;
    }
  }

  const keyOrder = key.split("").map((char, index) => ({ char, index }));
  keyOrder.sort((a, b) => {
    if (a.char === b.char) {
      return a.index - b.index;
    } else {
      return a.char.localeCompare(b.char);
    }
  });

  let result = "";
  for (const { index: colIndex } of keyOrder) {
    for (let row = 0; row < numRows; row++) {
      result += grid[row][colIndex];
    }
  }

  return result;
}

// Function for displaying the column matrix during encryption
function displayColumnarMatrix(substitutionText: string, key: string): void {
  const keyLength = key.length;
  const numRows = Math.ceil(substitutionText.length / keyLength);

  // Create the matrix
  const grid: string[][] = [];
  let index = 0;
  for (let row = 0; row < numRows; row++) {
    grid[row] = [];
    for (let col = 0; col < keyLength; col++) {
      grid[row][col] = substitutionText[index] || "";
      index++;
    }
  }

  // Sort the key and get the column order
  const keyOrder = key.split("").map((char, index) => ({ char, index }));
  keyOrder.sort((a, b) => {
    if (a.char === b.char) {
      return a.index - b.index;
    } else {
      return a.char.localeCompare(b.char);
    }
  });

  // Column indicators (key letters)
  const columnIndicators = keyOrder.map(({ char }) => char);

  // Create the HTML table
  let formattedMatrix = "<table><tr><th></th>";

  // Header with column indicators
  for (const { char } of keyOrder) {
    formattedMatrix += `<th>${char}</th>`;
  }
  formattedMatrix += "</tr>";

  // Matrix rows with row indicators
  for (let row = 0; row < numRows; row++) {
    formattedMatrix += `<tr><th>${row + 1}</th>`;
    for (const { index: colIndex } of keyOrder) {
      formattedMatrix += `<td>${grid[row][colIndex] || ""}</td>`;
    }
    formattedMatrix += "</tr>";
  }
  formattedMatrix += "</table>";

  // Display in the UI
  const matrixDiv = document.getElementById(
    "matrix-column-key"
  ) as HTMLDivElement;
  matrixDiv.innerHTML = formattedMatrix;
}

// Function for inverse columns
function inverseColumnarTransposition(
  encryptedText: string,
  key: string
): string {
  const keyLength = key.length;
  const numRows = Math.ceil(encryptedText.length / keyLength);
  const keyOrder = key
    .split("")
    .map((char, index) => ({ char, index }))
    .sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index);

  // Calculate the lengths of columns
  const colLengths = new Array(keyLength).fill(
    Math.floor(encryptedText.length / keyLength)
  );
  let extraChars = encryptedText.length % keyLength;
  for (let i = 0; i < keyLength; i++) {
    if (extraChars > 0) {
      colLengths[i]++;
      extraChars--;
    }
  }

  // Debugging: log the lengths of each column
  console.log("Column Lengths:", colLengths);

  // Fill columns based on transposed data
  const columns: string[][] = [];
  let index = 0;
  for (let i = 0; i < keyLength; i++) {
    const colLength = colLengths[i];
    const colChars = encryptedText.substr(index, colLength).split("");
    columns[keyOrder[i].index] = colChars;
    index += colLength;
  }

  console.log("columns " + columns);

  // Debugging: log each column for verification
  // columns.forEach((col, i) => console.log(`Column ${i}:`, col));

  // Reconstruct the intermediate text from columns
  let result = "";
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < keyLength; col++) {
      result += columns[col][row] || "";
    }
  }

  return result;
}

function decryptUsingMatrix(
  substitutionText: string,
  matrix: string[][],
  variant: "ADFGX" | "ADFGVX"
): string {
  const indicators = indicatorsMap[variant];
  let decryptedText = "";

  for (let i = 0; i < substitutionText.length; i += 2) {
    const rowIndicator = substitutionText[i];
    const colIndicator = substitutionText[i + 1];

    const row = indicators.indexOf(rowIndicator);
    const col = indicators.indexOf(colIndicator);

    if (row === -1 || col === -1) {
      throw new Error(`Invalid indicators: ${rowIndicator}${colIndicator}`);
    }
    console.log(`hodnota ${matrix[row][col]} X: ${row} Y: ${col}`);

    decryptedText += matrix[row][col];
  }

  return decryptedText;
}

function encryptCipher(
  plainText: string,
  matrixKey: string,
  columnKey: string,
  variant: "ADFGX" | "ADFGVX"
): { substitutionText: string; encryptedText: string } {
  const preparedText = prepareInput(plainText, variant);
  const cipherMatrix = generatePolybiusSquare(matrixKey, variant);
  const substitutionText = encryptUsingMatrix(
    preparedText,
    cipherMatrix,
    variant
  );
  const encryptedText = columnarTransposition(substitutionText, columnKey);

  return { substitutionText, encryptedText };
}

function decryptCipher(
  encryptedText: string,
  matrixKey: string,
  columnKey: string,
  variant: "ADFGX" | "ADFGVX"
): { substitutionText: string; decryptedText: string } {
  // Generate the cipher matrix based on the key
  const cipherMatrix = generatePolybiusSquare(matrixKey, variant);

  // Get the intermediate substitution text using inverse columnar transposition
  const substitutionText = inverseColumnarTransposition(
    encryptedText,
    columnKey
  );

  // Decrypt using the cipher matrix
  let decryptedText = decryptUsingMatrix(
    substitutionText,
    cipherMatrix,
    variant
  );

  // Revert placeholders if using ADFGX variant
  if (variant === "ADFGX") {
    decryptedText = revertPlaceholders(decryptedText);
  }

  return { substitutionText, decryptedText };
}

// Function for displaying the column matrix during decryption
function displayColumnarMatrixDecrypt(
  encriptedText: string,
  key: string,
  encryptedLength: number
): void {
  const keyLength = key.length;
  const numRows = Math.ceil(encryptedLength / keyLength);

  // Sort the key and get the column order
  const keyOrder = key
    .split("")
    .map((char, index) => ({ char, index }))
    .sort((a, b) => a.char.localeCompare(b.char) || a.index - b.index);

  // Calculate column lengths based on the encrypted length and key length
  const colLengths = Array.from({ length: keyLength }, () =>
    Math.floor(encryptedLength / keyLength)
  );
  let extraChars = encryptedLength % keyLength;
  for (let i = 0; i < extraChars; i++) colLengths[i]++;

  // Assign characters from substitutionText to columns based on the sorted key order
  const columns: string[][] = [];
  let index = 0;
  for (const { index: originalIndex } of keyOrder) {
    columns[originalIndex] = encriptedText
      .substr(index, colLengths[originalIndex])
      .split("");
    index += colLengths[originalIndex];
  }

  console.log("columns decrypt " + columns);

  // Reconstruct the matrix
  const grid: string[][] = Array.from({ length: numRows }, () =>
    Array(keyLength).fill("")
  );
  for (let col = 0; col < keyLength; col++) {
    for (let row = 0; row < columns[col].length; row++) {
      grid[row][col] = columns[col][row];
    }
  }

  // Generate HTML table for the matrix
  let formattedMatrix = "<table><tr><th></th>";
  for (const { char } of keyOrder) formattedMatrix += `<th>${char}</th>`;
  formattedMatrix += "</tr>";

  for (let row = 0; row < numRows; row++) {
    formattedMatrix += `<tr><th>${row + 1}</th>`;
    for (let col = 0; col < keyLength; col++) {
      formattedMatrix += `<td>${grid[row][col] || ""}</td>`;
    }
    formattedMatrix += "</tr>";
  }
  formattedMatrix += "</table>";

  // Display the HTML table in the UI
  const matrixDiv = document.getElementById(
    "matrix-column-key-decrypt"
  ) as HTMLDivElement;
  matrixDiv.innerHTML = formattedMatrix;
}

// Event listener for encrypting
document.querySelector(".encrypt-button")?.addEventListener("click", () => {
  try {
    const variantSelect = document.getElementById(
      "cipher-variant"
    ) as HTMLSelectElement;
    const variant = variantSelect.value as "ADFGX" | "ADFGVX";

    const matrixKeyInput = (
      document.getElementById("matrix-key-encrypt") as HTMLTextAreaElement
    ).value;
    const matrixKey = prepareInput(matrixKeyInput, variant);

    const columnKeyInput = (
      document.getElementById("column-key-encryption") as HTMLTextAreaElement
    ).value;
    const columnKey = prepareInput(columnKeyInput, variant).replace(
      /[^A-Z]/g,
      ""
    );

    const plainText = (
      document.getElementById("text-to-encrypt") as HTMLTextAreaElement
    ).value;

    const { substitutionText, encryptedText } = encryptCipher(
      plainText,
      matrixKey,
      columnKey,
      variant
    );

    (
      document.getElementById("filtered-text-to-encrypt") as HTMLTextAreaElement
    ).value = prepareInput(plainText, variant);

    const cipherMatrix = generatePolybiusSquare(matrixKey, variant);
    displayPolybiusSquare(cipherMatrix, variant, true);

    (
      document.getElementById("text-substitution") as HTMLTextAreaElement
    ).value = substitutionText;

    (document.getElementById("encrypted-text") as HTMLTextAreaElement).value =
      encryptedText;

    displayColumnarMatrix(substitutionText, columnKey);
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("An unknown error occurred");
    }
  }
});

// Event listener for decrypting
document.querySelector(".decrypt-button")?.addEventListener("click", () => {
  try {
    const variantSelect = document.getElementById(
      "cipher-variant"
    ) as HTMLSelectElement;
    const variant = variantSelect?.value as "ADFGX" | "ADFGVX";

    const encryptedTextInput = document.getElementById(
      "text-to-decrypt"
    ) as HTMLTextAreaElement;

    const matrixKeyInput = document.getElementById(
      "matrix-key-decrypt"
    ) as HTMLTextAreaElement;
    const matrixKey = prepareInput(matrixKeyInput.value, variant);

    const columnKeyInputElement = document.getElementById(
      "column-key-decryption"
    ) as HTMLTextAreaElement;
    const columnKey = prepareInput(
      columnKeyInputElement.value,
      variant
    ).replace(/[^A-Z]/g, "");

    // Display Column Key Matrix
    displayColumnarMatrixDecrypt(
      encryptedTextInput.value,
      columnKey,
      encryptedTextInput.value.length
    );

    // Decrypt cipher text
    const { substitutionText, decryptedText } = decryptCipher(
      encryptedTextInput.value,
      matrixKey,
      columnKey,
      variant
    );

    // Display decrypted text
    const decryptedTextElement = document.getElementById(
      "decrypted-text"
    ) as HTMLTextAreaElement;
    if (decryptedTextElement) {
      decryptedTextElement.value = decryptedText;
    } else {
      throw new Error("Decrypted text output field not found.");
    }

    // Generate and display the Polybius Square in decryption section
    const cipherMatrix = generatePolybiusSquare(matrixKey, variant);
    displayPolybiusSquare(cipherMatrix, variant, false);
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("An unknown error occurred");
    }
  }
});

// Event listener for values Example
document.getElementById("example-button")?.addEventListener("click", () => {
  const matrixKeyInput = document.getElementById(
    "matrix-key-encrypt"
  ) as HTMLTextAreaElement;
  matrixKeyInput.value = "Petrklíček".toUpperCase();

  const textToEncryptInput = document.getElementById(
    "text-to-encrypt"
  ) as HTMLTextAreaElement;
  textToEncryptInput.value = "Útok na Čeňka 19:00 !@@&#*^(OK.";
  textToEncryptInput.value = "Test";

  const columnKeyInput = document.getElementById(
    "column-key-encryption"
  ) as HTMLTextAreaElement;
  columnKeyInput.value = "Providence".toUpperCase();

  const matrixKeyInputDecrypt = document.getElementById(
    "matrix-key-decrypt"
  ) as HTMLTextAreaElement;
  matrixKeyInputDecrypt.value = "Petrklíček".toUpperCase();

  const columnKeyInputDecrypt = document.getElementById(
    "column-key-decryption"
  ) as HTMLTextAreaElement;
  columnKeyInputDecrypt.value = "Providence".toUpperCase();
});
