import React, { useState, useRef, useEffect } from "react";
import { BsRocketTakeoff } from "react-icons/bs";
import Notification from "./Notification";
import "./RocketGame.css";
import { updateUserBalance, getUserBalance } from "../utils/supabaseclient";
import { useAuth } from "../utils/AuthContext";
import { useBalance } from "../utils/BalanceContext";
import Leaderboard from "./Leaderboard";

function RocketGame() {
    const { user } = useAuth(); // Get current user from AuthContext
    const { coinsBalance, setCoinsBalance } = useBalance(); // Get and update balance from context
    const [betAmount, setBetAmount] = useState(0);
    const [rocketMultiplier, setRocketMultiplier] = useState(0);
    const [currentBet, setCurrentBet] = useState(0);
    const [rocketFlying, setRocketFlying] = useState(false);
    const [trailPoints, setTrailPoints] = useState([{ x: 0, y: 500 }]);
    const [hasCrashed, setHasCrashed] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showCashedOut, setShowCashedOut] = useState(null);
    const [hasCashedOut, setHasCashedOut] = useState(false);

    const [lastClaimTime, setLastClaimTime] = useState(
        localStorage.getItem("lastClaimTime") || null
    );
    const [bonusCountdown, setBonusCountdown] = useState("");

    const intervalRef = useRef(null);
    const rocketAreaRef = useRef(null);

    const FOUR_HOURS_MS = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    const BONUS_AMOUNT = 2000;

    const profit = currentBet * rocketMultiplier;

    useEffect(() => {
        const fetchBalance = async () => {
            if (user) {
                const { balance, error } = await getUserBalance(user.id);
                if (!error) {
                    setCoinsBalance(balance);
                } else {
                    console.error("Error fetching balance:", error.message);
                }
            }
        };
        fetchBalance();
    }, [user, setCoinsBalance]);

    // Calculate bonus countdown
    useEffect(() => {
        const interval = setInterval(() => {
            if (lastClaimTime) {
                const elapsedTime = Date.now() - parseInt(lastClaimTime, 10);
                if (elapsedTime >= FOUR_HOURS_MS) {
                    setBonusCountdown("Ready to claim!");
                } else {
                    const remainingTime = FOUR_HOURS_MS - elapsedTime;
                    const hours = Math.floor(remainingTime / (1000 * 60 * 60));
                    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
                    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
                    setBonusCountdown(`${hours}h ${minutes}m ${seconds}s`);
                }
            } else {
                setBonusCountdown("Ready to claim!");
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [lastClaimTime]);

    // Claim Bonus
    const handleClaimBonus = async () => {
        if (bonusCountdown !== "Ready to claim!") return;

        const newBalance = coinsBalance + BONUS_AMOUNT;
        const { success, error } = await updateUserBalance(user.id, newBalance);
        if (success) {
            setCoinsBalance(newBalance);
            localStorage.setItem("lastClaimTime", Date.now().toString());
            setLastClaimTime(Date.now().toString());
            setNotification({ message: `You claimed ${BONUS_AMOUNT} coins!`, type: "success" });
        } else {
            console.error("Error updating balance:", error.message);
            setNotification({ message: "Error claiming bonus", type: "error" });
        }
    };

    function betAmountChange(e) {
        const value = e.target.value;
        if (!isNaN(value) && value !== "") {
            setBetAmount(Number(value));
        } else {
            setBetAmount(0);
        }
    }

    async function placeBet() {
        if (betAmount <= 0 || betAmount > coinsBalance) {
            setNotification({ message: "Invalid Bet Amount", type: "error" });
            return;
        }

        const newBalance = coinsBalance - betAmount;

        const { success, error } = await updateUserBalance(user.id, newBalance);
        if (success) {
            setCoinsBalance(newBalance);
            setCurrentBet(betAmount);
            setBetAmount(0);
            setRocketMultiplier(0);
            setTrailPoints([{ x: 0, y: 500 }]);
            setHasCrashed(false);
            setHasCashedOut(false);
            rocketStart();
        } else {
            console.error("Error updating balance:", error.message);
            setNotification({ message: "Error placing bet", type: "error" });
        }
    }

    async function cashOutBet() {
        if (currentBet > 0) {
            const winnings = Math.round((currentBet * rocketMultiplier + currentBet) * 100) / 100;
            const newBalance = coinsBalance + winnings;

            const { success, error } = await updateUserBalance(user.id, newBalance);
            if (success) {
                setCoinsBalance(newBalance);
                setNotification({
                    message: `You cashed out at ${rocketMultiplier.toFixed(2)}x and won a total of ${winnings.toFixed(2)} coins (including your bet)!`,
                    type: "success",
                });

                setShowCashedOut(`+${winnings.toLocaleString()} coins`);
                setTimeout(() => setShowCashedOut(null), 3000);

                setHasCashedOut(true);
                setCurrentBet(0);
            } else {
                console.error("Error updating balance:", error.message);
                setNotification({ message: "Error cashing out", type: "error" });
            }
        } else {
            setNotification({ message: "No bet to cash out", type: "info" });
        }
    }

    function rocketStart() {
        if (rocketFlying) return;

        let crashPoint = generateCrashPoint();
        console.log(`Crash point: ${crashPoint}`);

        setRocketFlying(true);

        intervalRef.current = setInterval(() => {
            setRocketMultiplier((prev) => {
                const nextMultiplier = prev + 0.07;
                if (nextMultiplier >= crashPoint) {
                    clearInterval(intervalRef.current);
                    setCurrentBet(0);
                    setRocketFlying(false);
                    setHasCrashed(true);
                    setNotification({ message: "Rocket crashed!", type: "error" });
                    return nextMultiplier;
                }
                return nextMultiplier;
            });
        }, 100);
    }

    function generateCrashPoint() {
        const random = Math.random();
    
        if (random < 0.05) {
            // 5% chance: Crash between 0.1x and 0.15x
            return Math.random() * 0.05 + 0.1; // Range: 0.1 to 0.15
        } else if (random < 0.25) {
            // 20% chance: Crash between 0.15x and 0.3x
            return Math.random() * 0.15 + 0.15; // Range: 0.15 to 0.3
        } else if (random < 0.55) {
            // 30% chance: Crash between 0.3x and 1.2x
            return Math.random() * 0.9 + 0.3; // Range: 0.3 to 1.2
        } else if (random < 0.85) {
            // 30% chance: Crash between 1.3x and 3x
            return Math.random() * 1.7 + 1.3; // Range: 1.3 to 3
        } else if (random < 0.95) {
            // 10% chance: Crash between 3.1x and 6.5x
            return Math.random() * 3.4 + 3.1; // Range: 3.1 to 6.5
        } else {
            // 5% chance: Crash between 6.6x and 22x
            return Math.random() * 15.4 + 6.6; // Range: 6.6 to 22
        }
    }
    

    const rocketPosition = {
        top: `${95 - Math.max(1, Math.min(rocketMultiplier * 4, 95))}%`,
        left: `${Math.max(1, Math.min(rocketMultiplier * 4, 100))}%`,
    };

    useEffect(() => {
        if (rocketAreaRef.current) {
            const rect = rocketAreaRef.current.getBoundingClientRect();
            const newPoint = {
                x: (Math.max(1, Math.min(rocketMultiplier * 4, 100)) / 100) * rect.width,
                y: ((95 - Math.max(1, Math.min(rocketMultiplier * 4, 95))) / 100) * rect.height,
            };
            setTrailPoints((prevPoints) => [...prevPoints, newPoint].slice(-500));
        }
    }, [rocketMultiplier]);

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    const trailPath =
        trailPoints.length > 1 ? `M ${trailPoints.map((p) => `${p.x},${p.y}`).join(" L ")}` : "";

        return (
            <div className="rocket-game-container">
                <div className="game-wrapper">
                    <div className="left-panel">
                        <Leaderboard />
                        <div className="bonus-box">
                            <h3>4-Hour Bonus</h3>
                            <p>{bonusCountdown}</p>
                            <button
                                onClick={handleClaimBonus}
                                disabled={bonusCountdown !== "Ready to claim!"}
                                className="btn btn-bonus"
                            >
                                Claim 2,000 Coins
                            </button>
                        </div>
                    </div>
        
                    <div className="rocket-game">
                        <div className="game-container">
                            <div className="rocket-area" ref={rocketAreaRef}>
                                {showCashedOut && (
                                    <div className="cashed-out-effect">{showCashedOut}</div>
                                )}
                                <svg className="trail-svg" preserveAspectRatio="none">
                                    <path d={trailPath} className="rocket-trail" />
                                </svg>
                                <div
                                    className="rocket"
                                    style={{
                                        top: rocketPosition.top,
                                        left: rocketPosition.left,
                                    }}
                                >
                                    <BsRocketTakeoff className="rocket-icon" />
                                    <span className={`multiplier ${hasCrashed ? "crashed" : ""}`}>
                                        {rocketMultiplier.toFixed(2)}x
                                    </span>
                                </div>
                                {currentBet > 0 && !hasCashedOut && (
                                    <div className={`potential-win ${hasCrashed ? "crashed" : ""}`}>
                                        Potential Win: {profit.toFixed(2)} coins
                                    </div>
                                )}
        
                                {hasCashedOut && (
                                    <div className={`potential-win ${hasCrashed ? "crashed" : ""}`}>
                                        You are cashed out on this round
                                    </div>
                                )}
                            </div>
                            <div className="controls">
                                <input
                                    type="number"
                                    value={betAmount === 0 ? "" : betAmount}
                                    onChange={betAmountChange}
                                    placeholder="Bet Amount"
                                    disabled={rocketFlying}
                                    className="bet-input"
                                />
                                <button
                                    onClick={placeBet}
                                    disabled={rocketFlying}
                                    className="btn btn-place-bet"
                                >
                                    Place Bet
                                </button>
                                <button
                                    onClick={cashOutBet}
                                    disabled={!rocketFlying}
                                    className="btn btn-cash-out"
                                >
                                    Cash Out
                                </button>
                            </div>
                            <div className="game-info">
                                <span>Balance: {coinsBalance.toLocaleString()} coins</span>
                            </div>
                        </div>
                        {notification && (
                            <Notification
                                message={notification.message}
                                type={notification.type}
                                onClose={() => setNotification(null)}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
        
}

export default RocketGame;
