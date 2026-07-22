import React, { useState, useEffect } from 'react';
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
  Payment,
  Announcement,
} from './types';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { SupabaseService } from './lib/supabaseService';

// Components
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { Hero } from './components/Hero';
import { StatsSection } from './components/StatsSection';
import { FeaturedTournaments } from './components/FeaturedTournaments';
import { TournamentDetailModal } from './components/TournamentDetailModal';
import { RegistrationModal } from './components/RegistrationModal';
import { TeamCodeModal } from './components/TeamCodeModal';
import { PaymentZoomModal } from './components/PaymentZoomModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModals } from './components/AuthModals';
import { RankingsView } from './components/RankingsView';
import { RulesView } from './components/RulesView';
import { WinnersView } from './components/WinnersView';
import { LiveBroadcastView } from './components/LiveBroadcastView';
import { FloatingContactButtons } from './components/FloatingContactButtons';

export function App() {
  // App State initialized
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [liveBroadcasts, setLiveBroadcasts] = useState<LiveBroadcast[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [rulesText, setRulesText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals
  const [selectedDetailTournament, setSelectedDetailTournament] = useState<Tournament | null>(null);
  const [selectedRegisterTournament, setSelectedRegisterTournament] = useState<Tournament | null>(null);
  const [selectedTeamCodeTournament, setSelectedTeamCodeTournament] = useState<Tournament | null>(null);
  const [selectedZoomRegistration, setSelectedZoomRegistration] = useState<Registration | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showSignUpModal, setShowSignUpModal] = useState<boolean>(false);

  // Load Data from Supabase on mount
  useEffect(() => {
    async function loadSupabaseData() {
      if (!isSupabaseConfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const [
          tourneyData,
          regData,
          teamData,
          memberData,
          matchData,
          winnerData,
          notifData,
          broadcastData,
          userData,
          profile,
          paymentData,
          announcementData,
          loadedRules
        ] = await Promise.all([
          SupabaseService.getTournaments(),
          SupabaseService.getRegistrations(),
          SupabaseService.getTeams(),
          SupabaseService.getTeamMembers(),
          SupabaseService.getMatches(),
          SupabaseService.getWinners(),
          SupabaseService.getNotifications(),
          SupabaseService.getLiveBroadcasts(),
          SupabaseService.getUsers(),
          SupabaseService.getCurrentUserProfile(),
          SupabaseService.getPayments(),
          SupabaseService.getAnnouncements(),
          SupabaseService.getRules()
        ]);

        if (tourneyData.length > 0) setTournaments(tourneyData);
        if (regData.length > 0) setRegistrations(regData);
        if (teamData.length > 0) setTeams(teamData);
        if (memberData.length > 0) setTeamMembers(memberData);
        if (matchData.length > 0) setMatches(matchData);
        if (winnerData.length > 0) setWinners(winnerData);
        if (notifData.length > 0) setNotifications(notifData);
        if (broadcastData.length > 0) setLiveBroadcasts(broadcastData);
        if (userData.length > 0) setUsers(userData);
        if (profile) setCurrentUser(profile);
        setPayments(paymentData);
        setAnnouncements(announcementData);
        setRulesText(loadedRules);
      } catch (err) {
        console.error('Error fetching Supabase data on mount:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSupabaseData();

    // Supabase Auth Listener & Realtime Subscriptions
    if (isSupabaseConfigured) {
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await SupabaseService.getCurrentUserProfile();
          if (profile) setCurrentUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setCurrentUser(null);
        }
      });

      // Realtime Database Channel Subscriptions
      const channel = supabase
        .channel('public-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public' },
          (payload) => {
            const table = payload.table;
            if (table === 'tournaments') {
              SupabaseService.getTournaments().then(setTournaments);
            } else if (table === 'registrations') {
              SupabaseService.getRegistrations().then(setRegistrations);
            } else if (table === 'teams') {
              SupabaseService.getTeams().then(setTeams);
            } else if (table === 'team_members') {
              SupabaseService.getTeamMembers().then(setTeamMembers);
            } else if (table === 'matches') {
              SupabaseService.getMatches().then(setMatches);
            } else if (table === 'winners') {
              SupabaseService.getWinners().then(setWinners);
            } else if (table === 'notifications') {
              SupabaseService.getNotifications().then(setNotifications);
            } else if (table === 'live_broadcasts') {
              SupabaseService.getLiveBroadcasts().then(setLiveBroadcasts);
            } else if (table === 'users') {
              SupabaseService.getUsers().then(setUsers);
            } else if (table === 'payments') {
              SupabaseService.getPayments().then(setPayments);
            } else if (table === 'announcements') {
              SupabaseService.getAnnouncements().then(setAnnouncements);
            } else if (table === 'app_settings') {
              SupabaseService.getRules().then(setRulesText);
            }
          }
        )
        .subscribe();

      return () => {
        authListener?.subscription?.unsubscribe();
        supabase.removeChannel(channel);
      };
    }
  }, []);

  // Sync state helpers
  const saveUsersState = (newUsers: User[]) => {
    setUsers(newUsers);
  };

  const saveTournamentsState = (newTourneys: Tournament[]) => {
    setTournaments(newTourneys);
  };

  const saveRegistrationsState = (newRegs: Registration[]) => {
    setRegistrations(newRegs);
  };

  const saveTeamsState = (newTeams: Team[]) => {
    setTeams(newTeams);
  };

  const saveTeamMembersState = (newMembers: TeamMember[]) => {
    setTeamMembers(newMembers);
  };

  const saveMatchesState = (newMatches: Match[]) => {
    setMatches(newMatches);
  };

  const saveWinnersState = (newWinners: Winner[]) => {
    setWinners(newWinners);
  };

  const saveNotificationsState = (newNotifs: Notification[]) => {
    setNotifications(newNotifs);
  };

  const saveLiveBroadcastsState = (newBroadcasts: LiveBroadcast[]) => {
    setLiveBroadcasts(newBroadcasts);
  };

  // Auth Handlers
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setActiveTab('admin-dashboard');
    } else {
      setActiveTab('user-dashboard');
    }
  };

  const handleSignUpSuccess = (newUser: User) => {
    const updatedUsers = [...users, newUser];
    saveUsersState(updatedUsers);
    setCurrentUser(newUser);
    setActiveTab('user-dashboard');
  };

  const handleLogout = async () => {
    await SupabaseService.signOut();
    setCurrentUser(null);
    setActiveTab('home');
  };

  const handleUpdateProfileImage = async (newImage: string) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, profileImage: newImage };
    setCurrentUser(updatedUser);
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    saveUsersState(updatedUsers);

    if (isSupabaseConfigured) {
      await SupabaseService.updateUserProfile(currentUser.id, { profileImage: newImage });
    }
  };

  // Registration Handler
  const handleSubmitRegistration = async (data: {
    tournamentId: string;
    gameName: string;
    freeFireId: string;
    whatsapp: string;
    paymentScreenshot?: string;
    teamName?: string;
    teamCode?: string;
    registrationType: 'CREATE_TEAM' | 'JOIN_TEAM' | 'SOLO';
  }) => {
    if (!currentUser) return;

    let targetTeamId: string | undefined = undefined;

    if (data.registrationType === 'CREATE_TEAM' && data.teamName) {
      // 1. Create new Team & assign user as Captain
      const targetTourney = tournaments.find((t) => t.id === data.tournamentId);
      const mode = targetTourney?.type === 'DUO' ? 'DUO' : 'SQUAD';
      const code = data.teamCode || `${mode === 'DUO' ? 'DUO' : 'SQ'}-${Math.floor(10000 + Math.random() * 90000)}`;

      let createdTeam: Team | null = null;
      if (isSupabaseConfigured) {
        createdTeam = await SupabaseService.createTeam({
          tournamentId: data.tournamentId,
          teamName: data.teamName,
          captainId: currentUser.id,
          teamCode: code,
          teamType: mode,
          status: 'PENDING',
        });
      }

      const newTeam: Team = createdTeam || {
        id: `team-${Date.now()}`,
        tournamentId: data.tournamentId,
        teamName: data.teamName,
        captainId: currentUser.id,
        teamCode: code,
        teamType: mode,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      targetTeamId = newTeam.id;
      saveTeamsState([...teams, newTeam]);

      // Add Captain as first member
      let createdMember: TeamMember | null = null;
      if (isSupabaseConfigured) {
        createdMember = await SupabaseService.addTeamMember({
          teamId: newTeam.id,
          userId: currentUser.id,
          gameName: data.gameName,
          freeFireId: data.freeFireId,
        });
      }

      const captainMember: TeamMember = createdMember || {
        id: `tm-${Date.now()}`,
        teamId: newTeam.id,
        userId: currentUser.id,
        gameName: data.gameName,
        freeFireId: data.freeFireId,
        joinedAt: new Date().toISOString(),
      };
      saveTeamMembersState([...teamMembers, captainMember]);
    } else if (data.registrationType === 'JOIN_TEAM' && data.teamCode) {
      // 2. Join existing team as Member
      const existingTeam = teams.find(
        (t) => t.tournamentId === data.tournamentId && t.teamCode.toUpperCase() === data.teamCode!.toUpperCase()
      );

      if (existingTeam) {
        targetTeamId = existingTeam.id;

        let createdMember: TeamMember | null = null;
        if (isSupabaseConfigured) {
          createdMember = await SupabaseService.addTeamMember({
            teamId: existingTeam.id,
            userId: currentUser.id,
            gameName: data.gameName,
            freeFireId: data.freeFireId,
          });
        }

        const newMember: TeamMember = createdMember || {
          id: `tm-${Date.now()}`,
          teamId: existingTeam.id,
          userId: currentUser.id,
          gameName: data.gameName,
          freeFireId: data.freeFireId,
          joinedAt: new Date().toISOString(),
        };

        const updatedMembers = [...teamMembers, newMember];
        saveTeamMembersState(updatedMembers);

        // Update team status if team is now full
        const maxCapacity = existingTeam.teamType === 'DUO' ? 2 : 4;
        const currentMemberCount = updatedMembers.filter((tm) => tm.teamId === existingTeam.id).length;
        if (currentMemberCount >= maxCapacity) {
          const updatedTeams = teams.map((t) => (t.id === existingTeam.id ? { ...t, status: 'COMPLETE' as const } : t));
          saveTeamsState(updatedTeams);
        }
      }
    }

    // 3. Create Tournament Registration Entry
    const isTeamMemberJoin = data.registrationType === 'JOIN_TEAM';
    const regStatus = isTeamMemberJoin ? 'APPROVED' : 'PENDING';

    let createdReg: Registration | null = null;
    if (isSupabaseConfigured) {
      createdReg = await SupabaseService.createRegistration({
        userId: currentUser.id,
        tournamentId: data.tournamentId,
        gameName: data.gameName,
        freeFireId: data.freeFireId,
        whatsapp: data.whatsapp,
        paymentScreenshot: data.paymentScreenshot || (isTeamMemberJoin ? 'TEAM_JOIN_AUTO_APPROVED' : 'FREE_ENTRY'),
        status: regStatus,
        teamId: targetTeamId,
      });
    }

    const newReg: Registration = createdReg || {
      id: `reg-${Date.now()}`,
      userId: currentUser.id,
      tournamentId: data.tournamentId,
      gameName: data.gameName,
      freeFireId: data.freeFireId,
      whatsapp: data.whatsapp,
      paymentScreenshot: data.paymentScreenshot || (isTeamMemberJoin ? 'TEAM_JOIN_AUTO_APPROVED' : 'FREE_ENTRY'),
      status: regStatus,
      teamId: targetTeamId,
      createdAt: new Date().toISOString(),
    };

    saveRegistrationsState([...registrations, newReg]);

    // Send notification
    const notifData = {
      userId: 'admin',
      title: isTeamMemberJoin ? 'New Team Member Joined' : 'New Registration Submitted',
      message: `${currentUser.fullName} (${data.gameName}) ${
        isTeamMemberJoin ? 'joined squad roster.' : 'registered for tournament.'
      }`,
      isRead: false,
    };

    if (isSupabaseConfigured) {
      await SupabaseService.createNotification(notifData);
    }

    const adminNotif: Notification = {
      ...notifData,
      id: `notif-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveNotificationsState([adminNotif, ...notifications]);
  };

  // Team Code Join Handler
  const handleJoinTeam = async (teamCode: string, gameName: string, freeFireId: string) => {
    if (!currentUser || !selectedTeamCodeTournament) return;

    const targetTeam = teams.find((t) => t.teamCode.toUpperCase() === teamCode.toUpperCase());
    if (!targetTeam) {
      alert('Invalid Team Code. Please verify with your captain.');
      return;
    }

    const existingInTeam = teamMembers.filter((tm) => tm.teamId === targetTeam.id);
    const capacityLimit = targetTeam.teamType === 'DUO' ? 2 : 4;
    if (existingInTeam.length >= capacityLimit) {
      alert(`This squad roster is already full (Max ${capacityLimit} players).`);
      return;
    }

    let createdMember: TeamMember | null = null;
    if (isSupabaseConfigured) {
      createdMember = await SupabaseService.addTeamMember({
        teamId: targetTeam.id,
        userId: currentUser.id,
        gameName,
        freeFireId,
      });
    }

    const newMember: TeamMember = createdMember || {
      id: `tm-${Date.now()}`,
      teamId: targetTeam.id,
      userId: currentUser.id,
      gameName,
      freeFireId,
      joinedAt: new Date().toISOString(),
    };

    const updatedMembers = [...teamMembers, newMember];
    saveTeamMembersState(updatedMembers);

    if (existingInTeam.length + 1 >= capacityLimit) {
      const updatedTeams = teams.map((t) => (t.id === targetTeam.id ? { ...t, status: 'COMPLETE' as const } : t));
      saveTeamsState(updatedTeams);
    }

    // Registration Entry
    const existingReg = registrations.find(
      (r) => r.tournamentId === targetTeam.tournamentId && r.userId === currentUser.id
    );

    if (!existingReg) {
      let createdReg: Registration | null = null;
      if (isSupabaseConfigured) {
        createdReg = await SupabaseService.createRegistration({
          userId: currentUser.id,
          tournamentId: targetTeam.tournamentId,
          gameName,
          freeFireId,
          whatsapp: currentUser.whatsapp || 'N/A',
          paymentScreenshot: 'TEAM_JOIN_AUTO_APPROVED',
          status: 'APPROVED',
          teamId: targetTeam.id,
        });
      }

      const newReg: Registration = createdReg || {
        id: `reg-${Date.now()}`,
        userId: currentUser.id,
        tournamentId: targetTeam.tournamentId,
        gameName,
        freeFireId,
        whatsapp: currentUser.whatsapp || 'N/A',
        paymentScreenshot: 'TEAM_JOIN_AUTO_APPROVED',
        status: 'APPROVED',
        teamId: targetTeam.id,
        createdAt: new Date().toISOString(),
      };
      saveRegistrationsState([...registrations, newReg]);
    } else {
      const updatedRegs = registrations.map((r) =>
        r.id === existingReg.id ? { ...r, status: 'APPROVED' as const, teamId: targetTeam.id } : r
      );
      saveRegistrationsState(updatedRegs);
      if (isSupabaseConfigured) {
        await SupabaseService.updateRegistrationStatus(existingReg.id, 'APPROVED');
      }
    }

    setSelectedTeamCodeTournament(null);
    alert(`Successfully joined squad ${targetTeam.teamName}! Your entry is confirmed.`);
  };

  // Admin Actions
  const handleApproveRegistration = async (id: string) => {
    if (isSupabaseConfigured) {
      await SupabaseService.updateRegistrationStatus(id, 'APPROVED');
    }
    const updated = registrations.map((r) => {
      if (r.id === id) {
        const userNotif: Notification = {
          id: `notif-${Date.now()}`,
          userId: r.userId,
          title: 'Registration Approved!',
          message: 'Your payment was verified and tournament entry is CONFIRMED!',
          isRead: false,
          createdAt: new Date().toISOString(),
        };
        saveNotificationsState([userNotif, ...notifications]);
        return { ...r, status: 'APPROVED' as const };
      }
      return r;
    });
    saveRegistrationsState(updated);
  };

  const handleRejectRegistration = async (id: string) => {
    if (isSupabaseConfigured) {
      await SupabaseService.updateRegistrationStatus(id, 'REJECTED');
    }
    const updated = registrations.map((r) => (r.id === id ? { ...r, status: 'REJECTED' as const } : r));
    saveRegistrationsState(updated);
  };

  const handleCreateTournament = async (tourneyData: Omit<Tournament, 'id' | 'createdAt'>) => {
    let created: Tournament | null = null;
    if (isSupabaseConfigured) {
      created = await SupabaseService.createTournament(tourneyData);
    }
    const newT: Tournament = created || {
      ...tourneyData,
      id: `tourney-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveTournamentsState([...tournaments, newT]);
  };

  const handleUpdateTournamentStatus = async (id: string, status: TournamentStatus) => {
    if (isSupabaseConfigured) {
      await SupabaseService.updateTournament(id, { status });
    }
    const updated = tournaments.map((t) => (t.id === id ? { ...t, status } : t));
    saveTournamentsState(updated);
  };

  const handleDeleteTournament = async (id: string) => {
    if (isSupabaseConfigured) {
      await SupabaseService.deleteTournament(id);
    }
    saveTournamentsState(tournaments.filter((t) => t.id !== id));
  };

  // Random Knockout Elimination Pairings Generator
  const handleGenerateMatches = (tournamentId: string) => {
    const approved = registrations.filter((r) => r.tournamentId === tournamentId && r.status === 'APPROVED');
    if (approved.length < 2) {
      alert('Need at least 2 approved participants to generate match pairings.');
      return;
    }

    const shuffled = [...approved].sort(() => Math.random() - 0.5);
    const newMatches: Match[] = [];

    for (let i = 0; i < shuffled.length; i += 2) {
      if (i + 1 < shuffled.length) {
        newMatches.push({
          id: `match-${Date.now()}-${i}`,
          tournamentId,
          roundNumber: 1,
          playerOrTeam1Id: shuffled[i].gameName,
          playerOrTeam2Id: shuffled[i + 1].gameName,
          playerOrTeam1Name: shuffled[i].gameName,
          playerOrTeam2Name: shuffled[i + 1].gameName,
          status: 'PENDING',
        });
      } else {
        newMatches.push({
          id: `match-${Date.now()}-${i}`,
          tournamentId,
          roundNumber: 1,
          playerOrTeam1Id: shuffled[i].gameName,
          playerOrTeam1Name: shuffled[i].gameName,
          winnerId: shuffled[i].gameName,
          isBye: true,
          status: 'FINISHED',
        });
      }
    }

    saveMatchesState([...matches.filter((m) => m.tournamentId !== tournamentId), ...newMatches]);
    alert(`Generated ${newMatches.length} random knockout match pairings for Round #1!`);
  };

  const handleSelectMatchWinner = (matchId: string, winnerId: string, winnerName: string) => {
    const updated = matches.map((m) => {
      if (m.id === matchId) {
        const eliminated = m.playerOrTeam1Id === winnerId ? m.playerOrTeam2Id : m.playerOrTeam1Id;
        return {
          ...m,
          winnerId: winnerName,
          eliminatedId: eliminated,
          status: 'FINISHED' as const,
        };
      }
      return m;
    });
    saveMatchesState(updated);
  };

  const handleNextRound = (tournamentId: string) => {
    const tourneyMatches = matches.filter((m) => m.tournamentId === tournamentId);
    if (tourneyMatches.length === 0) return;

    const currentMaxRound = Math.max(...tourneyMatches.map((m) => m.roundNumber));
    const currentRoundMatches = tourneyMatches.filter((m) => m.roundNumber === currentMaxRound);

    const winnersList = currentRoundMatches
      .map((m) => m.winnerId)
      .filter((w): w is string => Boolean(w));

    if (winnersList.length < 2) {
      alert('All matches in the current round must have declared winners to advance.');
      return;
    }

    const shuffledWinners = [...winnersList].sort(() => Math.random() - 0.5);
    const nextRoundMatches: Match[] = [];

    for (let i = 0; i < shuffledWinners.length; i += 2) {
      if (i + 1 < shuffledWinners.length) {
        nextRoundMatches.push({
          id: `match-${Date.now()}-${i}`,
          tournamentId,
          roundNumber: currentMaxRound + 1,
          playerOrTeam1Id: shuffledWinners[i],
          playerOrTeam2Id: shuffledWinners[i + 1],
          playerOrTeam1Name: shuffledWinners[i],
          playerOrTeam2Name: shuffledWinners[i + 1],
          status: 'PENDING',
        });
      } else {
        nextRoundMatches.push({
          id: `match-${Date.now()}-${i}`,
          tournamentId,
          roundNumber: currentMaxRound + 1,
          playerOrTeam1Id: shuffledWinners[i],
          playerOrTeam1Name: shuffledWinners[i],
          winnerId: shuffledWinners[i],
          isBye: true,
          status: 'FINISHED',
        });
      }
    }

    saveMatchesState([...matches, ...nextRoundMatches]);
    alert(`Generated ${nextRoundMatches.length} matches for Round #${currentMaxRound + 1}!`);
  };

  const handleSaveRules = (newRules: string) => {
    setRulesText(newRules);
    if (isSupabaseConfigured) void SupabaseService.updateRules(newRules);
    alert('Platform rules updated successfully.');
  };

  const handleCreateAnnouncement = async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await SupabaseService.createAnnouncement(announcement);
    if (created) setAnnouncements((current) => [created, ...current]);
  };

  const handleUpdateAnnouncement = async (announcement: Announcement) => {
    setAnnouncements((current) => current.map((item) => item.id === announcement.id ? announcement : item));
    await SupabaseService.updateAnnouncement(announcement.id, announcement);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    setAnnouncements((current) => current.filter((item) => item.id !== id));
    await SupabaseService.deleteAnnouncement(id);
  };

  const handleAddWinner = async (winnerData: Omit<Winner, 'id'>) => {
    let created: Winner | null = null;
    if (isSupabaseConfigured) {
      created = await SupabaseService.createWinner(winnerData);
    }
    const newWinner: Winner = created || {
      ...winnerData,
      id: `win-${Date.now()}`,
    };
    saveWinnersState([newWinner, ...winners]);
    alert('Winner recorded in Hall of Fame!');
  };

  const handleToggleBroadcast = (id: string) => {
    const updated = liveBroadcasts.map((b) => (b.id === id ? { ...b, isActive: !b.isActive } : b));
    saveLiveBroadcastsState(updated);
    if (isSupabaseConfigured) {
      SupabaseService.saveLiveBroadcasts(updated);
    }
  };

  const handleUpdateBroadcastUrl = (id: string, url: string, title: string) => {
    const updated = liveBroadcasts.map((b) => (b.id === id ? { ...b, url, title } : b));
    saveLiveBroadcastsState(updated);
    if (isSupabaseConfigured) {
      SupabaseService.saveLiveBroadcasts(updated);
    }
  };

  // Expanded CRUD Handlers
  const handleUpdateTournament = async (updatedT: Tournament) => {
    const updated = tournaments.map((t) => (t.id === updatedT.id ? updatedT : t));
    saveTournamentsState(updated);
    if (isSupabaseConfigured) {
      await SupabaseService.updateTournament(updatedT.id, updatedT);
    }
  };

  const handleEditRegistration = async (updatedReg: Registration) => {
    const updated = registrations.map((r) => (r.id === updatedReg.id ? updatedReg : r));
    saveRegistrationsState(updated);
    if (isSupabaseConfigured) {
      await SupabaseService.updateRegistrationStatus(updatedReg.id, updatedReg.status);
    }
  };

  const handleDeleteRegistration = (id: string) => {
    saveRegistrationsState(registrations.filter((r) => r.id !== id));
  };

  const handleEditTeam = (updatedTeam: Team) => {
    const updated = teams.map((t) => (t.id === updatedTeam.id ? updatedTeam : t));
    saveTeamsState(updated);
    if (isSupabaseConfigured) void SupabaseService.updateTeam(updatedTeam.id, updatedTeam);
  };

  const handleDeleteTeam = (id: string) => {
    saveTeamsState(teams.filter((t) => t.id !== id));
    saveTeamMembersState(teamMembers.filter((tm) => tm.teamId !== id));
    if (isSupabaseConfigured) void SupabaseService.deleteTeam(id);
  };

  const handleEditMatch = (updatedMatch: Match) => {
    const updated = matches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
    saveMatchesState(updated);
    if (isSupabaseConfigured) void SupabaseService.updateMatch(updatedMatch.id, updatedMatch);
  };

  const handleDeleteMatch = (id: string) => {
    saveMatchesState(matches.filter((m) => m.id !== id));
    if (isSupabaseConfigured) void SupabaseService.deleteMatch(id);
  };

  const handleEditWinner = (updatedWinner: Winner) => {
    const updated = winners.map((w) => (w.id === updatedWinner.id ? updatedWinner : w));
    saveWinnersState(updated);
    if (isSupabaseConfigured) void SupabaseService.updateWinner(updatedWinner.id, updatedWinner);
  };

  const handleDeleteWinner = async (id: string) => {
    saveWinnersState(winners.filter((w) => w.id !== id));
    if (isSupabaseConfigured) {
      await SupabaseService.deleteWinner(id);
    }
  };

  const handleEditUser = async (updatedUser: User) => {
    const updated = users.map((u) => (u.id === updatedUser.id ? updatedUser : u));
    saveUsersState(updated);
    if (isSupabaseConfigured) {
      await SupabaseService.updateUserProfile(updatedUser.id, updatedUser);
    }
  };

  const handleDeleteUser = (id: string) => {
    saveUsersState(users.filter((u) => u.id !== id));
    if (isSupabaseConfigured) void SupabaseService.deleteUser(id);
  };

  const handleAddBroadcast = async (b: Omit<LiveBroadcast, 'id'>) => {
    const newB: LiveBroadcast = {
      ...b,
      id: `live-${Date.now()}`,
    };
    const updated = [newB, ...liveBroadcasts];
    saveLiveBroadcastsState(updated);
    if (isSupabaseConfigured) {
      await SupabaseService.saveLiveBroadcasts(updated);
    }
  };

  const handleUpdateBroadcast = async (updatedB: LiveBroadcast) => {
    const updated = liveBroadcasts.map((b) => (b.id === updatedB.id ? updatedB : b));
    saveLiveBroadcastsState(updated);
    if (isSupabaseConfigured) {
      await SupabaseService.saveLiveBroadcasts(updated);
    }
  };

  const handleDeleteBroadcast = (id: string) => {
    saveLiveBroadcastsState(liveBroadcasts.filter((b) => b.id !== id));
    if (isSupabaseConfigured) void SupabaseService.deleteLiveBroadcast(id);
  };

  const handleMarkNotificationRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n));
    saveNotificationsState(updated);
  };

  const handleDeleteNotification = (id: string) => {
    saveNotificationsState(notifications.filter((n) => n.id !== id));
  };

  const handleResetDemoData = () => {
    alert('Demo data is disabled. Manage production data in Supabase.');
  };

  return (
    <div className="min-h-screen bg-[#0c0e16] text-[#e2e1ee] font-sans selection:bg-[#00f0ff] selection:text-[#00363a] pb-16">
      {/* Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenSignUp={() => setShowSignUpModal(true)}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        onDeleteNotification={handleDeleteNotification}
      />

      {/* Dynamic Main View */}
      <main>
        {activeTab === 'home' && (
          <>
            <Hero
              onJoinTournament={() => setSelectedRegisterTournament(tournaments[0])}
              onViewTournaments={() => setActiveTab('tournaments')}
              liveBroadcasts={liveBroadcasts}
              onOpenLive={() => setActiveTab('live')}
            />
            {announcements.filter((announcement) => announcement.isActive).length > 0 && (
              <section className="max-w-7xl mx-auto px-6 py-8 space-y-3">
                {announcements.filter((announcement) => announcement.isActive).map((announcement) => (
                  <article key={announcement.id} className="border border-[#00f0ff]/30 bg-[#191b24] rounded-xl p-4">
                    <h2 className="font-display font-bold text-[#00f0ff]">{announcement.title}</h2>
                    <p className="text-sm text-[#b9cacb] mt-1">{announcement.message}</p>
                  </article>
                ))}
              </section>
            )}
            <StatsSection tournaments={tournaments} registrations={registrations} />
            <FeaturedTournaments
              tournaments={tournaments}
              currentUser={currentUser}
              registrations={registrations}
              onSelectTournament={(t) => setSelectedDetailTournament(t)}
              onRegisterClick={(t) => setSelectedRegisterTournament(t)}
            />
          </>
        )}

        {activeTab === 'tournaments' && (
          <div className="pt-24">
            <FeaturedTournaments
              tournaments={tournaments}
              currentUser={currentUser}
              registrations={registrations}
              onSelectTournament={(t) => setSelectedDetailTournament(t)}
              onRegisterClick={(t) => setSelectedRegisterTournament(t)}
            />
          </div>
        )}

        {activeTab === 'rankings' && (
          <RankingsView
            tournaments={tournaments}
            teams={teams}
            teamMembers={teamMembers}
            registrations={registrations}
            matches={matches}
            winners={winners}
            users={users}
          />
        )}

        {activeTab === 'winners' && <WinnersView winners={winners} tournaments={tournaments} />}

        {activeTab === 'rules' && <RulesView rulesText={rulesText} />}

        {activeTab === 'live' && <LiveBroadcastView broadcasts={liveBroadcasts} />}

        {activeTab === 'user-dashboard' && currentUser && (
          <UserDashboard
            currentUser={currentUser}
            users={users}
            tournaments={tournaments}
            registrations={registrations}
            teams={teams}
            teamMembers={teamMembers}
            matches={matches}
            onSelectTournament={(t) => setSelectedDetailTournament(t)}
            onOpenTeamCodeModal={(t) => setSelectedTeamCodeTournament(t)}
            onUpdateProfileImage={handleUpdateProfileImage}
          />
        )}

        {activeTab === 'admin-dashboard' && currentUser?.role === 'admin' && (
          <AdminDashboard
            currentUser={currentUser}
            tournaments={tournaments}
            registrations={registrations}
            teams={teams}
            teamMembers={teamMembers}
            matches={matches}
            winners={winners}
            notifications={notifications}
            liveBroadcasts={liveBroadcasts}
            rules={rulesText}
            users={users}
            announcements={announcements}
            onApproveRegistration={handleApproveRegistration}
            onRejectRegistration={handleRejectRegistration}
            onOpenZoomModal={(reg) => setSelectedZoomRegistration(reg)}
            onCreateTournament={handleCreateTournament}
            onUpdateTournamentStatus={handleUpdateTournamentStatus}
            onDeleteTournament={handleDeleteTournament}
            onGenerateMatches={handleGenerateMatches}
            onSelectMatchWinner={handleSelectMatchWinner}
            onNextRound={handleNextRound}
            onSaveRules={handleSaveRules}
            onAddWinner={handleAddWinner}
            onToggleBroadcast={handleToggleBroadcast}
            onUpdateBroadcastUrl={handleUpdateBroadcastUrl}
            onResetDemoData={handleResetDemoData}
            onUpdateTournament={handleUpdateTournament}
            onEditRegistration={handleEditRegistration}
            onDeleteRegistration={handleDeleteRegistration}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
            onEditMatch={handleEditMatch}
            onDeleteMatch={handleDeleteMatch}
            onEditWinner={handleEditWinner}
            onDeleteWinner={handleDeleteWinner}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onAddBroadcast={handleAddBroadcast}
            onUpdateBroadcast={handleUpdateBroadcast}
            onDeleteBroadcast={handleDeleteBroadcast}
            onCreateAnnouncement={handleCreateAnnouncement}
            onUpdateAnnouncement={handleUpdateAnnouncement}
            onDeleteAnnouncement={handleDeleteAnnouncement}
          />
        )}
      </main>

      {/* Floating Support Buttons */}
      <FloatingContactButtons
        whatsappNumber="+252617624424"
        tiktokUrl="https://www.tiktok.com/@apexneonesports"
      />

      {/* Mobile Fixed Navigation */}
      <MobileNav activeTab={activeTab} setActiveTab={setActiveTab} currentUser={currentUser} />

      {/* Modals */}
      <TournamentDetailModal
        tournament={selectedDetailTournament}
        currentUser={currentUser}
        onClose={() => setSelectedDetailTournament(null)}
        onRegisterClick={(t) => {
          setSelectedDetailTournament(null);
          setSelectedRegisterTournament(t);
        }}
        onOpenTeamCodeModal={(t) => {
          setSelectedDetailTournament(null);
          setSelectedTeamCodeTournament(t);
        }}
        registrations={registrations}
        teams={teams}
        matches={matches}
      />

      <RegistrationModal
        tournament={selectedRegisterTournament}
        currentUser={currentUser}
        existingRegistrations={registrations}
        teams={teams}
        teamMembers={teamMembers}
        onClose={() => setSelectedRegisterTournament(null)}
        onOpenLogin={() => setShowLoginModal(true)}
        onOpenSignUp={() => setShowSignUpModal(true)}
        onSubmitRegistration={handleSubmitRegistration}
        onNavigateToDashboard={() => setActiveTab('user-dashboard')}
      />

      <TeamCodeModal
        tournament={selectedTeamCodeTournament}
        currentUser={currentUser}
        tournaments={tournaments}
        teams={teams}
        teamMembers={teamMembers}
        onClose={() => setSelectedTeamCodeTournament(null)}
        onJoinTeam={handleJoinTeam}
      />

      <PaymentZoomModal
        registration={selectedZoomRegistration}
        onClose={() => setSelectedZoomRegistration(null)}
        onApprove={handleApproveRegistration}
        onReject={handleRejectRegistration}
      />

      <AuthModals
        isOpenLogin={showLoginModal}
        isOpenSignUp={showSignUpModal}
        onCloseLogin={() => setShowLoginModal(false)}
        onCloseSignUp={() => setShowSignUpModal(false)}
        onLoginSuccess={handleLoginSuccess}
        onSignUpSuccess={handleSignUpSuccess}
        users={users}
      />
    </div>
  );
}

export default App;
