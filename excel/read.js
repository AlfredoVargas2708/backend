const XLSX = require('xlsx');

async function readExcelFile(filePath) {
    try {
        const data = XLSX.readFile(filePath); // Read the Excel file
        const sheetName = data.SheetNames[0]; // Get the first sheet
        const sheet = data.Sheets[sheetName]; // Get the sheet by name
        const jsonData = XLSX.utils.sheet_to_json(sheet); // Convert sheet to JSON
        
        return jsonData; // Return the JSON data
    } catch (error) {
        console.error('Error reading Excel file:', error);
    }
}

module.exports = readExcelFile;