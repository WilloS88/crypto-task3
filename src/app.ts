const matrixSize = 5;
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const matrixKeyExample = "BINGCHILLING";
const spacePlaceholder = "XMEZERAY";
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

// Filter input
function prepareInput(text: string): string {
  return text
    .toUpperCase()
    .replace(/[ÁÀÂÄ]/g, "A")
    .replace(/[Č]/g, "C")
    .replace(/[Ď]/g, "D")
    .replace(/[ÉÈÊËĚ]/g, "E")
    .replace(/[ÍÌÎÏ]/g, "I")
    .replace(/[Ň]/g, "N")
    .replace(/[ÓÒÔÖ]/g, "O")
    .replace(/[Ř]/g, "R")
    .replace(/[Š]/g, "S")
    .replace(/[Ť]/g, "T")
    .replace(/[ÚÙÛÜ]/g, "U")
    .replace(/[Ý]/g, "Y")
    .replace(/[Ž]/g, "Z")
    .replace(/J/g, "I") // Replace J with I
    .replace(/[^A-Z0-9 ]/g, "") // Remove all special characters except numbers and spaces
    .replace(/ /g, spacePlaceholder) // Replace spaces with placeholder
    .replace(/[0-9]/g, (digit: string) => numbersPlaceholder[parseInt(digit)]); // Replace numbers with placeholders
}

// Function to format the matrix without special characters
function formatMatrix(matrix: string[][]): string {
  return matrix
    .map((row) => row.join("        "))
    .join("\n")
    .toUpperCase();
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
function displayKeyMatrix(key: string): string[][] {
  // Array init
  const keyMatrix: string[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill("")
  );

  let rowIndex = 0;
  let colIndex = 0;

  // Fill the matrix with the key
  for (const char of key) {
    if (!isCharInMatrix(keyMatrix, char)) {
      keyMatrix[rowIndex][colIndex] = char;
      colIndex++;
      if (colIndex === matrixSize) {
        colIndex = 0;
        rowIndex++;
        if (rowIndex === matrixSize) {
          return keyMatrix;
        }
      }
    }
  }

  // Fill the remaining matrix with the alphabet
  for (const char of alphabet) {
    if (!isCharInMatrix(keyMatrix, char)) {
      keyMatrix[rowIndex][colIndex] = char;
      colIndex++;
      if (colIndex === matrixSize) {
        colIndex = 0;
        rowIndex++;
        if (rowIndex === matrixSize) {
          // Matrix is full
          break;
        }
      }
    }
  }

  return keyMatrix;
}

// Event Listener for Encrypting, Keys and displaying in UI
document.querySelector(".encrypt-button")?.addEventListener("click", () => {

  try {
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("An unknown error occurred");
    }
  }
});

// Event Listener for Decrypting and displaying in UI
document.querySelector(".encrypt-button")?.addEventListener("click", () => {

  try {
  } catch (error) {
    if (error instanceof Error) {
      alert(error.message);
    } else {
      alert("An unknown error occurred");
    }
  }
});
