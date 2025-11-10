import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import 'dayjs/locale/zh-cn';

import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import TravelPlanner from './components/TravelPlanner/TravelPlanner';
import ExpenseTracker from './components/ExpenseTracker/ExpenseTracker';
import Settings from './components/Settings/Settings';
import TravelPlanDetail from './components/TravelPlanner/TravelPlanDetail';

const { Content } = Layout;

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div>加载中...</div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {user && <Navbar />}
      <Content style={{ padding: user ? '24px' : '0' }}>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/planner" element={user ? <TravelPlanner /> : <Navigate to="/login" />} />
          <Route path="/plan/:id" element={user ? <TravelPlanDetail /> : <Navigate to="/login" />} />
          <Route path="/expenses" element={user ? <ExpenseTracker /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
          <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        </Routes>
      </Content>
    </Layout>
  );
}

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <AppContent />
          </Router>
        </SettingsProvider>
      </AuthProvider>
    </ConfigProvider>
  );
}

export default App;