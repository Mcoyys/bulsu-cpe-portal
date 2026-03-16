import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export default function Events({ role }) {
  const [events, setEvents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form States for New Event
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');

  // --- REAL-TIME DATABASE SYNC ---
  useEffect(() => {
    // Fetch events ordered by date (soonest first)
    const q = query(collection(db, "events"), orderBy("date", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub(); // Cleanup listener
  }, []);

  // --- ADMIN: ADD EVENT ---
  const handleAddEvent = async (e) => {
    e.preventDefault();
    if (role !== 'admin') return; // STRICT SECURITY CHECK
    
    try {
      await addDoc(collection(db, "events"), {
        title: newTitle, 
        date: newDate, 
        location: newLocation, 
        createdAt: serverTimestamp()
      });
      // Clear form and close modal
      setNewTitle(''); 
      setNewDate(''); 
      setNewLocation(''); 
      setIsModalOpen(false);
    } catch (err) { 
      alert("Error adding event: " + err.message); 
    }
  };

  // --- ADMIN: DELETE EVENT ---
  const handleDelete = async (id) => {
    if (role !== 'admin') return; // STRICT SECURITY CHECK
    
    if (window.confirm("Are you sure you want to cancel and remove this event?")) {
      try {
        await deleteDoc(doc(db, "events", id));
      } catch (err) {
        alert("Error deleting event: " + err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      
      {/* Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #FFD700', paddingBottom: '15px' }}>
        <h1 style={{ color: '#800000', margin: 0, textShadow: '1px 1px 2px white' }}>Upcoming Events</h1>
        
        {/* SECURE: Only Admin can see the Add Event button */}
        {role === 'admin' && (
          <button onClick={() => setIsModalOpen(true)} style={styles.adminBtn}>
            + Add Event
          </button>
        )}
      </div>

      {/* SECURE: Admin Modal for Adding Events */}
      {isModalOpen && role === 'admin' && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#800000' }}>Schedule New Event</h3>
              <button onClick={() => setIsModalOpen(false)} style={styles.closeBtn}>✕</button>
            </div>
            
            <form onSubmit={handleAddEvent}>
              <label style={styles.label}>Event Date</label>
              <input 
                style={styles.input} 
                type="date" 
                value={newDate} 
                onChange={e => setNewDate(e.target.value)} 
                required 
              />
              
              <label style={styles.label}>Event Title</label>
              <input 
                style={styles.input} 
                placeholder="e.g. CpE Week Opening" 
                value={newTitle} 
                onChange={e => setNewTitle(e.target.value)} 
                required 
              />
              
              <label style={styles.label}>Location</label>
              <input 
                style={styles.input} 
                placeholder="e.g. Valencia Hall" 
                value={newLocation} 
                onChange={e => setNewLocation(e.target.value)} 
                required 
              />
              
              <button type="submit" style={styles.submitBtn}>Post Event to Portal</button>
            </form>
          </div>
        </div>
      )}

      {/* Events Feed */}
      <div>
        {events.length > 0 ? events.map(ev => {
          // Parse the date to make it look nice
          const evDate = new Date(ev.date);
          // Fix timezone issues causing the date to be off by 1 day
          const userTimezoneOffset = evDate.getTimezoneOffset() * 60000;
          const adjustedDate = new Date(evDate.getTime() + userTimezoneOffset);

          return (
            <div key={ev.id} style={styles.eventCard}>
              
              {/* Calendar Date Box */}
              <div style={styles.dateBox}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', color: '#800000' }}>
                  {adjustedDate.toLocaleString('default', { month: 'short' })}
                </span>
                <span style={{ fontSize: '2rem', fontWeight: '900', color: '#800000', lineHeight: '1' }}>
                  {adjustedDate.getDate()}
                </span>
                <span style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#555' }}>
                  {adjustedDate.getFullYear()}
                </span>
              </div>
              
              {/* Event Details */}
              <div style={{ flexGrow: 1 }}>
                <h3 style={{ margin: '0 0 8px 0', color: '#2d3436', fontSize: '1.3rem', fontWeight: '800' }}>
                  {ev.title}
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', fontWeight: '600' }}>
                  📍 {ev.location}
                </p>
              </div>
              
              {/* SECURE: Only Admin can Delete */}
              {role === 'admin' && (
                <button onClick={() => handleDelete(ev.id)} style={styles.delBtn}>
                  Cancel Event
                </button>
              )}
            </div>
          );
        }) : (
          <div style={styles.emptyState}>
            <h3>No upcoming events currently scheduled.</h3>
            <p>Check back later for updates from the College of Engineering!</p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Professional Styling ---
const styles = {
  adminBtn: { background: '#800000', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s', boxShadow: '0 4px 10px rgba(128,0,0,0.2)' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' },
  modalContent: { background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '450px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#888', transition: '0.2s' },
  label: { display: 'block', fontSize: '0.8rem', fontWeight: 'bold', color: '#666', marginBottom: '5px' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '1rem', outline: 'none' },
  submitBtn: { width: '100%', background: '#800000', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem', transition: '0.3s', marginTop: '10px' },
  
  eventCard: { display: 'flex', alignItems: 'center', gap: '25px', background: 'rgba(255,255,255,0.95)', padding: '25px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', transition: 'transform 0.3s ease', border: '1px solid rgba(0,0,0,0.05)' },
  dateBox: { background: '#FFD700', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', display: 'flex', flexDirection: 'column', minWidth: '90px', border: '2px solid rgba(128,0,0,0.1)', boxShadow: '0 4px 10px rgba(255,215,0,0.2)' },
  delBtn: { background: '#fee2e2', color: '#dc2626', border: 'none', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' },
  
  emptyState: { textAlign: 'center', color: '#fff', background: 'rgba(0,0,0,0.6)', padding: '40px', borderRadius: '12px', marginTop: '50px', backdropFilter: 'blur(4px)' }
};