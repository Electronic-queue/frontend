import * as signalR from "@microsoft/signalr";

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

export const startSignalR = async () => {
    try {
        if (connection.state === signalR.HubConnectionState.Disconnected) {
            await connection.start();
        }
    } catch (error) {
        setTimeout(startSignalR, 5000);
    }
};

connection.onclose(async (error) => {
    await startSignalR();
});

connection.onreconnected((connectionId) => {});

export default connection;
