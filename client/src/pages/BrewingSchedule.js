import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Coffee, Plus, Edit, Trash2, CheckCircle, XCircle, SkipForward, Grid, List } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { brewingAPI, coffeeBeansAPI } from '../services/api';
import MonthlyCalendar from '../components/MonthlyCalendar';

const BrewingSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [coffeeBeans, setCoffeeBeans] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [schedulesRes, allSchedulesRes, beansRes, statsRes] = await Promise.all([
        brewingAPI.getAll({ date: selectedDate }),
        brewingAPI.getAll(), // Get all schedules for calendar
        coffeeBeansAPI.getAll(),
        brewingAPI.getStats()
      ]);
      
      setSchedules(schedulesRes.data);
      setAllSchedules(allSchedulesRes.data);
      setCoffeeBeans(beansRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load brewing schedule data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Convert Celsius to Fahrenheit for storage
      if (data.water_temp) {
        data.water_temp = Math.round((data.water_temp * 9/5) + 32);
      }
      
      if (editingSchedule) {
        await brewingAPI.update(editingSchedule.id, data);
        toast.success('Brewing schedule updated successfully!');
      } else {
        await brewingAPI.create(data);
        toast.success('Brewing schedule added successfully!');
      }
      
      setShowAddModal(false);
      setEditingSchedule(null);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error saving brewing schedule:', error);
      toast.error('Failed to save brewing schedule');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    reset({
      coffee_bean_id: schedule.coffee_bean_id,
      scheduled_date: schedule.scheduled_date,
      scheduled_time: schedule.scheduled_time,
      brew_method: schedule.brew_method,
      grind_size: schedule.grind_size,
      water_temp: schedule.water_temp,
      brew_time: schedule.brew_time,
      notes: schedule.notes,
      status: schedule.status
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this brewing schedule?')) {
      try {
        await brewingAPI.delete(id);
        toast.success('Brewing schedule deleted successfully!');
        fetchData();
      } catch (error) {
        console.error('Error deleting brewing schedule:', error);
        toast.error('Failed to delete brewing schedule');
      }
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const schedule = schedules.find(s => s.id === id);
      if (!schedule) return;

      await brewingAPI.update(id, { ...schedule, status: newStatus });
      toast.success(`Schedule marked as ${newStatus}!`);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'skipped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planned': return <Clock className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <XCircle className="w-4 h-4" />;
      case 'skipped': return <SkipForward className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatTime = (time) => {
    if (!time) return '';
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const convertToCelsius = (fahrenheit) => {
    if (!fahrenheit) return null;
    return Math.round((fahrenheit - 32) * 5/9);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-coffee-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brewing Schedule</h1>
          <p className="text-gray-600 mt-1">Plan and track your coffee brewing sessions</p>
        </div>
        <div className="flex items-center space-x-4">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-white text-coffee-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Calendar View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-coffee-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => {
              setEditingSchedule(null);
              reset();
              setShowAddModal(true);
            }}
            className="btn btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_schedules || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Planned</p>
              <p className="text-2xl font-bold text-blue-600">{stats.planned_count || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed_count || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <XCircle className="w-8 h-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Cancelled</p>
              <p className="text-2xl font-bold text-red-600">{stats.cancelled_count || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex items-center">
            <Coffee className="w-8 h-8 text-orange-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Today</p>
              <p className="text-2xl font-bold text-orange-600">{stats.today_count || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          <MonthlyCalendar
            schedules={allSchedules}
            onDateSelect={setSelectedDate}
            selectedDate={selectedDate}
          />
          
          {/* Selected Date Schedule */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>
            
            {schedules.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No brewing sessions scheduled for this date.</p>
                <button
                  onClick={() => {
                    setEditingSchedule(null);
                    reset({ scheduled_date: selectedDate });
                    setShowAddModal(true);
                  }}
                  className="mt-2 text-coffee-600 hover:text-coffee-700 font-medium"
                >
                  Add your first session
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {schedule.coffee_bean_name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                            {getStatusIcon(schedule.status)}
                            <span className="ml-1 capitalize">{schedule.status}</span>
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">Origin:</span> {schedule.origin}</p>
                          <p><span className="font-medium">Roast Level:</span> {schedule.roast_level}</p>
                          {schedule.scheduled_time && (
                            <p><span className="font-medium">Time:</span> {formatTime(schedule.scheduled_time)}</p>
                          )}
                          {schedule.brew_method && (
                            <p><span className="font-medium">Method:</span> {schedule.brew_method}</p>
                          )}
                          {schedule.notes && (
                            <p><span className="font-medium">Notes:</span> {schedule.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {schedule.status === 'planned' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(schedule.id, 'completed')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(schedule.id, 'skipped')}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Mark as skipped"
                            >
                              <SkipForward className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Mark as cancelled"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit schedule"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete schedule"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="space-y-6">
          {/* Date Selector */}
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
              />
            </div>
          </div>

          {/* Schedule List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Schedule for {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h3>
            </div>
            
            {schedules.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No brewing sessions scheduled for this date.</p>
                <button
                  onClick={() => {
                    setEditingSchedule(null);
                    reset({ scheduled_date: selectedDate });
                    setShowAddModal(true);
                  }}
                  className="mt-2 text-coffee-600 hover:text-coffee-700 font-medium"
                >
                  Add your first session
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {schedules.map((schedule) => (
                  <div key={schedule.id} className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h4 className="text-lg font-medium text-gray-900">
                            {schedule.coffee_bean_name}
                          </h4>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(schedule.status)}`}>
                            {getStatusIcon(schedule.status)}
                            <span className="ml-1 capitalize">{schedule.status}</span>
                          </span>
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">Origin:</span> {schedule.origin}</p>
                          <p><span className="font-medium">Roast Level:</span> {schedule.roast_level}</p>
                          {schedule.scheduled_time && (
                            <p><span className="font-medium">Time:</span> {formatTime(schedule.scheduled_time)}</p>
                          )}
                          {schedule.brew_method && (
                            <p><span className="font-medium">Method:</span> {schedule.brew_method}</p>
                          )}
                          {schedule.notes && (
                            <p><span className="font-medium">Notes:</span> {schedule.notes}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {schedule.status === 'planned' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(schedule.id, 'completed')}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                              title="Mark as completed"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(schedule.id, 'skipped')}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Mark as skipped"
                            >
                              <SkipForward className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleStatusChange(schedule.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Mark as cancelled"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleEdit(schedule)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Edit schedule"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          title="Delete schedule"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingSchedule ? 'Edit Brewing Schedule' : 'Add Brewing Schedule'}
            </h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Coffee Bean *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {coffeeBeans.map((bean) => (
                    <label key={bean.id} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="coffee_bean_id"
                        value={bean.id}
                        className="sr-only peer"
                        {...register('coffee_bean_id', { required: 'Coffee bean is required' })}
                      />
                      <div className="p-3 border-2 border-gray-200 rounded-lg transition-all duration-200 peer-checked:border-coffee-500 peer-checked:bg-coffee-50 hover:border-coffee-300 hover:bg-coffee-25">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 text-sm">{bean.name}</h3>
                            <p className="text-gray-600 text-xs mt-1">{bean.origin}</p>
                          </div>
                          <div className="ml-2">
                            <div className="w-3 h-3 border-2 border-gray-300 rounded-full peer-checked:border-coffee-500 peer-checked:bg-coffee-500 flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-white rounded-full peer-checked:block hidden"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.coffee_bean_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.coffee_bean_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  {...register('scheduled_date', { required: 'Date is required' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
                {errors.scheduled_date && (
                  <p className="text-red-500 text-sm mt-1">{errors.scheduled_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="time"
                  {...register('scheduled_time')}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brew Method
                </label>
                <input
                  type="text"
                  {...register('brew_method')}
                  placeholder="e.g., Pour Over, French Press"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grind Size
                  </label>
                  <input
                    type="text"
                    {...register('grind_size')}
                    placeholder="e.g., Medium-Fine"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                  />
                </div>
                              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Water Temp (°C)
                </label>
                <input
                  type="number"
                  {...register('water_temp')}
                  placeholder="93"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Brew Time (seconds)
                </label>
                <input
                  type="number"
                  {...register('brew_time')}
                  placeholder="240"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows="3"
                  placeholder="Any additional notes..."
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-coffee-500"
                />
              </div>

              {editingSchedule && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: 'planned', label: 'Planned' },
                      { value: 'completed', label: 'Completed' },
                      { value: 'cancelled', label: 'Cancelled' },
                      { value: 'skipped', label: 'Skipped' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          const event = { target: { name: 'status', value: option.value } };
                          register('status').onChange(event);
                        }}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                          register('status').value === option.value
                            ? 'border-coffee-500 bg-coffee-500 text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-coffee-300 hover:bg-coffee-25'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingSchedule(null);
                    reset();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-coffee-600 text-white rounded-md hover:bg-coffee-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : (editingSchedule ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrewingSchedule; 