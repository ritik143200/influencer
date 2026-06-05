import React from 'react';
import InquiryStatusTracker from './InquiryStatusTracker';

/**
 * InquiryProgressBar — upgraded to use InquiryStatusTracker internally.
 * Kept backward-compatible: all existing props still work.
 */
const InquiryProgressBar = ({
  status,
  progressPercentage,
  forwardedTo,
  onViewArtist,
  influencers = [],
  assignedInfluencer
}) => {
  const getArtistName = (artist) =>
    artist?.fullName || artist?.name || artist?.artistName || 'Unknown Artist';
  const getArtistCategory = (artist) =>
    artist?.category || artist?.profileType || artist?.artistType || 'N/A';

  return (
    <div className="w-full">
      {/* ── New themed progress tracker ── */}
      <InquiryStatusTracker status={status} variant="full" className="mb-4" />

      {/* Forwarded Artists Information (unchanged) */}
      {forwardedTo && forwardedTo.length > 0 && status === 'forwarded' && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm font-medium text-purple-800 mb-2">Forwarded to:</div>
          <div className="space-y-2">
            {forwardedTo.map((artist, index) => {
              let resolved = artist;
              if (artist && typeof artist === 'object' && artist.userId !== undefined) {
                if (typeof artist.userId === 'string' || typeof artist.userId === 'number') {
                  const found = influencers.find(
                    (i) =>
                      i._id === artist.userId ||
                      i.id === artist.userId ||
                      String(i._id) === String(artist.userId)
                  );
                  resolved = found || { _id: artist.userId };
                } else if (typeof artist.userId === 'object' && artist.userId !== null) {
                  resolved = artist.userId;
                }
              } else if (typeof artist === 'string' || typeof artist === 'number') {
                const found = influencers.find(
                  (i) =>
                    i._id === artist ||
                    i.id === artist ||
                    String(i._id) === String(artist)
                );
                resolved = found || { _id: artist };
              } else if (artist && typeof artist === 'object') {
                const idCandidate = artist._id || artist.id;
                if (idCandidate && !(artist.fullName || artist.name || artist.artistName)) {
                  const found = influencers.find(
                    (i) =>
                      i._id === idCandidate ||
                      i.id === idCandidate ||
                      String(i._id) === String(idCandidate)
                  );
                  if (found) resolved = found;
                }
              }

              const artistName = getArtistName(resolved);
              const artistEmail = resolved?.email || 'No email';
              const artistCategory = getArtistCategory(resolved);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center font-medium text-purple-700 text-xs">
                      {artistName?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-purple-800">{artistName}</span>
                        <span className="text-xs text-purple-600">({artistCategory})</span>
                      </div>
                      <span className="text-xs text-purple-500">{artistEmail}</span>
                    </div>
                  </div>
                  {onViewArtist && (
                    <button
                      onClick={() => onViewArtist(resolved)}
                      className="text-xs px-2 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors font-medium"
                    >
                      View Details
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryProgressBar;
