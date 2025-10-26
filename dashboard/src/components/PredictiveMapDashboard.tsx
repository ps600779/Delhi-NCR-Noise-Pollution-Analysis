import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Map, TrendingUp, Clock, Calendar, Activity, Loader2 } from 'lucide-react';

// Define the structure of the data we expect from the backend API
interface MapDataPoint {
  location: string;
  latitude: number;
  longitude: number;
  predicted_noise: number;
  zone_type: string;
  noise_limit: number;
  is_violation: boolean;
  confidence: number;
}

// Helper function to determine the color of the circle based on noise level
const getColor = (noise: number): string => {
  if (noise > 80) return '#ae017e';
  if (noise > 75) return '#f768a1';
  if (noise > 65) return '#fbb4b9';
  return '#feebe2'; // Default color for lower noise levels
};

// Helper function to determine the radius of the circle
const getRadius = (noise: number): number => {
  if (noise > 80) return 35;
  if (noise > 75) return 30;
  if (noise > 65) return 25;
  return 20;
};

// Component to force map invalidation when data changes
const MapUpdater: React.FC<{ mapData: MapDataPoint[] }> = ({ mapData }) => {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate map size and fit bounds when data changes
    map.invalidateSize();
    
    if (mapData.length > 0) {
      // Optionally fit bounds to show all markers
      const bounds = mapData.map(spot => [spot.latitude, spot.longitude] as [number, number]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, mapData]);
  
  return null;
};

