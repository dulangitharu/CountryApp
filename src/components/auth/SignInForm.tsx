import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function SignInForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SignInForm: Submitting login - username:', username, 'password:', password);
    try {
      const success = await login(username, password);
      if (success) {
        setError('');
        console.log('SignInForm: Login successful, navigating to /countries');
        navigate('/countries', { replace: true });
      } else {
        setError('Invalid username or password');
        console.log('SignInForm: Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
      console.log('SignInForm: Login error:', err);
    }
  };

  const handleRegisterClick = () => {
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500">
      <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-8 shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-white text-center mb-8">Sign In</h2>
        {error && <p className="text-red-300 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-black/20 text-white placeholder-white/80 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:outline-none"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border-2 border-black/20 text-white placeholder-white/80 focus:ring-2 focus:ring-white/50 focus:border-white/50 focus:outline-none"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 border-black/30 data-[state=checked]:bg-blue-500 rounded"
              />
              <label className="ml-2 text-black font-medium">Remember me</label>
            </div>
            <a href="/forgot-password" className="text-black hover:text-black/80 p-0 h-auto">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-lg bg-black text-blue-400 font-bold text-lg hover:bg-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            LOGIN
          </button>
          <p className="mt-6 text-center text-white">
            Don't have an account?{' '}
            <a href="#" onClick={handleRegisterClick} className="hover:text-white/90">
              Register here
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}