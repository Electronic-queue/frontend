import { Routes, Route } from "react-router-dom";
import QueuePage from "./features/pages/QueuePage";
import StatisticPage from "./features/pages/StatisticPage";
import Header from "src/widgets/header/ui/Header";
import LoginPage from "./features/pages/LoginPage";
import { FC } from "react";
import Page from "./components/Page";
import MobilePage from "./features/pages/MobilePage";
// import ProtectedRoute from "./components/ProtectedRoute";

import "./app.css";

const App: FC = () => {
    return (
        <>
            <Header />
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/*"
                    element={
                        <Page>
                            <Routes>
                                <Route path="/" element={<MobilePage />} />

                                {/* <Route
                                    path="/manager/queue"
                                    element={
                                        <ProtectedRoute
                                            allowedRoles={["manager"]}
                                        >
                                            <QueuePage />
                                        </ProtectedRoute>
                                    }
                                /> */}
                                <Route
                                    path="/manager/queue"
                                    element={<QueuePage />}
                                />
                                {/* 
                                <Route
                                    path="/manager/reports"
                                    element={
                                        <ProtectedRoute
                                            allowedRoles={["manager"]}
                                        >
                                            <StatisticPage />
                                        </ProtectedRoute>
                                    }
                                /> */}

                                <Route
                                    path="/manager/reports"
                                    element={<StatisticPage />}
                                />
                            </Routes>
                        </Page>
                    }
                />
            </Routes>
        </>
    );
};

export default App;
