import { Routes, Route } from "react-router-dom";
import { FC } from "react";
import { useMediaQuery } from "@mui/material";
import Header from "src/widgets/header/ui/Header";
import MediaProvider from "src/features/MediaProvider";
import Page from "./components/Page";
import MobilePage from "./components/MobilePage";
import LoginPage from "./features/pages/LoginPage";
import ClientRegisterPage from "./features/pages/ClientRegisterPage";
import QueuePage from "./features/pages/QueuePage";
import StatisticPage from "./features/pages/StatisticPage";
import "./app.css";
import ServiceSelection from "./features/pages/ServiceSelectionPage";

const App: FC = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <MediaProvider>
            <Header />
            <Routes>
                <Route path="/login" element={<LoginPage />} />

                <Route
                    path="/*"
                    element={
                        isMobile ? (
                            <MobilePage>
                                <MobileRoutes />
                            </MobilePage>
                        ) : (
                            <Page>
                                <DesktopRoutes />
                            </Page>
                        )
                    }
                />
            </Routes>
        </MediaProvider>
    );
};

const MobileRoutes: FC = () => (
    <Routes>
        <Route path="/" element={<ClientRegisterPage />} />
        <Route path="/selection" element={<ServiceSelection />} />
    </Routes>
);

const DesktopRoutes: FC = () => (
    <Routes>
        <Route path="/" element={<ClientRegisterPage />} />
        <Route path="/manager/queue" element={<QueuePage />} />
        <Route path="/manager/reports" element={<StatisticPage />} />
    </Routes>
);

export default App;
