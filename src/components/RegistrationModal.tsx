import React, { useState } from 'react';
import { Tournament, User, Registration, Team, TeamMember } from '../types';
import { X, Upload, CheckCircle, ShieldAlert, LogIn, UserPlus, Copy, Check, Users, DollarSign, Crown } from 'lucide-react';
import { SupabaseService } from '../lib/supabaseService';
import { getSupabaseErrorMessage } from '../lib/supabaseService';

interface RegistrationModalProps {
  tournament: Tournament | null;
  currentUser: User | null;
  existingRegistrations?: Registration[];
  teams?: Team[];
  teamMembers?: TeamMember[];
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenSignUp: () => void;
  onSubmitRegistration: (data: {
    tournamentId: string;
    gameName: string;
    freeFireId: string;
    whatsapp: string;
    paymentScreenshot?: string;
    teamName?: string;
    teamCode?: string;
    registrationType: 'CREATE_TEAM' | 'JOIN_TEAM' | 'SOLO';
  }) => void | Promise<void>;
  onRegistrationError?: (message: string) => void;
  onNavigateToDashboard?: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  tournament,
  currentUser,
  existingRegistrations = [],
  teams = [],
  teamMembers = [],
  onClose,
  onOpenLogin,
  onOpenSignUp,
  onSubmitRegistration,
  onNavigateToDashboard,
  onRegistrationError,
}) => {
  // Option choice for Duo/Squad: 'CREATE_TEAM' or 'JOIN_TEAM' or null (requires explicit selection)
  const [registrationOption, setRegistrationOption] = useState<'CREATE_TEAM' | 'JOIN_TEAM' | null>(null);
  const [gameName, setGameName] = useState('');
  const [freeFireId, setFreeFireId] = useState('');
  const [whatsapp, setWhatsapp] = useState(currentUser?.whatsapp || '');
  const [teamName, setTeamName] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [paymentScreenshot, setPaymentScreenshot] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [createdTeamCode, setCreatedTeamCode] = useState<string | null>(null);
  const [joinedTeamDetails, setJoinedTeamDetails] = useState<{ teamName: string; teamCode: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const submitRegistration = async (data: Parameters<RegistrationModalProps['onSubmitRegistration']>[0]): Promise<boolean> => {
    try {
      await onSubmitRegistration(data);
      return true;
    } catch (error) {
      const message = getSupabaseErrorMessage(error, 'Registration failed. Please try again.');
      setErrorMsg(message);
      onRegistrationError?.(message);
      return false;
    }
  };

  if (!tournament) return null;

  const isDuoOrSquad = tournament.type === 'DUO' || tournament.type === 'SQUAD';
  const isPaid = tournament.feeType === 'PAID' || tournament.entryFee > 0;

  const existingUserRegistration = currentUser
    ? existingRegistrations.find((r) => r.tournamentId === tournament.id && r.userId === currentUser.id)
    : undefined;

  const existingTeam = existingUserRegistration
    ? teams.find(
        (t) =>
          t.id === existingUserRegistration.teamId ||
          (t.tournamentId === tournament.id &&
            (t.captainId === currentUser?.id ||
              teamMembers.some((tm) => tm.teamId === t.id && tm.userId === currentUser?.id)))
      )
    : undefined;

  const isCaptain = existingTeam && currentUser ? existingTeam.captainId === currentUser.id : false;
  const canViewTeamCode = !isPaid || existingUserRegistration?.status === 'APPROVED';

  // Handle image drag & drop or selection fallback
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const publicUrl = await SupabaseService.uploadImage('payments', file);
        setPaymentScreenshot(publicUrl);
      } catch (err) {
        console.error('Error uploading payment screenshot:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSampleReceipt = () => {
    setPaymentScreenshot(
      'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80'
    );
  };

  const generateRandomTeamCode = (type: 'DUO' | 'SQUAD') => {
    const prefix = type === 'DUO' ? 'DUO' : 'SQ';
    const randNum = Math.floor(10000 + Math.random() * 90000);
    return `${prefix}-${randNum}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedGameName = gameName.trim();
    const trimmedFFId = freeFireId.trim();
    const trimmedWhatsapp = whatsapp.trim();
    const trimmedTeamName = teamName.trim();
    const trimmedTeamCode = teamCode.trim().toUpperCase();

    if (!trimmedGameName || !trimmedFFId || !trimmedWhatsapp) {
      setErrorMsg('Please fill in all required game and contact details.');
      return;
    }

    // 1. Duplicate Free Fire UID Validation for this tournament
    const isDuplicateFFId = existingRegistrations.some(
      (r) => r.tournamentId === tournament.id && r.freeFireId.toLowerCase() === trimmedFFId.toLowerCase()
    );
    if (isDuplicateFFId) {
      setErrorMsg(`Free Fire UID "${trimmedFFId}" is already registered for this tournament.`);
      return;
    }

    // 2. Duplicate WhatsApp Number Validation for this tournament
    const isDuplicateWhatsapp = existingRegistrations.some(
      (r) => r.tournamentId === tournament.id && r.whatsapp === trimmedWhatsapp
    );
    if (isDuplicateWhatsapp) {
      setErrorMsg(`WhatsApp number "${trimmedWhatsapp}" is already registered for this tournament.`);
      return;
    }

    // 3. Paid Tournament Screenshot Requirement (Only for Solo & Create Team Captains)
    if (isPaid && registrationOption !== 'JOIN_TEAM' && !paymentScreenshot) {
      setErrorMsg('Payment screenshot is required for paid tournaments. Please upload receipt screenshot.');
      return;
    }

    if (isDuoOrSquad) {
      if (!registrationOption) {
        setErrorMsg('Please select whether to Create Team or Join Team first.');
        return;
      }

      if (registrationOption === 'CREATE_TEAM') {
        // --- CREATE TEAM (CAPTAIN) ---
        if (!trimmedTeamName) {
          setErrorMsg('Please enter a Team Name to create a team.');
          return;
        }

        const generatedCode = generateRandomTeamCode(tournament.type as 'DUO' | 'SQUAD');

        const submitted = await submitRegistration({
          tournamentId: tournament.id,
          gameName: trimmedGameName,
          freeFireId: trimmedFFId,
          whatsapp: trimmedWhatsapp,
          paymentScreenshot: isPaid ? paymentScreenshot : undefined,
          teamName: trimmedTeamName,
          teamCode: generatedCode,
          registrationType: 'CREATE_TEAM',
        });
        // For paid tournaments, keep the code private until an admin confirms payment.
        if (submitted && !isPaid) setCreatedTeamCode(generatedCode);
      } else {
        // --- JOIN TEAM (MEMBER) ---
        if (!trimmedTeamCode) {
          setErrorMsg('Please enter a Team Code to join an existing team.');
          return;
        }

        // 4. Validate Team Code exists and belongs to this tournament
        const matchingCodeTeam = teams.find((t) => t.teamCode.toUpperCase() === trimmedTeamCode);
        if (!matchingCodeTeam) {
          setErrorMsg('Invalid Team Code. Please verify with your team captain.');
          return;
        }

        if (matchingCodeTeam.tournamentId !== tournament.id) {
          setErrorMsg(`This Team Code (${trimmedTeamCode}) belongs to a different tournament. Every tournament requires its own team code or registration!`);
          return;
        }

        const targetTeam = matchingCodeTeam;

        // 5. Validate Team Capacity (Duo = 2 players, Squad = 4 players)
        const currentMembers = teamMembers.filter((tm) => tm.teamId === targetTeam.id);
        const maxCapacity = tournament.type === 'DUO' ? 2 : 4;

        if (currentMembers.length >= maxCapacity) {
          setErrorMsg('Team is Full');
          return;
        }

        // 6. Check if UID is already in this squad
        const isUIDInSquad = currentMembers.some(
          (tm) => tm.freeFireId.toLowerCase() === trimmedFFId.toLowerCase()
        );
        if (isUIDInSquad) {
          setErrorMsg(`Free Fire UID "${trimmedFFId}" is already registered in this squad.`);
          return;
        }

        setJoinedTeamDetails({
          teamName: targetTeam.teamName,
          teamCode: targetTeam.teamCode,
        });

        await submitRegistration({
          tournamentId: tournament.id,
          gameName: trimmedGameName,
          freeFireId: trimmedFFId,
          whatsapp: trimmedWhatsapp,
          paymentScreenshot: undefined,
          teamCode: targetTeam.teamCode,
          registrationType: 'JOIN_TEAM',
        });
      }
    } else {
      // --- SOLO TOURNAMENT ---
      const submitted = await submitRegistration({
        tournamentId: tournament.id,
        gameName: trimmedGameName,
        freeFireId: trimmedFFId,
        whatsapp: trimmedWhatsapp,
        paymentScreenshot: isPaid ? paymentScreenshot : undefined,
        registrationType: 'SOLO',
      });
      if (submitted) onClose();
    }
  };

  const handleCopyCode = () => {
    if (createdTeamCode) {
      navigator.clipboard.writeText(createdTeamCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-[#11131b] border border-[#3b494b]/50 rounded-2xl shadow-2xl p-6 md:p-8 my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-[#b9cacb] hover:text-white bg-[#191b24] rounded-full hover:bg-[#282a32] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* TEAM CODE SUCCESS SCREEN FOR CAPTAIN */}
        {createdTeamCode ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-[#00f0ff]/10 text-[#00f0ff] rounded-full flex items-center justify-center mx-auto border border-[#00f0ff]/30">
              <Crown className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-display font-bold text-[#00f0ff] uppercase tracking-widest">
                TEAM CREATED • YOU ARE CAPTAIN
              </span>
              <h3 className="font-display font-extrabold text-2xl text-white uppercase italic mt-1">
                SQUAD CREATED!
              </h3>
              <p className="text-xs text-[#b9cacb] mt-2 max-w-md mx-auto">
                You are registered as Captain for <span className="text-white font-bold">{teamName}</span> in{' '}
                <span className="text-[#00f0ff] font-bold">{tournament.name}</span>.
              </p>
            </div>

            {/* Team Code Display Box */}
            <div className="bg-[#191b24] p-5 rounded-xl border-2 border-[#00f0ff]/50 space-y-3 max-w-md mx-auto">
              <span className="text-[10px] font-display font-bold text-[#b9cacb] uppercase tracking-widest block">
                YOUR UNIQUE TEAM CODE
              </span>
              <div className="font-mono text-3xl font-extrabold text-[#00f0ff] tracking-widest bg-[#0c0e16] py-3 px-4 rounded border border-[#3b494b]">
                {createdTeamCode}
              </div>
              <p className="text-[11px] text-[#b9cacb]">
                Share this code <span className="text-white font-bold">ONLY</span> with your teammates so they can select "Join Team" and enter this code.
              </p>
              <button
                onClick={handleCopyCode}
                className="w-full py-3 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase rounded flex items-center justify-center gap-2 cursor-pointer hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'TEAM CODE COPIED!' : 'COPY TEAM CODE'}</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#33343e] hover:bg-[#3b494b] text-white font-display font-bold text-xs uppercase rounded cursor-pointer"
            >
              Close & View Dashboard
            </button>
          </div>
        ) : joinedTeamDetails ? (
          /* SUCCESS SCREEN FOR MEMBER WHO JOINED */
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-display font-bold text-green-400 uppercase tracking-widest">
                JOINED TEAM SUCCESSFULLY
              </span>
              <h3 className="font-display font-extrabold text-2xl text-white uppercase italic mt-1">
                WELCOME TO THE SQUAD!
              </h3>
              <p className="text-xs text-[#b9cacb] mt-2 max-w-md mx-auto">
                You have successfully joined squad <span className="text-white font-bold">{joinedTeamDetails.teamName}</span> for{' '}
                <span className="text-[#00f0ff] font-bold">{tournament.name}</span>.
              </p>
            </div>

            <div className="bg-[#191b24] p-4 rounded-xl border border-green-500/30 space-y-2 max-w-md mx-auto text-xs text-[#b9cacb]">
              <p className="text-white font-bold">You are registered as a Team Member.</p>
              <p>Your team captain manages squad updates. Check your dashboard for match schedules!</p>
            </div>

            <button
              onClick={onClose}
              className="px-8 py-3 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase rounded cursor-pointer hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Close & View Dashboard
            </button>
          </div>
        ) : !currentUser ? (
          /* Public Visitor Restriction Check */
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 bg-[#00f0ff]/10 text-[#00f0ff] rounded-full flex items-center justify-center mx-auto border border-[#00f0ff]/30">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-display font-bold text-xl text-white uppercase">
                Account Required
              </h3>
              <p className="text-[#b9cacb] text-sm mt-2 max-w-md mx-auto">
                Please Sign Up or Login to register for a tournament. Public visitors must register a player account to verify Free Fire ID and manage tournament entries.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="px-6 py-3 bg-transparent text-[#00f0ff] border border-[#00f0ff] hover:bg-[#00f0ff]/10 font-display font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Login</span>
              </button>
              <button
                onClick={() => {
                  onClose();
                  onOpenSignUp();
                }}
                className="px-6 py-3 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Sign Up Now</span>
              </button>
            </div>
          </div>
        ) : existingUserRegistration ? (
          /* ALREADY REGISTERED VIEW */
          <div className="text-center py-6 space-y-5">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-500/40 shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <span className="text-[10px] font-display font-bold text-emerald-400 uppercase tracking-widest block">
                ENTRY RECORDED • ACTIVE REGISTRATION
              </span>
              <h3 className="font-display font-extrabold text-2xl text-white uppercase mt-1">
                YOU ARE ALREADY REGISTERED!
              </h3>
              <p className="text-xs text-[#b9cacb] mt-1 max-w-md mx-auto">
                You have already submitted an official registration for <span className="text-white font-bold">{tournament.name}</span>.
              </p>
            </div>

            <div className="bg-[#191b24] p-5 rounded-2xl border border-[#3b494b]/40 max-w-md mx-auto text-left space-y-3 text-xs">
              <div className="flex justify-between border-b border-[#3b494b]/30 pb-2">
                <span className="text-[#b9cacb]">Registered Nickname:</span>
                <span className="text-white font-mono font-bold">{existingUserRegistration.gameName}</span>
              </div>
              <div className="flex justify-between border-b border-[#3b494b]/30 pb-2">
                <span className="text-[#b9cacb]">Free Fire ID:</span>
                <span className="text-[#00f0ff] font-mono font-bold">{existingUserRegistration.freeFireId}</span>
              </div>
              <div className="flex justify-between border-b border-[#3b494b]/30 pb-2">
                <span className="text-[#b9cacb]">WhatsApp Contact:</span>
                <span className="text-white font-mono">{existingUserRegistration.whatsapp}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-[#b9cacb]">Approval Status:</span>
                <span
                  className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                    existingUserRegistration.status === 'APPROVED'
                      ? 'bg-green-950 text-green-400 border border-green-500/30'
                      : existingUserRegistration.status === 'REJECTED'
                      ? 'bg-red-950 text-red-400 border border-red-500/30'
                      : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {existingUserRegistration.status}
                </span>
              </div>
            </div>

            {/* TEAM CODE & CAPTAIN CARD IF REGISTERED IN A SQUAD/DUO */}
            {existingTeam && (
              <div className="bg-[#191b24] p-5 rounded-xl border-2 border-[#00f0ff]/50 space-y-3 max-w-md mx-auto text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full">
                  <Crown className="w-4 h-4 text-amber-400" />
                  <span className="text-[10px] font-display font-bold uppercase tracking-widest text-[#00f0ff]">
                    {isCaptain ? 'TEAM CREATED • YOU ARE CAPTAIN' : 'JOINED SQUAD MEMBER'}
                  </span>
                </div>

                <h4 className="font-display font-extrabold text-xl text-white uppercase italic">
                  {isCaptain ? 'SQUAD CREATED!' : 'SQUAD MEMBER'}
                </h4>

                <p className="text-xs text-[#b9cacb]">
                  You are registered as <span className="text-white font-bold">{isCaptain ? 'Captain' : 'Member'}</span> for{' '}
                  <span className="text-white font-bold">{existingTeam.teamName}</span> in{' '}
                  <span className="text-[#00f0ff] font-bold">{tournament.name}</span>.
                </p>

                {isCaptain && canViewTeamCode ? (
                  <div className="bg-[#0c0e16] p-4 rounded-xl border border-[#3b494b] space-y-2">
                    <span className="text-[10px] font-display font-bold text-[#b9cacb] uppercase tracking-widest block">
                      YOUR UNIQUE TEAM CODE
                    </span>
                    <div className="font-mono text-2xl md:text-3xl font-extrabold text-[#00f0ff] tracking-widest py-1">
                      {existingTeam.teamCode}
                    </div>
                    <p className="text-[11px] text-[#b9cacb]">
                      Share this code <span className="text-white font-bold">ONLY</span> with your teammates so they can select "Join Team" and enter this code.
                    </p>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(existingTeam.teamCode);
                        setCopiedCode(true);
                        setTimeout(() => setCopiedCode(false), 2000);
                      }}
                      className="w-full py-2.5 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase rounded flex items-center justify-center gap-2 cursor-pointer hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,240,255,0.3)] mt-2"
                    >
                      {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedCode ? 'TEAM CODE COPIED!' : 'COPY TEAM CODE'}</span>
                    </button>
                  </div>
                ) : isCaptain ? (
                  <div className="bg-amber-950/30 p-4 rounded-xl border border-amber-500/30 text-xs text-amber-200">
                    Your registration is awaiting payment approval. The Team Code will appear here after the admin confirms payment.
                  </div>
                ) : null}
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-[#33343e] text-[#b9cacb] hover:text-white font-display font-bold text-xs uppercase rounded cursor-pointer"
              >
                Close Window
              </button>
              {onNavigateToDashboard && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateToDashboard();
                  }}
                  className="px-6 py-3 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase rounded hover:shadow-[0_0_20px_rgba(0,240,255,0.4)] cursor-pointer"
                >
                  View in My Dashboard
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Logged In User Registration Form */
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-display font-bold text-[#00f0ff] uppercase tracking-widest flex items-center gap-1.5">
                <span>OFFICIAL ENTRY FORM</span>
                <span className={`px-2 py-0.5 text-[9px] rounded font-extrabold ${isPaid ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-green-500/20 text-green-400 border border-green-500/30'}`}>
                  {isPaid ? 'PAID TOURNAMENT' : 'FREE TOURNAMENT'}
                </span>
              </span>
              <h3 className="font-display font-extrabold text-2xl text-white uppercase mt-1">
                {tournament.name}
              </h3>
              <p className="text-xs text-[#b9cacb] mt-1">
                Format: <span className="text-white font-bold">{tournament.type} MODE</span> • Entry Fee:{' '}
                <span className="text-[#00f0ff] font-bold">
                  {!isPaid ? 'FREE ENTRY' : `$${tournament.entryFee}`}
                </span>
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-300 text-xs font-semibold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* REQUIREMENT 1 & 7: EXPLICIT CHOICE BETWEEN CREATE TEAM AND JOIN TEAM FOR DUO / SQUAD */}
              {isDuoOrSquad && registrationOption === null ? (
                <div className="bg-[#191b24] p-5 rounded-2xl border border-[#00f0ff]/30 space-y-4">
                  <div className="text-center">
                    <span className="text-[10px] font-display font-bold text-[#00f0ff] uppercase tracking-widest block">
                      STEP 1 OF 2 • SELECT REGISTRATION MODE
                    </span>
                    <h4 className="font-display font-extrabold text-lg text-white uppercase mt-0.5">
                      CREATE OR JOIN A SQUAD?
                    </h4>
                    <p className="text-xs text-[#b9cacb] mt-1">
                      Please select how you wish to register for this {tournament.type} tournament:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Option 1: Create Team */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationOption('CREATE_TEAM');
                        setErrorMsg('');
                      }}
                      className="p-4 rounded-xl border-2 border-[#3b494b]/60 hover:border-[#00f0ff] bg-[#0c0e16] hover:bg-[#111422] flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-md"
                    >
                      <div className="p-3 rounded-xl mb-2 bg-[#00f0ff]/10 text-[#00f0ff] group-hover:bg-[#00f0ff] group-hover:text-[#00363a] transition-colors border border-[#00f0ff]/30">
                        <Crown className="w-6 h-6" />
                      </div>
                      <span className="font-display font-extrabold text-sm text-white uppercase group-hover:text-[#00f0ff]">
                        Create Team
                      </span>
                      <span className="text-[10px] text-[#b9cacb] mt-1">
                        Register as <span className="text-amber-400 font-bold">Captain</span> & generate a Team Code
                      </span>
                    </button>

                    {/* Option 2: Join Team */}
                    <button
                      type="button"
                      onClick={() => {
                        setRegistrationOption('JOIN_TEAM');
                        setErrorMsg('');
                      }}
                      className="p-4 rounded-xl border-2 border-[#3b494b]/60 hover:border-[#00f0ff] bg-[#0c0e16] hover:bg-[#111422] flex flex-col items-center justify-center text-center transition-all cursor-pointer group shadow-md"
                    >
                      <div className="p-3 rounded-xl mb-2 bg-[#00f0ff]/10 text-[#00f0ff] group-hover:bg-[#00f0ff] group-hover:text-[#00363a] transition-colors border border-[#00f0ff]/30">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="font-display font-extrabold text-sm text-white uppercase group-hover:text-[#00f0ff]">
                        Join Team
                      </span>
                      <span className="text-[10px] text-[#b9cacb] mt-1">
                        Enter <span className="text-[#00f0ff] font-bold">Team Code</span> from your squad Captain
                      </span>
                    </button>
                  </div>
                </div>
              ) : isDuoOrSquad ? (
                <div className="flex items-center justify-between bg-[#191b24] p-3 rounded-xl border border-[#00f0ff]/40 mb-4">
                  <div className="flex items-center gap-2">
                    {registrationOption === 'CREATE_TEAM' ? (
                      <Crown className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Users className="w-4 h-4 text-[#00f0ff]" />
                    )}
                    <div>
                      <span className="text-[9px] font-display font-bold text-[#b9cacb] uppercase block leading-none">
                        MODE SELECTED:
                      </span>
                      <span className="text-xs font-display font-bold text-white uppercase">
                        {registrationOption === 'CREATE_TEAM' ? 'Create Team (Captain)' : 'Join Team (Member)'}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationOption(null);
                      setErrorMsg('');
                    }}
                    className="text-[11px] font-display font-bold text-[#00f0ff] hover:underline uppercase cursor-pointer"
                  >
                    ← Switch Mode
                  </button>
                </div>
              ) : null}

              {/* REQUIREMENT 2: IF CREATE TEAM IS SELECTED -> SHOW TEAM NAME */}
              {isDuoOrSquad && registrationOption === 'CREATE_TEAM' && (
                <div className="bg-[#191b24]/80 p-4 rounded-xl border border-[#00f0ff]/30 space-y-2">
                  <label className="block text-xs font-display font-bold text-[#00f0ff] uppercase">
                    Team Name (Captain) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Predators"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0c0e16] border border-[#00f0ff]/40 rounded-lg text-white font-bold text-sm focus:outline-none focus:border-[#00f0ff]"
                  />
                  <p className="text-[10px] text-[#b9cacb]">
                    You will be assigned as <span className="text-amber-400 font-bold">Team Captain</span>. A unique Team Code will be generated for your teammates.
                  </p>
                </div>
              )}

              {/* REQUIREMENT 3: IF JOIN TEAM IS SELECTED -> SHOW TEAM CODE INPUT, HIDE TEAM NAME */}
              {isDuoOrSquad && registrationOption === 'JOIN_TEAM' && (
                <div className="bg-[#191b24]/80 p-4 rounded-xl border border-[#00f0ff]/30 space-y-2">
                  <label className="block text-xs font-display font-bold text-[#00f0ff] uppercase">
                    Team Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SQ-58392 or DUO-10294"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 bg-[#0c0e16] border border-[#00f0ff]/40 rounded-lg text-white font-mono font-extrabold text-base tracking-widest uppercase focus:outline-none focus:border-[#00f0ff]"
                  />
                  <p className="text-[10px] text-[#b9cacb]">
                    Enter the Team Code provided by your squad captain to join their existing team.
                  </p>
                </div>
              )}

              {/* Game Nickname */}
              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Free Fire Game Nickname *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ApexOmarFF"
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* Free Fire ID */}
              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Free Fire Account ID (UID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 594830219"
                  value={freeFireId}
                  onChange={(e) => setFreeFireId(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
                  WhatsApp Contact Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +252 617624424"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
                />
              </div>

              {/* Free vs Paid Payment Section vs Join Team Exemption */}
              {registrationOption === 'JOIN_TEAM' ? (
                <div className="bg-[#0c0e16] p-4 rounded-xl border border-[#00f0ff]/30 space-y-1 text-center">
                  <span className="text-xs font-display font-bold text-[#00f0ff] uppercase flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-[#00f0ff]" />
                    <span>NO PAYMENT REQUIRED FOR TEAM MEMBERS</span>
                  </span>
                  <p className="text-[11px] text-[#b9cacb]">
                    Your Team Captain covers team entry fee. Simply enter your nickname, UID & Team Code to join!
                  </p>
                </div>
              ) : isPaid ? (
                <div className="bg-[#191b24] p-4 rounded-xl border border-amber-500/40 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-display font-bold text-white uppercase flex items-center gap-1.5">
                      <DollarSign className="w-4 h-4 text-amber-400" />
                      <span>Payment Instructions</span>
                    </span>
                    <span className="text-xs font-bold text-amber-400">
                      ${tournament.entryFee}
                    </span>
                  </div>

                  <div className="bg-[#0c0e16] p-3 rounded-lg border border-[#3b494b]/40 text-xs text-[#b9cacb] space-y-1">
                    <p className="font-semibold text-white">
                      Mobile Payment Number: <span className="text-[#00f0ff] font-mono font-bold text-sm">+252 617624424</span>
                    </p>
                    <p className="text-[11px]">
                      Send entry fee <span className="text-white font-bold">${tournament.entryFee}</span> via EVC Plus / Zaad / Sahal to <span className="text-white font-bold">+252 617624424</span>. Upload payment screenshot below.
                    </p>
                  </div>

                  {/* Screenshot Upload Input */}
                  <div>
                    <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-2">
                      Payment Screenshot Receipt *
                    </label>

                    {paymentScreenshot ? (
                      <div className="relative rounded-lg overflow-hidden border border-[#00f0ff] h-36">
                        <img
                          src={paymentScreenshot}
                          alt="Receipt preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setPaymentScreenshot('')}
                          className="absolute top-2 right-2 p-1 bg-black/70 hover:bg-black text-white rounded-full text-xs cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-[#3b494b] rounded-lg p-6 hover:border-[#00f0ff] transition-colors bg-[#0c0e16]/50">
                        <Upload className="w-8 h-8 text-[#00f0ff] mb-2" />
                        <p className="text-xs font-bold text-white mb-1">
                          Drag & Drop or Click to Upload Receipt
                        </p>
                        <p className="text-[10px] text-[#b9cacb]">PNG, JPG, WEBP up to 5MB</p>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={handleSampleReceipt}
                          className="mt-3 px-3 py-1 bg-[#33343e] hover:bg-[#3b494b] text-[10px] text-[#00f0ff] rounded font-display uppercase tracking-wider relative z-10 cursor-pointer"
                        >
                          Use Sample Demo Receipt
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-green-950/30 p-4 rounded-xl border border-green-500/30 space-y-1 text-center">
                  <span className="text-xs font-display font-bold text-green-400 uppercase block">
                    🎉 FREE TOURNAMENT ENTRY
                  </span>
                  <p className="text-[11px] text-[#b9cacb]">
                    No payment screenshot is required for this free tournament! You can register immediately.
                  </p>
                </div>
              )}

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isUploading}
                className="w-full py-4 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all cursor-pointer mt-4"
              >
                {isDuoOrSquad
                  ? registrationOption === 'CREATE_TEAM'
                    ? 'CREATE TEAM & REGISTER'
                    : 'JOIN TEAM & REGISTER'
                  : isPaid
                  ? 'SUBMIT PAID REGISTRATION'
                  : 'REGISTER FOR FREE NOW'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
