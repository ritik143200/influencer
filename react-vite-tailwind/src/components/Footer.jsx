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
    <div className="text-xs font-bold uppercase tracking-wider text-[#FFFFFF]">{title}</div>
    <div className="mt-4 space-y-2.5">
      {links.map(link => (
        <button
          key={link.label}
          type="button"
          onClick={() => navigate(link.path)}
          className="block text-left text-sm text-[#A98BC8] hover:text-[#FFFFFF] transition-colors"
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
    <footer className="border-t border-[#171321] bg-[#000000] text-[#FFFFFF]">
      <div className="section-shell py-12">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
          <div className="max-w-md">
            <button type="button" onClick={() => navigate('home')} className="text-left">
              <div className="text-2xl font-bold leading-none tracking-tight text-[#FFFFFF]">
                Viral<span className="text-[#DF7AFE]">Mantrix</span>
              </div>
            </button>
            <p className="mt-4 text-sm leading-relaxed text-[#A98BC8]">
              Connecting creators and brands with trusted collaboration tools worldwide.
            </p>
          </div>

          <FooterLinkColumn title="For Creators" links={creatorLinks} navigate={navigate} />
          <FooterLinkColumn title="For Brands" links={brandLinks} navigate={navigate} />
          <FooterLinkColumn title="Company" links={companyLinks} navigate={navigate} />
        </div>

        <div className="mt-12 border-t border-[#171321] pt-6">
          <div className="flex flex-col gap-4 text-xs text-[#A98BC8] lg:flex-row lg:items-center lg:justify-between">
            <div>© 2024 ViralMantrix. All rights reserved.</div>
            <div className="flex flex-wrap gap-6">
              {socialLinks.map(link => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[#FFFFFF] transition-colors"
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
