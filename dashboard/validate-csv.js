#!/usr/bin/env node
/**
 * CSV Validation Script for Noise Pollution Dashboard
 * 
 * Validates that CSV files have:
 * - Correct column headers
 * - No missing data
 * - Proper formatting
 * - Valid severity categories
 * 
 * Usage: node validate-csv.js
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`);
}

function validateCSV(filename, requiredColumns, options = {}) {
  const filepath = path.join(__dirname, 'public', 'data', 'Tables', filename);
  
  // Check file exists
  if (!fs.existsSync(filepath)) {
    log('red', `\n❌ ${filename}: File not found at ${filepath}`);
    log('yellow', `   Expected location: public/data/Tables/${filename}`);
    return false;
  }

  const content = fs.readFileSync(filepath, 'utf8');
  const lines = content.trim().split('\n');
  
  log('blue', `\n📄 Validating ${filename}...`);
  
  // Check minimum lines
  if (lines.length < 2) {
    log('red', `❌ ${filename}: No data rows found (file has ${lines.length} lines)`);
    return false;
  }
  
  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim());
  console.log(`   Headers found: ${headers.join(', ')}`);
  
  // Check required columns
  const missing = requiredColumns.filter(col => !headers.includes(col));
  if (missing.length > 0) {
    log('red', `❌ Missing required columns: ${missing.join(', ')}`);
    log('yellow', `   Required: ${requiredColumns.join(', ')}`);
    return false;
  }
  
  // Check for extra columns
  const extra = headers.filter(h => !requiredColumns.includes(h));
  if (extra.length > 0) {
    log('yellow', `⚠️  Extra columns (will be ignored): ${extra.join(', ')}`);
  }
  
  let validRows = 0;
  let errors = 0;
  let warnings = 0;
  
  // Validate data rows
  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) {
      log('yellow', `⚠️  Line ${lineNum}: Empty line (will be skipped)`);
      warnings++;
      continue;
    }
    
    const values = line.split(',').map(v => v.trim());
    
    // Check column count
    if (values.length !== headers.length) {
      log('red', `❌ Line ${lineNum}: Expected ${headers.length} columns, got ${values.length}`);
      log('yellow', `   Data: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
      errors++;
      continue;
    }
    
    // Check for empty values
    const emptyIndices = values.map((v, idx) => v === '' ? idx : -1).filter(idx => idx !== -1);
    if (emptyIndices.length > 0) {
      const emptyColumns = emptyIndices.map(idx => headers[idx]);
      log('yellow', `⚠️  Line ${lineNum}: Empty values in columns: ${emptyColumns.join(', ')}`);
      warnings++;
    }
    
    // Validate numeric columns
    if (options.numericColumns) {
      options.numericColumns.forEach(colName => {
        const idx = headers.indexOf(colName);
        if (idx !== -1 && values[idx] !== '') {
          const num = Number(values[idx]);
          if (isNaN(num)) {
            log('red', `❌ Line ${lineNum}: "${colName}" should be numeric, got "${values[idx]}"`);
            errors++;
          }
        }
      });
    }
    
    // Validate severity category
    if (options.validateSeverity) {
      const idx = headers.indexOf('Severity_Category');
      if (idx !== -1 && values[idx]) {
        const validCategories = ['Extreme', 'Severe', 'High', 'Moderate', 'Low'];
        if (!validCategories.includes(values[idx])) {
          log('red', `❌ Line ${lineNum}: Invalid Severity_Category "${values[idx]}"`);
          log('yellow', `   Valid options: ${validCategories.join(', ')}`);
          errors++;
        }
      }
    }
    
    validRows++;
  }
  
  // Summary
  console.log(`   Data rows: ${validRows}`);
  if (errors > 0) {
    log('red', `❌ ${errors} error(s) found`);
  }
  if (warnings > 0) {
    log('yellow', `⚠️  ${warnings} warning(s) found`);
  }
  if (errors === 0 && warnings === 0) {
    log('green', `✅ All ${validRows} rows are valid!`);
  }
  
  return errors === 0;
}

// Main validation
console.log('🔍 CSV File Validation Tool');
console.log('============================');

let allValid = true;

// Validate station rankings
allValid &= validateCSV('01_station_rankings.csv', 
  ['Location', 'Average_LAeq_dBA', 'Zone_Type', 'Day_Limit_dBA', 'Night_Limit_dBA'],
  {
    numericColumns: ['Average_LAeq_dBA', 'Day_Limit_dBA', 'Night_Limit_dBA']
  }
);

// Validate exceedance summary
allValid &= validateCSV('02_exceedance_summary.csv', 
  ['Location', 'Zone_Type', 'Day_Limit_dBA', 'Night_Limit_dBA', 
   'Exceedance_Count', 'Total_Count', 'Exceedance_Percentage'],
  {
    numericColumns: ['Day_Limit_dBA', 'Night_Limit_dBA', 'Exceedance_Count', 
                     'Total_Count', 'Exceedance_Percentage']
  }
);

// Validate violation severity
allValid &= validateCSV('04_violation_severity.csv', 
  ['Location', 'Zone_Type', 'Avg_Excess_dBA', 'Max_Excess_dBA', 'Severity_Category'],
  {
    numericColumns: ['Avg_Excess_dBA', 'Max_Excess_dBA'],
    validateSeverity: true
  }
);

// Final result
console.log('\n============================');
if (allValid) {
  log('green', '✅ All CSV files are valid and ready to use!');
  log('blue', '\nYou can now run: npm run dev');
  process.exit(0);
} else {
  log('red', '❌ Some CSV files have issues. Please fix them before running the dashboard.');
  log('yellow', '\nTips:');
  log('yellow', '  - Remove trailing commas');
  log('yellow', '  - Fill empty numeric cells with 0 or remove the row');
  log('yellow', '  - Use only valid Severity_Category values: Extreme, Severe, High, Moderate, Low');
  log('yellow', '  - Ensure numeric columns contain only numbers');
  process.exit(1);
}
