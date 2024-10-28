"use strict";
var _a, _b;
const indicatorsMap = {
    ADFGX: ["A", "D", "F", "G", "X"],
    ADFGVX: ["A", "D", "F", "G", "V", "X"],
};
// Filter input
function prepareInput(text, variant) {
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
// Check if the char is in the matrix
function isCharInMatrix(matrix, char) {
    for (const row of matrix) {
        if (row.includes(char)) {
            return true;
        }
    }
    return false;
}
// Function to generate cipher matrix
function generateCipherMatrix(key, variant) {
    const indicators = indicatorsMap[variant];
    const matrixSize = indicators.length;
    let symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (variant === "ADFGX") {
        symbols = symbols.replace(/J/g, "I"); // Merge I and J
    }
    else {
        symbols += "0123456789";
    }
    const matrix = [];
    for (let i = 0; i < matrixSize; i++) {
        matrix[i] = [];
    }
    // Remove duplicates from key
    const uniqueKeyChars = Array.from(new Set(key));
    let rowIndex = 0;
    let colIndex = 0;
    // Add characters from key to the matrix
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
    // Add remaining symbols to the matrix
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
function displayCipherMatrix(matrix, variant) {
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
    const matrixDiv = document.getElementById("matrix-with-key");
    matrixDiv.innerHTML = formattedMatrix;
}
// Function to format the matrix with
function formatMatrixWithLabelsHTML(matrix, variant) {
    const indicators = indicatorsMap[variant];
    let formattedMatrix = "<b>&nbsp;&nbsp;&nbsp;" + indicators.join("&nbsp;&nbsp;&nbsp;") + "</b><br>";
    for (let i = 0; i < matrix.length; i++) {
        formattedMatrix += "<b>" + indicators[i] + "</b>&nbsp;";
        formattedMatrix += matrix[i].map(item => item.toUpperCase()).join("&nbsp;&nbsp;&nbsp;");
        formattedMatrix += "<br>";
    }
    return formattedMatrix;
}
// Function to encrypt using the cipher matrix
function encryptUsingMatrix(plainText, matrix, variant) {
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
            if (found)
                break;
        }
        if (!found) {
            throw new Error(`Character ${char} not found in cipher matrix.`);
        }
    }
    return encryptedText;
}
// Function for columnar transposition
function columnarTransposition(encryptedText, key) {
    const keyLength = key.length;
    const numRows = Math.ceil(encryptedText.length / keyLength);
    const grid = [];
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
function encryptADFGVX(plainText, matrixKey, columnKey, variant) {
    const preparedText = prepareInput(plainText, variant);
    const cipherMatrix = generateCipherMatrix(matrixKey, variant);
    const substitutionText = encryptUsingMatrix(preparedText, cipherMatrix, variant);
    const encryptedText = columnarTransposition(substitutionText, columnKey);
    return { substitutionText, encryptedText };
}
// Function to display columnar matrix
function displayColumnarMatrix(substitutionText, key) {
    const keyLength = key.length;
    const numRows = Math.ceil(substitutionText.length / keyLength);
    const grid = [];
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
    const matrixDiv = document.getElementById("matrix-column-key");
    matrixDiv.innerHTML = formattedMatrix;
}
// Event listener for encryption
(_a = document.querySelector(".encrypt-button")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
    try {
        const variantSelect = document.getElementById("cipher-variant");
        const variant = variantSelect.value;
        const matrixKeyInput = document.getElementById("key-text").value;
        const matrixKey = prepareInput(matrixKeyInput, variant);
        const columnKeyInput = document.getElementById("key-column-text").value;
        const columnKey = prepareInput(columnKeyInput, variant).replace(/[^A-Z]/g, "");
        const plainText = document.getElementById("text-to-encrypt").value;
        const { substitutionText, encryptedText } = encryptADFGVX(plainText, matrixKey, columnKey, variant);
        // Display the prepared input text
        document.getElementById("filtered-text-to-encrypt").value =
            prepareInput(plainText, variant);
        // Generate and display the cipher matrix
        const cipherMatrix = generateCipherMatrix(matrixKey, variant);
        displayCipherMatrix(cipherMatrix, variant);
        // Display intermediate substitution text
        document.getElementById("text-intermediate").value = substitutionText;
        // Display the encrypted text
        document.getElementById("encrypted-text").value = encryptedText;
        // Display the columnar matrix
        displayColumnarMatrix(substitutionText, columnKey);
    }
    catch (error) {
        if (error instanceof Error) {
            alert(error.message);
        }
        else {
            alert("An unknown error occurred");
        }
    }
});
// Event listener for decryption
// Event listener for the Example button
(_b = document.getElementById("example-button")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
    const variantSelect = document.getElementById("cipher-variant");
    variantSelect.value = "ADFGVX";
    const matrixKeyInput = document.getElementById("key-text");
    matrixKeyInput.value = "Petrklíček".toUpperCase();
    const textToEncryptInput = document.getElementById("text-to-encrypt");
    textToEncryptInput.value = "Útok na Čeňka 19:00 !@@&#*^(OK.";
    const columnKeyInput = document.getElementById("key-column-text");
    columnKeyInput.value = "Providence".toUpperCase();
});
