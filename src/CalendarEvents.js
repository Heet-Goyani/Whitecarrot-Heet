import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CalendarEvents.css'; // Import the CSS file

const CalendarEvents = ({ user }) => {
  const [events, setEvents] = useState([]);
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            headers: {
              Authorization: `Bearer ${user.accessToken}`,
            },
          }
        );
        setEvents(response.data.items);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [user.accessToken]);

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to midnight for comparison

  // Sort events in descending order (latest first)
  let sortedEvents = [...events].sort((a, b) => {
    const dateA = a.start?.dateTime ? new Date(a.start.dateTime) : new Date(0);
    const dateB = b.start?.dateTime ? new Date(b.start.dateTime) : new Date(0);
    return dateB - dateA; // Descending order
  });

  // Apply date filter if selected
  const filteredEvents = sortedEvents.filter((event) => {
    if (!filterDate) return true; // Show all if no filter
    const eventDate = event.start?.dateTime ? new Date(event.start.dateTime).toISOString().split('T')[0] : null;
    return eventDate === filterDate;
  });

  // Find the nearest upcoming event (earliest event that is today or after today)
  const nearestEvent = [...filteredEvents]
    .reverse() // Reverse back to ascending order
    .find(event => new Date(event.start.dateTime) >= today);

  return (
    <div className="container">
      <h2 className="heading">Your Calendar Events</h2>

      {/* Filter Inputs */}
      <div className="filter-container">
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="input"
        />
        <button onClick={() => setFilterDate('')} className="button">
          Show All Events
        </button>
      </div>

      {/* Responsive Table */}
      <div className="table-container">
        <table className="table">
          <thead>
            <tr className="header-row">
              <th className="th">Event Name</th>
              <th className="th">Start Time</th>
              <th className="th">End Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event) => {
                const eventDate = new Date(event.start.dateTime);
                const isNearest = nearestEvent && nearestEvent.id === event.id;

                return (
                  <tr key={event.id} className={isNearest ? "nearest-event" : ""}>
                    <td className="td">{event.summary}</td>
                    <td className="td">{eventDate.toLocaleString()}</td>
                    <td className="td">{new Date(event.end.dateTime).toLocaleString()}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" className="no-events">
                  No events found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CalendarEvents;
