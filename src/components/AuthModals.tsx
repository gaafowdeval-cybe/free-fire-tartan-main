import React, { useState } from 'react';
import { User } from '../types';
import { X, LogIn, UserPlus } from 'lucide-react';
import { SupabaseService, getSupabaseErrorMessage } from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AuthModalsProps {
  isOpenLogin: boolean;
  isOpenSignUp: boolean;
  onCloseLogin: () => void;
  onCloseSignUp: () => void;
  onLoginSuccess: (user: User) => void;
  onSignUpSuccess: (newUser: User) => void;
  users: User[];
}

export const AuthModals: React.FC<AuthModalsProps> = ({
  isOpenLogin,
  isOpenSignUp,
  onCloseLogin,
  onCloseSignUp,
  onLoginSuccess,
  onSignUpSuccess,
  users,
}) => {
  // Login State
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sign Up State
  const [signUpFullName, setSignUpFullName] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpWhatsapp, setSignUpWhatsapp] = useState('');
  const [signUpError, setSignUpError] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);

  if (!isOpenLogin && !isOpenSignUp) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    if (isSupabaseConfigured) {
      const { user, error } = await SupabaseService.signIn(loginUsername.trim(), loginPassword);
      setIsLoggingIn(false);
      if (error || !user) {
        setLoginError(getSupabaseErrorMessage(error, 'Invalid credentials.'));
      } else {
        onLoginSuccess(user);
        onCloseLogin();
      }
    } else {
      // Local fallback
      setIsLoggingIn(false);
      const found = users.find(
        (u) =>
          u.username.toLowerCase() === loginUsername.trim().toLowerCase() &&
          u.password === loginPassword.trim()
      );

      if (found) {
        onLoginSuccess(found);
        onCloseLogin();
      } else {
        setLoginError('Invalid credentials. (Note: Supabase credentials can be set in .env)');
      }
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');

    if (!signUpFullName || !signUpUsername || !signUpPassword || !signUpWhatsapp) {
      setSignUpError('Please fill in all required fields.');
      return;
    }

    if (signUpPassword.length < 6) {
      setSignUpError('Password must contain at least 6 characters.');
      return;
    }

    if (!/^[a-zA-Z0-9_.-]{3,30}$/.test(signUpUsername.trim())) {
      setSignUpError('Username must be 3-30 characters and use only letters, numbers, dots, dashes, or underscores.');
      return;
    }

    setIsSigningUp(true);

    if (isSupabaseConfigured) {
      const { user, error } = await SupabaseService.signUp({
        password: signUpPassword,
        fullName: signUpFullName,
        username: signUpUsername.trim(),
        whatsapp: signUpWhatsapp,
      });

      setIsSigningUp(false);

      if (error) {
        setSignUpError(getSupabaseErrorMessage(error, 'Failed to register account.'));
      } else if (!user) {
        setSignUpError('Failed to register account. Please try again.');
      } else {
        onSignUpSuccess(user);
        onCloseSignUp();
      }
    } else {
      setIsSigningUp(false);
      const newUser: User = {
        id: `user-${Date.now()}`,
        fullName: signUpFullName,
        username: signUpUsername,
        password: signUpPassword,
        whatsapp: signUpWhatsapp,
        role: 'player',
        createdAt: new Date().toISOString(),
      };
      onSignUpSuccess(newUser);
      onCloseSignUp();
    }
  };

  return (
    <>
      {/* LOGIN MODAL */}
      {isOpenLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#11131b] border border-[#3b494b]/50 rounded-2xl shadow-2xl p-6 md:p-8 my-auto">
            <button
              onClick={onCloseLogin}
              className="absolute top-4 right-4 p-2 text-[#b9cacb] hover:text-white bg-[#191b24] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#00f0ff]/10 text-[#00f0ff] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#00f0ff]/30">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-white uppercase">
                PLAYER / ADMIN LOGIN
              </h3>
              <p className="text-xs text-[#b9cacb] mt-1">
                Enter your player username and password
              </p>
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-300 text-xs font-semibold">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Your username"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-4 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                {isLoggingIn ? 'AUTHENTICATING...' : 'SIGN IN WITH SUPABASE'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* SIGN UP MODAL */}
      {isOpenSignUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#11131b] border border-[#3b494b]/50 rounded-2xl shadow-2xl p-6 md:p-8 my-auto">
            <button
              onClick={onCloseSignUp}
              className="absolute top-4 right-4 p-2 text-[#b9cacb] hover:text-white bg-[#191b24] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-[#00f0ff]/10 text-[#00f0ff] rounded-full flex items-center justify-center mx-auto mb-2 border border-[#00f0ff]/30">
                <UserPlus className="w-6 h-6" />
              </div>
              <h3 className="font-display font-extrabold text-2xl text-white uppercase">
                REGISTER PLAYER ACCOUNT
              </h3>
              <p className="text-xs text-[#b9cacb] mt-1">
                Join the competitive Free Fire arena today
              </p>
            </div>

            {signUpError && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-300 text-xs font-semibold">
                {signUpError}
              </div>
            )}

            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Omar Said"
                  value={signUpFullName}
                  onChange={(e) => setSignUpFullName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Omar_Apex"
                  value={signUpUsername}
                  onChange={(e) => setSignUpUsername(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="+252612345678"
                  value={signUpWhatsapp}
                  onChange={(e) => setSignUpWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full py-4 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all cursor-pointer mt-2 disabled:opacity-50"
              >
                {isSigningUp ? 'REGISTERING...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          </div>
        </div>
      )}

    </>
  );
};
