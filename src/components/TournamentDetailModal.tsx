import React, { useState, useEffect } from 'react';
import { Tournament, Registration, Team, Match, User } from '../types';
import {
  X,
  Trophy,
  Users,
  Clock,
  Shield,
  FileText,
  Swords,
  Award,
  AlertCircle,
  Copy,
  Check,
  CheckCircle2,
} from 'lucide-react';

interface TournamentDetailModalProps {
  tournament: Tournament | null;
  currentUser?: User | null;
  onClose: () => void;
  onRegisterClick: (tournament: Tournament) => void;
  onOpenTeamCodeModal: (tournament: Tournament) => void;
  registrations: Registration[];
  teams: Team[];
  matches: Match[];
}

export const TournamentDetailModal: React.FC<TournamentDetailModalProps> = ({
  tournament,
  currentUser,
  onClose,
  onRegisterClick,
  onOpenTeamCodeModal,
  registrations,
  teams,
  matches,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'rules' | 'participants' | 'matches' | 'leaderboard'>('overview');
  const [seconds, setSeconds] = useState<number>(48);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev <= 0 ? 59 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!tournament) return null;

  const approvedRegs = registrations.filter(
    (r) => r.tournamentId === tournament.id && r.status === 'APPROVED'
  );
  const userRegistration = currentUser
    ? registrations.find((r) => r.tournamentId === tournament.id && r.userId === currentUser.id)
    : undefined;
  const tournamentTeams = teams.filter((t) => t.tournamentId === tournament.id);
  const tournamentMatches = matches.filter((m) => m.tournamentId === tournament.id);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-[#11131b] border border-[#3b494b]/50 rounded-2xl shadow-2xl my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2 text-[#b9cacb] hover:text-white bg-black/50 rounded-full hover:bg-black transition-colors cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Hero Header */}
        <div className="relative h-64 md:h-80 overflow-hidden">
          <img
            src={tournament.image}
            alt={tournament.name}
            className="w-full h-full object-cover filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11131b] via-[#11131b]/60 to-transparent"></div>

          <div className="absolute bottom-6 left-6 right-6 z-20">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="px-3 py-1 bg-[#00f0ff] text-[#00363a] font-display text-[10px] font-bold rounded-full uppercase">
                {tournament.status}
              </span>
              <span className="px-3 py-1 bg-[#33343e] text-[#b9cacb] font-display text-[10px] font-bold rounded-full uppercase border border-[#3b494b]">
                {tournament.type} MODE
              </span>
            </div>

            <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white uppercase italic tracking-wide drop-shadow-md">
              {tournament.name}
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-[10px] text-[#b9cacb] uppercase font-display">PRIZE POOL</p>
                <p className="font-display text-lg font-bold text-[#00f0ff]">
                  ${tournament.prizeMoney}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#b9cacb] uppercase font-display">ENTRY FEE</p>
                <p className="font-display text-lg font-bold text-white">
                  {tournament.entryFee === 0 ? 'FREE' : `$${tournament.entryFee}`}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#b9cacb] uppercase font-display">REGION</p>
                <p className="font-display text-lg font-bold text-white">
                  {tournament.region || 'Global'}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-[#b9cacb] uppercase font-display">START TIME</p>
                <p className="font-display text-lg font-bold text-[#00f0ff]">
                  {tournament.startTime}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-6">
            {/* Tabs Bar */}
            <div className="flex border-b border-[#3b494b]/30 overflow-x-auto whitespace-nowrap gap-6">
              {(['overview', 'rules', 'participants', 'matches', 'leaderboard'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 font-display font-bold text-xs uppercase transition-all cursor-pointer ${
                    activeTab === tab
                      ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]'
                      : 'text-[#b9cacb] hover:text-[#00f0ff]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 text-sm text-[#b9cacb] leading-relaxed">
                {userRegistration && (
                  <div className="bg-[#191b24] p-4 rounded-xl border border-emerald-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <span className="text-[10px] font-display font-bold text-emerald-400 uppercase tracking-widest block">
                          YOU ARE REGISTERED FOR THIS TOURNAMENT
                        </span>
                        <p className="text-xs font-bold text-white mt-0.5">
                          Game Nickname: <span className="text-[#00f0ff] font-mono">{userRegistration.gameName}</span> (FF ID: {userRegistration.freeFireId})
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                        userRegistration.status === 'APPROVED'
                          ? 'bg-green-950 text-green-400 border border-green-500/30'
                          : userRegistration.status === 'REJECTED'
                          ? 'bg-red-950 text-red-400 border border-red-500/30'
                          : 'bg-amber-950 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {userRegistration.status}
                    </span>
                  </div>
                )}

                <div>
                  <h3 className="font-display font-bold text-white text-base uppercase mb-2">
                    About The Tournament
                  </h3>
                  <p>
                    Welcome to {tournament.name}, the premier Free Fire showdown where top survival specialists compete for glory and cash rewards. Battle under high stakes where tactical rotations, team synergy, and weapon mastery emerge victorious.
                  </p>
                </div>

                {/* Registration Progress */}
                <div className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/30 space-y-2">
                  <div className="flex justify-between items-center text-xs font-display">
                    <span>SLOTS FILLED</span>
                    <span className="text-[#00f0ff] font-bold">
                      {approvedRegs.length} / {tournament.maxParticipants} PARTICIPANTS
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#33343e] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#00f0ff] shadow-[0_0_10px_#00f0ff]"
                      style={{
                        width: `${Math.min(
                          100,
                          (approvedRegs.length / tournament.maxParticipants) * 100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Bento Highlights */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/20">
                    <Clock className="w-6 h-6 text-[#00f0ff] mx-auto mb-1" />
                    <p className="font-display font-bold text-white text-sm">
                      {tournament.startTime}
                    </p>
                    <p className="text-[10px] text-[#b9cacb] uppercase">Start Time</p>
                  </div>
                  <div className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/20">
                    <Users className="w-6 h-6 text-[#00f0ff] mx-auto mb-1" />
                    <p className="font-display font-bold text-white text-sm">
                      {tournament.type} Mode
                    </p>
                    <p className="text-[10px] text-[#b9cacb] uppercase">Format</p>
                  </div>
                  <div className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/20">
                    <Trophy className="w-6 h-6 text-[#00f0ff] mx-auto mb-1" />
                    <p className="font-display font-bold text-white text-sm">Knockout</p>
                    <p className="text-[10px] text-[#b9cacb] uppercase">Elimination</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RULES */}
            {activeTab === 'rules' && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-white text-base uppercase">
                  Official Tournament Rules
                </h3>
                <div className="bg-[#191b24] p-5 rounded-xl border border-[#3b494b]/30 whitespace-pre-line text-sm text-[#b9cacb] leading-relaxed">
                  {tournament.rules}
                </div>
              </div>
            )}

            {/* TAB 3: PARTICIPANTS */}
            {activeTab === 'participants' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-display font-bold text-white text-base uppercase">
                    Approved Participants ({approvedRegs.length})
                  </h3>
                  {(tournament.type === 'DUO' || tournament.type === 'SQUAD') && (
                    <button
                      onClick={() => onOpenTeamCodeModal(tournament)}
                      className="px-3 py-1.5 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 rounded text-xs font-display font-bold hover:bg-[#00f0ff]/30 cursor-pointer"
                    >
                      Enter Team Code
                    </button>
                  )}
                </div>

                {tournament.type !== 'SOLO' && tournamentTeams.length > 0 && (
                  <div className="mb-6 space-y-3">
                    <h4 className="text-xs font-display font-bold text-[#00f0ff] uppercase">
                      Registered Teams
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tournamentTeams.map((t) => (
                        <div
                          key={t.id}
                          className="bg-[#191b24] p-3 rounded-lg border border-[#3b494b]/30 flex justify-between items-center"
                        >
                          <div>
                            <p className="font-bold text-white text-sm">{t.teamName}</p>
                            <p className="text-[10px] text-[#b9cacb]">
                              Code:{' '}
                              <span className="font-mono text-[#00f0ff]">{t.teamCode}</span>
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopyCode(t.teamCode)}
                            className="p-1.5 bg-[#33343e] hover:bg-[#3b494b] text-[#b9cacb] rounded text-xs cursor-pointer flex items-center gap-1"
                            title="Copy Code"
                          >
                            {copiedCode === t.teamCode ? (
                              <Check className="w-3.5 h-3.5 text-green-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {approvedRegs.length === 0 ? (
                  <p className="text-sm text-[#b9cacb] py-6 text-center">
                    No approved participants yet. Be the first to register!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {approvedRegs.map((reg) => (
                      <div
                        key={reg.id}
                        className="bg-[#191b24] p-3 rounded-lg border border-[#3b494b]/30 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded bg-[#00f0ff]/20 flex items-center justify-center font-bold text-[#00f0ff]">
                          {reg.gameName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{reg.gameName}</p>
                          <p className="text-xs text-[#00f0ff] font-mono">{reg.freeFireId}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: MATCHES */}
            {activeTab === 'matches' && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-white text-base uppercase">
                  Tournament Matches & Brackets
                </h3>
                {tournamentMatches.length === 0 ? (
                  <div className="p-8 text-center bg-[#191b24] rounded-xl border border-[#3b494b]/30">
                    <Swords className="w-10 h-10 text-[#00f0ff] mx-auto mb-2 opacity-50" />
                    <p className="text-sm text-[#b9cacb]">
                      Matches have not been generated yet. The admin will shuffle approved participants once registration closes.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tournamentMatches.map((m) => (
                      <div
                        key={m.id}
                        className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/30 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 text-right font-bold text-sm text-white">
                          {m.playerOrTeam1Name}
                        </div>
                        <div className="px-3 py-1 bg-[#33343e] rounded font-display text-xs text-[#00f0ff] font-bold">
                          VS
                        </div>
                        <div className="flex-1 text-left font-bold text-sm text-white">
                          {m.playerOrTeam2Name || (m.isBye ? 'BYE (Advances)' : 'TBD')}
                        </div>
                        {m.winnerId && (
                          <div className="text-xs font-bold text-green-400 bg-green-950/40 px-2.5 py-1 rounded border border-green-500/30">
                            Winner: {m.winnerId}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: LEADERBOARD */}
            {activeTab === 'leaderboard' && (
              <div className="space-y-4">
                <h3 className="font-display font-bold text-white text-base uppercase">
                  Leaderboard & Winners
                </h3>
                <div className="bg-[#191b24] p-6 rounded-xl border border-[#3b494b]/30 text-center">
                  <Award className="w-12 h-12 text-[#00f0ff] mx-auto mb-3" />
                  <p className="text-sm text-[#b9cacb]">
                    Winners will be announced here live upon completion of final matches.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA Box */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#191b24] p-6 rounded-xl border-2 border-[#00f0ff]/30 shadow-xl space-y-5">
              <div className="text-center space-y-2">
                <span className="text-xs text-[#b9cacb] uppercase font-bold tracking-widest">
                  Registration Countdown
                </span>
                <div className="flex justify-center gap-3 font-display">
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#00f0ff]">04</span>
                    <span className="block text-[10px] text-[#b9cacb]">HRS</span>
                  </div>
                  <span className="text-2xl text-[#00f0ff]">:</span>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#00f0ff]">22</span>
                    <span className="block text-[10px] text-[#b9cacb]">MIN</span>
                  </div>
                  <span className="text-2xl text-[#00f0ff]">:</span>
                  <div className="text-center">
                    <span className="text-2xl font-bold text-[#00f0ff]">
                      {seconds.toString().padStart(2, '0')}
                    </span>
                    <span className="block text-[10px] text-[#b9cacb]">SEC</span>
                  </div>
                </div>
              </div>

              <hr className="border-[#3b494b]/30" />

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#b9cacb]">Requirement</span>
                  <span className="font-bold text-white">Lvl 30+ Account</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9cacb]">Total Prize</span>
                  <span className="font-bold text-[#00f0ff]">${tournament.prizeMoney}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#b9cacb]">Slots Left</span>
                  <span className="font-bold text-orange-400">
                    {Math.max(0, tournament.maxParticipants - approvedRegs.length)} / {tournament.maxParticipants}
                  </span>
                </div>
              </div>

              {userRegistration ? (
                <button
                  onClick={() => onRegisterClick(tournament)}
                  className="w-full py-4 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-display font-bold text-xs uppercase tracking-wider rounded flex items-center justify-center gap-2 hover:bg-emerald-500/30 transition-all cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>ALREADY REGISTERED ({userRegistration.status})</span>
                </button>
              ) : tournament.status === 'OPEN REGISTRATION' ? (
                <button
                  onClick={() => onRegisterClick(tournament)}
                  className="w-full py-4 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all cursor-pointer"
                >
                  REGISTER NOW
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
