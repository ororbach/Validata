// This component controls the data and state for the results view.
import ResultsDisplay from './display';
import { sortMeasurementsDescending } from './service';

// Renders the results view and manages its underlying measurement data.
const ResultsControl = ({ participants, measurements, onMarkInvalid }) => {
  const sortedMeasurements = sortMeasurementsDescending(measurements);
  return (
    <ResultsDisplay
      sortedMeasurements={sortedMeasurements}
      participants={participants}
      onMarkInvalid={onMarkInvalid}
    />
  );
};

export default ResultsControl;
