import React from 'react';
import { MessageSquare } from 'lucide-react';

interface FloatingContactButtonsProps {
  whatsappNumber?: string;
  tiktokUrl?: string;
}

export const FloatingContactButtons: React.FC<FloatingContactButtonsProps> = ({
  whatsappNumber = '+252617624424',
  tiktokUrl = 'https://www.tiktok.com/@apexneonesports',
}) => {
  const cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, '');
  const whatsappLink = `https://wa.me/${cleanWhatsapp || '252617624424'}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3 pointer-events-auto">
      {/* WhatsApp Floating Button */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full shadow-[0_0_20px_rgba(37,211,102,0.5)] hover:shadow-[0_0_30px_rgba(37,211,102,0.8)] transition-all transform hover:scale-110 cursor-pointer"
        title="Chat on WhatsApp (+252 617624424)"
      >
        <MessageSquare className="w-7 h-7 fill-current" />
        
        {/* Tooltip */}
        <span className="absolute right-16 bg-[#11131b] text-white text-xs font-bold font-display px-3 py-1.5 rounded-lg border border-[#25D366]/40 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          WhatsApp Support (+252 617624424)
        </span>
      </a>

      {/* TikTok Floating Button */}
      <a
        href={tiktokUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-black hover:bg-zinc-900 text-white rounded-full border border-pink-500/50 shadow-[0_0_20px_rgba(255,0,128,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.6)] transition-all transform hover:scale-110 cursor-pointer overflow-hidden"
        title="Follow on TikTok"
      >
        {/* TikTok Custom SVG Logo */}
        <svg
          className="w-7 h-7"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
            className="text-[#00f0ff] stroke-current"
          />
          <path
            d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"
            className="text-[#ff0050] stroke-current translate-x-[1px] translate-y-[1px]"
          />
        </svg>

        {/* Tooltip */}
        <span className="absolute right-16 bg-[#11131b] text-white text-xs font-bold font-display px-3 py-1.5 rounded-lg border border-pink-500/40 shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Follow TikTok Live
        </span>
      </a>
    </div>
  );
};
