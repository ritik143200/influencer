import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useRouter } from '../contexts/RouterContext';

const footerSections = [
  {
    title: 'Creators',
    links: [
      { label: 'Join the network', path: 'registration' },
      { label: 'Influencer dashboard', path: 'influencer-dashboard' },
      { label: 'Creator FAQs', path: 'faq' }
    ]
  },
  {
    title: 'Brands',
    links: [
      { label: 'Launch a campaign', path: 'inquiry' },
      { label: 'Explore creators', path: 'explore-influencers' },
      { label: 'How it works', path: 'how-it-works' }
    ]
  },
  {
    title: 'Platform',
    links: [
      { label: 'About', path: 'about' },
      { label: 'Contact', path: 'contact' },
      { label: 'Privacy policy', path: 'privet-policy' }
    ]
  }
];

const Footer = () => {
  const { navigate } = useRouter();

  return (
    <footer className="border-t border-white/8 bg-[#030611]/90 text-white">
      <div className="section-shell py-12">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 text-white shadow-[0_14px_35px_rgba(139,92,246,0.32)]">
                <Sparkles className="h-5 w-5" strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm font-black uppercase tracking-[0.28em] text-white">ViralMantrix</div>
                <div className="text-[11px] uppercase tracking-[0.22em] text-white/45">Creator ecosystem OS</div>
              </div>
            </div>
            <p className="mt-5 text-sm leading-7 text-slate-400">
              ViralMantrix is being redesigned as a premium creator-tech platform for brands, influencers, meme pages,
              city communities, and digital culture operators.
            </p>
            <button
              type="button"
              onClick={() => navigate('contact')}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
            >
              Talk to the team
              <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
            </button>
          </div>

          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="text-xs font-semibold uppercase tracking-[0.24em] text-white/45">{section.title}</h4>
              <div className="mt-4 space-y-3">
                {section.links.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => navigate(link.path)}
                    className="block text-left text-sm font-medium text-slate-300 transition hover:text-white"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/8 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <div>ViralMantrix for creators, communities, and campaigns.</div>
          <div className="flex flex-wrap gap-4">
            <a href="https://www.instagram.com/viralmantrix?igsh=MTBkMzBjM28zMWd5bg%3D%3D" target="_blank" rel="noreferrer" className="transition hover:text-white">
              Instagram
            </a>
            <a href="https://x.com/ViralMantrix" target="_blank" rel="noreferrer" className="transition hover:text-white">
              X
            </a>
            <a href="https://www.linkedin.com/in/viral-mantrix-3563a3405/" target="_blank" rel="noreferrer" className="transition hover:text-white">
              LinkedIn
            </a>
            <a href="https://youtube.com/@viralmantrix?si=pj9mwyESigyGLh9_" target="_blank" rel="noreferrer" className="transition hover:text-white">
              YouTube
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
