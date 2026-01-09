import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      await apiClient.register({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>✨ Forge Your Legend ✨</h1>
        <p>Begin your journey in the realm of magic and mystery.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">⭐ Your Mage Name (Email)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="hero@realm.magic"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🗝️ Create Your Spell</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              minLength={8}
            />
            <small style={{ color: '#c7b3e0', fontSize: '0.85rem' }}>
              ✨ Minimum 8 characters for a strong spell
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">🔐 Confirm Your Spell</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="••••••••"
              disabled={loading}
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? '✨ Forging legend...' : '🌟 Begin Adventure'}
          </button>
        </form>

        <p className="text-center" style={{ marginTop: '20px' }}>
          Already a legend?{' '}
          <Link to="/login" className="link">
            🔮 Enter the realm
          </Link>
        </p>

        <p className="text-center" style={{ marginTop: '10px' }}>
          <Link to="/" className="link">
            🏰 Return to Gate
          </Link>
        </p>
      </div>
    </div>
  );
}
