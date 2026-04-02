
import React from 'react';

const InquiryProgressBar = ({ status, progressPercentage, forwardedTo, onViewArtist, influencers = [] }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-500';
      case 'admin_accepted':
        return 'bg-yellow-500';
      case 'admin_rejected':
        return 'bg-red-500';
      case 'forwarded':
        return 'bg-purple-500';
      case 'artist_accepted':
        return 'bg-green-500';
      case 'artist_rejected':
        return 'bg-red-500';
      case 'completed':
        return 'bg-green-600';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'sent':
        return 'Inquiry Sent';
      case 'admin_accepted':
        return 'Admin Accepted';
      case 'admin_rejected':
        return 'Admin Rejected';
      case 'forwarded':
        return 'Forwarded to Artist';
      case 'artist_accepted':
        return 'Artist Accepted';
      case 'artist_rejected':
        return 'Artist Rejected';
      case 'completed':
        return 'Completed';
      default:
        return 'Unknown Status';
    }
  };

  const getStages = () => {
    return [
      { key: 'sent', label: 'Sent', completed: ['sent', 'admin_accepted', 'admin_rejected', 'forwarded', 'artist_accepted', 'artist_rejected', 'completed'] },
      { key: 'admin_review', label: 'Admin Review', completed: ['admin_accepted', 'admin_rejected', 'forwarded', 'artist_accepted', 'artist_rejected', 'completed'] },
      { key: 'forwarded', label: 'Forwarded', completed: ['forwarded', 'artist_accepted', 'artist_rejected', 'completed'] },
      { key: 'artist_response', label: 'Artist Response', completed: ['artist_accepted', 'artist_rejected', 'completed'] },
      { key: 'completed', label: 'Completed', completed: ['completed'] }
    ];
  };

  const stages = getStages();
  const currentStageIndex = stages.findIndex(stage => stage.completed.includes(status));


  const getArtistName = (artist) => artist.fullName || artist.name || artist.artistName || 'Unknown Artist';
  const getArtistCategory = (artist) => artist.category || artist.profileType || artist.artistType || 'N/A';

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Progress</span>
          <span className="text-sm font-medium text-gray-700">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div
            className={`${getStatusColor(status)} h-2.5 rounded-full transition-all duration-300 ease-in-out`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Status Stages */}
      <div className="flex items-center justify-between mb-4">
        {stages.map((stage, index) => {
          const isCompleted = stage.completed.includes(status);
          const isCurrent = index === currentStageIndex;
          const isRejected = status.includes('rejected') && isCurrent;

          return (
            <div key={stage.key} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300 ${
                  isCompleted && !isRejected
                    ? 'bg-green-500 text-white'
                    : isRejected
                    ? 'bg-red-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className={`text-xs mt-1 text-center ${
                isCompleted ? 'text-green-600 font-medium' : 
                isCurrent ? 'text-blue-600 font-medium' : 
                'text-gray-500'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Current Status */}
      <div className="text-center">
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)} text-white`}>
          {getStatusText(status)}
        </span>
      </div>

      {/* Forwarded Artists Information */}
      {forwardedTo && forwardedTo.length > 0 && status === 'forwarded' && (
        <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm font-medium text-purple-800 mb-2">Forwarded to:</div>
          <div className="space-y-2">
            {forwardedTo.map((artist, index) => {
              let resolved = artist;
              if (artist && typeof artist === 'object' && (artist.userId !== undefined)) {
                if (typeof artist.userId === 'string' || typeof artist.userId === 'number') {
                  const found = influencers.find(i => (i._id === artist.userId || i.id === artist.userId || String(i._id) === String(artist.userId)));
                  resolved = found || { _id: artist.userId };
                } else if (typeof artist.userId === 'object' && artist.userId !== null) {
                  resolved = artist.userId;
                }
              } else if (typeof artist === 'string' || typeof artist === 'number') {
                const found = influencers.find(i => (i._id === artist || i.id === artist || String(i._id) === String(artist)));
                resolved = found || { _id: artist };
              } else if (artist && typeof artist === 'object') {
                const idCandidate = artist._id || artist.id;
                if (idCandidate && !(artist.fullName || artist.name || artist.artistName)) {
                  const found = influencers.find(i => (i._id === idCandidate || i.id === idCandidate || String(i._id) === String(idCandidate)));
                  if (found) resolved = found;
                }
              }
              const artistName = getArtistName(resolved);
              const artistEmail = resolved.email || 'No email';
              const artistCategory = getArtistCategory(resolved);
              return (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg border border-purple-100">
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
