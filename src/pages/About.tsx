import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Shield, Award, Users, Target, MapPin, Phone, Mail } from 'lucide-react';

const values = [
  { icon: Shield,  title: 'Integrity',    desc: 'Transparent dealings and honest advice — always.' },
  { icon: Award,   title: 'Excellence',   desc: 'Premium service standards in every interaction.' },
  { icon: Users,   title: 'Community',    desc: 'Building lasting relationships with our clients.' },
  { icon: Target,  title: 'Results',      desc: 'Focused on achieving your real estate goals.' },
];

const team = [
  { name: 'Ravi Shesha',    role: 'Founder & CEO',       img: '' },
  { name: 'Priya Reddy',   role: 'Head of Sales',         img: '' },
  { name: 'Arjun Mehta',   role: 'Property Consultant',   img: '' },
  { name: 'Deepa Sharma',  role: 'Client Relations',      img: '' },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-amber-400 text-sm font-medium uppercase tracking-wider mb-3">Our Story</p>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              India's Trusted Real Estate Partner
            </h1>
            <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
              Since 2012, Shesha Real Estate Solutions has been helping families and investors find their perfect property across India with unmatched expertise and genuine care.
            </p>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-amber-500 text-sm font-medium uppercase tracking-wider mb-2">What Drives Us</p>
              <h2 className="text-3xl font-bold text-gray-900">Our Core Values</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="bg-gray-50 rounded-2xl p-6 text-center hover:bg-amber-50 transition-colors group">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-amber-500 transition-colors">
                    <Icon size={20} className="text-amber-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-amber-500 text-sm font-medium uppercase tracking-wider mb-2">Meet The Team</p>
              <h2 className="text-3xl font-bold text-gray-900">The People Behind Shesha</h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map(({ name, role }) => (
                <div key={name} className="bg-white rounded-2xl p-6 text-center border border-gray-100 hover:border-amber-200 transition-colors">
                  <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                    {name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">{name}</h3>
                  <p className="text-xs text-gray-500">{role}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Strip */}
        <section className="bg-amber-500 py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Ready to Find Your Dream Property?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/90 text-sm">
              <a href="tel:+919876543210" className="flex items-center gap-2 hover:text-white"><Phone size={15} /> +91 98765 43210</a>
              <a href="mailto:hello@sheshaestates.in" className="flex items-center gap-2 hover:text-white"><Mail size={15} /> hello@sheshaestates.in</a>
              <span className="flex items-center gap-2"><MapPin size={15} /> Hyderabad, Telangana</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
