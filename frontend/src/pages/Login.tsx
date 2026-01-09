import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="card">
        <h1>Enter the Realm</h1>
        <p>Welcome back, brave adventurer! Login to continue your quest.</p>

        {error && <div className="error">{error}</div>}

        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="email">Mage Name (Email)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@realm.magic"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Secret Spell</label>
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
          </div>

          <button
            type="submit"
            className="button button-primary"
            disabled={loading}
          >
            {loading ? 'Entering...' : 'Enter Realm'}
          </button>
        </form>

        <p className="text-center" style={{ marginTop: '20px' }}>
          New to the realm?{' '}
          <Link to="/register" className="link">
            Create your legend
          </Link>
        </p>

        <p className="text-center" style={{ marginTop: '10px' }}>
          <Link to="/" className="link">
            Return to Gate
          </Link>
        </p>
      </div>
    </div>
  );
}
