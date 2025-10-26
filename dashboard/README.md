# Delhi NCR Noise Pollution Dashboard

An interactive React dashboard presenting spatiotemporal analysis of noise pollution across 10 CPCB monitoring stations in Delhi NCR.

## Features

- **Key Metrics Overview**: Glanceable summary showing the loudest station, highest average noise, and average violation rate
- **Interactive Data Tables**: Sortable tables with detailed statistics for each monitoring station
- **Rich Visualizations**: 8+ charts and maps showing spatial and temporal noise patterns
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Vite** for blazing-fast development
- **Tailwind CSS** for styling
- **shadcn/ui** for beautiful, accessible UI components
- **Lucide Icons** for crisp iconography

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key ([Get one here](https://makersuite.google.com/app/apikey))

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   - Edit the `.env` file in the dashboard root
   - Add your Gemini API key:
     ```
     VITE_GEMINI_API_KEY=your_actual_api_key_here
     ```

3. **Ensure data files are in place**:
   - CSV files should be in `public/data/Tables/`
   - Visualization images should be in `public/visualizations/Visualizations/`

### Running the Development Server

```bash
npm run dev
```

The dashboard will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
dashboard/
├── public/
│   ├── data/
│   │   └── Tables/          # CSV data files
│   └── visualizations/
│       └── Visualizations/  # PNG chart images
├── src/
│   ├── components/
│   │   ├── Header.tsx       # Dashboard header
│   │   ├── KeyMetrics.tsx   # Key metrics cards
│   │   ├── AISummary.tsx    # AI summary generator
│   │   ├── ChartCard.tsx    # Reusable chart card
│   │   ├── DataTable.tsx    # Sortable data tables
│   │   ├── PolicyModal.tsx  # AI policy suggestions modal
│   │   └── ui/              # shadcn/ui components
│   ├── lib/
│   │   ├── dataUtils.ts     # CSV parsing & data utilities
│   │   └── geminiService.ts # Gemini API integration
│   ├── App.tsx              # Main application component
│   └── main.tsx             # Application entry point
└── package.json
```

## Data Files Required

The dashboard expects the following CSV files in `public/data/Tables/`:

- `01_station_rankings.csv` - Stations ranked by average noise level
- `02_exceedance_summary.csv` - Violation statistics per station
- `04_violation_severity.csv` - Severity classification of violations

And the following visualizations in `public/visualizations/Visualizations/`:

- `01_timeseries_ito.png`
- `02_comparative_boxplot.png`
- `03_hotspot_map.png`
- `04_hourly_noise_trends.png`
- `05_exceedance_choropleth_map.png`
- `06_violation_severity_map.png`
- `07_spatial_interpolation_map.png`
- `08_hexbin_interpolation_map.png`

## Features Walkthrough

### 1. Key Metrics Bar
Displays three critical metrics at a glance:
- Loudest monitoring station
- Highest average noise level (in dBA)
- Average violation rate across all stations

### 2. AI Summary
Click "Generate Summary" to get an AI-powered analysis of the overall findings using Gemini AI.

### 3. Data Tables
- **Station Rankings**: All stations sorted by average noise level
- **Exceedance Summary**: Violation statistics with "Suggest Policies" action buttons
- **Violation Severity**: Categorization of violations by severity

All tables support column sorting by clicking the headers.

### 4. Policy Suggestions
Click "Suggest Policies" in the Exceedance Summary table to get location-specific, AI-generated policy recommendations tailored to:
- Zone type (Commercial, Residential, etc.)
- Current violation rate
- Average noise level vs. legal limit

### 5. Visualizations
Eight interactive charts showing:
- Spatial hotspot maps
- Temporal trends
- Comparative box plots
- Interpolated noise levels
- And more...

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_GEMINI_API_KEY` | Google Gemini API key for AI features | Yes |

## Troubleshooting

### API Key Issues
- Ensure your `.env` file is in the root of the `dashboard/` folder
- Variable must start with `VITE_` to be accessible in the browser
- Restart the dev server after changing `.env`

### Data Not Loading
- Check browser console for fetch errors
- Verify CSV files are in `public/data/Tables/`
- Ensure CSV files have proper headers matching the TypeScript interfaces

### Images Not Displaying
- Verify image files are in `public/visualizations/Visualizations/`
- Check file names match exactly (case-sensitive)

## License

This project is part of an academic environmental analysis study.

## Contributors
- Priyanshu Sharma[2024201046]
- Suraj Lalwani[2024201071]
- Niket Mittal[2024201076]
- Vaibhav Jain[2024201023]
- Vatsal Gupta[2024201065]


Team 17 - Environmental Science & Technology Project

---