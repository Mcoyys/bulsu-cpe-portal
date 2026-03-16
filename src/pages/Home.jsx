import React, { useState, useEffect } from 'react';
import { 
  collection, getDocs, addDoc, updateDoc, deleteDoc, 
  doc, query, orderBy, serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';

// --- IMAGE IMPORTS ---
import sl1 from '../assets/sl1.jpg';
import sl2 from '../assets/sl2.jpg';
import sl3 from '../assets/sl3.jpg';
import sl4 from '../assets/sl4.jpg';
import sl5 from '../assets/sl5.jpg';
import sl6 from '../assets/sl6.png'; 
import sl7 from '../assets/sl7.jpg';
import sl8 from '../assets/sl8.jpg';

const carouselImages = [sl1, sl2, sl3, sl4, sl5, sl6, sl7, sl8];

// --- OFFICIAL FACULTY DATA ---
const leadership = [
  { name: "Engr. Arjay R. Alba", title: "Dean, College of Engineering" },
  { name: "Engr. Hilario A. Calinao Jr.", title: "Associate Dean" },
  { name: "Engr. Ma. Lorena SP. Villena", title: "Department Head, Computer Engineering" }
];

const fullTimeFaculty = [
  "Dr. Lech Walesa M. Navarra",
  "Engr. Bernard G. Yasay",
  "Engr. Catherine V. Dela Cruz",
  "Engr. Richard Y. Dela Cruz",
  "Dr. Ma. Magdalena V. Gatdula",
  "Dr. Monaliza S. Jimenez"
];

const partTimeFaculty = [
  { name: "Engr. Julius Vincent M. Abanel", title: "Part-Time Instructor" },
  { name: "Engr. Hiroyoshi DG. Arai", title: "Part-Time Instructor" },
  { name: "Engr. Robert Justin S. Chavez", title: "Part-Time Instructor" },
  { name: "Engr. Albert C. Cruz Jr.", title: "Part-Time Instructor" },
  { name: "Engr. Maria Ana G. Dangan", title: "Guest Lecturer" },
  { name: "Engr. Sheila May M. Liwag", title: "Guest Lecturer" }
];

export default function Home({ role }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('General');

  // --- CAROUSEL LOGIC ---
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 5000); 
    return () => clearInterval(slideInterval);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);

  // --- ANNOUNCEMENTS LOGIC ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "announcements"), orderBy("date", "desc"));
      const querySnapshot = await getDocs(q);
      setAnnouncements(querySnapshot.docs.map(d => ({ 
        id: d.id, likes: [], dislikes: [], ...d.data() 
      })));
    } catch (error) {
      console.error("System Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInteraction = async (post, type) => {
    if (!auth.currentUser) return alert("Please log in to interact.");
    const uid = auth.currentUser.uid;
    const postRef = doc(db, "announcements", post.id);

    let newLikes = [...(post.likes || [])];
    let newDislikes = [...(post.dislikes || [])];

    if (type === 'like') {
      if (newLikes.includes(uid)) newLikes = newLikes.filter(id => id !== uid);
      else { newLikes.push(uid); newDislikes = newDislikes.filter(id => id !== uid); }
    } else if (type === 'dislike') {
      if (newDislikes.includes(uid)) newDislikes = newDislikes.filter(id => id !== uid);
      else { newDislikes.push(uid); newLikes = newLikes.filter(id => id !== uid); }
    }

    setAnnouncements(announcements.map(p => 
      p.id === post.id ? { ...p, likes: newLikes, dislikes: newDislikes } : p
    ));
    await updateDoc(postRef, { likes: newLikes, dislikes: newDislikes });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (role !== 'admin') return;

    try {
      if (editingId) {
        await updateDoc(doc(db, "announcements", editingId), {
          title: newTitle, content: newContent, category: newCategory, lastEdited: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, "announcements"), {
          title: newTitle, content: newContent, category: newCategory,
          date: new Date().toISOString().split('T')[0],
          timestamp: serverTimestamp(),
          likes: [], dislikes: [] 
        });
      }
      closeAndResetModal();
      fetchData();
    } catch (err) { alert("Action Failed: " + err.message); }
  };

  const handleDelete = async (id) => {
    if (role !== 'admin') return;
    if (window.confirm("Delete this announcement?")) {
      await deleteDoc(doc(db, "announcements", id));
      fetchData();
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id); setNewTitle(item.title); setNewContent(item.content);
    setNewCategory(item.category || 'General'); setIsModalOpen(true);
  };

  const closeAndResetModal = () => {
    setEditingId(null); setNewTitle(''); setNewContent(''); setNewCategory('General'); setIsModalOpen(false);
  };

  return (
    <div style={styles.container}>
      <style>{`
        .badge-General { background: #e8f0fe; color: #1a73e8; }
        .badge-Academic { background: #fef3c7; color: #d97706; }
        .badge-Urgent { background: #fee2e2; color: #dc2626; }
        .interaction-btn { background: #f8f9fa; border: 1px solid #eee; padding: 6px 12px; border-radius: 20px; cursor: pointer; display: flex; align-items: center; gap: 5px; font-weight: bold; color: #555; transition: 0.2s; }
        .interaction-btn:hover { background: #e9ecef; }
        .interaction-btn.active-like { background: #dcfce7; color: #16a34a; border-color: #16a34a; }
        .interaction-btn.active-dislike { background: #fee2e2; color: #dc2626; border-color: #dc2626; }
        .admin-action-btn { background: none; border: none; cursor: pointer; font-size: 0.85rem; font-weight: bold; margin-left: 15px; }
        
        .carousel-track { display: flex; transition: transform 0.8s cubic-bezier(0.25, 0.8, 0.25, 1); width: 100%; height: 100%; }
        .carousel-slide { min-width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: #fff; }
        .carousel-img { width: 100%; height: 100%; object-fit: cover; }
        .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(255, 255, 255, 0.7); border: none; color: #800000; font-size: 1.5rem; cursor: pointer; padding: 10px 15px; border-radius: 50%; z-index: 10; transition: 0.2s; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .nav-btn:hover { background: white; transform: translateY(-50%) scale(1.1); }
        .prev-btn { left: 15px; }
        .next-btn { right: 15px; }
        
        /* Directory Hover Effects */
        .dir-card:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(128,0,0,0.1); border-color: #800000; }
      `}</style>

      {/* ================= CAROUSEL SECTION ================= */}
      <div style={styles.carouselWrapper}>
        <button className="nav-btn prev-btn" onClick={prevSlide}>❮</button>
        <button className="nav-btn next-btn" onClick={nextSlide}>❯</button>
        
        <div className="carousel-track" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
          {carouselImages.map((img, index) => (
            <div className="carousel-slide" key={index}>
              <img src={img} alt={`Slide ${index + 1}`} className="carousel-img" />
            </div>
          ))}
        </div>

        <div style={styles.dotContainer}>
          {carouselImages.map((_, index) => (
            <span 
              key={index} 
              onClick={() => setCurrentSlide(index)}
              style={{
                ...styles.dot, 
                background: currentSlide === index ? '#800000' : 'rgba(128,0,0,0.3)',
                transform: currentSlide === index ? 'scale(1.2)' : 'scale(1)'
              }} 
            />
          ))}
        </div>
      </div>

      {/* ================= ANNOUNCEMENTS SECTION ================= */}
      <div style={styles.headerRow}>
        <h2 style={styles.pageTitle}>Department Announcements</h2>
        {role === 'admin' && (
          <button onClick={() => setIsModalOpen(true)} style={styles.openModalBtn}>+ Create Memo</button>
        )}
      </div>

      {isModalOpen && role === 'admin' && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: '#800000' }}>{editingId ? 'Edit Memo' : 'New Memo'}</h3>
              <button onClick={closeAndResetModal} style={styles.closeBtn}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <select style={styles.input} value={newCategory} onChange={e => setNewCategory(e.target.value)}>
                <option value="General">General</option><option value="Academic">Academic</option><option value="Urgent">Urgent 🔥</option>
              </select>
              <input style={styles.input} placeholder="Title" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              <textarea style={styles.textarea} placeholder="Details" value={newContent} onChange={e => setNewContent(e.target.value)} required />
              <button type="submit" style={styles.postBtn}>{editingId ? 'Save Changes' : 'Publish'}</button>
            </form>
          </div>
        </div>
      )}

      <div style={{ marginBottom: '60px' }}>
        {loading ? <p style={styles.emptyState}>Loading feed...</p> : announcements.length > 0 ? (
          announcements.map(item => {
            const currentUid = auth.currentUser?.uid;
            const hasLiked = item.likes?.includes(currentUid);
            const hasDisliked = item.dislikes?.includes(currentUid);

            return (
              <div key={item.id} style={styles.announcementCard}>
                <div style={styles.cardHeader}>
                  <span className={`badge-${item.category || 'General'}`} style={styles.badge}>{item.category || 'General'}</span>
                  <small style={styles.cardDate}>{item.date}</small>
                </div>
                <h4 style={styles.cardTitle}>{item.title}</h4>
                <p style={styles.cardContent}>{item.content}</p>
                
                <div style={styles.cardFooter}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className={`interaction-btn ${hasLiked ? 'active-like' : ''}`} onClick={() => handleInteraction(item, 'like')}>
                      👍 {item.likes?.length || 0}
                    </button>
                    <button className={`interaction-btn ${hasDisliked ? 'active-dislike' : ''}`} onClick={() => handleInteraction(item, 'dislike')}>
                      👎 {item.dislikes?.length || 0}
                    </button>
                  </div>
                  
                  {role === 'admin' && (
                    <div>
                      <button className="admin-action-btn" style={{color: '#0d6efd'}} onClick={() => startEdit(item)}>Edit</button>
                      <button className="admin-action-btn" style={{color: '#dc3545'}} onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        ) : <p style={styles.emptyState}>No announcements posted yet.</p>}
      </div>

      {/* ================= ADMINISTRATION & FACULTY FOOTER ================= */}
      <div style={styles.directorySection}>
        <div style={styles.dirHeader}>
          <h2 style={{ margin: 0, color: '#800000', fontSize: '1.6rem', fontWeight: '900' }}>Administration & Faculty</h2>
          <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>College of Engineering • Computer Engineering Department</p>
        </div>

        <div style={styles.dirGrid}>
          
          {/* Leadership Column */}
          <div style={styles.dirColumn}>
            <h3 style={styles.dirColTitle}>College Leadership</h3>
            <div style={styles.dirList}>
              {leadership.map((leader, i) => (
                <div key={i} className="dir-card" style={styles.dirCard}>
                  <h4 style={styles.dirName}>{leader.name}</h4>
                  <p style={styles.dirTitle}>{leader.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Full-Time Faculty Column */}
          <div style={styles.dirColumn}>
            <h3 style={styles.dirColTitle}>Full-Time Faculty</h3>
            <div style={styles.dirList}>
              {fullTimeFaculty.map((name, i) => (
                <div key={i} className="dir-card" style={styles.dirCard}>
                  <h4 style={styles.dirName}>{name}</h4>
                  <p style={styles.dirTitle}>Faculty, Computer Engineering</p>
                </div>
              ))}
            </div>
          </div>

          {/* Part-Time & Guests Column */}
          <div style={styles.dirColumn}>
            <h3 style={styles.dirColTitle}>Part-Time & Guest Lecturers</h3>
            <div style={styles.dirList}>
              {partTimeFaculty.map((staff, i) => (
                <div key={i} className="dir-card" style={styles.dirCard}>
                  <h4 style={styles.dirName}>{staff.name}</h4>
                  <p style={styles.dirTitle}>{staff.title}, Computer Engineering</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}

// --- STYLES ---
const styles = {
  container: { maxWidth: '1100px', margin: '0 auto', padding: '20px' },
  
  carouselWrapper: { position: 'relative', width: '100%', height: '400px', overflow: 'hidden', borderRadius: '16px', boxShadow: '0 8px 25px rgba(0,0,0,0.1)', marginBottom: '50px', background: 'white' },
  dotContainer: { position: 'absolute', bottom: '15px', width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', cursor: 'pointer', transition: '0.3s' },
  
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '3px solid #FFD700', paddingBottom: '10px' },
  pageTitle: { color: '#800000', margin: 0, fontWeight: '900', fontSize: '1.8rem', textShadow: '1px 1px 2px white' },
  openModalBtn: { background: '#800000', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(128,0,0,0.2)' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(5px)' },
  modalContent: { background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' },
  closeBtn: { background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', padding: '12px', height: '120px', marginBottom: '20px', borderRadius: '8px', border: '1px solid #ddd', resize: 'none', boxSizing: 'border-box', outline: 'none' },
  postBtn: { width: '100%', background: '#800000', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  
  announcementCard: { background: 'rgba(255,255,255,0.95)', padding: '25px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.05)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' },
  badge: { padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' },
  cardTitle: { margin: '0 0 10px 0', fontSize: '1.4rem', color: '#2d3436', fontWeight: '800' },
  cardDate: { color: '#999', fontSize: '0.8rem', fontWeight: 'bold' },
  cardContent: { color: '#555', lineHeight: '1.7', whiteSpace: 'pre-wrap' },
  cardFooter: { marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  emptyState: { textAlign: 'center', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '15px', borderRadius: '8px', margin: '50px 0', backdropFilter: 'blur(5px)', fontWeight: 'bold' },

  // Directory Section Styles
  directorySection: { background: 'rgba(255,255,255,0.95)', borderRadius: '16px', padding: '30px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', borderTop: '4px solid #800000' },
  dirHeader: { textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #eee' },
  dirGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' },
  dirColumn: { display: 'flex', flexDirection: 'column', gap: '15px' },
  dirColTitle: { color: '#333', fontSize: '1.1rem', fontWeight: '800', margin: '0 0 10px 0', paddingBottom: '5px', borderBottom: '2px solid #FFD700', display: 'inline-block' },
  dirList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  dirCard: { background: '#fdfdfd', border: '1px solid #eee', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #800000', transition: 'all 0.2s ease' },
  dirName: { margin: '0 0 4px 0', color: '#800000', fontSize: '0.95rem', fontWeight: '800' },
  dirTitle: { margin: 0, color: '#666', fontSize: '0.75rem', fontWeight: '600', textTransform: 'uppercase' }
};