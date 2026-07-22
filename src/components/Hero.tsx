import React from 'react';
import { Shield, Play, ArrowRight, Smartphone, CheckCircle } from 'lucide-react';
import { LiveBroadcast } from '../types';

interface HeroProps {
  onJoinTournament: () => void;
  onViewTournaments: () => void;
  liveBroadcasts: LiveBroadcast[];
  onOpenLive: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onJoinTournament,
  onViewTournaments,
  liveBroadcasts,
  onOpenLive,
}) => {
  const activeStream = liveBroadcasts.find((b) => b.isActive) || liveBroadcasts[0];

  return (
    <div className="relative pt-20 overflow-hidden">
      {/* Live Now Banner */}
      <div className="bg-[#282a32]/60 backdrop-blur-md py-3 px-4 md:px-10 flex flex-wrap items-center justify-center gap-4 border-b border-[#3b494b]/30">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-ping"></span>
          <span className="text-red-500 font-display font-bold tracking-widest text-xs uppercase">
            LIVE NOW
          </span>
        </div>
        <p className="text-[#e2e1ee] font-medium text-xs md:text-sm">
          {activeStream ? activeStream.title : 'FREE FIRE CHAMPIONSHIP - SEASON 4 FINALS'}
        </p>
        <button
          onClick={onOpenLive}
          className="flex items-center gap-2 px-4 py-1.5 bg-[#FF0000] text-white rounded-full text-xs font-display font-bold hover:bg-red-700 transition-colors cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>WATCH STREAM</span>
        </button>
      </div>

      {/* Hero Body */}
      <section className="relative min-h-[620px] lg:min-h-[720px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0e16] via-transparent to-transparent pointer-events-none"></div>

        <div className="relative w-full max-w-7xl mx-auto px-4 md:px-10 py-12 z-10 flex flex-col lg:flex-row items-center gap-12">
          {/* Left Text */}
          <div className="flex-1 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 bg-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-full">
              <Shield className="w-4 h-4 text-[#00f0ff]" />
              <span className="text-[#00f0ff] font-display text-xs font-bold tracking-wider uppercase">
                THE OFFICIAL COMPETITIVE HUB
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-[80px] leading-none text-[#e2e1ee] mb-6 tracking-tighter uppercase italic font-extrabold">
              COMPETE. SURVIVE.
              <br />
              <span className="text-[#00f0ff] drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">
                BECOME CHAMPION.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-[#b9cacb] max-w-2xl mb-8 leading-relaxed mx-auto lg:mx-0">
              Join competitive Free Fire tournaments, compete against the best players across the region, and fight your way to the top of global leaderboards for massive cash rewards.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button
                onClick={onJoinTournament}
                className="px-8 py-4 bg-[#00f0ff] text-[#00363a] font-display font-bold text-sm sm:text-base uppercase tracking-wider rounded shadow-[0_0_25px_rgba(0,240,255,0.4)] hover:shadow-[0_0_35px_rgba(0,240,255,0.7)] transition-all active:scale-95 cursor-pointer"
              >
                JOIN TOURNAMENT
              </button>
              <button
                onClick={onViewTournaments}
                className="px-8 py-4 border-2 border-[#3b494b] text-[#e2e1ee] font-display font-bold text-sm sm:text-base uppercase tracking-wider rounded hover:bg-[#33343e] hover:border-[#00f0ff]/50 transition-all active:scale-95 cursor-pointer"
              >
                VIEW TOURNAMENTS
              </button>
            </div>
          </div>

          {/* Right Visual Image */}
          <div className="flex-1 relative hidden lg:block">
            <div className="relative w-full aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-[#00f0ff]/20 blur-[100px] rounded-full"></div>
              <img
                src="https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80"
                alt="Free Fire Cybernetic Soldier"
                className="relative z-10 w-full h-full object-cover rounded-2xl border-2 border-[#00f0ff]/30 shadow-[0_0_40px_rgba(0,240,255,0.3)] filter contrast-110"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
