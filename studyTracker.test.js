const { createStudyTracker } = require('./studyTracker');

// ─── Factory ────────────────────────────────────────────────────────────────

describe('createStudyTracker', () => {
  test('returns an object with the expected API methods', () => {
    const tracker = createStudyTracker();
    expect(typeof tracker.startStudying).toBe('function');
    expect(typeof tracker.endStudying).toBe('function');
    expect(typeof tracker.getStats).toBe('function');
    expect(typeof tracker.reset).toBe('function');
  });

  test('each call returns an independent instance', () => {
    const a = createStudyTracker();
    const b = createStudyTracker();

    a.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    a.endStudying({ date: '2026-03-12', time: '10:00' });

    expect(a.getStats().totalSessions).toBe(1);
    expect(b.getStats().totalSessions).toBe(0);
  });
});

// ─── startStudying ──────────────────────────────────────────────────────────

describe('startStudying', () => {
  let tracker;
  beforeEach(() => {
    tracker = createStudyTracker();
  });

  // ── valid inputs ──

  test('starts a session with valid subject, date, and time', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' })
    ).not.toThrow();
  });

  test('accepts midnight as a valid time', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '00:00' })
    ).not.toThrow();
  });

  test('accepts 23:59 as a valid time', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '23:59' })
    ).not.toThrow();
  });

  test('accepts a leap-day date', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Science', date: '2028-02-29', time: '10:00' })
    ).not.toThrow();
  });

  test('accepts end-of-year date', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-12-31', time: '23:59' })
    ).not.toThrow();
  });

  test('accepts start-of-year date', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-01-01', time: '00:00' })
    ).not.toThrow();
  });

  // ── subject edge cases ──

  test('throws when subject is an empty string', () => {
    expect(() =>
      tracker.startStudying({ subject: '', date: '2026-03-12', time: '09:00' })
    ).toThrow();
  });

  test('throws when subject is only whitespace', () => {
    expect(() =>
      tracker.startStudying({ subject: '   ', date: '2026-03-12', time: '09:00' })
    ).toThrow();
  });

  test('throws when subject is undefined', () => {
    expect(() =>
      tracker.startStudying({ date: '2026-03-12', time: '09:00' })
    ).toThrow();
  });

  test('throws when subject is null', () => {
    expect(() =>
      tracker.startStudying({ subject: null, date: '2026-03-12', time: '09:00' })
    ).toThrow();
  });

  test('throws when subject is a number', () => {
    expect(() =>
      tracker.startStudying({ subject: 123, date: '2026-03-12', time: '09:00' })
    ).toThrow();
  });

  test('throws when subject is a boolean', () => {
    expect(() =>
      tracker.startStudying({ subject: true, date: '2026-03-12', time: '09:00' })
    ).toThrow();
  });

  test('accepts subject with special characters', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Cálcülüs & Lógíc!!! @#$%^&*()', date: '2026-03-12', time: '09:00' })
    ).not.toThrow();
  });

  test('accepts subject with unicode / emoji', () => {
    expect(() =>
      tracker.startStudying({ subject: '数学 📚', date: '2026-03-12', time: '09:00' })
    ).not.toThrow();
  });

  test('accepts a very long subject string', () => {
    const longSubject = 'A'.repeat(10000);
    expect(() =>
      tracker.startStudying({ subject: longSubject, date: '2026-03-12', time: '09:00' })
    ).not.toThrow();
  });

  test('trims whitespace from subject', () => {
    tracker.startStudying({ subject: '  Math  ', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });
    expect(tracker.getStats().subjects[0].subject).toBe('Math');
  });

  // ── date edge cases ──

  test('throws on a non-date string for date', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: 'not-a-date', time: '09:00' })
    ).toThrow();
  });

  test('throws on an empty string for date', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '', time: '09:00' })
    ).toThrow();
  });

  test('throws when date is a number', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: 12345, time: '09:00' })
    ).toThrow();
  });

  test('throws when date is undefined', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', time: '09:00' })
    ).toThrow();
  });

  test('throws on an invalid calendar date (Feb 30)', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-02-30', time: '09:00' })
    ).toThrow();
  });

  test('throws on a non-leap-year Feb 29', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-02-29', time: '09:00' })
    ).toThrow();
  });

  test('throws on a negative year date', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '-001-01-01', time: '09:00' })
    ).toThrow();
  });

  test('throws when date has wrong separators', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026/03/12', time: '09:00' })
    ).toThrow();
  });

  // ── time edge cases ──

  test('throws on a non-time string for time', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: 'morning' })
    ).toThrow();
  });

  test('throws on an empty string for time', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '' })
    ).toThrow();
  });

  test('throws when time is a number', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: 900 })
    ).toThrow();
  });

  test('throws when time is undefined', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12' })
    ).toThrow();
  });

  test('throws on out-of-range time (25:00)', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '25:00' })
    ).toThrow();
  });

  test('throws on negative time (-01:00)', () => {
    expect(() =>
      tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '-01:00' })
    ).toThrow();
  });

  // ── duplicate session ──

  test('throws if a session is already in progress', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.startStudying({ subject: 'History', date: '2026-03-12', time: '10:00' })
    ).toThrow(/already in progress/);
  });
});

