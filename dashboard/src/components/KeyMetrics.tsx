/**
 * Key Metrics component showing top-level statistics
 */
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface KeyMetricsProps {
  loudestStation: string;
  highestAvgNoise: number;
  avgViolationRate: number;
}

export function KeyMetrics({ loudestStation, highestAvgNoise, avgViolationRate }: KeyMetricsProps) {
  const formatNumber = (num: number | undefined, decimals = 1) => {
    if (typeof num !== 'number' || isNaN(num)) return 'N/A';
    return num.toFixed(decimals);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Loudest Station</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{loudestStation || 'Loading...'}</div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-red-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Highest Average Noise</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">
            {formatNumber(highestAvgNoise)} <span className="text-lg text-slate-600">dBA</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-orange-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-slate-600">Average Violation Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-slate-900">{formatNumber(avgViolationRate)}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
