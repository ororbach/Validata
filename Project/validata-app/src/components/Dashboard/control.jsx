"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../Sidebar/control';
import Participants from '../Participants/control';
import ParticipantsView from '../ParticipantsView/control';
import DataCollection from '../DataCollection/control';
import Analysis from '../Analysis/control';
import Results from '../Results/control';
import UserManagement from '../UserManagement/control';
import StudyManagement from '../StudyManagement/control';
import Toast from '../Toast/control';
import { supabase } from '@/lib/supabase';
import { getCookie, setCookie, deleteCookie } from '@/lib/cookies';

import * as XLSX from 'xlsx';

import {
  signOut,
  verifySession,
  fetchUserProfile,
  fetchStudies,
  createStudy,
  deleteStudy,
  updateRecruitmentGoal,
  fetchParticipants,
  createParticipant,
  updateParticipantStatus,
  fetchMeasurements,
  createMeasurement,
  invalidateParticipantMeasurements,
  updateMeasurementValidity
} from './service';

import DashboardDisplay from "./display";

// This file defines the dashboard control component, managing the main state of the system.

// This function renders the dashboard control component.
export default function DashboardControl() {
  const router = useRouter();

  const [currentView, setCurrentView] = useState('participants');

  const [participants, setParticipants] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [studies, setStudies] = useState([]);
  const [currentStudyId, setCurrentStudyId] = useState(null);
  const currentStudy = studies.find((s) => s.id === currentStudyId) || null;

  // This function retrieves the saved study ID from local storage.
  const getSavedStudyId = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('validata-current-study-id');
  };

  useEffect(() => {
    // Save study
    if (typeof window !== 'undefined' && currentStudyId) {
      window.localStorage.setItem('validata-current-study-id', currentStudyId);
    }
  }, [currentStudyId]);

  const [userRole, setUserRole] = useState('team_member');
  const [userStatus, setUserStatus] = useState('pending');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  // This function triggers a toast notification with a custom message.
  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  // This function logs the user out and clears cookies.
  const handleLogout = async () => {
    deleteCookie('sb-access-token');
    deleteCookie('user-role');
    deleteCookie('user-status');

    try {
      await signOut();
    } catch (e) {
      console.warn('Supabase logout warning:', e);
    }

    router.push('/login');
    router.refresh();
  };

  // This function fetches participant and measurement data for a specific study.
  const loadDataForStudy = async (studyId) => {
    const resP = await fetch(`/api/participants?study_id=${studyId}`);
    if (!resP.ok) throw new Error('Failed to fetch participants');
    const pData = await resP.json();
    if (pData.error) throw new Error(pData.error);

    const resM = await fetch(`/api/measurements?study_id=${studyId}`);
    if (!resM.ok) throw new Error('Failed to fetch measurements');
    const mData = await resM.json();
    if (mData.error) throw new Error(mData.error);

    const mappedParticipants = pData.map(p => ({
      id: p.id,
      consent: p.consent,
      status: p.status,
      age: p.age,
      gender: p.gender,
      healthStatus: p.health_status,
      enrollmentDate: p.enrollment_date || p.enrollmentDate || null
    }));

    const mappedMeasurements = mData.map(m => {
      let formattedDate = m.timestamp;
      try {
        const d = new Date(m.timestamp);
        const day = d.getDate().toString().padStart(2, '0');
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const year = d.getFullYear();
        const hours = d.getHours().toString().padStart(2, '0');
        const minutes = d.getMinutes().toString().padStart(2, '0');
        formattedDate = `${day}/${month}/${year} ${hours}:${minutes}`;
      } catch { }

      const participantRecord = mappedParticipants.find(p => p.id === m.participant_id);
      const enrollmentDate = participantRecord?.enrollmentDate || null;

      return {
        id: m.id,
        participant: m.participant_id,
        goniometer: `${parseFloat(m.goniometer).toFixed(1)}°`,
        aiModel: `${parseFloat(m.ai_model).toFixed(1)}°`,
        notes: m.notes,
        timestamp: formattedDate,
        testDate: m.test_date || m.testDate || null,
        enrollmentDate,
        isValid: m.is_valid !== false
      };
    });

    setParticipants(mappedParticipants);
    setMeasurements(mappedMeasurements);
  };

  // This function updates the current study and loads its data.
  const handleSwitchStudy = async (studyId) => {
    setCurrentStudyId(studyId);
    setIsLoading(true);
    try {
      await loadDataForStudy(studyId);
    } catch (error) {
      console.error('Error switching study:', error);
      triggerToast('Failed to load study: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // This function creates a new study in the database.
  const handleAddStudy = async (name, goal) => {
    const recruitmentGoal = parseInt(goal) || 50;

    try {
      const res = await fetch('/api/studies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, recruitmentGoal })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create study');

      setStudies((prev) => [...prev, data]);
      setCurrentStudyId(data.id);
      setParticipants([]);
      setMeasurements([]);
      triggerToast(`Study "${name}" created.`);
    } catch (error) {
      console.error('Error creating study:', error);
      triggerToast('Failed to create study: ' + error.message);
    }
  };

  // This function deletes an existing study and its data.
  const handleDeleteStudy = async (id) => {
    const study = studies.find((s) => s.id === id);
    if (!study) return;

    const remaining = studies.filter((s) => s.id !== id);
    const wasCurrent = currentStudyId === id;
    const nextStudyId = wasCurrent ? (remaining.length > 0 ? remaining[0].id : null) : currentStudyId;

    try {
      const res = await fetch(`/api/studies?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete study');

      setStudies(remaining);
      if (wasCurrent) {
        setCurrentStudyId(nextStudyId);
        if (nextStudyId) {
          await loadDataForStudy(nextStudyId);
        } else {
          setParticipants([]);
          setMeasurements([]);
        }
      }
      triggerToast(`Study "${study.name}" deleted.`);
    } catch (error) {
      console.error('Error deleting study:', error);
      triggerToast('Failed to delete study: ' + error.message);
    }
  };

  // This function updates the recruitment goal of the current study.
  const handleUpdateRecruitmentGoal = async (newGoal) => {
    const goal = parseInt(newGoal);
    if (isNaN(goal) || goal < 1) {
      triggerToast('Recruitment goal must be a positive number.');
      return;
    }

    try {
      const res = await fetch('/api/studies', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentStudyId, recruitmentGoal: goal })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update recruitment goal');

      setStudies((prev) => prev.map((s) => (s.id === currentStudyId ? { ...s, recruitment_goal: goal } : s)));
      triggerToast('Recruitment goal updated.');
    } catch (error) {
      console.error('Error updating recruitment goal:', error);
      triggerToast('Failed to update recruitment goal: ' + error.message);
    }
  };

  useEffect(() => {
    // This function initializes user data and fetches initial data.
    const initializeAuthAndData = async () => {
      setIsLoading(true);

      const token = getCookie('sb-access-token');

      if (!token) {
        router.push('/login');
        return;
      }

      let email = '';
      let role = 'team_member';
      let status = 'pending';

      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) throw new Error('Auth session invalid');

        email = user.email;

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.warn('Profile fetch warning/error, falling back to cookies:', profileError?.message);
          role = getCookie('user-role') || 'team_member';
          status = getCookie('user-status') || 'pending';
        } else {
          role = profile.role;
          status = profile.status;
          setCookie('user-role', role, 7);
          setCookie('user-status', status, 7);
        }
      } catch (e) {
        console.warn('Session verification failed, logging out:', e.message);
        handleLogout();
        return;
      }

      setCurrentUserEmail(email);
      setUserRole(role);
      setUserStatus(status);

      if (status !== 'active') {
        setIsLoading(false);
        return;
      }

      try {
        const resStudies = await fetch('/api/studies');
        if (!resStudies.ok) throw new Error('Failed to fetch studies');
        const studyList = await resStudies.json();
        if (studyList.error) throw new Error(studyList.error);

        setStudies(studyList);
        const savedStudyId = getSavedStudyId();
        const defaultStudyId = studyList.find((s) => s.id === savedStudyId)?.id
          ?? (studyList.length > 0 ? studyList[0].id : null);
        setCurrentStudyId(defaultStudyId);

        if (defaultStudyId) {
          await loadDataForStudy(defaultStudyId);
        }
      } catch (error) {
        console.error('API connection error:', error);
        triggerToast('Failed to load initial data.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthAndData();
  }, []);

  // This function adds a new participant to the current study.
  const handleAddParticipant = async ({ consent, age, gender, healthStatus, enrollmentDate }) => {
    if (!currentStudyId) {
      triggerToast('Select or create a study before adding participants.');
      return;
    }

    try {
      const nextNumericId = participants.length > 0
        ? Math.max(...participants.map(p => parseInt(p.id.split('-')[1]) || 1000)) + 1
        : 1001;
      const newId = `P-${nextNumericId}`;

      const res = await fetch('/api/participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: newId,
          consent,
          age: parseInt(age) || null,
          gender,
          healthStatus,
          enrollmentDate: enrollmentDate || new Date().toISOString().split('T')[0],
          studyId: currentStudyId
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to add participant');
      }

      const newParticipant = {
        id: newId,
        consent,
        status: 'Active',
        age: parseInt(age) || null,
        gender,
        healthStatus,
        study_id: currentStudyId,
        enrollmentDate: enrollmentDate || new Date().toISOString().split('T')[0]
      };

      setParticipants([newParticipant, ...participants]);
      triggerToast(`Participant ${newId} registered and saved in database!`);
    } catch (error) {
      console.error('Error adding participant:', error);
      triggerToast('Failed to save participant: ' + error.message);
    }
  };

  // This function marks a participant as dropped and invalidates their measurements.
  const handleDropParticipant = async (id) => {
    if (window.confirm(`This will permanently drop participant ${id} from the study and mark all of their measurements as invalid. This cannot be undone. Continue?`)) {
      try {
        const res = await fetch('/api/participants', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, status: 'Dropped', studyId: currentStudyId })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to drop participant');
        }

        const measRes = await fetch('/api/measurements', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ participantId: id, studyId: currentStudyId, isValid: false })
        });

        if (!measRes.ok) {
          const errData = await measRes.json();
          throw new Error(errData.error || 'Failed to invalidate participant measurements');
        }

        setParticipants(
          participants.map((p) => (p.id === id ? { ...p, status: 'Dropped' } : p))
        );
        setMeasurements((prev) =>
          prev.map((m) => (m.participant === id ? { ...m, isValid: false } : m))
        );
        triggerToast(`Participant ${id} dropped successfully. Their measurements were marked invalid.`);
      } catch (error) {
        console.error('Error updating participant status:', error);
        triggerToast('Failed to update participant: ' + error.message);
      }
    }
  };

  // This function toggles the participant's status between active and completed.
  const handleToggleParticipantCompleted = async (id) => {
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;

    const nextStatus = participant.status === 'Completed' ? 'Active' : 'Completed';

    try {
      const res = await fetch('/api/participants', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: nextStatus, studyId: currentStudyId })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update participant');
      }

      setParticipants(participants.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)));
      triggerToast(`Participant ${id} marked ${nextStatus.toLowerCase()}.`);
    } catch (error) {
      console.error('Error updating participant status:', error);
      triggerToast('Failed to update participant: ' + error.message);
    }
  };

  // This function saves a new measurement to the database.
  const handleLogMeasurement = async ({ participantId, goniometer, aiModel, notes, testDate }) => {
    if (!currentStudyId) {
      triggerToast('Select or create a study before logging a measurement.');
      return;
    }

    const nowObj = new Date();
    const formattedTimestamp = `${nowObj.getDate().toString().padStart(2, '0')}/${(
      nowObj.getMonth() + 1
    )
      .toString()
      .padStart(2, '0')}/${nowObj.getFullYear()} ${nowObj
        .getHours()
        .toString()
        .padStart(2, '0')}:${nowObj.getMinutes().toString().padStart(2, '0')}`;

    try {
      const res = await fetch('/api/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          participantId,
          goniometer,
          aiModel,
          notes,
          testDate: testDate || new Date().toISOString().split('T')[0],
          studyId: currentStudyId
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to log measurement');
      }

      const savedData = await res.json();
      const participantRecord = participants.find(p => p.id === savedData.participant_id);
      const enrollmentDate = participantRecord?.enrollmentDate || null;

      const newMeasurement = {
        id: savedData.id,
        participant: savedData.participant_id,
        goniometer: `${parseFloat(savedData.goniometer).toFixed(1)}°`,
        aiModel: `${parseFloat(savedData.ai_model).toFixed(1)}°`,
        notes: savedData.notes,
        timestamp: formattedTimestamp,
        testDate: savedData.test_date || savedData.testDate || testDate || new Date().toISOString().split('T')[0],
        enrollmentDate,
        isValid: true
      };

      setMeasurements([newMeasurement, ...measurements]);
      triggerToast('Measurement saved directly to the database!');
    } catch (error) {
      console.error('Error logging measurement:', error);
      triggerToast('Failed to save measurement: ' + error.message);
    }
  };

  // This function marks a measurement as invalid.
  const handleMarkMeasurementInvalid = async (id) => {
    try {
      const res = await fetch('/api/measurements', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isValid: false })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update measurement');
      }

      setMeasurements((prev) => prev.map((m) => (m.id === id ? { ...m, isValid: false } : m)));
      triggerToast('Measurement marked invalid.');
    } catch (error) {
      console.error('Error updating measurement validity:', error);
      triggerToast('Failed to update measurement: ' + error.message);
    }
  };

  // This function parses a CSV formatted text into an array of objects.
  const parseCSV = (text) => {
    const lines = [];
    let row = [""];
    lines.push(row);
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];
      if (c === '"') {
        if (inQuotes && next === '"') { row[row.length - 1] += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (c === ',' && !inQuotes) {
        row.push("");
      } else if ((c === '\r' || c === '\n') && !inQuotes) {
        if (c === '\r' && next === '\n') { i++; }
        row = [""];
        lines.push(row);
      } else {
        row[row.length - 1] += c;
      }
    }
    const parsed = lines.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ""));
    if (parsed.length <= 1) return [];
    const headers = parsed[0].map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    return parsed.slice(1).map(r => {
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = r[idx] ? r[idx].trim().replace(/^["']|["']$/g, '') : '';
      });
      return obj;
    });
  };

  // This function processes imported rows and saves them as new measurements.
  const processImportedRows = async (rows) => {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const newMeasurements = [];

    const activeParticipantIds = new Set(
      participants
        .filter(p => p.status.toLowerCase() === 'active')
        .map(p => p.id.toLowerCase())
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const pId = (row.participant_id || row.participant || row.participantid || row.participantId || '').toString().trim();
      const goniometerRaw = row.goniometer;
      const aiModelRaw = row.ai_model || row.aiModel || row.aimodel || row.ai_ml || row.aiml;
      const notes = (row.notes || '').toString().trim();

      if (!pId) {
        errorCount++;
        errors.push(`Row ${i + 2}: Missing Participant ID`);
        continue;
      }

      if (!activeParticipantIds.has(pId.toLowerCase())) {
        errorCount++;
        errors.push(`Row ${i + 2}: Participant "${pId}" is not Active or does not exist`);
        continue;
      }

      const parsedGoniometer = parseFloat(goniometerRaw?.toString().replace('°', ''));
      const parsedAiModel = parseFloat(aiModelRaw?.toString().replace('°', ''));

      if (isNaN(parsedGoniometer) || isNaN(parsedAiModel)) {
        errorCount++;
        errors.push(`Row ${i + 2} (${pId}): Invalid numeric values (Goniometer: ${goniometerRaw}, AI Model: ${aiModelRaw})`);
        continue;
      }

      const dateToUse = new Date();

      const formattedTimestamp = `${dateToUse.getDate().toString().padStart(2, '0')}/${(
        dateToUse.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}/${dateToUse.getFullYear()} ${dateToUse
          .getHours()
          .toString()
          .padStart(2, '0')}:${dateToUse.getMinutes().toString().padStart(2, '0')}`;

      const testDateValue = (row.test_date || row.testDate || '').toString().trim();
      const payload = {
        participantId: pId,
        goniometer: parsedGoniometer,
        aiModel: parsedAiModel,
        notes,
        testDate: testDateValue || new Date().toISOString().split('T')[0],
        studyId: currentStudyId
      };

      try {
        const res = await fetch('/api/measurements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'API Error');
        }

        const savedData = await res.json();
        newMeasurements.push({
          id: savedData.id,
          participant: savedData.participant_id,
          goniometer: `${parseFloat(savedData.goniometer).toFixed(1)}°`,
          aiModel: `${parseFloat(savedData.ai_model).toFixed(1)}°`,
          notes: savedData.notes,
          timestamp: formattedTimestamp,
          testDate: savedData.test_date || savedData.testDate || testDateValue || new Date().toISOString().split('T')[0],
          isValid: true
        });
        successCount++;
      } catch (err) {
        errorCount++;
        errors.push(`Row ${i + 2} (${pId}): Failed to save - ${err.message}`);
      }
    }

    if (newMeasurements.length > 0) {
      setMeasurements(prev => [...newMeasurements.reverse(), ...prev]);
    }

    return { successCount, errorCount, errors };
  };

  // This function handles data file upload and parses its content.
  const handleFileUpload = async (file) => {
    setIsImporting(true);
    setImportSummary(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        let rows = [];
        const fileExt = file.name.split('.').pop().toLowerCase();

        if (fileExt === 'json') {
          const text = e.target.result;
          const parsed = JSON.parse(text);
          rows = Array.isArray(parsed) ? parsed : [parsed];
        } else if (fileExt === 'csv') {
          const text = e.target.result;
          rows = parseCSV(text);
        } else if (fileExt === 'xlsx' || fileExt === 'xls') {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          rows = XLSX.utils.sheet_to_json(worksheet);
        } else {
          throw new Error('Unsupported file format. Please upload CSV, Excel (.xlsx/.xls), or JSON.');
        }

        if (rows.length === 0) {
          throw new Error('No rows found in the file.');
        }

        const result = await processImportedRows(rows);
        setImportSummary(result);

        if (result.successCount > 0) {
          triggerToast(`Successfully imported ${result.successCount} measurements!`);
        } else {
          triggerToast('Import failed. No valid rows were saved.');
        }
      } catch (err) {
        console.error('File parsing error:', err);
        setImportSummary({
          successCount: 0,
          errorCount: 1,
          errors: [err.message]
        });
        triggerToast('Failed to import file: ' + err.message);
      } finally {
        setIsImporting(false);
      }
    };

    const fileExt = file.name.split('.').pop().toLowerCase();
    if (fileExt === 'xlsx' || fileExt === 'xls') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // This function starts the PDF report generation process.
  const handleGenerateReport = () => {
    triggerToast('Preparing PDF report... Download will begin shortly.');
  };

  return (
    <DashboardDisplay
      isLoading={isLoading}
      userStatus={userStatus}
      currentUserEmail={currentUserEmail}
      handleLogout={handleLogout}
      currentView={currentView}
      setCurrentView={setCurrentView}
      userRole={userRole}
      studies={studies}
      currentStudyId={currentStudyId}
      handleSwitchStudy={handleSwitchStudy}
      toastMessage={toastMessage}
      showToast={showToast}
      setShowToast={setShowToast}
      participants={participants}
      handleAddParticipant={handleAddParticipant}
      handleDropParticipant={handleDropParticipant}
      handleToggleParticipantCompleted={handleToggleParticipantCompleted}
      currentStudy={currentStudy}
      handleUpdateRecruitmentGoal={handleUpdateRecruitmentGoal}
      handleLogMeasurement={handleLogMeasurement}
      handleFileUpload={handleFileUpload}
      isImporting={isImporting}
      importSummary={importSummary}
      setImportSummary={setImportSummary}
      measurements={measurements}
      handleGenerateReport={handleGenerateReport}
      handleMarkMeasurementInvalid={handleMarkMeasurementInvalid}
      handleAddStudy={handleAddStudy}
      handleDeleteStudy={handleDeleteStudy}
    />
  );
}
