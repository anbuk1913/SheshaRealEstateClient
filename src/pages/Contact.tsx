import { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Mail, Phone, MapPin, Send, Clock } from 'lucide-react';

export default function Contact() {
  const [form, setForm]       = useState({ name: '', email: '', phone: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <p className="text-amber-500 text-sm font-medium uppercase tracking-wider mb-2">Get In Touch</p>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
            <p className="text-gray-500 max-w-md mx-auto text-sm">
              Have a question or want to schedule a property visit? Reach out to our team.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-4">
              {[
                { icon: Phone,   label: 'Phone',   value: '+91 98765 43210',          href: 'tel:+919876543210' },
                { icon: Mail,    label: 'Email',   value: 'hello@sheshaestates.in',   href: 'mailto:hello@sheshaestates.in' },
                { icon: MapPin,  label: 'Address', value: '123 Shesha Towers, Banjara Hills, Hyderabad — 500034', href: '#' },
                { icon: Clock,   label: 'Hours',   value: 'Mon–Sat: 9AM – 7PM', href: '#' },
              ].map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href} className="flex items-start gap-4 bg-white rounded-2xl p-5 border border-gray-100 hover:border-amber-200 transition-colors group">
                  <div className="w-10 h-10 bg-amber-50 group-hover:bg-amber-500 rounded-xl flex items-center justify-center shrink-0 transition-colors">
                    <Icon size={18} className="text-amber-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{label}</p>
                    <p className="text-sm text-gray-700 font-medium">{value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-8">
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send size={24} className="text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-xl mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setForm({ name: '', email: '', phone: '', message: '' }); setSubmitted(false); }}
                    className="mt-6 text-sm text-amber-600 hover:underline">Send another message</button>
                </div>
              ) : (
                <>
                  <h2 className="font-semibold text-gray-900 text-lg mb-6">Send us a message</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Your Name *</label>
                        <input required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                          placeholder="Ravi Kumar" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone</label>
                        <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                          placeholder="+91 98765 43210" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Email *</label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors"
                        placeholder="ravi@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Message *</label>
                      <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({...f, message: e.target.value}))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-amber-400 transition-colors resize-none"
                        placeholder="I'm interested in..." />
                    </div>
                    <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors">
                      <Send size={15} /> Send Message
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
