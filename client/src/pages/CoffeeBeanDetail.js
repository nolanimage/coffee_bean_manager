import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, Star, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { coffeeBeansAPI, tastingNotesAPI } from '../services/api';

const CoffeeBeanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coffeeBean, setCoffeeBean] = useState(null);
  const [tastings, setTastings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCoffeeBeanData = async () => {
    try {
      setLoading(true);
      console.log('Fetching coffee bean with ID:', id);
      
      const [beanResponse, tastingsResponse] = await Promise.all([
        coffeeBeansAPI.getById(id),
        tastingNotesAPI.getByBeanId(id)
      ]);
      
      console.log('Coffee bean response:', beanResponse);
      console.log('Tastings response:', tastingsResponse);
      
      setCoffeeBean(beanResponse.data);
      setTastings(tastingsResponse.data);
    } catch (error) {
      console.error('Error fetching coffee bean data:', error);
      console.error('Error details:', error.response?.data || error.message);
      toast.error('Failed to load coffee bean');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoffeeBeanData();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this coffee bean? This action cannot be undone.')) {
      try {
        await coffeeBeansAPI.delete(id);
        toast.success('Coffee bean deleted successfully');
        navigate('/coffee-beans');
      } catch (error) {
        console.error('Error deleting coffee bean:', error);
        toast.error('Failed to delete coffee bean');
      }
    }
  };

  const getRoastLevelBadge = (level) => {
    const badgeClasses = {
      'Light': 'badge-light',
      'Medium': 'badge-medium',
      'Medium-Dark': 'badge-dark',
      'Dark': 'badge-dark'
    };
    
    return (
      <span className={`badge ${badgeClasses[level] || 'badge-light'}`}>
        {level}
      </span>
    );
  };

  const formatPrice = (price, currency = 'USD') => {
    if (!price && price !== 0) return 'No price';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return 'No price';
    
    const currencySymbols = {
      'USD': '$',
      'HKD': 'HK$',
      'JPY': '¥'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${numPrice.toFixed(2)}`;
  };

  const formatPricePerGram = (pricePerGram, currency = 'USD') => {
    if (!pricePerGram && pricePerGram !== 0) return 'No price';
    const numPrice = parseFloat(pricePerGram);
    if (isNaN(numPrice)) return 'No price';
    
    const currencySymbols = {
      'USD': '$',
      'HKD': 'HK$',
      'JPY': '¥'
    };
    
    const symbol = currencySymbols[currency] || '$';
    return `${symbol}${numPrice.toFixed(4)}`;
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating / 2)
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

  if (!coffeeBean) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Coffee Bean Not Found</h2>
        <p className="text-gray-600 mb-6">The coffee bean you're looking for doesn't exist.</p>
        <Link to="/coffee-beans" className="btn btn-primary">
          Back to Coffee Beans
        </Link>
      </div>
    );
  }

  const totalInventory = parseFloat(coffeeBean?.total_inventory) || 0;
  const avgRating = tastings.length > 0 
    ? tastings.reduce((sum, tasting) => sum + (parseFloat(tasting.overall_rating) || 0), 0) / tastings.length
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/coffee-beans')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{coffeeBean.name}</h1>
            <div className="flex items-center space-x-2 mt-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{coffeeBean.origin || 'Unknown origin'}</span>
              {getRoastLevelBadge(coffeeBean.roast_level)}
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/coffee-beans/${id}/edit`)}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Inventory</p>
              <p className="text-2xl font-bold text-gray-900">
                {totalInventory.toFixed(0)}g
              </p>
            </div>
                            <Package className="w-6 h-6 text-coffee-600" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasting Notes</p>
              <p className="text-2xl font-bold text-gray-900">{tastings.length}</p>
            </div>
                            <Star className="w-6 h-6 text-yellow-500" />
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Average Rating</p>
              <p className="text-2xl font-bold text-gray-900">
                {avgRating ? `${avgRating.toFixed(1)}/10` : 'No ratings'}
              </p>
            </div>
                            <Star className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      {/* Coffee Bean Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Photo */}
        {coffeeBean.photo_url && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Coffee Photo</h2>
            <img
              src={coffeeBean.photo_url}
              alt={coffeeBean.name}
              className="w-full h-64 object-cover rounded-xl"
            />
          </div>
        )}
        
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Name:</span>
              <p className="text-gray-900">{coffeeBean.name}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Origin:</span>
              <p className="text-gray-900">{coffeeBean.origin || 'Not specified'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Roast Level:</span>
              <div className="mt-1">{getRoastLevelBadge(coffeeBean.roast_level)}</div>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Process Method:</span>
              <p className="text-gray-900">{coffeeBean.process_method || 'Not specified'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Altitude:</span>
              <p className="text-gray-900">{coffeeBean.altitude || 'Not specified'}</p>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Varietal:</span>
              <p className="text-gray-900">{coffeeBean.varietal || 'Not specified'}</p>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">
                {coffeeBean.price_per_lb ? formatPricePerGram(coffeeBean.price_per_lb, coffeeBean.buying_price_currency) + '/g' : 'Not specified'}
              </span>
            </div>
            
            <div>
              <span className="text-sm font-medium text-gray-600">Supplier:</span>
              <p className="text-gray-900">{coffeeBean.supplier || 'Not specified'}</p>
            </div>
            
            {coffeeBean.description && (
              <div>
                <span className="text-sm font-medium text-gray-600">Description:</span>
                <p className="text-gray-900 mt-1">{coffeeBean.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Buying Information */}
        {(coffeeBean.buying_date || coffeeBean.buying_place || coffeeBean.buying_price || coffeeBean.amount_grams || coffeeBean.photo_url) && (
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Buying Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coffeeBean.buying_date && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Buying Date:</span>
                  <p className="text-gray-900">{new Date(coffeeBean.buying_date).toLocaleDateString()}</p>
                </div>
              )}
              
              {coffeeBean.buying_place && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Buying Place:</span>
                  <p className="text-gray-900">{coffeeBean.buying_place}</p>
                </div>
              )}
              
              {coffeeBean.buying_price && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Total Price:</span>
                  <p className="text-gray-900">{formatPrice(coffeeBean.buying_price, coffeeBean.buying_price_currency)}</p>
                </div>
              )}
              
              {coffeeBean.amount_grams && (
                <div>
                  <span className="text-sm font-medium text-gray-600">Amount:</span>
                  <p className="text-gray-900">{coffeeBean.amount_grams}g</p>
                </div>
              )}
              
              {coffeeBean.photo_url && (
                <div className="md:col-span-2">
                  <span className="text-sm font-medium text-gray-600">Photo:</span>
                  <div className="mt-2">
                    <img 
                      src={coffeeBean.photo_url} 
                      alt={coffeeBean.name}
                      className="w-full max-w-md h-auto rounded-lg shadow-md"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                    <div className="hidden text-sm text-gray-500 mt-1">
                      Unable to load image. <a href={coffeeBean.photo_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View image</a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Current Stock */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Current Stock</h2>
            <Link
              to="/coffee-beans/add"
              className="btn btn-primary text-sm"
            >
              Add Coffee Bean
            </Link>
          </div>
          
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {(parseFloat(coffeeBean?.total_inventory) || 0).toFixed(0)}g
                </p>
                <p className="text-sm text-gray-600">
                  Total inventory in stock
                </p>
                {coffeeBean?.buying_date && (
                  <p className="text-sm text-gray-500 mt-1">
                    Purchased: {new Date(coffeeBean.buying_date).toLocaleDateString()}
                  </p>
                )}
              </div>
              {(parseFloat(coffeeBean?.total_inventory) || 0) < 500 && (
                <div className="text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full">
                  Low Stock
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tasting Notes */}
      {tastings.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tasting Notes</h2>
            <Link
              to="/tasting-notes/add"
              className="btn btn-primary text-sm"
            >
              Add Tasting Note
            </Link>
          </div>
          
          <div className="space-y-4">
            {tastings.slice(0, 5).map((tasting) => (
              <div key={tasting.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-sm text-gray-500">
                        {new Date(tasting.tasting_date).toLocaleDateString()}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{tasting.brew_method}</span>
                    </div>
                    
                    {tasting.notes && (
                      <p className="text-sm text-gray-600 mb-2">{tasting.notes}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-500">
                      <div>Aroma: {tasting.aroma_rating}/10</div>
                      <div>Acidity: {tasting.acidity_rating}/10</div>
                      <div>Body: {tasting.body_rating}/10</div>
                      <div>Flavor: {tasting.flavor_rating}/10</div>
                      <div>Aftertaste: {tasting.aftertaste_rating}/10</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">
                      {tasting.overall_rating}/10
                    </span>
                    <div className="flex">
                      {renderStars(tasting.overall_rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {tastings.length > 5 && (
            <div className="mt-4 text-center">
              <Link
                to="/tasting-notes"
                className="text-coffee-600 hover:text-coffee-700 font-medium"
              >
                View all {tastings.length} tasting notes →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CoffeeBeanDetail; 