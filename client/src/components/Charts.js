import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Charts = ({ coffeeBeans = [], inventory = [], tastingNotes = [] }) => {
  // Prepare data for origin distribution chart
  const originData = Object.entries(
    coffeeBeans.reduce((acc, bean) => {
      acc[bean.origin] = (acc[bean.origin] || 0) + 1;
      return acc;
    }, {})
  ).map(([origin, count]) => ({ origin, count }));

  // Prepare data for roast level distribution
  const roastLevelData = Object.entries(
    coffeeBeans.reduce((acc, bean) => {
      acc[bean.roast_level] = (acc[bean.roast_level] || 0) + 1;
      return acc;
    }, {})
  ).map(([roast, count]) => ({ roast, count }));

  // Prepare data for inventory by coffee bean
  const inventoryData = coffeeBeans.map(bean => ({
    name: bean.name,
    inventory: parseFloat(bean.total_inventory) || 0
  })).sort((a, b) => b.inventory - a.inventory).slice(0, 5);

  // Prepare data for average ratings by origin
  const ratingData = Object.entries(
    coffeeBeans.reduce((acc, bean) => {
      if (!acc[bean.origin]) {
        acc[bean.origin] = { total: 0, count: 0 };
      }
      acc[bean.origin].total += parseFloat(bean.avg_rating) || 0;
      acc[bean.origin].count += 1;
      return acc;
    }, {})
  ).map(([origin, data]) => ({
    origin,
    avgRating: data.count > 0 ? (data.total / data.count).toFixed(1) : 0
  }));

  // Prepare data for price distribution
  const priceData = coffeeBeans.map(bean => ({
    name: bean.name,
    price: (parseFloat(bean.price_per_lb) || 0) / 453.592 // Convert to price per gram
  })).sort((a, b) => b.price - a.price).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Origin Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Coffee Origins Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={originData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="origin" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Roast Level Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Roast Level Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={roastLevelData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ roast, percent }) => `${roast} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {roastLevelData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 Inventory Levels */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Inventory Levels (grams)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={inventoryData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="inventory" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Average Ratings by Origin */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Average Ratings by Origin</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={ratingData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="origin" />
            <YAxis domain={[0, 10]} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="avgRating" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Price Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Most Expensive Beans (per gram)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="price" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts; 