import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';
import TabbedAnalytics from '../components/TabbedAnalytics';
import { coffeeBeansAPI, tastingNotesAPI } from '../services/api';

const Analytics = () => {
  const [coffeeBeans, setCoffeeBeans] = useState([]);
  const [tastingNotes, setTastingNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [beans, tastings] = await Promise.all([
          coffeeBeansAPI.getAll(),
          tastingNotesAPI.getAll()
        ]);

        setCoffeeBeans(beans.data);
        setTastingNotes(tastings.data);

      } catch (error) {
        console.error('Error fetching analytics data:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-1">Comprehensive insights into your coffee bean collection</p>
      </div>

      {/* Tabbed Analytics */}
      <TabbedAnalytics 
        coffeeBeans={coffeeBeans} 
        tastingNotes={tastingNotes} 
      />
    </div>
  );
};

export default Analytics; 