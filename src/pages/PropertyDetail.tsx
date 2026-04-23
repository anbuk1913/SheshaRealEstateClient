import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ImageSlider } from '../components/ImageSlider';
import api from '../utils/axios';
import { MapPin, BedDouble, Bath, Maximize2, ArrowLeft, Phone, Mail } from 'lucide-react';

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    (api.get(`/properties/${slug}`) as any)
      .then((res: any) => { setProperty(res.data); setLoading(false); })
      .catch(() => { setError('Property not found.'); setLoading(false); });
  }, [slug]);

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
      </main>
      <Footer />
    </div>
  );

  if (error || !property) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center gap-4 text-gray-500">
        <p>{error || 'Property not found.'}</p>
        <Link to="/properties" className="text-amber-600 text-sm font-medium hover:underline">← Back to Properties</Link>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/properties" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-amber-600 mb-6">
            <ArrowLeft size={14} /> Back to Properties
          </Link>

          <ImageSlider images={property.images} alt={property.title} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
            {/* Details */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {property.featured && <span className="bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1 rounded-full">Featured</span>}
                  <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${property.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {property.status}
                  </span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                <p className="text-3xl font-bold text-amber-500">₹{property.price?.toLocaleString('en-IN')}</p>
              </div>

              <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                <MapPin size={14} className="text-amber-500" />
                <span>{property.location?.area}, {property.location?.city}</span>
              </div>

              <div className="flex flex-wrap gap-6 py-4 border-y border-gray-100">
                <span className="flex items-center gap-2 text-sm text-gray-600"><BedDouble size={16} className="text-amber-500" /> {property.bedrooms} Bedrooms</span>
                <span className="flex items-center gap-2 text-sm text-gray-600"><Bath size={16} className="text-amber-500" /> {property.bathrooms} Bathrooms</span>
                <span className="flex items-center gap-2 text-sm text-gray-600"><Maximize2 size={16} className="text-amber-500" /> {property.area} sq ft</span>
              </div>

              {property.description && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{property.description}</p>
                </div>
              )}

              {property.amenities?.length > 0 && (
                <div>
                  <h2 className="font-semibold text-gray-900 mb-3">Amenities</h2>
                  <div className="flex flex-wrap gap-2">
                    {property.amenities.map((a: string) => (
                      <span key={a} className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-lg">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-20 space-y-4">
                <h3 className="font-semibold text-gray-900">Interested in this property?</h3>
                <p className="text-sm text-gray-500">Get in touch with our team for more details or to schedule a visit.</p>
                <a href="tel:+919876543210" className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium py-3 rounded-xl text-sm transition-colors">
                  <Phone size={15} /> Call Us
                </a>
                <a href="mailto:hello@sheshaestates.in" className="w-full flex items-center justify-center gap-2 border border-gray-200 hover:border-amber-300 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors">
                  <Mail size={15} /> Email Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
