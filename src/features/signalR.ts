import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
    .withUrl("http://signalr.satbayevproject.kz/queueHub") // URL вашего хаба
    .withAutomaticReconnect() // Автоматическое переподключение
    .configureLogging(signalR.LogLevel.Information) // Логирование
    .build();

export const startSignalR = async () => {
    try {
        await connection.start();
        console.log("SignalR Connected");
    } catch (err) {
        console.error("SignalR Connection Error:", err);
        setTimeout(startSignalR, 5000); // Попробовать подключиться снова через 5 секунд
    }
};

export default connection;
