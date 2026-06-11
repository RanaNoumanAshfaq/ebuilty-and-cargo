import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, Loader2, User, Briefcase } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState('truck_owner');
  const [cnic, setCnic] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessRegNumber, setBusinessRegNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, role, name, cnic, phone, businessName, businessRegNumber);
      // After registration, redirect to home or a waiting page if approval needed
      navigate('/');
    } catch (err) {
      setError('Failed to create an account. ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] px-4 py-8">
      <div className="glass-card w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-2">
            Create Account
          </h2>
          <p className="text-gray-400">Join the E-CARGO-BILTY network</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <User size={18} />
              </div>
              <input
                type="text"
                required
                className="block w-full pl-10 pr-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                className="block w-full pl-10 pr-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Account Type</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                <Briefcase size={18} />
              </div>
              <select
                className="block w-full pl-10 pr-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white transition-colors appearance-none"
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="truck_owner" className="bg-dark-card">Truck Owner</option>
                <option value="transporter" className="bg-dark-card">Cargo Transporter</option>
                <option value="business" className="bg-dark-card">Business Owner</option>
                <option value="admin" className="bg-dark-card">Administrator</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">CNIC Number</label>
            <input
              type="text"
              required
              className="block w-full px-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
              placeholder="34101-XXXXXXX-X"
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
            <input
              type="text"
              required
              className="block w-full px-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
              placeholder="+92 300 XXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {(role === 'business' || role === 'transporter') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Business Name</label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
                  placeholder="ACME Corp"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Business NTN / Registration Number</label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
                  placeholder="NTN-1234567-8"
                  value={businessRegNumber}
                  onChange={(e) => setBusinessRegNumber(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  className="block w-full pl-10 pr-3 py-2 bg-dark-card/50 border border-white/10 rounded-lg focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue text-white placeholder-gray-500 transition-colors"
                  placeholder="••••••••"
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full btn-primary flex justify-center items-center mt-6"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-neon-blue hover:text-neon-purple transition-colors font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
