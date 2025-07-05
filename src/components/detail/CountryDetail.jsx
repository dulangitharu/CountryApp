import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CountryDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const country = state?.country;

  if (!country) {
    return <div className="text-center py-12">Country not found</div>;
  }

  return (
    <div className="min-h-screen p-6 bg-purple-800">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6 text-white hover:bg-purple-700"
        >
          <ArrowLeft className="h-5 w-5 mr-2" /> Back
        </Button>
        <div className="bg-gray-900 rounded-xl p-6 text-white">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={country.flags.svg}
              alt={`Flag of ${country.name.common}`}
              className="w-full md:w-1/2 h-64 object-contain"
            />
            <div>
              <h1 className="text-3xl font-bold mb-4">{country.name.common}</h1>
              <p><strong>Region:</strong> {country.region}</p>
              <p><strong>Population:</strong> {country.population.toLocaleString()}</p>
              <p><strong>Capital:</strong> {country.capital?.join(', ') || 'N/A'}</p>
              <p><strong>Languages:</strong> {country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}