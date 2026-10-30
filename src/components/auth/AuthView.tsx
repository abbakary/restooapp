import { Avatar } from '../common/Avatar';
import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  Delete, 
  UserCheck, 
  KeyRound, 
  UserPlus, 
  ChefHat, 
  Receipt, 
  ShieldCheck, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useErp } from '../../context/ErpContext';
import { UserRole, Employee } from '../../types/erp';

export const AuthView: React.FC = () => {
  const { 
    sites, 
    currentSite, 
    setCurrentSite, 
    employees, 
    loginWithPin, 
    loginWithCredentials, 
    registerUser,
    setViewMode
  } = useErp();

  const [authMode, setAuthMode] = useState<'pin' | 'credentials'>('pin');
  const [selectedSiteId, setSelectedSiteId] = useState<string>(currentSite.id);
  
  // PIN Keypad State
  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [successInfo, setSuccessInfo] = useState<{ name: string; siteName: string } | null>(null);
  const [lastTappedKey, setLastTappedKey] = useState<string | null>(null);

  // Username/Password & Register State
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [credError, setCredError] = useState<string | null>(null);

  // Register Fields
  const [regName, setRegName] = useState<string>('');
  const [regRole, setRegRole] = useState<UserRole>('Waiter');
  const [regPin, setRegPin] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');

  // Handle PIN input
  const handleKeypadPress = (val: string) => {
    setLastTappedKey(val);
    setTimeout(() => setLastTappedKey(null), 180);

    if (val === 'clear') {
      setEnteredPin('');
      setPinError(null);
      return;
    }
    if (val === 'backspace') {
      setEnteredPin(prev => prev.slice(0, -1));
      setPinError(null);
      return;
    }

    if (enteredPin.length < 4) {
      const nextPin = enteredPin + val;
      setEnteredPin(nextPin);
      setPinError(null);

      // Auto-submit when 4 digits reached
      if (nextPin.length === 4) {
        verifyPin(nextPin);
      }
    }
  };

  const verifyPin = (pinToTest: string) => {
    const matchedEmp = employees.find(e => e.pin === pinToTest);
    const assignedSite = matchedEmp ? sites.find(s => s.id === matchedEmp.siteId) : null;

    const res = loginWithPin(pinToTest, selectedSiteId);
    if (res.success) {
      setIsSuccess(true);
      if (matchedEmp && assignedSite) {
        setSuccessInfo({ name: matchedEmp.name, siteName: assignedSite.name });
      }
    } else {
      setPinError(res.message || 'Incorrect PIN code');
      // Gentle shake effect
      setTimeout(() => {
        setEnteredPin('');
      }, 700);
    }
  };

  // Listen to physical keyboard for convenient desktop/laptop entry
  useEffect(() => {
    if (authMode !== 'pin') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
        handleKeypadPress(e.key);
      } else if (e.key === 'Backspace') {
        handleKeypadPress('backspace');
      } else if (e.key === 'Escape') {
        handleKeypadPress('clear');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [authMode, enteredPin, selectedSiteId]);

  // Handle Credentials Login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);

    if (!username.trim()) {
      setCredError('Please enter your username or email.');
      return;
    }

    const res = loginWithCredentials(username, password, selectedSiteId);
    if (!res.success) {
      setCredError(res.message || 'Invalid username or password.');
    }
  };

  // Handle Staff Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);

    if (!regName.trim() || !username.trim() || !regPin.trim()) {
      setCredError('Please fill in Full Name, Username, and a 4-digit PIN.');
      return;
    }
    if (regPin.length !== 4 || !/^\d{4}$/.test(regPin)) {
      setCredError('PIN must be exactly 4 numeric digits.');
      return;
    }

    const res = registerUser({
      name: regName.trim(),
      username: username.trim(),
      password: password || 'password123',
      role: regRole,
      siteId: selectedSiteId,
      pin: regPin.trim(),
      email: regEmail.trim(),
      phone: regPhone.trim()
    });

    if (!res.success) {
      setCredError(res.message || 'Failed to register new account.');
    }
  };

  // Quick Demo Staff Persona Clicker
  const quickSelectStaff = (emp: Employee) => {
    const pin = emp.pin || '1234';
    setEnteredPin(pin);
    setSelectedSiteId(emp.siteId);
    verifyPin(pin);
  };

  // iPhone Keypad layout buttons
  const keypadButtons = [
    { num: '1', letters: '' },
    { num: '2', letters: 'A B C' },
    { num: '3', letters: 'D E F' },
    { num: '4', letters: 'G H I' },
    { num: '5', letters: 'J K L' },
    { num: '6', letters: 'M N O' },
    { num: '7', letters: 'P Q R S' },
    { num: '8', letters: 'T U V' },
    { num: '9', letters: 'W X Y Z' },
    { num: 'clear', letters: 'CLEAR', isSpecial: true },
    { num: '0', letters: '+' },
    { num: 'backspace', letters: 'DELETE', isSpecial: true }
  ];

  return (
    <div className="w-full max-w-full overflow-x-hidden min-h-[100dvh] bg-gradient-to-br from-slate-50 via-slate-100 to-emerald-50/40 flex flex-col items-center justify-center p-3 sm:p-6 lg:p-8 font-sans selection:bg-[#3cb371] selection:text-white">
      
      {/* Top Navigation Bar: Back to Landing Page */}
      <div className={`w-full max-w-md sm:max-w-xl ${authMode === 'pin' ? 'lg:max-w-4xl' : ''} flex items-center justify-between mb-4 px-1`}>
        <button
          type="button"
          onClick={() => setViewMode('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white/90 hover:bg-white px-3.5 py-1.5 rounded-xl border border-slate-200/90 shadow-2xs transition-all cursor-pointer hover:border-[#3cb371]"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#3cb371]" />
          <span><span className="hidden sm:inline">Back to Landing Page</span><span className="sm:hidden">Back</span></span>
        </button>

        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 bg-white/60 px-2.5 py-1 rounded-lg border border-slate-200/60">
          <Building2 className="w-3 h-3 text-[#3cb371]" />
          <span className="text-slate-700 font-semibold">{currentSite.city}</span>
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-5 sm:mb-7 [@media(max-height:900px)]:mb-3">
        <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-white shadow-xs border border-slate-200 mb-2.5 [@media(max-height:900px)]:hidden">
          <div className="w-6 h-6 rounded-md bg-[#163a2b] flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
            R
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">RestoERP Terminal</span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#3cb371] animate-pulse" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Restaurant Operating System
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto [@media(max-height:900px)]:hidden">
          Sign in or enter staff PIN to automatically open your designated branch and workspace station.
        </p>
      </div>

      {/* Main Auth Container */}
      <div className={`w-full max-w-md sm:max-w-xl ${authMode === 'pin' ? 'lg:max-w-4xl' : ''} bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden`}>
        
        {/* Branch / Operational Location Selector Bar */}
        <div className="bg-slate-50/90 border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <Building2 className="w-4 h-4 text-[#3cb371]" />
            <span className="hidden sm:inline">Operating Branch:</span>
          </div>
          <select
            value={selectedSiteId}
            onChange={(e) => {
              setSelectedSiteId(e.target.value);
              const found = sites.find(s => s.id === e.target.value);
              if (found) setCurrentSite(found);
            }}
            aria-label="Select Operating Branch"
            className="min-w-0 flex-1 sm:flex-none max-w-full text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-2xs hover:border-[#3cb371] focus:ring-2 focus:ring-[#3cb371]/30 focus:outline-hidden cursor-pointer"
          >
            {sites.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.city})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Switcher: iPhone PIN Keypad vs Username/Password */}
        <div className="flex border-b border-slate-100 p-1.5 bg-slate-100/60 m-3 sm:m-4 rounded-xl">
          <button
            type="button"
            onClick={() => {
              setAuthMode('pin');
              setCredError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'pin'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#3cb371]" />
            <span>Staff PIN Keypad</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode('credentials');
              setPinError(null);
            }}
            className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              authMode === 'credentials'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600" />
            <span>Username & Password</span>
          </button>
        </div>

        {/* TAB 1: Attractive iPhone Styled PIN Keypad */}
        {authMode === 'pin' && (
          <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center lg:items-stretch lg:grid lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-10">
          <div className="flex flex-col items-center">
            <div className="text-center mb-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#163a2b] mx-auto flex items-center justify-center mb-2 shadow-xs border border-emerald-100">
                <Lock className="w-5 h-5 text-[#3cb371]" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Enter Staff Passcode</h2>
              <p className="text-xs text-slate-400 mt-0.5">Enter your assigned 4-digit terminal PIN</p>
            </div>

            {/* iPhone Animated PIN Dots */}
            <div className={`flex items-center justify-center gap-4 my-3 py-2 px-6 rounded-2xl transition-all ${pinError ? 'bg-rose-50 animate-shake' : ''}`}>
              {[0, 1, 2, 3].map((idx) => {
                const filled = enteredPin.length > idx;
                return (
                  <div
                    key={idx}
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full transition-all duration-200 transform ${
                      filled 
                        ? 'bg-[#3cb371] scale-110 shadow-sm ring-4 ring-[#3cb371]/20' 
                        : 'border-2 border-slate-300 bg-white'
                    }`}
                  />
                );
              })}
            </div>

            {/* PIN Error Feedback */}
            {pinError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold mb-2 bg-rose-50/80 px-3 py-1 rounded-full border border-rose-200/60 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{pinError}</span>
              </div>
            )}

            {isSuccess && (
              <div className="flex flex-col items-center justify-center text-xs text-emerald-800 font-bold my-2 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-200 animate-in fade-in text-center w-full max-w-[280px]">
                <div className="flex items-center gap-1.5 text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5 text-[#3cb371]" />
                  <span>Passcode Accepted!</span>
                </div>
                {successInfo && (
                  <div className="text-xs text-emerald-800 font-medium mt-0.5">
                    Opening <strong className="font-bold underline">{successInfo.siteName}</strong>
                  </div>
                )}
              </div>
            )}

            {/* iPhone Styled Numeric Circular Keypad */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 my-2 max-w-[280px] sm:max-w-[320px]">
              {keypadButtons.map((btn) => {
                const isTapped = lastTappedKey === btn.num;

                if (btn.num === 'clear') {
                  return (
                    <button
                      key={btn.num}
                      type="button"
                      onClick={() => handleKeypadPress('clear')}
                      className="w-16 h-16 sm:w-20 sm:h-20 [@media(max-height:900px)]:sm:w-[4.25rem] [@media(max-height:900px)]:sm:h-[4.25rem] rounded-full flex flex-col items-center justify-center text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    >
                      <span>C</span>
                      <span className="text-2xs uppercase tracking-wider text-slate-400">Clear</span>
                    </button>
                  );
                }

                if (btn.num === 'backspace') {
                  return (
                    <button
                      key={btn.num}
                      type="button"
                      onClick={() => handleKeypadPress('backspace')}
                      className="w-16 h-16 sm:w-20 sm:h-20 [@media(max-height:900px)]:sm:w-[4.25rem] [@media(max-height:900px)]:sm:h-[4.25rem] rounded-full flex flex-col items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
                    >
                      <Delete className="w-5 h-5" />
                      <span className="text-2xs uppercase tracking-wider text-slate-400 mt-0.5">Delete</span>
                    </button>
                  );
                }

                return (
                  <button
                    key={btn.num}
                    type="button"
                    onClick={() => handleKeypadPress(btn.num)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 [@media(max-height:900px)]:sm:w-[4.25rem] [@media(max-height:900px)]:sm:h-[4.25rem] rounded-full flex flex-col items-center justify-center transition-all duration-100 cursor-pointer select-none border border-slate-200/60 ${
                      isTapped 
                        ? 'bg-[#3cb371] text-white scale-95 shadow-inner' 
                        : 'bg-slate-50/80 hover:bg-slate-100 text-slate-900 hover:border-slate-300 shadow-xs'
                    }`}
                  >
                    <span className="text-xl sm:text-2xl font-bold leading-none">{btn.num}</span>
                    {btn.letters && (
                      <span className={`text-2xs sm:text-2xs font-semibold tracking-widest mt-0.5 uppercase ${
                        isTapped ? 'text-white/80' : 'text-slate-400'
                      }`}>
                        {btn.letters}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

          </div>
            {/* Quick Demo Staff One-Tap Selection Bar */}
            <div className="w-full mt-4 pt-4 border-t border-slate-100 lg:mt-0 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-10">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Quick Staff Switcher (Demo Passcodes)</span>
                <span className="text-2xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono font-bold">Auto Branch Match</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-2 gap-2.5">
                {employees.slice(0, 10).map((emp) => {
                  const empSite = sites.find(s => s.id === emp.siteId);
                  return (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => quickSelectStaff(emp)}
                      className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/80 hover:border-[#3cb371] text-left transition-colors cursor-pointer group"
                    >
                      <Avatar name={emp.name} src={emp.avatarUrl} size={40} rounded="rounded-full" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#163a2b]">{emp.name}</div>
                        <div className="text-2xs text-slate-500 truncate flex items-center gap-1">
                          <span>{emp.role}</span>
                          <span className="font-mono text-[#3cb371] font-bold">· {emp.pin}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: Username & Password / Register New Account */}
        {authMode === 'credentials' && (
          <div className="p-4 sm:p-6">
            
            {/* Sub-toggle: Sign In vs Register */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {isRegisterMode ? 'Register New Staff Member' : 'Staff Account Sign In'}
                </h3>
                <p className="text-xs text-slate-400">
                  {isRegisterMode 
                    ? 'Create a new staff profile with role and 4-digit PIN' 
                    : 'Log in with standard username or email'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRegisterMode(!isRegisterMode);
                  setCredError(null);
                }}
                className="text-xs font-bold text-[#3cb371] hover:text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 cursor-pointer"
              >
                {isRegisterMode ? 'Back to Sign In' : '+ Register Staff'}
              </button>
            </div>

            {credError && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-semibold mb-4 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{credError}</span>
              </div>
            )}

            {!isRegisterMode ? (
              // Sign In Form
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username or Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. waiter.emmanuel or owner"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3cb371]/30 focus:border-[#3cb371] focus:outline-hidden"
                  />
                  <span className="text-2xs text-slate-400 mt-1 block">
                    Hint: Use <span className="font-mono font-bold text-slate-700">owner</span>, <span className="font-mono font-bold text-slate-700">waiter.emmanuel</span>, or <span className="font-mono font-bold text-slate-700">cashier.neema</span>
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password (default: password123)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-[#3cb371]/30 focus:border-[#3cb371] focus:outline-hidden pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#163a2b] hover:bg-[#1d4d38] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Sign In & Unlock Terminal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              // Staff Registration Form
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder="e.g. Amani Baraka"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#3cb371] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role * <span className="font-normal text-slate-500">(manager, finance &amp; owner accounts are created by HQ)</span></label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 font-bold focus:border-[#3cb371] focus:outline-hidden cursor-pointer"
                    >
                      <option value="Waiter">🍽️ Waiter (Floor & Handheld)</option>
                      <option value="Cashier">💳 Cashier (POS & Billing)</option>
                      <option value="Chef">🍳 Chef (KDS Preparation)</option>
                      
                      <option value="Storekeeper">📦 Storekeeper (Inventory)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Username *</label>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. amani.b"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#3cb371] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Set 4-Digit Passcode (PIN) *</label>
                    <input
                      type="text"
                      maxLength={4}
                      required
                      value={regPin}
                      onChange={(e) => setRegPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 4321"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 font-mono font-bold tracking-widest focus:border-[#3cb371] focus:outline-hidden text-center"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Default: password123"
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#3cb371] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      placeholder="+255 7..."
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:border-[#3cb371] focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#3cb371] hover:bg-[#2e8b57] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register & Open Terminal</span>
                </button>
              </form>
            )}

          </div>
        )}

      </div>

      {/* Terminal Safety & Hospitality Compliance Badge */}
      <div className="mt-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <ShieldCheck className="w-4 h-4 text-[#3cb371]" />
        <span>RestoERP Secure POS Engine · Role-Based Permissions Protected</span>
      </div>

    </div>
  );
};
