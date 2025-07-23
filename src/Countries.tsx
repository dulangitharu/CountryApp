import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Moon, Sun, Palette, Filter, Heart, LogOut, Plus } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { useTheme } from './context/ThemeContext';

type Country = {
  name: {
    common: string;
  };
  flags: {
    png: string;
    svg: string;
  };
  region: string;
  languages: Record<string, string>;
  population: number;
  capital: string[];
};

type Theme = 'purple' | 'blue' | 'green' | 'black';

type User = {
  username: string;
  token: string;
};

export default function Countries() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [filteredCountries, setFilteredCountries] = useState<Country[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(() => {
    return sessionStorage.getItem('countriesSearchTerm') || '';
  });
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<string | null>(() => {
    return sessionStorage.getItem('countriesRegionFilter') || null;
  });
  const [languageFilter, setLanguageFilter] = useState<string | null>(() => {
    return sessionStorage.getItem('countriesLanguageFilter') || null;
  });
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [showFavorites, setShowFavorites] = useState<boolean>(() => {
    return JSON.parse(sessionStorage.getItem('countriesShowFavorites') || 'false');
  });
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const { user, login, logout } = useAuth();
  const { darkMode, toggleDarkMode, theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const SESSION_KEY = 'userSession';

  useEffect(() => {
    const savedSession = sessionStorage.getItem(SESSION_KEY);
    if (savedSession && !user) {
      const sessionData = JSON.parse(savedSession);
      login(sessionData.username, sessionData.token);
    }
  }, [user, login]);

  useEffect(() => {
    if (user) {
      const storedFavorites = localStorage.getItem(`favorites_${user.username}`);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
      setFavorites({});
    }
  }, [user]);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://restcountries.com/v3.1/all?fields=name,flags,region,languages,population,capital');
        const data = await response.json();
        setCountries(data);
        // Apply filters after countries are fetched
        let results = data;

        if (searchTerm) {
          results = results.filter((country: Country) =>
            country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (regionFilter) {
          results = results.filter((country: Country) => country.region === regionFilter);
        }

        if (languageFilter) {
          results = results.filter((country: Country) =>
            country.languages &&
            Object.values(country.languages).some((lang) =>
              lang.toLowerCase().includes(languageFilter.toLowerCase())
            )
          );
        }

        if (showFavorites) {
          results = results.filter((country: Country) => favorites[country.name.common]);
        }

        setFilteredCountries(results);
      } catch (error) {
        console.error('Error fetching countries:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCountries();
  }, []);

  // Save states to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('countriesSearchTerm', searchTerm);
    sessionStorage.setItem('countriesRegionFilter', regionFilter || '');
    sessionStorage.setItem('countriesLanguageFilter', languageFilter || '');
    sessionStorage.setItem('countriesShowFavorites', JSON.stringify(showFavorites));
  }, [searchTerm, regionFilter, languageFilter, showFavorites]);

  // Update filtered countries when searchTerm, filters, or showFavorites change
  useEffect(() => {
    let results = countries;

    if (searchTerm) {
      results = results.filter((country: Country) =>
        country.name.common.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (regionFilter) {
      results = results.filter((country: Country) => country.region === regionFilter);
    }

    if (languageFilter) {
      results = results.filter((country: Country) =>
        country.languages &&
        Object.values(country.languages).some((lang) =>
          lang.toLowerCase().includes(languageFilter.toLowerCase())
        )
      );
    }

    if (showFavorites) {
      results = results.filter((country: Country) => favorites[country.name.common]);
    }

    setFilteredCountries(results);
  }, [searchTerm, regionFilter, languageFilter, showFavorites, countries, favorites]);

  const getThemeClass = () => {
    if (!darkMode) {
      return 'bg-white';
    }
    switch (theme) {
      case 'blue':
        return '!bg-blue-900';
      case 'green':
        return '!bg-green-900';
      case 'black':
        return '!bg-black';
      default:
        return '!bg-purple-900';
    }
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

  const toggleFavorite = (countryName: string) => {
    if (!user) {
      alert('Please log in to favorite countries.');
      navigate('/signin');
      return;
    }
    setFavorites((prev) => {
      const updatedFavorites = {
        ...prev,
        [countryName]: !prev[countryName],
      };
      localStorage.setItem(`favorites_${user.username}`, JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  const toggleShowFavorites = () => {
    if (!user) {
      alert('Please log in to view your favorite countries.');
      navigate('/signin');
      return;
    }
    setShowFavorites((prev) => !prev);
  };

  const regions = [...new Set(countries.map((country: Country) => country.region))]
    .filter(Boolean)
    .sort();
  const languages = [
    ...new Set(
      countries.flatMap((country: Country) =>
        country.languages ? Object.values(country.languages) : []
      )
    ),
  ]
    .filter(Boolean)
    .sort();

  const favoriteCountries = countries.filter((country: Country) => favorites[country.name.common]);

  const handleLogout = () => {
    logout();
    sessionStorage.removeItem(SESSION_KEY);
    setFavorites({});
    navigate('/signin');
  };

  const handleCountryClick = (countryName: string) => {
    navigate(`/country/${countryName}`);
  };

  return (
    <div className={`min-h-screen p-6 ${getThemeClass()} transition-colors duration-300`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {user ? (
            <p className={`text-lg ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              Welcome, {user.username}!
            </p>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/signin')}
                className={`text-lg px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                  darkMode
                    ? 'text-white bg-gray-700 hover:bg-gray-600'
                    : `text-${themeColor}-800 bg-${themeColor}-100 hover:bg-${themeColor}-200`
                }`}
              >
                Log In To Favorite Countries
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="text-lg bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-xl"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <button
              className={`rounded-full p-2 shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                darkMode
                  ? 'text-white bg-gray-700 hover:bg-gray-600'
                  : `text-${themeColor}-800 bg-${themeColor}-100 hover:bg-${themeColor}-200`
              }`}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
          <div className="relative">
            <button
              className={`rounded-full p-2 shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
                darkMode
                  ? 'text-white bg-gray-700 hover:bg-gray-600'
                  : `text-${themeColor}-800 bg-${themeColor}-100 hover:bg-${themeColor}-200`
              }`}
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
            >
              <Palette className="h-5 w-5" />
            </button>
            {showThemeDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-10">
                <div className="grid grid-cols-2 gap-2 p-2">
                  <button
                    className={`px-2 py-1 rounded text-white shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                      theme === 'purple' ? 'bg-purple-600' : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                    onClick={() => {
                      setTheme('purple');
                      setShowThemeDropdown(false);
                    }}
                  >
                    Purple
                  </button>
                  <button
                    className={`px-2 py-1 rounded text-white shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                      theme === 'blue' ? 'bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    onClick={() => {
                      setTheme('blue');
                      setShowThemeDropdown(false);
                    }}
                  >
                    Blue
                  </button>
                  <button
                    className={`px-2 py-1 rounded text-white shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                      theme === 'blue' ? 'bg-green-600' : 'bg-green-600 hover:bg-green-700'
                    }`}
                    onClick={() => {
                      setTheme('green');
                      setShowThemeDropdown(false);
                    }}
                  >
                    Green
                  </button>
                  <button
                    className={`px-2 py-1 rounded text-white shadow-sm transition-all duration-300 transform hover:scale-105 hover:shadow-md ${
                      theme === 'black' ? 'bg-black' : 'bg-black hover:bg-gray-800'
                    }`}
                    onClick={() => {
                      setTheme('black');
                      setShowThemeDropdown(false);
                    }}
                  >
                    Black
                  </button>
                </div>
              </div>
            )}
          </div>
          <button
            className={`rounded-full p-2 shadow-md transition-all duration-300 transform hover:scale-110 hover:shadow-lg ${
              darkMode
                ? 'text-white bg-gray-700 hover:bg-gray-600'
                : `text-${themeColor}-800 bg-${themeColor}-100 hover:bg-${themeColor}-200`
            }`}
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-6">
        <div
          className={`bg-${themeColor}-200 rounded-full flex items-center px-4 py-3 shadow-sm border-2 border-${themeColor}-300`}
        >
          <div className={`bg-${themeColor}-600 p-2 rounded-full mr-3`}>
            <Search className="h-5 w-5 text-white" />
          </div>
          <input
            type="text"
            placeholder="Search countries by name..."
            className={`bg-transparent border-0 focus:outline-none text-${themeColor}-900 placeholder-${themeColor}-400 flex-1 text-base font-medium`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap gap-4 justify-between">
        <div className="relative">
          <button
            className={`w-[180px] px-3 py-2 rounded-lg flex items-center gap-2 text-base shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              regionFilter
                ? `bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-700 text-white`
                : darkMode
                ? 'text-white bg-gray-700 hover:bg-gray-600'
                : `text-gray-800 bg-white hover:bg-gray-100 border border-gray-300`
            }`}
            onClick={() => setShowRegionDropdown(!showRegionDropdown)}
          >
            <Filter
              className={`h-4 w-4 ${regionFilter ? 'text-white' : darkMode ? 'text-white' : 'text-gray-800'}`}
            />
            {regionFilter || 'All Regions'}
          </button>
          {showRegionDropdown && (
            <div className="absolute left-0 mt-2 w-[180px] bg-gray-800 rounded-md shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 text-base transition-all duration-200 hover:bg-opacity-80"
                onClick={() => {
                  setRegionFilter(null);
                  setShowRegionDropdown(false);
                }}
              >
                All Regions
              </button>
              {regions.map((region) => (
                <button
                  key={region}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 text-base transition-all duration-200 hover:bg-opacity-80"
                  onClick={() => {
                    setRegionFilter(region);
                    setShowRegionDropdown(false);
                  }}
                >
                  {region}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            className={`w-[180px] px-3 py-2 rounded-lg flex items-center gap-2 text-base shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
              languageFilter
                ? `bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-700 text-white`
                : darkMode
                ? 'text-white bg-gray-700 hover:bg-gray-600'
                : `text-gray-800 bg-white hover:bg-gray-100 border border-gray-300`
            }`}
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
          >
            <Filter
              className={`h-4 w-4 ${languageFilter ? 'text-white' : darkMode ? 'text-white' : 'text-gray-800'}`}
            />
            {languageFilter || 'All Languages'}
          </button>
          {showLanguageDropdown && (
            <div className="absolute left-0 mt-2 w-[180px] bg-gray-800 rounded-md shadow-lg z-10">
              <button
                className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 text-base transition-all duration-200 hover:bg-opacity-80"
                onClick={() => {
                  setLanguageFilter(null);
                  setShowLanguageDropdown(false);
                }}
              >
                All Languages
              </button>
              {languages.map((language) => (
                <button
                  key={language}
                  className="block w-full text-left px-4 py-2 text-white hover:bg-gray-700 text-base transition-all duration-200 hover:bg-opacity-80"
                  onClick={() => {
                    setLanguageFilter(language);
                    setShowLanguageDropdown(false);
                  }}
                >
                  {language}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
            showFavorites
              ? `bg-gradient-to-r from-${themeColor}-600 to-${themeColor}-700 text-white`
              : darkMode
              ? 'text-white bg-gray-700 hover:bg-gray-600'
              : `text-gray-800 bg-white hover:bg-gray-100 border border-gray-300`
          }`}
          onClick={toggleShowFavorites}
        >
          <Heart
            className={`h-4 w-4 ${showFavorites ? 'fill-white text-white' : darkMode ? 'text-white' : 'text-gray-800'}`}
          />
          Favorites ({Object.values(favorites).filter(Boolean).length})
        </button>

        <button
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-base shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
            darkMode
              ? 'text-white bg-gray-700 hover:bg-gray-600'
              : `text-gray-800 bg-white hover:bg-gray-100 border border-gray-300`
          }`}
          onClick={() => navigate('/my-notes')}
        >
          <Plus className={`h-4 w-4 ${darkMode ? 'text-white' : 'text-gray-800'}`} />
          Notes
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div
              className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-white' : `border-${themeColor}-600`}`}
            ></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {(showFavorites ? favoriteCountries : filteredCountries).map((country) => (
              <div
                key={country.name.common}
                className={`rounded-xl overflow-hidden hover:shadow-xl transition-all relative group cursor-pointer ${
                  !darkMode ? 'bg-gray-900 border-0' : 'bg-white border-2 border-purple-500'
                }`}
                onClick={() => handleCountryClick(country.name.common)}
              >
                <div className="p-0 h-48 flex items-center justify-center bg-black relative">
                  {country.flags?.svg ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={country.flags.svg}
                        alt={`Flag of ${country.name.common}`}
                        className="max-h-full max-w-full object-contain p-4"
                      />
                    </div>
                  ) : (
                    <span className="text-white/70">No flag available</span>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(country.name.common);
                    }}
                    className="absolute top-2 right-2 p-1 z-10"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites[country.name.common]
                          ? 'fill-red-500 text-red-500'
                          : darkMode
                          ? 'text-gray-600'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
                <div className={`p-6 ${!darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h3
                    className={`font-bold text-xl truncate text-center ${!darkMode ? 'text-white' : 'text-gray-900'}`}
                  >
                    {country.name.common}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && (showFavorites ? favoriteCountries : filteredCountries).length === 0 && (
          <div className="text-center py-12">
            <p
              className={`text-lg ${darkMode ? 'text-white/80' : 'text-white/80'}`}
            >
              {showFavorites ? 'No favorite countries yet' : 'No countries found matching your search'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}