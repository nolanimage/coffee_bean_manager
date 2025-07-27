import React, { useState, useRef, useEffect } from 'react';
import { Coffee, BarChart3, Grid, ChevronLeft, ChevronRight } from 'lucide-react';
import CoffeeBeanCard from './CoffeeBeanCard';
import SimpleChart from './SimpleChart';

const TabbedCoffeeBeans = ({ coffeeBeans, filteredBeans, searchTerm, roastFilter, onSearchChange, onRoastFilterChange }) => {
  const [activeTab, setActiveTab] = useState('list');
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);

  const tabs = [
    {
      id: 'list',
      name: 'Coffee Beans',
      icon: Coffee,
      description: 'Browse your collection'
    },
    {
      id: 'analytics',
      name: 'Quick Analytics',
      icon: BarChart3,
      description: 'Charts and insights'
    }
  ];

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'list':
        return (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="card">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Coffee className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search coffee beans..."
                      value={searchTerm}
                      onChange={onSearchChange}
                      className="input pl-10"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
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
                        onClick={() => onRoastFilterChange({ target: { value: option.value } })}
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

            {/* Results */}
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {filteredBeans.length} coffee bean{filteredBeans.length !== 1 ? 's' : ''} found
                </h2>
              </div>

              {filteredBeans.length > 0 ? (
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
                    {filteredBeans.map((bean) => (
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
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Coffee className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No coffee beans found</h3>
                  <p className="text-gray-600 mb-4">
                    {searchTerm || roastFilter !== 'all' 
                      ? 'Try adjusting your search or filters'
                      : 'Start by adding your first coffee bean'
                    }
                  </p>
                  {!searchTerm && roastFilter === 'all' && (
                    <button className="btn btn-primary">
                      Add Coffee Bean
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );

      case 'analytics':
        return (
          <div className="space-y-6">
            {coffeeBeans.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SimpleChart
                  data={coffeeBeans
                    .map(bean => ({
                      name: bean.name.length > 15 ? bean.name.substring(0, 15) + '...' : bean.name,
                      inventory: parseFloat(bean.total_inventory) || 0
                    }))
                    .sort((a, b) => b.inventory - a.inventory)
                    .slice(0, 5)
                  }
                  title="Top 5 Inventory Levels (grams)"
                  dataKey="inventory"
                  color="#82ca9d"
                />
                <SimpleChart
                  data={Object.entries(
                    coffeeBeans.reduce((acc, bean) => {
                      acc[bean.roast_level] = (acc[bean.roast_level] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([roast, count]) => ({ name: roast, count }))}
                  title="Roast Level Distribution"
                  dataKey="count"
                  color="#8884d8"
                />
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No data to analyze</h3>
                <p className="text-gray-600 mb-4">Add some coffee beans to see analytics</p>
              </div>
            )}
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
        <nav className="-mb-px flex space-x-8">
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
      <div>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default TabbedCoffeeBeans; 