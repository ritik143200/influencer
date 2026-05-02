import React from 'react';

const InfluencerCard = ({ p, config, navigate, initials }) => {
  return (
    <div className="h-full rounded-3xl border bg-white shadow-sm hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden group flex flex-col" style={{ borderColor: `${config.primary_action}18` }}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            <div className="p-[2px] rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7] transition-all duration-300">
              <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <img
                  src={p.image || ''}
                  alt={p.name}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="w-20 h-20 rounded-full flex items-center justify-center text-sm font-bold text-gray-900" style="background-color: ${config.primary_action}12">${initials(p.name)}</div>`;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {p.name}
                </div>
                {p.verified && (
                  <svg className="w-4 h-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2l2.39 2.95 3.78.57-2.75 2.67.66 3.76L12 10.9 8.92 13.95l.66-3.76L6.83 7.52l3.78-.57L12 2zm0 6.1L10.7 9.4l1.3 1.28 2.6-2.55-1.02-1.03L12 8.63z" />
                  </svg>
                )}
              </div>
              <div className="flex gap-2">
                {p.instagramLink && (
                  <a
                    href={p.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 hover:scale-110 transition-transform"
                    title="Instagram"
                  >
                    <svg className="w-5 h-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                )}
                {p.youtubeLink && (
                  <a
                    href={p.youtubeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 hover:scale-110 transition-transform"
                    title="YouTube"
                  >
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
            <div className="text-xs text-gray-500 truncate mt-0.5">Influencer</div>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold group-hover:shadow-md transition-shadow" style={{ backgroundColor: `${config.primary_action}10`, color: config.primary_action }}>
                {p.followers} followers
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 group-hover:bg-gray-200 transition-colors">
                {p.posts} posts
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-semibold text-gray-700">Category</div>
            <div className="mt-1 text-sm text-gray-600 group-hover:text-blue-600 transition-colors">{p.category}</div>
          </div>
          {p.budget && (
            <div>
              <div className="text-sm font-semibold text-gray-700">Budget</div>
              <div className="mt-1 text-sm text-green-600 font-medium">{p.budget}</div>
            </div>
          )}
        </div>

        {p.bio && (
          <div className="mt-4">
            <div className="text-sm font-semibold text-gray-700">Bio</div>
            <div className="mt-1 text-sm text-gray-600 group-hover:text-gray-800 transition-colors line-clamp-2">{p.bio}</div>
          </div>
        )}

        <div className="mt-auto pt-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('influencer-detail', { id: p.id })}
            className="px-4 py-2.5 rounded-2xl font-semibold text-sm text-white text-center shadow-sm hover:shadow-lg hover:scale-105 transition-all"
            style={{ backgroundColor: config.primary_action }}
          >
            View Profile
          </button>
          <button
            onClick={() => navigate('inquiry')}
            className="px-4 py-2.5 rounded-2xl font-semibold text-sm border transition-all hover:shadow-md hover:scale-105"
            style={{ borderColor: config.primary_action, color: config.primary_action }}
          >
            Hire
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfluencerCard;
