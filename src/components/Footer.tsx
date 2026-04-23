import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';

export const Footer = () => (
  <footer className="bg-gray-900 text-gray-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        {/* Brand */}
        <div className="md:col-span-1">
          <Link to="/" className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">
              Shesha<span className="text-amber-400">Estates</span>
            </span>
          </Link>
          <p className="text-sm text-gray-400 leading-relaxed">
            Premium real estate solutions across India. Your dream home, our expertise.
          </p>
          <div className="flex gap-3 mt-4">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 rounded-full bg-gray-800 hover:bg-amber-500 flex items-center justify-center transition-colors">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-white mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            {[['/', 'Home'], ['/properties', 'Properties'], ['/blog', 'Blog'], ['/about', 'About'], ['/contact', 'Contact']].map(([to, label]) => (
              <li key={to}><Link to={to} className="hover:text-amber-400 transition-colors">{label}</Link></li>
            ))}
          </ul>
        </div>

        {/* Property Types */}
        <div>
          <h4 className="font-semibold text-white mb-4">Property Types</h4>
          <ul className="space-y-2 text-sm">
            {['Apartments', 'Villas', 'Plots', 'Commercial', 'New Projects'].map(t => (
              <li key={t}><Link to="/properties" className="hover:text-amber-400 transition-colors">{t}</Link></li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-white mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2"><MapPin size={14} className="text-amber-400 mt-0.5 shrink-0" /><span>123 Shesha Towers, Hyderabad, Telangana — 500001</span></li>
            <li className="flex gap-2"><Phone size={14} className="text-amber-400 shrink-0" /><span>+91 98765 43210</span></li>
            <li className="flex gap-2"><Mail size={14} className="text-amber-400 shrink-0" /><span>hello@sheshaestates.in</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} Shesha Real Estate Solutions. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-amber-400 transition-colors">Terms of Service</a>
        </div>
      </div>
    </div>
  </footer>
);
