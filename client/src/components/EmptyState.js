import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  className = '' 
}) => {
  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="w-16 h-16 bg-coffee-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <Icon className="w-8 h-8 text-coffee-600" />
      </div>
      <h3 className="heading-3 mb-3">{title}</h3>
      <p className="text-body mb-8 max-w-md mx-auto">{description}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState; 