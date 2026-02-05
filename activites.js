import React, { useState, useEffect } from 'react';

const Activities = () => {
  const [logs, setLogs] = useState([]);
  const [task, setTask] = useState({ type: 'Mow', date: '', notes: '', waterAmount: 0 });

  // Fetch existing logs from your db.json or local API
  useEffect(() => {
    fetch('http://localhost:3001/logs') // Adjust URL if using different port/API
      .then(res => res.json())
      .then(data => setLogs(data.reverse())); // Show newest first
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic to POST to your db.json
    console.log("Saving task:", task);
  };

  return (
    <div className="dashboard-container">
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>Log New Activity</h3>
        <form onSubmit={handleSubmit} className="activity-form">
          <div className="form-group">
            <label>Activity Type</label>
            <select onChange={(e) => setTask({...task, type: e.target.value})}>
              <option>Mow</option>
              <option>Water</option>
              <option>Fertilize</option>
              <option>Aeration</option>
            </select>
          </div>
          <div className="form-group">
            <label>Date</label>
            <input type="date" onChange={(e) => setTask({...task, date: e.target.value})} />
          </div>
          {task.type === 'Water' && (
            <div className="form-group">
              <label>Amount (Inches)</label>
              <input type="number" step="0.1" onChange={(e) => setTask({...task, waterAmount: e.target.value})} />
            </div>
          )}
          <button type="submit" className="btn-save">Save Activity</button>
        </form>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h3>Recent History</h3>
        <div className="history-list">
          {logs.map(log => (
            <div key={log.id} className="history-item">
              <span className="log-icon">{log.type === 'Mow' ? '🚜' : '💧'}</span>
              <div className="log-details">
                <strong>{log.type}</strong>
                <small>{log.date}</small>
              </div>
              <div className="log-meta">{log.waterAmount ? `${log.waterAmount}"` : ''}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Activities;
