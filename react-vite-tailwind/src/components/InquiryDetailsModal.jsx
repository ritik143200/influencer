import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  MapPin,
  Tag,
  Clock,
  Mail,
  Phone,
  User,
  Briefcase
} from 'lucide-react';

const formatMoney = (value) => {
  const amount = Number(value || 0);
  if (!amount) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const InquiryDetailsModal = ({ isOpen, onClose, inquiry }) => {
  if (!isOpen || !inquiry) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden rounded-[24px] border border-[#3E2A55] bg-[#0D0D0D] text-[#FFFFFF] shadow-[0_24px_80px_rgba(223,122,254,0.15)]"
        >
          {/* Header */}
          <div className="relative border-b border-[#1D1228] bg-gradient-to-r from-[#DF7AFE]/10 to-[#0099FF]/5 px-6 py-5">
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-xl border border-[#3E2A55] bg-[#000000] p-2 text-[#A98BC8] hover:bg-[#171321] hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#DF7AFE]">
              Campaign Inquiry Details
            </span>
            <h3 className="mt-1 pr-10 text-xl font-bold leading-7 tracking-tight">
              {inquiry.campaignName || 'Campaign Invite'}
            </h3>
            <p className="mt-1 text-xs text-[#A98BC8]">
              Inquiry ID: #{(inquiry._id || inquiry.id || 'N/A').slice(-6).toUpperCase()}
            </p>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6 scrollbar-thin">
            {/* Overview / Card */}
            <div className="grid grid-cols-2 gap-4 rounded-2xl border border-[#1D1228] bg-[#0A0A12] p-4">
              <div>
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#3E2A55]">Budget</span>
                <p className="text-xl font-bold text-[#DF7AFE]">{formatMoney(inquiry.budget)}</p>
              </div>
              <div>
                <span className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-[#3E2A55]">Hiring Role</span>
                <p className="text-sm font-semibold capitalize text-white">{inquiry.hiringFor || 'Influencer'}</p>
              </div>
            </div>

            {/* Event & Location details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-[#3E2A55]/40 bg-[#171321] p-1.5 text-[#DF7AFE]">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#A98BC8]">Location</h4>
                    <p className="text-xs font-semibold mt-0.5">{inquiry.location || 'Remote / Online'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-[#3E2A55]/40 bg-[#171321] p-1.5 text-[#DF7AFE]">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#A98BC8]">Received At</h4>
                    <p className="text-xs font-semibold mt-0.5">{formatDate(inquiry.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-[#3E2A55]/40 bg-[#171321] p-1.5 text-[#DF7AFE]">
                    <Tag className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#A98BC8]">Primary Category</h4>
                    <p className="text-xs font-semibold mt-0.5 capitalize">{inquiry.category || 'Creator'}</p>
                  </div>
                </div>

                {inquiry.microCategories && inquiry.microCategories.length > 0 && (
                  <div>
                    <h4 className="text-[0.625rem] font-bold uppercase tracking-[0.12em] text-[#A98BC8] mb-1.5">Micro Categories</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {inquiry.microCategories.map((micro) => (
                        <span key={micro} className="rounded-full border border-[#3E2A55] bg-[#000000] px-2 py-0.5 text-[0.65rem] font-medium text-[#A98BC8]">
                          {micro}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Company details */}
            <div className="rounded-2xl border border-[#3E2A55]/40 bg-[#171321]/30 p-4 space-y-3">
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#A98BC8] flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5 text-[#DF7AFE]" />
                Company Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-[0.625rem] font-medium text-[#A98BC8]/60">Company Name</span>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    Viralmantrix
                  </p>
                </div>
                <div>
                  <span className="text-[0.625rem] font-medium text-[#A98BC8]/60 flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email
                  </span>
                  <p className="text-xs font-semibold text-white mt-0.5 truncate">
                    <a href="mailto:viralmantrix@gmail.com" className="hover:text-[#DF7AFE] transition">viralmantrix@gmail.com</a>
                  </p>
                </div>
                <div>
                  <span className="text-[0.625rem] font-medium text-[#A98BC8]/60 flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Contact Number
                  </span>
                  <p className="text-xs font-semibold text-white mt-0.5">
                    7489701324
                  </p>
                </div>
              </div>
            </div>

            {/* Requirements / Details */}
            <div>
              <h4 className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-[#A98BC8] mb-2">
                Requirements & Description
              </h4>
              <div className="rounded-2xl border border-[#171321] bg-[#0A0A12]/50 p-4">
                <p className="text-xs leading-relaxed text-[#A98BC8] whitespace-pre-wrap">
                  {inquiry.requirements || 'No specific requirements provided.'}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#1D1228] bg-[#0A0A12] px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-xl border border-[#3E2A55] bg-[#000000] px-4 py-2 text-xs font-semibold text-[#A98BC8] hover:bg-[#171321] hover:text-white transition"
            >
              Close Details
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InquiryDetailsModal;
