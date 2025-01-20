import React, { useEffect, useState } from "react";

interface TimerProps {
    initialTime: number; // Время в минутах
    onResume: () => void; // Коллбэк для кнопки "Вернуться"
}

const Timer: React.FC<TimerProps> = ({ initialTime, onResume }) => {
    const [timeLeft, setTimeLeft] = useState(initialTime * 60); // Конвертация в секунды
    const [isCountingUp, setIsCountingUp] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev === 0 && !isCountingUp) {
                    setIsCountingUp(true); // Начать прямой отсчёт
                    return 1;
                }
                return isCountingUp ? prev + 1 : prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer); // Очистка таймера при размонтировании
    }, [isCountingUp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
            .toString()
            .padStart(2, "0");
        const secs = (seconds % 60).toString().padStart(2, "0");
        return `${mins}:${secs}`;
    };

    return (
        <div style={{ textAlign: "center" }}>
            <div
                style={{
                    fontSize: "48px",
                    color: "green",
                    marginBottom: "16px",
                }}
            >
                {formatTime(timeLeft)}
            </div>
            <button
                onClick={onResume}
                style={{
                    padding: "8px 16px",
                    background: "#1976d2",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                Вернуться на работу
            </button>
        </div>
    );
};

export default Timer;
