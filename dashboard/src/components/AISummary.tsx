/**
 * AI Summary component with Gemini API integration
 */
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { generateAnalysisSummary } from '../lib/geminiService';
import { Loader2, Sparkles } from 'lucide-react';

interface AISummaryProps {
  keyMetrics: {
    loudestStation: string;
    highestAvgNoise: number;
    avgViolationRate: number;
  };
}

export function AISummary({ keyMetrics }: AISummaryProps) {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await generateAnalysisSummary(keyMetrics);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-8 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          AI-Powered Analysis Summary
        </CardTitle>
        <CardDescription>
          Generate an intelligent summary of the key findings using AI
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleGenerateSummary} 
          disabled={loading || !!summary}
          className="mb-4"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : summary ? (
            'Summary Generated'
          ) : (
            'Generate Summary'
          )}
        </Button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md mb-4">
            <p className="font-semibold">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {summary && (
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
