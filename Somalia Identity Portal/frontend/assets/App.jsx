
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetail from './pages/ServiceDetail';
import ApplicationForm from './pages/ApplicationForm';
import ServicesCatalog from './pages/ServicesCatalog';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';
import RequestsHistory from './pages/RequestsHistory';
import CriminalCertificate from './pages/CriminalCertificate';
import BirthCertificatePDF from './pages/BirthCertificatePDF';
import ChangePassword from './pages/ChangePassword';
import SetPassword from './pages/SetPassword';

import { LanguageProvider } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
        return <Navigate to="/" replace />;
    }
    try {
        const user = JSON.parse(userJson);
        if (allowedRoles && !allowedRoles.includes(user.account_type)) {
            if (['citizen', 'resident'].includes(user.account_type)) {
                return <Navigate to="/home" replace />;
            }
            return <Navigate to="/" replace />;
        }
    } catch (e) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const NotFound = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 dark:text-white">
        <h1 className="text-9xl font-bold text-primary-100 dark:text-primary-800 mb-4">404</h1>
        <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Page Not Found</h2>
        <a href="#/home" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700">Go Home</a>
    </div>
);

const App = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <Router>
                    <div className="flex flex-col min-h-screen font-sans transition-colors duration-500 dark:bg-primary-950">
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/forgot-password" element={<ForgotPassword />} />
                            <Route path="/set-password" element={<SetPassword />} />

                            {/* Admin Interface */}
                            <Route path="/admin/*" element={
                                <ProtectedRoute allowedRoles={['admin', 'Printing_Officer', 'Immigration_Officer', 'Immigration_Department_Manager']}>
                                    <AdminDashboard />
                                </ProtectedRoute>
                            } />

                            {/* Public Protected Routes */}
                            <Route path="*" element={
                                <ProtectedRoute allowedRoles={['admin', 'Printing_Officer', 'Immigration_Officer', 'Immigration_Department_Manager', 'citizen', 'resident']}>
                                    <>
                                        <Header />
                                        <main className="flex-grow">
                                            <Routes>
                                                <Route path="/home" element={<Home />} />
                                                <Route path="/profile" element={<Profile />} />
                                                <Route path="/notifications" element={<Notifications />} />
                                                <Route path="/requests" element={<RequestsHistory />} />
                                                <Route path="/criminal-certificate" element={<CriminalCertificate />} />
                                                <Route path="/birth-certificate-pdf" element={<BirthCertificatePDF />} />
                                                <Route path="/change-password" element={<ChangePassword />} />

                                                <Route path="/services" element={<ServicesCatalog />} />
                                                <Route path="/service/:id" element={<ServiceDetail />} />
                                                <Route path="/apply/:id" element={<ApplicationForm />} />
                                                <Route path="/404" element={<NotFound />} />
                                                <Route path="*" element={<Navigate to="/404" replace />} />
                                            </Routes>
                                        </main>
                                        <Footer />
                                    </>
                                </ProtectedRoute>
                            } />
                        </Routes>
                    </div>
                </Router>
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
