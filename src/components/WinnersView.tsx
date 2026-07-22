import React from 'react';
import { Winner, Tournament } from '../types';
import { Trophy, Award, CheckCircle2 } from 'lucide-react';

interface WinnersViewProps {
  winners: Winner[];
  tournaments: Tournament[];
}

export const WinnersView: React.FC<WinnersViewProps> = ({ winners, tournaments }) => {
  return (
    <div className="pt-28 pb-20 px-4 md:px-10 max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-display font-bold text-[#00f0ff] uppercase tracking-widest">
          VICTORY RECAP
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white uppercase italic mt-1">
          TOURNAMENT CHAMPIONS
        </h1>
        <p className="text-xs md:text-sm text-[#b9cacb] mt-2">
          Verified tournament winners and cash payout receipts log.
        </p>
      </div>

      {winners.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#3b494b]/30 max-w-xl mx-auto space-y-2">
          <Trophy className="w-12 h-12 text-amber-400 opacity-40 mx-auto mb-2" />
          <h4 className="font-display font-bold text-white text-base">NO TOURNAMENT CHAMPIONS YET</h4>
          <p className="text-xs text-[#b9cacb]">
            Tournament winners and verified payout records will be displayed here as competitions finish.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {winners.map((winner) => {
            const t = tournaments.find((tour) => tour.id === winner.tournamentId);
            return (
              <div
                key={winner.id}
                className="glass-card p-6 rounded-2xl border-t-4 border-t-amber-400 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="px-2.5 py-1 bg-amber-400/20 text-amber-400 font-display text-[10px] font-bold rounded uppercase">
                      POSITION #{winner.position}
                    </span>
                    <span className="text-xs text-[#00f0ff] font-bold font-display">
                      ${winner.prizeAmount} PRIZE
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-xl text-white">
                    {winner.playerOrTeamName}
                  </h3>
                  <p className="text-xs text-[#b9cacb] font-display uppercase tracking-wider mt-1">
                    {t?.name || 'Apex Neon Championship'}
                  </p>
                </div>

                <div className="pt-4 border-t border-[#3b494b]/30 flex justify-between items-center text-xs">
                  <span className="text-[#b9cacb]">Payout Status:</span>
                  <span className="text-green-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    VERIFIED PAID
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
