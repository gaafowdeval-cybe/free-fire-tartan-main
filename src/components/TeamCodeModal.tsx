import React, { useState } from 'react';
import { Tournament, User, Team, TeamMember } from '../types';
import { X, Users, CheckCircle, ShieldAlert } from 'lucide-react';

interface TeamCodeModalProps {
  tournament: Tournament | null;
  currentUser: User | null;
  tournaments?: Tournament[];
  teams?: Team[];
  teamMembers?: TeamMember[];
  onClose: () => void;
  onJoinTeam: (teamCode: string, gameName: string, freeFireId: string) => void;
}

export const TeamCodeModal: React.FC<TeamCodeModalProps> = ({
  tournament,
  currentUser,
  tournaments = [],
  teams = [],
  teamMembers = [],
  onClose,
  onJoinTeam,
}) => {
  const [teamCode, setTeamCode] = useState('');
  const [gameName, setGameName] = useState('');
  const [freeFireId, setFreeFireId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!tournament) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const trimmedCode = teamCode.trim().toUpperCase();
    const trimmedNickname = gameName.trim();
    const trimmedFFId = freeFireId.trim();

    if (!trimmedCode || !trimmedNickname || !trimmedFFId) {
      setErrorMsg('Please enter team code, game nickname, and Free Fire ID.');
      return;
    }

    // 1. Verify Team Code exists
    const matchingCodeTeam = teams.find((t) => t.teamCode.toUpperCase() === trimmedCode);
    if (!matchingCodeTeam) {
      setErrorMsg('Invalid Team Code. Please verify with your team captain.');
      return;
    }

    // 2. REQUIREMENT: One code for ONLY ONE tournament! Verify code belongs to THIS specific tournament
    if (matchingCodeTeam.tournamentId !== tournament.id) {
      const otherTourney = tournaments.find((t) => t.id === matchingCodeTeam.tournamentId);
      setErrorMsg(
        `This Team Code (${trimmedCode}) belongs to another tournament ("${otherTourney?.name || 'different competition'}"). You cannot use it for "${tournament.name}". Every tournament requires its own team code or registration!`
      );
      return;
    }

    const targetTeam = matchingCodeTeam;

    // 3. Capacity Check (Duo: 2, Squad: 4)
    const existingMembers = teamMembers.filter((tm) => tm.teamId === targetTeam.id);
    const capacityLimit = targetTeam.teamType === 'DUO' ? 2 : 4;

    if (existingMembers.length >= capacityLimit) {
      setErrorMsg(`Team is Full! This ${targetTeam.teamType} squad already has ${capacityLimit} members.`);
      return;
    }

    // 4. Duplicate UID Check
    const isDuplicateFFId = existingMembers.some(
      (tm) => tm.freeFireId.toLowerCase() === trimmedFFId.toLowerCase()
    );
    if (isDuplicateFFId) {
      setErrorMsg(`Free Fire UID "${trimmedFFId}" is already registered in this squad.`);
      return;
    }

    onJoinTeam(trimmedCode, trimmedNickname, trimmedFFId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-[#11131b] border border-[#3b494b]/50 rounded-2xl shadow-2xl p-6 md:p-8 my-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#b9cacb] hover:text-white bg-[#191b24] rounded-full cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#00f0ff]/10 text-[#00f0ff] rounded-full flex items-center justify-center mx-auto mb-3 border border-[#00f0ff]/30">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-display font-extrabold text-xl text-white uppercase">
            JOIN SQUAD VIA TEAM CODE
          </h3>
          <p className="text-xs text-[#b9cacb] mt-1">
            Enter the captain's unique Team Code (e.g. <span className="text-[#00f0ff] font-mono">DUO-83921</span>) to complete your roster.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-lg text-red-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-display font-bold text-[#00f0ff] uppercase mb-1">
              Team Code *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. DUO-83921 or SQ-84921"
              value={teamCode}
              onChange={(e) => setTeamCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-[#191b24] border border-[#00f0ff]/50 rounded-lg text-white font-mono text-center font-bold tracking-widest text-lg focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
              Your Game Nickname *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. ViperStrike_FF"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block text-xs font-display font-bold text-[#b9cacb] uppercase mb-1">
              Your Free Fire ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 990182341"
              value={freeFireId}
              onChange={(e) => setFreeFireId(e.target.value)}
              className="w-full px-4 py-3 bg-[#191b24] border border-[#3b494b]/50 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-[#00f0ff]"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-[#00f0ff] text-[#00363a] font-display font-bold text-xs uppercase tracking-wider rounded shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:shadow-[0_0_30px_rgba(0,240,255,0.7)] transition-all cursor-pointer mt-2"
          >
            JOIN SQUAD NOW
          </button>
        </form>
      </div>
    </div>
  );
};
