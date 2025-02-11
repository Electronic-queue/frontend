import * as signalR from "@microsoft/signalr";
import { signalRBaseUrl } from "src/config/api.config";

const connection = new signalR.HubConnectionBuilder()
    .withUrl(`${signalRBaseUrl}`, {
        transport: signalR.HttpTransportType.WebSockets,
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
    }
};

connection.onclose((error) => {
    console.error("❌ Соединение с SignalR разорвано:", error);
});

connection.onreconnected((connectionId) => {
    console.log("🔄 SignalR переподключен, новый ID:", connectionId);
});

export default connection;
