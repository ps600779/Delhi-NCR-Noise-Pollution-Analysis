import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { KeyMetrics } from './components/KeyMetrics';
import { ChartCard } from './components/ChartCard';
import { DataTable } from './components/DataTable';
import PredictiveMapDashboard from './components/PredictiveMapDashboard';
import 'leaflet/dist/leaflet.css';
import {
  fetchCSV,
  calculateKeyMetrics,
  type StationRanking,
  type ExceedanceSummary,
  type ViolationSeverity,
} from './lib/dataUtils';

function App() {
  const [stationRankings, setStationRankings] = useState<StationRanking[]>([]);
  const [exceedanceSummary, setExceedanceSummary] = useState<ExceedanceSummary[]>([]);
  const [violationSeverity, setViolationSeverity] = useState<ViolationSeverity[]>([]);
  const [activeTab, setActiveTab] = useState<'analysis' | 'prediction'>('analysis');

  // Get the base URL for assets
  const basePath = import.meta.env.BASE_URL || '/';
  const [keyMetrics, setKeyMetrics] = useState({
    loudestStation: 'Loading...',
    highestAvgNoise: 0,
    avgViolationRate: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rankings, exceedance, severity] = await Promise.all([
        fetchCSV<StationRanking>('01_station_rankings.csv'),
        fetchCSV<ExceedanceSummary>('02_exceedance_summary.csv'),
        fetchCSV<ViolationSeverity>('04_violation_severity.csv'),
      ]);

      setStationRankings(rankings);
      setExceedanceSummary(exceedance);
      setViolationSeverity(severity);

      const metrics = calculateKeyMetrics(rankings, exceedance);
      setKeyMetrics(metrics);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      
      {/* Tab Navigation */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'analysis'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📊 Statistical Analysis
            </button>
            <button
              onClick={() => setActiveTab('prediction')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'prediction'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🗺️ Predictive Map
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analysis' ? (
        <main className="container mx-auto px-6 py-8">
          {/* Key Metrics Bar */}
          <KeyMetrics {...keyMetrics} />

          {/* Main Dashboard Grid */}
          <div className="space-y-8">
            {/* Data Tables Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Detailed Analysis Tables</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DataTable
                  title="Station Rankings (Loudest First)"
                  data={stationRankings}
                  type="rankings"
                />
                <DataTable
                  title="Exceedance Summary"
                  data={exceedanceSummary}
                  type="exceedance"
                />
              </div>
              <div className="mt-6">
                <DataTable
                  title="Violation Severity Analysis"
                  data={violationSeverity}
                  type="severity"
                />
              </div>
            </section>

            {/* Visualizations Section */}
            <section>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Interactive Visualizations</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard
                  title="Noise Hotspots Across Delhi NCR"
                  imagePath={`${basePath}visualizations/Visualizations/03_hotspot_map.png`}
                  description="Spatial distribution of noise pollution across monitoring stations"
                />
                <ChartCard
                  title="Comparative Noise Levels"
                  imagePath={`${basePath}visualizations/Visualizations/02_comparative_boxplot.png`}
                  description="Box plot comparison showing distribution of noise levels by location"
                />
                <ChartCard
                  title="Hourly Noise Trends"
                  imagePath={`${basePath}visualizations/Visualizations/04_hourly_noise_trends.png`}
                  description="Average noise levels throughout the day"
                />
                <ChartCard
                  title="Time Series Analysis - ITO"
                  imagePath={`${basePath}visualizations/Visualizations/01_timeseries_ito.png`}
                  description="Temporal trends in noise levels at ITO station"
                />
                <ChartCard
                  title="Exceedance Choropleth Map"
                  imagePath={`${basePath}visualizations/Visualizations/05_exceedance_choropleth_map.png`}
                  description="Geographic visualization of violation rates by district"
                />
                <ChartCard
                  title="Violation Severity Map"
                  imagePath={`${basePath}visualizations/Visualizations/06_violation_severity_map.png`}
                  description="Spatial analysis of noise violation severity"
                />
                <ChartCard
                  title="Spatial Interpolation"
                  imagePath={`${basePath}visualizations/Visualizations/07_spatial_interpolation_map.png`}
                  description="Interpolated noise levels across Delhi NCR"
                />
                <ChartCard
                  title="Hexbin Interpolation"
                  imagePath={`${basePath}visualizations/Visualizations/08_hexbin_interpolation_map.png`}
                  description="Hexagonal binning visualization of noise distribution"
                />
              </div>
            </section>
          </div>
        </main>
      ) : (
        <PredictiveMapDashboard />
      )}
    </div>
  );
}

export default App;