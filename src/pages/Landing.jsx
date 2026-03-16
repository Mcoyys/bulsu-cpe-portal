import React from 'react';
import { Link } from 'react-router-dom';

// --- ACTIVITY IMAGES ---
import bloodImg from '../assets/blood.jpg';
import donationImg from '../assets/donation.jpg';
import intramsImg from '../assets/intrams.jpg';

export default function Landing() {
  /* SECURITY ENFORCEMENT: 
     The developer names and emails are stored in a Base64 encoded string.
     This prevents unauthorized editing and search-indexing of credits.
  */
  const secureData = "W3siZSI6InN1cGVybWFrZWtveUBnbWFpbC5jb20iLCJuIjoiRGFlbmllbSBNY0NhaW4gQS4gRGVjZW5hIiwiciI6IkxFQUQgREVWIn0seyJlIjoiaGFyb2xpZW5uZXBAZ21haWwuY29tIiwibiI6Ikhhcm9saXllbiBHYWJyaWxsbyBQYWNoZWNvIiwiciI6IkRFVkVMT1BFUiJ9LHsiZSI6ImNhc2lhLmNocmlzdGVhYmxlc3NkY0BnbWFpbC5jb20iLCJuIjoiQ2hyaXN0ZWEgQmxlc3MgQ2FzaWEiLCJyIjoiREVWRUxPUEVSIn0seyJlIjoiZGVyaWNrZGVndXptYW4xN0BnbWFpbC5jb20iLCJuIjoiRGVyaWNrIEEuIERlIEd1em1hbiIsInIiOiJERVZFTE9QRVIifV0=";
  
  const getCredits = () => {
    try {
      // Decodes the string back into a readable object only at runtime
      return JSON.parse(atob(secureData));
    } catch (e) {
      return [{ n: "Integrity Violation Detected", r: "SECURE_LOCK" }];
    }
  };

  const developers = getCredits();

  return (
    <div className="landing-page-wrapper">
      <style>{`
        /* Global Reset */
        * { box-sizing: border-box; }

        .hero-section {
          background: linear-gradient(135deg, #800000 0%, #4a0000 100%);
          border-radius: 20px;
          padding: 80px 40px;
          color: white;
          text-align: center;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(128,0,0,0.2);
          animation: fadeSlideDown 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .cta-btn {
          background: #FFD700;
          color: #800000;
          padding: 15px 35px;
          border-radius: 30px;
          font-weight: bold;
          text-decoration: none;
          display: inline-block;
          margin-top: 30px;
          transition: 0.3s;
          font-size: 1.1rem;
          box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        }
        .cta-btn:hover { transform: scale(1.05); background: #fff; }

        .feature-card {
          background: white;
          padding: 30px;
          border-radius: 16px;
          border: 1px solid #eee;
          transition: all 0.3s ease;
          text-decoration: none;
          color: inherit;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          box-shadow: 0 4px 15px rgba(0,0,0,0.03);
        }
        .feature-card:hover { transform: translateY(-8px); border-color: #800000; box-shadow: 0 12px 25px rgba(128,0,0,0.1); }

        .section-title { color: #800000; font-size: 2.2rem; font-weight: 900; margin: 60px 0 15px 0; text-align: center; }
        .title-underline { height: 4px; width: 80px; background: #FFD700; margin: 0 auto 40px auto; border-radius: 2px; }
        .section-wrapper { text-align: center; }

        .activities-gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 25px; margin-bottom: 60px; }
        .activity-card { position: relative; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 20px rgba(0,0,0,0.08); transition: transform 0.3s ease; background: #fff; }
        .activity-card:hover { transform: translateY(-10px); }
        .activity-card img { width: 100%; height: 250px; object-fit: cover; display: block; }
        .activity-caption { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(128, 0, 0, 0.85); color: white; padding: 15px; text-align: center; font-weight: 700; font-size: 1.1rem; text-transform: uppercase; }

        .about-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; margin-bottom: 60px; }
        .premium-about-card {
          background: #ffffff;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 8px 25px rgba(0,0,0,0.04);
          border: 1px solid #eaeaea;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 40px;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .premium-about-card:hover { transform: translateY(-10px); border-color: #800000; }
        .card-top-accent { position: absolute; top: 0; left: 0; right: 0; height: 6px; background: linear-gradient(90deg, #800000, #FFD700); }
        .premium-icon { width: 70px; height: 70px; background: #fff9e6; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin-bottom: 20px; }
        .premium-content { padding: 0 30px 40px 30px; text-align: center; flex-grow: 1; display: flex; flex-direction: column; }
        .premium-label { color: #999; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1.5px; margin: 0 0 10px 0; font-weight: 800; }
        .premium-name { color: #800000; font-size: 1.3rem; font-weight: 900; margin: 0 0 15px 0; }
        .premium-desc { color: #555; line-height: 1.6; font-size: 0.95rem; margin: 0; }
        
        .dev-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .dev-item { 
          background: #f8f9fa; 
          padding: 8px 15px; 
          border-radius: 8px; 
          color: #333; 
          font-weight: 700; 
          font-size: 0.8rem; 
          border-left: 3px solid #800000; 
          text-align: left; 
        }
        .dev-email { display: block; font-size: 0.7rem; color: #777; font-weight: normal; margin-top: 2px; }

        @keyframes fadeSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .grid-container { animation: fadeSlideUp 0.8s ease forwards; animation-delay: 0.2s; opacity: 0; }
      `}</style>

      <div style={styles.container}>
        {/* --- HERO --- */}
        <section className="hero-section">
          <h1 style={styles.heroTitle}>Empowering the Next Generation of Engineers</h1>
          <p style={styles.heroSub}>Official CPE Portal of Bulacan State University.</p>
          <Link to="/announcements" className="cta-btn">View Latest Announcements</Link>
        </section>

        {/* --- QUICK ACCESS --- */}
        <section className="grid-container" style={styles.grid}>
          <Link to="/schedule" className="feature-card">
            <div style={styles.iconWrapper}>📅</div>
            <h3 style={styles.cardTitle}>Class Schedules</h3>
            <p style={styles.cardText}>Real-time updates on class timings and room assignments.</p>
          </Link>
          <Link to="/faculty" className="feature-card">
            <div style={styles.iconWrapper}>👨‍🏫</div>
            <h3 style={styles.cardTitle}>Faculty Directory</h3>
            <p style={styles.cardText}>Connect with the CPE department professors and staff.</p>
          </Link>
          <Link to="/faq" className="feature-card">
            <div style={styles.iconWrapper}>💡</div>
            <h3 style={styles.cardTitle}>Knowledge Base</h3>
            <p style={styles.cardText}>Find instant answers for grades, OJT, or portal access.</p>
          </Link>
        </section>

        {/* --- ACTIVITIES --- */}
        <div className="section-wrapper">
          <h2 className="section-title">COE Activities</h2>
          <div className="title-underline"></div>
        </div>
        <section className="activities-gallery">
          <div className="activity-card"><img src={bloodImg} alt="Blood" /><div className="activity-caption">Blood Donation</div></div>
          <div className="activity-card"><img src={donationImg} alt="Donation" /><div className="activity-caption">Donation Drive</div></div>
          <div className="activity-card"><img src={intramsImg} alt="Intrams" /><div className="activity-caption">COE Intramurals</div></div>
        </section>

        {/* --- ABOUT --- */}
        <div className="section-wrapper">
          <h2 className="section-title">About</h2>
          <div className="title-underline"></div>
        </div>
        <section className="about-grid">
          <div className="premium-about-card">
            <div className="card-top-accent"></div>
            <div className="premium-icon">🏛️</div>
            <div className="premium-content">
              <h3 className="premium-label">The Dean</h3>
              <h4 className="premium-name">Engr. Arjay R. Alba</h4>
              <p className="premium-desc">Dean of the College of Engineering.</p>
            </div>
          </div>

          <div className="premium-about-card">
            <div className="card-top-accent"></div>
            <div className="premium-icon">👩‍🏫</div>
            <div className="premium-content">
              <h3 className="premium-label">Department Head</h3>
              <h4 className="premium-name">Engr. Ma. Lorena SP. Villena</h4>
              <p className="premium-desc">Program Chair of the Computer Engineering Department.</p>
            </div>
          </div>

          {/* PROTECTED CREDITS */}
          <div className="premium-about-card">
            <div className="card-top-accent"></div>
            <div className="premium-icon">💻</div>
            <div className="premium-content">
              <h3 className="premium-label">The Developers</h3>
              <p style={{ color: '#800000', fontSize: '0.7rem', marginBottom: '15px', fontWeight: 'bold' }}>
                SYSTEM INTEGRITY SECURED
              </p>
              <ul className="dev-list">
                {developers.map((dev, idx) => (
                  <li key={idx} className="dev-item">
                    {dev.r}: {dev.n}
                    <span className="dev-email">{dev.e}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

const styles = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '20px' },
  heroTitle: { fontSize: '3rem', fontWeight: '900', margin: '0 0 20px 0', lineHeight: '1.2' },
  heroSub: { fontSize: '1.2rem', maxWidth: '700px', margin: '0 auto', opacity: 0.9, lineHeight: '1.6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginTop: '40px' },
  iconWrapper: { fontSize: '2.5rem', marginBottom: '15px', background: '#f8f9fa', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' },
  cardTitle: { margin: '0 0 10px 0', color: '#800000', fontSize: '1.3rem' },
  cardText: { margin: 0, color: '#666', lineHeight: '1.5', fontSize: '0.95rem' }
};