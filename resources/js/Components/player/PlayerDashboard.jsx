import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";

const PlayerDashboard = () => {
    const { user, logout } = useAuth();
    const [player, setPlayer] = useState(null);
    const [characterName, setCharacterName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [showStatUpgrade, setShowStatUpgrade] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPlayerProfile();
    }, []);

    const fetchPlayerProfile = async () => {
        try {
            const response = await axios.get("/api/player/profile");
            setPlayer(response.data);
            setCharacterName(response.data.character_name);
            setLoading(false);

            // Check if player can upgrade stats (every 5 levels)
            if (response.data.level % 5 === 0 && response.data.level > 0) {
                setShowStatUpgrade(true);
            }
        } catch (error) {
            setError("Failed to load player profile");
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.put("/api/player/profile", {
                character_name: characterName,
            });
            setPlayer(response.data);
            setIsEditing(false);
            setError("");
        } catch (error) {
            setError("Failed to update profile");
        }
    };

    const handleStatUpgrade = async (stat) => {
        try {
            const response = await axios.post("/api/player/upgrade-stats", {
                stat,
            });
            setPlayer(response.data);
            setShowStatUpgrade(false);
            setError("");
        } catch (error) {
            setError("Failed to upgrade stats");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-900">
                <div className="w-16 h-16 border-t-4 border-red-600 border-solid rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-4">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center py-4 border-b border-gray-700 mb-6">
                    <h1 className="text-3xl font-bold">Player Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Logout
                    </button>
                </header>

                {error && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {/* Stat Upgrade Modal */}
                {showStatUpgrade && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full m-4">
                            <h2 className="text-xl font-bold mb-4">
                                Level {player.level} Milestone!
                            </h2>
                            <p className="mb-6 text-gray-300">
                                Choose one stat to upgrade:
                            </p>
                            <div className="space-y-3">
                                <button
                                    onClick={() => handleStatUpgrade("attack")}
                                    className="w-full p-3 bg-red-600 hover:bg-red-700 rounded-md text-left"
                                >
                                    +10 Attack Range
                                </button>
                                <button
                                    onClick={() => handleStatUpgrade("defense")}
                                    className="w-full p-3 bg-blue-600 hover:bg-blue-700 rounded-md text-left"
                                >
                                    +10 Defense
                                </button>
                                <button
                                    onClick={() => handleStatUpgrade("heal")}
                                    className="w-full p-3 bg-green-600 hover:bg-green-700 rounded-md text-left"
                                >
                                    +10 Heal Value
                                </button>
                                <button
                                    onClick={() => handleStatUpgrade("max_hp")}
                                    className="w-full p-3 bg-purple-600 hover:bg-purple-700 rounded-md text-left"
                                >
                                    +20 Max HP
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                Character Profile
                            </h2>
                            <button
                                onClick={() => setIsEditing(!isEditing)}
                                className="px-3 py-1 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                {isEditing ? "Cancel" : "Edit"}
                            </button>
                        </div>

                        {isEditing ? (
                            <form
                                onSubmit={handleUpdateProfile}
                                className="space-y-4"
                            >
                                <div>
                                    <label
                                        htmlFor="character_name"
                                        className="block text-sm font-medium text-gray-300"
                                    >
                                        Character Name
                                    </label>
                                    <input
                                        id="character_name"
                                        type="text"
                                        value={characterName}
                                        onChange={(e) =>
                                            setCharacterName(e.target.value)
                                        }
                                        className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full py-2 px-4 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Save
                                </button>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <div>
                                    <span className="text-gray-400">
                                        Player Name:
                                    </span>
                                    <span className="ml-2">{user?.name}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400">
                                        Character Name:
                                    </span>
                                    <span className="ml-2">
                                        {player?.character_name}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-gray-400">
                                        Level:
                                    </span>
                                    <span className="ml-2">
                                        {player?.level}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-gray-800 p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">
                            Character Stats
                        </h2>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-400">HP:</span>
                                <span className="ml-2">
                                    {player?.actual_hp}/{player?.hp}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">Defense:</span>
                                <span className="ml-2">{player?.defense}</span>
                            </div>
                            <div>
                                <span className="text-gray-400">
                                    Attack Range:
                                </span>
                                <span className="ml-2">
                                    {player?.min_attack} - {player?.max_attack}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-400">
                                    Heal Value:
                                </span>
                                <span className="ml-2">
                                    {player?.heal_value}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg shadow-md mt-6">
                    <h2 className="text-xl font-semibold mb-4">Skills</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-gray-700 p-4 rounded-md">
                            <h3 className="font-medium">Basic Attack</h3>
                            <p className="text-sm text-gray-400">No cooldown</p>
                            <p className="text-sm text-gray-400 mt-1">
                                Deals damage based on your attack range
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-md">
                            <h3 className="font-medium">Power Strike</h3>
                            <p className="text-sm text-gray-400">
                                2-turn cooldown
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Deals 150% damage
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-md">
                            <h3 className="font-medium">Shield Bash</h3>
                            <p className="text-sm text-gray-400">
                                2-turn cooldown
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Deals damage and reduces enemy defense
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-md">
                            <h3 className="font-medium">Heal</h3>
                            <p className="text-sm text-gray-400">
                                3-turn cooldown
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Restores HP by your heal value
                            </p>
                        </div>
                        <div className="bg-gray-700 p-4 rounded-md">
                            <h3 className="font-medium">Fireball</h3>
                            <p className="text-sm text-gray-400">
                                4-turn cooldown
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                Deals 200% damage
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                        to="/game"
                        className="block text-center py-3 px-4 bg-red-600 rounded-md text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                        Play Game
                    </Link>
                    <Link
                        to="/leaderboard"
                        className="block text-center py-3 px-4 bg-gray-700 rounded-md text-white font-semibold hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Leaderboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PlayerDashboard;
