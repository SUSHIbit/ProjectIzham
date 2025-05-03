import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import Welcome from "./Welcome";
import Login from "./auth/Login";
import Register from "./auth/Register";
import PlayerDashboard from "./player/PlayerDashboard";
import GamePlay from "./player/GamePlay";
import Leaderboard from "./player/Leaderboard";
import AdminDashboard from "./admin/AdminDashboard";
import EnemyManagement from "./admin/EnemyManagement";
import QuestionManagement from "./admin/QuestionManagement";

// Protected route component
const ProtectedRoute = ({ children, allowedRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-t-4 border-red-600 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user || (allowedRole && user.role !== allowedRole)) {
        return <Navigate to="/login" />;
    }

    return children;
};

// Admin redirect
const AdminRedirect = () => {
    const { user } = useAuth();

    if (user && user.role === "admin") {
        return <Navigate to="/admin" />;
    }

    return <Navigate to="/dashboard" />;
};

const App = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Welcome />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/redirect" element={<AdminRedirect />} />

                    {/* Player Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute allowedRole="player">
                                <PlayerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/game"
                        element={
                            <ProtectedRoute allowedRole="player">
                                <GamePlay />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/leaderboard"
                        element={
                            <ProtectedRoute allowedRole="player">
                                <Leaderboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/enemies"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <EnemyManagement />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin/questions"
                        element={
                            <ProtectedRoute allowedRole="admin">
                                <QuestionManagement />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
