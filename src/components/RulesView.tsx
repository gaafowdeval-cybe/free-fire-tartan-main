import React from 'react';
import { BookOpen, ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react';

interface RulesViewProps {
  rulesText: string;
}

export const RulesView: React.FC<RulesViewProps> = ({ rulesText }) => {
  return (
    <div className="pt-28 pb-20 px-4 md:px-10 max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs font-display font-bold text-[#00f0ff] uppercase tracking-widest">
          OFFICIAL RULEBOOK
        </span>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white uppercase italic mt-1">
          TOURNAMENT CODE OF CONDUCT
        </h1>
        <p className="text-xs md:text-sm text-[#b9cacb] mt-2">
          All participating players and squad captains are required to comply strictly with the terms outlined below. Failure to adhere will result in disqualification.
        </p>
      </div>

      <div className="glass-panel p-8 rounded-2xl border border-[#3b494b]/40 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-[#3b494b]/30">
          <BookOpen className="w-6 h-6 text-[#00f0ff]" />
          <h3 className="font-display font-bold text-xl text-white uppercase">
            General Tournament Regulations
          </h3>
        </div>

        <div className="whitespace-pre-line text-sm text-[#b9cacb] leading-relaxed space-y-2">
          {rulesText}
        </div>

        <div className="bg-red-950/40 p-5 rounded-xl border border-red-500/30 flex items-start gap-4 mt-6">
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-display font-bold text-red-400 text-sm uppercase">
              Zero Tolerance Anti-Cheat Policy
            </h4>
            <p className="text-xs text-red-200/80 leading-relaxed">
              Any attempt to use modified game APKs, script injectors, auto-aim, radar hacks, or fake payment screenshots will result in immediate lifetime hardware ban and forfeiture of all tournament winnings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
