import { useState } from 'react';
import { login, register } from '../auth'; // Ensure these are exported from auth.js
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isRegistering) {
        // Step 1: Logic to create account and set 'student' role in Firestore
        await register(email, password, 'student'); 
      } else {
        await login(email, password);
      }
      navigate('/'); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2 style={{ margin: 0, color: '#800000' }}>
            {isRegistering ? 'Create Student Account' : 'CCE Portal Login'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>
            {isRegistering ? 'Sign up to access student services' : 'Authorized Personnel & Students'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          {error && <div style={styles.error}>{error}</div>}
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              required 
              style={styles.input}
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              required 
              style={styles.input}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" style={styles.button}>
            {isRegistering ? 'Register Now' : 'Sign In'}
          </button>
        </form>

        {/* THE MISSING TOGGLE BUTTON */}
        <div style={styles.footer}>
          <p style={{ fontSize: '0.9rem', color: '#555' }}>
            {isRegistering ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => setIsRegistering(!isRegistering)} 
              style={styles.toggleBtn}
            >
              {isRegistering ? 'Login here' : 'Register as Student'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8F9FA' },
  card: { width: '100%', maxWidth: '400px', padding: '40px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center' },
  header: { marginBottom: '30px' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { textAlign: 'left' },
  label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '8px' },
  input: { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  button: { padding: '12px', background: '#800000', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.3s' },
  error: { color: '#d63031', background: '#ff767522', padding: '10px', borderRadius: '6px', fontSize: '0.85rem' },
  footer: { marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' },
  toggleBtn: { background: 'none', border: 'none', color: '#800000', fontWeight: 'bold', cursor: 'pointer', marginLeft: '5px', textDecoration: 'underline' }
};