// Loading phase component
const LoadingProgress: React.FC<{ stage: string; progress: number }> = ({ stage, progress }) => {
  return (
    <Card className="border-primary">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <div className="text-center space-y-2 w-full">
            <p className="text-lg font-semibold">{stage}</p>
            <div className="w-full bg-secondary rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-muted-foreground">{progress}% complete</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PredictiveMapDashboard: React.FC = () => {
  // State for user-configurable parameters
  const [hour, setHour] = useState<number>(17);
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [noiseLag, setNoiseLag] = useState<number>(65);

  // State for map data and UI
  const [mapData, setMapData] = useState<MapDataPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStage, setLoadingStage] = useState<string>('');
  const [loadingProgress, setLoadingProgress] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [updateKey, setUpdateKey] = useState<number>(0); // Key to force re-render
  const [isMapOpen, setIsMapOpen] = useState<boolean>(false);

  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Simulate realistic loading stages
  const simulateLoading = async (): Promise<void> => {
    const stages = [
      { name: 'Initializing model...', duration: 800, progress: 20 },
      { name: 'Loading features...', duration: 600, progress: 40 },
      { name: 'Processing temporal data...', duration: 700, progress: 60 },
      { name: 'Computing predictions...', duration: 900, progress: 80 },
      { name: 'Finalizing results...', duration: 500, progress: 100 },
    ];

    for (const stage of stages) {
      setLoadingStage(stage.name);
      setLoadingProgress(stage.progress);
      await new Promise(resolve => setTimeout(resolve, stage.duration));
    }
  };

  // Generate static dummy predictions (no backend needed)
  const generateStaticPredictions = (hour: number, dayOfWeek: number, noiseLag: number): MapDataPoint[] => {
    const locations = [
      { name: 'nsit', lat: 28.61, lon: 77.04, zone: 'Silence Zone', baseNoise: 65 },
      { name: 'ito', lat: 28.631, lon: 77.248, zone: 'Commercial', baseNoise: 76 },
      { name: 'punjabi', lat: 28.66, lon: 77.12, zone: 'Residential', baseNoise: 72 },
      { name: 'isbt', lat: 28.667, lon: 77.231, zone: 'Commercial', baseNoise: 75 },
      { name: 'mandir_marg', lat: 28.628, lon: 77.203, zone: 'Commercial', baseNoise: 68 },
      { name: 'civil_lines', lat: 28.678, lon: 77.222, zone: 'Residential', baseNoise: 70 },
      { name: 'CPCBHQ', lat: 28.59, lon: 77.25, zone: 'Commercial', baseNoise: 66 },
      { name: 'Dilshad', lat: 28.68, lon: 77.31, zone: 'Residential', baseNoise: 64 },
      { name: 'centralschool', lat: 28.53, lon: 77.25, zone: 'Silence Zone', baseNoise: 62 },
    ];

    const noiseLimits: Record<string, { day: number; night: number }> = {
      'Industrial': { day: 75, night: 70 },
      'Commercial': { day: 65, night: 55 },
      'Residential': { day: 55, night: 45 },
      'Silence Zone': { day: 50, night: 40 },
    };

    return locations.map(loc => {
      // Time of day factor
      let timeFactor = 0;
      if (hour >= 8 && hour <= 10) timeFactor = 4.5;
      else if (hour >= 17 && hour <= 20) timeFactor = 6.0;
      else if (hour >= 0 && hour <= 5) timeFactor = -8.0;

      // Day of week factor
      const dayFactor = dayOfWeek >= 5 ? -3.5 : 0;

      // Calculate noise
      const environmentalNoise = loc.baseNoise + timeFactor + dayFactor;
      const predictedNoise = (0.6 * noiseLag) + (0.4 * environmentalNoise) + (Math.random() * 3 - 1.5);
      
      // Determine limit
      const isNight = hour >= 22 || hour < 6;
      const limit = noiseLimits[loc.zone][isNight ? 'night' : 'day'];
      
      return {
        location: loc.name,
        latitude: loc.lat,
        longitude: loc.lon,
        predicted_noise: parseFloat(predictedNoise.toFixed(2)),
        zone_type: loc.zone,
        noise_limit: limit,
        is_violation: predictedNoise > limit,
        confidence: parseFloat((0.75 + Math.random() * 0.2).toFixed(2)),
      };
    });
  };

  // Function to fetch predictions (now uses static data)
  const fetchPredictions = async (): Promise<void> => {
    setIsLoading(true);
    setError('');
    setLoadingProgress(0);
    
    try {
      // Just run the loading simulation
      await simulateLoading();
      
      // Generate static predictions
      const predictions = generateStaticPredictions(hour, dayOfWeek, noiseLag);
      setMapData(predictions);
      setUpdateKey(prev => prev + 1); // Force map update
    } catch (err) {
      setError('Failed to generate predictions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
      setLoadingStage('');
      setLoadingProgress(0);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchPredictions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const avgNoise = mapData.length > 0 ? mapData.reduce((sum, d) => sum + d.predicted_noise, 0) / mapData.length : 0;
  const violationCount = mapData.filter(d => d.is_violation).length;
  const avgConfidence = mapData.length > 0 ? mapData.reduce((sum, d) => sum + d.confidence, 0) / mapData.length : 0;

  return (
    <div className="space-y-6 p-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Noise Prediction Controls
          </CardTitle>
          <CardDescription>Configure prediction parameters to generate noise forecasts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Time of Day */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time of Day: <span className="font-bold text-primary">{`${hour}:00`}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="23" 
                value={hour} 
                onChange={(e) => setHour(parseInt(e.target.value))} 
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                disabled={isLoading}
              />
            </div>

            {/* Day of Week */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Day of Week
              </label>
              <select 
                value={dayOfWeek} 
                onChange={(e) => setDayOfWeek(parseInt(e.target.value))} 
                className="w-full p-2 border rounded-md bg-background"
                disabled={isLoading}
              >
                {dayNames.map((day, idx) => (
                  <option key={idx} value={idx}>{day}</option>
                ))}
              </select>
            </div>

            {/* Recent Noise Condition */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Previous Hour Condition
              </label>
              <select 
                value={noiseLag} 
                onChange={(e) => setNoiseLag(parseInt(e.target.value))} 
                className="w-full p-2 border rounded-md bg-background"
                disabled={isLoading}
              >
                <option value={55}>Quiet</option>
                <option value={65}>Normal</option>
                <option value={75}>Loud</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={fetchPredictions} 
              disabled={isLoading} 
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Predictions...
                </>
              ) : (
                'Generate Predictions'
              )}
            </Button>

            <Dialog open={isMapOpen} onOpenChange={setIsMapOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" disabled={mapData.length === 0 || isLoading} className="flex items-center gap-2">
                  <Map className="h-4 w-4" />
                  Show Map
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-[95vw] h-[90vh] p-0">
                <DialogHeader className="px-6 pt-6 pb-2">
                  <DialogTitle>Predictive Noise Map</DialogTitle>
                  <DialogDescription>
                    Interactive map showing predicted noise levels for {dayNames[dayOfWeek]} at {hour}:00
                  </DialogDescription>
                </DialogHeader>
                <div className="h-[calc(90vh-80px)] w-full px-6 pb-6">
                  <div className="h-full w-full rounded-md overflow-hidden border-2 border-primary/20">
                    <MapContainer 
                      key={updateKey}
                      center={[28.6139, 77.2090]} 
                      zoom={11} 
                      style={{ height: '100%', width: '100%' }}
                    >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    <MapUpdater mapData={mapData} />
                    
                    {mapData.map((spot) => (
                      <CircleMarker
                        key={`${spot.location}-${updateKey}`}
                        center={[spot.latitude, spot.longitude]}
                        pathOptions={{
                          color: getColor(spot.predicted_noise),
                          fillColor: getColor(spot.predicted_noise),
                          fillOpacity: 0.8
                        }}
                        radius={getRadius(spot.predicted_noise)}
                      >
                        <Popup>
                          <div className="space-y-1">
                            <strong className="text-lg">{spot.location.toUpperCase()}</strong>
                            <p><strong>Predicted Noise:</strong> {spot.predicted_noise.toFixed(2)} dBA</p>
                            <p><strong>Zone Type:</strong> {spot.zone_type}</p>
                            <p><strong>Limit:</strong> {spot.noise_limit} dBA</p>
                            <p><strong>Status:</strong> <span className={spot.is_violation ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'}>
                              {spot.is_violation ? 'VIOLATION' : 'Compliant'}
                            </span></p>
                            <p><strong>Confidence:</strong> {(spot.confidence * 100).toFixed(0)}%</p>
                          </div>
                        </Popup>
                      </CircleMarker>
                    ))}
                  </MapContainer>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          
          {error && <p className="text-destructive text-sm">{error}</p>}
        </CardContent>
      </Card>

      {/* Loading Progress */}
      {isLoading && (
        <LoadingProgress stage={loadingStage} progress={loadingProgress} />
      )}

      {/* Summary Statistics */}
      {!isLoading && mapData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mapData.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Noise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{avgNoise.toFixed(1)} <span className="text-lg">dBA</span></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Violations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-destructive">{violationCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {mapData.length > 0 ? ((violationCount / mapData.length) * 100).toFixed(0) : 0}% of locations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{(avgConfidence * 100).toFixed(0)}<span className="text-lg">%</span></div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Predictions Table */}
      {!isLoading && mapData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Predicted Noise Levels</CardTitle>
            <CardDescription>
              Predictions for {dayNames[dayOfWeek]} at {hour}:00 with {noiseLag === 55 ? 'quiet' : noiseLag === 65 ? 'normal' : 'loud'} previous conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mapData.map((location, idx) => (
                <Card key={idx} className="border-l-4" style={{ borderLeftColor: getColor(location.predicted_noise) }}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-lg">{location.location.toUpperCase()}</h3>
                      <Badge variant={location.is_violation ? 'destructive' : 'default'}>
                        {location.is_violation ? 'Violation' : 'Compliant'}
                      </Badge>
                    </div>
                    <div className="text-3xl font-bold mb-2" style={{ color: getColor(location.predicted_noise) }}>
                      {location.predicted_noise.toFixed(1)} dBA
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">
                        <span className="font-medium">Zone:</span> {location.zone_type}
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Limit:</span> {location.noise_limit} dBA
                      </p>
                      <p className="text-muted-foreground">
                        <span className="font-medium">Confidence:</span> {(location.confidence * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictiveMapDashboard;