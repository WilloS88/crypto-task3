const indicatorsMap = {
  ADFGX: ["A", "D", "F", "G", "X"],
  ADFGVX: ["A", "D", "F", "G", "V", "X"],
};

// Filter input
function prepareInput(text: string, variant: "ADFGX" | "ADFGVX"): string {
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
    result = result.replace(/J/g, "I");
  }

  return result;
}

// Check if the char is in the array
function isCharInMatrix(matrix: string[][], char: string): boolean {
  for (const row of matrix) {
    if (row.includes(char)) {
      return true;
    }
  }
  return false;
}

// Function for displaying key in the matrix
function generateCipherMatrix(
  key: string,
  variant: "ADFGX" | "ADFGVX"
): string[][] {
  const indicators = indicatorsMap[variant];
  const matrixSize = indicators.length;
  let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  if (variant === "ADFGX") {
    symbols = symbols.replace(/J/g, "I"); // Merge I and J
  } else {
    symbols += "0123456789";
  }

  const matrix: string[][] = [];
  for (let i = 0; i < matrixSize; i++) {
    matrix[i] = [];
  }

  // Remove duplicates from key
  const uniqueKeyChars = Array.from(new Set(key));

  let rowIndex = 0;
  let colIndex = 0;

  // Fill the matrix with the key
  for (const char of uniqueKeyChars) {
    if (symbols.includes(char) && !isCharInMatrix(matrix, char)) {
      matrix[rowIndex][colIndex] = char;
      colIndex++;
      if (colIndex === matrixSize) {
        colIndex = 0;
        rowIndex++;
      }
      if (rowIndex === matrixSize) {
        break;
      }
    }
  }

  // Fill the remaining matrix with the alphabet
  for (const char of symbols) {
    if (!isCharInMatrix(matrix, char)) {
      matrix[rowIndex][colIndex] = char;
      colIndex++;
      if (colIndex === matrixSize) {
        colIndex = 0;
        rowIndex++;
      }
      if (rowIndex === matrixSize) {
        break;
      }
    }
  }

  return matrix;
}

function displayCipherMatrix(
  matrix: string[][],
  variant: "ADFGX" | "ADFGVX"
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

  const matrixDiv = document.getElementById(
    "matrix-with-key"
  ) as HTMLDivElement;
  matrixDiv.innerHTML = formattedMatrix;
}

// Function to format the matrix with
function formatMatrixWithLabelsHTML(
  matrix: string[][],
  variant: "ADFGX" | "ADFGVX"
): string {
  const indicators = indicatorsMap[variant];
  let formattedMatrix =
    "<b>&nbsp;&nbsp;&nbsp;" +
    indicators.join("&nbsp;&nbsp;&nbsp;") +
    "</b><br>";

  for (let i = 0; i < matrix.length; i++) {
    formattedMatrix += "<b>" + indicators[i] + "</b>&nbsp;";
    formattedMatrix += matrix[i]
      .map((item) => item.toUpperCase())
      .join("&nbsp;&nbsp;&nbsp;");
    formattedMatrix += "<br>";
  }

  return formattedMatrix;
}

// Function to encrypt using the cipher matrix
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

// Function for columnar transposition
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
  keyOrder.sort((a, b) => a.char.localeCompare(b.char));

  let result = "";
  for (const { index: colIndex } of keyOrder) {
    for (let row = 0; row < numRows; row++) {
      result += grid[row][colIndex];
    }
  }

  return result;
}

// Function to encrypt the text
function encryptADFGVX(
  plainText: string,
  matrixKey: string,
  columnKey: string,
  variant: "ADFGX" | "ADFGVX"
): { substitutionText: string; encryptedText: string } {
  const preparedText = prepareInput(plainText, variant);
  const cipherMatrix = generateCipherMatrix(matrixKey, variant);
  const substitutionText = encryptUsingMatrix(
    preparedText,
    cipherMatrix,
    variant
  );
  const encryptedText = columnarTransposition(substitutionText, columnKey);

  return { substitutionText, encryptedText };
}

// Function to display columnar matrix
function displayColumnarMatrix(substitutionText: string, key: string): void {
  const keyLength = key.length;
  const numRows = Math.ceil(substitutionText.length / keyLength);
  const grid: string[][] = [];

  let index = 0;
  for (let i = 0; i < numRows; i++) {
    grid[i] = [];
    for (let j = 0; j < keyLength; j++) {
      grid[i][j] = substitutionText[index] || "";
      index++;
    }
  }

  const keyOrder = key.split("").map((char, index) => ({ char, index }));
  keyOrder.sort((a, b) => a.char.localeCompare(b.char));

  let formattedMatrix = "<table border='1'><tr>";

  for (const { char } of keyOrder) {
    formattedMatrix += `<th>${char}</th>`;
  }
  formattedMatrix += "</tr>";

  for (let row = 0; row < numRows; row++) {
    formattedMatrix += "<tr>";
    for (let col = 0; col < keyLength; col++) {
      formattedMatrix += `<td>${grid[row][col] || ""}</td>`;
    }
    formattedMatrix += "</tr>";
  }
  formattedMatrix += "</table>";

  const matrixDiv = document.getElementById(
    "matrix-column-key"
  ) as HTMLDivElement;
  matrixDiv.innerHTML = formattedMatrix;
}

// Event listener for encryption
document.querySelector(".encrypt-button")?.addEventListener("click", () => {
  try {
    const variantSelect = document.getElementById(
      "cipher-variant"
    ) as HTMLSelectElement;
    const variant = variantSelect.value as "ADFGX" | "ADFGVX";

    const matrixKeyInput = (
      document.getElementById("key-text") as HTMLTextAreaElement
    ).value;
    const matrixKey = prepareInput(matrixKeyInput, variant);

    const columnKeyInput = (
      document.getElementById("key-column-text") as HTMLTextAreaElement
    ).value;
    const columnKey = prepareInput(columnKeyInput, variant).replace(
      /[^A-Z]/g,
      ""
    );

    const plainText = (
      document.getElementById("text-to-encrypt") as HTMLTextAreaElement
    ).value;

    const { substitutionText, encryptedText } = encryptADFGVX(
      plainText,
      matrixKey,
      columnKey,
      variant
    );

    (
      document.getElementById("filtered-text-to-encrypt") as HTMLTextAreaElement
    ).value = prepareInput(plainText, variant);

    const cipherMatrix = generateCipherMatrix(matrixKey, variant);
    displayCipherMatrix(cipherMatrix, variant);

    (
      document.getElementById("text-intermediate") as HTMLTextAreaElement
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

// Event listener for decryption

// Event listener for the Example button
document.getElementById("example-button")?.addEventListener("click", () => {
  const variantSelect = document.getElementById(
    "cipher-variant"
  ) as HTMLSelectElement;
  variantSelect.value = "ADFGVX";

  const matrixKeyInput = document.getElementById(
    "key-text"
  ) as HTMLTextAreaElement;
  matrixKeyInput.value = "Petrklíček".toUpperCase();

  const textToEncryptInput = document.getElementById(
    "text-to-encrypt"
  ) as HTMLTextAreaElement;
  textToEncryptInput.value = "Útok na Čeňka 19:00 !@@&#*^(OK.";

  const columnKeyInput = document.getElementById(
    "key-column-text"
  ) as HTMLTextAreaElement;
  columnKeyInput.value = "Providence".toUpperCase();
});
