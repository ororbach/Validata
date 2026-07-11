// This component manages the filtering and searching logic for the participants view.
import { useState } from 'react';
import ParticipantsViewDisplay from './display';
import { getParticipantStats } from './service';

// Renders the participants view control and handles state for filtering and search.
const ParticipantsViewControl = ({ participants = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredParticipants = participants.filter((p) => {
    const matchesSearch = p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || p.healthStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = getParticipantStats(participants);

  return (
    <ParticipantsViewDisplay
      participants={filteredParticipants}
      searchTerm={searchTerm}
      onSearchChange={setSearchTerm}
      statusFilter={statusFilter}
      onStatusFilterChange={setStatusFilter}
      stats={stats}
    />
  );
};

export default ParticipantsViewControl;
