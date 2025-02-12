import React, { useEffect, useState } from "react";
import connection, { startSignalR } from "src/features/signalR";
import { apiBaseUrl } from "src/config/api.config";
interface Notification {
    recordId: number;
    windowId: number;
    clientNumber: number;
    expectedAcceptanceString: string;
}

const BASE_URL = apiBaseUrl;

const SignalRComponent: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        let isMounted = true;

        const connect = async () => {
            await startSignalR();
        };

        connect();

        const handleNewNotification = (
            recordId: number,
            windowId: number,
            clientNumber: number,
            expectedAcceptanceString: string
        ) => {
            if (isMounted) {
                setNotifications((prev) => [
                    ...prev,
                    {
                        recordId,
                        windowId,
                        clientNumber,
                        expectedAcceptanceString,
                    },
                ]);
            }
        };

        connection.on("ReceiveRecordCreated", handleNewNotification);

        return () => {
            isMounted = false;
            connection.off("ReceiveRecordCreated", handleNewNotification);
        };
    }, []);

    const cancelRecord = async (recordId: number) => {
        try {
            await fetch(`${BASE_URL}/record/cancel/${recordId}`, {
                method: "DELETE",
            });
            setNotifications((prev) =>
                prev.filter((n) => n.recordId !== recordId)
            );
            alert(`Запись №${recordId} отменена.`);
        } catch (err) {
            alert("Не удалось отменить запись.");
        }
    };

    return (
        <div>
            <h2>Уведомления</h2>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    marginTop: "2rem",
                }}
            >
                {notifications.length === 0 ? (
                    <p>Нет новых уведомлений</p>
                ) : (
                    notifications.map(
                        ({
                            recordId,
                            windowId,
                            clientNumber,
                            expectedAcceptanceString,
                        }) => (
                            <div
                                key={recordId}
                                style={{
                                    border: "1px solid #ccc",
                                    padding: "16px",
                                    borderRadius: "8px",
                                    backgroundColor: "#f9f9f9",
                                }}
                            >
                                <h2>Ваш номер № {recordId}</h2>
                                <p>Окно: {windowId}</p>
                                <p>До вас в очереди: {clientNumber}</p>
                                <p>
                                    Ожидаемое время приёма:{" "}
                                    {expectedAcceptanceString}
                                </p>
                                <button
                                    style={{
                                        marginTop: "12px",
                                        padding: "8px 16px",
                                        backgroundColor: "#ff4d4d",
                                        color: "#fff",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                    onClick={() => cancelRecord(recordId)}
                                >
                                    Отказаться
                                </button>
                            </div>
                        )
                    )
                )}
            </div>
        </div>
    );
};

export default SignalRComponent;
