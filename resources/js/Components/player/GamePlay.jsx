import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const GamePlay = () => {
    const navigate = useNavigate();

    // Game state
    const [loading, setLoading] = useState(true);
    const [enemies, setEnemies] = useState([]);
    const [currentEnemyIndex, setCurrentEnemyIndex] = useState(0);
    const [currentEnemy, setCurrentEnemy] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);

    // Player state
    const [player, setPlayer] = useState(null);
    const [playerHP, setPlayerHP] = useState(0);
    const [enemyHP, setEnemyHP] = useState(0);
    const [playerLevel, setPlayerLevel] = useState(1);

    // UI state
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [answerResult, setAnswerResult] = useState(null);
    const [gameState, setGameState] = useState("question"); // question, player-turn, enemy-turn, game-over, victory
    const [message, setMessage] = useState("");
    const [cooldowns, setCooldowns] = useState({
        powerStrike: 0,
        shieldBash: 0,
        heal: 0,
        fireball: 0,
    });

    useEffect(() => {
        initializeGame();
    }, []);

    const initializeGame = async () => {
        try {
            // Load player profile
            const playerResponse = await axios.get("/api/player/profile");
            setPlayer(playerResponse.data);
            setPlayerHP(playerResponse.data.actual_hp);
            setPlayerLevel(playerResponse.data.level);

            // Load enemies with questions
            const enemiesResponse = await axios.get("/api/game/enemies");

            if (enemiesResponse.data.length === 0) {
                setMessage(
                    "No enemies available for your level. Please try again later."
                );
                setGameState("game-over");
                setLoading(false);
                return;
            }

            setEnemies(enemiesResponse.data);

            // Set current enemy
            const firstEnemy = enemiesResponse.data[0];
            setCurrentEnemy(firstEnemy);
            setEnemyHP(firstEnemy.hp);

            // Set current question if available
            if (firstEnemy.questions && firstEnemy.questions.length > 0) {
                setCurrentQuestion(firstEnemy.questions[0]);
                setCurrentQuestionIndex(0);
            } else {
                setGameState("player-turn");
            }

            setLoading(false);
        } catch (error) {
            console.error("Error initializing game:", error);
            setMessage("Failed to load game data. Please try again.");
            setGameState("game-over");
            setLoading(false);
        }
    };

    const handleAnswerSelection = (answer) => {
        setSelectedAnswer(answer);

        const isCorrect = answer === currentQuestion.correct_answer;
        setAnswerResult(isCorrect);

        if (isCorrect) {
            setMessage("Correct! Your turn to attack.");
            setGameState("player-turn");
        } else {
            setMessage("Incorrect! Enemy attacks you.");
            setTimeout(() => {
                enemyAttack();
            }, 1500);
        }
    };

    const handleSkillUse = (skill) => {
        // Check cooldowns
        if (skill !== "basicAttack" && cooldowns[skill] > 0) {
            setMessage(
                `${skill} is on cooldown for ${cooldowns[skill]} more turns.`
            );
            return;
        }

        let damage = 0;
        let newEnemyHP = enemyHP;
        let newPlayerHP = playerHP;
        let skillMessage = "";

        // Apply skill effects
        switch (skill) {
            case "basicAttack":
                damage = getRandomDamage(player.min_attack, player.max_attack);
                damage = Math.max(1, damage - currentEnemy.defense);
                newEnemyHP = Math.max(0, enemyHP - damage);
                skillMessage = `You deal ${damage} damage with a basic attack!`;
                break;

            case "powerStrike":
                damage =
                    getRandomDamage(player.min_attack, player.max_attack) * 1.5;
                damage = Math.max(1, Math.floor(damage - currentEnemy.defense));
                newEnemyHP = Math.max(0, enemyHP - damage);
                setCooldowns((prev) => ({ ...prev, powerStrike: 2 }));
                skillMessage = `You deal ${damage} damage with Power Strike!`;
                break;

            case "shieldBash":
                damage = getRandomDamage(player.min_attack, player.max_attack);
                damage = Math.max(
                    1,
                    damage - Math.floor(currentEnemy.defense / 2)
                ); // Reduced defense effect
                newEnemyHP = Math.max(0, enemyHP - damage);
                setCooldowns((prev) => ({ ...prev, shieldBash: 2 }));
                skillMessage = `You deal ${damage} damage with Shield Bash and reduce enemy defense!`;
                break;

            case "heal":
                const healAmount = player.heal_value;
                newPlayerHP = Math.min(player.hp, playerHP + healAmount);
                setCooldowns((prev) => ({ ...prev, heal: 3 }));
                skillMessage = `You heal ${healAmount} HP!`;
                break;

            case "fireball":
                damage =
                    getRandomDamage(player.min_attack, player.max_attack) * 2;
                damage = Math.max(
                    1,
                    Math.floor(damage - currentEnemy.defense / 2)
                ); // Fireball ignores some defense
                newEnemyHP = Math.max(0, enemyHP - damage);
                setCooldowns((prev) => ({ ...prev, fireball: 4 }));
                skillMessage = `You deal ${damage} damage with Fireball!`;
                break;
        }

        setEnemyHP(newEnemyHP);
        setPlayerHP(newPlayerHP);
        setMessage(skillMessage);

        // Check if enemy is defeated
        if (newEnemyHP <= 0) {
            handleEnemyDefeated();
        } else {
            // Enemy's turn after delay
            setTimeout(() => {
                reduceCooldowns();
                enemyAttack();
            }, 1500);
        }
    };

    const enemyAttack = () => {
        setGameState("enemy-turn");

        // Calculate enemy damage (random within range)
        const damage = getRandomDamage(
            currentEnemy.min_attack,
            currentEnemy.max_attack
        );
        const actualDamage = Math.max(1, damage - player.defense);
        const newPlayerHP = Math.max(0, playerHP - actualDamage);

        setPlayerHP(newPlayerHP);
        setMessage(
            `${currentEnemy.name} attacks you for ${actualDamage} damage!`
        );

        // Check if player is defeated
        if (newPlayerHP <= 0) {
            setTimeout(() => {
                setGameState("game-over");
                setMessage(
                    `You have been defeated by ${currentEnemy.name}. Game Over!`
                );
                // Update leaderboard with current level
                updateLeaderboard();
            }, 1500);
            return;
        }

        // Continue battle after delay
        setTimeout(() => {
            tryQuestion();
        }, 1500);
    };

    const handleEnemyDefeated = () => {
        // Increase player level
        const newLevel = playerLevel + 1;
        setPlayerLevel(newLevel);

        // Check if there are more enemies in current cycle
        if (currentEnemyIndex < enemies.length - 1) {
            setMessage(
                `You defeated ${currentEnemy.name}! Level up to ${newLevel}!`
            );

            // Move to next enemy after delay
            setTimeout(() => {
                const nextEnemyIndex = currentEnemyIndex + 1;
                const nextEnemy = enemies[nextEnemyIndex];

                setCurrentEnemyIndex(nextEnemyIndex);
                setCurrentEnemy(nextEnemy);
                setEnemyHP(nextEnemy.hp);
                setCurrentQuestionIndex(0);
                setCurrentQuestion(nextEnemy.questions?.[0] || null);
                setSelectedAnswer(null);
                setAnswerResult(null);
                setGameState(
                    nextEnemy.questions?.length > 0 ? "question" : "player-turn"
                );
                setMessage(`New enemy: ${nextEnemy.name}`);

                // Reset cooldowns for new enemy
                setCooldowns({
                    powerStrike: 0,
                    shieldBash: 0,
                    heal: 0,
                    fireball: 0,
                });
            }, 2000);
        } else {
            // Defeated all enemies in current cycle - reshuffle and start again
            setMessage(
                `You defeated ${currentEnemy.name}! Level up to ${newLevel}! Starting new cycle...`
            );

            setTimeout(() => {
                // Fetch enemies again which will be reshuffled
                initializeGame();
            }, 2000);
        }
    };

    const tryQuestion = () => {
        // Check if there are questions for the current enemy
        if (currentEnemy.questions && currentEnemy.questions.length > 0) {
            // If at the end of questions, start from beginning (infinite loop)
            const nextQuestionIndex =
                currentQuestionIndex < currentEnemy.questions.length - 1
                    ? currentQuestionIndex + 1
                    : 0;

            setCurrentQuestionIndex(nextQuestionIndex);
            setCurrentQuestion(currentEnemy.questions[nextQuestionIndex]);
            setSelectedAnswer(null);
            setAnswerResult(null);
            setGameState("question");
        } else {
            // No questions available, continue battle
            setGameState("player-turn");
        }
    };

    const reduceCooldowns = () => {
        setCooldowns((prev) => ({
            powerStrike: Math.max(0, prev.powerStrike - 1),
            shieldBash: Math.max(0, prev.shieldBash - 1),
            heal: Math.max(0, prev.heal - 1),
            fireball: Math.max(0, prev.fireball - 1),
        }));
    };

    const updateLeaderboard = async () => {
        try {
            await axios.post("/api/game/leaderboard", {
                level: playerLevel,
            });
        } catch (error) {
            console.error("Error updating leaderboard:", error);
        }
    };

    const handleExitGame = () => {
        navigate("/dashboard");
    };

    // Utility function to get random damage
    const getRandomDamage = (min, max) => {
        return Math.floor(Math.random() * (max - min + 1)) + min;
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
                    <h1 className="text-3xl font-bold">RPG Battle</h1>
                    <div>
                        <span className="text-gray-400 mr-2">
                            Level: {playerLevel}
                        </span>
                        <button
                            onClick={handleExitGame}
                            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Exit Game
                        </button>
                    </div>
                </header>

                {message && (
                    <div className="bg-gray-800 text-white p-4 rounded-md mb-6 text-center">
                        {message}
                    </div>
                )}

                {gameState === "game-over" ? (
                    <div className="text-center">
                        <div className="text-2xl font-bold mb-6">Game Over</div>
                        <button
                            onClick={handleExitGame}
                            className="px-6 py-3 bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Player Stats */}
                            <div className="bg-gray-800 p-4 rounded-md">
                                <h2 className="text-xl font-semibold mb-2">
                                    Player
                                </h2>
                                <div className="flex items-center mb-2">
                                    <div className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center text-3xl mr-4">
                                        👤
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {player?.character_name}
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            Level {playerLevel}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative pt-1">
                                    <div className="text-sm text-gray-400">
                                        HP: {playerHP}/{player?.hp}
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                                        <div
                                            style={{
                                                width: `${
                                                    (playerHP / player?.hp) *
                                                    100
                                                }%`,
                                            }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
                                        />
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <div>
                                        Attack: {player?.min_attack} -{" "}
                                        {player?.max_attack}
                                    </div>
                                    <div>Defense: {player?.defense}</div>
                                </div>
                            </div>

                            {/* Enemy Stats */}
                            <div className="bg-gray-800 p-4 rounded-md">
                                <h2 className="text-xl font-semibold mb-2">
                                    Enemy
                                </h2>
                                <div className="flex items-center mb-2">
                                    <div className="w-20 h-20 bg-gray-700 rounded-md flex items-center justify-center overflow-hidden mr-4">
                                        {currentEnemy && (
                                            <img
                                                src={`/storage/${currentEnemy.image_path}`}
                                                alt={currentEnemy.name}
                                                className="w-full h-full object-cover"
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">
                                            {currentEnemy?.name}
                                        </div>
                                    </div>
                                </div>

                                <div className="relative pt-1">
                                    <div className="text-sm text-gray-400">
                                        HP: {enemyHP}/{currentEnemy?.hp}
                                    </div>
                                    <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-700">
                                        <div
                                            style={{
                                                width: `${
                                                    (enemyHP /
                                                        currentEnemy?.hp) *
                                                    100
                                                }%`,
                                            }}
                                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                                        />
                                    </div>
                                </div>

                                <div className="text-sm">
                                    <div>
                                        Attack: {currentEnemy?.min_attack} -{" "}
                                        {currentEnemy?.max_attack}
                                    </div>
                                    <div>Defense: {currentEnemy?.defense}</div>
                                </div>
                            </div>
                        </div>

                        {/* Question Section */}
                        {gameState === "question" && currentQuestion && (
                            <div className="bg-gray-800 p-6 rounded-md mb-6">
                                <h3 className="text-lg font-medium mb-4">
                                    {currentQuestion.question_text}
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={() =>
                                            handleAnswerSelection("A")
                                        }
                                        className={`p-3 rounded-md text-left ${
                                            selectedAnswer === "A"
                                                ? answerResult
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                        disabled={selectedAnswer !== null}
                                    >
                                        A: {currentQuestion.option_a}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleAnswerSelection("B")
                                        }
                                        className={`p-3 rounded-md text-left ${
                                            selectedAnswer === "B"
                                                ? answerResult
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                        disabled={selectedAnswer !== null}
                                    >
                                        B: {currentQuestion.option_b}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleAnswerSelection("C")
                                        }
                                        className={`p-3 rounded-md text-left ${
                                            selectedAnswer === "C"
                                                ? answerResult
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                        disabled={selectedAnswer !== null}
                                    >
                                        C: {currentQuestion.option_c}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleAnswerSelection("D")
                                        }
                                        className={`p-3 rounded-md text-left ${
                                            selectedAnswer === "D"
                                                ? answerResult
                                                    ? "bg-green-600"
                                                    : "bg-red-600"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        }`}
                                        disabled={selectedAnswer !== null}
                                    >
                                        D: {currentQuestion.option_d}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Skills Section */}
                        {gameState === "player-turn" && (
                            <div className="bg-gray-800 p-6 rounded-md">
                                <h3 className="text-lg font-medium mb-4">
                                    Choose an action:
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() =>
                                            handleSkillUse("basicAttack")
                                        }
                                        className="p-3 rounded-md bg-gray-700 hover:bg-gray-600 text-left"
                                    >
                                        <div className="font-medium">
                                            Basic Attack
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            No cooldown
                                        </div>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSkillUse("powerStrike")
                                        }
                                        className={`p-3 rounded-md ${
                                            cooldowns.powerStrike > 0
                                                ? "bg-gray-900 text-gray-500 cursor-not-allowed"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        } text-left`}
                                        disabled={cooldowns.powerStrike > 0}
                                    >
                                        <div className="font-medium">
                                            Power Strike
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {cooldowns.powerStrike > 0
                                                ? `Cooldown: ${cooldowns.powerStrike} turns`
                                                : "Ready (2-turn cooldown)"}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSkillUse("shieldBash")
                                        }
                                        className={`p-3 rounded-md ${
                                            cooldowns.shieldBash > 0
                                                ? "bg-gray-900 text-gray-500 cursor-not-allowed"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        } text-left`}
                                        disabled={cooldowns.shieldBash > 0}
                                    >
                                        <div className="font-medium">
                                            Shield Bash
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {cooldowns.shieldBash > 0
                                                ? `Cooldown: ${cooldowns.shieldBash} turns`
                                                : "Ready (2-turn cooldown)"}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => handleSkillUse("heal")}
                                        className={`p-3 rounded-md ${
                                            cooldowns.heal > 0
                                                ? "bg-gray-900 text-gray-500 cursor-not-allowed"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        } text-left`}
                                        disabled={cooldowns.heal > 0}
                                    >
                                        <div className="font-medium">Heal</div>
                                        <div className="text-sm text-gray-400">
                                            {cooldowns.heal > 0
                                                ? `Cooldown: ${cooldowns.heal} turns`
                                                : "Ready (3-turn cooldown)"}
                                        </div>
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleSkillUse("fireball")
                                        }
                                        className={`p-3 rounded-md ${
                                            cooldowns.fireball > 0
                                                ? "bg-gray-900 text-gray-500 cursor-not-allowed"
                                                : "bg-gray-700 hover:bg-gray-600"
                                        } text-left`}
                                        disabled={cooldowns.fireball > 0}
                                    >
                                        <div className="font-medium">
                                            Fireball
                                        </div>
                                        <div className="text-sm text-gray-400">
                                            {cooldowns.fireball > 0
                                                ? `Cooldown: ${cooldowns.fireball} turns`
                                                : "Ready (4-turn cooldown)"}
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default GamePlay;
