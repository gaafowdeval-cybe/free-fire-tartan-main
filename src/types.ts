export type Role = 'admin' | 'captain' | 'player';

export type TournamentType = 'SOLO' | 'DUO' | 'SQUAD';

export type FeeType = 'FREE' | 'PAID';

export type TournamentStatus = 
  | 'UPCOMING'
  | 'OPEN REGISTRATION'
  | 'CLOSED REGISTRATION'
  | 'LIVE / PLAYING'
  | 'FINISHED';

export type RegistrationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type MatchStatus = 'PENDING' | 'LIVE' | 'FINISHED';

export interface User {
  id: string;
  fullName: string;
  username: string;
  password?: string;
  whatsapp: string;
  role: Role;
  profileImage?: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  type: TournamentType;
  feeType: FeeType;
  image: string;
  entryFee: number;
  prizeMoney: number;
  maxParticipants: number;
  registrationStart: string;
  registrationDeadline: string;
  startDate: string;
  startTime: string;
  status: TournamentStatus;
  rules: string;
  winnersCount: number;
  region?: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  tournamentId: string;
  gameName: string;
  freeFireId: string;
  whatsapp: string;
  playerImage?: string;
  paymentScreenshot?: string;
  status: RegistrationStatus;
  teamId?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  tournamentId: string;
  teamName: string;
  captainId: string;
  teamCode: string;
  teamType: 'DUO' | 'SQUAD';
  status: 'PENDING' | 'COMPLETE';
  createdAt: string;
}

export interface TeamMember {
  id: string;
  teamId: string;
  userId: string;
  gameName: string;
  freeFireId: string;
  joinedAt: string;
}

export interface Match {
  id: string;
  tournamentId: string;
  roundNumber: number;
  playerOrTeam1Id: string;
  playerOrTeam2Id?: string; // Optional if BYE
  playerOrTeam1Name: string;
  playerOrTeam2Name?: string;
  winnerId?: string;
  eliminatedId?: string;
  isBye?: boolean;
  status: MatchStatus;
  score1?: number;
  score2?: number;
  scheduledTime?: string;
}

export interface Round {
  id: string;
  tournamentId: string;
  roundNumber: number;
  status: 'PENDING' | 'ACTIVE' | 'FINISHED';
  createdAt: string;
}

export interface Winner {
  id: string;
  tournamentId: string;
  playerOrTeamId: string;
  playerOrTeamName: string;
  position: number; // 1 for 1st, 2 for 2nd, etc.
  prizeAmount: number;
  winnerImage?: string;
  paymentStatus: 'PAID' | 'PENDING';
}

export interface Notification {
  id: string;
  userId: string; // 'admin' or specific user ID
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  registrationId: string;
  userId: string;
  tournamentId: string;
  amount: number;
  paymentMethod: string;
  screenshotUrl?: string;
  status: RegistrationStatus;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LiveBroadcast {
  id: string;
  platform: 'YouTube' | 'TikTok' | 'Facebook';
  url: string;
  title: string;
  isActive: boolean;
}

export interface AppSettings {
  whatsappNumber: string;
  tiktokUrl: string;
  paymentNumber: string;
}

