import React from 'react';

function SchedulePage({ schedule }) {
  return (
    <>
      <h2 className="section-title">Upcoming Schedule</h2>
      <div className="schedule-list-wrapper">
        <div className="schedule-list-container">
          <div className="event-list">
            {schedule.slice(0, 5).map((event, idx) => (
              <div className="event-card" key={idx}>
                <div className="event-header">
                  <span className="event-league">{event.league}</span>
                  <span className="event-date">{event.date} – {event.time}</span>
                </div>
                <div className="event-teams">
                  <span className="team">{event.home}</span>
                  <span className="score">vs</span>
                  <span className="team">{event.away}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default SchedulePage;
