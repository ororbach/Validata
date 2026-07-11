import { useState, useEffect, useMemo } from 'react';
import AnalysisDisplay from './display';
import AIChatControl from '../AIChat/control';
import { fetchAnalysisData } from './service';

// This file defines the Analysis control component, managing data fetching and metric calculations.

// This function renders the control component that manages state and fetches processed analysis data.
const AnalysisControl = ({ participants, measurements, onGenerateReport, threshold = 5 }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  
  const [analysisData, setAnalysisData] = useState(null); 
  const [lastUpdated, setLastUpdated] = useState(null);
  const [localThreshold, setLocalThreshold] = useState(threshold);

  // This function calls the server to fetch updated analysis data whenever the threshold changes.
  useEffect(() => {
    // Reset data
    setAnalysisData(null); 

    fetchAnalysisData(localThreshold, participants, measurements)
      .then((data) => {
        if (!data.error) {
          setAnalysisData(data);
        } else {
          setAnalysisData({
             progressData: { labels: [], datasets: [] },
             statusData: { labels: [], datasets: [] },
             statsData: [],
             summaryStats: { rmse: 0, mae: 0, meanBias: 0, passRate: 0 },
             descriptiveStats: { n: 0, mean: 0, sd: 0, se: 0 },
             charts: null
          });
        }
        setLastUpdated(new Date());
      })
      .catch((err) => {
        console.error('Error fetching analysis data:', err);
        setAnalysisData({
           progressData: { labels: [], datasets: [] },
           statusData: { labels: [], datasets: [] },
           statsData: [],
           summaryStats: { rmse: 0, mae: 0, meanBias: 0, passRate: 0 },
           descriptiveStats: { n: 0, mean: 0, sd: 0, se: 0 },
           charts: null
        });
        setLastUpdated(new Date());
      });
  }, [localThreshold]); 

  const progressOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: true, ticks: { stepSize: 1 } },
    },
  }), []);

  const statusOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
  }), []);

  // This function starts the simulated AI analysis process.
  const handleRunAnalysis = () => {
    // Run analysis
    setIsAnalyzing(true);
    setAiResult(null);

    setTimeout(() => {
      setAiResult(analysisData?.aiResult || 'Analysis complete. No anomalies detected.');
      setIsAnalyzing(false);
    }, 2500);
  };

  const isLoadingCharts = analysisData === null;

  return (
    <>
      <AnalysisDisplay
        progressData={analysisData?.progressData || { labels: [], datasets: [] }}
        progressOptions={progressOptions}
        statusData={analysisData?.statusData || { labels: [], datasets: [] }}
        statusOptions={statusOptions}
        isAnalyzing={isAnalyzing}
        aiResult={aiResult}
        onRunAnalysis={handleRunAnalysis}
        onGenerateReport={onGenerateReport}
        statsData={analysisData?.statsData || []}
        summaryStats={analysisData?.summaryStats || { rmse: 0, mae: 0, meanBias: 0, passRate: 0 }}
        descriptiveStats={analysisData?.descriptiveStats || { n: 0, mean: 0, sd: 0, se: 0 }}
        charts={analysisData?.charts} 
        threshold={localThreshold}
        onThresholdChange={setLocalThreshold}
        isLoadingCharts={isLoadingCharts}
        lastUpdated={lastUpdated}
      />
      <AIChatControl participants={participants} measurements={measurements} />
    </>
  );
};

export default AnalysisControl;
