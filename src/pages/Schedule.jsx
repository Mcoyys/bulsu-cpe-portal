import React, { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc, setDoc, collection } from "firebase/firestore";
import { db } from '../firebase';

export default function Schedule({ role }) {
  const [activeSection, setActiveSection] = useState('A');
  const [isEditing, setIsEditing] = useState(false);
  const [scheduleData, setScheduleData] = useState({ 'A': [], 'B': [], 'C': [] });
  const [professorsList, setProfessorsList] = useState([]);

  useEffect(() => {
    const unsubSched = onSnapshot(doc(db, "schedules", "master_list"), (docSnap) => {
      if (docSnap.exists()) {
        setScheduleData(docSnap.data());
      } else {
        const initial = { 'A': [], 'B': [], 'C': [] };
        setDoc(doc(db, "schedules", "master_list"), initial);
        setScheduleData(initial);
      }
    });

    const unsubFac = onSnapshot(collection(db, "faculty"), (snap) => {
      setProfessorsList(snap.docs.map(d => d.data().name));
    });

    return () => { unsubSched(); unsubFac(); };
  }, []);

  const handleInputChange = (id, field, value) => {
    const updated = scheduleData[activeSection].map(cls => 
      cls.id === id ? { ...cls, [field]: value } : cls
    );
    setScheduleData({ ...scheduleData, [activeSection]: updated });
  };

  const handleSave = async () => {
    if (role !== 'admin') return; 
    try {
      await updateDoc(doc(db, "schedules", "master_list"), scheduleData);
      setIsEditing(false);
      alert("✅ Schedule successfully synced to Firebase!");
    } catch (err) { 
      alert("Error: " + err.message); 
    }
  };

  return (
    <div style={styles.container}>
      <style>{`
        .edit-input:focus { border-color: #800000 !important; box-shadow: 0 0 0 3px rgba(128,0,0,0.1) !important; }
        .table-row { transition: background 0.2s ease; }
        .table-row:hover { background: #fdfdfd; }
        .admin-btn:hover { transform: translateY(-2px); opacity: 0.95; }
        .tab-btn { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .tab-btn:hover:not(.active) { background: rgba(128,0,0,0.05); }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Class Schedules</h1>
        {role === 'admin' && (
          <button className="admin-btn" onClick={() => setIsEditing(!isEditing)} style={styles.adminBtn}>
            {isEditing ? '✕ Cancel Editing' : '✏️ Admin Edit'}
          </button>
        )}
      </div>

      {/* Modern Pill Tabs */}
      <div style={styles.tabsContainer}>
        <div style={styles.tabsWrapper}>
          {['A', 'B', 'C'].map(s => (
            <button key={s} className={`tab-btn ${activeSection === s ? 'active' : ''}`} onClick={() => setActiveSection(s)} 
              style={{
                ...styles.tab, 
                background: activeSection === s ? '#800000' : 'transparent', 
                color: activeSection === s ? 'white' : '#666',
                boxShadow: activeSection === s ? '0 4px 10px rgba(128,0,0,0.2)' : 'none'
              }}>
              Section {s}
            </button>
          ))}
        </div>
      </div>

      {/* Sleek Table Card */}
      <div style={styles.tableCard}>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Day</th>
                <th style={styles.th}>Time</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Room</th>
                <th style={styles.th}>Professor</th>
                {isEditing && role === 'admin' && <th style={styles.th}>Action</th>}
              </tr>
            </thead>
            <tbody>
              {scheduleData[activeSection]?.length > 0 ? scheduleData[activeSection].map((cls) => (
                <tr className="table-row" key={cls.id} style={styles.tr}>
                  {isEditing && role === 'admin' ? (
                    <>
                      <td style={styles.td}><select className="edit-input" style={styles.input} value={cls.day} onChange={e => handleInputChange(cls.id, 'day', e.target.value)}>
                        <option value="">Day</option><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option><option>Saturday</option>
                      </select></td>
                      <td style={styles.td}><input className="edit-input" style={styles.input} value={cls.time} onChange={e => handleInputChange(cls.id, 'time', e.target.value)} placeholder="08:00 AM - 11:00 AM"/></td>
                      <td style={styles.td}><input className="edit-input" style={styles.input} value={cls.subject} onChange={e => handleInputChange(cls.id, 'subject', e.target.value)} placeholder="Subject Code"/></td>
                      <td style={styles.td}><input className="edit-input" style={styles.input} value={cls.room} onChange={e => handleInputChange(cls.id, 'room', e.target.value)} placeholder="Room No."/></td>
                      <td style={styles.td}>
                        <select className="edit-input" style={styles.input} value={cls.prof} onChange={e => handleInputChange(cls.id, 'prof', e.target.value)}>
                          <option value="">Select Prof...</option>
                          {professorsList.map((prof, idx) => <option key={idx} value={prof}>{prof}</option>)}
                        </select>
                      </td>
                      <td style={styles.td}>
                        <button onClick={() => {
                          const filtered = scheduleData[activeSection].filter(c => c.id !== cls.id);
                          setScheduleData({...scheduleData, [activeSection]: filtered});
                        }} style={styles.delBtn}>Remove</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td style={{...styles.td, fontWeight: '800', color: '#333'}}>{cls.day}</td>
                      <td style={{...styles.td, color: '#555', fontWeight: '600'}}>{cls.time}</td>
                      <td style={{...styles.td, color: '#800000', fontWeight: '800'}}>{cls.subject}</td>
                      <td style={{...styles.td, color: '#555'}}>{cls.room}</td>
                      <td style={{...styles.td, fontWeight: '600', color: '#333'}}>{cls.prof}</td>
                    </>
                  )}
                </tr>
              )) : <tr><td colSpan="6" style={styles.emptyState}>No classes assigned for this section yet.</td></tr>}
            </tbody>
          </table>
        </div>
        
        {/* Admin Save Area */}
        {isEditing && role === 'admin' && (
          <div style={styles.saveArea}>
            <button className="admin-btn" onClick={() => {
              const newCls = { id: Date.now(), day: '', time: '', subject: '', room: '', prof: '' };
              setScheduleData({...scheduleData, [activeSection]: [...(scheduleData[activeSection]||[]), newCls]});
            }} style={styles.addBtn}>+ Add Time Slot</button>
            <button className="admin-btn" onClick={handleSave} style={styles.saveBtn}>💾 Save to Cloud</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1150px', margin: '0 auto', padding: '20px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  title: { color: '#800000', margin: 0, fontWeight: '900', fontSize: '2rem', textShadow: '1px 1px 2px white' },
  adminBtn: { background: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 10px rgba(128,0,0,0.2)' },
  
  tabsContainer: { display: 'flex', justifyContent: 'center', marginBottom: '30px' },
  tabsWrapper: { display: 'flex', background: 'rgba(255,255,255,0.8)', padding: '5px', borderRadius: '40px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid #eaeaea' },
  tab: { padding: '10px 30px', borderRadius: '30px', border: 'none', fontWeight: '800', fontSize: '1rem', cursor: 'pointer' },
  
  tableCard: { background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.06)', border: '1px solid #eaeaea' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  thRow: { background: '#fcfcfc', borderBottom: '2px solid #eee' },
  th: { padding: '18px 20px', color: '#888', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: '800', letterSpacing: '0.5px' },
  tr: { borderBottom: '1px solid #f5f5f5' },
  td: { padding: '16px 20px', verticalAlign: 'middle' },
  
  input: { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none', transition: 'all 0.3s', fontSize: '0.9rem', background: '#fcfcfc' },
  delBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' },
  
  saveArea: { padding: '20px', display: 'flex', justifyContent: 'space-between', background: '#fafafa', borderTop: '1px solid #eee' },
  addBtn: { background: 'white', border: '2px dashed #800000', color: '#800000', padding: '12px 25px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  saveBtn: { background: '#16a34a', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(22,163,74,0.2)' },
  emptyState: { textAlign: 'center', padding: '40px', color: '#888', fontStyle: 'italic', background: '#fafafa' }
};