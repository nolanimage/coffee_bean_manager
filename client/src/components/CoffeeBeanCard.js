import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Package, MapPin, ArrowRight } from 'lucide-react';

const CoffeeBeanCard = ({ coffeeBean }) => {
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

  const formatRating = (rating) => {
    if (!rating && rating !== 0) return 'No ratings';
    const numRating = parseFloat(rating);
    if (isNaN(numRating)) return 'No ratings';
    return `${numRating.toFixed(1)}/10`;
  };

  const formatInventory = (inventory) => {
    if (!inventory && inventory !== 0) return 'No stock';
    const numInventory = parseFloat(inventory);
    if (isNaN(numInventory)) return 'No stock';
    return `${numInventory.toFixed(0)}g`;
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

  return (
    <Link to={`/coffee-beans/${coffeeBean.id}`} className="block group">
      <div className="card hover:shadow-medium transition-all duration-300 cursor-pointer group-hover:scale-[1.02]">
        {/* Photo */}
        {coffeeBean.photo_url && (
          <div className="mb-4">
            <img
              src={coffeeBean.photo_url}
              alt={coffeeBean.name}
              className="w-full h-32 object-cover rounded-xl"
            />
          </div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
              {coffeeBean.name}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">{coffeeBean.origin || 'Unknown origin'}</span>
            </div>
          </div>
          <div className="flex-shrink-0 ml-3">
            {getRoastLevelBadge(coffeeBean.roast_level)}
          </div>
        </div>

        {coffeeBean.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
            {coffeeBean.description}
          </p>
        )}

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <Package className="w-4 h-4 mr-2 text-gray-500" />
                <span className="font-medium text-gray-700">
                  {formatInventory(coffeeBean.total_inventory)}
                </span>
              </div>
              <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <span className="font-medium text-gray-700">
                  {formatRating(coffeeBean.avg_rating)}
                </span>
              </div>
            </div>
          </div>
          
          {coffeeBean.price_per_lb && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Price per gram:</span>
              <span className="font-semibold text-coffee-600">
                {formatPricePerGram(coffeeBean.price_per_lb, coffeeBean.buying_price_currency)}
              </span>
            </div>
          )}
        </div>

        {coffeeBean.tasting_count > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {coffeeBean.tasting_count} tasting{coffeeBean.tasting_count !== 1 ? 's' : ''} recorded
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-coffee-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        )}

        {coffeeBean.tasting_count === 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">No tastings yet</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-coffee-600 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default CoffeeBeanCard; 