// ─── endStudying ────────────────────────────────────────────────────────────

describe('endStudying', () => {
  let tracker;
  beforeEach(() => {
    tracker = createStudyTracker();
  });

  // ── valid ──

  test('ends an active session successfully', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: '10:00' })
    ).not.toThrow();
  });

  test('allows ending the next day (crossing midnight)', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '23:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-13', time: '01:00' })
    ).not.toThrow();
  });

  test('allows ending many days later', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-01-01', time: '08:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-12-31', time: '23:59' })
    ).not.toThrow();
  });

  // ── no active session ──

  test('throws when no session is active', () => {
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: '10:00' })
    ).toThrow(/No active study session/);
  });

  test('throws when called twice in a row', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: '11:00' })
    ).toThrow(/No active study session/);
  });

  // ── time ordering ──

  test('throws when end time equals start time', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: '09:00' })
    ).toThrow(/after the start time/);
  });

  test('throws when end time is before start time (same day)', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '14:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: '08:00' })
    ).toThrow(/after the start time/);
  });

  test('throws when end date is before start date', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-11', time: '10:00' })
    ).toThrow(/after the start time/);
  });

  // ── date edge cases ──

  test('throws on a non-date string for date', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: 'hello', time: '10:00' })
    ).toThrow();
  });

  test('throws on empty date', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '', time: '10:00' })
    ).toThrow();
  });

  test('throws when date is a number', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: 99999, time: '10:00' })
    ).toThrow();
  });

  test('throws when date is undefined', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ time: '10:00' })
    ).toThrow();
  });

  test('throws on invalid calendar date (month 13)', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-13-01', time: '10:00' })
    ).toThrow();
  });

  // ── time edge cases ──

  test('throws on non-time string for time', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: 'afternoon' })
    ).toThrow();
  });

  test('throws on empty time', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: '' })
    ).toThrow();
  });

  test('throws when time is a number', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12', time: 1000 })
    ).toThrow();
  });

  test('throws when time is undefined', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    expect(() =>
      tracker.endStudying({ date: '2026-03-12' })
    ).toThrow();
  });
});

// ─── getStats ───────────────────────────────────────────────────────────────

