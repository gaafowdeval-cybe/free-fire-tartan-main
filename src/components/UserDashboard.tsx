import React, { useState } from 'react';
import { User, Tournament, Registration, Team, TeamMember, Match } from '../types';
import { SupabaseService } from '../lib/supabaseService';
import {
  Trophy,
  Users,
  Gamepad2,
  Clock,
  Copy,
  Check,
  Shield,
  ArrowRight,
  Sparkles,
  Swords,
  CheckCircle2,
  Hourglass,
  XCircle,
  Camera,
  Lock,
} from 'lucide-react';

interface UserDashboardProps {
  currentUser: User;
  users?: User[];
  tournaments: Tournament[];
  registrations: Registration[];
  teams: Team[];
  teamMembers: TeamMember[];
  matches: Match[];
  onSelectTournament: (t: Tournament) => void;
  onOpenTeamCodeModal: (t: Tournament) => void;
  onUpdateProfileImage?: (image: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  users = [],
  tournaments,
  registrations,
  teams,
  teamMembers,
  matches,
  onSelectTournament,
  onOpenTeamCodeModal,
  onUpdateProfileImage,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const myRegistrations = registrations.filter((r) => r.userId === currentUser.id);
  const myTeamMemberships = teamMembers.filter((tm) => tm.userId === currentUser.id);
  const myTeamIds = myTeamMemberships.map((tm) => tm.teamId);
  const regTeamIds = myRegistrations.map((r) => r.teamId).filter(Boolean) as string[];
  const myTeams = teams.filter(
    (t) => myTeamIds.includes(t.id) || t.captainId === currentUser.id || regTeamIds.includes(t.id)
  );

  const approvedCount = myRegistrations.filter((r) => r.status === 'APPROVED').length;

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onUpdateProfileImage) {
      try {
        const publicUrl = await SupabaseService.uploadImage('avatars', file);
        onUpdateProfileImage(publicUrl);
      } catch (err) {
        console.error('Error uploading avatar:', err);
      }
    }
  };

  return (
    <div className="pt-24 pb-20 px-4 md:px-10 max-w-7xl mx-auto space-y-8">
      {/* Player Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-[#00f0ff]/30 relative overflow-hidden bg-gradient-to-r from-[#191b24] via-[#11131b] to-[#0c0e16]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#00f0ff]/10 blur-[100px] pointer-events-none rounded-full"></div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={
                  currentUser.profileImage ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=300'
                }
                alt={currentUser.fullName}
                className="w-16 h-16 rounded-xl object-cover border-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.4)]"
              />
              {onUpdateProfileImage && (
                <label className="absolute inset-0 bg-black/60 rounded-xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                  <Camera className="w-5 h-5 text-[#00f0ff]" />
                  <span className="text-[8px] font-bold uppercase mt-0.5">Edit</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <div>
              <span className="text-[10px] font-display font-bold text-[#00f0ff] uppercase tracking-widest">
                PLAYER DASHBOARD
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-extrabold text-white uppercase italic">
                WELCOME BACK, {currentUser.fullName.toUpperCase()}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-xs text-[#b9cacb]">
                  WhatsApp: <span className="text-white font-mono font-bold">{currentUser.whatsapp}</span>
                </p>
                {onUpdateProfileImage && (
                  <label className="text-[10px] font-display font-bold text-[#00f0ff] underline cursor-pointer hover:text-cyan-300">
                    Change Profile Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="bg-[#0c0e16]/80 p-4 rounded-xl border border-[#3b494b]/40 flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
            <div>
              <p className="text-[10px] text-[#b9cacb] uppercase font-display">NEXT MATCH ALERT</p>
              <p className="text-xs font-bold text-white">
                Vs Team Phoenix starts in <span className="text-[#00f0ff]">45 mins</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border-l-4 border-l-[#00f0ff] flex justify-between items-center">
          <div>
            <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase tracking-widest">
              MY TOURNAMENTS
            </p>
            <p className="font-display text-3xl font-extrabold text-white mt-1">
              {myRegistrations.length.toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-[#00f0ff] font-bold mt-1">
              {approvedCount} Confirmed Entries
            </p>
          </div>
          <div className="w-12 h-12 bg-[#00f0ff]/10 rounded-xl flex items-center justify-center text-[#00f0ff]">
            <Gamepad2 className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-l-4 border-l-purple-500 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase tracking-widest">
              ACTIVE SQUADS
            </p>
            <p className="font-display text-3xl font-extrabold text-white mt-1">
              {myTeams.length.toString().padStart(2, '0')}
            </p>
            <p className="text-xs text-purple-400 font-bold mt-1">Duo & Squad Rosters</p>
          </div>
          <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-l-4 border-l-amber-400 flex justify-between items-center">
          <div>
            <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase tracking-widest">
              TOTAL WINNINGS
            </p>
            <p className="font-display text-3xl font-extrabold text-amber-400 mt-1">$1,240</p>
            <p className="text-xs text-amber-300 font-bold mt-1">Cash Prizes Claimed</p>
          </div>
          <div className="w-12 h-12 bg-amber-400/10 rounded-xl flex items-center justify-center text-amber-400">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Registrations + Team Codes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: My Registrations */}
        <div className="lg:col-span-8 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30">
            <h3 className="font-display font-extrabold text-lg text-white uppercase mb-4 flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-[#00f0ff]" />
              <span>MY TOURNAMENT REGISTRATIONS</span>
            </h3>

            {myRegistrations.length === 0 ? (
              <div className="text-center py-10 text-[#b9cacb] space-y-3">
                <p>You haven't registered for any tournaments yet.</p>
                <button
                  onClick={() => onSelectTournament(tournaments[0])}
                  className="px-6 py-2.5 bg-[#00f0ff] text-[#00363a] font-display text-xs font-bold uppercase rounded cursor-pointer"
                >
                  Browse Tournaments
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {myRegistrations.map((reg) => {
                  const t = tournaments.find((tour) => tour.id === reg.tournamentId);
                  return (
                    <div
                      key={reg.id}
                      className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-[#00f0ff]/40 transition-all"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-display font-bold text-white text-base">
                            {t?.name || 'Free Fire Tournament'}
                          </span>
                          <span className="px-2 py-0.5 bg-[#33343e] text-[#00f0ff] font-display text-[10px] font-bold rounded">
                            {t?.type}
                          </span>
                        </div>
                        <p className="text-xs text-[#b9cacb]">
                          Nickname: <span className="text-white font-mono">{reg.gameName}</span> •
                          FF ID: <span className="text-white font-mono">{reg.freeFireId}</span>
                        </p>
                      </div>

                      {/* Status Tag */}
                      <div className="flex items-center gap-3">
                        {reg.status === 'APPROVED' && (
                          <span className="px-3 py-1 bg-green-950/60 text-green-400 border border-green-500/30 font-display text-xs font-bold rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            CONFIRMED
                          </span>
                        )}
                        {reg.status === 'PENDING' && (
                          <span className="px-3 py-1 bg-yellow-950/60 text-yellow-400 border border-yellow-500/30 font-display text-xs font-bold rounded-full flex items-center gap-1">
                            <Hourglass className="w-3.5 h-3.5 animate-spin" />
                            VERIFYING PAYMENT
                          </span>
                        )}
                        {reg.status === 'REJECTED' && (
                          <span className="px-3 py-1 bg-red-950/60 text-red-400 border border-red-500/30 font-display text-xs font-bold rounded-full flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            REJECTED
                          </span>
                        )}

                        {t && (
                          <button
                            onClick={() => onSelectTournament(t)}
                            className="px-3 py-1.5 bg-[#33343e] hover:bg-[#3b494b] text-white font-display text-xs font-bold rounded cursor-pointer"
                          >
                            Lobby
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: My Squads & Team Code Share */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-4">
            <h3 className="font-display font-extrabold text-base text-white uppercase flex items-center gap-2">
              <Users className="w-5 h-5 text-[#00f0ff]" />
              <span>SQUAD CODES & TEAMS</span>
            </h3>

            {myTeams.length === 0 ? (
              <p className="text-xs text-[#b9cacb] py-4">
                No active squad rosters found. Create or join a squad during Duo/Squad registration!
              </p>
            ) : (
              <div className="space-y-4">
                {myTeams.map((team) => {
                  const members = teamMembers.filter((tm) => tm.teamId === team.id);
                  const maxCapacity = team.teamType === 'DUO' ? 2 : 4;
                  const isCaptain = team.captainId === currentUser.id;
                  const tournament = tournaments.find((item) => item.id === team.tournamentId);
                  const captainRegistration = registrations.find(
                    (registration) => registration.userId === currentUser.id && registration.teamId === team.id
                  );
                  const canViewTeamCode =
                    tournament?.feeType !== 'PAID' && !tournament?.entryFee ||
                    captainRegistration?.status === 'APPROVED';

                  return (
                    <div
                      key={team.id}
                      className="bg-[#191b24] p-4 rounded-xl border border-[#00f0ff]/30 space-y-3"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-extrabold text-white text-base block">{team.teamName}</span>
                          <span className="text-[10px] text-[#b9cacb]">
                            Roster: <span className="text-[#00f0ff] font-bold">{members.length}/{maxCapacity} Players</span>
                          </span>
                        </div>
                        <span className="text-[10px] font-display font-bold px-2 py-0.5 bg-[#00f0ff]/20 text-[#00f0ff] rounded">
                          {team.teamType}
                        </span>
                      </div>

                      {/* Requirement 8: Team Code Privacy - Only Captain can see Team Code */}
                      {isCaptain && canViewTeamCode ? (
                        <div className="flex justify-between items-center bg-[#0c0e16] p-2.5 rounded border border-[#00f0ff]/40">
                          <div>
                            <p className="text-[9px] text-[#00f0ff] uppercase font-bold flex items-center gap-1">
                              <span>TEAM CODE (CAPTAIN ONLY)</span>
                            </p>
                            <p className="font-mono text-sm font-extrabold text-[#00f0ff] tracking-widest mt-0.5">
                              {team.teamCode}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(team.teamCode)}
                            className="px-3 py-1 bg-[#00f0ff] text-[#00363a] font-display text-xs font-bold rounded flex items-center gap-1 cursor-pointer hover:bg-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.3)]"
                          >
                            {copiedCode === team.teamCode ? (
                              <>
                                <Check className="w-3 h-3" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" /> Copy Code
                              </>
                            )}
                          </button>
                        </div>
                      ) : isCaptain ? (
                        <div className="flex items-center gap-2 bg-amber-950/30 p-2.5 rounded border border-amber-500/30 text-xs">
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                          <p className="text-[11px] text-amber-100">
                            Team Code will be visible after your payment is approved.
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 bg-[#0c0e16]/80 p-2.5 rounded border border-[#3b494b]/30 text-xs">
                          <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                          <p className="text-[11px] text-[#b9cacb]">
                            Team Code is <span className="text-white font-bold">private</span> and visible only to the Team Captain.
                          </p>
                        </div>
                      )}

                      {/* Current Team Members List with Profile Pictures */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase">
                          Current Team Members:
                        </p>
                        {members.map((m, idx) => {
                          const mUser = users.find((u) => u.id === m.userId);
                          const avatarImg =
                            mUser?.profileImage ||
                            (m.userId === currentUser.id ? currentUser.profileImage : undefined) ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${m.gameName}`;

                          return (
                            <div
                              key={m.id}
                              className="flex items-center justify-between bg-[#0c0e16]/60 px-2.5 py-1.5 rounded text-xs border border-[#3b494b]/20"
                            >
                              <div className="flex items-center gap-2">
                                <img
                                  src={avatarImg}
                                  alt={m.gameName}
                                  className="w-7 h-7 rounded-full object-cover border border-[#00f0ff]/40"
                                />
                                <div>
                                  <p className="font-bold text-white font-mono leading-tight">{m.gameName}</p>
                                  <p className="text-[9px] text-[#b9cacb] font-mono">UID: {m.freeFireId}</p>
                                </div>
                              </div>
                              {m.userId === team.captainId && (
                                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[9px] font-bold rounded">
                                  CAPTAIN
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Career Stats Card */}
          <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-4">
            <h3 className="font-display font-extrabold text-base text-white uppercase flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>CAREER STATS</span>
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-[#191b24] p-3 rounded-lg border border-[#3b494b]/20">
                <p className="font-display font-extrabold text-lg text-[#00f0ff]">68.4%</p>
                <p className="text-[9px] text-[#b9cacb] uppercase mt-0.5">Win Rate</p>
              </div>
              <div className="bg-[#191b24] p-3 rounded-lg border border-[#3b494b]/20">
                <p className="font-display font-extrabold text-lg text-purple-400">3.82</p>
                <p className="text-[9px] text-[#b9cacb] uppercase mt-0.5">K/D Ratio</p>
              </div>
              <div className="bg-[#191b24] p-3 rounded-lg border border-[#3b494b]/20">
                <p className="font-display font-extrabold text-lg text-amber-400">44%</p>
                <p className="text-[9px] text-[#b9cacb] uppercase mt-0.5">Headshots</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
