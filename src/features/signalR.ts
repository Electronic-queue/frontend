import * as signalR from "@microsoft/signalr";
import { signalRBaseUrl } from "src/config/api.config";

const connection = new signalR.HubConnectionBuilder()
    .withUrl(signalRBaseUrl, {
        transport: signalR.HttpTransportType.WebSockets,
        withCredentials: false,
    })
    .withAutomaticReconnect()
    .configureLogging(signalR.LogLevel.Information)
    .build();

export const startSignalR = async () => {
    try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
            console.log("✅ SignalR подключен");
        }
    } catch (error) {
        console.error("❌ Ошибка подключения к SignalR:", error);
        setTimeout(startSignalR, 5000); // 👈 Повторная попытка через 5 сек
    }
};

connection.onclose(async (error) => {
    console.error("❌ Соединение с SignalR разорвано:", error);
    await startSignalR(); // 👈 Авто-переподключение
});

connection.onreconnected((connectionId) => {
    console.log("🔄 SignalR переподключен, новый ID:", connectionId);
});

export default connection;
