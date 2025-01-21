import { Routes, Route } from "react-router-dom";
import QueuePage from "./features/pages/QueuePage";
import StatisticPage from "./features/pages/StatisticPage";
import Header from "src/widgets/header/ui/Header";
import { FC } from "react";
import Page from "./components/Page";

const App: FC = () => {
    return (
        <>
            <Header />
            <Page>
                {/* // написать фильтры для ролей */}
                <Routes>
                    <Route path="/" element={<QueuePage />} />
                    <Route path="/queue" element={<QueuePage />} />
                    <Route path="/static" element={<StatisticPage />} />
                </Routes>
            </Page>
        </>
    );
};

export default App;
