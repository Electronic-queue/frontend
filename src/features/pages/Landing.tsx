import { useEffect } from "react";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { StudentsIcon, SULogoM } from "src/assets";
import { useDispatch, useSelector } from "react-redux";
import { setQueueTypeId } from "src/store/userAuthSlice";

import theme from "src/styles/theme";
import { useNavigate } from "react-router-dom";
import connection, { startSignalR } from "src/features/signalR";
import { useGetRecordIdByTokenQuery } from "src/store/userApi";
import { useGetQueueTypeQuery } from "src/store/managerApi";
import { RootState } from "src/store/store";
import CustomButton from "src/components/Button";

const BackgroundContainer = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(to left, #ADD8E6, white 50%)",
    paddingTop: theme.spacing(5),
}));

const FormContainer = styled(Stack)(({ theme }) => ({
    width: "95%",
    height: "565px",
    maxWidth: theme.spacing(50),
    padding: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(36, 34, 207, 0.18)",
    textAlign: "center",
}));

const Landing = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        data: queueTypeData,
        isLoading: isQueueLoading,
        error: queueError,
    } = useGetQueueTypeQuery();
    const { data: recordData, isLoading: isRecordLoading } =
        useGetRecordIdByTokenQuery();

    const ticketNumber = useSelector(
        (state: RootState) => state.user.ticketNumber
    );

    // Безопасный лог:
    console.log("queueTypeData", queueTypeData?.value);

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
                (item: { ticketNumber: number }) =>
                    item.ticketNumber === ticketNumber
            );
            if (updatedItem && updatedItem.clientNumber === -3) {
                navigate("/rating");
            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("ReceiveUpdateRecord");
        };
    }, [navigate, recordData, isRecordLoading, ticketNumber]);

    const handleSelectQueueType = (queueTypeId: string) => {
        dispatch(setQueueTypeId(queueTypeId));
        navigate("/");
    };

    return (
        <BackgroundContainer>
            <Box>
                <StudentsIcon />
            </Box>

            <FormContainer>
                <Box sx={{ paddingBottom: theme.spacing(5) }}>
                    <SULogoM />
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: theme.spacing(2),
                        zIndex: "1",
                    }}
                >
                    {isQueueLoading && (
                        <Typography variant="body1">
                            {t("loading")}...
                        </Typography>
                    )}

                    {queueError && (
                        <Typography variant="body2" color="error">
                            {t("failed_to_load_data")}
                        </Typography>
                    )}

                    {queueTypeData?.value?.map(
                        (queueType: {
                            queueTypeId: string;
                            nameRu: string;
                        }) => (
                            <CustomButton
                                key={queueType.queueTypeId}
                                variantType="primary"
                                onClick={() =>
                                    handleSelectQueueType(queueType.queueTypeId)
                                }
                            >
                                {queueType.nameRu}
                            </CustomButton>
                        )
                    )}
                </Box>
            </FormContainer>
        </BackgroundContainer>
    );
};

export default Landing;
