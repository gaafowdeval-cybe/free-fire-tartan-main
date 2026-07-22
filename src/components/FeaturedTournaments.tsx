import React, { useState } from 'react';
import { Tournament, TournamentType, TournamentStatus, User, Registration } from '../types';
import { Trophy, Users, Clock, ArrowRight, ShieldAlert, Search, Filter, CheckCircle2 } from 'lucide-react';

interface FeaturedTournamentsProps {
  tournaments: Tournament[];
  currentUser?: User | null;
  registrations?: Registration[];
  onSelectTournament: (tournament: Tournament) => void;
  onRegisterClick: (tournament: Tournament) => void;
}

export const FeaturedTournaments: React.FC<FeaturedTournamentsProps> = ({
  tournaments,
  currentUser,
  registrations = [],
  onSelectTournament,
  onRegisterClick,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filteredTournaments = tournaments.filter((t) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.type.toLowerCase().includes(q) ||
      t.status.toLowerCase().includes(q) ||
      (t.region && t.region.toLowerCase().includes(q));

    const matchType = filterType === 'ALL' || t.type === filterType;
    const matchStatus = filterStatus === 'ALL' || t.status === filterStatus;
    return matchQuery && matchType && matchStatus;
  });

  const getStatusBadge = (status: TournamentStatus) => {
    switch (status) {
      case 'OPEN REGISTRATION':
        return (
          <span className="px-3 py-1 bg-[#00f0ff] text-[#00363a] font-display text-[10px] font-bold rounded-full uppercase tracking-wider shadow-[0_0_10px_rgba(0,240,255,0.4)]">
            OPEN REGISTRATION
          </span>
        );
      case 'LIVE / PLAYING':
        return (
          <span className="px-3 py-1 bg-red-600 text-white font-display text-[10px] font-bold rounded-full uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]">
            LIVE NOW
          </span>
        );
      case 'UPCOMING':
        return (
          <span className="px-3 py-1 bg-[#33343e] text-[#b9cacb] font-display text-[10px] font-bold rounded-full uppercase tracking-wider border border-[#3b494b]">
            UPCOMING
          </span>
        );
      case 'CLOSED REGISTRATION':
        return (
          <span className="px-3 py-1 bg-orange-600/30 text-orange-400 font-display text-[10px] font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
            REGISTRATION CLOSED
          </span>
        );
      case 'FINISHED':
        return (
          <span className="px-3 py-1 bg-gray-800 text-gray-400 font-display text-[10px] font-bold rounded-full uppercase tracking-wider">
            FINISHED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <section className="py-20 px-4 md:px-10 max-w-7xl mx-auto">
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-6 mb-10">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h2 className="font-display text-sm font-bold text-[#00f0ff] uppercase tracking-widest mb-2">
              ACTIVE ARENAS
            </h2>
            <h3 className="font-display text-3xl md:text-4xl font-extrabold text-[#e2e1ee] uppercase">
              FEATURED TOURNAMENTS
            </h3>
          </div>

          {/* Search Input (Requirement 6) */}
          <div className="w-full lg:w-96 relative">
            <Search className="w-5 h-5 text-[#00f0ff] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Tournament Name, Mode (Solo/Duo/Squad), or Status..."
              className="w-full pl-11 pr-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-xl text-white text-xs placeholder:text-[#b9cacb]/60 focus:outline-none focus:border-[#00f0ff] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#b9cacb] hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#3b494b]/20">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-display font-bold text-[#b9cacb] uppercase mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#00f0ff]" /> Mode:
            </span>
            <div className="flex bg-[#191b24] p-1 rounded-lg border border-[#3b494b]/30">
              {['ALL', 'SOLO', 'DUO', 'SQUAD'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-3 py-1.5 rounded-md font-display text-xs font-bold transition-all cursor-pointer ${
                    filterType === type
                      ? 'bg-[#00f0ff] text-[#00363a]'
                      : 'text-[#b9cacb] hover:text-[#00f0ff]'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-display font-bold text-[#b9cacb] uppercase mr-1">Status:</span>
            <div className="flex bg-[#191b24] p-1 rounded-lg border border-[#3b494b]/30">
              {['ALL', 'OPEN REGISTRATION', 'LIVE / PLAYING', 'FINISHED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-md font-display text-xs font-bold transition-all cursor-pointer ${
                    filterStatus === st
                      ? 'bg-[#00f0ff] text-[#00363a]'
                      : 'text-[#b9cacb] hover:text-[#00f0ff]'
                  }`}
                >
                  {st === 'OPEN REGISTRATION' ? 'OPEN' : st === 'LIVE / PLAYING' ? 'LIVE' : st}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Cards Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#3b494b]/30">
          <ShieldAlert className="w-12 h-12 text-[#00f0ff] mx-auto mb-4 opacity-50" />
          <h4 className="font-display text-lg font-bold text-white mb-2">No Tournaments Found</h4>
          <p className="text-[#b9cacb] text-sm">
            Try switching your filters or check back later for upcoming tournament drops.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTournaments.map((tournament) => {
            const isRegistered =
              currentUser &&
              registrations.some((r) => r.tournamentId === tournament.id && r.userId === currentUser.id);

            return (
              <div
                key={tournament.id}
                className={`glass-card group hover:border-[#00f0ff]/50 transition-all duration-300 overflow-hidden rounded-2xl relative border-l-4 ${
                  isRegistered ? 'border-l-emerald-400' : 'border-l-[#00f0ff]'
                } flex flex-col justify-between`}
              >
                {/* Image Header */}
                <div
                  className="h-48 relative overflow-hidden cursor-pointer"
                  onClick={() => onSelectTournament(tournament)}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e16] via-transparent to-transparent z-10"></div>
                  <img
                    src={tournament.image}
                    alt={tournament.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
                    {getStatusBadge(tournament.status)}
                    {isRegistered && (
                      <span className="px-2.5 py-1 bg-emerald-500/90 text-slate-950 font-display text-[10px] font-extrabold rounded-full uppercase tracking-wider flex items-center gap-1 shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                        <CheckCircle2 className="w-3 h-3 text-slate-950" />
                        REGISTERED
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 z-20 px-2.5 py-1 bg-[#0c0e16]/80 backdrop-blur text-[#00f0ff] font-display text-xs font-bold rounded border border-[#00f0ff]/30">
                    {tournament.type}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 relative z-20 flex-1 flex flex-col justify-between">
                  <div>
                    <div
                      className="cursor-pointer mb-4"
                      onClick={() => onSelectTournament(tournament)}
                    >
                      <h4 className="font-display text-xl font-bold text-white uppercase group-hover:text-[#00f0ff] transition-colors">
                        {tournament.name}
                      </h4>
                      <p className="text-[#b9cacb] text-xs font-display uppercase tracking-wider mt-1">
                        {tournament.type} BATTLE ROYALE • {tournament.region || 'GLOBAL'}
                      </p>
                    </div>

                    {/* Prize & Entry Fee */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-[#33343e]/40 p-3 rounded-lg border border-[#3b494b]/20">
                        <p className="text-[#b9cacb] text-[10px] font-display uppercase tracking-wider">
                          PRIZE POOL
                        </p>
                        <p className="text-[#00f0ff] font-display text-lg font-bold">
                          ${tournament.prizeMoney}
                        </p>
                      </div>
                      <div className="bg-[#33343e]/40 p-3 rounded-lg border border-[#3b494b]/20">
                        <p className="text-[#b9cacb] text-[10px] font-display uppercase tracking-wider">
                          ENTRY FEE
                        </p>
                        <p className="text-white font-display text-lg font-bold">
                          {tournament.entryFee === 0 ? 'FREE' : `$${tournament.entryFee}`}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => onSelectTournament(tournament)}
                      className="flex-1 py-3 bg-[#33343e] text-[#e2e1ee] font-display text-xs font-bold uppercase tracking-wider rounded hover:bg-[#3b494b] transition-all cursor-pointer"
                    >
                      DETAILS
                    </button>
                    {isRegistered ? (
                      <button
                        onClick={() => onRegisterClick(tournament)}
                        className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-display text-xs font-bold uppercase tracking-wider rounded hover:bg-emerald-500/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        REGISTERED
                      </button>
                    ) : tournament.status === 'OPEN REGISTRATION' ? (
                      <button
                        onClick={() => onRegisterClick(tournament)}
                        className="flex-1 py-3 bg-[#00f0ff] text-[#00363a] font-display text-xs font-bold uppercase tracking-wider rounded hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] active:scale-95 transition-all cursor-pointer"
                      >
                        REGISTER
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
