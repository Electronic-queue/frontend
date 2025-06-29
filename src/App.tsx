
import { FC } from "react";
import { Routes, Route } from "react-router-dom";
import { useMediaQuery } from "@mui/material";
import { SnackbarProvider } from "notistack";

import Header from "src/widgets/header/ui/Header";
import MediaProvider from "src/features/MediaProvider";

import LoginPage from "src/features/pages/LoginPage";
import MobilePage from "src/components/MobilePage";
import ClientRegisterPage from "src/features/pages/ClientRegisterPage";
import ServiceSelection from "src/features/pages/ServiceSelectionPage";
import WaitingPage from "src/features/pages/WaitingPage";
import CallPage from "src/features/pages/CallPage";
import ServiceRating from "src/features/pages/ServiceRating";
import QueuePage from "src/features/pages/QueuePage";
import Page from "src/components/Page";
import RestrictedAccess from "src/components/RestrictedAccess";
import InProgress from "src/features/pages/InProgressPage";
import ProtectedRoute from "src/components/ProtectedRoute";

import RejectPage from "src/features/pages/RejectPage";
import NotFound from "src/features/pages/NotFound";
import RessetPassowd from "src/features/pages/ResetPassword";
import Landing from "src/features/pages/Landing";

import { useNotificationSetup } from "src/hooks/useNotificationSetup";

import "./app.css";

const NotificationListener: FC = () => {
    useNotificationSetup();
    return null;
};

import MonitorPage from "./features/pages/MonitorPage";


const App: FC = () => {
    const isMobile = useMediaQuery("(max-width: 768px)");
    const location = useLocation();
    return (

        <SnackbarProvider maxSnack={3}>
          <NotificationListener />
        <MediaProvider>
            {location.pathname !== "/monitor" && <Header />}
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/ressetpassword" element={<RessetPassowd />} />
                <Route path="/monitor" element={<MonitorPage />} />
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
            </SnackbarProvider>

    );
};

const MobileRoutes: FC = () => (
    <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/register" element={<ClientRegisterPage />} />
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
