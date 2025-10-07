/**
 * Policy Modal component for AI-generated policy suggestions
 */
import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { generatePolicySuggestions } from '../lib/geminiService';
import { Loader2 } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    name: string;
    zoneType: string;
    violationRate: number;
    avgNoise: number;
    limit: number;
  } | null;
}

export function PolicyModal({ isOpen, onClose, location }: PolicyModalProps) {
  const [suggestions, setSuggestions] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const generateSuggestions = async () => {
      if (!location) return;
      
      setLoading(true);
      setError('');
      setSuggestions('');
      try {
        const result = await generatePolicySuggestions(location);
        setSuggestions(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate policy suggestions');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && location) {
      generateSuggestions();
    } else {
      setSuggestions('');
      setError('');
    }
  }, [isOpen, location]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            AI Policy Suggestions for {location?.name}
          </DialogTitle>
          <DialogDescription>
            Context: {location?.zoneType} zone with {location?.violationRate}% violation rate
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-slate-600">Generating policy recommendations...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
              <p className="font-semibold">Error:</p>
              <p className="text-sm">{error}</p>
            </div>
          )}

          {suggestions && !loading && (
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
              <div className="prose prose-sm max-w-none">
                <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{suggestions}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
