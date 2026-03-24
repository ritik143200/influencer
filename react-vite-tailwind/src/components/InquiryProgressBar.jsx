import React from 'react';

const InquiryProgressBar = ({ status, progressPercentage }) => {
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
    </div>
  );
};

export default InquiryProgressBar;
