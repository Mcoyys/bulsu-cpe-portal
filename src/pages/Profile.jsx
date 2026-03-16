import React, { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, auth } from '../firebase'; 

export default function Profile({ user }) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false); // Tracks if user made edits

  const [profileData, setProfileData] = useState({
    fullName: '',
    studentNo: '',
    course: 'Computer Engineering',
    yearLevel: '',
    contactNo: '',
    profilePic: '', 
    idImage: '',    
    signature: ''   
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // --- LOAD DATA ---
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setProfileData(prev => ({ ...prev, ...userSnap.data() }));
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  // --- TEXT INPUT HANDLER ---
  const handleInputChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setHasChanges(true);
  };

  // --- BASE64 IMAGE CONVERTER ---
  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1048487) {
      return alert("File is too large! Please use an image smaller than 1MB.");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData({ ...profileData, [field]: reader.result });
      setHasChanges(true);
    };
    reader.readAsDataURL(file);
  };

  // --- SAVE TO FIRESTORE ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, profileData);
      setHasChanges(false);
      alert("✅ Profile successfully updated!");
    } catch (err) {
      alert("Save failed: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- PASSWORD LOGIC ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) return alert("Passwords mismatch!");
    if (passwordData.newPassword.length < 6) return alert("Password must be at least 6 characters.");
    
    try {
      await updatePassword(auth.currentUser, passwordData.newPassword);
      setPasswordData({ newPassword: '', confirmPassword: '' });
      alert("🔒 Password updated successfully!");
    } catch (err) {
      alert("Security Notice: " + err.message);
    }
  };

  if (loading) return <div style={styles.loading}>Loading Student Profile...</div>;

  return (
    <div style={styles.container}>
      
      {/* Page Header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Account Settings</h1>
          <p style={styles.pageSubtitle}>Manage your academic profile and security preferences.</p>
        </div>
        {hasChanges && (
          <div style={styles.unsavedBadge}>⚠️ Unsaved Changes</div>
        )}
      </div>

      <div style={styles.grid}>
        
        {/* ================= LEFT COLUMN ================= */}
        <div style={styles.leftCol}>
          
          {/* PROFILE PICTURE CARD */}
          <div style={styles.card}>
            {/* Decorative Banner */}
            <div style={styles.cardBanner}></div>
            
            <div style={styles.avatarWrapper}>
              {profileData.profilePic ? (
                <img src={profileData.profilePic} alt="Profile" style={styles.avatarImg} />
              ) : (
                <div style={styles.avatarPlaceholder}>👤</div>
              )}
              
              {/* Professional Camera Icon Overlay */}
              <label style={styles.avatarUploadIcon}>
                📷
                <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'profilePic')} accept="image/*" />
              </label>
            </div>
            
            <div style={{ textAlign: 'center', marginTop: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#333', fontSize: '1.2rem' }}>
                {profileData.fullName || 'Student Name'}
              </h3>
              <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>{user?.email}</p>
            </div>
          </div>

          {/* SECURITY CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Security & Access</h3>
            </div>
            <form onSubmit={handlePasswordChange} style={{ padding: '20px' }}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>New Password</label>
                <input style={styles.input} type="password" placeholder="Min. 6 characters" value={passwordData.newPassword} onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })} required />
              </div>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Confirm Password</label>
                <input style={styles.input} type="password" placeholder="Retype password" value={passwordData.confirmPassword} onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} required />
              </div>
              <button type="submit" style={styles.outlineBtn}>Update Password</button>
            </form>
          </div>
        </div>

        {/* ================= RIGHT COLUMN ================= */}
        <div style={styles.rightCol}>
          
          {/* PERSONAL INFO CARD */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>Personal Information</h3>
            </div>
            
            <form onSubmit={handleSaveProfile} style={{ padding: '20px' }}>
              <div style={styles.formGrid}>
                
                <div style={styles.fullWidth}>
                  <label style={styles.label}>Full Legal Name</label>
                  <input style={styles.input} name="fullName" value={profileData.fullName} onChange={handleInputChange} placeholder="e.g. Daeniel McCain" required />
                </div>
                
                <div>
                  <label style={styles.label}>Student Number</label>
                  <input style={styles.input} name="studentNo" value={profileData.studentNo} onChange={handleInputChange} placeholder="e.g. 2022-12345" />
                </div>
                
                <div>
                  <label style={styles.label}>Contact Number</label>
                  <input style={styles.input} name="contactNo" value={profileData.contactNo} onChange={handleInputChange} placeholder="09XX-XXX-XXXX" />
                </div>
                
                <div>
                  <label style={styles.label}>Academic Program</label>
                  <input style={{...styles.input, background: '#f5f5f5', color: '#666', cursor: 'not-allowed'}} name="course" value={profileData.course} disabled />
                </div>
                
                <div>
                  <label style={styles.label}>Year Level</label>
                  <select style={styles.input} name="yearLevel" value={profileData.yearLevel} onChange={handleInputChange}>
                    <option value="">Select Year...</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              {/* SEPARATOR */}
              <div style={styles.separator}></div>

              {/* OFFICIAL DOCUMENTS */}
              <h3 style={{...styles.cardTitle, border: 'none', padding: 0, marginBottom: '15px'}}>Official Documents</h3>
              <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '20px' }}>Upload clear, well-lit images for portal verification.</p>
              
              <div style={styles.docGrid}>
                
                {/* ID UPLOAD */}
                <div>
                  <label style={styles.label}>School ID (Front)</label>
                  <label style={styles.docUploadZone}>
                    {profileData.idImage ? (
                      <img src={profileData.idImage} style={styles.docPreviewImg} alt="ID Preview" />
                    ) : (
                      <div style={styles.docUploadPrompt}>
                        <span style={{fontSize: '1.5rem'}}>🪪</span>
                        <span>Click to Upload ID</span>
                      </div>
                    )}
                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'idImage')} accept="image/*" />
                  </label>
                </div>

                {/* SIGNATURE UPLOAD */}
                <div>
                  <label style={styles.label}>E-Signature</label>
                  <label style={styles.docUploadZone}>
                    {profileData.signature ? (
                      <img src={profileData.signature} style={{...styles.docPreviewImg, objectFit: 'contain', padding: '10px'}} alt="Signature Preview" />
                    ) : (
                      <div style={styles.docUploadPrompt}>
                        <span style={{fontSize: '1.5rem'}}>✍️</span>
                        <span>Click to Upload Signature</span>
                      </div>
                    )}
                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleImageChange(e, 'signature')} accept="image/*" />
                  </label>
                </div>

              </div>

              {/* MAIN SAVE BUTTON */}
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="submit" style={styles.primaryBtn} disabled={isSaving}>
                  {isSaving ? 'Saving to Cloud...' : '💾 Save All Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Premium Styling ---
const styles = {
  container: { maxWidth: '1050px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter', sans-serif" },
  
  pageHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '30px', borderBottom: '2px solid #eee', paddingBottom: '20px' },
  pageTitle: { color: '#800000', fontWeight: '900', fontSize: '2rem', margin: '0 0 5px 0' },
  pageSubtitle: { color: '#666', margin: 0, fontSize: '0.95rem' },
  unsavedBadge: { background: '#fff3cd', color: '#856404', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #ffeeba' },
  
  grid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px' },
  leftCol: { display: 'flex', flexDirection: 'column', gap: '30px' },
  rightCol: { display: 'flex', flexDirection: 'column', gap: '30px' },
  
  card: { background: '#ffffff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden', border: '1px solid #f0f0f0' },
  cardHeader: { background: '#fafafa', padding: '15px 20px', borderBottom: '1px solid #eee' },
  cardTitle: { color: '#800000', margin: 0, fontSize: '1.1rem', fontWeight: '700' },
  
  // Profile Picture Banner & Avatar Styles
  cardBanner: { height: '100px', background: 'linear-gradient(135deg, #800000, #b30000)' },
  avatarWrapper: { position: 'relative', width: '130px', height: '130px', margin: '-65px auto 0 auto', display: 'flex', justifyContent: 'center' },
  avatarImg: { width: '130px', height: '130px', borderRadius: '50%', objectFit: 'cover', border: '4px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  avatarPlaceholder: { width: '130px', height: '130px', borderRadius: '50%', background: '#f0f0f0', border: '4px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  avatarUploadIcon: { position: 'absolute', bottom: '5px', right: '5px', background: '#FFD700', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.2)', transition: 'transform 0.2s', border: '2px solid white' },
  
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  fullWidth: { gridColumn: '1 / -1' },
  inputGroup: { marginBottom: '15px' },
  
  label: { display: 'block', fontSize: '0.8rem', fontWeight: '700', color: '#555', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '0.95rem', transition: 'border-color 0.3s', outline: 'none' },
  
  separator: { gridColumn: '1 / -1', height: '1px', background: '#eee', margin: '20px 0' },
  
  // Document Dropzone Styles
  docGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
  docUploadZone: { display: 'block', height: '140px', background: '#f8f9fa', border: '2px dashed #ccc', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s ease', position: 'relative' },
  docUploadPrompt: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', gap: '8px', fontSize: '0.85rem', fontWeight: '600' },
  docPreviewImg: { width: '100%', height: '100%', objectFit: 'cover' },
  
  // Buttons
  primaryBtn: { background: '#800000', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', transition: '0.3s', boxShadow: '0 4px 15px rgba(128,0,0,0.2)' },
  outlineBtn: { width: '100%', background: 'transparent', color: '#800000', border: '2px solid #800000', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  
  loading: { textAlign: 'center', padding: '100px', color: '#800000', fontWeight: '900', fontSize: '1.2rem' }
};

// Add subtle hover states using simple CSS injection
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  input:focus { border-color: #800000 !important; box-shadow: 0 0 0 3px rgba(128,0,0,0.1) !important; }
  label[style*="docUploadZone"]:hover { border-color: #800000 !important; background: #fffcfc !important; }
  button:hover { transform: translateY(-2px); opacity: 0.95; }
`;
document.head.appendChild(styleSheet);