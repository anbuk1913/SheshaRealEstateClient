import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Shield, Award, Target, MapPin, Phone, Mail, CheckCircle } from 'lucide-react';
import useSeo from '../hooks/useSeo';

const values = [
  { icon: Shield,      title: 'Integrity',  desc: 'Transparent dealings and honest advice - always.' },
  { icon: Award,       title: 'Excellence', desc: 'Premium service standards in every interaction.' },
  { icon: CheckCircle, title: 'Verified',   desc: 'Only DTCP & CMDA approved plots with clear documentation.' },
  { icon: Target,      title: 'Results',    desc: 'Focused on achieving your real estate investment goals.' },
];

/* ── amber keyword highlight pill ── */
const K = ({ children }: { children: React.ReactNode }) => (
  <span className="">{children}</span>
);

export default function About() {
  useSeo({
    title: 'About Shesha Real Estate Solutions | Trusted Chennai Plot Investment',
    description: 'Learn about Shesha Real Estate Solution, our founder, and how we help buyers invest in DTCP and CMDA approved plots across Chennai with transparent guidance and verified listings.',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,300&family=Cinzel:wght@600;700&display=swap');

        .about-page { font-family: 'DM Sans', sans-serif; }

        .font-display { font-family: 'Cormorant Garamond', serif; }
        .font-cinzel  { font-family: 'Cinzel', serif; }

        /* ── Keyword pill ── */
        .keyword-pill {
          display: inline;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          color: #92400e;
          font-weight: 600;
          padding: 1px 8px 2px;
          border-radius: 5px;
          border-bottom: 2px solid #f59e0b;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95em;
          letter-spacing: 0.01em;
          white-space: nowrap;
        }

        /* ── Gold underline for headings ── */
        .heading-underline {
          position: relative;
          display: inline-block;
          padding-bottom: 10px;
        }
        .heading-underline::after {
          content: '';
          position: absolute;
          left: 50%; transform: translateX(-50%);
          bottom: 0; width: 60%; height: 3px;
          background: linear-gradient(90deg, transparent, #f59e0b 40%, #fbbf24 60%, transparent);
          border-radius: 2px;
        }

        /* ── Gradient text ── */
        .text-gold-gradient {
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #fcd34d 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Eyebrow label ── */
        .eyebrow {
          font-family: 'Cinzel', serif;
          font-size: 0.68rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #d97706;
          display: block;
        }

        /* ── Founder card ── */
        .founder-card {
          transition: box-shadow 0.35s ease;
        }
        .founder-card:hover {
          box-shadow: 0 16px 48px rgba(245, 158, 11, 0.2);
        }

        /* ── Value card ── */
        .value-card {
          transition: transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }
        .value-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 32px rgba(245, 158, 11, 0.15);
        }

        /* ── Hero decorative rings ── */
        .hero-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(245,158,11,0.1);
          pointer-events: none;
        }
      `}</style>

      <div className="about-page min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">

          {/* ── HERO ── */}
          <section className="bg-gradient-to-br from-gray-950 via-gray-900 to-gray-800 text-white py-24 relative overflow-hidden">
            <div className="hero-ring" style={{ width: 460, height: 460, top: -100, right: -100 }} />
            <div className="hero-ring" style={{ width: 300, height: 300, top: -50, right: -50, opacity: 0.6 }} />
            <div className="hero-ring" style={{ width: 200, height: 200, bottom: -60, left: -60 }} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
              <span className="eyebrow mb-5" style={{ color: '#fbbf24' }}>Our Story</span>

              <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                Chennai's{' '}
                <em className="text-gold-gradient not-italic font-display">Trusted</em>{' '}
                Plot Investment Partner
              </h1>

              <p className="text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto" style={{ fontWeight: 300 }}>
                Shesha Real Estate Solution specializes in{' '}
                <K>DTCP</K> and <K>CMDA approved plots</K> across Chennai's
                fastest-growing residential and investment zones.
              </p>
            </div>
          </section>

          {/* ── FOUNDER ── */}
          <section className="py-20 bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <span className="eyebrow mb-3">Leadership</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900">
                  <span className="heading-underline">Meet Our Founder</span>
                </h2>
              </div>

              <div className="founder-card bg-gradient-to-br from-gray-50 to-amber-50 rounded-3xl overflow-hidden border border-amber-100">
                <div className="flex flex-col md:flex-row">

                  {/* Amber sidebar */}
                  <div className="w-full md:w-72 flex-shrink-0 flex flex-col items-center justify-center py-14 px-8 text-white text-center relative overflow-hidden"
                    style={{ background: 'linear-gradient(155deg, #168fc7 0%, #464a48 100%)' }}>
                    {/* decorative rings inside sidebar */}
                    <div style={{ position:'absolute', top:-40, left:-40, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />
                    <div style={{ position:'absolute', bottom:-30, right:-30, width:110, height:110, borderRadius:'50%', background:'rgba(255,255,255,0.06)' }} />

                    <img src="\img\shesha_founder.png" alt="Ravi Shesha" className="rounded-2xl" />
                    <h3 className="font-cinzel text-xl font-bold mb-1 relative">Ravi Shesha</h3>
                    <p className="text-amber-100 text-sm mb-3 relative" style={{ fontWeight:300 }}>Founder</p>
                    <div className="w-10 h-px bg-white/40 mx-auto mb-3" />
                    <p className="text-amber-100 text-xs leading-snug relative" style={{ fontWeight:300 }}>
                      Vice President – Rahaa Associates
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="flex-1 p-8 md:p-12">
                    <div className="flex flex-wrap gap-2 mb-6">
                      <K>Founder – Shesha Real Estate Solution</K>
                      <span style={{
                        background:'#f3f4f6', color:'#374151',
                        fontSize:'0.75rem', fontWeight:600,
                        padding:'3px 12px', borderRadius:'999px',
                        fontFamily:"'DM Sans',sans-serif"
                      }}>
                        Vice President – Rahaa Associates
                      </span>
                    </div>

                    <p className="text-gray-600 leading-relaxed text-base mb-8" style={{ fontWeight:300 }}>
                      With extensive experience in the <K>Chennai real estate market</K>, he
                      specializes in identifying <K>high-potential plotted developments</K> and
                      guiding buyers toward secure land investments. His professional approach
                      ensures <K>transparency</K>, <K>legal clarity</K>, and{' '}
                      <K>value-driven property selection</K> - making every client's investment
                      journey straightforward and rewarding.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[
                        { label: 'Focus',    value: 'Plotted Developments' },
                        { label: 'Region',   value: 'Chennai & Surroundings' },
                        { label: 'Approach', value: 'Transparent & Legal' },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-white rounded-xl p-4 border border-amber-100 text-center">
                          <span className="eyebrow mb-1" style={{ fontSize:'0.58rem' }}>{label}</span>
                          <p className="text-sm font-semibold text-gray-800">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── ABOUT CONTENT ── */}
          <section className="py-20 bg-gray-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <span className="eyebrow mb-3">Who We Are</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900">
                  <span className="heading-underline">About Shesha Real Estate Solution</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
                <div className="space-y-6 text-gray-600 leading-relaxed text-base" style={{ fontWeight:300 }}>
                  <p>
                    Shesha Real Estate Solution is a trusted real estate consulting service
                    specializing in <K>DTCP and CMDA approved plots</K> in Chennai. We help
                    buyers invest in <K>verified plotted developments</K> located in
                    fast-growing residential and investment zones.
                  </p>
                  <p>
                    Our leadership brings strong industry experience, currently serving as{' '}
                    <K>Vice President at Rahaa Associates</K>. With deep market knowledge
                    and professional guidance, we assist clients in selecting the right plots
                    based on <K>location growth</K>, budget, and future value.
                  </p>
                </div>
                <div className="space-y-6 text-gray-600 leading-relaxed text-base" style={{ fontWeight:300 }}>
                  <p>
                    We promote carefully selected <K>residential plots</K>,{' '}
                    <K>villa plots</K>, and <K>investment lands</K> with clear documentation
                    and a transparent process. From property enquiry to{' '}
                    <K>final registration</K>, Shesha Real Estate Solution provides
                    end-to-end assistance.
                  </p>
                  <p>
                    Our goal is to simplify <K>plot buying</K> and help clients invest in
                    secure real estate opportunities in <K>Chennai</K>.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* ── VALUES ── */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-14">
                <span className="eyebrow mb-3">What Drives Us</span>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900">
                  <span className="heading-underline">Our Core Values</span>
                </h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="value-card bg-gray-50 rounded-2xl p-7 text-center hover:bg-amber-50 group border border-transparent hover:border-amber-100">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:bg-amber-500 transition-colors">
                      <Icon size={20} className="text-amber-500 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="font-cinzel font-semibold text-gray-900 mb-2 text-sm tracking-widest">{title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed" style={{ fontWeight:300 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CONTACT STRIP ── */}
          <section className="py-14 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
            <div style={{ position:'absolute', top:-50, right:-50, width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />
            <div style={{ position:'absolute', bottom:-30, left:-30, width:140, height:140, borderRadius:'50%', background:'rgba(255,255,255,0.07)' }} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
              <h2 className="font-display text-4xl font-bold text-white mb-2 italic">
                Ready to Find Your Perfect Plot in Chennai?
              </h2>
              <p className="text-amber-100 text-sm mb-8" style={{ fontWeight:300 }}>
                Reach out - we're here to guide you every step of the way.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-white/90 text-sm">
                <a href="tel:+916379252638" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Phone size={15} /> +91 63792 52638
                </a>
                <a href="mailto:shesharealestatesolutions@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={15} /> shesharealestatesolutions@gmail.com
                </a>
                <span className="flex items-center gap-2">
                  <MapPin size={15} /> Chennai, Tamil Nadu
                </span>
              </div>
            </div>
          </section>

        </main>
        <Footer />
      </div>
    </>
  );
}