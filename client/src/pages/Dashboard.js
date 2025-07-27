import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, Package, BookOpen, TrendingUp, Plus, AlertTriangle, Star, Calendar, Clock, DollarSign, ArrowRight, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import StatCard from '../components/StatCard';
import CoffeeBeanCard from '../components/CoffeeBeanCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import { coffeeBeansAPI, tastingNotesAPI, brewingAPI, freshnessAPI, costAPI } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBeans: 0,
    totalInventory: 0,
    totalTastings: 0,
    avgRating: 0,
    lowStockCount: 0,
    uniqueCountries: 0
  });
  const [recentBeans, setRecentBeans] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [topRatedTastings, setTopRatedTastings] = useState([]);
  const [upcomingBrews, setUpcomingBrews] = useState([]);
  const [freshnessAlerts, setFreshnessAlerts] = useState([]);
  const [costSummary, setCostSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all data in parallel
        const [beans, topRated, upcoming, alerts, cost] = await Promise.all([
          coffeeBeansAPI.getAll(),
          tastingNotesAPI.getTopRated(5),
          brewingAPI.getUpcoming(3),
          freshnessAPI.getAlerts(),
          costAPI.getAnalysis()
        ]);

        setRecentBeans(beans.data.slice(0, 6));
        setTopRatedTastings(topRated.data);
        setUpcomingBrews(upcoming.data);
        setFreshnessAlerts(alerts.data.slice(0, 3)); // Show top 3 alerts
        setCostSummary(cost.data);

        // Calculate stats
        const totalBeans = beans.data.length;
        const totalInventory = beans.data.reduce((sum, bean) => sum + (parseFloat(bean.total_inventory) || 0), 0);
        const totalTastings = beans.data.reduce((sum, bean) => sum + (parseInt(bean.tasting_count) || 0), 0);
        const avgRating = beans.data.length > 0 
          ? beans.data.reduce((sum, bean) => sum + (parseFloat(bean.avg_rating) || 0), 0) / beans.data.length
          : 0;
        const lowStockCount = beans.data.filter(bean => (parseFloat(bean.total_inventory) || 0) < 500).length;
        const uniqueCountries = new Set(beans.data.map(bean => bean.origin).filter(Boolean)).size;

        setStats({
          totalBeans,
          totalInventory: totalInventory.toFixed(1),
          totalTastings,
          avgRating: avgRating.toFixed(1),
          lowStockCount,
          uniqueCountries
        });

        // Set low stock items (beans with less than 500g)
        setLowStockItems(beans.data.filter(bean => (parseFloat(bean.total_inventory) || 0) < 500));

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="heading-1">Dashboard</h1>
          <p className="text-body mt-2">Overview of your coffee bean collection and inventory</p>
        </div>
        <div className="flex space-x-3 w-full sm:w-auto">
          <Link
            to="/coffee-beans/add"
            className="btn btn-primary flex items-center space-x-2 flex-1 sm:flex-none justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>Add Coffee Bean</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid with Horizontal Scrolling */}
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

        {/* Scrollable Stats Container */}
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
          <div className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '280px' }}>
            <StatCard
              title="Coffee Beans"
              value={stats.totalBeans}
              icon={Coffee}
              description="Different varieties"
            />
          </div>
          <div className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '280px' }}>
            <StatCard
              title="Total Inventory"
              value={`${stats.totalInventory}g`}
              icon={Package}
              description="Across all beans"
            />
          </div>
          <div className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '280px' }}>
            <StatCard
              title="Countries"
              value={stats.uniqueCountries}
              icon={Globe}
              description="Of origin"
            />
          </div>
          <div className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '280px' }}>
            <StatCard
              title="Low Stock"
              value={stats.lowStockCount}
              icon={AlertTriangle}
              description="Items below 500g"
            />
          </div>
          <div className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '280px' }}>
            <StatCard
              title="Total Tastings"
              value={stats.totalTastings}
              icon={BookOpen}
              description="Tasting notes recorded"
            />
          </div>
          <div className="flex-shrink-0" style={{ minWidth: '280px', maxWidth: '280px' }}>
            <StatCard
              title="Average Rating"
              value={`${stats.avgRating}/10`}
              icon={TrendingUp}
              description="Overall quality"
            />
          </div>
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

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-2">Low Stock Alerts</h2>
            <Link to="/coffee-beans" className="text-coffee-600 hover:text-coffee-700 font-medium flex items-center space-x-1 group">
              <span>View all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="card">
            <div className="space-y-4">
              {lowStockItems.slice(0, 5).map((bean) => (
                <div key={bean.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{bean.name}</h4>
                    <p className="text-sm text-gray-600">
                      {bean.origin} • {bean.roast_level}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium text-red-600">
                      {(parseFloat(bean.total_inventory) || 0).toFixed(0)}g
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Brewing Sessions */}
      {upcomingBrews.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-2">Upcoming Brewing Sessions</h2>
            <Link to="/brewing-schedule" className="text-coffee-600 hover:text-coffee-700 font-medium flex items-center space-x-1 group">
              <span>View all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="card">
            <div className="space-y-4">
              {upcomingBrews.map((brew) => (
                <div key={brew.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{brew.coffee_bean_name}</h4>
                    <p className="text-sm text-gray-600">
                      {brew.brew_method} • {new Date(brew.scheduled_date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {brew.scheduled_time && ` • ${new Date(`2000-01-01T${brew.scheduled_time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 capitalize">{brew.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Freshness Alerts */}
      {freshnessAlerts.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-2">Freshness Alerts</h2>
            <Link to="/freshness-alerts" className="text-coffee-600 hover:text-coffee-700 font-medium flex items-center space-x-1 group">
              <span>View all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="card">
            <div className="space-y-4">
              {freshnessAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{alert.name}</h4>
                    <p className="text-sm text-gray-600">
                      {alert.origin} • {alert.total_inventory}g in stock
                    </p>
                    <p className="text-sm text-gray-500">
                      {alert.freshness_status === 'expired' && `Expired ${Math.abs(alert.days_until_expiry)} days ago`}
                      {alert.freshness_status === 'expiring_soon' && `Expires in ${alert.days_until_expiry} days`}
                      {alert.freshness_status === 'old_roast' && `Roasted ${alert.days_since_roast} days ago`}
                      {alert.freshness_status === 'aging_roast' && `Roasted ${alert.days_since_roast} days ago`}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-warning-500" />
                    <span className="text-sm text-gray-600 capitalize">
                      {alert.freshness_status === 'expired' && 'Expired'}
                      {alert.freshness_status === 'expiring_soon' && 'Expiring Soon'}
                      {alert.freshness_status === 'old_roast' && 'Old Roast'}
                      {alert.freshness_status === 'aging_roast' && 'Aging Roast'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Top Rated Tastings */}
      {topRatedTastings.length > 0 && (
        <div className="animate-slide-up">
          <div className="flex justify-between items-center mb-6">
            <h2 className="heading-2">Top Rated Tastings</h2>
            <Link to="/tasting-notes" className="text-coffee-600 hover:text-coffee-700 font-medium flex items-center space-x-1 group">
              <span>View all</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="card">
            <div className="space-y-4">
              {topRatedTastings.map((tasting) => (
                <div key={tasting.id} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{tasting.coffee_bean_name}</h4>
                    <p className="text-sm text-gray-600">
                      {tasting.brew_method} • {tasting.tasting_date}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{tasting.overall_rating}/10</span>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(tasting.overall_rating / 2)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Coffee Beans with Horizontal Scrolling */}
      <div className="animate-slide-up">
        <div className="flex justify-between items-center mb-6">
          <h2 className="heading-2">Recent Coffee Beans</h2>
          <Link to="/coffee-beans" className="text-coffee-600 hover:text-coffee-700 font-medium flex items-center space-x-1 group">
            <span>View all</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {recentBeans.length > 0 ? (
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
              {recentBeans.map((bean) => (
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
          <EmptyState
            icon={Coffee}
            title="No coffee beans yet"
            description="Start building your coffee bean collection"
            actionText="Add Your First Coffee Bean"
            actionLink="/coffee-beans/add"
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard; 