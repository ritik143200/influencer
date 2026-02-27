const Footer = ({ config }) => {
  return (
    <footer className="bg-gray-900 text-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-bold text-brand-500">{config.platform_name}</span>
            </div>
            <p className="text-gray-400 text-sm">
              Connecting talented artists with clients worldwide.
            </p>
          </div>

          {[
            { title: 'For Artists', links: ['Join as Artist', 'Success Stories', 'Resources', 'Community'] },
            { title: 'For Clients', links: ['Find Artists', 'How it Works', 'Pricing', 'Support'] },
            { title: 'Company', links: ['About Us', 'Careers', 'Blog', 'Contact'] }
          ].map((col, i) => (
            <div key={i}>
              <h4 className="font-semibold mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors text-sm">
                      {link}
                    </a>
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
