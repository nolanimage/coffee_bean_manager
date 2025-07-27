import React from 'react';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  register, 
  validation = {},
  placeholder, 
  required = false, 
  error, 
  helperText,
  className = '',
  options = [], // For radio buttons and button groups
  ...props 
}) => {
  const inputProps = register ? register(name, validation) : {};

  // Roast level slider
  if (type === 'roast-slider') {
    const roastLevels = [
      { value: 'Light', label: 'Light', color: 'bg-yellow-200' },
      { value: 'Medium', label: 'Medium', color: 'bg-orange-300' },
      { value: 'Medium-Dark', label: 'Medium-Dark', color: 'bg-brown-400' },
      { value: 'Dark', label: 'Dark', color: 'bg-brown-600' }
    ];

    // Convert string value to slider index
    const getSliderValue = (value) => {
      const index = roastLevels.findIndex(level => level.value === value);
      return index >= 0 ? index : 1; // Default to Medium (index 1)
    };

    // Get current value or default to Medium
    const currentValue = inputProps.value || 'Medium';
    const currentIndex = getSliderValue(currentValue);

    // Create a hidden input for React Hook Form
    const hiddenInput = (
      <input
        type="hidden"
        {...inputProps}
        value={currentValue}
      />
    );

    return (
      <div className={`space-y-3 ${className}`}>
        {hiddenInput}
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          <div className="flex justify-between items-center mb-2">
            {roastLevels.map((level, index) => (
              <div key={level.value} className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${level.color} border-2 border-gray-300 transition-all duration-200`} />
                <span className="text-xs text-gray-600 mt-1">{level.label}</span>
              </div>
            ))}
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="3"
              step="1"
              value={currentIndex}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                const roastValue = roastLevels[index]?.value || 'Medium';
                
                // Update the form value using React Hook Form's onChange
                if (inputProps.onChange) {
                  inputProps.onChange({
                    target: {
                      name: name,
                      value: roastValue
                    }
                  });
                }
              }}
              onBlur={inputProps.onBlur}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-200 via-orange-300 to-brown-600 rounded-lg pointer-events-none opacity-30" />
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Light</span>
            <span>Medium</span>
            <span>Medium-Dark</span>
            <span>Dark</span>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
        {helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  // Radio button group
  if (type === 'radio-group') {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {options.map((option) => (
            <label key={option.value} className="relative cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                className="sr-only peer"
                {...inputProps}
                {...props}
              />
              <div className="p-3 text-center border-2 border-gray-200 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all duration-200 hover:border-gray-300">
                <span className="text-sm font-medium text-gray-700 peer-checked:text-blue-700">
                  {option.label}
                </span>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
        {helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  // Button group
  if (type === 'button-group') {
    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="flex flex-wrap gap-2">
          {options.map((option) => (
            <label key={option.value} className="relative cursor-pointer">
              <input
                type="radio"
                name={name}
                value={option.value}
                className="sr-only peer"
                {...inputProps}
                {...props}
              />
              <div className="px-4 py-2 text-sm border-2 border-gray-200 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 transition-all duration-200 hover:border-gray-300">
                <span className="font-medium text-gray-700 peer-checked:text-blue-700">
                  {option.label}
                </span>
              </div>
            </label>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
        {helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  // Currency selector with price input
  if (type === 'currency-price') {
    const currencies = [
      { value: 'USD', label: 'USD ($)', symbol: '$' },
      { value: 'HKD', label: 'HKD (HK$)', symbol: 'HK$' },
      { value: 'JPY', label: 'JPY (¥)', symbol: '¥' }
    ];

    return (
      <div className={`space-y-2 ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Currency
            </label>
            <select
              name={`${name}_currency`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              {...register(`${name}_currency`, { required: 'Currency is required' })}
            >
              {currencies.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Amount
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                {...register(name, { required: 'Price is required' })}
              />
              <span className="absolute left-3 top-2 text-gray-400 text-sm">
                $
              </span>
            </div>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error.message}</p>
        )}
        {helperText && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }

  // Default text input
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      {type === 'textarea' ? (
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-none"
          placeholder={placeholder}
          {...inputProps}
          {...props}
        />
      ) : type === 'range' ? (
        <div className="space-y-2">
          <input
            type={type}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            {...inputProps}
            {...props}
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{props.min || 0}</span>
            <span>{inputProps.value || props.min || 0}</span>
            <span>{props.max || 10}</span>
          </div>
        </div>
      ) : (
        <input
          type={type}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={placeholder}
          {...inputProps}
          {...props}
        />
      )}

      {error && (
        <p className="text-sm text-red-600">{error.message}</p>
      )}
      {helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default FormField; 