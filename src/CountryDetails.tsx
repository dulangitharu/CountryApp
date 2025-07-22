import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, Map, ArrowLeft, Moon, Sun, Palette, Printer, Heart, Globe, Building2, Users, Globe2 } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';
import './CountryDetails.css';

type Country = {
  name: {
    common: string;
  };
  flags: {
    svg: string;
  };
  region: string;
  languages: Record<string, string>;
  population: number;
  capital: string[];
  latlng?: number[];
  cca2?: string;
  borders?: string[];
  capitalInfo?: {
    capital: string[];
  };
};

export default function CountryDetails() {
  const { name } = useParams<{ name?: string }>();
  const [country, setCountry] = useState<Country | null>(null);
  const [borderCountries, setBorderCountries] = useState<Country[]>([]);
  const [favoriteCountries, setFavoriteCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode, theme, setTheme, lastSearch, setLastSearch } = useTheme();
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user) {
      const storedFavorites = localStorage.getItem(`favorites_${user.username}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } else {
      setFavorites({});
    }
  }, [user]);

  useEffect(() => {
    const fetchFavoriteCountries = async () => {
      if (!user) {
        setFavoriteCountries([]);
        return;
      }
      try {
        const favoriteNames = Object.keys(favorites).filter((name) => favorites[name]);
        if (favoriteNames.length > 0) {
          const response = await fetch(
            `https://restcountries.com/v3.1/name/${encodeURIComponent(favoriteNames.join(','))}?fields=name`
          );
          if (!response.ok) {
            throw new Error('Failed to fetch favorite countries');
          }
          const data = await response.json();
          setFavoriteCountries(Array.isArray(data) ? data : [data]);
        } else {
          setFavoriteCountries([]);
        }
      } catch (error) {
        console.error('Error fetching favorite countries:', error);
        setFavoriteCountries([]);
      }
    };
    fetchFavoriteCountries();
  }, [favorites, user]);

  useEffect(() => {
    if (!name) {
      setError('No country name provided.');
      setLoading(false);
      return;
    }

    const fetchCountry = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(
          `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,flags,region,languages,population,capital,latlng,cca2,borders`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch country details');
        }
        const data = await response.json();
        const mainCountry = data[0];
        setCountry(mainCountry);
        setLastSearch(mainCountry.name.common);

        if (mainCountry.borders && mainCountry.borders.length > 0) {
          const borderResponse = await fetch(
            `https://restcountries.com/v3.1/alpha?codes=${mainCountry.borders.join(',')}&fields=name,flags,capital`
          );
          if (!borderResponse.ok) {
            throw new Error('Failed to fetch border countries');
          }
          const borderData = await borderResponse.json();
          setBorderCountries(Array.isArray(borderData) ? borderData : []);
        } else {
          setBorderCountries([]);
        }
      } catch (error: any) {
        console.error('Error fetching country details:', error);
        setError(error.message || 'An error occurred while fetching country details.');
        setCountry(null);
      } finally {
        setLoading(false);
      }
    };
    fetchCountry();
  }, [name, setLastSearch]);

  const handleGoogleSearch = () => {
    if (country) {
      window.open(`https://www.google.com/search?q=${encodeURIComponent(country.name.common)}`, '_blank');
    }
  };

  const handleMapClick = () => {
    if (country) {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(country.name.common)}`, '_blank');
    }
  };

  const handlePrintClick = () => {
    window.print();
  };

  const handleWikipediaClick = () => {
    if (country) {
      window.open(`https://en.wikipedia.org/wiki/${encodeURIComponent(country.name.common)}`, '_blank');
    }
  };

  const toggleFavorite = () => {
    if (!user) {
      alert('Please log in to favorite this country.');
      navigate('/signin');
      return;
    }
    if (!country) return;

    setFavorites((prev) => {
      const updatedFavorites = {
        ...prev,
        [country.name.common]: !prev[country.name.common],
      };
      localStorage.setItem(`favorites_${user.username}`, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  const handleCountryNavigation = (countryName: string) => {
    console.log('Navigating to country:', countryName);
    navigate(`/country/${encodeURIComponent(countryName)}`);
  };

  const getThemeAccent = () => {
    switch (theme) {
      case 'blue':
        return 'blue';
      case 'green':
        return 'green';
      case 'black':
        return 'gray';
      default:
        return 'purple';
    }
  };

  const themeColor = getThemeAccent();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-${themeColor}-600`}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-red-600">{error}</p>
        <button
          onClick={() => navigate('/countries')}
          className={`mt-4 flex items-center gap-2 mx-auto text-${themeColor}-600 hover:text-${themeColor}-700 transition-colors duration-200`}
        >
          <ArrowLeft className="h-6 w-6" />
          Back to Countries
        </button>
      </div>
    );
  }

  if (!country) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600">Country not found.</p>
        <button
          onClick={() => navigate('/countries')}
          className={`mt-4 flex items-center gap-2 mx-auto text-${themeColor}-600 hover:text-${themeColor}-700 transition-colors duration-200`}
        >
          <ArrowLeft className="h-6 w-6" />
          Back to Countries
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 page-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/countries')}
            className={`flex items-center gap-2 text-white bg-${themeColor}-600 hover:bg-${themeColor}-700 rounded-full px-4 py-2 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 glowing-button`}
            aria-label="Back to Countries"
          >
            <ArrowLeft className="h-6 w-6" />
            Back To Countries
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                className={`rounded-full p-2 bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 glowing-button`}
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                aria-label="Toggle Theme"
              >
                <Palette className="h-6 w-6" />
              </button>
              {showThemeDropdown && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-10 glassmorphism">
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <button
                      className={`px-2 py-1 rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button`}
                      onClick={() => {
                        setTheme('purple');
                        setShowThemeDropdown(false);
                      }}
                      aria-label="Purple Theme"
                    >
                      Purple
                    </button>
                    <button
                      className={`px-2 py-1 rounded-lg text-white bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button`}
                      onClick={() => {
                        setTheme('blue');
                        setShowThemeDropdown(false);
                      }}
                      aria-label="Blue Theme"
                    >
                      Blue
                    </button>
                    <button
                      className={`px-2 py-1 rounded-lg text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button`}
                      onClick={() => {
                        setTheme('green');
                        setShowThemeDropdown(false);
                      }}
                      aria-label="Green Theme"
                    >
                      Green
                    </button>
                    <button
                      className={`px-2 py-1 rounded-lg text-white bg-gradient-to-r from-gray-700 to-black hover:from-gray-800 hover:to-gray-900 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button`}
                      onClick={() => {
                        setTheme('black');
                        setShowThemeDropdown(false);
                      }}
                      aria-label="Black Theme"
                    >
                      Black
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button
              className={`rounded-full p-2 bg-${themeColor}-600 text-white hover:bg-${themeColor}-700 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 glowing-button`}
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun className="h-6 w-6" /> : <Moon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl card-gradient glassmorphism">
          {country.flags?.svg && (
            <div className="relative w-full h-64 flex items-center justify-center bg-black rounded-xl overflow-hidden mb-6 flag-container">
              <img
                src={country.flags.svg}
                alt={`Flag of ${country.name.common}`}
                className="max-h-full max-w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
              />
              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 shadow-md transform hover:scale-105 glowing-button"
                aria-label="Toggle Favorite"
              >
                <Heart
                  className={`h-6 w-6 ${favorites[country.name.common] ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-400'}`}
                />
              </button>
            </div>
          )}

          <h1 className="text-4xl font-bold mb-4 text-center text-gray-900 dark:text-white title-shadow">
            {country.name.common}
          </h1>
          <p className="text-lg text-center text-gray-600 dark:text-gray-400 mb-6 subtitle-shadow">
            {country.capital && country.capital.length > 0 ? country.capital[0] : 'N/A'}, {country.region}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2 info-item">
                  <Globe2 className="h-5 w-5 text-red-500 glowing-icon" aria-hidden="true" />
                  <span className="font-semibold text-gray-900 dark:text-white">Region:</span>
                  {country.region}
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2 info-item">
                  <Building2 className="h-5 w-5 text-red-500 glowing-icon" aria-hidden="true" />
                  <span className="font-semibold text-gray-900 dark:text-white">Capital:</span>
                  {country.capital && country.capital.length > 0 ? country.capital[0] : 'N/A'}
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2 info-item">
                  <Users className="h-5 w-5 text-red-500 glowing-icon" aria-hidden="true" />
                  <span className="font-semibold text-gray-900 dark:text-white">Population:</span>
                  {country.population ? country.population.toLocaleString() : 'N/A'}
                </p>
                <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2 info-item">
                  <Globe className="h-5 w-5 text-red-500 glowing-icon" aria-hidden="true" />
                  <span className="font-semibold text-gray-900 dark:text-white">Languages:</span>
                  {country.languages ? Object.values(country.languages).join(', ') : 'N/A'}
                </p>
                {country.latlng && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2 info-item">
                    <span className="font-semibold text-gray-900 dark:text-white">Lat/Lng:</span>
                    {`${country.latlng[0]}, ${country.latlng[1]}`}
                  </p>
                )}
                <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2 info-item">
                  <span className="font-semibold text-gray-900 dark:text-white">Country Code:</span>
                  {country.cca2 || 'N/A'}
                </p>
              </div>
              {country.borders && country.borders.length > 0 && borderCountries.length > 0 && (
                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/30 shadow-xl glassmorphism">
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2 border-l-4 border-red-500 pl-2 title-shadow">
                    <Globe2 className="h-6 w-6 text-red-500 glowing-icon" aria-hidden="true" />
                    Border Countries:
                  </h2>
                  <div className="flex flex-row gap-4 w-full">
                    {borderCountries.map((borderCountry) => (
                      <Link
                        key={borderCountry.name.common}
                        to={`/country/${encodeURIComponent(borderCountry.name.common)}`}
                        className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-md bg-white dark:bg-gray-700 animate-fadeIn cursor-pointer relative overflow-hidden glowing-card"
                        aria-label={`View details for ${borderCountry.name.common}`}
                        title={`Capital: ${borderCountry.capital && borderCountry.capital.length > 0 ? borderCountry.capital[0] : 'N/A'}`}
                        onClick={() => handleCountryNavigation(borderCountry.name.common)}
                      >
                        {borderCountry.flags?.svg && (
                          <img
                            src={borderCountry.flags.svg}
                            alt={`Flag of ${borderCountry.name.common}`}
                            className="w-8 h-6 rounded border border-gray-300 object-cover"
                          />
                        )}
                        <span className="text-lg font-semibold bg-gray-200 dark:bg-gray-600 px-3 py-1 rounded-lg truncate">
                          {borderCountry.name.common}
                        </span>
                        <span className="ripple" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {favoriteCountries.length > 0 && (
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white title-shadow">Favorite Countries:</h2>
                  <div className="flex flex-wrap gap-2">
                    {favoriteCountries.map((favCountry) => (
                      <Link
                        key={favCountry.name.common}
                        to={`/country/${encodeURIComponent(favCountry.name.common)}`}
                        className="inline-block px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 glowing-card"
                        aria-label={`View details for ${favCountry.name.common}`}
                        onClick={() => handleCountryNavigation(favCountry.name.common)}
                      >
                        {favCountry.name.common}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-3 rounded-lg shadow-md glassmorphism">
                  <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Area:</span>
                    {country.latlng ? '9,629,091 km²' : 'N/A'}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Lat/Lng:</span>
                    {country.latlng ? `${country.latlng[0]}, ${country.latlng[1]}` : 'N/A'}
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-white">Calling Code:</span>
                    +1
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleGoogleSearch}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button"
                  aria-label="Search Google for this country"
                  title="Search"
                >
                  <Search className="h-5 w-5 glowing-icon" />
                  Search
                </button>
                <button
                  onClick={handleMapClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button"
                  aria-label="View map of this country"
                  title="Map"
                >
                  <Map className="h-5 w-5 glowing-icon" />
                  Map
                </button>
                <button
                  onClick={handleWikipediaClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button"
                  aria-label="View Wikipedia page for this country"
                  title="Wikipedia"
                >
                  <Globe className="h-5 w-5 glowing-icon" />
                  Wikipedia
                </button>
                <button
                  onClick={handlePrintClick}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 glowing-button"
                  aria-label="Print this page"
                  title="Print"
                >
                  <Printer className="h-5 w-5 glowing-icon" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}