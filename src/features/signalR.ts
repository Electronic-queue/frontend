import * as signalR from "@microsoft/signalr";

// ✅ Переменная для хранения Connection ID
let currentConnectionId: string | null | undefined = null;

// Замените на ваш фактический URL
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
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
            
            // ✅ Connection ID доступен после connection.start()
            currentConnectionId = connection.connectionId;
            console.log("✅ SignalR подключен. ID:", currentConnectionId);
            
            return currentConnectionId;
        }
        
        // Если уже подключено, возвращаем текущий ID
        return connection.connectionId;

    } catch (error) {
        console.error("❌ Ошибка при запуске SignalR. Повторная попытка через 5 сек.", error);
        // Повторный запуск через 5 секунд в случае ошибки
        setTimeout(startSignalR, 5000);
        return null;
    }
};

/**
 * 📢 Колбэк при закрытии подключения.
 */
connection.onclose(async (error) => {
    console.warn("Потеряно соединение SignalR. Попытка переподключения...", error);
    // withAutomaticReconnect должен сам попробовать переподключиться,
    // но на всякий случай вызываем startSignalR, если это нужно для логики.
    // await startSignalR(); 
});

/**
 * 🔄 Колбэк при успешном переподключении.
 * Получает новый Connection ID.
 */
connection.onreconnected((connectionId) => {
    // ✅ Всегда используйте этот ID, так как он мог измениться!
    currentConnectionId = connectionId;
    console.log("🔄 SignalR успешно переподключен. Новый ID:", currentConnectionId);
    // Здесь вы можете отправить новый ID на ваш сервер, если это необходимо
});


/**
 * 💡 Функция для получения текущего ID
 */
export const getConnectionId = () => {
    return currentConnectionId;
};

export default connection;