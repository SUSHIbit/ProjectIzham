import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const EnemyManagement = () => {
    const [enemies, setEnemies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedEnemy, setSelectedEnemy] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        hp: 100,
        min_attack: 10,
        max_attack: 20,
        defense: 5,
        image: null,
    });

    // File input ref
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchEnemies();
    }, []);

    const fetchEnemies = async () => {
        try {
            const response = await axios.get("/api/admin/enemies");
            setEnemies(response.data);
            setLoading(false);
        } catch (error) {
            setError("Failed to load enemies");
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;

        if (type === "file") {
            setFormData((prev) => ({
                ...prev,
                image: e.target.files[0],
            }));
        } else if (type === "number") {
            setFormData((prev) => ({
                ...prev,
                [name]: parseInt(value, 10) || 0,
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleAddEnemy = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("name", formData.name);
        data.append("hp", formData.hp);
        data.append("min_attack", formData.min_attack);
        data.append("max_attack", formData.max_attack);
        data.append("defense", formData.defense);

        if (formData.image) {
            data.append("image", formData.image);
        }

        try {
            await axios.post("/api/admin/enemies", data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            resetForm();
            setShowAddForm(false);
            fetchEnemies();
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                const errorMessages = Object.values(
                    error.response.data.errors
                ).flat();
                setError(errorMessages.join(" "));
            } else {
                setError("Failed to add enemy");
            }
        }
    };

    const handleUpdateEnemy = async (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append("_method", "PUT");
        data.append("name", formData.name);
        data.append("hp", formData.hp);
        data.append("min_attack", formData.min_attack);
        data.append("max_attack", formData.max_attack);
        data.append("defense", formData.defense);

        if (formData.image) {
            data.append("image", formData.image);
        }

        try {
            await axios.post(`/api/admin/enemies/${selectedEnemy.id}`, data, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            resetForm();
            setIsEditing(false);
            setSelectedEnemy(null);
            fetchEnemies();
        } catch (error) {
            if (
                error.response &&
                error.response.data &&
                error.response.data.errors
            ) {
                const errorMessages = Object.values(
                    error.response.data.errors
                ).flat();
                setError(errorMessages.join(" "));
            } else {
                setError("Failed to update enemy");
            }
        }
    };

    const handleDeleteEnemy = async (id) => {
        if (
            !window.confirm(
                "Are you sure you want to delete this enemy? This will also delete all associated questions."
            )
        ) {
            return;
        }

        try {
            await axios.delete(`/api/admin/enemies/${id}`);
            fetchEnemies();
        } catch (error) {
            setError("Failed to delete enemy");
        }
    };

    const editEnemy = (enemy) => {
        setFormData({
            name: enemy.name,
            hp: enemy.hp,
            min_attack: enemy.min_attack,
            max_attack: enemy.max_attack,
            defense: enemy.defense,
            image: null,
        });

        setSelectedEnemy(enemy);
        setIsEditing(true);
        setShowAddForm(false);
    };

    const resetForm = () => {
        setFormData({
            name: "",
            hp: 100,
            min_attack: 10,
            max_attack: 20,
            defense: 5,
            image: null,
        });

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        setError("");
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
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center py-4 border-b border-gray-700 mb-6">
                    <h1 className="text-3xl font-bold">Enemy Management</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(!showAddForm);
                                setIsEditing(false);
                                setSelectedEnemy(null);
                            }}
                            className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            {showAddForm ? "Cancel" : "Add New Enemy"}
                        </button>
                        <Link
                            to="/admin"
                            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Back to Admin Dashboard
                        </Link>
                    </div>
                </header>

                {error && (
                    <div className="bg-red-500 text-white p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}

                {/* Add/Edit Form */}
                {(showAddForm || isEditing) && (
                    <div className="bg-gray-800 p-6 rounded-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing
                                ? `Edit Enemy: ${selectedEnemy.name}`
                                : "Add New Enemy"}
                        </h2>
                        <form
                            onSubmit={
                                isEditing ? handleUpdateEnemy : handleAddEnemy
                            }
                            className="space-y-4"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="name"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="hp"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        HP
                                    </label>
                                    <input
                                        id="hp"
                                        name="hp"
                                        type="number"
                                        min="1"
                                        value={formData.hp}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="min_attack"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Min Attack
                                    </label>
                                    <input
                                        id="min_attack"
                                        name="min_attack"
                                        type="number"
                                        min="1"
                                        value={formData.min_attack}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="max_attack"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Max Attack
                                    </label>
                                    <input
                                        id="max_attack"
                                        name="max_attack"
                                        type="number"
                                        min={formData.min_attack}
                                        value={formData.max_attack}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="defense"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Defense
                                    </label>
                                    <input
                                        id="defense"
                                        name="defense"
                                        type="number"
                                        min="0"
                                        value={formData.defense}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label
                                        htmlFor="image"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        {isEditing
                                            ? "Change Image (optional)"
                                            : "Image"}
                                    </label>
                                    <input
                                        id="image"
                                        name="image"
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        accept="image/*"
                                        required={!isEditing}
                                    />
                                    {isEditing && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Leave empty to keep the current
                                            image
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setIsEditing(false);
                                        setShowAddForm(false);
                                        setSelectedEnemy(null);
                                    }}
                                    className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    {isEditing ? "Update Enemy" : "Add Enemy"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Enemies List */}
                <div className="bg-gray-800 rounded-md overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                >
                                    Image
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                >
                                    Name
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                >
                                    HP
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                >
                                    Attack
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                >
                                    Defense
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {enemies.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="6"
                                        className="px-6 py-4 text-center text-sm text-gray-400"
                                    >
                                        No enemies yet. Add your first enemy!
                                    </td>
                                </tr>
                            ) : (
                                enemies.map((enemy) => (
                                    <tr key={enemy.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="w-12 h-12 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
                                                <img
                                                    src={`/storage/${enemy.image_path}`}
                                                    alt={enemy.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                                            {enemy.name}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {enemy.hp}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {enemy.min_attack} -{" "}
                                            {enemy.max_attack}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                            {enemy.defense}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button
                                                    onClick={() =>
                                                        editEnemy(enemy)
                                                    }
                                                    className="text-indigo-400 hover:text-indigo-300"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteEnemy(
                                                            enemy.id
                                                        )
                                                    }
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    Delete
                                                </button>
                                                <Link
                                                    to={`/admin/questions?enemy_id=${enemy.id}`}
                                                    className="text-green-400 hover:text-green-300"
                                                >
                                                    Questions
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EnemyManagement;
