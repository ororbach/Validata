// This component renders the UI for managing and tracking study participants.
import { CheckCircle2, XCircle, Search, HelpCircle } from 'lucide-react';

// Displays the participant registration form, tracking table, and recruitment progress.
const ParticipantsDisplay = ({
  participants,
  consent,
  onConsentChange,
  age,
  onAgeChange,
  gender,
  onGenderChange,
  healthStatus,
  onHealthStatusChange,
  onSubmit,
  onDrop,
  onToggleCompleted,
  recruitedCount,
  recruitmentGoal,
  isMentor,
  goalInput,
  onGoalInputChange,
  onGoalSubmit
}) => {
  const goalPercent = recruitmentGoal
    ? Math.min(100, Math.round((recruitedCount / recruitmentGoal) * 100))
    : 0;

  const nonDroppedParticipants = participants.filter((p) => String(p.status || '').toLowerCase() !== 'dropped');
  const completedCount = nonDroppedParticipants.filter((p) => String(p.status || '').toLowerCase() === 'completed').length;

  // Main Participants Management UI
  return (
    <section className="app-section">
      {/* Section Header */}
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Participant Management</h2>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Registration, tracking, and consent management of study participants.
        </p>
      </header>

      {/* Recruitment Progress Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Progress Status Text */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Recruitment Progress</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {recruitmentGoal
                ? `${recruitedCount} of ${recruitmentGoal} participants recruited (Active + Completed)`
                : 'Recruitment goal not set yet.'}
            </p>
          </div>

          {isMentor && (
            <form onSubmit={onGoalSubmit} className="flex items-center gap-2">
              {/* Recruitment Goal Form (Mentor Only) */}
              <input
                type="number"
                min="1"
                placeholder={recruitmentGoal ? String(recruitmentGoal) : 'Set goal'}
                value={goalInput}
                onChange={(e) => onGoalInputChange(e.target.value)}
                className="w-28 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Set Goal
              </button>
            </form>
          )}
        </div>

        {recruitmentGoal && (
          <div className="mt-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            {/* Progress Bar */}
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all"
              style={{ width: `${goalPercent}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Register New Participant Form Area */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 h-fit">
          <h3 className="text-xl font-semibold mb-4 text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2">
            Register New Participant
          </h3>
          {/* Registration Form */}
          <form onSubmit={onSubmit} className="space-y-4">
            {/* Privacy Notice Banner */}
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700 mb-2">
              <p className="text-sm text-slate-600 dark:text-slate-300">
                The system will automatically generate a unique, anonymous ID for the new participant to ensure privacy.
              </p>
            </div>

            {/* Age Input */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Age
              </label>
              <input
                type="number"
                required
                min="18"
                max="120"
                placeholder="e.g. 35"
                value={age}
                onChange={(e) => onAgeChange(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Gender
              </label>
              <select
                required
                value={gender}
                onChange={(e) => onGenderChange(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            {/* Health Status Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Health Status
              </label>
              <select
                required
                value={healthStatus}
                onChange={(e) => onHealthStatusChange(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                <option value="Healthy">Healthy</option>
                <option value="Ankle Injured">Ankle Injured</option>
              </select>
            </div>

            {/* Informed Consent Checkbox */}
            <div className="bg-blue-50 dark:bg-blue-950/40 p-4 rounded-lg border border-blue-100 dark:border-blue-900 mt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={consent}
                  onChange={(e) => onConsentChange(e.target.checked)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 leading-tight">
                  <strong>Informed Consent:</strong> I confirm that the participant has read and signed the informed consent form to participate in the study.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              Add Participant
            </button>
          </form>
        </div>

        {/* Active Participants Tracking Area */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          {/* Tracking Area Header */}
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2 mb-4">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Active Participants Tracking</h3>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Completed: <span className="font-semibold text-slate-700 dark:text-slate-300">{completedCount}/{nonDroppedParticipants.length}</span>
              </span>
              <span className="text-sm bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 py-1 px-3 rounded-full">
                Total: {participants.length}
              </span>
            </div>
          </div>
          
          {/* Mobile View Participant List */}
          <div className="md:hidden space-y-3">
            {participants.length === 0 && (
              <p className="text-center py-6 text-slate-500 dark:text-slate-400">No participants found.</p>
            )}
            {participants.map((p) => {
              const normalizedStatus = String(p.status || '').toLowerCase();
              return (
                <div key={p.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-slate-800 dark:text-slate-100">{p.id}</span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${p.status === 'Active'
                        ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                        : normalizedStatus === 'completed'
                          ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    {p.consent ? (
                      <span className="text-green-600 dark:text-green-400 font-bold">✓ Signed</span>
                    ) : (
                      <span className="text-red-500 dark:text-red-400">Missing</span>
                    )}
                    <span className="text-slate-500 dark:text-slate-400">Enrolled: {p.enrollmentDateDisplay || '—'}</span>
                  </div>
                  {normalizedStatus !== 'dropped' && (
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onToggleCompleted(p.id)}
                        className={`w-36 text-center text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                          normalizedStatus === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
                            : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                        }`}
                      >
                        {normalizedStatus === 'completed' ? 'Mark Not Completed' : 'Mark Complete'}
                      </button>
                      <button
                        onClick={() => onDrop(p.id)}
                        className="w-16 text-center text-xs font-semibold px-2.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/70 transition-colors cursor-pointer"
                      >
                        Drop
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Desktop View Participant Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              {/* Table Header */}
              <thead>
                <tr className="text-slate-500 dark:text-slate-400 text-sm border-b border-slate-200 dark:border-slate-800">
                  <th className="py-3 px-2 font-medium">System ID</th>
                  <th className="py-3 px-2 font-medium">Consent</th>
                  <th className="py-3 px-2 font-medium">Status</th>
                  <th className="py-3 px-2 font-medium">Enrollment Date</th>
                  <th className="py-3 px-2 font-medium">
                    <div className="flex items-center gap-1.5">
                      Completion
                      <div className="relative group flex items-center">
                        <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] pointer-events-none text-center whitespace-normal font-normal">
                          Indicates the participant has finished the study.
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-800"></div>
                        </div>
                      </div>
                    </div>
                  </th>
                  <th className="py-3 px-2 font-medium">
                    <div className="flex items-center gap-1.5 justify-end">
                      Drop
                      <div className="relative group flex items-center">
                        <HelpCircle className="w-4 h-4 text-slate-400 hover:text-slate-600 cursor-help" />
                        <div className="absolute top-full right-0 mt-2 w-56 p-2 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[60] pointer-events-none text-left whitespace-normal font-normal">
                          Permanently removes the participant and invalidates all their measurements.
                          <div className="absolute bottom-full right-2 border-4 border-transparent border-b-slate-800"></div>
                        </div>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              {/* Table Body */}
              <tbody>
                {participants.map((p) => {
                  const normalizedStatus = String(p.status || '').toLowerCase();
                  const statusLabel = normalizedStatus === 'completed' ? 'Completed' : p.status;

                  return (
                    <tr key={p.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                      <td className="py-3 px-2 font-medium text-slate-800 dark:text-slate-100">{p.id}</td>
                      <td className="py-3 px-2">
                        {p.consent ? (
                          <span className="text-green-600 dark:text-green-400 font-bold">✓ Signed</span>
                        ) : (
                          <span className="text-red-500 dark:text-red-400">Missing</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`w-24 inline-block text-center text-xs px-2 py-1 rounded-full ${p.status === 'Active'
                            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                            : normalizedStatus === 'completed'
                              ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                            }`}
                        >
                          {statusLabel}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-slate-600 dark:text-slate-300">
                        {p.enrollmentDateDisplay || '—'}
                      </td>
                      <td className="py-3 px-2">
                        {normalizedStatus !== 'dropped' && (
                            <button
                              onClick={() => onToggleCompleted(p.id)}
                              className={`w-36 text-center text-xs font-semibold px-2.5 py-1.5 rounded-full transition-colors cursor-pointer ${
                                normalizedStatus === 'completed'
                                  ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/70'
                                  : 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/70'
                              }`}
                            >
                              {normalizedStatus === 'completed' ? 'Completed' : 'Not Completed'}
                            </button>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right">
                        {normalizedStatus !== 'dropped' && (
                              <button
                                onClick={() => onDrop(p.id)}
                                className="w-16 text-center text-xs font-semibold px-2.5 py-1.5 rounded-full bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-900/70 transition-colors cursor-pointer"
                              >
                                Drop
                              </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {participants.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-6 text-slate-500 dark:text-slate-400">
                      No participants found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ParticipantsDisplay;
