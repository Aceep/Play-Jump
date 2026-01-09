import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient, User } from '../api/client';

export default function Game() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (!apiClient.isAuthenticated()) {
      navigate('/');
      return;
    }

    try {
      const currentUser = await apiClient.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to get user:', error);
      apiClient.setToken(null);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="game-container">
        <h1 style={{
          fontSize: '2.5rem',
          background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          🏰 The Arena 🏰
        </h1>
        
        {user && (
          <div className="user-info" style={{ marginTop: '20px' }}>
            <p>
              Playing as: <span className="user-email">
                {user.is_guest ? '🧙 Wandering Mage' : `⭐ ${user.email}`}
              </span>
            </p>
            {user.is_guest && <span className="user-badge">🌟 Guest Adventurer</span>}
          </div>
        )}

        <div style={{
          marginTop: '40px',
          padding: '40px',
          background: 'linear-gradient(145deg, rgba(50, 20, 90, 0.6), rgba(30, 10, 60, 0.6))',
          borderRadius: '12px',
          border: '2px solid rgba(186, 85, 211, 0.3)',
          boxShadow: '0 0 30px rgba(138, 43, 226, 0.3)'
        }}>
          <h2 style={{
            background: 'linear-gradient(135deg, #ba55d3, #9370db)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            fontSize: '1.8rem'
          }}>
            🔮 Your Quest Awaits! 🔮
          </h2>
          <p style={{ color: '#c7b3e0', lineHeight: '1.8', fontSize: '1.1rem' }}>
            The realm is yours to explore. Battle mythical creatures 🐉, 
            discover ancient spells 📜, and forge your legend in this 
            mystical 2D adventure.
          </p>
          <p style={{ color: '#e6d5ff', marginTop: '20px', fontSize: '0.95rem' }}>
            ⚡ Real-time magic battles via WebSocket at <code style={{
              background: 'rgba(186, 85, 211, 0.2)',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#ffd700'
            }}>/ws</code>
          </p>
          <p style={{ color: '#ba55d3', marginTop: '16px', fontStyle: 'italic' }}>
            ✨ The game world is being enchanted... Stay tuned, brave adventurer!
          </p>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/" className="button button-secondary">
            🏠 Return to Realm Gate
          </Link>
        </div>
      </div>
    </div>
  );
}
