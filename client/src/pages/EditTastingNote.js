import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Save, Coffee } from 'lucide-react';
import toast from 'react-hot-toast';
import { tastingNotesAPI, coffeeBeansAPI } from '../services/api';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';

const EditTastingNote = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tastingNote, setTastingNote] = useState(null);
  const [coffeeBeans, setCoffeeBeans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [tastingRes, beansRes] = await Promise.all([
          tastingNotesAPI.getById(id),
          coffeeBeansAPI.getAll()
        ]);
        
        setTastingNote(tastingRes.data);
        setCoffeeBeans(beansRes.data);
        
        // Convert Fahrenheit to Celsius for display
        const data = tastingRes.data;
        if (data.water_temp) {
          data.water_temp = Math.round((data.water_temp - 32) * 5/9);
        }
        
        reset(data);
      } catch (error) {
        console.error('Error fetching tasting note:', error);
        toast.error('Failed to load tasting note');
        navigate('/tasting-notes');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate, reset]);

  const onSubmit = async (data) => {
    try {
      // Convert Celsius to Fahrenheit for storage
      if (data.water_temp) {
        data.water_temp = Math.round((data.water_temp * 9/5) + 32);
      }
      
      // Ensure all required fields are present
      const formData = {
        coffee_bean_id: parseInt(data.coffee_bean_id),
        brew_method: data.brew_method || null,
        overall_rating: parseFloat(data.overall_rating),
        notes: data.notes || null,
        tasting_date: data.tasting_date || new Date().toISOString().split('T')[0],
        water_temp: data.water_temp || null,
        brew_time: data.brew_time ? parseInt(data.brew_time) : null
      };
      
      await tastingNotesAPI.update(id, formData);
      toast.success('Tasting note updated successfully!');
      navigate('/tasting-notes');
    } catch (error) {
      console.error('Error updating tasting note:', error);
      if (error.response?.data?.error) {
        toast.error(`Failed to update tasting note: ${error.response.data.error}`);
      } else {
        toast.error('Failed to update tasting note');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading tasting note..." />
      </div>
    );
  }

  if (!tastingNote) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="heading-2 text-gray-900 mb-2">Tasting Note Not Found</h2>
          <p className="text-body text-gray-600 mb-4">The tasting note you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/tasting-notes')}
            className="btn btn-primary"
          >
            Back to Tasting Notes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-8">
        <button
          onClick={() => navigate('/tasting-notes')}
          className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-coffee-500"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-coffee-gradient rounded-xl flex items-center justify-center shadow-glow">
            <Coffee className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="heading-2">Edit Tasting Note</h1>
            <p className="text-body">Update your coffee tasting experience</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="card">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-coffee-100 rounded-lg flex items-center justify-center">
              <Coffee className="w-4 h-4 text-coffee-600" />
            </div>
            <h2 className="heading-3">Tasting Information</h2>
          </div>

          <div className="space-y-6">
            {/* Coffee Bean Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Coffee Bean *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {coffeeBeans.map((bean) => (
                  <label key={bean.id} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="coffee_bean_id"
                      value={bean.id}
                      className="sr-only peer"
                      {...register('coffee_bean_id', { required: 'Coffee bean is required' })}
                    />
                    <div className="p-4 border-2 border-gray-200 rounded-xl transition-all duration-200 peer-checked:border-coffee-500 peer-checked:bg-coffee-50 hover:border-coffee-300 hover:bg-coffee-25">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 text-sm">{bean.name}</h3>
                          <p className="text-gray-600 text-xs mt-1">{bean.origin}</p>
                          <div className="flex items-center mt-2">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-coffee-100 text-coffee-800">
                              {bean.roast_level}
                            </span>
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full peer-checked:border-coffee-500 peer-checked:bg-coffee-500 flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full peer-checked:block hidden"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              {errors.coffee_bean_id && (
                <p className="text-red-600 text-sm mt-2">{errors.coffee_bean_id.message}</p>
              )}
            </div>

            <FormField
              label="Brew Method"
              name="brew_method"
              type="button-group"
              register={register}
              options={[
                { value: 'Pour Over', label: 'Pour Over' },
                { value: 'French Press', label: 'French Press' },
                { value: 'Espresso', label: 'Espresso' },
                { value: 'AeroPress', label: 'AeroPress' },
                { value: 'Chemex', label: 'Chemex' },
                { value: 'Moka Pot', label: 'Moka Pot' },
                { value: 'Cold Brew', label: 'Cold Brew' },
                { value: 'Drip Coffee', label: 'Drip Coffee' }
              ]}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Water Temperature (°C)"
                name="water_temp"
                type="number"
                register={register}
                placeholder="93"
                step="1"
                min="80"
                max="100"
                helperText="Recommended: 90-96°C for most brewing methods"
              />

              <FormField
                label="Brew Time (seconds)"
                name="brew_time"
                type="number"
                register={register}
                placeholder="240"
                step="1"
                min="0"
              />
            </div>

            <FormField
              label="Tasting Date"
              name="tasting_date"
              type="date"
              register={register}
              validation={{ required: 'Tasting date is required' }}
              required
            />

            <FormField
              label="Overall Rating *"
              name="overall_rating"
              type="range"
              register={register}
              validation={{ 
                required: 'Overall rating is required',
                min: { value: 1, message: 'Rating must be at least 1' },
                max: { value: 10, message: 'Rating must be at most 10' }
              }}
              required
              error={errors.overall_rating?.message}
              min="1"
              max="10"
              step="0.5"
            />

            <FormField
              label="Notes"
              name="notes"
              type="textarea"
              register={register}
              placeholder="Describe your tasting experience, flavors, aromas, etc."
            />
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={() => navigate('/tasting-notes')}
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
            <span>{isSubmitting ? 'Updating...' : 'Update Tasting Note'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTastingNote; 