import React from 'react';
import { Tournament, Registration } from '../types';

interface StatsSectionProps {
  tournaments: Tournament[];
  registrations: Registration[];
}

export const StatsSection: React.FC<StatsSectionProps> = ({ tournaments, registrations }) => {
  const totalTournaments = tournaments.length;
  const totalPlayers = registrations.length;
  const totalPrizeMoney = tournaments.reduce((acc, t) => acc + (t.prizeMoney || 0), 0);

  return (
    <section className="bg-[#1d1f28] py-16 border-y border-[#3b494b]/30">
      <div className="max-w-7xl mx-auto px-4 md:px-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
        <div className="group">
          <div className="text-[#00f0ff] font-display text-4xl md:text-5xl font-bold group-hover:scale-105 transition-transform duration-300">
            {totalTournaments.toLocaleString()}
          </div>
          <div className="text-[#b9cacb] font-display text-xs tracking-[0.2em] uppercase mt-2 font-bold">
            TOTAL TOURNAMENTS
          </div>
        </div>

        <div className="group border-y sm:border-y-0 sm:border-x border-[#3b494b]/30 py-6 sm:py-0">
          <div className="text-[#00f0ff] font-display text-4xl md:text-5xl font-bold group-hover:scale-105 transition-transform duration-300">
            {totalPlayers.toLocaleString()}
          </div>
          <div className="text-[#b9cacb] font-display text-xs tracking-[0.2em] uppercase mt-2 font-bold">
            TOTAL PLAYERS REGISTERED
          </div>
        </div>

        <div className="group">
          <div className="text-[#00f0ff] font-display text-4xl md:text-5xl font-bold group-hover:scale-105 transition-transform duration-300">
            ${totalPrizeMoney.toLocaleString()}
          </div>
          <div className="text-[#b9cacb] font-display text-xs tracking-[0.2em] uppercase mt-2 font-bold">
            TOTAL PRIZE POOL
          </div>
        </div>
      </div>
    </section>
  );
};
