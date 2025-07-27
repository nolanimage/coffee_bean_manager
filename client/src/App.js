import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Coffee, Package, BookOpen, Home, BarChart3, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import CoffeeBeans from './pages/CoffeeBeans';
import TastingNotes from './pages/TastingNotes';
import Analytics from './pages/Analytics';
import CoffeeBeanDetail from './pages/CoffeeBeanDetail';
import AddCoffeeBean from './pages/AddCoffeeBean';
import EditCoffeeBean from './pages/EditCoffeeBean';
import AddTastingNote from './pages/AddTastingNote';
import EditTastingNote from './pages/EditTastingNote';
import BrewingSchedule from './pages/BrewingSchedule';
import CostAnalysis from './pages/CostAnalysis';
import FreshnessAlerts from './pages/FreshnessAlerts';
import Profile from './pages/Profile';

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Coffee Beans & Inventory', href: '/coffee-beans', icon: Coffee },
  { name: 'Tasting Notes', href: '/tasting-notes', icon: BookOpen },
  { name: 'Brewing Schedule', href: '/brewing-schedule', icon: Calendar },
  { name: 'Cost Analysis', href: '/cost-analysis', icon: DollarSign },
  { name: 'Freshness Alerts', href: '/freshness-alerts', icon: AlertTriangle },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-coffee-50">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <ProtectedRoute>
              <>
                <Navbar navigation={navigation} />
                <main className="py-6 sm:py-8">
                  <div className="max-w-7xl mx-auto mobile-padding">
                    <div className="animate-fade-in">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/coffee-beans" element={<CoffeeBeans />} />
                        <Route path="/coffee-beans/add" element={<AddCoffeeBean />} />
                        <Route path="/coffee-beans/:id" element={<CoffeeBeanDetail />} />
                        <Route path="/coffee-beans/:id/edit" element={<EditCoffeeBean />} />
                        <Route path="/tasting-notes" element={<TastingNotes />} />
                        <Route path="/tasting-notes/add" element={<AddTastingNote />} />
                        <Route path="/tasting-notes/:id/edit" element={<EditTastingNote />} />
                        <Route path="/brewing-schedule" element={<BrewingSchedule />} />
                        <Route path="/cost-analysis" element={<CostAnalysis />} />
                        <Route path="/freshness-alerts" element={<FreshnessAlerts />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/profile" element={<Profile />} />
                      </Routes>
                    </div>
                  </div>
                </main>
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </div>
    </AuthProvider>
  );
}

export default App; 