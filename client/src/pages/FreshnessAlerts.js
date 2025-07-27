import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Calendar, Coffee, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { freshnessAPI } from '../services/api';

const FreshnessAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertsRes, summaryRes] = await Promise.all([
        freshnessAPI.getAlerts(),
        freshnessAPI.getSummary()
      ]);

      setAlerts(alertsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching freshness data:', error);
      toast.error('Failed to load freshness alerts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'expired':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'expiring_soon':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'expiring_month':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'old_roast':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'aging_roast':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'fresh_roast':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Coffee className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'expired':
        return 'bg-red-50 border-red-200';
      case 'expiring_soon':
        return 'bg-orange-50 border-orange-200';
      case 'expiring_month':
        return 'bg-yellow-50 border-yellow-200';
      case 'old_roast':
        return 'bg-red-50 border-red-200';
      case 'aging_roast':
        return 'bg-orange-50 border-orange-200';
      case 'fresh_roast':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'expired':
        return 'Expired';
      case 'expiring_soon':
        return 'Expiring Soon';
      case 'expiring_month':
        return 'Expiring This Month';
      case 'old_roast':
        return 'Old Roast';
      case 'aging_roast':
        return 'Aging Roast';
      case 'fresh_roast':
        return 'Fresh Roast';
      default:
        return 'No Date Info';
    }
  };

  const getStatusDescription = (alert) => {
    if (alert.freshness_status === 'expired') {
      return `Expired ${Math.abs(alert.days_until_expiry)} days ago`;
    } else if (alert.freshness_status === 'expiring_soon') {
      return `Expires in ${alert.days_until_expiry} days`;
    } else if (alert.freshness_status === 'expiring_month') {
      return `Expires in ${alert.days_until_expiry} days`;
    } else if (alert.freshness_status === 'old_roast') {
      return `Roasted ${alert.days_since_roast} days ago`;
    } else if (alert.freshness_status === 'aging_roast') {
      return `Roasted ${alert.days_since_roast} days ago`;
    } else if (alert.freshness_status === 'fresh_roast') {
      return `Roasted ${alert.days_since_roast} days ago`;
    }
    return 'No date information available';
  };

  const getPriorityScore = (alert) => {
    switch (alert.freshness_status) {
      case 'expired':
        return 1;
      case 'expiring_soon':
        return 2;
      case 'old_roast':
        return 3;
      case 'expiring_month':
        return 4;
      case 'aging_roast':
        return 5;
      default:
        return 6;
    }
  };

  const sortedAlerts = alerts.sort((a, b) => getPriorityScore(a) - getPriorityScore(b));

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Freshness Alerts</h1>
        <p className="text-gray-600 mt-1">Track bean freshness and get alerts for expiring or aging coffee</p>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <XCircle className="w-6 h-6 text-red-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.expired_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.expiring_soon_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expiring This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.expiring_month_count || 0}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Fresh</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.fresh_count || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Alerts List */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Freshness Alerts</h2>
            
            {sortedAlerts.length === 0 ? (
              <div className="text-center py-8">
                <Coffee className="w-10 h-10 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No freshness alerts at this time</p>
                <p className="text-sm text-gray-400 mt-1">All your beans are fresh and within their best-by dates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sortedAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-lg border ${getStatusColor(alert.freshness_status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        {getStatusIcon(alert.freshness_status)}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-medium text-gray-900">{alert.name}</h3>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white text-gray-800">
                              {getStatusText(alert.freshness_status)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{alert.origin}</p>
                          <p className="text-sm text-gray-500 mt-1">{getStatusDescription(alert)}</p>
                          
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <Coffee className="w-4 h-4" />
                              <span>{alert.total_inventory}g in stock</span>
                            </div>
                            
                            {alert.roast_date && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>Roasted: {new Date(alert.roast_date).toLocaleDateString()}</span>
                              </div>
                            )}
                            
                            {alert.best_by_date && (
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>Best by: {new Date(alert.best_by_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Freshness Guidelines */}
          <div className="card mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Freshness Guidelines</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Best By Dates</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span><strong>Expired:</strong> Past best-by date</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span><strong>Expiring Soon:</strong> Within 7 days</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span><strong>Expiring This Month:</strong> Within 30 days</span>
                  </li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Roast Dates</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span><strong>Old Roast:</strong> 90+ days since roast</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <span><strong>Aging Roast:</strong> 60-90 days since roast</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span><strong>Fresh Roast:</strong> Less than 60 days</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FreshnessAlerts; 