import React from 'react';
import { Check, X, Clock, ShieldCheck, Send, UserCheck, Trophy } from 'lucide-react';

/**
 * Inquiry pipeline stages (in order).
 * Each status value maps to a stage index so we know how "far" an inquiry has progressed.
 */
const STAGES = [
  {
    id: 'submitted',
    label: 'Submitted',
    shortLabel: 'Submitted',
    icon: Clock,
    activeStatuses: ['sent'],
    completedStatuses: [
      'admin_accepted', 'admin_rejected',
      'forwarded',
      'artist_accepted', 'artist_rejected',
      'completed'
    ],
    rejectedStatuses: [],
  },
  {
    id: 'admin_review',
    label: 'Admin Review',
    shortLabel: 'Review',
    icon: ShieldCheck,
    activeStatuses: ['admin_accepted'],
    completedStatuses: ['forwarded', 'artist_accepted', 'artist_rejected', 'completed'],
    rejectedStatuses: ['admin_rejected'],
  },
  {
    id: 'forwarded',
    label: 'Sent to Creators',
    shortLabel: 'Forwarded',
    icon: Send,
    activeStatuses: ['forwarded'],
    completedStatuses: ['artist_accepted', 'artist_rejected', 'completed'],
    rejectedStatuses: [],
  },
  {
    id: 'creator_response',
    label: 'Creator Response',
    shortLabel: 'Response',
    icon: UserCheck,
    activeStatuses: ['artist_accepted'],
    completedStatuses: ['completed'],
    rejectedStatuses: ['artist_rejected'],
  },
  {
    id: 'completed',
    label: 'Completed',
    shortLabel: 'Done',
    icon: Trophy,
    activeStatuses: ['completed'],
    completedStatuses: [],
    rejectedStatuses: [],
  },
];

/**
 * Returns the state of each stage based on current status.
 * 'completed' | 'active' | 'rejected' | 'upcoming'
 */
const getStageState = (stage, currentStatus) => {
  if (stage.rejectedStatuses.includes(currentStatus)) return 'rejected';
  if (stage.activeStatuses.includes(currentStatus)) return 'active';
  if (stage.completedStatuses.includes(currentStatus)) return 'completed';
  return 'upcoming';
};

/**
 * Returns overall progress percentage for the progress bar.
 */
const getProgressPercent = (status) => {
  const map = {
    sent: 10,
    admin_accepted: 30,
    admin_rejected: 30,
    forwarded: 55,
    artist_accepted: 75,
    artist_rejected: 75,
    completed: 100,
  };
  return map[status] ?? 10;
};

const isRejected = (status) =>
  status === 'admin_rejected' || status === 'artist_rejected';

/* ── Individual Stage Dot ─────────────────────────────── */
const StageDot = ({ stage, currentStatus, isLast }) => {
  const state = getStageState(stage, currentStatus);
  const Icon = stage.icon;

  const dotStyle = {
    completed: 'bg-[#DF7AFE] border-[#DF7AFE] shadow-[0_0_10px_rgba(223,122,254,0.45)]',
    active: 'bg-[#DF7AFE]/20 border-[#DF7AFE] shadow-[0_0_14px_rgba(223,122,254,0.35)]',
    rejected: 'bg-rose-500/20 border-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.30)]',
    upcoming: 'bg-[#0D0D0D] border-[#3E2A55]',
  }[state];

  const iconStyle = {
    completed: 'text-white',
    active: 'text-[#DF7AFE]',
    rejected: 'text-rose-400',
    upcoming: 'text-[#3E2A55]',
  }[state];

  const labelStyle = {
    completed: 'text-[#DF7AFE]',
    active: 'text-[#FFFFFF] font-semibold',
    rejected: 'text-rose-400',
    upcoming: 'text-[#3E2A55]',
  }[state];

  const lineStyle = {
    completed: 'bg-[#DF7AFE]',
    active: 'bg-gradient-to-r from-[#DF7AFE] to-[#3E2A55]',
    rejected: 'bg-rose-500/40',
    upcoming: 'bg-[#3E2A55]/40',
  }[state];

  return (
    <div className="flex flex-1 items-center last:flex-none">
      {/* Stage */}
      <div className="flex flex-col items-center gap-1.5">
        {/* Dot */}
        <div
          className={`relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${dotStyle}`}
        >
          {state === 'completed' && <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
          {state === 'rejected' && <X className="h-3.5 w-3.5 text-rose-400" strokeWidth={2.5} />}
          {state === 'active' && (
            <>
              <Icon className={`h-3.5 w-3.5 ${iconStyle}`} strokeWidth={2} />
              {/* Pulse ring */}
              <span className="absolute inset-0 rounded-full animate-ping bg-[#DF7AFE]/20" />
            </>
          )}
          {state === 'upcoming' && <Icon className={`h-3.5 w-3.5 ${iconStyle}`} strokeWidth={2} />}
        </div>
        {/* Label */}
        <span className={`text-center text-[0.6rem] leading-none transition-all ${labelStyle} hidden sm:block`}>
          {stage.shortLabel}
        </span>
      </div>

      {/* Connector line (not after last) */}
      {!isLast && (
        <div className={`mx-1 h-0.5 flex-1 transition-all duration-300 ${lineStyle}`} />
      )}
    </div>
  );
};

/* ── Main Component ──────────────────────────────────── */
/**
 * InquiryStatusTracker
 *
 * @param {string} status    - Current inquiry status string
 * @param {string} [variant] - 'compact' | 'full' (default: 'full')
 * @param {string} [className]
 */
const InquiryStatusTracker = ({ status = 'sent', variant = 'full', className = '' }) => {
  const percent = getProgressPercent(status);
  const rejected = isRejected(status);

  if (variant === 'compact') {
    /* ── Compact: single slim progress bar + label ── */
    return (
      <div className={`w-full ${className}`}>
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[0.65rem] font-semibold text-[#A98BC8] uppercase tracking-widest">
            Progress
          </span>
          <span className={`text-[0.65rem] font-semibold ${rejected ? 'text-rose-400' : 'text-[#DF7AFE]'}`}>
            {percent}%
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#1D1228]">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              rejected
                ? 'bg-rose-500'
                : 'bg-gradient-to-r from-[#8B4DD8] to-[#DF7AFE]'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  /* ── Full: multi-stage stepper ── */
  return (
    <div className={`w-full ${className}`}>
      {/* Stage dots */}
      <div className="flex items-start">
        {STAGES.map((stage, idx) => (
          <StageDot
            key={stage.id}
            stage={stage}
            currentStatus={status}
            isLast={idx === STAGES.length - 1}
          />
        ))}
      </div>

      {/* Mobile-only: current stage label below dots */}
      <div className="mt-2 flex items-center justify-center gap-1.5 sm:hidden">
        {STAGES.map((stage) => {
          const state = getStageState(stage, status);
          if (state === 'active' || state === 'rejected') {
            return (
              <span
                key={stage.id}
                className={`text-xs font-semibold ${state === 'rejected' ? 'text-rose-400' : 'text-[#DF7AFE]'}`}
              >
                {stage.label}
              </span>
            );
          }
          return null;
        })}
      </div>

      {/* Thin progress bar below */}
      <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-[#1D1228]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            rejected
              ? 'bg-gradient-to-r from-rose-700 to-rose-400'
              : 'bg-gradient-to-r from-[#8B4DD8] to-[#DF7AFE]'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default InquiryStatusTracker;
