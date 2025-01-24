import { useState, useEffect } from "react";

type QueueItem = {
    clientNumber: string;
    service: string;
    bookingTime: string;
    expectedTime: string;
};

const useQueueData = () => {
    const [data, setData] = useState<QueueItem[]>([]);
    useEffect(() => {
        const mockData: QueueItem[] = [
            {
                clientNumber: "C34",
                service: "Услуга 1",
                bookingTime: "12:30",
                expectedTime: "12:45",
            },
            {
                clientNumber: "C35",
                service: "Услуга 2",
                bookingTime: "12:35",
                expectedTime: "12:50",
            },
            {
                clientNumber: "C36",
                service: "Услуга 3",
                bookingTime: "12:40",
                expectedTime: "12:55",
            },
            {
                clientNumber: "C37",
                service: "Услуга 4",
                bookingTime: "12:45",
                expectedTime: "13:00",
            },
        ];
        setTimeout(() => setData(mockData), 500);
    }, []);

    return data;
};

export default useQueueData;
