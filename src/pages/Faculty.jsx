import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc, query, orderBy, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Faculty({ role }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [facultyDetails, setFacultyDetails] = useState([]);
  const [allSchedules, setAllSchedules] = useState({ 'A': [], 'B': [], 'C': [] });
  
  const [newName, setNewName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newEmail, setNewEmail] = useState('');

  useEffect(() => {
    const unsubFaculty = onSnapshot(query(collection(db, "faculty"), orderBy("name", "asc")), (snap) => {
      setFacultyDetails(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubSched = onSnapshot(doc(db, "schedules", "master_list"), (d) => {
      if (d.exists()) setAllSchedules(d.data());
    });
    return () => { unsubFaculty(); unsubSched(); };
  }, []);

  const getProfSchedules = (profName) => {
    let profScheds = [];
    ['A', 'B', 'C'].forEach(section => {
      if (allSchedules[section]) {
        allSchedules[section].forEach(cls => {
          if (cls.prof === profName) profScheds.push({ ...cls, section });
        });
      }
    });
    return profScheds;
  };

  const handleAddFaculty = async () => {
    if (role !== 'admin' || !newName.trim()) return;
    try {
      await addDoc(collection(db, "faculty"), { name: newName, title: newTitle, email: newEmail, image: '👤' });
      setNewName(''); setNewTitle(''); setNewEmail(''); setIsAdding(false);
    } catch (err) { alert("Error: " + err.message); }
  };

  const handleDeleteFaculty = async (id) => {
    if (role !== 'admin') return;
    if (window.confirm("Remove this faculty member?")) {
      await deleteDoc(doc(db, "faculty", id));
    }
  };

  const filteredFaculty = facultyDetails.filter(prof => 
    prof.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    prof.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={styles.container}>
      <style>{`
        .search-input:focus { border-color: #800000 !important; box-shadow: 0 0 0 3px rgba(128,0,0,0.1) !important; }
        .prof-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .prof-card:hover { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(0,0,0,0.1) !important; border-color: #800000 !important; }
        .admin-btn:hover { transform: translateY(-2px); opacity: 0.95; }
        .del-btn:hover { background: #fee2e2; color: #dc2626; }
      `}</style>

      {/* Header */}
      <div style={styles.headerRow}>
        <h1 style={styles.pageTitle}>Faculty Directory</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
          <input 
            className="search-input" 
            style={styles.searchInput} 
            placeholder="🔍 Search name or title..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
          {role === 'admin' && (
            <button className="admin-btn" onClick={() => setIsAdding(!isAdding)} style={styles.adminBtn}>
              {isAdding ? '✕ Close Panel' : '+ Add Faculty'}
            </button>
          )}
        </div>
      </div>

      {/* Admin Add Panel */}
      {isAdding && role === 'admin' && (
        <div style={styles.adminAddPanel}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input className="search-input" style={styles.input} placeholder="e.g. Engr. Dela Cruz" value={newName} onChange={e => setNewName(e.target.value)} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Title / Position</label>
            <input className="search-input" style={styles.input} placeholder="e.g. Instructor I" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input className="search-input" style={styles.input} placeholder="email@ms.bulsu.edu.ph" value={newEmail} onChange={e => setNewEmail(e.target.value)} />
          </div>
          <button className="admin-btn" style={styles.addBtn} onClick={handleAddFaculty}>+ Add Professor</button>
        </div>
      )}

      {/* Grid */}
      <div style={styles.grid}>
        {filteredFaculty.map((prof) => {
          const mySchedules = getProfSchedules(prof.name);
          return (
            <div className="prof-card" style={styles.card} key={prof.id}>
              {/* Premium Card Header */}
              <div style={styles.cardBanner}></div>
              <div style={styles.avatarWrapper}>
                <div style={styles.avatar}>{prof.image || '👨‍🏫'}</div>
              </div>
              
              <div style={styles.profInfo}>
                <h2 style={styles.profName}>{prof.name}</h2>
                <p style={styles.profTitle}>{prof.title}</p>
                <p style={styles.profEmail}>✉️ {prof.email}</p>
                {role === 'admin' && (
                  <button className="del-btn" style={styles.delBtn} onClick={() => handleDeleteFaculty(prof.id)}>🗑️ Remove</button>
                )}
              </div>

              {/* Teaching Load */}
              <div style={styles.loadSection}>
                <h3 style={styles.loadHeader}>Teaching Load</h3>
                <div style={styles.loadList}>
                  {mySchedules.length > 0 ? mySchedules.map((sched, index) => (
                    <div key={index} style={styles.loadItem}>
                      <p style={styles.loadSubject}>
                        <span style={styles.secBadge}>SEC {sched.section}</span> {sched.subject}
                      </p>
                      <p style={styles.loadTime}>🗓️ {sched.day} | ⏰ {sched.time}</p>
                    </div>
                  )) : (
                    <p style={styles.emptyLoad}>No active schedule assigned.</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1150px', margin: '0 auto', padding: '20px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #FFD700', paddingBottom: '15px' },
  pageTitle: { color: '#800000', margin: 0, fontWeight: '900', fontSize: '2rem', textShadow: '1px 1px 2px white' },
  searchInput: { padding: '12px 20px', borderRadius: '30px', border: '1px solid #ddd', outline: 'none', width: '250px', fontSize: '0.9rem', transition: 'all 0.3s' },
  adminBtn: { background: '#800000', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 10px rgba(128,0,0,0.2)' },
  
  adminAddPanel: { background: 'rgba(255,255,255,0.95)', padding: '25px', borderRadius: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '20px', marginBottom: '30px', boxShadow: '0 8px 25px rgba(0,0,0,0.08)', border: '1px solid #eee', alignItems: 'flex-end' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '0.8rem', fontWeight: 'bold', color: '#666', textTransform: 'uppercase' },
  input: { width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', boxSizing: 'border-box', outline: 'none', transition: 'all 0.3s' },
  addBtn: { background: '#16a34a', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', height: '42px', transition: 'all 0.3s' },
  
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '30px' },
  card: { background: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #eaeaea', display: 'flex', flexDirection: 'column' },
  
  cardBanner: { height: '80px', background: 'linear-gradient(135deg, #800000, #b30000)' },
  avatarWrapper: { display: 'flex', justifyContent: 'center', marginTop: '-45px' },
  avatar: { fontSize: '2.5rem', background: '#f8f9fa', width: '90px', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '4px solid white', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  
  profInfo: { textAlign: 'center', padding: '15px 20px 20px', borderBottom: '1px solid #eee' },
  profName: { margin: '0 0 5px 0', color: '#800000', fontSize: '1.25rem', fontWeight: '900' },
  profTitle: { margin: '0 0 10px 0', color: '#555', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' },
  profEmail: { margin: 0, color: '#0d6efd', fontSize: '0.85rem', fontWeight: '600' },
  delBtn: { color: '#888', background: 'transparent', border: '1px solid #ddd', padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px', transition: 'all 0.2s' },
  
  loadSection: { padding: '20px', background: '#fafafa', flexGrow: 1 },
  loadHeader: { fontSize: '0.8rem', color: '#999', textTransform: 'uppercase', margin: '0 0 15px 0', letterSpacing: '1px', fontWeight: '800' },
  loadList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  loadItem: { background: 'white', borderLeft: '4px solid #800000', padding: '12px', borderRadius: '6px', boxShadow: '0 2px 5px rgba(0,0,0,0.02)' },
  secBadge: { background: '#FFD700', color: '#800000', padding: '3px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '900', marginRight: '8px' },
  loadSubject: { margin: '0 0 5px 0', fontWeight: '800', fontSize: '0.9rem', color: '#333' },
  loadTime: { margin: 0, fontSize: '0.8rem', color: '#666', fontWeight: '600' },
  emptyLoad: { color: '#aaa', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }
};