// This component manages the state and logic for the data collection process.
import { useState, useRef } from 'react';
import DataCollectionDisplay from './display';
import { getActiveParticipants, getTodayDateString } from './service';

// Renders the data collection control interface and manages its interactions.
const DataCollectionControl = ({ 
  participants, 
  onLogMeasurement, 
  onFileUpload,
  isImporting,
  importSummary,
  onClearImportSummary
}) => {
  // Manage state
  const [participantId, setParticipantId] = useState('');
  const [goniometer, setGoniometer] = useState('');
  const [aiModel, setAiModel] = useState('');
  const [notes, setNotes] = useState('');
  const [testDate, setTestDate] = useState(getTodayDateString());
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const activeParticipants = getActiveParticipants(participants);

  // Updates the state with the uploaded file.
  const handleFile = (file) => {
    setUploadedFile(file.name);
    onFileUpload(file);
  };

  // Submits the measurement log form data.
  const handleLogSubmit = (e) => {
    e.preventDefault();
    if (!participantId) return;

    onLogMeasurement({ participantId, goniometer, aiModel, notes, testDate });
    setParticipantId('');
    setGoniometer('');
    setAiModel('');
    setNotes('');
    setTestDate(getTodayDateString());
  };

  // Handles the file input change event.
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
      e.target.value = null;
    }
  };

  // Prevents the default behavior when a file is dragged over.
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  // Handles the event when the dragged file leaves the designated area.
  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  // Processes the file dropped into the designated area.
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Clears the summary of the imported data.
  const handleClearSummary = () => {
    setUploadedFile(null);
    onClearImportSummary();
  };

  return (
    <DataCollectionDisplay
      activeParticipants={activeParticipants}
      participantId={participantId}
      onParticipantChange={setParticipantId}
      goniometer={goniometer}
      onGoniometerChange={setGoniometer}
      aiModel={aiModel}
      onAiModelChange={setAiModel}
      notes={notes}
      onNotesChange={setNotes}
      testDate={testDate}
      onTestDateChange={setTestDate}
      onSubmitLog={handleLogSubmit}
      uploadedFile={uploadedFile}
      onFileChange={handleFileChange}
      fileInputRef={fileInputRef}
      isDragging={isDragging}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      isImporting={isImporting}
      importSummary={importSummary}
      onClearImportSummary={handleClearSummary}
    />
  );
};

export default DataCollectionControl;
