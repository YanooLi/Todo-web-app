/**
 * @module StudyTracker
 * @description A JavaScript library for tracking study sessions by subject.
 */

/**
 * @typedef {Object} StudySession
 * @property {string} subject - The subject being studied.
 * @property {Date} startTime - When the session started.
 * @property {Date|null} endTime - When the session ended, or null if still active.
 */

/**
 * @typedef {Object} SubjectStats
 * @property {string} subject - The subject name.
 * @property {number} totalMs - Total time studied in milliseconds.
 * @property {number} totalMinutes - Total time studied in minutes (rounded to 2 decimals).
 * @property {number} totalHours - Total time studied in hours (rounded to 2 decimals).
 * @property {number} totalDays - Total time studied in days (rounded to 4 decimals).
 * @property {number} sessionCount - Number of completed sessions for this subject.
 */

/**
 * @typedef {Object} Stats
 * @property {SubjectStats[]} subjects - Per-subject statistics.
 * @property {number} totalMs - Grand total time studied in milliseconds.
 * @property {number} totalMinutes - Grand total time studied in minutes.
 * @property {number} totalHours - Grand total time studied in hours.
 * @property {number} totalDays - Grand total time studied in days.
 * @property {number} totalSessions - Total number of completed sessions.
 */

/**
 * Creates a new StudyTracker instance for recording and querying study sessions.
 *
 * @example
 * const tracker = createStudyTracker();
 *
 * tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
 * tracker.endStudying({ date: '2026-03-12', time: '10:30' });
 *
 * tracker.startStudying({ subject: 'History', date: '2026-03-12', time: '11:00' });
 * tracker.endStudying({ date: '2026-03-12', time: '12:15' });
 *
 * const stats = tracker.getStats();
 * console.log(JSON.stringify(stats, null, 2));
 *
 * tracker.reset();
 *
 * @returns {{
 *   startStudying: (options: {subject: string, date: string, time: string}) => void,
 *   endStudying: (options: {date: string, time: string}) => void,
 *   getStats: () => Stats,
 *   reset: () => void
 * }}
 */
function createStudyTracker() {
  /** @type {StudySession[]} */
  let sessions = [];

  /** @type {StudySession|null} */
  let activeSession = null;

  /**
   * Parses a date string and a time string into a Date object.
   *
   * @param {string} date - A date string in YYYY-MM-DD format.
   * @param {string} time - A time string in HH:MM (24-hour) format.
   * @returns {Date} The resulting Date object.
   * @throws {Error} If the resulting date is invalid.
   */
  function parseDateTime(date, time) {
    const dt = new Date(`${date}T${time}:00`);
    if (isNaN(dt.getTime())) {
      throw new Error(
        `Invalid date/time: date="${date}", time="${time}". Use YYYY-MM-DD and HH:MM formats.`
      );
    }

    // Guard against silent date rollover (e.g. Feb 30 → Mar 2)
    const [year, month, day] = date.split('-').map(Number);
    if (
      dt.getFullYear() !== year ||
      dt.getMonth() + 1 !== month ||
      dt.getDate() !== day
    ) {
      throw new Error(
        `Invalid calendar date: "${date}" does not exist.`
      );
    }

    return dt;
  }

  /**
   * Converts a duration in milliseconds to a friendly breakdown of days, hours, and minutes.
   *
   * @param {number} ms - Duration in milliseconds.
   * @returns {{ totalMs: number, totalMinutes: number, totalHours: number, totalDays: number }}
   */
  function msToUnits(ms) {
    return {
      totalMs: ms,
      totalMinutes: Math.round((ms / 1000 / 60) * 100) / 100,
      totalHours: Math.round((ms / 1000 / 60 / 60) * 100) / 100,
      totalDays: Math.round((ms / 1000 / 60 / 60 / 24) * 10000) / 10000,
    };
  }

  /**
   * Begins a new study session.
   *
   * @param {Object} options
   * @param {string} options.subject - The subject to study (e.g. "Math").
   * @param {string} options.date - The start date in YYYY-MM-DD format.
   * @param {string} options.time - The start time in HH:MM (24-hour) format.
   * @throws {Error} If a session is already in progress.
   * @throws {Error} If subject is missing or empty.
   */
  function startStudying({ subject, date, time }) {
    if (activeSession) {
      throw new Error(
        `A study session for "${activeSession.subject}" is already in progress. Call endStudying() first.`
      );
    }
    if (!subject || typeof subject !== 'string' || subject.trim() === '') {
      throw new Error('A non-empty subject is required to start studying.');
    }

    const startTime = parseDateTime(date, time);

    activeSession = {
      subject: subject.trim(),
      startTime,
      endTime: null,
    };
  }

  /**
   * Ends the current study session.
   *
   * @param {Object} options
   * @param {string} options.date - The end date in YYYY-MM-DD format.
   * @param {string} options.time - The end time in HH:MM (24-hour) format.
   * @throws {Error} If no session is currently in progress.
   * @throws {Error} If the end time is before the start time.
   */
  function endStudying({ date, time }) {
    if (!activeSession) {
      throw new Error(
        'No active study session. Call startStudying() first.'
      );
    }

    const endTime = parseDateTime(date, time);

    if (endTime <= activeSession.startTime) {
      throw new Error(
        'End time must be after the start time of the current session.'
      );
    }

    activeSession.endTime = endTime;
    sessions.push(activeSession);
    activeSession = null;
  }

  /**
   * Returns statistics for all completed study sessions, broken down by subject.
   *
   * @returns {Stats} An object containing per-subject and overall statistics.
   */
  function getStats() {
    /** @type {Record<string, { totalMs: number, sessionCount: number }>} */
    const subjectMap = {};

    for (const session of sessions) {
      const duration =
        /** @type {Date} */ (session.endTime).getTime() -
        session.startTime.getTime();

      if (!subjectMap[session.subject]) {
        subjectMap[session.subject] = { totalMs: 0, sessionCount: 0 };
      }
      subjectMap[session.subject].totalMs += duration;
      subjectMap[session.subject].sessionCount += 1;
    }

    let grandTotalMs = 0;
    let grandTotalSessions = 0;

    /** @type {SubjectStats[]} */
    const subjects = Object.entries(subjectMap).map(
      ([subject, { totalMs, sessionCount }]) => {
        grandTotalMs += totalMs;
        grandTotalSessions += sessionCount;

        return {
          subject,
          ...msToUnits(totalMs),
          sessionCount,
        };
      }
    );

    return {
      subjects,
      ...msToUnits(grandTotalMs),
      totalSessions: grandTotalSessions,
    };
  }

  /**
   * Resets the tracker, clearing all recorded sessions and any active session.
   */
  function reset() {
    sessions = [];
    activeSession = null;
  }

  return {
    startStudying,
    endStudying,
    getStats,
    reset,
  };
}

// Support both Node.js (CommonJS) and browser (global) environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createStudyTracker };
} else if (typeof window !== 'undefined') {
  window.createStudyTracker = createStudyTracker;
}
