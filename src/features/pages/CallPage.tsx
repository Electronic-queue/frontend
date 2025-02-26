import React, { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import Stack from "@mui/material/Stack";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import { useTranslation } from "react-i18next";
import { SULogoM } from "src/assets";
import CustomButton from "src/components/Button";
import ReusableModal from "src/components/ModalPage";
import theme from "src/styles/theme";
import { useNavigate } from "react-router-dom";
import connection, { startSignalR } from "src/features/signalR";
import {
    useGetClientRecordByIdQuery,
    useGetRecordIdByTokenQuery,
    useUpdateQueueItemMutation,
} from "src/store/managerApi";
import { useDispatch } from "react-redux";
import { setToken } from "src/store/userAuthSlice";

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

const TitleBox = styled(Box)(({ theme }) => ({
    width: theme.spacing(15),
    height: theme.spacing(15),
    borderRadius: "50%",
    border: `8px solid ${theme.palette.error.main}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
}));

const RefuseModal = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    gap: theme.spacing(2),
    alignItems: "center",
    justifyContent: "center",
}));

interface TimerProps {
    onTimeout: () => void;
}

const Timer: React.FC<TimerProps> = ({ onTimeout }) => {
    const [timeLeft, setTimeLeft] = useState(90);

    useEffect(() => {
        if (timeLeft === 0) {
            onTimeout();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, onTimeout]);

    return (
        <BackgroundContainer>
            <TitleBox>
                <Typography
                    variant="h1"
                    sx={{ color: theme.palette.error.main }}
                >
                    {timeLeft}
                </Typography>
            </TitleBox>
        </BackgroundContainer>
    );
};

const CallPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [expired, setExpired] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const { data: tokenData } = useGetRecordIdByTokenQuery();
    const recordId = tokenData?.recordId ? Number(tokenData.recordId) : null;
    const [updateQueueItem] = useUpdateQueueItemMutation();

    const { data: clientRecord } = useGetClientRecordByIdQuery(recordId ?? 0, {
        skip: !recordId,
    });

    const windowNumber = clientRecord?.windowNumber ?? "-";

    useEffect(() => {
        startSignalR();
        connection.on("ReceiveRecordCreated", (newRecord) => {
            if (
                newRecord.recordId === recordId &&
                newRecord.clientNumber === -1
            ) {
                navigate("/progress");
            }
        });
        connection.on("RecieveUpdateRecord", (queueList) => {
            const updatedItem = queueList.find(
                (item: { recordId: number | null }) =>
                    item.recordId === recordId
            );
            if (updatedItem && updatedItem.clientNumber === -1) {
                navigate("/progress");
            }
        });
        connection.on("RecieveUpdateRecord", (recordAccept) => {
            if (recordAccept.recordId === recordId) {
                navigate("/progress");
            }
        });

        connection.on("RecieveRedirectClient", (data) => {
            console.log("Received RecieveRedirectClient:", data);
            console.log("Current recordId:", recordId);
            console.log("Comparison result:", data.NewRecordId == recordId);

            if (data.NewRecordId == recordId) {
                console.log("Navigating to /wait");
                navigate("/wait", { replace: true });
            }
        });

        return () => {
            connection.off("ReceiveRecordCreated");
            connection.off("RecieveUpdateRecord");
            connection.off("RecieveAcceptRecord");
            connection.off("RecieveRedirectClient");
        };
    }, [recordId, navigate]);

    const handleModalOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handleNavige = () => {
        navigate("/");
    };

    const handleConfirmRefuse = async () => {
        if (!recordId) return;
        try {
            await updateQueueItem({ id: recordId }).unwrap();
        } catch (error) {
            alert(error);
        }
        localStorage.removeItem("token");
        dispatch(setToken(null));
        navigate("/");
        setIsOpen(false);
    };
    const handleAvtomaticConfirmRefuse = async () => {
        if (!recordId) return;
        try {
            await updateQueueItem({ id: recordId }).unwrap();
        } catch (error) {
            alert(error);
        }
        localStorage.removeItem("token");
        dispatch(setToken(null));

        setIsOpen(false);
    };

    return (
        <BackgroundContainer>
            <Box sx={{ paddingBottom: theme.spacing(5) }}>
                <SULogoM />
            </Box>
            <FormContainer>
                {!expired ? (
                    <>
                        <Typography variant="h4" sx={{ marginBottom: 2 }}>
                            {t("i18n_queue.approachWindow")} {windowNumber}
                        </Typography>
                        <Timer
                            onTimeout={() => {
                                setExpired(true);
                                handleAvtomaticConfirmRefuse();
                            }}
                        />
                        <Box sx={{ paddingTop: theme.spacing(5) }}>
                            <CustomButton
                                variantType="danger"
                                fullWidth
                                onClick={handleModalOpen}
                            >
                                {t("i18n_queue.refuse")}
                            </CustomButton>
                        </Box>
                    </>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: theme.spacing(2),
                        }}
                    >
                        <Typography
                            variant="h5"
                            sx={{ color: theme.palette.error.main }}
                        >
                            {t("i18n_queue.timeoutMessage")}
                        </Typography>
                        <CustomButton
                            variantType="primary"
                            sizeType="medium"
                            onClick={handleNavige}
                        >
                            {t("i18n_queue.signUp")}
                        </CustomButton>
                    </Box>
                )}
            </FormContainer>{" "}
            <ReusableModal
                open={isOpen}
                onClose={handleClose}
                width={340}
                showCloseButton={false}
            >
                <RefuseModal>
                    <Box>
                        <Typography variant="h4">
                            {t("i18n_queue.refuseQueue")}
                        </Typography>
                    </Box>
                    <Box sx={{ display: "flex", gap: theme.spacing(2) }}>
                        <CustomButton
                            variantType="primary"
                            onClick={handleConfirmRefuse}
                        >
                            {t("i18n_queue.confirm")}
                        </CustomButton>
                        <CustomButton
                            variantType="primary"
                            onClick={handleClose}
                        >
                            {t("i18n_queue.cancel")}
                        </CustomButton>
                    </Box>
                </RefuseModal>
            </ReusableModal>
        </BackgroundContainer>
    );
};

export default CallPage;
