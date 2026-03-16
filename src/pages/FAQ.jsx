import { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';

export default function FAQ() {
  const [faqs, setFaqs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState(null);
  const [userRole, setUserRole] = useState('student');

  useEffect(() => {
    const fetchFAQData = async () => {
      try {
        // 1. Fetch Knowledge Base Data
        const querySnapshot = await getDocs(collection(db, "faq"));
        setFaqs(querySnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        // 2. Identity & Access Management (RBAC)
        if (auth.currentUser) {
          const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
          if (userDoc.exists()) setUserRole(userDoc.data().role);
        }
      } catch (err) {
        console.error("Architectural Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFAQData();
  }, []);

  // PRO FILTERING LOGIC: Bulletproofed against missing/malformed Firestore data
  const filteredFaqs = faqs.filter(f => {
    // Safely extract fields. If a field is missing in the database, it defaults to an empty string.
    const safeQuestion = f.question ? String(f.question).toLowerCase() : "";
    const safeAnswer = f.answer ? String(f.answer).toLowerCase() : "";
    const term = searchTerm.toLowerCase();

    return safeQuestion.includes(term) || safeAnswer.includes(term);
  });

  return (
    <div style={styles.container}>
      {/* Component-Specific Micro-Interactions */}
      <style>{`
        .faq-card { 
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); 
          border: 1px solid rgba(128, 0, 0, 0.1); 
          margin-bottom: 15px; 
          border-radius: 16px; 
          background: #ffffff;
          overflow: hidden;
          position: relative;
        }
        .faq-card:hover { 
          transform: translateY(-4px); 
          border-color: #800000; 
          box-shadow: 0 10px 25px rgba(128,0,0,0.12); 
        }
        .faq-card::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 215, 0, 0.15), transparent);
          transition: 0.6s;
          pointer-events: none;
        }
        .faq-card:hover::before {
          left: 100%;
        }
        summary::-webkit-details-marker { display: none; }
      `}</style>

      <header style={styles.header}>
        <h2 style={styles.title}>Knowledge Base & Support</h2>
        <div style={styles.underline}></div>
        <p style={styles.subtitle}>Instant answers for the BulSU Computer Engineering community.</p>
        
        {/* Search Engine Input */}
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search for questions (e.g., 'password', 'grades', 'uniform')..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </header>

      {loading ? (
        <div style={styles.loader}>Synchronizing System...</div>
      ) : (
        <div style={styles.faqList}>
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((item) => (
              <details 
                key={item.id} 
                className="faq-card"
                onToggle={(e) => setActiveId(e.target.open ? item.id : null)}
              >
                <summary style={styles.summary}>
                  <span style={{ 
                    ...styles.questionText, 
                    color: activeId === item.id ? '#800000' : '#333' 
                  }}>
                    {item.question}
                  </span>
                  <div style={{
                    ...styles.icon,
                    transform: activeId === item.id ? 'rotate(45deg)' : 'rotate(0deg)'
                  }}>+</div>
                </summary>
                <div style={styles.answerWrapper}>
                  <p style={styles.answerText}>{item.answer}</p>
                </div>
              </details>
            ))
          ) : (
            <div style={styles.emptyState}>
              <p>No matching questions found. Try adjusting your search keywords.</p>
            </div>
          )}
        </div>
      )}

      {/* Admin Indicator */}
      {userRole === 'admin' && (
        <div style={styles.adminBadge}>
          Admin Mode: Verified Faculty Access
        </div>
      )}
    </div>
  );
}

// Senior Architect Object Styles
const styles = {
  container: { maxWidth: '850px', margin: '40px auto', fontFamily: "'Inter', system-ui, sans-serif", padding: '0 20px' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { color: '#800000', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 10px 0' },
  underline: { width: '60px', height: '4px', background: '#FFD700', margin: '0 auto 15px auto', borderRadius: '2px' },
  subtitle: { color: '#666', fontSize: '1.05rem', marginBottom: '35px' },
  faqList: { display: 'flex', flexDirection: 'column' },
  summary: { padding: '22px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', outline: 'none', userSelect: 'none' },
  questionText: { fontSize: '1.1rem', fontWeight: '700', transition: '0.3s' },
  icon: { fontSize: '1.8rem', color: '#800000', transition: '0.4s ease', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '300' },
  answerWrapper: { padding: '0 25px 25px 25px', borderTop: '1px solid rgba(0,0,0,0.04)', animation: 'fadeIn 0.5s ease' },
  answerText: { color: '#555', lineHeight: '1.7', margin: '15px 0 0 0', fontSize: '1.05rem' },
  loader: { textAlign: 'center', padding: '60px', color: '#800000', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.85rem' },
  emptyState: { textAlign: 'center', padding: '40px', background: '#f9f9f9', borderRadius: '12px', color: '#888', border: '1px dashed #ddd' },
  adminBadge: { marginTop: '40px', textAlign: 'center', fontSize: '0.8rem', color: '#27ae60', fontWeight: 'bold', background: '#e8f5e9', padding: '10px', borderRadius: '20px' }
};