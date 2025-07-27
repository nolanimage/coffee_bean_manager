import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Coffee, Calendar, Plus, BarChart3, PieChart } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { costAPI, coffeeBeansAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const CostAnalysis = () => {
  const [monthlyData, setMonthlyData] = useState([]);
  const [costAnalysis, setCostAnalysis] = useState([]);
  const [roiData, setRoiData] = useState([]);
  const [coffeeBeans, setCoffeeBeans] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm();

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedMonth]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [monthlyRes, analysisRes, roiRes, beansRes] = await Promise.all([
        costAPI.getMonthly(selectedYear, selectedMonth),
        costAPI.getAnalysis(),
        costAPI.getROI(),
        coffeeBeansAPI.getAll()
      ]);

      setMonthlyData(monthlyRes.data);
      setCostAnalysis(analysisRes.data);
      setRoiData(roiRes.data);
      setCoffeeBeans(beansRes.data);
    } catch (error) {
      console.error('Error fetching cost data:', error);
      toast.error('Failed to load cost analysis data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      await costAPI.create(data);
      toast.success('Cost entry added successfully!');
      setShowAddModal(false);
      reset();
      fetchData();
    } catch (error) {
      console.error('Error adding cost entry:', error);
      toast.error('Failed to add cost entry');
    }
  };

  const totalMonthlySpending = monthlyData.reduce((sum, item) => sum + parseFloat(item.total_spent || 0), 0);
  const totalCupsBrewed = costAnalysis.reduce((sum, item) => sum + (parseInt(item.cups_brewed) || 0), 0);
  const avgCostPerCup = totalCupsBrewed > 0 ? costAnalysis.reduce((sum, item) => sum + parseFloat(item.total_cost || 0), 0) / totalCupsBrewed : 0;

  const chartData = monthlyData.map(item => ({
    name: item.coffee_bean_name,
    spent: parseFloat(item.total_spent || 0),
    grams: parseInt(item.total_grams || 0)
  }));

  const roiChartData = roiData.slice(0, 5).map(item => ({
    name: item.name,
    premium: parseFloat(item.premium_over_standard_cup || 0)
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Analysis</h1>
          <p className="text-gray-600 mt-1">Track your coffee spending and analyze cost per cup</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Cost Entry</span>
        </button>
      </div>

      {/* Month Selector */}
      <div className="card mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-5 h-5 text-gray-500" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="input w-32"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            className="input w-32"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
              <option key={month} value={month}>
                {new Date(2000, month - 1).toLocaleDateString('en-US', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-coffee-600 mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Monthly Spending</p>
                  <p className="text-2xl font-bold text-gray-900">${totalMonthlySpending.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <Coffee className="w-6 h-6 text-coffee-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Cups Brewed</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCupsBrewed}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Cost per Cup</p>
                  <p className="text-2xl font-bold text-gray-900">${avgCostPerCup.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="flex items-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Beans Tracked</p>
                  <p className="text-2xl font-bold text-gray-900">{costAnalysis.length}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Spending Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending by Bean</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Spent']} />
                  <Bar dataKey="spent" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ROI Analysis Chart */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Over Standard Cup</h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={roiChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, premium }) => `${name}: ${premium.toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="premium"
                  >
                    {roiChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value.toFixed(0)}%`, 'Premium']} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Cost Analysis Table */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Analysis by Bean</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bean</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Origin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cups Brewed</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost per Cup</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monthly Cost (1 cup/day)</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costAnalysis.map((bean) => (
                    <tr key={bean.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bean.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bean.origin}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(bean.total_cost || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{bean.cups_brewed || 0}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(bean.cost_per_cup || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${parseFloat(bean.monthly_cost_at_1_cup_per_day || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Cost Entry Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Cost Entry</h3>
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
                  <p className="text-red-600 text-sm mt-1">{errors.coffee_bean_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Date</label>
                <input
                  type="date"
                  {...register('purchase_date', { required: 'Purchase date is required' })}
                  className="input"
                />
                {errors.purchase_date && (
                  <p className="text-red-600 text-sm mt-1">{errors.purchase_date.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('amount', { required: 'Amount is required', min: { value: 0, message: 'Amount must be positive' } })}
                  className="input"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-600 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quantity (grams)</label>
                <input
                  type="number"
                  min="1"
                  {...register('quantity_grams', { required: 'Quantity is required', min: { value: 1, message: 'Quantity must be positive' } })}
                  className="input"
                  placeholder="0"
                />
                {errors.quantity_grams && (
                  <p className="text-red-600 text-sm mt-1">{errors.quantity_grams.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea {...register('notes')} className="input" rows="3" placeholder="Optional notes..."></textarea>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  {isSubmitting ? 'Adding...' : 'Add Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CostAnalysis; 