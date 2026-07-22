import React from 'react';
import { LiveBroadcast } from '../types';
import { Tv, Play, ExternalLink, Radio } from 'lucide-react';

interface LiveBroadcastViewProps {
  broadcasts: LiveBroadcast[];
}

export const LiveBroadcastView: React.FC<LiveBroadcastViewProps> = ({ broadcasts }) => {
  const activeBroadcast = broadcasts.find((b) => b.isActive) || broadcasts[0];

  return (
    <div className="pt-28 pb-20 px-4 md:px-10 max-w-7xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600/20 text-red-400 rounded-full border border-red-500/30 mb-2">
          <Radio className="w-4 h-4 animate-pulse" />
          <span className="text-[10px] font-display font-bold uppercase tracking-widest">
            OFFICIAL LIVE TRANSMISSION
          </span>
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-extrabold text-white uppercase italic">
          FREE FIRE LIVE ARENA
        </h1>
        <p className="text-xs md:text-sm text-[#b9cacb] mt-2">
          Watch tournament matches broadcasted live on YouTube, TikTok, and Facebook.
        </p>
      </div>

      {/* Main Player Visual */}
      {activeBroadcast ? (
        <div className="glass-panel p-4 md:p-6 rounded-2xl border border-red-500/30 space-y-4">
          <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden flex items-center justify-center group border border-[#3b494b]">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/60"></div>

            <a
              href={activeBroadcast.url}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 flex flex-col items-center justify-center gap-3 p-6 bg-red-600/90 text-white rounded-2xl hover:scale-110 transition-transform shadow-[0_0_30px_rgba(220,38,38,0.8)] cursor-pointer"
            >
              <Play className="w-10 h-10 fill-current" />
              <span className="font-display font-extrabold text-sm uppercase tracking-wider">
                WATCH LIVE ON {activeBroadcast.platform.toUpperCase()}
              </span>
            </a>

            <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
              <div>
                <span className="px-2.5 py-0.5 bg-red-600 text-white font-display text-[10px] font-bold rounded uppercase animate-pulse">
                  LIVE BROADCAST
                </span>
                <h3 className="font-display font-bold text-lg md:text-2xl text-white mt-1">
                  {activeBroadcast.title}
                </h3>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center rounded-2xl border border-[#3b494b]/30 max-w-xl mx-auto space-y-2">
          <Tv className="w-12 h-12 text-red-500 opacity-40 mx-auto mb-2" />
          <h4 className="font-display font-bold text-white text-base">NO LIVE BROADCASTS SCHEDULED</h4>
          <p className="text-xs text-[#b9cacb]">
            Official YouTube, TikTok, and Facebook live transmissions will be listed here when scheduled by admins.
          </p>
        </div>
      )}

      {/* Broadcast Cards Grid */}
      {broadcasts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {broadcasts.map((b) => (
            <div
              key={b.id}
              className={`glass-card p-6 rounded-2xl border transition-all ${
                b.isActive
                  ? 'border-red-500/80 shadow-[0_0_20px_rgba(220,38,38,0.2)]'
                  : 'border-[#3b494b]/30'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <span className="font-display font-bold text-xs text-[#00f0ff] uppercase">
                  {b.platform} STREAM
                </span>
                {b.isActive ? (
                  <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase rounded animate-pulse">
                    ON AIR
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-500 uppercase">OFFLINE</span>
                )}
              </div>

              <h4 className="font-display font-bold text-white text-base mb-4">{b.title}</h4>

              <a
                href={b.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-[#33343e] hover:bg-[#3b494b] text-[#00f0ff] font-display text-xs font-bold uppercase rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <span>Watch Stream</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
