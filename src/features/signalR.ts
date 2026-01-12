import * as signalR from "@microsoft/signalr";

let currentConnectionId: string | null | undefined = null;

export const signalRBaseUrl = import.meta.env.VITE_SIGNALR_BASE_URL;

const connection = new signalR.HubConnectionBuilder()
    .withUrl(signalRBaseUrl, {
        transport:
            signalR.HttpTransportType.WebSockets |
            signalR.HttpTransportType.ServerSentEvents |
            signalR.HttpTransportType.LongPolling,

        withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

/**
 * 🚀 Запускает подключение SignalR.
 * Возвращает Connection ID при успешном подключении.
 */
export const startSignalR = async () => {
    try {
        // Если уже подключено - просто вернем ID
        if (connection.state === signalR.HubConnectionState.Connected) {
            // Обновляем currentConnectionId на всякий случай
            currentConnectionId = connection.connectionId;
            return currentConnectionId;
        }

        // Если в процессе подключения - ждем или возвращаем null (зависит от логики, тут просто выходим)
        if (connection.state === signalR.HubConnectionState.Connecting) {
            return null;
        }

        await connection.start();

        // ✅ Connection ID доступен после connection.start()
        currentConnectionId = connection.connectionId;

        return currentConnectionId;
    } catch (error) {
        console.error(
            "❌ Ошибка при запуске SignalR. Повторная попытка через 5 сек.",
            error
        );
        // Лучше не делать рекурсию с setTimeout внутри async функции без контроля,
        // но оставим вашу логику, если она вам привычна.
        // setTimeout(startSignalR, 5000);
        return null;
    }
};

connection.onclose(async (error) => {
    console.warn("Потеряно соединение SignalR.", error);
    currentConnectionId = null;
});

connection.onreconnected((connectionId) => {
    currentConnectionId = connectionId;
});

export const getConnectionId = () => {
    return currentConnectionId;
};

export default connection;
