import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ChevronDown, ChevronRight, Globe, AlertTriangle, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import TabbedCoffeeBeans from '../components/TabbedCoffeeBeans';
import { coffeeBeansAPI } from '../services/api';

const CoffeeBeans = () => {
  const [coffeeBeans, setCoffeeBeans] = useState([]);
  const [filteredBeans, setFilteredBeans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roastFilter, setRoastFilter] = useState('all');
  const [expandedCountries, setExpandedCountries] = useState(new Set());
  const [groupedBeans, setGroupedBeans] = useState({});
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'countries'
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);

  const fetchCoffeeBeans = async () => {
    try {
      setLoading(true);
      const response = await coffeeBeansAPI.getAll();
      setCoffeeBeans(response.data);
    } catch (error) {
      console.error('Error fetching coffee beans:', error);
      toast.error('Failed to load coffee beans');
    } finally {
      setLoading(false);
    }
  };

  const filterBeans = useCallback(() => {
    let filtered = coffeeBeans;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(bean =>
        bean.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bean.origin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bean.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Roast level filter
    if (roastFilter !== 'all') {
      filtered = filtered.filter(bean => bean.roast_level === roastFilter);
    }

    setFilteredBeans(filtered);
  }, [coffeeBeans, searchTerm, roastFilter]);

  useEffect(() => {
    fetchCoffeeBeans();
  }, []);

  useEffect(() => {
    filterBeans();
  }, [filterBeans]);

  useEffect(() => {
    // Group beans by country
    const grouped = filteredBeans.reduce((acc, bean) => {
      const country = bean.origin || 'Unknown Origin';
      if (!acc[country]) {
        acc[country] = [];
      }
      acc[country].push(bean);
      return acc;
    }, {});
    setGroupedBeans(grouped);
  }, [filteredBeans]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleRoastFilterChange = (e) => {
    setRoastFilter(e.target.value);
  };

  const toggleCountry = (country) => {
    const newExpanded = new Set(expandedCountries);
    if (newExpanded.has(country)) {
      newExpanded.delete(country);
    } else {
      newExpanded.add(country);
    }
    setExpandedCountries(newExpanded);
  };

  const getCountrySummary = (beans) => {
    const totalQuantity = beans.reduce((sum, bean) => sum + (parseFloat(bean.total_inventory) || 0), 0);
    const lowStockCount = beans.filter(bean => (parseFloat(bean.total_inventory) || 0) < 500).length;
    const uniqueBeans = beans.length;
    
    return {
      totalQuantity: totalQuantity.toFixed(0),
      lowStockCount,
      uniqueBeans
    };
  };

  const getCountryFlag = (country) => {
    // Simple country to flag emoji mapping
    const flagMap = {
      'Brazil': '🇧🇷',
      'Colombia': '🇨🇴',
      'Ethiopia': '🇪��',
      'Guatemala': '🇬🇹',
      'Costa Rica': '🇨🇷',
      'Honduras': '🇭🇳',
      'Nicaragua': '🇳🇮',
      'Peru': '🇵🇪',
      'Mexico': '🇲🇽',
      'Kenya': '🇰🇪',
      'Tanzania': '🇹🇿',
      'Uganda': '🇺🇬',
      'Rwanda': '🇷🇼',
      'Burundi': '🇧🇮',
      'Indonesia': '🇮🇩',
      'Vietnam': '🇻🇳',
      'India': '🇮🇳',
      'Thailand': '🇹🇭',
      'Papua New Guinea': '🇵🇬',
      'Hawaii': '🇺🇸',
      'Jamaica': '🇯🇲',
      'Dominican Republic': '🇩🇴',
      'El Salvador': '🇸🇻',
      'Panama': '🇵🇦',
      'Bolivia': '🇧🇴',
      'Ecuador': '🇪🇨',
      'Venezuela': '🇻🇪',
      'Yemen': '🇾🇪',
      'Sumatra': '🇮🇩',
      'Java': '🇮🇩',
      'Sulawesi': '🇮🇩',
      'Bali': '🇮🇩',
      'Flores': '🇮🇩',
      'Timor': '🇹🇱',
      'Unknown Origin': '🌍'
    };
    
    return flagMap[country] || '🌍';
  };

  const handleQuantityAdjustment = async (beanId, adjustment) => {
    try {
      // Find the bean and update its inventory
      const updatedBeans = coffeeBeans.map(bean => {
        if (bean.id === beanId) {
          const currentInventory = parseFloat(bean.total_inventory) || 0;
          const newInventory = Math.max(0, currentInventory + parseFloat(adjustment));
          return { ...bean, total_inventory: newInventory };
        }
        return bean;
      });
      
      setCoffeeBeans(updatedBeans);
      toast.success('Quantity updated successfully');
    } catch (error) {
      console.error('Error adjusting quantity:', error);
      toast.error('Failed to update quantity');
    }
  };

  // Horizontal scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coffee Beans & Inventory</h1>
          <p className="text-gray-600 mt-1">Manage your coffee bean collection and home inventory</p>
        </div>
        <Link
          to="/coffee-beans/add"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coffee Bean</span>
        </Link>
      </div>

      {/* View Mode Toggle */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-4 h-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-700">View Mode:</span>
            </div>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'cards'
                    ? 'bg-white text-coffee-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode('countries')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                  viewMode === 'countries'
                    ? 'bg-white text-coffee-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                By Country
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredBeans.length} bean{filteredBeans.length !== 1 ? 's' : ''} • {Object.keys(groupedBeans).length} countries
          </div>
        </div>
      </div>

      {/* Search and Filters - Only show in Country view */}
      {viewMode === 'countries' && (
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search coffee beans..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="input w-full pl-10"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex flex-wrap gap-1">
                {[
                  { value: 'all', label: 'All' },
                  { value: 'Light', label: 'Light' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'Medium-Dark', label: 'Medium-Dark' },
                  { value: 'Dark', label: 'Dark' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleRoastFilterChange({ target: { value: option.value } })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border ${
                      roastFilter === option.value
                        ? 'border-coffee-500 bg-coffee-500 text-white'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-coffee-300 hover:bg-coffee-25'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {viewMode === 'cards' ? (
        <TabbedCoffeeBeans
          coffeeBeans={coffeeBeans}
          filteredBeans={filteredBeans}
          searchTerm={searchTerm}
          roastFilter={roastFilter}
          onSearchChange={handleSearchChange}
          onRoastFilterChange={handleRoastFilterChange}
        />
      ) : (
        /* Country-based view with horizontal scrolling */
        <div className="space-y-4">
          {Object.keys(groupedBeans).length > 0 ? (
            Object.entries(groupedBeans).map(([country, beans]) => {
              const countrySummary = getCountrySummary(beans);
              const isExpanded = expandedCountries.has(country);
              
              return (
                <div key={country} className="card">
                  {/* Country Header */}
                  <div 
                    className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-4 rounded-lg transition-colors"
                    onClick={() => toggleCountry(country)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getCountryFlag(country)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{country}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>{countrySummary.uniqueBeans} beans</span>
                          <span>{countrySummary.totalQuantity}g total</span>
                          {countrySummary.lowStockCount > 0 && (
                            <span className="text-red-600 flex items-center">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              {countrySummary.lowStockCount} low stock
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </div>

                  {/* Country Beans with Horizontal Scrolling */}
                  {isExpanded && (
                    <div className="mt-4 border-t border-gray-200 pt-4">
                      <div className="relative">
                        {/* Scroll Left Button */}
                        {scrollContainerRef.current && scrollPosition > 0 && (
                          <button
                            onClick={scrollLeft}
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                          >
                            <ChevronLeft className="w-4 h-4 text-gray-600" />
                          </button>
                        )}

                        {/* Scrollable Container */}
                        <div
                          ref={scrollContainerRef}
                          onScroll={handleScroll}
                          className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 px-2 touch-pan-x"
                          style={{
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            WebkitScrollbar: { display: 'none' }
                          }}
                        >
                          {beans.map((bean) => (
                            <div key={bean.id} className="card hover:shadow-medium transition-all duration-300 flex-shrink-0" style={{ minWidth: '280px', maxWidth: '280px' }}>
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                                    {bean.name}
                                  </h4>
                                </div>
                                <div className="flex-shrink-0 ml-3">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-coffee-100 text-coffee-800">
                                    {bean.roast_level}
                                  </span>
                                </div>
                              </div>

                              {bean.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                  {bean.description}
                                </p>
                              )}

                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                                    <span className="font-medium text-gray-700">
                                      {(parseFloat(bean.total_inventory) || 0).toFixed(0)}g
                                    </span>
                                    {(parseFloat(bean.total_inventory) || 0) < 500 && (
                                      <AlertTriangle className="w-4 h-4 text-red-500 ml-2" />
                                    )}
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-gray-600">Price per gram:</span>
                                  <span className="font-semibold text-coffee-600">
                                    {bean.price_per_lb ? 
                                      `${bean.buying_price_currency === 'HKD' ? 'HK$' : bean.buying_price_currency === 'JPY' ? '¥' : '$'}${(parseFloat(bean.price_per_lb) / 453.592).toFixed(4)}` : 
                                      'No price'
                                    }
                                  </span>
                                </div>
                              </div>

                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <div className="flex items-center justify-between">
                                  <Link 
                                    to={`/coffee-beans/${bean.id}`}
                                    className="text-sm text-coffee-600 hover:text-coffee-800 font-medium"
                                  >
                                    View Details
                                  </Link>
                                  <button
                                    onClick={() => {
                                      const adjustment = parseFloat(prompt('Enter quantity adjustment (use negative for reduction):', '0'));
                                      if (!isNaN(adjustment) && adjustment !== 0) {
                                        handleQuantityAdjustment(bean.id, adjustment);
                                      }
                                    }}
                                    className="text-sm text-gray-600 hover:text-coffee-600"
                                  >
                                    Adjust Quantity
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Scroll Right Button */}
                        {scrollContainerRef.current && 
                         scrollPosition < (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth) && (
                          <button
                            onClick={scrollRight}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all duration-200"
                          >
                            <ChevronRightIcon className="w-4 h-4 text-gray-600" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="card">
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No coffee beans found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || roastFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first coffee bean'
                  }
                </p>
                {!searchTerm && roastFilter === 'all' && (
                  <Link to="/coffee-beans/add" className="btn btn-primary">
                    Add Coffee Bean
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoffeeBeans; 