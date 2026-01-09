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
          fontSize: '2.2rem',
          background: 'linear-gradient(135deg, #ff4e50, #ff6b35, #ffd700, #6bcf7f, #4ecdc4, #45b7d1)',
          backgroundSize: '300% 300%',
          animation: 'gradientText 4s ease infinite',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center',
          marginBottom: '20px'
        }}>
          The Arena
        </h1>
        
        {user && (
          <div className="user-info" style={{ marginTop: '20px' }}>
            <p>
              Playing as: <span className="user-email">
                {user.is_guest ? 'Wandering Adventurer' : user.email}
              </span>
            </p>
            {user.is_guest && <span className="user-badge">Guest</span>}
          </div>
        )}

        <div style={{
          marginTop: '40px',
          padding: '30px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9), rgba(240, 248, 255, 0.95))',
          borderRadius: '12px',
          border: '2px solid rgba(107, 207, 127, 0.6)',
          boxShadow: '0 0 30px rgba(107, 207, 127, 0.3)'
        }}>
          <h2 style={{
            background: 'linear-gradient(135deg, #4ecdc4, #6bcf7f, #ffd700)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '16px',
            fontSize: '1.6rem'
          }}>
            Your Quest Awaits
          </h2>
          <p style={{ color: '#4a4a4a', lineHeight: '1.8', fontSize: '1.05rem', fontWeight: '500' }}>
            The realm is yours to explore. Battle mythical creatures, 
            discover ancient spells, and forge your legend in this 
            mystical 2D adventure through magical landscapes.
          </p>
          <p style={{ color: '#4ecdc4', marginTop: '20px', fontSize: '0.95rem', fontWeight: '600' }}>
            Real-time battles via WebSocket at <code style={{
              background: 'rgba(107, 207, 127, 0.3)',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#45b7d1',
              fontWeight: '700'
            }}>/ws</code>
          </p>
          <p style={{ color: '#6bcf7f', marginTop: '16px', fontStyle: 'italic', fontWeight: '600' }}>
            The game world is being forged... Stay tuned, brave adventurer!
          </p>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <Link to="/" className="button button-secondary">
            Return to Realm Gate
          </Link>
        </div>
      </div>
    </div>
  );
}
