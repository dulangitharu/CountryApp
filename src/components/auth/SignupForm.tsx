import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export default function SignupForm() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signup } = useAuth();
  const { lastSearch } = useTheme();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('SignupForm: Submitting signup - name:', formData.name, 'password:', formData.password);
    if (!agreeTerms) {
      setError('Please agree to the Terms & Conditions');
      console.log('SignupForm: Failed - Terms not agreed');
      return;
    }
    const success = signup(formData.name, formData.password);
    if (success) {
      setError('');
      console.log('SignupForm: Signup successful, navigating to /signin');
      navigate('/signin');
    } else {
      setError('Username already exists');
      console.log('SignupForm: Signup failed - Username already exists');
    }
  };

  const handleSignInClick = () => {
    navigate('/signin');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 shadow-xl shadow-purple-500/20 w-full max-w-md">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Sign Up</h2>
        {lastSearch && (
          <div className="mb-6 p-4 bg-gray-100 rounded-xl">
            <p className="text-lg text-gray-700">
              <span className="font-semibold text-gray-900">Last Search:</span> {lastSearch}
            </p>
          </div>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <User className="absolute inset-y-0 left-0 pl-4 flex items-center text-purple-500 h-5 w-5" />
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              required
            />
          </div>
          <div className="relative">
            <Mail className="absolute inset-y-0 left-0 pl-4 flex items-center text-purple-500 h-5 w-5" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-12 pr-4 py-3 rounded-full bg-white border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute inset-y-0 left-0 pl-4 flex items-center text-purple-500 h-5 w-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-12 pr-10 py-3 rounded-full bg-white border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-purple-500"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="h-4 w-4 border-gray-300 data-[state=checked]:bg-purple-500 rounded"
              required
            />
            <label className="text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="text-purple-600 hover:text-purple-700">
                Terms & Conditions
              </a>
            </label>
          </div>
          <button
            type="submit"
            className="w-full py-4 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold text-lg hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Create Account
          </button>
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <a href="#" onClick={handleSignInClick} className="text-purple-600 hover:text-purple-700">
              Sign In
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}