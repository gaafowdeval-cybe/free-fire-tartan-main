import React, { useState } from 'react';
import { SupabaseService } from '../lib/supabaseService';
import {
  User,
  Tournament,
  Registration,
  Team,
  TeamMember,
  Match,
  Winner,
  Notification,
  LiveBroadcast,
  TournamentStatus,
  TournamentType,
  FeeType,
  Announcement,
} from '../types';
import {
  ShieldCheck,
  Trophy,
  Users,
  Gamepad2,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Shuffle,
  Tv,
  FileText,
  Bell,
  Swords,
  Play,
  RotateCcw,
  Upload,
  Copy,
  Check,
  Search,
  UserCheck,
  Radio,
  ExternalLink,
} from 'lucide-react';

interface AdminDashboardProps {
  currentUser: User;
  tournaments: Tournament[];
  registrations: Registration[];
  teams: Team[];
  teamMembers: TeamMember[];
  matches: Match[];
  winners: Winner[];
  notifications: Notification[];
  liveBroadcasts: LiveBroadcast[];
  rules: string;
  users: User[];
  announcements: Announcement[];
  onApproveRegistration: (id: string) => void;
  onRejectRegistration: (id: string) => void;
  onOpenZoomModal: (reg: Registration) => void;
  onCreateTournament: (t: Omit<Tournament, 'id' | 'createdAt'>) => void;
  onUpdateTournamentStatus: (id: string, status: TournamentStatus) => void;
  onDeleteTournament: (id: string) => void;
  onGenerateMatches: (tournamentId: string) => void;
  onSelectMatchWinner: (matchId: string, winnerId: string, winnerName: string) => void;
  onNextRound: (tournamentId: string) => void;
  onSaveRules: (rules: string) => void;
  onAddWinner: (w: Omit<Winner, 'id'>) => void;
  onToggleBroadcast: (id: string) => void;
  onUpdateBroadcastUrl: (id: string, url: string, title: string) => void;
  onResetDemoData: () => void;
  onUpdateTournament?: (t: Tournament) => void;
  onEditRegistration?: (reg: Registration) => void;
  onDeleteRegistration?: (id: string) => void;
  onEditTeam?: (team: Team) => void;
  onDeleteTeam?: (id: string) => void;
  onEditMatch?: (match: Match) => void;
  onDeleteMatch?: (id: string) => void;
  onEditWinner?: (winner: Winner) => void;
  onDeleteWinner?: (id: string) => void;
  onEditUser?: (user: User) => void;
  onDeleteUser?: (id: string) => void;
  onAddBroadcast?: (b: Omit<LiveBroadcast, 'id'>) => void;
  onUpdateBroadcast?: (b: LiveBroadcast) => void;
  onDeleteBroadcast?: (id: string) => void;
  onCreateAnnouncement?: (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateAnnouncement?: (announcement: Announcement) => void;
  onDeleteAnnouncement?: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  tournaments,
  registrations,
  teams,
  teamMembers,
  matches,
  winners,
  notifications,
  liveBroadcasts,
  rules,
  users,
  announcements,
  onApproveRegistration,
  onRejectRegistration,
  onOpenZoomModal,
  onCreateTournament,
  onUpdateTournamentStatus,
  onDeleteTournament,
  onGenerateMatches,
  onSelectMatchWinner,
  onNextRound,
  onSaveRules,
  onAddWinner,
  onToggleBroadcast,
  onUpdateBroadcastUrl,
  onResetDemoData,
  onUpdateTournament,
  onEditRegistration,
  onDeleteRegistration,
  onEditTeam,
  onDeleteTeam,
  onEditMatch,
  onDeleteMatch,
  onEditWinner,
  onDeleteWinner,
  onEditUser,
  onDeleteUser,
  onAddBroadcast,
  onUpdateBroadcast,
  onDeleteBroadcast,
  onCreateAnnouncement,
  onUpdateAnnouncement,
  onDeleteAnnouncement,
}) => {
  const [activeTab, setActiveTab] = useState<
    'registrations' | 'teams' | 'users' | 'tournaments' | 'elimination' | 'winners' | 'rules' | 'broadcast' | 'announcements'
  >('registrations');

  const [adminSearchTerm, setAdminSearchTerm] = useState('');

  // Create Tournament Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTourneyName, setNewTourneyName] = useState('');
  const [newTourneyType, setNewTourneyType] = useState<TournamentType>('SOLO');
  const [newTourneyFeeType, setNewTourneyFeeType] = useState<FeeType>('PAID');
  const [newTourneyImage, setNewTourneyImage] = useState(
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80'
  );
  const [newTourneyFee, setNewTourneyFee] = useState(5);
  const [newTourneyPrize, setNewTourneyPrize] = useState(500);
  const [newTourneyMax, setNewTourneyMax] = useState(64);
  const [newTourneyRules, setNewTourneyRules] = useState(
    '1. No hacks or cheats allowed.\n2. Level 30+ Free Fire account required.\n3. Admin decisions are final.'
  );

  // Edit Modals State
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [editingRegistration, setEditingRegistration] = useState<Registration | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [editingWinner, setEditingWinner] = useState<Winner | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // New Live Stream Form
  const [newStreamPlatform, setNewStreamPlatform] = useState<LiveBroadcast['platform']>('YouTube');
  const [newStreamTitle, setNewStreamTitle] = useState<string>('');
  const [newStreamUrl, setNewStreamUrl] = useState<string>('');
  const [newStreamActive, setNewStreamActive] = useState<boolean>(true);

  // Rules Editor State
  const [editedRules, setEditedRules] = useState(rules);

  // Selected Tournament for Elimination Bracket Generator
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(
    tournaments[0]?.id || ''
  );

  // Winner Form State
  const [winnerName, setWinnerName] = useState('');
  const [winnerPos, setWinnerPos] = useState(1);
  const [winnerPrize, setWinnerPrize] = useState(500);
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');

  const pendingRegs = registrations.filter((r) => r.status === 'PENDING');
  const approvedRegs = registrations.filter((r) => r.status === 'APPROVED');

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const publicUrl = await SupabaseService.uploadImage('tournaments', file);
        setNewTourneyImage(publicUrl);
      } catch (err) {
        console.error('Error uploading tournament banner:', err);
      }
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourneyName) return;

    onCreateTournament({
      name: newTourneyName,
      type: newTourneyType,
      feeType: newTourneyFeeType,
      image: newTourneyImage,
      entryFee: newTourneyFeeType === 'FREE' ? 0 : Number(newTourneyFee),
      prizeMoney: Number(newTourneyPrize),
      maxParticipants: Number(newTourneyMax),
      registrationStart: new Date().toISOString().split('T')[0],
      registrationDeadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
      startDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      startTime: '20:00 UTC',
      status: 'OPEN REGISTRATION',
      rules: newTourneyRules,
      winnersCount: 3,
      region: 'Global',
    });

    setShowCreateModal(false);
    setNewTourneyName('');
  };

  const handleWinnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!winnerName || !selectedTourneyId) return;

    onAddWinner({
      tournamentId: selectedTourneyId,
      playerOrTeamId: winnerName,
      playerOrTeamName: winnerName,
      position: Number(winnerPos),
      prizeAmount: Number(winnerPrize),
      paymentStatus: 'PAID',
    });

    setWinnerName('');
  };

  const handleAddLiveStreamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStreamTitle || !newStreamUrl) return;

    if (onAddBroadcast) {
      onAddBroadcast({
        platform: newStreamPlatform,
        title: newStreamTitle,
        url: newStreamUrl,
        isActive: newStreamActive,
      });
      setNewStreamTitle('');
      setNewStreamUrl('');
      alert('New Live Stream broadcast added successfully!');
    }
  };

  const selectedTournamentMatches = matches.filter(
    (m) => m.tournamentId === selectedTourneyId
  );

  return (
    <div className="pt-20 sm:pt-24 pb-24 px-3 sm:px-4 md:px-10 max-w-7xl mx-auto space-y-5 sm:space-y-8 overflow-x-hidden">
      {/* Admin Suite Header */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border-2 border-[#00f0ff]/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 bg-gradient-to-r from-[#191b24] via-[#11131b] to-[#0c0e16]">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#00f0ff]" />
            <span className="font-display font-bold text-[#00f0ff] uppercase tracking-widest text-xs">
              ADMINISTRATIVE CONTROL SUITE
            </span>
          </div>
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-white uppercase italic mt-1">
            FULL SYSTEM MANAGEMENT DASHBOARD
          </h1>
          <p className="text-xs text-[#b9cacb] mt-0.5">
            Logged in as Admin: <span className="text-white font-bold break-all">{currentUser.fullName}</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-3">
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto justify-center px-5 py-2.5 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_15px_rgba(0,240,255,0.4)] hover:shadow-[0_0_25px_rgba(0,240,255,0.7)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Tournament</span>
          </button>
          <button
            onClick={onResetDemoData}
            className="px-4 py-2.5 bg-[#33343e] hover:bg-[#3b494b] text-[#b9cacb] font-display text-xs font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer"
            title="Reset storage to default sample data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Top Admin Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-[#00f0ff]">
          <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase">TOTAL USERS</p>
          <p className="font-display text-2xl font-bold text-white mt-1">{users.length}</p>
        </div>
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-amber-400">
          <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase">
            PENDING PAYMENTS
          </p>
          <p className="font-display text-2xl font-bold text-amber-400 mt-1">
            {pendingRegs.length}
          </p>
        </div>
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-purple-400">
          <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase">
            ACTIVE TOURNAMENTS
          </p>
          <p className="font-display text-2xl font-bold text-white mt-1">
            {tournaments.filter((t) => t.status === 'OPEN REGISTRATION' || t.status === 'LIVE / PLAYING').length}
          </p>
        </div>
        <div className="glass-card p-5 rounded-xl border-l-4 border-l-green-400">
          <p className="text-[10px] font-display font-bold text-[#b9cacb] uppercase">
            APPROVED PLAYERS
          </p>
          <p className="font-display text-2xl font-bold text-green-400 mt-1">
            {approvedRegs.length}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-[#00f0ff]/20 bg-[#14161f] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#00f0ff] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={adminSearchTerm}
            onChange={(e) => setAdminSearchTerm(e.target.value)}
            placeholder="Search users, UIDs, teams, or tournaments..."
            className="w-full pl-9 pr-8 py-2 bg-[#0c0e16] border border-[#3b494b]/40 rounded-lg text-xs text-white placeholder:text-[#b9cacb]/60 focus:outline-none focus:border-[#00f0ff]"
          />
          {adminSearchTerm && (
            <button
              onClick={() => setAdminSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
        <p className="text-[11px] text-[#b9cacb] hidden md:block">
          Active Search Filter: <span className="text-[#00f0ff] font-bold">{adminSearchTerm || 'None'}</span>
        </p>
      </div>

      {/* Sub-Tabs */}
      <div className="-mx-3 sm:mx-0 px-3 sm:px-0 flex border-b border-[#3b494b]/30 overflow-x-auto whitespace-nowrap gap-4 scrollbar-thin">
        {[
          { id: 'registrations', label: `Pending Payments (${pendingRegs.length})` },
          { id: 'teams', label: `Teams & Squads (${teams.length})` },
          { id: 'users', label: `Registered Users (${users.length})` },
          { id: 'tournaments', label: `Tournaments (${tournaments.length})` },
          { id: 'elimination', label: 'Knockout Brackets' },
          { id: 'winners', label: 'Winners Record' },
          { id: 'broadcast', label: `Live Streams (${liveBroadcasts.length})` },
          { id: 'announcements', label: `Announcements (${announcements.length})` },
          { id: 'rules', label: 'Platform Rules' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-2 font-display font-bold text-xs uppercase transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'text-[#00f0ff] border-b-2 border-[#00f0ff]'
                : 'text-[#b9cacb] hover:text-[#00f0ff]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: REGISTRATIONS & PAYMENTS (Edit/Delete enabled) */}
      {activeTab === 'registrations' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase">
                REGISTRATIONS & PAYMENT VERIFICATION
              </h3>
              <p className="text-xs text-[#b9cacb]">
                Inspect payment receipts, edit registration details, or remove invalid registrations.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#191b24] text-[#00f0ff] font-display uppercase border-b border-[#3b494b]/40">
                <tr>
                  <th className="p-3">Player / Nickname</th>
                  <th className="p-3">Free Fire ID</th>
                  <th className="p-3">Tournament</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Receipt</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b494b]/20">
                {registrations
                  .filter((reg) => {
                    if (!adminSearchTerm) return true;
                    const q = adminSearchTerm.toLowerCase();
                    const tourney = tournaments.find((t) => t.id === reg.tournamentId);
                    return (
                      reg.gameName.toLowerCase().includes(q) ||
                      reg.freeFireId.toLowerCase().includes(q) ||
                      reg.whatsapp.toLowerCase().includes(q) ||
                      (tourney && tourney.name.toLowerCase().includes(q))
                    );
                  })
                  .map((reg) => {
                    const tourney = tournaments.find((t) => t.id === reg.tournamentId);

                    return (
                      <tr key={reg.id} className="hover:bg-[#191b24]/50 transition-colors">
                        <td className="p-3 font-bold text-white">{reg.gameName}</td>
                        <td className="p-3 font-mono text-[#00f0ff]">{reg.freeFireId}</td>
                        <td className="p-3 font-semibold text-gray-300">{tourney?.name || reg.tournamentId}</td>
                        <td className="p-3 font-mono text-gray-400">{reg.whatsapp}</td>
                        <td className="p-3">
                          <button
                            onClick={() => onOpenZoomModal(reg)}
                            className="px-2.5 py-1 bg-[#33343e] hover:bg-[#3b494b] text-[#00f0ff] font-display text-[10px] font-bold rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" /> View Receipt
                          </button>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              reg.status === 'APPROVED'
                                ? 'bg-green-950 text-green-400 border border-green-500/30'
                                : reg.status === 'REJECTED'
                                ? 'bg-red-950 text-red-400 border border-red-500/30'
                                : 'bg-yellow-950 text-yellow-400 border border-yellow-500/30'
                            }`}
                          >
                            {reg.status}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          {reg.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => onApproveRegistration(reg.id)}
                                className="px-2.5 py-1 bg-[#00f0ff] text-[#00363a] font-display font-bold text-[10px] uppercase rounded hover:bg-cyan-300 cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => onRejectRegistration(reg.id)}
                                className="px-2.5 py-1 bg-red-600/30 text-red-400 border border-red-500/30 font-display font-bold text-[10px] uppercase rounded hover:bg-red-600/50 cursor-pointer"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setEditingRegistration(reg)}
                            className="p-1 text-amber-400 hover:text-amber-300 bg-amber-950/40 rounded cursor-pointer inline-block"
                            title="Edit Registration"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {onDeleteRegistration && (
                            <button
                              onClick={() => {
                                if (confirm(`Delete registration for ${reg.gameName}?`)) {
                                  onDeleteRegistration(reg.id);
                                }
                              }}
                              className="p-1 text-red-400 hover:text-red-300 bg-red-950/40 rounded cursor-pointer inline-block"
                              title="Delete Registration"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: TEAMS & SQUADS (Edit/Delete enabled) */}
      {activeTab === 'teams' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00f0ff]" />
                <span>REGISTERED TEAMS & SQUADS</span>
              </h3>
              <p className="text-xs text-[#b9cacb] mt-0.5">
                Manage all registered teams, team codes, captain details, and squad rosters.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {teams.map((team) => {
              const tourney = tournaments.find((t) => t.id === team.tournamentId);
              const members = teamMembers.filter((tm) => tm.teamId === team.id);

              return (
                <div
                  key={team.id}
                  className="bg-[#191b24] p-5 rounded-xl border border-[#3b494b]/40 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-display font-bold text-[#00f0ff] uppercase tracking-wider">
                        {team.teamType} SQUAD
                      </span>
                      <h4 className="font-display font-extrabold text-xl text-white">
                        {team.teamName}
                      </h4>
                      <p className="text-xs text-[#b9cacb] mt-0.5">
                        Tournament: <span className="text-white font-bold">{tourney?.name || team.tournamentId}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingTeam(team)}
                        className="p-1.5 text-amber-400 hover:text-amber-300 bg-amber-950/40 rounded cursor-pointer"
                        title="Edit Team"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {onDeleteTeam && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete team "${team.teamName}"?`)) {
                              onDeleteTeam(team.id);
                            }
                          }}
                          className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 rounded cursor-pointer"
                          title="Delete Team"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-[#0c0e16] p-3 rounded-lg border border-[#3b494b]/30 text-xs">
                    <div>
                      <p className="text-[10px] text-[#b9cacb] uppercase font-bold">Team Join Code</p>
                      <p className="font-mono text-[#00f0ff] font-extrabold text-sm tracking-wider">
                        {team.teamCode}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#b9cacb] uppercase font-bold">Status</p>
                      <span className="text-white font-bold">{team.status}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-display font-bold text-[#b9cacb] uppercase">
                      Roster Members ({members.length}):
                    </p>
                    {members.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between bg-[#11131b] px-3 py-1.5 rounded text-xs"
                      >
                        <span className="font-bold text-white font-mono">{m.gameName}</span>
                        <span className="text-[10px] text-[#b9cacb] font-mono">UID: {m.freeFireId}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: USERS DIRECTORY (Edit/Delete enabled) */}
      {activeTab === 'users' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase flex items-center gap-2">
                <Users className="w-5 h-5 text-[#00f0ff]" />
                <span>USER ACCOUNTS & ROLES DIRECTORY</span>
              </h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#191b24] text-[#00f0ff] font-display uppercase border-b border-[#3b494b]/40">
                <tr>
                  <th className="p-3">User Profile</th>
                  <th className="p-3">Username</th>
                  <th className="p-3">WhatsApp</th>
                  <th className="p-3">Role</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b494b]/20">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#191b24]/50 transition-colors">
                    <td className="p-3 font-bold text-white">{u.fullName}</td>
                    <td className="p-3 font-mono text-gray-300">@{u.username}</td>
                    <td className="p-3 font-mono text-[#00f0ff]">{u.whatsapp}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-purple-950 text-purple-400 border border-purple-500/30'
                            : 'bg-blue-950 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 text-right space-x-2">
                      <button
                        onClick={() => setEditingUser(u)}
                        className="p-1 text-amber-400 hover:text-amber-300 bg-amber-950/40 rounded cursor-pointer inline-block"
                        title="Edit User"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteUser && u.role !== 'admin' && (
                        <button
                          onClick={() => onDeleteUser(u.id)}
                          className="p-1 text-red-400 hover:text-red-300 bg-red-950/40 rounded cursor-pointer inline-block"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: TOURNAMENTS (Edit/Delete enabled) */}
      {activeTab === 'tournaments' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-extrabold text-lg text-white uppercase">
              TOURNAMENT CONTROL CENTER
            </h3>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase rounded flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Tournament
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tournaments.map((t) => (
              <div
                key={t.id}
                className="bg-[#191b24] p-5 rounded-xl border border-[#3b494b]/30 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-bold text-lg text-white">{t.name}</h4>
                    <p className="text-xs text-[#00f0ff] font-display font-bold uppercase">
                      {t.type} MODE • ${t.prizeMoney} PRIZE • ENTRY ${t.entryFee}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTournament(t)}
                      className="p-1.5 text-amber-400 hover:text-amber-300 bg-amber-950/40 rounded cursor-pointer"
                      title="Edit Tournament Details"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteTournament(t.id)}
                      className="p-1.5 text-red-400 hover:text-red-300 bg-red-950/40 rounded cursor-pointer"
                      title="Delete Tournament"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#b9cacb]">Status:</span>
                  <select
                    value={t.status}
                    onChange={(e) =>
                      onUpdateTournamentStatus(t.id, e.target.value as TournamentStatus)
                    }
                    className="px-3 py-1 bg-[#0c0e16] border border-[#3b494b] text-xs font-bold text-white rounded focus:outline-none focus:border-[#00f0ff]"
                  >
                    <option value="UPCOMING">UPCOMING</option>
                    <option value="OPEN REGISTRATION">OPEN REGISTRATION</option>
                    <option value="CLOSED REGISTRATION">CLOSED REGISTRATION</option>
                    <option value="LIVE / PLAYING">LIVE / PLAYING</option>
                    <option value="FINISHED">FINISHED</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: KNOCKOUT ELIMINATION BRACKETS */}
      {activeTab === 'elimination' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="font-display font-extrabold text-lg text-white uppercase flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-[#00f0ff]" />
                <span>RANDOM KNOCKOUT ELIMINATION ENGINE</span>
              </h3>
            </div>

            <select
              value={selectedTourneyId}
              onChange={(e) => setSelectedTourneyId(e.target.value)}
              className="px-4 py-2 bg-[#191b24] border border-[#00f0ff]/50 rounded-lg text-xs font-bold text-[#00f0ff] uppercase focus:outline-none"
            >
              {tournaments.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.type})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onGenerateMatches(selectedTourneyId)}
              className="px-6 py-3 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_15px_rgba(0,240,255,0.4)] flex items-center gap-2 cursor-pointer"
            >
              <Shuffle className="w-4 h-4" />
              <span>GENERATE RANDOM PAIRINGS</span>
            </button>
            <button
              onClick={() => onNextRound(selectedTourneyId)}
              className="px-6 py-3 bg-purple-600 text-white font-display font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 cursor-pointer"
            >
              <Swords className="w-4 h-4" />
              <span>ADVANCE WINNERS TO NEXT ROUND</span>
            </button>
          </div>

          <div className="space-y-4">
            {selectedTournamentMatches.map((m) => (
              <div
                key={m.id}
                className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/30 space-y-3"
              >
                <div className="flex justify-between items-center text-xs font-display text-[#b9cacb]">
                  <span>Round #{m.roundNumber}</span>
                  <span className="font-bold text-[#00f0ff]">{m.status}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingMatch(m)}
                      className="text-amber-400 hover:text-amber-300"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    {onDeleteMatch && (
                      <button
                        onClick={() => onDeleteMatch(m.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-[#0c0e16] p-3 rounded border border-[#3b494b]/20 text-sm font-bold text-white">
                  <span>{m.playerOrTeam1Name}</span>
                  <span className="px-2 py-0.5 bg-[#33343e] text-[#00f0ff] font-display text-[10px]">VS</span>
                  <span>{m.playerOrTeam2Name || 'BYE ADVANCE'}</span>
                </div>

                {!m.winnerId && !m.isBye && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectMatchWinner(m.id, m.playerOrTeam1Id, m.playerOrTeam1Name)}
                      className="flex-1 py-1.5 bg-[#00f0ff]/20 text-[#00f0ff] text-[10px] font-display font-bold uppercase rounded"
                    >
                      Winner: {m.playerOrTeam1Name}
                    </button>
                    {m.playerOrTeam2Id && (
                      <button
                        onClick={() => onSelectMatchWinner(m.id, m.playerOrTeam2Id!, m.playerOrTeam2Name!)}
                        className="flex-1 py-1.5 bg-[#00f0ff]/20 text-[#00f0ff] text-[10px] font-display font-bold uppercase rounded"
                      >
                        Winner: {m.playerOrTeam2Name}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: WINNERS MANAGEMENT */}
      {activeTab === 'winners' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-6">
          <h3 className="font-display font-extrabold text-lg text-white uppercase flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>HALL OF FAME & WINNERS RECORD</span>
          </h3>

          <form onSubmit={handleWinnerSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/30">
            <div>
              <label className="block text-[10px] font-display font-bold text-[#b9cacb] uppercase mb-1">
                Player or Team Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Team Neon"
                value={winnerName}
                onChange={(e) => setWinnerName(e.target.value)}
                className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-xs text-white rounded focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-display font-bold text-[#b9cacb] uppercase mb-1">
                Placement Position
              </label>
              <select
                value={winnerPos}
                onChange={(e) => setWinnerPos(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-xs text-white rounded focus:outline-none"
              >
                <option value={1}>1st Place (Champion)</option>
                <option value={2}>2nd Place (Runner Up)</option>
                <option value={3}>3rd Place (Bronze)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-display font-bold text-[#b9cacb] uppercase mb-1">
                Prize Amount ($)
              </label>
              <input
                type="number"
                value={winnerPrize}
                onChange={(e) => setWinnerPrize(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-xs text-white rounded focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-2 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase rounded cursor-pointer"
              >
                RECORD WINNER
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {winners.map((w) => (
              <div
                key={w.id}
                className="bg-[#191b24] p-4 rounded-xl border border-amber-400/30 flex justify-between items-center"
              >
                <div>
                  <span className="text-[10px] font-display font-bold text-amber-400 uppercase">
                    POSITION #{w.position}
                  </span>
                  <p className="font-bold text-white text-base mt-0.5">{w.playerOrTeamName}</p>
                  <p className="text-xs text-[#00f0ff] font-bold">${w.prizeAmount} Prize Paid</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingWinner(w)} className="p-1 text-amber-400">
                    <Edit className="w-4 h-4" />
                  </button>
                  {onDeleteWinner && (
                    <button onClick={() => onDeleteWinner(w.id)} className="p-1 text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: LIVE BROADCAST & STREAM MANAGER (Add TikTok / YouTube Streams) */}
      {activeTab === 'broadcast' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="font-display font-extrabold text-lg text-white uppercase flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <span>LIVE BROADCAST & STREAM CONTROLLER</span>
            </h3>
          </div>

          {/* ADD NEW STREAM FORM */}
          <form
            onSubmit={handleAddLiveStreamSubmit}
            className="bg-[#191b24] p-5 rounded-xl border-2 border-red-500/40 space-y-4"
          >
            <h4 className="font-display font-bold text-xs text-[#00f0ff] uppercase flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> ADD NEW LIVE STREAM LINK (TIKTOK / YOUTUBE / FACEBOOK)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Platform
                </label>
                <select
                  value={newStreamPlatform}
                  onChange={(e) => setNewStreamPlatform(e.target.value as LiveBroadcast['platform'])}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-xs text-white rounded focus:outline-none"
                >
                  <option value="YouTube">YouTube</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Facebook">Facebook</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Stream Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Fire Season Finals Live Stream"
                  value={newStreamTitle}
                  onChange={(e) => setNewStreamTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-xs text-white rounded focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold text-[#b9cacb] uppercase mb-1">
                  Live Stream Link / URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://www.tiktok.com/@omarsaid/live or YouTube link"
                  value={newStreamUrl}
                  onChange={(e) => setNewStreamUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-xs text-white rounded focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-white font-bold">
                <input
                  type="checkbox"
                  checked={newStreamActive}
                  onChange={(e) => setNewStreamActive(e.target.checked)}
                  className="accent-red-500 w-4 h-4"
                />
                <span>Broadcast Status: ACTIVE (Live Now)</span>
              </label>

              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-display font-bold text-xs uppercase rounded cursor-pointer shadow-[0_0_15px_rgba(220,38,38,0.5)]"
              >
                ADD LIVE STREAM
              </button>
            </div>
          </form>

          {/* Streams List */}
          <div className="space-y-4">
            {liveBroadcasts.map((b) => (
              <div
                key={b.id}
                className="bg-[#191b24] p-4 rounded-xl border border-[#3b494b]/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{b.platform} Stream</span>
                    {b.isActive ? (
                      <span className="px-2 py-0.5 bg-red-600 text-white font-display text-[9px] font-bold rounded uppercase animate-pulse">
                        LIVE NOW
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-gray-800 text-gray-400 text-[9px] font-bold rounded uppercase">
                        OFFLINE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#00f0ff] mt-0.5">{b.title}</p>
                  <a
                    href={b.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-gray-400 font-mono mt-0.5 hover:underline flex items-center gap-1"
                  >
                    <span>{b.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleBroadcast(b.id)}
                    className={`px-4 py-2 font-display text-xs font-bold uppercase rounded cursor-pointer ${
                      b.isActive ? 'bg-red-600 text-white' : 'bg-[#33343e] text-[#b9cacb] hover:text-white'
                    }`}
                  >
                    {b.isActive ? 'GO OFFLINE' : 'GO LIVE'}
                  </button>

                  {onDeleteBroadcast && (
                    <button
                      onClick={() => onDeleteBroadcast(b.id)}
                      className="p-2 text-red-400 hover:text-red-300 bg-red-950/40 rounded cursor-pointer"
                      title="Delete Stream"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: RULES EDITOR */}
      {activeTab === 'announcements' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-5">
          <h3 className="font-display font-extrabold text-lg text-white uppercase flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#00f0ff]" /> ANNOUNCEMENT CONTROL
          </h3>
          <form
            className="grid gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              if (!announcementTitle.trim() || !announcementMessage.trim() || !onCreateAnnouncement) return;
              onCreateAnnouncement({ title: announcementTitle.trim(), message: announcementMessage.trim(), isActive: true, createdBy: users.find((user) => user.role === 'admin')?.id || '' });
              setAnnouncementTitle('');
              setAnnouncementMessage('');
            }}
          >
            <input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} placeholder="Announcement title" className="p-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white" />
            <textarea value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} placeholder="Announcement message" rows={3} className="p-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white" />
            <button type="submit" className="w-fit px-4 py-2 bg-[#00f0ff] text-[#00363a] font-bold rounded">PUBLISH ANNOUNCEMENT</button>
          </form>
          <div className="space-y-3">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="p-4 bg-[#191b24] border border-[#3b494b]/40 rounded-lg flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold text-white">{announcement.title}</p>
                  <p className="text-sm text-[#b9cacb] mt-1">{announcement.message}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => onUpdateAnnouncement?.({ ...announcement, isActive: !announcement.isActive })} className="px-2 py-1 text-xs text-[#00f0ff] border border-[#00f0ff]/40 rounded">{announcement.isActive ? 'HIDE' : 'SHOW'}</button>
                  <button onClick={() => onDeleteAnnouncement?.(announcement.id)} className="p-1 text-red-400" title="Delete announcement"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: RULES EDITOR */}
      {activeTab === 'rules' && (
        <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-4">
          <h3 className="font-display font-extrabold text-lg text-white uppercase flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#00f0ff]" />
            <span>GLOBAL PLATFORM RULES EDITOR</span>
          </h3>

          <textarea
            rows={10}
            value={editedRules}
            onChange={(e) => setEditedRules(e.target.value)}
            className="w-full p-4 bg-[#191b24] border border-[#3b494b]/50 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-[#00f0ff] leading-relaxed"
          ></textarea>

          <button
            onClick={() => onSaveRules(editedRules)}
            className="px-6 py-3 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase rounded shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
          >
            SAVE PLATFORM RULES
          </button>
        </div>
      )}

      {/* MODAL: EDIT TOURNAMENT */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#11131b] border border-[#3b494b] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-white uppercase">
                EDIT TOURNAMENT DETAILS
              </h3>
              <button
                onClick={() => setEditingTournament(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateTournament && editingTournament) {
                  onUpdateTournament(editingTournament);
                  setEditingTournament(null);
                  alert('Tournament updated successfully!');
                }
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[#b9cacb] font-bold uppercase mb-1">Tournament Name</label>
                <input
                  type="text"
                  value={editingTournament.name}
                  onChange={(e) => setEditingTournament({ ...editingTournament, name: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#b9cacb] font-bold uppercase mb-1">Mode</label>
                  <select
                    value={editingTournament.type}
                    onChange={(e) =>
                      setEditingTournament({
                        ...editingTournament,
                        type: e.target.value as TournamentType,
                      })
                    }
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                  >
                    <option value="SOLO">SOLO</option>
                    <option value="DUO">DUO</option>
                    <option value="SQUAD">SQUAD</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold uppercase mb-1">Entry Fee ($)</label>
                  <input
                    type="number"
                    value={editingTournament.entryFee}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, entryFee: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#b9cacb] font-bold uppercase mb-1">Prize Money ($)</label>
                  <input
                    type="number"
                    value={editingTournament.prizeMoney}
                    onChange={(e) =>
                      setEditingTournament({ ...editingTournament, prizeMoney: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                  />
                </div>
                <div>
                  <label className="block text-[#b9cacb] font-bold uppercase mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={editingTournament.maxParticipants}
                    onChange={(e) =>
                      setEditingTournament({
                        ...editingTournament,
                        maxParticipants: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTournament(null)}
                  className="px-4 py-2 bg-[#33343e] text-white font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00f0ff] text-[#00363a] font-bold rounded uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT REGISTRATION */}
      {editingRegistration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#11131b] border border-[#3b494b] rounded-2xl p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-white uppercase">
                EDIT REGISTRATION
              </h3>
              <button
                onClick={() => setEditingRegistration(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onEditRegistration && editingRegistration) {
                  onEditRegistration(editingRegistration);
                  setEditingRegistration(null);
                  alert('Registration updated!');
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block text-[#b9cacb] font-bold uppercase mb-1">In-Game Nickname</label>
                <input
                  type="text"
                  value={editingRegistration.gameName}
                  onChange={(e) => setEditingRegistration({ ...editingRegistration, gameName: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                />
              </div>

              <div>
                <label className="block text-[#b9cacb] font-bold uppercase mb-1">Free Fire UID</label>
                <input
                  type="text"
                  value={editingRegistration.freeFireId}
                  onChange={(e) => setEditingRegistration({ ...editingRegistration, freeFireId: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded font-mono"
                />
              </div>

              <div>
                <label className="block text-[#b9cacb] font-bold uppercase mb-1">WhatsApp</label>
                <input
                  type="text"
                  value={editingRegistration.whatsapp}
                  onChange={(e) => setEditingRegistration({ ...editingRegistration, whatsapp: e.target.value })}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                />
              </div>

              <div>
                <label className="block text-[#b9cacb] font-bold uppercase mb-1">Status</label>
                <select
                  value={editingRegistration.status}
                  onChange={(e) =>
                    setEditingRegistration({
                      ...editingRegistration,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded"
                >
                  <option value="APPROVED">APPROVED</option>
                  <option value="PENDING">PENDING</option>
                  <option value="REJECTED">REJECTED</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingRegistration(null)}
                  className="px-4 py-2 bg-[#33343e] text-white font-bold rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00f0ff] text-[#00363a] font-bold rounded uppercase"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#11131b] border border-[#3b494b] rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold text-lg text-white uppercase">
                CREATE NEW TOURNAMENT
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#b9cacb] font-display font-bold uppercase mb-1">
                  Tournament Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Free Fire Night League"
                  value={newTourneyName}
                  onChange={(e) => setNewTourneyName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-display font-bold uppercase mb-1">
                    Mode
                  </label>
                  <select
                    value={newTourneyType}
                    onChange={(e) => setNewTourneyType(e.target.value as TournamentType)}
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded focus:outline-none"
                  >
                    <option value="SOLO">SOLO</option>
                    <option value="DUO">DUO</option>
                    <option value="SQUAD">SQUAD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-display font-bold uppercase mb-1">
                    Fee Type
                  </label>
                  <select
                    value={newTourneyFeeType}
                    onChange={(e) => setNewTourneyFeeType(e.target.value as FeeType)}
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded focus:outline-none"
                  >
                    <option value="PAID">PAID</option>
                    <option value="FREE">FREE ENTRY</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[#b9cacb] font-display font-bold uppercase mb-1">
                    Entry Fee ($)
                  </label>
                  <input
                    type="number"
                    value={newTourneyFee}
                    onChange={(e) => setNewTourneyFee(Number(e.target.value))}
                    disabled={newTourneyFeeType === 'FREE'}
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded focus:outline-none disabled:opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-display font-bold uppercase mb-1">
                    Prize Pool ($)
                  </label>
                  <input
                    type="number"
                    value={newTourneyPrize}
                    onChange={(e) => setNewTourneyPrize(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[#b9cacb] font-display font-bold uppercase mb-1">
                    Max Players/Teams
                  </label>
                  <input
                    type="number"
                    value={newTourneyMax}
                    onChange={(e) => setNewTourneyMax(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-[#0c0e16] border border-[#3b494b] text-white rounded focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#b9cacb] font-display font-bold uppercase mb-1">
                  Upload Custom Banner Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="w-full text-[#b9cacb] text-xs file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-[#33343e] file:text-[#00f0ff] cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#33343e] text-white font-bold rounded cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00f0ff] text-[#00363a] font-bold rounded uppercase cursor-pointer"
                >
                  Publish Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
