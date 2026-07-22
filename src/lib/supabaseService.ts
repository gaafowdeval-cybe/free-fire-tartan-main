import { supabase, isSupabaseConfigured, uploadToSupabaseStorage } from './supabase';
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
  AppSettings,
  Payment,
  Announcement,
} from '../types';

const playerAuthEmail = (username: string) =>
  `${username.trim().toLowerCase()}@players.apexneon.local`;

export function getSupabaseErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (typeof error === 'string' && error.trim() && error.trim() !== '{}' && error.trim() !== '[object Object]') {
    return error;
  }
  if (error && typeof error === 'object') {
    const value = error as {
      message?: unknown;
      details?: unknown;
      hint?: unknown;
      error_description?: unknown;
      code?: unknown;
      status?: unknown;
    };
    const message = [value.message, value.details, value.hint, value.error_description]
      .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
      .join(' ')
      .trim();
    if (message) return message;
    if (typeof value.code === 'string' && value.code.trim()) return `Database error (${value.code}).`;
    if (typeof value.status === 'number') return `Request failed with status ${value.status}.`;
  }
  return fallback;
}

export const SupabaseService = {
  // ==========================================
  // AUTHENTICATION & USER PROFILES
  // ==========================================
  signUp: async (data: {
    password: string;
    fullName: string;
    username: string;
    whatsapp: string;
    freeFireUid?: string;
  }): Promise<{ user: User | null; error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { user: null, error: 'Supabase credentials are not configured in environment.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: playerAuthEmail(data.username),
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            username: data.username,
            whatsapp: data.whatsapp,
            free_fire_uid: data.freeFireUid || '',
          },
        },
      });

      if (authError) {
        return {
          user: null,
          error: getSupabaseErrorMessage(authError, 'Account creation failed. Check the username and password, then try again.'),
        };
      }
      if (!authData.user) return { user: null, error: 'Failed to create authentication user.' };

      if (!authData.session) {
        return {
          user: null,
          error: 'Account setup requires email confirmation to be disabled. In Supabase, go to Authentication > Providers > Email and turn off Confirm email.',
        };
      }

      const newUser: User = {
        id: authData.user.id,
        fullName: data.fullName,
        username: data.username,
        whatsapp: data.whatsapp,
        role: 'player',
        createdAt: new Date().toISOString(),
      };

      // Upsert user record into public.users table
      const { error: dbError } = await supabase.from('users').upsert({
        id: newUser.id,
        full_name: newUser.fullName,
        username: newUser.username,
        whatsapp: newUser.whatsapp,
        free_fire_uid: data.freeFireUid || '',
        role: 'player',
        created_at: newUser.createdAt,
      });

      if (dbError) {
        console.warn('Profile DB save notice:', dbError.message);
      }

      return { user: newUser, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Sign up error' };
    }
  },

  signIn: async (
    username: string,
    password: string
  ): Promise<{ user: User | null; error: string | null }> => {
    if (!isSupabaseConfigured) {
      return { user: null, error: 'Supabase credentials are not configured in environment.' };
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: playerAuthEmail(username),
        password,
      });

      if (authError) return { user: null, error: authError.message };
      if (!authData.user) return { user: null, error: 'Authentication failed.' };

      // Fetch user profile from DB
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      const user: User = profile
        ? {
            id: profile.id,
            fullName: profile.full_name,
            username: profile.username,
            whatsapp: profile.whatsapp || '',
            role: profile.role === 'admin' || profile.role === 'captain' ? profile.role : 'player',
            profileImage: profile.profile_image,
            createdAt: profile.created_at || new Date().toISOString(),
          }
        : {
            id: authData.user.id,
            fullName: authData.user.user_metadata?.full_name || 'Gamer',
            username: authData.user.user_metadata?.username || 'user',
            whatsapp: '',
            role: 'player',
            createdAt: new Date().toISOString(),
          };

      return { user, error: null };
    } catch (err: any) {
      return { user: null, error: err?.message || 'Login error' };
    }
  },

  signOut: async (): Promise<void> => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  },

  getCurrentUserProfile: async (): Promise<User | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return null;

      const userId = sessionData.session.user.id;
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profile) {
        return {
          id: profile.id,
          fullName: profile.full_name,
          username: profile.username,
          whatsapp: profile.whatsapp || '',
          role: profile.role === 'admin' || profile.role === 'captain' ? profile.role : 'player',
          profileImage: profile.profile_image,
          createdAt: profile.created_at || new Date().toISOString(),
        };
      }
      return null;
    } catch {
      return null;
    }
  },

  getUsers: async (): Promise<User[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error || !data) return [];
      return data.map((u) => ({
        id: u.id,
        fullName: u.full_name,
        username: u.username,
        whatsapp: u.whatsapp || '',
        role: u.role === 'admin' || u.role === 'captain' ? u.role : 'player',
        profileImage: u.profile_image,
        createdAt: u.created_at,
      }));
    } catch {
      return [];
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const dbUpdates: any = {};
      if (updates.fullName) dbUpdates.full_name = updates.fullName;
      if (updates.username) dbUpdates.username = updates.username;
      if (updates.whatsapp) dbUpdates.whatsapp = updates.whatsapp;
      if (updates.profileImage) dbUpdates.profile_image = updates.profileImage;
      if (updates.role) dbUpdates.role = updates.role;

      const { error } = await supabase.from('users').update(dbUpdates).eq('id', userId);
      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // TOURNAMENTS
  // ==========================================
  getTournaments: async (): Promise<Tournament[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        feeType: t.fee_type,
        image: t.image || '',
        entryFee: Number(t.entry_fee) || 0,
        prizeMoney: Number(t.prize_money) || 0,
        maxParticipants: t.max_participants || 100,
        registrationStart: t.registration_start || '',
        registrationDeadline: t.registration_deadline || '',
        startDate: t.start_date || '',
        startTime: t.start_time || '',
        status: t.status || 'OPEN REGISTRATION',
        rules: t.rules || '',
        winnersCount: t.winners_count || 3,
        region: t.region || 'SOMALIA',
        createdAt: t.created_at,
      }));
    } catch {
      return [];
    }
  },

  createTournament: async (tourney: Omit<Tournament, 'id' | 'createdAt'>): Promise<Tournament | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert({
          name: tourney.name,
          type: tourney.type,
          fee_type: tourney.feeType,
          image: tourney.image,
          entry_fee: tourney.entryFee,
          prize_money: tourney.prizeMoney,
          max_participants: tourney.maxParticipants,
          registration_start: tourney.registrationStart,
          registration_deadline: tourney.registrationDeadline,
          start_date: tourney.startDate,
          start_time: tourney.startTime,
          status: tourney.status,
          rules: tourney.rules,
          winners_count: tourney.winnersCount,
          region: tourney.region || 'SOMALIA',
        })
        .select('*')
        .single();

      if (error) throw new Error(getSupabaseErrorMessage(error, 'Could not create your team.'));
      if (!data) throw new Error('Could not create your team. No record was returned.');
      return {
        id: data.id,
        name: data.name,
        type: data.type,
        feeType: data.fee_type,
        image: data.image || '',
        entryFee: Number(data.entry_fee) || 0,
        prizeMoney: Number(data.prize_money) || 0,
        maxParticipants: data.max_participants || 100,
        registrationStart: data.registration_start || '',
        registrationDeadline: data.registration_deadline || '',
        startDate: data.start_date || '',
        startTime: data.start_time || '',
        status: data.status,
        rules: data.rules || '',
        winnersCount: data.winners_count || 3,
        region: data.region,
        createdAt: data.created_at,
      };
    } catch {
      return null;
    }
  },

  updateTournament: async (id: string, updates: Partial<Tournament>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const dbUpdates: any = {};
      if (updates.name) dbUpdates.name = updates.name;
      if (updates.type) dbUpdates.type = updates.type;
      if (updates.feeType) dbUpdates.fee_type = updates.feeType;
      if (updates.image) dbUpdates.image = updates.image;
      if (updates.entryFee !== undefined) dbUpdates.entry_fee = updates.entryFee;
      if (updates.prizeMoney !== undefined) dbUpdates.prize_money = updates.prizeMoney;
      if (updates.maxParticipants !== undefined) dbUpdates.max_participants = updates.maxParticipants;
      if (updates.status) dbUpdates.status = updates.status;
      if (updates.rules) dbUpdates.rules = updates.rules;

      const { error } = await supabase.from('tournaments').update(dbUpdates).eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  deleteTournament: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('tournaments').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // REGISTRATIONS
  // ==========================================
  getRegistrations: async (): Promise<Registration[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data.map((r) => ({
        id: r.id,
        userId: r.user_id,
        tournamentId: r.tournament_id,
        gameName: r.game_name,
        freeFireId: r.free_fire_uid,
        whatsapp: r.whatsapp,
        playerImage: r.player_image,
        paymentScreenshot: r.payment_screenshot,
        status: r.status,
        teamId: r.team_id,
        createdAt: r.created_at,
      }));
    } catch {
      return [];
    }
  },

  createRegistration: async (reg: Omit<Registration, 'id' | 'createdAt'>): Promise<Registration | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('registrations')
        .insert({
          user_id: reg.userId,
          tournament_id: reg.tournamentId,
          team_id: reg.teamId || null,
          game_name: reg.gameName,
          free_fire_uid: reg.freeFireId,
          whatsapp: reg.whatsapp,
          player_image: reg.playerImage,
          payment_screenshot: reg.paymentScreenshot,
          status: reg.status || 'PENDING',
        })
        .select('*')
        .single();

      if (error) throw new Error(getSupabaseErrorMessage(error, 'Registration could not be saved.'));
      if (!data) throw new Error('Registration could not be saved. No record was returned.');

      // Also log payment if screenshot provided
      if (reg.paymentScreenshot) {
        const { error: paymentError } = await supabase.from('payments').insert({
          registration_id: data.id,
          user_id: reg.userId,
          tournament_id: reg.tournamentId,
          amount: 0,
          screenshot_url: reg.paymentScreenshot,
          status: 'PENDING',
        });
        if (paymentError) throw new Error(getSupabaseErrorMessage(paymentError, 'Payment could not be saved.'));
      }

      return {
        id: data.id,
        userId: data.user_id,
        tournamentId: data.tournament_id,
        gameName: data.game_name,
        freeFireId: data.free_fire_uid,
        whatsapp: data.whatsapp,
        playerImage: data.player_image,
        paymentScreenshot: data.payment_screenshot,
        status: data.status,
        teamId: data.team_id,
        createdAt: data.created_at,
      };
    } catch (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Registration could not be saved.'));
    }
  },

  updateRegistrationStatus: async (id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING'): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('registrations').update({ status }).eq('id', id);
      if (!error) {
        await supabase.from('payments').update({ status }).eq('registration_id', id);
      }
      return !error;
    } catch {
      return false;
    }
  },

  // ==========================================
  // TEAMS & MEMBERS
  // ==========================================
  getTeams: async (): Promise<Team[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('teams').select('*');
      if (error || !data) return [];
      return data.map((t) => ({
        id: t.id,
        tournamentId: t.tournament_id,
        teamName: t.team_name,
        captainId: t.captain_id,
        teamCode: t.team_code,
        teamType: t.team_type || 'SQUAD',
        status: t.status || 'PENDING',
        createdAt: t.created_at,
      }));
    } catch {
      return [];
    }
  },

  createTeam: async (team: Omit<Team, 'id' | 'createdAt'>): Promise<Team | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          tournament_id: team.tournamentId,
          team_name: team.teamName,
          captain_id: team.captainId,
          team_code: team.teamCode,
          team_type: team.teamType,
          status: team.status || 'PENDING',
        })
        .select('*')
        .single();

      if (error) throw new Error(getSupabaseErrorMessage(error, 'Registration could not be saved.'));
      if (!data) throw new Error('Registration could not be saved. No record was returned.');

      return {
        id: data.id,
        tournamentId: data.tournament_id,
        teamName: data.team_name,
        captainId: data.captain_id,
        teamCode: data.team_code,
        teamType: data.team_type,
        status: data.status,
        createdAt: data.created_at,
      };
    } catch (error) {
      throw new Error(getSupabaseErrorMessage(error, 'Team could not be created.'));
    }
  },

  updateTeam: async (id: string, team: Partial<Team>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const updates: Record<string, unknown> = {};
    if (team.teamName !== undefined) updates.team_name = team.teamName;
    if (team.teamCode !== undefined) updates.team_code = team.teamCode;
    if (team.teamType !== undefined) updates.team_type = team.teamType;
    if (team.status !== undefined) updates.status = team.status;
    const { error } = await supabase.from('teams').update(updates).eq('id', id);
    return !error;
  },

  deleteTeam: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from('teams').delete().eq('id', id);
    return !error;
  },

  getTeamMembers: async (): Promise<TeamMember[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('team_members').select('*');
      if (error || !data) return [];
      return data.map((m) => ({
        id: m.id,
        teamId: m.team_id,
        userId: m.user_id,
        gameName: m.game_name,
        freeFireId: m.free_fire_uid || '',
        joinedAt: m.joined_at,
      }));
    } catch {
      return [];
    }
  },

  addTeamMember: async (member: Omit<TeamMember, 'id' | 'joinedAt'>): Promise<TeamMember | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('team_members')
        .insert({
          team_id: member.teamId,
          user_id: member.userId,
          game_name: member.gameName,
          free_fire_uid: member.freeFireId,
        })
        .select('*')
        .single();

      if (error) throw new Error(getSupabaseErrorMessage(error, 'You could not be added to the team.'));
      if (!data) throw new Error('You could not be added to the team. No record was returned.');
      return {
        id: data.id,
        teamId: data.team_id,
        userId: data.user_id,
        gameName: data.game_name,
        freeFireId: data.free_fire_uid || '',
        joinedAt: data.joined_at,
      };
    } catch (error) {
      throw new Error(getSupabaseErrorMessage(error, 'You could not be added to the team.'));
    }
  },

  // ==========================================
  // MATCHES
  // ==========================================
  getMatches: async (): Promise<Match[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('matches').select('*');
      if (error || !data) return [];
      return data.map((m) => ({
        id: m.id,
        tournamentId: m.tournament_id,
        roundNumber: m.round_number || 1,
        playerOrTeam1Id: m.player_or_team1_id || '',
        playerOrTeam2Id: m.player_or_team2_id || '',
        playerOrTeam1Name: m.player_or_team1_name || '',
        playerOrTeam2Name: m.player_or_team2_name || '',
        winnerId: m.winner_id,
        eliminatedId: m.eliminated_id,
        isBye: m.is_bye || false,
        status: m.status || 'PENDING',
        score1: m.score1,
        score2: m.score2,
        scheduledTime: m.scheduled_time,
      }));
    } catch {
      return [];
    }
  },

  updateMatch: async (id: string, match: Partial<Match>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const updates: Record<string, unknown> = {};
    if (match.winnerId !== undefined) updates.winner_id = match.winnerId;
    if (match.eliminatedId !== undefined) updates.eliminated_id = match.eliminatedId;
    if (match.status !== undefined) updates.status = match.status;
    if (match.score1 !== undefined) updates.score1 = match.score1;
    if (match.score2 !== undefined) updates.score2 = match.score2;
    const { error } = await supabase.from('matches').update(updates).eq('id', id);
    return !error;
  },

  deleteMatch: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from('matches').delete().eq('id', id);
    return !error;
  },

  // ==========================================
  // WINNERS
  // ==========================================
  getWinners: async (): Promise<Winner[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('winners').select('*');
      if (error || !data) return [];
      return data.map((w) => ({
        id: w.id,
        tournamentId: w.tournament_id,
        playerOrTeamId: w.player_or_team_id || '',
        playerOrTeamName: w.player_or_team_name,
        position: w.position,
        prizeAmount: Number(w.prize_amount) || 0,
        winnerImage: w.winner_image,
        paymentStatus: w.payment_status || 'PAID',
      }));
    } catch {
      return [];
    }
  },

  createWinner: async (winner: Omit<Winner, 'id'>): Promise<Winner | null> => {
    if (!isSupabaseConfigured) return null;
    try {
      const { data, error } = await supabase
        .from('winners')
        .insert({
          tournament_id: winner.tournamentId,
          player_or_team_id: winner.playerOrTeamId,
          player_or_team_name: winner.playerOrTeamName,
          position: winner.position,
          prize_amount: winner.prizeAmount,
          winner_image: winner.winnerImage,
          payment_status: winner.paymentStatus || 'PAID',
        })
        .select('*')
        .single();

      if (error || !data) return null;
      return {
        id: data.id,
        tournamentId: data.tournament_id,
        playerOrTeamId: data.player_or_team_id || '',
        playerOrTeamName: data.player_or_team_name,
        position: data.position,
        prizeAmount: Number(data.prize_amount) || 0,
        winnerImage: data.winner_image,
        paymentStatus: data.payment_status,
      };
    } catch {
      return null;
    }
  },

  deleteWinner: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('winners').delete().eq('id', id);
      return !error;
    } catch {
      return false;
    }
  },

  updateWinner: async (id: string, winner: Partial<Winner>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const updates: Record<string, unknown> = {};
    if (winner.playerOrTeamName !== undefined) updates.player_or_team_name = winner.playerOrTeamName;
    if (winner.position !== undefined) updates.position = winner.position;
    if (winner.prizeAmount !== undefined) updates.prize_amount = winner.prizeAmount;
    if (winner.paymentStatus !== undefined) updates.payment_status = winner.paymentStatus;
    const { error } = await supabase.from('winners').update(updates).eq('id', id);
    return !error;
  },

  deleteUser: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from('users').delete().eq('id', id);
    return !error;
  },

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  getNotifications: async (): Promise<Notification[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('notifications').select('*');
      if (error || !data) return [];
      return data.map((n) => ({
        id: n.id,
        userId: n.user_id,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        createdAt: n.created_at,
      }));
    } catch {
      return [];
    }
  },

  createNotification: async (notif: Omit<Notification, 'id' | 'createdAt'>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      const { error } = await supabase.from('notifications').insert({
        user_id: notif.userId,
        title: notif.title,
        message: notif.message,
        is_read: notif.isRead || false,
      });
      return !error;
    } catch {
      return false;
    }
  },

  getPayments: async (): Promise<Payment[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((p) => ({
        id: p.id,
        registrationId: p.registration_id,
        userId: p.user_id,
        tournamentId: p.tournament_id,
        amount: Number(p.amount) || 0,
        paymentMethod: p.payment_method || '',
        screenshotUrl: p.screenshot_url,
        status: p.status,
        createdAt: p.created_at,
      }));
    } catch {
      return [];
    }
  },

  getAnnouncements: async (): Promise<Announcement[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
      if (error || !data) return [];
      return data.map((a) => ({
        id: a.id,
        title: a.title,
        message: a.message,
        isActive: a.is_active,
        createdBy: a.created_by,
        createdAt: a.created_at,
        updatedAt: a.updated_at,
      }));
    } catch {
      return [];
    }
  },

  createAnnouncement: async (announcement: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Announcement | null> => {
    if (!isSupabaseConfigured) return null;
    const { data, error } = await supabase.from('announcements').insert({
      title: announcement.title,
      message: announcement.message,
      is_active: announcement.isActive,
      created_by: announcement.createdBy,
    }).select('*').single();
    if (error || !data) return null;
    return { id: data.id, title: data.title, message: data.message, isActive: data.is_active, createdBy: data.created_by, createdAt: data.created_at, updatedAt: data.updated_at };
  },

  updateAnnouncement: async (id: string, updates: Partial<Announcement>): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.message !== undefined) dbUpdates.message = updates.message;
    if (updates.isActive !== undefined) dbUpdates.is_active = updates.isActive;
    const { error } = await supabase.from('announcements').update(dbUpdates).eq('id', id);
    return !error;
  },

  deleteAnnouncement: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    return !error;
  },

  // ==========================================
  // LIVE BROADCASTS
  // ==========================================
  getLiveBroadcasts: async (): Promise<LiveBroadcast[]> => {
    if (!isSupabaseConfigured) return [];
    try {
      const { data, error } = await supabase.from('live_broadcasts').select('*');
      if (error || !data) return [];
      return data.map((b) => ({
        id: b.id,
        platform: b.platform,
        url: b.url,
        title: b.title,
        isActive: b.is_active,
      }));
    } catch {
      return [];
    }
  },

  saveLiveBroadcasts: async (broadcasts: LiveBroadcast[]): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    try {
      for (const b of broadcasts) {
        await supabase.from('live_broadcasts').upsert({
          id: b.id,
          platform: b.platform,
          url: b.url,
          title: b.title,
          is_active: b.isActive,
        });
      }
      return true;
    } catch {
      return false;
    }
  },

  deleteLiveBroadcast: async (id: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { error } = await supabase.from('live_broadcasts').delete().eq('id', id);
    return !error;
  },

  updateRules: async (rulesText: string): Promise<boolean> => {
    if (!isSupabaseConfigured) return false;
    const { data } = await supabase.from('app_settings').select('id').limit(1).maybeSingle();
    const result = data?.id
      ? await supabase.from('app_settings').update({ rules_text: rulesText, updated_at: new Date().toISOString() }).eq('id', data.id)
      : await supabase.from('app_settings').insert({ rules_text: rulesText });
    return !result.error;
  },

  getRules: async (): Promise<string> => {
    if (!isSupabaseConfigured) return '';
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('rules_text')
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data?.rules_text || '';
    } catch (error) {
      console.error('Could not load platform rules:', getSupabaseErrorMessage(error));
      return '';
    }
  },

  // ==========================================
  // STORAGE IMAGE UPLOAD HELPER
  // ==========================================
  uploadImage: async (
    bucket: 'avatars' | 'payments' | 'tournaments',
    file: File | Blob
  ): Promise<string> => {
    if (!isSupabaseConfigured) {
      throw new Error('Supabase Storage is not configured. Set the VITE_SUPABASE_* environment variables.');
    }

    try {
      const ext = file instanceof File && file.name.includes('.') ? file.name.split('.').pop() : 'png';
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      return await uploadToSupabaseStorage(bucket, fileName, file);
    } catch (err) {
      console.error('Storage upload failed:', err);
      throw err;
    }
  },
};
