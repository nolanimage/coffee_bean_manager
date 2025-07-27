import React from 'react';
import { clsx } from 'clsx';

const StatCard = ({ title, value, icon: Icon, change, changeType = 'neutral', description }) => {
  const getChangeColor = (type) => {
    switch (type) {
      case 'positive':
        return 'text-success-600';
      case 'negative':
        return 'text-danger-600';
      default:
        return 'text-gray-600';
    }
  };

  const getChangeIcon = (type) => {
    switch (type) {
      case 'positive':
        return '↗';
      case 'negative':
        return '↘';
      default:
        return '→';
    }
  };

  return (
    <div className="card hover:shadow-medium transition-all duration-300 group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1 truncate">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 truncate">{description}</p>
          )}
          {change && (
            <div className="flex items-center mt-1">
              <span className={clsx('text-sm font-medium', getChangeColor(changeType))}>
                {getChangeIcon(changeType)} {change}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-coffee-gradient rounded-xl shadow-glow group-hover:shadow-large transition-all duration-300 group-hover:scale-110 flex-shrink-0">
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard; 