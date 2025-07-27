import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Coffee, Upload, X, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { coffeeBeansAPI } from '../services/api';
import FormField from '../components/FormField';

const AddCoffeeBean = () => {
  const navigate = useNavigate();
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm();

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Photo must be less than 5MB');
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPhotoPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const onSubmit = async (data) => {
    try {
      // Extract currency data from the form
      const formData = {
        ...data,
        buying_price_currency: data.buying_price_currency || 'USD',
        // Set the total_inventory to the amount_grams for new beans
        total_inventory: data.amount_grams || 0
      };

      // If there's a photo file, convert to base64
      if (photoFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64Photo = e.target.result;
          const enrichedData = { ...formData, photo_url: base64Photo };
          await coffeeBeansAPI.create(enrichedData);
          toast.success('Coffee bean and inventory added successfully!');
          navigate('/coffee-beans');
        };
        reader.readAsDataURL(photoFile);
      } else {
        await coffeeBeansAPI.create(formData);
        toast.success('Coffee bean and inventory added successfully!');
        navigate('/coffee-beans');
      }
    } catch (error) {
      console.error('Error adding coffee bean:', error);
      toast.error('Failed to add coffee bean');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/coffee-beans')}
          className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-coffee-gradient rounded-xl flex items-center justify-center shadow-glow">
                            <Coffee className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="heading-2">Add Coffee Bean & Inventory</h1>
            <p className="text-body">Add a new coffee bean to your collection and track its inventory</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-coffee-100 rounded-lg flex items-center justify-center">
                              <Coffee className="w-3.5 h-3.5 text-coffee-600" />
            </div>
            <h2 className="heading-3">Coffee Bean Information</h2>
          </div>

          <div className="space-y-6">
            <FormField
              label="Coffee Name *"
              name="name"
              type="text"
              register={register}
              validation={{ required: 'Coffee name is required' }}
              placeholder="e.g., Ethiopian Yirgacheffe"
              required
              error={errors.name?.message}
            />

            {/* Photo Upload */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Coffee Photo
              </label>
              <div className="space-y-4">
                {photoPreview ? (
                  <div className="relative">
                    <img
                      src={photoPreview}
                      alt="Coffee preview"
                      className="w-full h-48 object-cover rounded-xl border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-coffee-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                    />
                    <label
                      htmlFor="photo-upload"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Click to upload a photo of your coffee
                      </span>
                      <span className="text-xs text-gray-500">
                        JPG, PNG up to 5MB
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Origin"
                name="origin"
                type="text"
                register={register}
                placeholder="e.g., Ethiopia"
              />

              <FormField
                label="Roast Level"
                name="roast_level"
                type="roast-slider"
                register={register}
                validation={{ required: 'Roast level is required' }}
              />
            </div>

            <FormField
              label="Description (optional)"
              name="description"
              type="textarea"
              register={register}
              placeholder="Any notes about flavor, brewing method, etc."
            />
          </div>
        </div>

        {/* Inventory Section */}
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Package className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <h2 className="heading-3">Inventory & Purchase Details</h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Initial Stock (grams) *"
                name="amount_grams"
                type="number"
                register={register}
                validation={{ required: 'Initial stock amount is required' }}
                placeholder="250"
                step="1"
                min="0"
                helperText="How much coffee did you buy?"
                error={errors.amount_grams?.message}
              />

              <FormField
                label="Total Price *"
                name="buying_price"
                type="currency-price"
                register={register}
                validation={{ required: 'Price is required' }}
                error={errors.buying_price?.message}
              />
            </div>

            <FormField
              label="Where you bought it"
              name="buying_place"
              type="text"
              register={register}
              placeholder="e.g., Local Coffee Shop, Online Store"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Purchase Date"
                name="buying_date"
                type="date"
                register={register}
              />

              <FormField
                label="Roast Date"
                name="roast_date"
                type="date"
                register={register}
              />
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={() => navigate('/coffee-beans')}
            className="btn btn-secondary w-full sm:w-auto"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Adding...' : 'Add Coffee Bean & Inventory'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCoffeeBean; 