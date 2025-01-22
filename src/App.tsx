import { Routes, Route } from "react-router-dom";
import QueuePage from "./features/pages/QueuePage";
import StatisticPage from "./features/pages/StatisticPage";
import Header from "src/widgets/header/ui/Header";
import LoginPage from "./features/pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { FC } from "react";
import Page from "./components/Page";

const App: FC = () => {
    return (
        <>
            <Header />
            <Page>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <QueuePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/queue"
                        element={
                            <ProtectedRoute>
                                <QueuePage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/static"
                        element={
                            <ProtectedRoute>
                                <StatisticPage />
                            </ProtectedRoute>
                        }
                    />
                </Routes>
            </Page>
        </>
    );
};

export default App;
