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
import mockData from '../../../mockData.json';
import { supabase } from '../../../lib/supabase';
import { getCookie, setCookie, deleteCookie } from '../../../lib/cookies';

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

export default function DashboardControl() {
  const router = useRouter();

  // Dashboard views
  const [currentView, setCurrentView] = useState('participants');

  // App data
  const [participants, setParticipants] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [nextId, setNextId] = useState(1009);

  // Studies (multi-study support: each study has its own participants/measurements/goal)
  const [studies, setStudies] = useState([]);
  const [currentStudyId, setCurrentStudyId] = useState(null);
  const currentStudy = studies.find((s) => s.id === currentStudyId) || null;

  // Remembers the last-viewed study across reloads, same as the sidebar's
  // expanded/collapsed state. Falls back to the first study if the saved id
  // no longer matches one of the fetched studies (e.g. it was deleted).
  const getSavedStudyId = () => {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem('validata-current-study-id');
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && currentStudyId) {
      window.localStorage.setItem('validata-current-study-id', currentStudyId);
    }
  }, [currentStudyId]);

  // User auth profile details
  const [userRole, setUserRole] = useState('team_member');
  const [userStatus, setUserStatus] = useState('pending');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // File import states
  const [isImporting, setIsImporting] = useState(false);
  const [importSummary, setImportSummary] = useState(null);

  const triggerToast = (message) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const handleLogout = async () => {
    // Clear cookies
    deleteCookie('sb-access-token');
    deleteCookie('demo-session');
    deleteCookie('user-role');
    deleteCookie('user-status');

    try {
      if (!isDemoMode) {
        await signOut();
      }
    } catch (e) {
      console.warn('Supabase logout warning:', e);
    }

    router.push('/login');
    router.refresh();
  };

  // Fetches participants + measurements for one study, mapping DB/mock shapes
  // to the frontend's expected camelCase records. Shared by the initial load
  // and by handleSwitchStudy/handleAddStudy.
  const loadDataForStudy = async (studyId, demoFlag) => {
    if (demoFlag) {
      const filteredParticipants = mockData.participants.filter((p) => p.study_id === studyId);
      const filteredMeasurements = mockData.measurements.filter((m) => m.study_id === studyId);

      const mappedMeasurements = filteredMeasurements.map((m, idx) => {
        const participantRecord = filteredParticipants.find(p => p.id === m.participant);
        const enrollmentDate = participantRecord?.enrollmentDate || null;

        return {
          id: filteredMeasurements.length - idx,
          participant: m.participant,
          goniometer: m.goniometer,
          aiModel: m.aiModel,
          notes: m.notes,
          timestamp: m.timestamp,
          testDate: m.testDate || m.test_date || null,
          enrollmentDate,
          isValid: m.isValid !== false
        };
      });

      setParticipants(filteredParticipants);
      setMeasurements(mappedMeasurements);
      return;
    }

    const resP = await fetch(`/api/participants?study_id=${studyId}`);
    if (!resP.ok) throw new Error('Failed to fetch participants');
    const pData = await resP.json();
    if (pData.error) throw new Error(pData.error);

    const resM = await fetch(`/api/measurements?study_id=${studyId}`);
    if (!resM.ok) throw new Error('Failed to fetch measurements');
    const mData = await resM.json();
    if (mData.error) throw new Error(mData.error);

    // Map database records to frontend expected camelCase formats
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

      // Look up enrollment date from participants
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

  const handleSwitchStudy = async (studyId) => {
    setCurrentStudyId(studyId);
    setIsLoading(true);
    try {
      await loadDataForStudy(studyId, isDemoMode);
    } catch (error) {
      console.error('Error switching study:', error);
      triggerToast('Failed to load study: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStudy = async (name, goal) => {
    const recruitmentGoal = parseInt(goal) || 50;

    if (isDemoMode) {
      const newStudy = { id: `demo-${Date.now()}`, name, recruitment_goal: recruitmentGoal };
      setStudies((prev) => [...prev, newStudy]);
      setCurrentStudyId(newStudy.id);
      setParticipants([]);
      setMeasurements([]);
      triggerToast(`Study "${name}" created. (Demo)`);
      return;
    }

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

  // Deleting a study permanently deletes all of its participants and
  // measurements too - confirmation lives in StudyManagement/control.jsx,
  // this handler just performs the (already-confirmed) deletion.
  const handleDeleteStudy = async (id) => {
    const study = studies.find((s) => s.id === id);
    if (!study) return;

    const remaining = studies.filter((s) => s.id !== id);
    const wasCurrent = currentStudyId === id;
    const nextStudyId = wasCurrent ? (remaining.length > 0 ? remaining[0].id : null) : currentStudyId;

    if (isDemoMode) {
      setStudies(remaining);
      if (wasCurrent) {
        setCurrentStudyId(nextStudyId);
        if (nextStudyId) {
          await loadDataForStudy(nextStudyId, true);
        } else {
          setParticipants([]);
          setMeasurements([]);
        }
      }
      triggerToast(`Study "${study.name}" deleted. (Demo)`);
      return;
    }

    try {
      const res = await fetch(`/api/studies?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete study');

      setStudies(remaining);
      if (wasCurrent) {
        setCurrentStudyId(nextStudyId);
        if (nextStudyId) {
          await loadDataForStudy(nextStudyId, false);
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

  const handleUpdateRecruitmentGoal = async (newGoal) => {
    const goal = parseInt(newGoal);
    if (isNaN(goal) || goal < 1) {
      triggerToast('Recruitment goal must be a positive number.');
      return;
    }

    if (isDemoMode) {
      setStudies((prev) => prev.map((s) => (s.id === currentStudyId ? { ...s, recruitment_goal: goal } : s)));
      triggerToast('Recruitment goal updated. (Demo)');
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

  // Check Auth & Fetch Data on Mount
  useEffect(() => {
    const initializeAuthAndData = async () => {
      setIsLoading(true);

      const token = getCookie('sb-access-token');
      const demoSessionStr = getCookie('demo-session');

      // 1. Check if authenticated
      if (!token && !demoSessionStr) {
        router.push('/login');
        return;
      }

      let email = '';
      let role = 'team_member';
      let status = 'pending';
      let isDemo = false;

      // 2. Parse Demo Session
      if (demoSessionStr) {
        try {
          const ds = JSON.parse(demoSessionStr);
          email = ds.email;
          role = ds.role;
          status = ds.status;
          isDemo = true;
        } catch (e) {
          router.push('/login');
          return;
        }
      } else {
        // 3. Verify Supabase Session
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser(token);
          if (userError || !user) throw new Error('Auth session invalid');

          email = user.email;

          // Fetch profile details
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
            // Update cookies to keep in sync with database updates
            setCookie('user-role', role, 7);
            setCookie('user-status', status, 7);
          }
        } catch (e) {
          console.warn('Session verification failed, logging out:', e.message);
          handleLogout();
          return;
        }
      }

      setCurrentUserEmail(email);
      setUserRole(role);
      setUserStatus(status);
      setIsDemoMode(isDemo);

      // If account status is not active, stop here and do not load dashboard data
      if (status !== 'active') {
        setIsLoading(false);
        return;
      }

      // 4. Fetch Studies, then this study's participants/measurements (Only if Active)
      try {
        let studyList;
        if (isDemo) {
          studyList = mockData.studies;
        } else {
          const resStudies = await fetch('/api/studies');
          if (!resStudies.ok) throw new Error('Failed to fetch studies');
          studyList = await resStudies.json();
          if (studyList.error) throw new Error(studyList.error);
        }

        setStudies(studyList);
        const savedStudyId = getSavedStudyId();
        const defaultStudyId = studyList.find((s) => s.id === savedStudyId)?.id
          ?? (studyList.length > 0 ? studyList[0].id : null);
        setCurrentStudyId(defaultStudyId);

        if (defaultStudyId) {
          await loadDataForStudy(defaultStudyId, isDemo);
        }
      } catch (error) {
        console.warn('API connection error, falling back to Demo Mode:', error);
        setIsDemoMode(true);
        const savedStudyId = getSavedStudyId();
        const demoStudyId = mockData.studies.find((s) => s.id === savedStudyId)?.id
          ?? (mockData.studies.length > 0 ? mockData.studies[0].id : null);
        setStudies(mockData.studies);
        setCurrentStudyId(demoStudyId);
        if (demoStudyId) await loadDataForStudy(demoStudyId, true);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuthAndData();
  }, []);

  // Participant Handlers
  const handleAddParticipant = async ({ consent, age, gender, healthStatus, enrollmentDate }) => {
    if (!currentStudyId) {
      triggerToast('Select or create a study before adding participants.');
      return;
    }

    if (isDemoMode) {
      const newId = `P-${nextId}`;
      setNextId((prev) => prev + 1);

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
      triggerToast(`Participant ${newId} registered successfully! (Demo)`);
    } else {
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
    }
  };

  const handleDropParticipant = async (id) => {
    if (window.confirm(`This will permanently drop participant ${id} from the study and mark all of their measurements as invalid. This cannot be undone. Continue?`)) {
      if (isDemoMode) {
        setParticipants(
          participants.map((p) => (p.id === id ? { ...p, status: 'Dropped' } : p))
        );
        setMeasurements((prev) =>
          prev.map((m) => (m.participant === id ? { ...m, isValid: false } : m))
        );
        triggerToast('Participant status updated. (Demo)');
      } else {
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
    }
  };

  // Completed is a manual, reversible toggle (Active <-> Completed) available
  // to any active user - there's no global rule for "how many measurements
  // counts as done", so the system never guesses; a person always decides.
  const handleToggleParticipantCompleted = async (id) => {
    const participant = participants.find((p) => p.id === id);
    if (!participant) return;

    const nextStatus = participant.status === 'Completed' ? 'Active' : 'Completed';

    if (isDemoMode) {
      setParticipants(participants.map((p) => (p.id === id ? { ...p, status: nextStatus } : p)));
      triggerToast(`Participant marked ${nextStatus.toLowerCase()}. (Demo)`);
      return;
    }

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

  // Measurement Handlers
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

    if (isDemoMode) {
      const simulatedId = measurements.length > 0
        ? Math.max(...measurements.map(m => parseInt(m.id) || 0)) + 1
        : 1;

      // Look up participant's enrollment date
      const participantRecord = participants.find(p => p.id === participantId);
      const enrollmentDate = participantRecord?.enrollmentDate || null;

      const newMeasurement = {
        id: simulatedId,
        participant: participantId,
        goniometer: goniometer.includes('°') ? goniometer : `${goniometer}°`,
        aiModel: aiModel.includes('°') ? aiModel : `${aiModel}°`,
        notes,
        timestamp: formattedTimestamp,
        testDate: testDate || new Date().toISOString().split('T')[0],
        enrollmentDate,
        isValid: true
      };

      setMeasurements([newMeasurement, ...measurements]);
      triggerToast('Measurement logged and saved! (Demo)');
    } else {
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
        // Look up participant's enrollment date
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
    }
  };

  // Valid -> Invalid is one-way and irreversible (like Drop): once invalid,
  // there is no UI path back to valid, so this is only ever called with the
  // measurement going from valid to invalid.
  const handleMarkMeasurementInvalid = async (id) => {
    if (isDemoMode) {
      setMeasurements((prev) => prev.map((m) => (m.id === id ? { ...m, isValid: false } : m)));
      triggerToast('Measurement marked invalid. (Demo)');
      return;
    }

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

  const parseCSV = (text) => {
    const lines = [];
    let row = [""];
    lines.push(row);
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i+1];
      if (c === '"') {
        if (inQuotes && next === '"') { row[row.length - 1] += '"'; i++; } // Escaped quote
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

  const processImportedRows = async (rows) => {
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    const newMeasurements = [];

    // Map active participants for easy case-insensitive lookup
    const activeParticipantIds = new Set(
      participants
        .filter(p => p.status.toLowerCase() === 'active')
        .map(p => p.id.toLowerCase())
    );

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Try different common keys for flexibility
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
        if (isDemoMode) {
          const simulatedId = (measurements.length + newMeasurements.length) > 0
            ? Math.max(...measurements.map(m => parseInt(m.id) || 0)) + newMeasurements.length + 1
            : newMeasurements.length + 1;

          // Look up enrollment date from participants
          const participantRecord = participants.find(p => p.id === pId);
          const enrollmentDate = participantRecord?.enrollmentDate || null;

          newMeasurements.push({
            id: simulatedId,
            participant: pId,
            goniometer: `${parsedGoniometer.toFixed(1)}°`,
            aiModel: `${parsedAiModel.toFixed(1)}°`,
            notes,
            timestamp: formattedTimestamp,
            testDate: testDateValue || new Date().toISOString().split('T')[0],
            enrollmentDate,
            isValid: true
          });
          successCount++;
        } else {
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
        }
      } catch (err) {
        errorCount++;
        errors.push(`Row ${i + 2} (${pId}): Failed to save - ${err.message}`);
      }
    }

    if (newMeasurements.length > 0) {
      // Reverse array to ensure newest IDs are prepended first, maintaining descending order
      setMeasurements(prev => [...newMeasurements.reverse(), ...prev]);
    }

    return { successCount, errorCount, errors };
  };

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
      isDemoMode={isDemoMode}
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
