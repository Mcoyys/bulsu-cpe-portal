import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore"; 
import { auth, db } from './firebase'; 

// --- Pages ---
import Login from './pages/Login';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Faculty from './pages/Faculty';
import Events from './pages/Events';
import Profile from './pages/Profile';
import FAQ from './pages/faq'; // Ensure this matches the exact casing of your file (e.g., FAQ.jsx or faq.jsx)
import coepet from './assets/coepet.gif'

// --- Assets ---
import coeLogo from './assets/coe.png';
import bsuLogo from './assets/bsu.png';
import { FunctionCallingMode } from 'firebase/ai';

export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // 🚀 MASTER KEY OVERRIDE: Your Admin UID
        if (currentUser.uid === 'VCukLErt3Cb1YOiyETLqtwFVBIJ3') {
          setRole('admin');
          setLoading(false);
          return;
        }

        // Standard Firestore check
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setRole(userSnap.data().role || 'student');
          } else {
            setRole('student');
          }
        } catch (error) {
          console.error("System Error:", error);
          setRole('student');
        }
      } else {
        setUser(null);
        setRole('student');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div style={styles.loading}>Verifying Portal Access...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/*" element={user ? <PortalLayout user={user} role={role} /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

function PortalLayout({ user, role }) {
  const location = useLocation();

  return (
    <div style={styles.appContainer}>
      <RobotInteraction />
      
      {/* 🚀 UPDATED HEADER WITH RIBBON */}
      <header style={styles.header}>
        
        {/* The Continuous Animated Ribbon */}
        <HeaderRibbon />
        
        {/* Left Side: COE Logo & Text (Protected by zIndex: 1) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
          <img src={coeLogo} alt="COE" style={{ height: '70px' }} />
          <div>
            <h1 style={styles.portalTitle}>Student Portal</h1>
            <p style={styles.deptSub}>College of Engineering</p>
          </div>
        </div>
        
        {/* Right Side: BulSU Text & Logo (Protected by zIndex: 1) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', position: 'relative', zIndex: 1 }}>
          <h2 style={styles.univName}>BULACAN STATE UNIVERSITY</h2>
          <img src={bsuLogo} alt="BSU" style={{ height: '70px' }} />
        </div>
      </header>

      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navLinks}>
          <NavLink to="/" label="Home" active={location.pathname === '/'} />
          <NavLink to="/announcements" label="Announcements" active={location.pathname === '/announcements'} />
          <NavLink to="/schedule" label="Schedules" active={location.pathname === '/schedule'} />
          <NavLink to="/faculty" label="Faculty" active={location.pathname === '/faculty'} />
          <NavLink to="/events" label="Events" active={location.pathname === '/events'} />
          <NavLink to="/faq" label="FAQ" active={location.pathname === '/faq'} />
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <span style={{...styles.badge, background: role === 'admin' ? '#FFD700' : '#eee'}}>
            {role.toUpperCase()}
          </span>
          <NavLink to="/profile" label="⚙️" active={location.pathname === '/profile'} />
          <button onClick={() => signOut(auth)} style={styles.logoutBtn}>Logout</button>
        </div>
      </nav>

      {/* Main Pages */}
      <main style={styles.main}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/announcements" element={<Home role={role} />} />
          <Route path="/schedule" element={<Schedule role={role} />} />
          <Route path="/faculty" element={<Faculty role={role} />} />
          <Route path="/events" element={<Events role={role} />} />
          <Route path="/profile" element={<Profile user={user} />} />
          <Route path="/faq" element={<FAQ />} />
        </Routes>
      </main>
    </div>
  );
}

// --- NEW COMPONENT: Wavy Ribbon Animation ---
function HeaderRibbon() {
  return (
    <div style={{
      position: 'absolute',
      top: 0, left: 0, right: 0, bottom: 0,
      overflow: 'hidden',
      zIndex: 0, // Keeps it behind the logos
      opacity: 0.70, // Subtle transparency so it's not distracting
      pointerEvents: 'none' // Ensures users can still click things underneath
    }}>
      <style>{`
        .wavy-ribbon {
          width: 200%;
          height: 100%;
          /* Custom SVG Data URI creating a 3-strand overlapping maroon wave */
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='800' height='120' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 60 Q 200 110 400 60 T 800 60' fill='none' stroke='%23800000' stroke-width='12'/%3E%3Cpath d='M0 80 Q 200 130 400 80 T 800 80' fill='none' stroke='%23800000' stroke-width='6' opacity='0.6'/%3E%3Cpath d='M0 45 Q 200 95 400 45 T 800 45' fill='none' stroke='%23800000' stroke-width='3' opacity='0.3'/%3E%3C/svg%3E");
          background-repeat: repeat-x;
          background-size: 800px 120px;
          background-position: center;
          animation: ribbonScroll 10s linear infinite;
        }
        @keyframes ribbonScroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-800px); }
        }
      `}</style>
      <div className="wavy-ribbon"></div>
    </div>
  );
}

