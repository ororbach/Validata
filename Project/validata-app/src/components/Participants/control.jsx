// This component manages the state and control logic for the participant tracking interface.
import { useState } from 'react';
import ParticipantsDisplay from './display';
import { formatDateForDisplay, getTodayDateString, countRecruitedParticipants } from './service';

// Renders the participant control system and manages local states for new entries.
const ParticipantsControl = ({
  participants,
  onAddParticipant,
  onDropParticipant,
  onToggleParticipantCompleted,
  recruitmentGoal,
  onUpdateRecruitmentGoal,
  userRole
}) => {
  // Local state
  const [consent, setConsent] = useState(false);
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [healthStatus, setHealthStatus] = useState('Healthy');
  const [goalInput, setGoalInput] = useState('');

  const displayParticipants = participants.map((participant) => ({
    ...participant,
    enrollmentDateDisplay: formatDateForDisplay(participant.enrollmentDate || participant.enrollment_date),
  }));

  // Handles the submission of a new participant form.
  const handleSubmit = (e) => {
    e.preventDefault();
    onAddParticipant({
      consent,
      age,
      gender,
      healthStatus,
      enrollmentDate: getTodayDateString(),
    });
    setConsent(false);
    setAge('');
    setGender('Male');
    setHealthStatus('Healthy');
  };

  // Submits the updated recruitment goal.
  const handleGoalSubmit = (e) => {
    e.preventDefault();
    if (!goalInput) return;
    onUpdateRecruitmentGoal(goalInput);
    setGoalInput('');
  };

  return (
    <ParticipantsDisplay
      participants={displayParticipants}
      consent={consent}
      onConsentChange={setConsent}
      age={age}
      onAgeChange={setAge}
      gender={gender}
      onGenderChange={setGender}
      healthStatus={healthStatus}
      onHealthStatusChange={setHealthStatus}
      onSubmit={handleSubmit}
      onDrop={onDropParticipant}
      onToggleCompleted={onToggleParticipantCompleted}
      recruitedCount={countRecruitedParticipants(participants)}
      recruitmentGoal={recruitmentGoal}
      isMentor={userRole === 'mentor'}
      goalInput={goalInput}
      onGoalInputChange={setGoalInput}
      onGoalSubmit={handleGoalSubmit}
    />
  );
};

export default ParticipantsControl;