describe('getStats', () => {
  let tracker;
  beforeEach(() => {
    tracker = createStudyTracker();
  });

  // ── empty state ──

  test('returns zeroed stats when no sessions exist', () => {
    const stats = tracker.getStats();
    expect(stats.subjects).toEqual([]);
    expect(stats.totalMs).toBe(0);
    expect(stats.totalMinutes).toBe(0);
    expect(stats.totalHours).toBe(0);
    expect(stats.totalDays).toBe(0);
    expect(stats.totalSessions).toBe(0);
  });

  // ── single session ──

  test('correctly calculates a 1-hour session', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    const stats = tracker.getStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.subjects).toHaveLength(1);
    expect(stats.subjects[0].subject).toBe('Math');
    expect(stats.subjects[0].totalMinutes).toBe(60);
    expect(stats.subjects[0].totalHours).toBe(1);
    expect(stats.subjects[0].sessionCount).toBe(1);
  });

  test('correctly calculates a 1-minute session', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '09:01' });

    const stats = tracker.getStats();
    expect(stats.totalMinutes).toBe(1);
    expect(stats.totalMs).toBe(60000);
  });

  // ── multiple sessions, same subject ──

  test('aggregates multiple sessions for the same subject', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '14:00' });
    tracker.endStudying({ date: '2026-03-12', time: '15:30' });

    const stats = tracker.getStats();
    expect(stats.subjects).toHaveLength(1);
    expect(stats.subjects[0].sessionCount).toBe(2);
    expect(stats.subjects[0].totalMinutes).toBe(150); // 60 + 90
    expect(stats.subjects[0].totalHours).toBe(2.5);
  });

  // ── multiple subjects ──

  test('tracks multiple subjects independently', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    tracker.startStudying({ subject: 'History', date: '2026-03-12', time: '11:00' });
    tracker.endStudying({ date: '2026-03-12', time: '12:00' });

    const stats = tracker.getStats();
    expect(stats.subjects).toHaveLength(2);
    expect(stats.totalSessions).toBe(2);
    expect(stats.totalHours).toBe(2);

    const math = stats.subjects.find(s => s.subject === 'Math');
    const history = stats.subjects.find(s => s.subject === 'History');
    expect(math.totalHours).toBe(1);
    expect(history.totalHours).toBe(1);
  });

  // ── very long session ──

  test('handles a multi-day session', () => {
    tracker.startStudying({ subject: 'Research', date: '2026-01-01', time: '00:00' });
    tracker.endStudying({ date: '2026-01-08', time: '00:00' });

    const stats = tracker.getStats();
    expect(stats.subjects[0].totalDays).toBe(7);
    expect(stats.subjects[0].totalHours).toBe(168);
  });

  // ── crossing midnight ──

  test('correctly measures a session that crosses midnight', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '23:00' });
    tracker.endStudying({ date: '2026-03-13', time: '01:00' });

    const stats = tracker.getStats();
    expect(stats.subjects[0].totalMinutes).toBe(120);
    expect(stats.subjects[0].totalHours).toBe(2);
  });

  // ── does not count active session ──

  test('does not include an active (unfinished) session', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    // never call endStudying
    const stats = tracker.getStats();
    expect(stats.totalSessions).toBe(0);
    expect(stats.subjects).toEqual([]);
  });

  // ── output shape ──

  test('returns valid JSON-serializable output', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    const stats = tracker.getStats();
    const json = JSON.stringify(stats);
    const parsed = JSON.parse(json);
    expect(parsed).toEqual(stats);
  });

  test('all numeric fields are finite numbers', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    const stats = tracker.getStats();
    expect(Number.isFinite(stats.totalMs)).toBe(true);
    expect(Number.isFinite(stats.totalMinutes)).toBe(true);
    expect(Number.isFinite(stats.totalHours)).toBe(true);
    expect(Number.isFinite(stats.totalDays)).toBe(true);

    for (const s of stats.subjects) {
      expect(Number.isFinite(s.totalMs)).toBe(true);
      expect(Number.isFinite(s.totalMinutes)).toBe(true);
      expect(Number.isFinite(s.totalHours)).toBe(true);
      expect(Number.isFinite(s.totalDays)).toBe(true);
      expect(Number.isFinite(s.sessionCount)).toBe(true);
    }
  });

  // ── special character subjects in stats ──

  test('preserves special characters in subject names', () => {
    tracker.startStudying({ subject: 'C++ / C#', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    const stats = tracker.getStats();
    expect(stats.subjects[0].subject).toBe('C++ / C#');
  });

  test('treats subjects with different casing as separate', () => {
    tracker.startStudying({ subject: 'math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '11:00' });
    tracker.endStudying({ date: '2026-03-12', time: '12:00' });

    const stats = tracker.getStats();
    expect(stats.subjects).toHaveLength(2);
    expect(stats.totalSessions).toBe(2);
  });

  // ── many sessions ──

  test('handles a large number of sessions', () => {
    for (let i = 0; i < 1000; i++) {
      tracker.startStudying({ subject: 'Grind', date: '2026-03-12', time: '09:00' });
      tracker.endStudying({ date: '2026-03-12', time: '10:00' });
    }

    const stats = tracker.getStats();
    expect(stats.totalSessions).toBe(1000);
    expect(stats.subjects[0].sessionCount).toBe(1000);
    expect(stats.subjects[0].totalHours).toBe(1000);
  });
});

// ─── reset ──────────────────────────────────────────────────────────────────

describe('reset', () => {
  let tracker;
  beforeEach(() => {
    tracker = createStudyTracker();
  });

  test('clears all completed sessions', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    tracker.reset();

    const stats = tracker.getStats();
    expect(stats.totalSessions).toBe(0);
    expect(stats.subjects).toEqual([]);
  });

  test('clears an active (in-progress) session', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    // session still active — reset should clear it
    tracker.reset();

    // should be able to start a new session without error
    expect(() =>
      tracker.startStudying({ subject: 'History', date: '2026-03-12', time: '11:00' })
    ).not.toThrow();
  });

  test('is safe to call on an already-empty tracker', () => {
    expect(() => tracker.reset()).not.toThrow();
    expect(tracker.getStats().totalSessions).toBe(0);
  });

  test('is safe to call multiple times in a row', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });

    tracker.reset();
    tracker.reset();
    tracker.reset();

    expect(tracker.getStats().totalSessions).toBe(0);
  });

  test('allows starting fresh sessions after reset', () => {
    tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
    tracker.endStudying({ date: '2026-03-12', time: '10:00' });
    tracker.reset();

    tracker.startStudying({ subject: 'Science', date: '2026-03-12', time: '14:00' });
    tracker.endStudying({ date: '2026-03-12', time: '15:00' });

    const stats = tracker.getStats();
    expect(stats.totalSessions).toBe(1);
    expect(stats.subjects[0].subject).toBe('Science');
  });
});
