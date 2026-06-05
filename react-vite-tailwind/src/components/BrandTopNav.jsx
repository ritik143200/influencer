import React from 'react';
import { ChevronDown } from 'lucide-react';

export const getBrandInitial = (brand) => {
  const label = brand?.brandName || brand?.name || brand?.fullName || brand?.email || 'Brand';
  return String(label).trim().slice(0, 1).toUpperCase() || 'B';
};

const BrandTopNav = ({ brand, navigate, currentPath }) => {
  return (
    <header className="sticky top-0 z-30 border-t-[3px] border-[#DF7AFE] border-b border-[#171321] bg-[#000000]/94 backdrop-blur-xl">
      <div className="mx-auto flex h-[70px] max-w-[1280px] items-center justify-between px-5 lg:px-8">
        <button
          type="button"
          onClick={() => navigate('home')}
          className="text-left text-[1.85rem] font-semibold leading-none tracking-[-0.06em] text-[#FFFFFF]"
        >
          <span>Viral</span>
          <span className="text-[#DF7AFE]">X</span>
        </button>

        <nav className="hidden items-center gap-10 text-sm font-semibold text-[#FFFFFF]/70 md:flex">
          <button
            type="button"
            onClick={() => navigate('home')}
            className={`transition hover:text-[#DF7AFE] ${currentPath === 'home' ? 'text-[#DF7AFE]' : ''}`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => navigate('services')}
            className={`transition hover:text-[#DF7AFE] ${currentPath === 'services' ? 'text-[#DF7AFE]' : ''}`}
          >
            Services
          </button>
          <button
            type="button"
            onClick={() => navigate('inquiry')}
            className={`transition hover:text-[#DF7AFE] ${currentPath === 'inquiry' ? 'text-[#DF7AFE]' : ''}`}
          >
            Hire Influencer
          </button>
          <button
            type="button"
            onClick={() => navigate('my-inquiries')}
            className={`transition hover:text-[#DF7AFE] ${currentPath === 'my-inquiries' ? 'text-[#DF7AFE]' : ''}`}
          >
            My Campaigns
          </button>
        </nav>

        <button
          type="button"
          onClick={() => navigate('user-dashboard')}
          className="inline-flex h-12 items-center gap-3 rounded-[22px] border border-[#171321] bg-[#0D0D0D] px-4 text-sm font-semibold text-[#FFFFFF] shadow-[0_14px_34px_rgba(223,122,254,0.10)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#171321] text-xs font-bold text-[#DF7AFE]">
            {getBrandInitial(brand)}
          </span>
          <span className="hidden sm:inline">Brand Account</span>
          <ChevronDown className="h-4 w-4 text-[#FFFFFF]/70" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
};

export default BrandTopNav;
