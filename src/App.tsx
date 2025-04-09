import { Routes, Route } from "react-router-dom";
import { FC } from "react";
import { useMediaQuery } from "@mui/material";
import Header from "src/widgets/header/ui/Header";
import MediaProvider from "src/features/MediaProvider";
import LoginPage from "./features/pages/LoginPage";
import MobilePage from "./components/MobilePage";
import ClientRegisterPage from "./features/pages/ClientRegisterPage";
import ServiceSelection from "./features/pages/ServiceSelectionPage";
import WaitingPage from "./features/pages/WaitingPage";
import CallPage from "src/features/pages/CallPage";
import ServiceRating from "./features/pages/ServiceRating";
import QueuePage from "./features/pages/QueuePage";
import Page from "./components/Page";
import RestrictedAccess from "./components/RestrictedAccess";
import "./app.css";
import InProgress from "./features/pages/InProgressPage";
import ProtectedRoute from "src/components/ProtectedRoute";
import RejectPage from "./features/pages/RejectPage";
import NotFound from "./features/pages/NotFound";
import RessetPassowd from "./features/pages/ResetPassword";

const App: FC = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");

    return (
        <MediaProvider>
            <Header />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/ressetpassword" element={<RessetPassowd />} />

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
        <Route path="/wait" element={<WaitingPage />} />
        <Route path="/call" element={<CallPage />} />
        <Route path="/progress" element={<InProgress />} />
        <Route path="/rating" element={<ServiceRating />} />
        <Route path="/rejected" element={<RejectPage />} />
        <Route path="/*" element={<NotFound />} />
    </Routes>
);

const DesktopRoutes: FC = () => (
    <Routes>
        <Route
            path="/manager/queue"
            element={
                <ProtectedRoute>
                    <QueuePage />
                </ProtectedRoute>
            }
        />
        <Route path="/*" element={<RestrictedAccess />} />
    </Routes>
);

export default App;
