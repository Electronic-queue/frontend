import { Routes, Route } from "react-router-dom";
import QueuePage from "./features/pages/QueuePage";
import StatisticPage from "./features/pages/StatisticPage";
import Header from "src/widgets/header/ui/Header";
import LoginPage from "./features/pages/LoginPage";
// import ProtectedRoute from "./components/ProtectedRoute";
import { FC } from "react";
import Page from "./components/Page";
import MobilePage from "./features/pages/MobilePage";

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
                                <Route
                                    path="/mobile"
                                    element={<MobilePage />}
                                />
                                {/* <Route
                                    path="/"
                                    element={
                                        <ProtectedRoute>
                                            <QueuePage />
                                        </ProtectedRoute>
                                    }
                                /> */}
                                <Route path="/" element={<QueuePage />} />
                                {/* <Route
                                    path="/queue"
                                    element={
                                        <ProtectedRoute>
                                            <QueuePage />
                                        </ProtectedRoute>
                                    }
                                /> */}
                                <Route path="/queue" element={<QueuePage />} />
                                {/* <Route
                                    path="/static"
                                    element={
                                        <ProtectedRoute>
                                            <StatisticPage />
                                        </ProtectedRoute>
                                    }
                                /> */}

                                <Route
                                    path="/static"
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
