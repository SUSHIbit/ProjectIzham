import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const QuestionManagement = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialEnemyId = queryParams.get("enemy_id");

    const [enemies, setEnemies] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [selectedEnemyId, setSelectedEnemyId] = useState(
        initialEnemyId || ""
    );
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        enemy_id: "",
        question_text: "",
        option_a: "",
        option_b: "",
        option_c: "",
        option_d: "",
        correct_answer: "A",
    });

    useEffect(() => {
        fetchEnemies();
    }, []);

    useEffect(() => {
        if (selectedEnemyId) {
            fetchQuestionsByEnemy(selectedEnemyId);
        } else {
            setQuestions([]);
        }
    }, [selectedEnemyId]);

    const fetchEnemies = async () => {
        try {
            const response = await axios.get("/api/admin/enemies");
            setEnemies(response.data);

            // Set first enemy as selected if none specified
            if (!initialEnemyId && response.data.length > 0) {
                setSelectedEnemyId(response.data[0].id.toString());
            }

            setLoading(false);
        } catch (error) {
            setError("Failed to load enemies");
            setLoading(false);
        }
    };

    const fetchQuestionsByEnemy = async (enemyId) => {
        try {
            const response = await axios.get(
                `/api/admin/enemy/${enemyId}/questions`
            );
            setQuestions(response.data);
        } catch (error) {
            setError("Failed to load questions");
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleEnemyChange = (e) => {
        setSelectedEnemyId(e.target.value);
        setFormData((prev) => ({
            ...prev,
            enemy_id: e.target.value,
        }));
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();

        try {
            await axios.post("/api/admin/questions", {
                ...formData,
                enemy_id: selectedEnemyId,
            });

            resetForm();
            setShowAddForm(false);
            fetchQuestionsByEnemy(selectedEnemyId);
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
                setError("Failed to add question");
            }
        }
    };

    const handleUpdateQuestion = async (e) => {
        e.preventDefault();

        try {
            await axios.put(`/api/admin/questions/${selectedQuestion.id}`, {
                ...formData,
                enemy_id: selectedEnemyId,
            });

            resetForm();
            setIsEditing(false);
            setSelectedQuestion(null);
            fetchQuestionsByEnemy(selectedEnemyId);
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
                setError("Failed to update question");
            }
        }
    };

    const handleDeleteQuestion = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) {
            return;
        }

        try {
            await axios.delete(`/api/admin/questions/${id}`);
            fetchQuestionsByEnemy(selectedEnemyId);
        } catch (error) {
            setError("Failed to delete question");
        }
    };

    const editQuestion = (question) => {
        setFormData({
            enemy_id: question.enemy_id.toString(),
            question_text: question.question_text,
            option_a: question.option_a,
            option_b: question.option_b,
            option_c: question.option_c,
            option_d: question.option_d,
            correct_answer: question.correct_answer,
        });

        setSelectedQuestion(question);
        setIsEditing(true);
        setShowAddForm(false);
    };

    const resetForm = () => {
        setFormData({
            enemy_id: selectedEnemyId,
            question_text: "",
            option_a: "",
            option_b: "",
            option_c: "",
            option_d: "",
            correct_answer: "A",
        });

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
                    <h1 className="text-3xl font-bold">Question Management</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(!showAddForm);
                                setIsEditing(false);
                                setSelectedQuestion(null);
                            }}
                            className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                            {showAddForm ? "Cancel" : "Add New Question"}
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

                {/* Enemy Selector */}
                <div className="bg-gray-800 p-4 rounded-md mb-6">
                    <label
                        htmlFor="enemy_selector"
                        className="block text-sm font-medium text-gray-300 mb-1"
                    >
                        Select Enemy
                    </label>
                    <select
                        id="enemy_selector"
                        value={selectedEnemyId}
                        onChange={handleEnemyChange}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    >
                        <option value="">-- Select Enemy --</option>
                        {enemies.map((enemy) => (
                            <option key={enemy.id} value={enemy.id}>
                                {enemy.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Add/Edit Form */}
                {(showAddForm || isEditing) && selectedEnemyId && (
                    <div className="bg-gray-800 p-6 rounded-md mb-6">
                        <h2 className="text-xl font-semibold mb-4">
                            {isEditing ? "Edit Question" : "Add New Question"}
                        </h2>
                        <form
                            onSubmit={
                                isEditing
                                    ? handleUpdateQuestion
                                    : handleAddQuestion
                            }
                            className="space-y-4"
                        >
                            <div>
                                <label
                                    htmlFor="question_text"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                    Question
                                </label>
                                <textarea
                                    id="question_text"
                                    name="question_text"
                                    value={formData.question_text}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label
                                        htmlFor="option_a"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Option A
                                    </label>
                                    <input
                                        id="option_a"
                                        name="option_a"
                                        type="text"
                                        value={formData.option_a}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="option_b"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Option B
                                    </label>
                                    <input
                                        id="option_b"
                                        name="option_b"
                                        type="text"
                                        value={formData.option_b}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="option_c"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Option C
                                    </label>
                                    <input
                                        id="option_c"
                                        name="option_c"
                                        type="text"
                                        value={formData.option_c}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="option_d"
                                        className="block text-sm font-medium text-gray-300 mb-1"
                                    >
                                        Option D
                                    </label>
                                    <input
                                        id="option_d"
                                        name="option_d"
                                        type="text"
                                        value={formData.option_d}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="correct_answer"
                                    className="block text-sm font-medium text-gray-300 mb-1"
                                >
                                    Correct Answer
                                </label>
                                <select
                                    id="correct_answer"
                                    name="correct_answer"
                                    value={formData.correct_answer}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                                    required
                                >
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="C">C</option>
                                    <option value="D">D</option>
                                </select>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        resetForm();
                                        setIsEditing(false);
                                        setShowAddForm(false);
                                        setSelectedQuestion(null);
                                    }}
                                    className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    {isEditing
                                        ? "Update Question"
                                        : "Add Question"}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Questions List */}
                {selectedEnemyId && (
                    <div className="bg-gray-800 rounded-md overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-700">
                            <thead className="bg-gray-700">
                                <tr>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                    >
                                        Question
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                    >
                                        Options
                                    </th>
                                    <th
                                        scope="col"
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                                    >
                                        Correct Answer
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
                                {questions.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="4"
                                            className="px-6 py-4 text-center text-sm text-gray-400"
                                        >
                                            No questions yet for this enemy. Add
                                            your first question!
                                        </td>
                                    </tr>
                                ) : (
                                    questions.map((question) => (
                                        <tr key={question.id}>
                                            <td className="px-6 py-4 text-sm text-white">
                                                {question.question_text}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-300">
                                                <div>
                                                    A: {question.option_a}
                                                </div>
                                                <div>
                                                    B: {question.option_b}
                                                </div>
                                                <div>
                                                    C: {question.option_c}
                                                </div>
                                                <div>
                                                    D: {question.option_d}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                                {question.correct_answer}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end space-x-3">
                                                    <button
                                                        onClick={() =>
                                                            editQuestion(
                                                                question
                                                            )
                                                        }
                                                        className="text-indigo-400 hover:text-indigo-300"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteQuestion(
                                                                question.id
                                                            )
                                                        }
                                                        className="text-red-400 hover:text-red-300"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionManagement;
