import React, { useState } from 'react';
import { Tournament, Team, TeamMember, Registration, Match, Winner, User } from '../types';
import { Trophy, Award, Flame, Crown, Users, User as UserIcon, Shield, Sparkles, ChevronDown, CheckCircle } from 'lucide-react';

interface RankingsViewProps {
  tournaments?: Tournament[];
  teams?: Team[];
  teamMembers?: TeamMember[];
  registrations?: Registration[];
  matches?: Match[];
  winners?: Winner[];
  users?: User[];
}

export const RankingsView: React.FC<RankingsViewProps> = ({
  tournaments = [],
  teams = [],
  teamMembers = [],
  registrations = [],
  matches = [],
  winners = [],
  users = [],
}) => {
  // Selected Competition state (default to first tournament)
  const [selectedTourneyId, setSelectedTourneyId] = useState<string>(
    tournaments[0]?.id || 'tourney-1'
  );

  const currentTournament =
    tournaments.find((t) => t.id === selectedTourneyId) || tournaments[0];

  // Helper to get fallback avatar
  const getAvatar = (name: string, customImg?: string) => {
    if (customImg && customImg.startsWith('http')) return customImg;
    const matchUser = users.find((u) => u.fullName === name || u.username === name);
    if (matchUser?.profileImage) return matchUser.profileImage;
    return `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80`;
  };

  // Build competition standings dynamically for selected tournament
  const tourneyRegistrations = registrations.filter(
    (r) => r.tournamentId === currentTournament?.id && r.status === 'APPROVED'
  );
  const tourneyTeams = teams.filter((t) => t.tournamentId === currentTournament?.id);
  const tourneyWinners = winners.filter((w) => w.tournamentId === currentTournament?.id);

  // Derive active standings list for selected tournament from real winners or teams
  let activeStandings: {
    rank: number;
    id: string;
    name: string;
    type: string;
    wins: number;
    kills: number;
    points: number;
    image: string;
    captainName: string;
    squadMembers: { name: string; image: string }[];
  }[] = [];

  if (tourneyWinners.length > 0) {
    activeStandings = tourneyWinners
      .map((w) => {
        const matchTeam = tourneyTeams.find((t) => t.teamName.toLowerCase() === w.playerOrTeamName.toLowerCase());
        const squad = matchTeam
          ? teamMembers
              .filter((tm) => tm.teamId === matchTeam.id)
              .map((tm) => ({
                name: tm.gameName,
                image: getAvatar(tm.gameName),
              }))
          : [{ name: w.playerOrTeamName, image: w.winnerImage || getAvatar(w.playerOrTeamName) }];

        return {
          rank: w.position,
          id: w.id,
          name: w.playerOrTeamName,
          type: currentTournament?.type || 'SQUAD',
          wins: w.position === 1 ? 1 : 0,
          kills: 0,
          points: w.prizeAmount || 0,
          image: w.winnerImage || getAvatar(w.playerOrTeamName),
          captainName: w.playerOrTeamName,
          squadMembers: squad.length > 0 ? squad : [{ name: w.playerOrTeamName, image: getAvatar(w.playerOrTeamName) }],
        };
      })
      .sort((a, b) => a.rank - b.rank);
  }

  const leader = activeStandings[0];
  const runnerUp = activeStandings[1];

  // Lead Margin calculation
  const leadPointMargin = leader && runnerUp ? leader.points - runnerUp.points : leader ? leader.points : 0;
  const leadKillMargin = leader && runnerUp ? leader.kills - runnerUp.kills : leader ? leader.kills : 0;

  return (
    <div className="pt-28 pb-20 px-4 md:px-10 max-w-7xl mx-auto space-y-10">
      {/* Header & Competition Selector */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full">
          <Sparkles className="w-4 h-4 text-[#00f0ff] animate-pulse" />
          <span className="text-xs font-display font-bold text-[#00f0ff] uppercase tracking-wider">
            OFFICIAL COMPETITION LEADERBOARDS
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white uppercase italic tracking-tight">
          COMPETITION LEADER & STANDINGS
        </h1>
        <p className="text-xs md:text-sm text-[#b9cacb]">
          Select any competition below to inspect the leading team or individual player, view their photo rosters, and analyze their lead gap margin over rivals.
        </p>

        {/* Competition Dropdown Selector */}
        {tournaments.length > 0 && (
          <div className="pt-2 flex justify-center">
            <div className="relative inline-block w-full max-w-md">
              <label className="block text-left text-[11px] font-display font-bold text-[#00f0ff] uppercase mb-1">
                SELECT COMPETITION:
              </label>
              <select
                value={selectedTourneyId}
                onChange={(e) => setSelectedTourneyId(e.target.value)}
                className="w-full py-3.5 px-4 bg-[#191b24] border-2 border-[#00f0ff]/60 rounded-xl text-white font-display font-bold text-sm focus:outline-none focus:border-[#00f0ff] shadow-[0_0_20px_rgba(0,240,255,0.2)] cursor-pointer"
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#191b24] text-white">
                    🏆 {t.name} ({t.type} • ${t.prizeMoney} PRIZE) - {t.status}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Selected Tournament Info Badge */}
      {currentTournament && (
        <div className="glass-panel p-4 rounded-xl border border-[#3b494b]/40 flex flex-wrap items-center justify-between gap-4 bg-[#141722]/80">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#00f0ff]/10 rounded-lg border border-[#00f0ff]/30">
              <Trophy className="w-6 h-6 text-[#00f0ff]" />
            </div>
            <div>
              <h2 className="font-display text-lg font-extrabold text-white uppercase">
                {currentTournament.name}
              </h2>
              <p className="text-xs text-[#b9cacb]">
                FORMAT: <span className="text-[#00f0ff] font-bold">{currentTournament.type}</span> | PRIZE: <span className="text-emerald-400 font-bold">${currentTournament.prizeMoney}</span> | STATUS: <span className="text-amber-400 font-bold">{currentTournament.status}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-[#282a32] text-xs font-display font-bold text-[#b9cacb] rounded border border-[#3b494b]">
              REGION: {currentTournament.region || 'GLOBAL'}
            </span>
          </div>
        </div>
      )}

      {/* LEADER SHOWCASE CARD (Individual or Team) */}
      {leader && (
        <div className="glass-panel p-6 md:p-8 rounded-2xl border-2 border-amber-400/90 bg-gradient-to-br from-[#1c1e2b] via-[#11131c] to-[#0c0e16] shadow-[0_0_40px_rgba(251,191,36,0.35)] relative overflow-hidden space-y-6">
          {/* Top Crown Banner */}
          <div className="flex flex-wrap items-center justify-between border-b border-amber-400/30 pb-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-400 text-black rounded-xl shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse">
                <Crown className="w-7 h-7 fill-current" />
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-amber-400 text-black font-display text-[10px] font-extrabold rounded uppercase tracking-wider">
                  CURRENT COMPETITION LEADER (RANK #1)
                </span>
                <h2 className="font-display text-2xl md:text-4xl font-extrabold text-amber-400 uppercase italic mt-1">
                  {leader.name}
                </h2>
              </div>
            </div>

            {/* Lead Margin Callout Box */}
            <div className="px-5 py-3 bg-amber-400/10 border-2 border-amber-400/60 rounded-xl text-center shadow-[0_0_20px_rgba(251,191,36,0.2)]">
              <span className="text-[10px] font-display font-bold text-amber-300 uppercase tracking-widest block">
                LEAD MARGIN OVER 2ND PLACE
              </span>
              <p className="font-display text-lg md:text-xl font-extrabold text-white">
                +{leadPointMargin} PTS LEAD
              </p>
              <p className="text-[10px] text-[#00f0ff] font-bold">
                ({leadKillMargin} Kills Advantage over {runnerUp ? runnerUp.name : 'Runner Up'})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Leader Photo & Squad Rosters */}
            <div className="lg:col-span-1 text-center space-y-4">
              <div className="relative inline-block">
                <img
                  src={leader.image}
                  alt={leader.name}
                  className="w-36 h-36 md:w-44 md:h-44 rounded-2xl object-cover mx-auto border-4 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                />
                <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-black font-display font-black text-xs uppercase rounded-full shadow-md">
                  1ST PLACE LEADER
                </span>
              </div>

              <div>
                <p className="text-xs font-display font-bold text-[#00f0ff] uppercase">
                  {leader.type} COMPETITION CHAMPION
                </p>
                <p className="text-xs text-[#b9cacb] mt-0.5">
                  Captain / Primary Player: <span className="text-white font-bold">{leader.captainName}</span>
                </p>
              </div>
            </div>

            {/* Photos & Roster Members */}
            <div className="lg:col-span-2 space-y-4 bg-[#141622]/90 p-5 rounded-xl border border-[#3b494b]/40">
              <div className="flex items-center justify-between border-b border-[#3b494b]/30 pb-2">
                <span className="font-display font-bold text-xs text-[#00f0ff] uppercase flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  LEADER ROSTER & PLAYER PHOTOS ({leader.squadMembers.length} PLAYERS)
                </span>
                <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> VERIFIED COMPETITOR
                </span>
              </div>

              {/* Roster Photos Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {leader.squadMembers.map((member, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#191b26] rounded-xl border border-amber-400/30 flex flex-col items-center text-center space-y-2 hover:border-amber-400 transition-colors"
                  >
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover border-2 border-amber-400/80 shadow-md"
                    />
                    <p className="font-display font-bold text-xs text-white line-clamp-1">
                      {member.name}
                    </p>
                    <span className="text-[9px] px-2 py-0.5 bg-amber-400/20 text-amber-300 font-bold rounded">
                      {idx === 0 ? 'CAPTAIN' : `MEMBER #${idx + 1}`}
                    </span>
                  </div>
                ))}
              </div>

              {/* Leader Key Performance Indicators */}
              <div className="grid grid-cols-3 gap-4 pt-3 text-center">
                <div className="p-3 bg-[#1c1e2b] rounded-lg border border-[#3b494b]/30">
                  <span className="text-[10px] text-[#b9cacb] font-display uppercase block">TOTAL POINTS</span>
                  <span className="font-display font-extrabold text-xl text-amber-400">{leader.points}</span>
                </div>
                <div className="p-3 bg-[#1c1e2b] rounded-lg border border-[#3b494b]/30">
                  <span className="text-[10px] text-[#b9cacb] font-display uppercase block">ELIMINATION KILLS</span>
                  <span className="font-display font-extrabold text-xl text-white">{leader.kills}</span>
                </div>
                <div className="p-3 bg-[#1c1e2b] rounded-lg border border-[#3b494b]/30">
                  <span className="text-[10px] text-[#b9cacb] font-display uppercase block">TOURNAMENT WINS</span>
                  <span className="font-display font-extrabold text-xl text-[#00f0ff]">{leader.wins}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL STANDINGS TABLE FOR SELECTED COMPETITION */}
      <div className="glass-panel p-6 rounded-2xl border border-[#3b494b]/30 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#3b494b]/30 pb-3">
          <h3 className="font-display font-extrabold text-lg text-white uppercase italic flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#00f0ff]" />
            COMPETITION STANDINGS & MARGIN GAP TABLE
          </h3>
          {currentTournament && (
            <span className="text-xs text-[#b9cacb]">
              TOURNAMENT: <span className="text-white font-bold">{currentTournament.name}</span>
            </span>
          )}
        </div>

        {activeStandings.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <Trophy className="w-10 h-10 text-[#00f0ff] opacity-40 mx-auto mb-2" />
            <h4 className="font-display font-bold text-white text-base">NO STANDINGS RECORDED YET</h4>
            <p className="text-xs text-[#b9cacb] max-w-md mx-auto">
              Standings and leaderboard statistics will appear here once tournament matches conclude and official winners are published.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#191b24] text-[#00f0ff] font-display uppercase border-b border-[#3b494b]/40">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Competitor Photo</th>
                  <th className="p-3">Individual / Squad Name</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Kills</th>
                  <th className="p-3">Points</th>
                  <th className="p-3 text-right">Margin Gap behind #1</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3b494b]/20">
                {activeStandings.map((item) => {
                  const isLeader = item.rank === 1;
                  const pointGap = leader ? leader.points - item.points : 0;

                  return (
                    <tr
                      key={item.id || item.rank}
                      className={`transition-colors ${
                        isLeader
                          ? 'bg-amber-400/10 font-bold border-l-4 border-amber-400'
                          : 'hover:bg-[#191b24]/50'
                      }`}
                    >
                      <td className="p-3 font-display font-bold">
                        {isLeader ? (
                          <span className="px-2 py-1 bg-amber-400 text-black text-[10px] font-extrabold rounded flex items-center gap-1 w-fit">
                            <Crown className="w-3 h-3 fill-current" /> #1 LEADER
                          </span>
                        ) : (
                          <span className="text-gray-300">#{item.rank}</span>
                        )}
                      </td>

                      <td className="p-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className={`w-10 h-10 rounded-full object-cover border ${
                            isLeader ? 'border-amber-400 shadow-md' : 'border-gray-600'
                          }`}
                        />
                      </td>

                      <td className="p-3 font-bold text-white">
                        <div>
                          <span>{item.name}</span>
                          {item.squadMembers && item.squadMembers.length > 1 && (
                            <p className="text-[10px] text-[#b9cacb] font-normal">
                              {item.squadMembers.map((m) => m.name).join(', ')}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-3 font-semibold text-[#00f0ff]">{item.type}</td>
                      <td className="p-3 text-white font-bold">{item.kills} kills</td>
                      <td className="p-3 font-bold text-amber-400">{item.points} pts</td>

                      <td className="p-3 text-right font-display font-bold">
                        {isLeader ? (
                          <span className="text-emerald-400 font-extrabold">CURRENT LEADER</span>
                        ) : (
                          <span className="text-red-400">-{pointGap} PTS</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
