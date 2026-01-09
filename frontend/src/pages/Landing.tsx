import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient, User } from '../api/client';

export default function Landing() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    if (apiClient.isAuthenticated()) {
      try {
        const currentUser = await apiClient.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to get user:', error);
        apiClient.setToken(null);
      }
    }
    setLoading(false);
  };

  const handlePlayAsGuest = async () => {
    try {
      setLoading(true);
      await apiClient.loginAsGuest();
      navigate('/game');
    } catch (error) {
      console.error('Failed to create guest session:', error);
      alert('Failed to create guest session. Please try again.');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleStartGame = () => {
    navigate('/game');
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
      <div className="card">
        <h1>Realm of Legends</h1>
        <p>Enter a world of magic, creatures, and endless adventure</p>

        {user ? (
          <>
            <div className="user-info">
              <p className="user-email">
                {user.is_guest ? 'Wandering Adventurer' : user.email}
              </p>
              {user.is_guest && (
                <span className="user-badge">Guest</span>
              )}
            </div>

            <div className="button-group">
              <button
                className="button button-primary"
                onClick={handleStartGame}
              >
                Begin Quest
              </button>
              <button
                className="button button-danger"
                onClick={handleLogout}
              >
                Leave Realm
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="button-group">
              <button
                className="button button-primary"
                onClick={handlePlayAsGuest}
              >
                Enter as Guest
              </button>
              <button
                className="button button-secondary"
                onClick={() => navigate('/login')}
              >
                Login to Realm
              </button>
              <button
                className="button button-secondary"
                onClick={() => navigate('/register')}
              >
                Create Legend
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