// --- Floating Robot ---
function RobotInteraction() {
  const [isDancing, setIsDancing] = useState(false);
  const [message, setMessage] = useState("Need help?");

  // Optional: Change the message randomly on hover
  const handleMouseEnter = () => {
    const greetings = ["Need help?", "Welcome, Student!", "Check your schedule!", "Keep coding!", "Go BulSU! ", "Have a great day!", "Don't forget to check announcements!", "Need assistance?"];
    setMessage(greetings[Math.floor(Math.random() * greetings.length)]);
    setIsDancing(true);
  };

  return (
    <div 
      className={`bot ${isDancing ? 'dance' : 'float'}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsDancing(false)}
      style={styles.robot}
    >
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }
        @keyframes dance { 0%, 100% { transform: rotate(0) scale(1.1); } 25% { transform: rotate(10deg); } 75% { transform: rotate(-10deg); } }
        @keyframes popIn { 
          from { transform: scale(0) translateY(20px); opacity: 0; } 
          to { transform: scale(1) translateY(0); opacity: 1; } 
        }
        .float { animation: float 3s ease-in-out infinite; }
        .dance { animation: dance 0.3s linear infinite; }
        .chat-bubble { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
      `}</style>

      {/* The Chat Bubble */}
      {isDancing && (
        <div className="chat-bubble" style={styles.chatBubble}>
          {message}
          <div style={styles.bubbleTail}></div>
        </div>
      )}

      <span style={{ fontSize: '5.5rem' }}>🤖</span>
    </div>
  );
}

function NavLink({ to, label, active }) {
  return (
    <Link to={to} style={{
      ...styles.link,
      borderBottom: active ? '3px solid #FFD700' : '3px solid transparent',
      color: active ? '#FFD700' : 'white'
    }}>{label}</Link>
  );
}

// --- Styles ---
const styles = {
  chatBubble: {
    position: 'absolute',
    bottom: '100%',
    right: '10px',
    background: 'white',
    color: '#800000',
    padding: '10px 15px',
    borderRadius: '15px',
    fontSize: '0.85rem',
    fontWeight: 'bold',
    whiteSpace: 'nowrap',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
    marginBottom: '15px',
    border: '2px solid #800000',
    pointerEvents: 'none',
  },
  bubbleTail: {
    position: 'absolute',
    top: '100%',
    right: '25px',
    width: '0',
    height: '0',
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderTop: '10px solid #800000',
  },
  loading: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#800000', fontWeight: 'bold' },
  appContainer: { minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'transparent' },
  
  // NOTE: position 'relative' and overflow 'hidden' added here to contain the ribbon
  header: { position: 'relative', overflow: 'hidden', background: 'rgba(255, 255, 255, 0.98)', padding: '10px 1.5%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #800000' },
  
  portalTitle: { margin: 0, fontSize: '1.4rem', color: '#800000', fontWeight: '900', textShadow: '1px 1px 0px white' },
  deptSub: { margin: 0, fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: 'bold' },
  univName: { fontWeight: '800', fontSize: '0.9rem', color: '#800000', textShadow: '1px 1px 0px white' },
  
  navbar: { background: '#800000', padding: '0 5%', position: 'sticky', top: 0, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '55px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  navLinks: { display: 'flex', gap: '20px' },
  link: { textDecoration: 'none', fontWeight: '700', fontSize: '0.8rem', padding: '15px 0', transition: '0.2s' },
  badge: { color: '#800000', padding: '3px 10px', borderRadius: '5px', fontSize: '0.65rem', fontWeight: 'bold' },
  logoutBtn: { background: 'transparent', color: 'white', border: '1px solid white', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.7rem', transition: '0.2s' },
  main: { flex: 1, padding: '30px 5%' },
  robot: { position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, cursor: 'pointer' }
};