import React from 'react';
import { useRouter } from '../contexts/RouterContext';

const Footer = ({ config }) => {
  const { navigate } = useRouter();

  const footerSections = [
    {
      title: 'For Creators',
      links: [
        { label: 'Join as Creator', path: 'registration' },
        { label: 'Success Stories', path: '#' },
        { label: 'Resources', path: '#' },
        { label: 'Community', path: '#' }
      ]
    },
    {
      title: 'For Brands',
      links: [
        { label: 'Find Creators', path: 'home' },
        { label: 'How it Works', path: 'how-it-works' },
        { label: 'Pricing', path: '#' },
        { label: 'Support', path: 'contact' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', path: 'about' },
        { label: 'Contact', path: 'contact' },
        { label: 'FAQ', path: 'faq' },
        { label: 'Blog', path: '#' },
        { label: 'Terms & Conditions', path: 'terms-and-condition' },
        { label: 'Privacy Policy', path: 'privet-policy' }
      ]
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy Policy', path: 'privet-policy' }
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center mb-4">
              <img 
                src="/footer.png" 
                alt={config.platform_name} 
                className="h-16 w-auto object-contain cursor-pointer" 
                onClick={() => navigate('home')}
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 60'%3E%3Ctext x='10' y='40' font-family='Arial' font-size='20' font-weight='bold' fill='white'%3EIndori Influencer%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
            <p className="text-gray-400 text-sm">
              Connecting creators and brands with trusted collaboration tools worldwide.
            </p>
          </div>

          {footerSections.map((section, i) => (
            <div key={i}>
              <h4 className="font-semibold mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <button
                      onClick={() => link.path !== '#' && navigate(link.path)}
                      className="text-gray-400 hover:text-white transition-colors text-sm text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-400 text-sm">
            © 2024 {config.platform_name}. All rights reserved.
          </p>
          <div className="flex gap-4">
            {['Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map((social, i) => (
              <a key={i} href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                {social}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
