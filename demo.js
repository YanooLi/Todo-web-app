const { createStudyTracker } = require('./studyTracker');

const tracker = createStudyTracker();

// Session 1: Math
tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '09:00' });
tracker.endStudying({ date: '2026-03-12', time: '10:30' });

// Session 2: History
tracker.startStudying({ subject: 'History', date: '2026-03-12', time: '11:00' });
tracker.endStudying({ date: '2026-03-12', time: '12:15' });

// Session 3: Math again
tracker.startStudying({ subject: 'Math', date: '2026-03-12', time: '14:00' });
tracker.endStudying({ date: '2026-03-12', time: '15:45' });

// Print stats
console.log(JSON.stringify(tracker.getStats(), null, 2));

// Reset and confirm it's cleared
tracker.reset();
console.log('\nAfter reset:');
console.log(JSON.stringify(tracker.getStats(), null, 2));
