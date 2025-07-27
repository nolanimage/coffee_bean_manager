import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Coffee, CheckCircle, XCircle, SkipForward, Clock } from 'lucide-react';

const MonthlyCalendar = ({ schedules, onDateSelect, selectedDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentMonth, schedules]);

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // Get first day of month and last day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Get the last date of previous month to fill the grid
    const prevMonthLastDay = new Date(year, month, 0);
    
    const days = [];
    
    // Add days from previous month to fill the first week
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
      days.push({
        date: day,
        isCurrentMonth: false,
        isToday: isToday(day),
        schedules: getSchedulesForDate(day)
      });
    }
    
    // Add days from current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date: date,
        isCurrentMonth: true,
        isToday: isToday(date),
        schedules: getSchedulesForDate(date)
      });
    }
    
    // Add days from next month to fill the last week
    const remainingDays = 42 - days.length; // 6 rows * 7 days = 42
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date: date,
        isCurrentMonth: false,
        isToday: isToday(date),
        schedules: getSchedulesForDate(date)
      });
    }
    
    setCalendarDays(days);
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getSchedulesForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return schedules.filter(schedule => schedule.scheduled_date === dateString);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'planned': return <Clock className="w-3 h-3" />;
      case 'completed': return <CheckCircle className="w-3 h-3" />;
      case 'cancelled': return <XCircle className="w-3 h-3" />;
      case 'skipped': return <SkipForward className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'planned': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      case 'cancelled': return 'text-red-600';
      case 'skipped': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentMonth(new Date());
  };

  const handleDateClick = (day) => {
    if (day.isCurrentMonth) {
      onDateSelect(day.date.toISOString().split('T')[0]);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {formatDate(currentMonth)}
            </h2>
            <button
              onClick={goToNextMonth}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-coffee-600 hover:text-coffee-700 hover:bg-coffee-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              onClick={() => handleDateClick(day)}
              className={`
                min-h-[80px] p-2 border border-gray-200 cursor-pointer transition-colors
                ${day.isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                ${day.isToday ? 'ring-2 ring-coffee-500' : ''}
                ${selectedDate === day.date.toISOString().split('T')[0] ? 'bg-coffee-50 border-coffee-300' : ''}
              `}
            >
              <div className="text-sm font-medium mb-1">
                {day.date.getDate()}
              </div>
              
              {/* Schedule Indicators */}
              <div className="space-y-1">
                {day.schedules.slice(0, 3).map((schedule, idx) => (
                  <div
                    key={idx}
                    className={`
                      flex items-center space-x-1 p-1 rounded text-xs
                      ${getStatusColor(schedule.status)}
                      ${schedule.status === 'completed' ? 'bg-green-50' : 
                        schedule.status === 'cancelled' ? 'bg-red-50' :
                        schedule.status === 'skipped' ? 'bg-gray-50' : 'bg-blue-50'}
                    `}
                    title={`${schedule.coffee_bean_name} - ${schedule.status}`}
                  >
                    {getStatusIcon(schedule.status)}
                    <span className="truncate">{schedule.coffee_bean_name}</span>
                  </div>
                ))}
                {day.schedules.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{day.schedules.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Planned</span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-gray-600">Cancelled</span>
          </div>
          <div className="flex items-center space-x-2">
            <SkipForward className="w-4 h-4 text-gray-600" />
            <span className="text-gray-600">Skipped</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar; 