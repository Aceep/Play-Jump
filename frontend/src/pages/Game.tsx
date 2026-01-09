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
        <h1>🎮 Game Area</h1>
        
        {user && (
          <div className="user-info" style={{ marginTop: '20px' }}>
            <p>Playing as: <span className="user-email">{user.email || 'Guest User'}</span></p>
            {user.is_guest && <span className="user-badge">Guest</span>}
          </div>
        )}

        <div style={{ marginTop: '40px', padding: '40px', background: '#f8f9ff', borderRadius: '8px' }}>
          <h2 style={{ color: '#667eea', marginBottom: '16px' }}>Game Coming Soon!</h2>
          <p style={{ color: '#666', lineHeight: '1.6' }}>
            This is where the game will be implemented. The authentication system is ready,
            and you can now focus on building the actual game logic here.
          </p>
          <p style={{ color: '#666', marginTop: '16px' }}>
            WebSocket connection endpoint is prepared at <code>/ws</code> for real-time gameplay.
          </p>
        </div>

        <div style={{ marginTop: '30px' }}>
          <Link to="/" className="button button-secondary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
