import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Welcome = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 pt-20 relative">
            {/* Background decorations */}
            <div className="absolute -top-20 -left-20 w-72 h-72 bg-red-500 opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-60 h-60 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>

            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-md z-10">
                <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        Turn-Based RPG
                    </h1>
                    <p className="text-md md:text-lg text-gray-400 mb-8">
                        Embark on an epic adventure!
                    </p>
                </div>

                <div className="space-y-4">
                    {!user ? (
                        <>
                            <Link
                                to="/login"
                                className="w-full flex justify-center py-3 px-4 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="w-full flex justify-center py-3 px-4 rounded-md bg-gray-700 text-white font-semibold hover:bg-gray-600 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Register
                            </Link>
                        </>
                    ) : (
                        <Link
                            to={user.role === "admin" ? "/admin" : "/dashboard"}
                            className="w-full flex justify-center py-3 px-4 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Continue Adventure
                        </Link>
                    )}
                </div>
            </div>

            {/* Feature Highlights Section */}
            <div className="mt-16 max-w-6xl mx-auto w-[90%] px-4 z-10">
                <h2 className="text-xl font-semibold text-white mb-8 text-center">
                    What Makes This RPG Special?
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-gray-800 bg-opacity-70 p-5 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                                🎯
                            </div>
                            <h3 className="font-semibold text-white text-lg">
                                Strategic Battles
                            </h3>
                        </div>
                        <p className="text-gray-300 text-center">
                            Plan your attacks and defend wisely with a variety
                            of skills and abilities.
                        </p>
                    </div>

                    <div className="bg-gray-800 bg-opacity-70 p-5 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                                🧠
                            </div>
                            <h3 className="font-semibold text-white text-lg">
                                Answer to Attack
                            </h3>
                        </div>
                        <p className="text-gray-300 text-center">
                            Test your knowledge with challenging questions to
                            gain attack opportunities.
                        </p>
                    </div>

                    <div className="bg-gray-800 bg-opacity-70 p-5 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                                🔥
                            </div>
                            <h3 className="font-semibold text-white text-lg">
                                Cooldowns & Skills
                            </h3>
                        </div>
                        <p className="text-gray-300 text-center">
                            Master various abilities with unique cooldown
                            periods for strategic gameplay.
                        </p>
                    </div>

                    <div className="bg-gray-800 bg-opacity-70 p-5 rounded-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                        <div className="flex flex-col items-center mb-4">
                            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center text-white text-2xl mb-3">
                                🏆
                            </div>
                            <h3 className="font-semibold text-white text-lg">
                                Climb the Leaderboard
                            </h3>
                        </div>
                        <p className="text-gray-300 text-center">
                            Defeat enemies to level up and compete for the top
                            spot on the global leaderboard.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="text-center text-gray-500 text-sm mt-16 mb-6 z-10">
                Built with ❤️ - A Quiz Combat RPG Project
            </footer>
        </div>
    );
};

export default Welcome;
