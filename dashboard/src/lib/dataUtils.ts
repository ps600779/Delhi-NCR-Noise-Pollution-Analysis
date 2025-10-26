/**
 * Data processing utilities for the noise pollution dashboard
 */

export interface StationRanking {
  Location: string;
  Average_LAeq_dBA: number;
  Zone_Type: string;
  Day_Limit_dBA: number;
  Night_Limit_dBA: number;
}

export interface ExceedanceSummary {
  Location: string;
  Zone_Type: string;
  Day_Limit_dBA: number;
  Night_Limit_dBA: number;
  Exceedance_Count: number;
  Total_Count: number;
  Exceedance_Percentage: number;
}

export interface HourlyStatistics {
  Hour: number;
  Average_LAeq_dBA: number;
  Median_LAeq_dBA: number;
  Max_LAeq_dBA: number;
  Min_LAeq_dBA: number;
}

export interface ViolationSeverity {
  Location: string;
  Zone_Type: string;
  Avg_Excess_dBA: number;
  Max_Excess_dBA: number;
  Severity_Category: string;
}

/**
 * Parse CSV text into array of objects
 */
export function parseCSV<T>(csvText: string): T[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim());
  const data: T[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty lines
    
    const values = line.split(',').map(v => v.trim());
    const row: Record<string, string | number> = {};
    
    headers.forEach((header, index) => {
      const value = values[index] || ''; // Handle missing values
      // Try to parse as number, otherwise keep as string
      const numValue = Number(value);
      row[header] = (value !== '' && !isNaN(numValue)) ? numValue : value;
    });
    
    data.push(row as T);
  }
  
  return data;
}

/**
 * Calculate key metrics from station rankings
 */
export function calculateKeyMetrics(stationRankings: StationRanking[], exceedanceSummary: ExceedanceSummary[]) {
  if (!stationRankings.length || !exceedanceSummary.length) {
    return {
      loudestStation: 'N/A',
      highestAvgNoise: 0,
      avgViolationRate: 0
    };
  }
  
  // Find the loudest station (should be first in rankings)
  const loudestStation = stationRankings[0].Location;
  const highestAvgNoise = stationRankings[0].Average_LAeq_dBA;
  
  // Calculate average violation rate across all stations
  const totalViolationRate = exceedanceSummary.reduce(
    (sum, station) => sum + station.Exceedance_Percentage, 
    0
  );
  const avgViolationRate = totalViolationRate / exceedanceSummary.length;
  
  return {
    loudestStation,
    highestAvgNoise: Number(highestAvgNoise.toFixed(1)),
    avgViolationRate: Number(avgViolationRate.toFixed(1))
  };
}

/**
 * Fetch and parse CSV file from public directory
 */
export async function fetchCSV<T>(filename: string): Promise<T[]> {
  try {
    // Use relative path that works in both dev and production
    const basePath = import.meta.env.BASE_URL || '/';
    const response = await fetch(`${basePath}data/Tables/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${filename}: ${response.status}`);
    }
    const csvText = await response.text();
    return parseCSV<T>(csvText);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error);
    return [];
  }
}

/**
 * Get severity badge color based on category
 */
export function getSeverityColor(category: string | undefined): string {
  if (!category || typeof category !== 'string') {
    return 'default';
  }
  
  switch (category.toLowerCase()) {
    case 'extreme':
      return 'destructive';
    case 'severe':
      return 'destructive';
    case 'high':
      return 'default';
    case 'moderate':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'default';
  }
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-IN');
}
