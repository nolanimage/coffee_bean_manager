import React, { useState, useRef } from 'react';
import { BarChart3, Map, PieChart, TrendingUp, DollarSign, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import WorldMap from './WorldMap';
import Charts from './Charts';
import CoffeeBeanCard from './CoffeeBeanCard';

const TabbedAnalytics = ({ coffeeBeans, tastingNotes }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);

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

  const tabs = [
    {
      id: 'overview',
      name: 'Overview',
      icon: BarChart3,
      description: 'Key metrics and summary'
    },
    {
      id: 'geography',
      name: 'Geography',
      icon: Map,
      description: 'World map and origins'
    },
    {
      id: 'distribution',
      name: 'Distribution',
      icon: PieChart,
      description: 'Charts and analytics'
    },
    {
      id: 'pricing',
      name: 'Pricing',
      icon: DollarSign,
      description: 'Price analysis'
    },
    {
      id: 'ratings',
      name: 'Ratings',
      icon: Star,
      description: 'Rating insights'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Beans</p>
                    <p className="text-2xl font-bold text-gray-900">{coffeeBeans.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Inventory</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {coffeeBeans.reduce((sum, bean) => sum + (parseFloat(bean.total_inventory) || 0), 0).toFixed(0)}g
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Map className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Unique Origins</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {new Set(coffeeBeans.map(bean => bean.origin)).size}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {coffeeBeans.length > 0 
                        ? (coffeeBeans.reduce((sum, bean) => sum + (parseFloat(bean.avg_rating) || 0), 0) / coffeeBeans.length).toFixed(1)
                        : '0.0'
                      }/10
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Most Expensive:</span>
                    <span className="font-medium">
                      {coffeeBeans.length > 0 
                        ? coffeeBeans.reduce((max, bean) => 
                            (parseFloat(bean.price_per_lb) || 0) > (parseFloat(max.price_per_lb) || 0) ? bean : max
                          ).name
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Highest Rated:</span>
                    <span className="font-medium">
                      {coffeeBeans.length > 0 
                        ? coffeeBeans.reduce((max, bean) => 
                            (parseFloat(bean.avg_rating) || 0) > (parseFloat(max.avg_rating) || 0) ? bean : max
                          ).name
                        : 'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Tastings:</span>
                    <span className="font-medium">
                      {coffeeBeans.reduce((sum, bean) => sum + (parseInt(bean.tasting_count) || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Origins</h3>
                <div className="space-y-2">
                  {Object.entries(
                    coffeeBeans.reduce((acc, bean) => {
                      acc[bean.origin] = (acc[bean.origin] || 0) + 1;
                      return acc;
                    }, {})
                  )
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([origin, count]) => (
                    <div key={origin} className="flex justify-between items-center">
                      <span className="text-gray-600">{origin}</span>
                      <span className="font-medium">{count} beans</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Coffee Beans Collection with Horizontal Scrolling */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Coffee Bean Collection</h3>
              
              {coffeeBeans.length > 0 ? (
                <div className="relative">
                  {/* Scroll Left Button */}
                  {scrollPosition > 0 && (
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
                    className="flex space-x-6 overflow-x-auto scrollbar-hide pb-4 touch-pan-x"
                    style={{
                      scrollbarWidth: 'none',
                      msOverflowStyle: 'none',
                      WebkitScrollbar: { display: 'none' }
                    }}
                  >
                    {coffeeBeans.map((bean) => (
                      <div key={bean.id} className="flex-shrink-0" style={{ minWidth: '320px', maxWidth: '320px' }}>
                        <CoffeeBeanCard coffeeBean={bean} />
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
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No coffee beans in your collection yet</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'geography':
        return (
          <div className="space-y-6">
            <WorldMap coffeeBeans={coffeeBeans} />
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Origin Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(
                  coffeeBeans.reduce((acc, bean) => {
                    acc[bean.origin] = (acc[bean.origin] || 0) + 1;
                    return acc;
                  }, {})
                )
                .sort(([,a], [,b]) => b - a)
                .map(([origin, count]) => (
                  <div key={origin} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900">{origin}</h4>
                    <p className="text-2xl font-bold text-coffee-600">{count}</p>
                    <p className="text-sm text-gray-600">coffee beans</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'distribution':
        return (
          <div className="space-y-6">
            <Charts coffeeBeans={coffeeBeans} tastingNotes={tastingNotes} />
          </div>
        );

      case 'pricing':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Price</p>
                  <p className="text-3xl font-bold text-green-600">
                    ${(coffeeBeans.reduce((sum, bean) => sum + (parseFloat(bean.price_per_lb) || 0), 0) / coffeeBeans.length / 453.592).toFixed(4)}
                  </p>
                  <p className="text-sm text-gray-500">per gram</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Most Expensive</p>
                  <p className="text-3xl font-bold text-red-600">
                    ${coffeeBeans.length > 0 
                      ? (Math.max(...coffeeBeans.map(bean => parseFloat(bean.price_per_lb) || 0)) / 453.592).toFixed(4)
                      : '0.0000'
                    }
                  </p>
                  <p className="text-sm text-gray-500">per gram</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Least Expensive</p>
                  <p className="text-3xl font-bold text-blue-600">
                    ${coffeeBeans.length > 0 
                      ? (Math.min(...coffeeBeans.map(bean => parseFloat(bean.price_per_lb) || 0)) / 453.592).toFixed(4)
                      : '0.0000'
                    }
                  </p>
                  <p className="text-sm text-gray-500">per gram</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Distribution</h3>
              <div className="space-y-3">
                {coffeeBeans
                  .sort((a, b) => (parseFloat(b.price_per_lb) || 0) - (parseFloat(a.price_per_lb) || 0))
                  .slice(0, 10)
                  .map((bean, index) => (
                    <div key={bean.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{bean.name}</span>
                      </div>
                      <span className="font-bold text-green-600">${((parseFloat(bean.price_per_lb) || 0) / 453.592).toFixed(4)}/g</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      case 'ratings':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rating Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Average Rating</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {coffeeBeans.length > 0 
                      ? (coffeeBeans.reduce((sum, bean) => sum + (parseFloat(bean.avg_rating) || 0), 0) / coffeeBeans.length).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-sm text-gray-500">out of 10</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Highest Rated</p>
                  <p className="text-3xl font-bold text-green-600">
                    {coffeeBeans.length > 0 
                      ? Math.max(...coffeeBeans.map(bean => parseFloat(bean.avg_rating) || 0)).toFixed(1)
                      : '0.0'
                    }
                  </p>
                  <p className="text-sm text-gray-500">out of 10</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Total Tastings</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {coffeeBeans.reduce((sum, bean) => sum + (parseInt(bean.tasting_count) || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-500">recorded</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Rated Beans</h3>
              <div className="space-y-3">
                {coffeeBeans
                  .filter(bean => (parseFloat(bean.avg_rating) || 0) > 0)
                  .sort((a, b) => (parseFloat(b.avg_rating) || 0) - (parseFloat(a.avg_rating) || 0))
                  .slice(0, 10)
                  .map((bean, index) => (
                    <div key={bean.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <span className="font-medium text-gray-900">{bean.name}</span>
                        <span className="text-sm text-gray-600">({bean.origin})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-yellow-600">{(parseFloat(bean.avg_rating) || 0).toFixed(1)}</span>
                        <span className="text-sm text-gray-500">/10</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-coffee-500 text-coffee-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabbedAnalytics; 