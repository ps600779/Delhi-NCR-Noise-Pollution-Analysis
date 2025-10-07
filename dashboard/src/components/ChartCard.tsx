/**
 * Chart Card component for displaying visualization images
 */
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface ChartCardProps {
  title: string;
  imagePath: string;
  description?: string;
}

export function ChartCard({ title, imagePath, description }: ChartCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && (
          <p className="text-sm text-slate-600 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="p-0">
        <img 
          src={imagePath} 
          alt={title}
          className="w-full h-auto object-contain"
          loading="lazy"
        />
      </CardContent>
    </Card>
  );
}
