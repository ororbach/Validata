import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer, Label,
} from 'recharts';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { COLORS, CHART_MARGIN, CHART_HEIGHT, getGridColor, getAxisTick, getAxisTextColor } from '../chartConfig';
import { useTheme } from '@/context/ThemeContext';
import YLabelChart from './YLabelChart';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 shadow-md text-xs space-y-1">
      <p className="font-semibold text-slate-700 dark:text-slate-300">{d.participantId || 'Unknown'}</p>
      <p className="text-slate-600 dark:text-slate-300">Mean angle: <span className="font-medium">{d.mean?.toFixed(1)}°</span></p>
      <p style={{ color: Number(d.diff) >= 0 ? COLORS.bias : COLORS.limit }}>
        AI − Goniometer: <span className="font-medium">{Number(d.diff) >= 0 ? '+' : ''}{d.diff?.toFixed(2)}°</span>
      </p>
    </div>
  );
};

// x = mean of (AI, goniometer), y = AI − goniometer
// Solid line = mean bias; dashed lines = 95% limits of agreement (±1.96 SD)
const BlandAltmanPlot = ({ data }) => {
  const { theme } = useTheme();
  if (!data || !data.plotData?.length) return null;

  const { plotData, meanDiff, upperLimit, lowerLimit, isNormal } = data;
  const gridColor = getGridColor(theme);
  const axisTextColor = getAxisTextColor(theme);

  return (
    <div className="relative w-full h-full">
      {isNormal !== undefined && (
        <div 
          className={`absolute top-0 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border shadow-sm ${
            isNormal 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50' 
              : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50'
          }`}
        >
          {isNormal ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
          <span>{isNormal ? 'Normal Distribution' : 'Non-Normal Distribution'}</span>
        </div>
      )}
      <YLabelChart label="AI − Goniometer (degrees)" color={axisTextColor}>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <ScatterChart margin={{ ...CHART_MARGIN, left: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis type="number" dataKey="mean" tick={getAxisTick(theme)}>
            <Label value="Mean of AI & Goniometer (degrees)" position="insideBottom" offset={-20} fontSize={11} fill={axisTextColor} />
          </XAxis>
          <YAxis type="number" dataKey="diff" tick={getAxisTick(theme)} width={35} />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <ReferenceLine y={0} stroke={gridColor} strokeWidth={1} />
          <ReferenceLine
            y={meanDiff}
            stroke={COLORS.bias}
            strokeWidth={2}
            label={{ value: data.isNormal === false ? `Median: ${meanDiff.toFixed(2)}°` : `Bias: ${meanDiff.toFixed(2)}°`, position: 'insideTopRight', fontSize: 10, fill: COLORS.bias }}
          />
          <ReferenceLine
            y={upperLimit}
            stroke={COLORS.limit}
            strokeDasharray="4 4"
            label={{ value: data.isNormal === false ? `97.5th: ${upperLimit.toFixed(2)}°` : `+1.96 SD: ${upperLimit.toFixed(2)}°`, position: 'insideTopRight', fontSize: 10, fill: COLORS.limit }}
          />
          <ReferenceLine
            y={lowerLimit}
            stroke={COLORS.limit}
            strokeDasharray="4 4"
            label={{ value: data.isNormal === false ? `2.5th: ${lowerLimit.toFixed(2)}°` : `−1.96 SD: ${lowerLimit.toFixed(2)}°`, position: 'insideBottomRight', fontSize: 10, fill: COLORS.limit }}
          />
          <Scatter data={plotData} fill={COLORS.primary} opacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
    </YLabelChart>
    </div>
  );
};

export default BlandAltmanPlot;

