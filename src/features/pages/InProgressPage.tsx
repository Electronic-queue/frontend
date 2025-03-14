import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";

import mockData from "src/components/mock/MockWaitingData.json";
import theme from "src/styles/theme";
import { useNavigate } from "react-router-dom";
import connection, { startSignalR } from "src/features/signalR";
import { useGetRecordIdByTokenQuery } from "src/store/userApi";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "100%",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(4),
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    textAlign: "center",
}));

const InProgress = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: recordData, isLoading: isRecordLoading } =
        useGetRecordIdByTokenQuery();

    useEffect(() => {
        if (isRecordLoading) return;

        startSignalR();

        connection.on("ReceiveRecordCreated", (newRecord) => {
            if (
                newRecord.recordId === recordData?.recordId &&
                newRecord.clientNumber === -3
            ) {
                navigate("/rating");
            }
        });

        connection.on("RecieveUpdateRecord", (queueList) => {
            const updatedItem = queueList.find(
                (item: { recordId: number }) =>
                    item.recordId === recordData?.recordId
            );
            if (updatedItem && updatedItem.clientNumber === -3) {
                navigate("/rating");
            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("ReceiveUpdateRecord");
        };
    }, [navigate, recordData, isRecordLoading]);

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                <Typography sx={{ fontSize: theme.typography.h5.fontSize }}>
                    {t("i18n_queue.beingServed")}
                </Typography>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default InProgress;
