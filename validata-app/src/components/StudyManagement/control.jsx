import { useState } from 'react';
import StudyManagementDisplay from './display';
import { validateStudyCreation, validateStudyDeletion } from './service';

const StudyManagementControl = ({ studies, currentStudyId, onAddStudy, onDeleteStudy }) => {
  const [newStudyName, setNewStudyName] = useState('');
  const [newStudyGoal, setNewStudyGoal] = useState('');

  const handleCreateStudy = (e) => {
    e.preventDefault();
    const result = validateStudyCreation(newStudyName, newStudyGoal);
    if (result.error) return;
    
    onAddStudy(result.name, result.goal);
    setNewStudyName('');
    setNewStudyGoal('');
  };

  const handleDeleteStudy = (id) => {
    const result = validateStudyDeletion(id, studies);
    
    if (result.error) {
      if (result.error === 'Cannot delete the only study. Create another study first, then delete this one.') {
        window.alert(result.error);
      }
      return;
    }

    if (window.confirm(`Delete study "${result.study.name}"? This permanently deletes all of its participants and measurements. This cannot be undone.`)) {
      onDeleteStudy(id);
    }
  };

  return (
    <StudyManagementDisplay
      studies={studies}
      currentStudyId={currentStudyId}
      newStudyName={newStudyName}
      onNewStudyNameChange={setNewStudyName}
      newStudyGoal={newStudyGoal}
      onNewStudyGoalChange={setNewStudyGoal}
      onCreateStudy={handleCreateStudy}
      onDeleteStudy={handleDeleteStudy}
    />
  );
};

export default StudyManagementControl;
