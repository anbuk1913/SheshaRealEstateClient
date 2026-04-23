import { Link } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize2 } from 'lucide-react';

interface Props {
  property: {
    slug: string; title: string; price: number;
    images: string[]; location: { city: string; area: string };
    bedrooms: number; bathrooms: number; area: number;
    status: string; featured: boolean;
  };
}

export const PropertyCard = ({ property }: Props) => (
  <Link to={`/properties/${property.slug}`}
    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300">
    <div className="relative overflow-hidden aspect-[4/3]">
      <img
        src={property.images[0] || '/placeholder.jpg'}
        alt={property.title}
        loading="lazy"
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 flex gap-2">
        {property.featured && (
          <span className="bg-amber-500 text-white text-xs font-medium px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize
          ${property.status === 'available' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {property.status}
        </span>
      </div>
    </div>
    <div className="p-5">
      <p className="text-xl font-semibold text-gray-900 mb-1">
        ₹{property.price.toLocaleString('en-IN')}
      </p>
      <h3 className="text-base text-gray-700 font-medium mb-3 line-clamp-2">
        {property.title}
      </h3>
      <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
        <MapPin size={13} className="shrink-0" />
        <span>{property.location.area}, {property.location.city}</span>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-500 border-t border-gray-100 pt-3">
        <span className="flex items-center gap-1"><BedDouble size={13} /> {property.bedrooms} Beds</span>
        <span className="flex items-center gap-1"><Bath size={13} /> {property.bathrooms} Baths</span>
        <span className="flex items-center gap-1"><Maximize2 size={13} /> {property.area} sqft</span>
      </div>
    </div>
  </Link>
);