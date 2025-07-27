import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Star, Calendar, Filter, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { tastingNotesAPI } from '../services/api';

const TastingNotes = () => {
  const [tastings, setTastings] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchTastingData();
  }, []);

  const fetchTastingData = async () => {
    try {
      setLoading(true);
      const [tastingsResponse, statsResponse] = await Promise.all([
        tastingNotesAPI.getAll(),
        tastingNotesAPI.getStats()
      ]);
      setTastings(tastingsResponse.data);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error fetching tasting data:', error);
      toast.error('Failed to load tasting notes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tasting note?')) {
      try {
        await tastingNotesAPI.delete(id);
        toast.success('Tasting note deleted successfully!');
        fetchTastingData();
      } catch (error) {
        console.error('Error deleting tasting note:', error);
        toast.error('Failed to delete tasting note');
      }
    }
  };

  const convertToCelsius = (fahrenheit) => {
    if (!fahrenheit) return null;
    return Math.round((fahrenheit - 32) * 5/9);
  };

  const getFilteredTastings = () => {
    switch (filter) {
      case 'excellent':
        return tastings.filter(t => parseFloat(t.overall_rating) >= 8);
      case 'good':
        return tastings.filter(t => {
          const rating = parseFloat(t.overall_rating);
          return rating >= 6 && rating < 8;
        });
      case 'poor':
        return tastings.filter(t => parseFloat(t.overall_rating) < 6);
      default:
        return tastings;
    }
  };

  const renderStars = (rating) => {
    const numRating = parseFloat(rating) || 0;
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(numRating / 2)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  const filteredTastings = getFilteredTastings();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tasting Notes</h1>
          <p className="text-gray-600 mt-1">Track your coffee tasting experiences</p>
        </div>
        <Link
          to="/tasting-notes/add"
          className="btn btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Tasting Note</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Tastings</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_tastings || 0}</p>
            </div>
                            <Star className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Beans</p>
              <p className="text-2xl font-bold text-gray-900">{stats.unique_beans || 0}</p>
            </div>
                            <Star className="w-6 h-6 text-coffee-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.avg_overall_rating ? `${(parseFloat(stats.avg_overall_rating) || 0).toFixed(1)}/10` : 'N/A'}
              </p>
            </div>
                            <Star className="w-6 h-6 text-green-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Excellent (8+)</p>
              <p className="text-2xl font-bold text-gray-900">{stats.excellent_count || 0}</p>
            </div>
                            <Star className="w-6 h-6 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="input max-w-xs"
          >
            <option value="all">All Tastings</option>
            <option value="excellent">Excellent (8+)</option>
            <option value="good">Good (6-7)</option>
            <option value="poor">Poor (&lt;6)</option>
          </select>
          <span className="text-sm text-gray-600">
            {filteredTastings.length} tasting{filteredTastings.length !== 1 ? 's' : ''} found
          </span>
        </div>
      </div>

      {/* Tasting Notes List */}
      <div className="space-y-4">
        {filteredTastings.length > 0 ? (
          filteredTastings.map((tasting) => (
            <div key={tasting.id} className="card">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {tasting.coffee_bean_name}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {tasting.origin} • {tasting.roast_level}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Brew Method:</span>
                      <p className="text-sm text-gray-900">{tasting.brew_method || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Grind Size:</span>
                      <p className="text-sm text-gray-900">{tasting.grind_size || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Water Temp:</span>
                      <p className="text-sm text-gray-900">
                        {tasting.water_temp ? `${convertToCelsius(tasting.water_temp)}°C` : 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Brew Time:</span>
                      <p className="text-sm text-gray-900">
                        {tasting.brew_time ? `${tasting.brew_time}s` : 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {tasting.notes && (
                    <p className="text-sm text-gray-600 mb-3">{tasting.notes}</p>
                  )}

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tasting.tasting_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {tasting.overall_rating}/10
                    </span>
                    <div className="flex">
                      {renderStars(tasting.overall_rating)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>Aroma: {tasting.aroma_rating}/10</div>
                    <div>Acidity: {tasting.acidity_rating}/10</div>
                    <div>Body: {tasting.body_rating}/10</div>
                    <div>Flavor: {tasting.flavor_rating}/10</div>
                    <div>Aftertaste: {tasting.aftertaste_rating}/10</div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 mt-2">
                    <Link
                      to={`/tasting-notes/${tasting.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Edit tasting note"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(tasting.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Delete tasting note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
                            <Star className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasting notes found</h3>
            <p className="text-gray-600 mb-4">
              {filter !== 'all' 
                ? 'Try adjusting your filter or add some tasting notes'
                : 'Start documenting your coffee tasting experiences'
              }
            </p>
            {filter === 'all' && (
              <Link to="/tasting-notes/add" className="btn btn-primary">
                Add Tasting Note
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TastingNotes; 