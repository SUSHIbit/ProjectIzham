import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const AdminDashboard = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center py-4 border-b border-gray-700 mb-6">
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Logout
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link
                        to="/admin/enemies"
                        className="bg-gray-800 p-8 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                    >
                        <h2 className="text-2xl font-semibold mb-2">
                            Enemy Management
                        </h2>
                        <p className="text-gray-400">
                            Create, edit, and delete enemies for the game.
                        </p>
                    </Link>

                    <Link
                        to="/admin/questions"
                        className="bg-gray-800 p-8 rounded-lg shadow-md hover:bg-gray-700 transition-colors"
                    >
                        <h2 className="text-2xl font-semibold mb-2">
                            Question Management
                        </h2>
                        <p className="text-gray-400">
                            Manage questions associated with each enemy.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
