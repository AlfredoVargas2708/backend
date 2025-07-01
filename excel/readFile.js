const xlsx = require('xlsx');
const fs = require('fs');

/**
 * Lee un archivo Excel y devuelve los datos de todas sus hojas
 * @param {string} filePath - Ruta del archivo Excel
 * @param {Object} [options] - Opciones de lectura
 * @param {boolean} [options.onlyFirstSheet=false] - Si es true, solo lee la primera hoja
 * @param {Object} [options.sheetOptions] - Opciones para sheet_to_json (header, range, etc.)
 * @returns {Array<Object>|Object} - Array con los datos de cada hoja o objeto con datos si onlyFirstSheet es true
 * @throws {Error} - Si el archivo no existe o no es un Excel válido
 */
function readExcelFile(filePath, options = {}) {
    // Validar que el archivo exista
    if (!fs.existsSync(filePath)) {
        throw new Error(`El archivo ${filePath} no existe`);
    }

    // Leer el archivo Excel
    const workbook = xlsx.readFile(filePath);

    // Validar que el archivo tenga hojas
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('El archivo Excel no contiene hojas');
    }

    // Opciones por defecto
    const { onlyFirstSheet = false, sheetOptions = {} } = options;

    // Procesar las hojas
    const sheetNames = onlyFirstSheet
        ? [workbook.SheetNames[0]]
        : workbook.SheetNames;

    const data = sheetNames.map(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        return xlsx.utils.sheet_to_json(worksheet, sheetOptions);
    });

    return onlyFirstSheet ? data[0] : data;
}

module.exports = { readExcelFile };