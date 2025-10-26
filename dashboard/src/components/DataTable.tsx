/**
 * Data Table component with sorting and actions
 */
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { ArrowUpDown } from 'lucide-react';
import type { ExceedanceSummary, StationRanking, ViolationSeverity } from '../lib/dataUtils';
import { getSeverityColor } from '../lib/dataUtils';

type TableData = StationRanking | ExceedanceSummary | ViolationSeverity;

interface DataTableProps {
  title: string;
  data: TableData[];
  type: 'rankings' | 'exceedance' | 'severity';
}

export function DataTable({ title, data, type }: DataTableProps) {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortColumn) return 0;
    
    const aVal = a[sortColumn as keyof TableData];
    const bVal = b[sortColumn as keyof TableData];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal);
    const bStr = String(bVal);
    return sortDirection === 'asc' 
      ? aStr.localeCompare(bStr) 
      : bStr.localeCompare(aStr);
  });

  const renderTableHeaders = () => {
    if (type === 'rankings') {
      return (
        <>
          <TableHead className="text-center">
            <Button variant="ghost" onClick={() => handleSort('Location')} className="flex items-center gap-1 font-semibold mx-auto">
              Location <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-center">
            <Button variant="ghost" onClick={() => handleSort('Average_LAeq_dBA')} className="flex items-center gap-1 font-semibold mx-auto">
              Avg Noise (dBA) <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-center">Zone Type</TableHead>
          <TableHead className="text-center">Day Limit</TableHead>
          <TableHead className="text-center">Night Limit</TableHead>
        </>
      );
    } else if (type === 'exceedance') {
      return (
        <>
          <TableHead className="text-center">
            <Button variant="ghost" onClick={() => handleSort('Location')} className="flex items-center gap-1 font-semibold mx-auto">
              Location <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-center">Zone Type</TableHead>
          <TableHead className="text-center">
            <Button variant="ghost" onClick={() => handleSort('Exceedance_Percentage')} className="flex items-center gap-1 font-semibold mx-auto">
              Violation % <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-center">Exceedances</TableHead>
          <TableHead className="text-center">Total Count</TableHead>
        </>
      );
    } else {
      return (
        <>
          <TableHead className="text-center">
            <Button variant="ghost" onClick={() => handleSort('Location')} className="flex items-center gap-1 font-semibold mx-auto">
              Location <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-center">Zone Type</TableHead>
          <TableHead className="text-center">
            <Button variant="ghost" onClick={() => handleSort('Avg_Excess_dBA')} className="flex items-center gap-1 font-semibold mx-auto">
              Avg Excess (dBA) <ArrowUpDown className="h-4 w-4" />
            </Button>
          </TableHead>
          <TableHead className="text-center">Max Excess (dBA)</TableHead>
          <TableHead className="text-center">Severity</TableHead>
        </>
      );
    }
  };

  const renderTableRow = (row: TableData, index: number) => {
    if (type === 'rankings') {
      const r = row as StationRanking;
      return (
        <TableRow key={index}>
          <TableCell className="font-medium text-center">{r.Location || 'N/A'}</TableCell>
          <TableCell className="font-semibold text-red-600 text-center">
            {typeof r.Average_LAeq_dBA === 'number' ? r.Average_LAeq_dBA.toFixed(1) : 'N/A'}
          </TableCell>
          <TableCell className="text-center">{r.Zone_Type || 'N/A'}</TableCell>
          <TableCell className="text-center">{r.Day_Limit_dBA || 'N/A'}</TableCell>
          <TableCell className="text-center">{r.Night_Limit_dBA || 'N/A'}</TableCell>
        </TableRow>
      );
    } else if (type === 'exceedance') {
      const r = row as ExceedanceSummary;
      return (
        <TableRow key={index}>
          <TableCell className="font-medium text-center">{r.Location || 'N/A'}</TableCell>
          <TableCell className="text-center">{r.Zone_Type || 'N/A'}</TableCell>
          <TableCell className="font-semibold text-orange-600 text-center">
            {typeof r.Exceedance_Percentage === 'number' ? r.Exceedance_Percentage.toFixed(1) : 'N/A'}%
          </TableCell>
          <TableCell className="text-center">
            {typeof r.Exceedance_Count === 'number' ? r.Exceedance_Count.toLocaleString() : 'N/A'}
          </TableCell>
          <TableCell className="text-center">
            {typeof r.Total_Count === 'number' ? r.Total_Count.toLocaleString() : 'N/A'}
          </TableCell>
        </TableRow>
      );
    } else {
      const r = row as ViolationSeverity;
      return (
        <TableRow key={index}>
          <TableCell className="font-medium text-center">{r.Location || 'N/A'}</TableCell>
          <TableCell className="text-center">{r.Zone_Type || 'N/A'}</TableCell>
          <TableCell className="font-semibold text-center">
            {typeof r.Avg_Excess_dBA === 'number' ? r.Avg_Excess_dBA.toFixed(1) : 'N/A'}
          </TableCell>
          <TableCell className="text-center">
            {typeof r.Max_Excess_dBA === 'number' ? r.Max_Excess_dBA.toFixed(1) : 'N/A'}
          </TableCell>
          <TableCell className="text-center">
            <Badge variant={getSeverityColor(r.Severity_Category) as "default" | "destructive" | "secondary" | "outline"}>
              {r.Severity_Category || 'N/A'}
            </Badge>
          </TableCell>
        </TableRow>
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-96">
          <Table>
            <TableHeader>
              <TableRow>
                {renderTableHeaders()}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((row, index) => renderTableRow(row, index))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
