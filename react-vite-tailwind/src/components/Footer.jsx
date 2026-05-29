import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const creatorLinks = [
  { label: 'Join as Creator', path: 'registration' },
  { label: 'Success Stories', path: 'about-influencers' },
  { label: 'Resources', path: 'services-influencers' },
  { label: 'Community', path: 'contact' }
];

const brandLinks = [
  { label: 'Find Creators', path: 'explore-influencers' },
  { label: 'How it Works', path: 'how-it-works' },
  { label: 'Pricing', path: 'services' },
  { label: 'Support', path: 'contact' }
];

const companyLinks = [
  { label: 'About Us', path: 'about' },
  { label: 'Contact', path: 'contact' },
  { label: 'FAQ', path: 'faq' },
  { label: 'Blog', path: 'services' },
  { label: 'Terms & Conditions', path: 'terms-and-condition' },
  { label: 'Privacy Policy', path: 'privet-policy' }
];

const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/viralmantrix?igsh=MTBkMzBjM28zMWd5bg%3D%3D' },
  { label: 'Twitter', href: 'https://x.com/ViralMantrix' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/viral-mantrix-3563a3405/' },
  { label: 'YouTube', href: 'https://youtube.com/@viralmantrix?si=pj9mwyESigyGLh9_' }
];

const FooterLinkColumn = ({ title, links, navigate }) => (
  <div>
    <div className="text-2xl font-semibold text-[#FFFFFF]">{title}</div>
    <div className="mt-8 space-y-5">
      {links.map(link => (
        <button
          key={link.label}
          type="button"
          onClick={() => navigate(link.path)}
          className="block text-left text-[1.35rem] font-medium text-[#FFFFFF]/62 transition hover:text-[#FFFFFF]"
        >
          {link.label}
        </button>
      ))}
    </div>
  </div>
);

const Footer = () => {
  const { navigate } = useRouter();

  return (
    <footer className="bg-[#000000] text-[#FFFFFF]">
      <div className="section-shell py-20">
        <div className="grid gap-14 lg:grid-cols-[1.1fr_0.9fr_0.9fr_1fr]">
          <div className="max-w-md">
            <button type="button" onClick={() => navigate('home')} className="text-left">
              <div className="text-[3rem] font-semibold leading-none tracking-tight text-[#FFFFFF]">
                Viral<span className="text-[#DF7AFE]">Mantrix</span>
              </div>
            </button>
            <p className="mt-10 text-[1.45rem] leading-[1.65] text-[#FFFFFF]/62">
              Connecting creators and brands with trusted collaboration tools worldwide.
            </p>
          </div>

          <FooterLinkColumn title="For Creators" links={creatorLinks} navigate={navigate} />
          <FooterLinkColumn title="For Brands" links={brandLinks} navigate={navigate} />
          <FooterLinkColumn title="Company" links={companyLinks} navigate={navigate} />
        </div>

        <div className="mt-16 border-t border-white/10 pt-8">
          <div className="flex flex-col gap-5 text-[1.2rem] text-[#FFFFFF]/62 lg:flex-row lg:items-center lg:justify-between">
            <div>© 2024 ViralMantrix. All rights reserved.</div>
            <div className="flex flex-wrap gap-8">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-[#FFFFFF]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
