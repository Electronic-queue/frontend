import { useCallback, useEffect, useRef, useState } from "react";

import { Box, Container, Paper, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

import {
    cancelActiveRequest,
    checkLastRecordByIin,
    createRecord,
    createReview,
    getQueueTypes,
    getServicesByQueueType,
} from "./api/registerApi";

import {
    ActiveRequest,
    QueueType,
    RegisterStep,
    Service,
    StudentFormData,
} from "./model/types";

import {
    ActiveRequestCard,
    DepartmentServiceForm,
    IinCheckForm,
    PersonalDataForm,
    ServiceReviewForm,
} from "./ui";

const IIN_STORAGE_KEY = "newRegisterIin";

const ACTIVE_REQUEST_REFRESH_INTERVAL = 3000;
const CREATED_ANIMATION_DURATION = 1500;
const CREATED_REQUEST_RETRY_DELAY = 1000;
const CREATED_REQUEST_MAX_ATTEMPTS = 5;

const initialStudentForm: StudentFormData = {
    lastName: "",
    firstName: "",
    surname: "",
};

type RequestDisplayMode = "active" | "review" | "hidden";

interface ApplyRequestOptions {
    openFormWhenUnavailable: boolean;
    showReviewForCompleted: boolean;
}

/**
 * 1 — ожидает в очереди;
 * 3 — пользователя вызывают;
 * 4 — пользователя обслуживают;
 * 5 — обслуживание завершено;
 * 6 — перенаправлен;
 * 7 — отклонён.
 */
const getRequestDisplayMode = (statusId: number): RequestDisplayMode => {
    switch (statusId) {
        case 1:
        case 3:
        case 4:
            return "active";

        case 5:
            return "review";

        case 6:
        case 7:
        default:
            return "hidden";
    }
};

const wait = (milliseconds: number) =>
    new Promise<void>((resolve) => {
        window.setTimeout(resolve, milliseconds);
    });

const CreatedRequestAnimation = () => {
    const { t } = useTranslation();
    return (
        <Box
            sx={{
                minHeight: 290,
                px: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
            }}
        >
            <Box
                sx={{
                    position: "relative",
                    width: 92,
                    height: 92,
                    mb: 2.5,
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "50%",
                        backgroundColor: "#dcfce7",
                        animation:
                            "createdRequestPulse 1.2s ease-in-out infinite",

                        "@keyframes createdRequestPulse": {
                            "0%": {
                                transform: "scale(0.82)",
                                opacity: 0.55,
                            },
                            "50%": {
                                transform: "scale(1.15)",
                                opacity: 0.15,
                            },
                            "100%": {
                                transform: "scale(0.82)",
                                opacity: 0.55,
                            },
                        },
                    }}
                />

                <Box
                    sx={{
                        position: "absolute",
                        inset: 9,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        background:
                            "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                        boxShadow: "0 14px 32px rgba(34, 197, 94, 0.3)",
                        animation: "createdRequestAppear 0.45s ease-out both",

                        "@keyframes createdRequestAppear": {
                            from: {
                                transform: "scale(0.35)",
                                opacity: 0,
                            },
                            to: {
                                transform: "scale(1)",
                                opacity: 1,
                            },
                        },
                    }}
                >
                    <Typography
                        sx={{
                            color: "#ffffff",
                            fontSize: 43,
                            fontWeight: 900,
                            lineHeight: 1,
                            transform: "translateY(-1px)",
                        }}
                    >
                        ✓
                    </Typography>
                </Box>
            </Box>

            <Typography
                sx={{
                    fontSize: 24,
                    fontWeight: 850,
                    color: "#111827",
                    lineHeight: 1.25,
                    fontFamily: '"Roboto", "Arial", sans-serif',
                }}
            >
                {t("newRegisterPage.createdAnimation.title")}
            </Typography>

            <Typography
                sx={{
                    mt: 0.8,
                    maxWidth: 280,
                    fontSize: 14,
                    lineHeight: 1.5,
                    color: "#64748b",
                }}
            >
                {t("newRegisterPage.createdAnimation.description")}
            </Typography>

            <Box
                sx={{
                    mt: 2.7,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                }}
            >
                {[0, 1, 2].map((index) => (
                    <Box
                        key={index}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            backgroundColor: "#3b82f6",
                            animation:
                                "createdRequestDot 1.2s ease-in-out infinite",
                            animationDelay: `${index * 0.15}s`,

                            "@keyframes createdRequestDot": {
                                "0%, 80%, 100%": {
                                    transform: "translateY(0)",
                                    opacity: 0.3,
                                },
                                "40%": {
                                    transform: "translateY(-7px)",
                                    opacity: 1,
                                },
                            },
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
};

export const NewRegisterPage = () => {
    const { t } = useTranslation();
    const [step, setStep] = useState<RegisterStep>("check-iin");

    const [iin, setIin] = useState("");

    const [studentForm, setStudentForm] =
        useState<StudentFormData>(initialStudentForm);

    /**
     * Token находится внутри activeRequest.
     * В localStorage токен не сохраняется.
     */
    const [activeRequest, setActiveRequest] = useState<ActiveRequest | null>(
        null
    );

    const [reviewRequest, setReviewRequest] = useState<ActiveRequest | null>(
        null
    );

    const [queueTypes, setQueueTypes] = useState<QueueType[]>([]);

    const [services, setServices] = useState<Service[]>([]);

    const [selectedQueueTypeId, setSelectedQueueTypeId] = useState("");

    const [selectedServiceId, setSelectedServiceId] = useState("");

    const [isCheckingIin, setIsCheckingIin] = useState(false);

    const [isQueueTypesLoading, setIsQueueTypesLoading] = useState(false);

    const [isServicesLoading, setIsServicesLoading] = useState(false);

    const [isCreating, setIsCreating] = useState(false);

    const [isCancelling, setIsCancelling] = useState(false);

    const [isReviewSubmitting, setIsReviewSubmitting] = useState(false);

    const [showCreatedAnimation, setShowCreatedAnimation] = useState(false);

    const [iinError, setIinError] = useState("");

    const [registrationError, setRegistrationError] = useState("");

    const [cancelError, setCancelError] = useState("");

    const [reviewError, setReviewError] = useState("");

    /**
     * Защита от повторной стартовой проверки
     * в React StrictMode.
     */
    const hasAutoCheckedRef = useRef(false);

    /**
     * Звук изменения статуса.
     */
    const notificationAudioRef = useRef<HTMLAudioElement | null>(null);

    /**
     * Последний известный статус.
     * Нужен, чтобы звук играл только при изменении.
     */
    const previousStatusIdRef = useRef<number | null>(null);

    const activeRecordId = activeRequest?.recordId ?? null;

    /**
     * Инициализация аудиофайла.
     */
    useEffect(() => {
        const audio = new Audio("/sounds/new-req.wav");

        audio.volume = 1;
        audio.preload = "auto";

        notificationAudioRef.current = audio;

        return () => {
            audio.pause();
            audio.src = "";

            notificationAudioRef.current = null;
        };
    }, []);

    /**
     * Разблокировка аудио после первого действия пользователя.
     *
     * Некоторые браузеры не дают проигрывать звук,
     * пока пользователь не нажал или не коснулся страницы.
     */
    useEffect(() => {
        const unlockAudio = async () => {
            const audio = notificationAudioRef.current;

            if (!audio) {
                return;
            }

            try {
                audio.volume = 0;
                await audio.play();

                audio.pause();
                audio.currentTime = 0;
                audio.volume = 1;
            } catch (error) {
                console.warn("Не удалось заранее разблокировать звук:", error);
            }

            window.removeEventListener("pointerdown", unlockAudio);

            window.removeEventListener("keydown", unlockAudio);

            window.removeEventListener("touchstart", unlockAudio);
        };

        window.addEventListener("pointerdown", unlockAudio, {
            once: true,
        });

        window.addEventListener("keydown", unlockAudio, {
            once: true,
        });

        window.addEventListener("touchstart", unlockAudio, {
            once: true,
        });

        return () => {
            window.removeEventListener("pointerdown", unlockAudio);

            window.removeEventListener("keydown", unlockAudio);

            window.removeEventListener("touchstart", unlockAudio);
        };
    }, []);

    const playStatusNotification = useCallback(async () => {
        const audio = notificationAudioRef.current;

        if (!audio) {
            return;
        }

        try {
            audio.pause();
            audio.currentTime = 0;
            audio.volume = 1;

            await audio.play();
        } catch (error) {
            console.warn("Браузер заблокировал звук уведомления:", error);
        }
    }, []);

    const clearRegistrationData = useCallback(() => {
        previousStatusIdRef.current = null;

        setStep("check-iin");
        setIin("");

        setStudentForm(initialStudentForm);

        setActiveRequest(null);
        setReviewRequest(null);

        setQueueTypes([]);
        setServices([]);

        setSelectedQueueTypeId("");
        setSelectedServiceId("");

        setIinError("");
        setRegistrationError("");
        setCancelError("");
        setReviewError("");

        setIsCheckingIin(false);
        setIsQueueTypesLoading(false);
        setIsServicesLoading(false);
        setIsCreating(false);
        setIsCancelling(false);
        setIsReviewSubmitting(false);

        setShowCreatedAnimation(false);
    }, []);

    const resetRegistrationState = useCallback(() => {
        localStorage.removeItem(IIN_STORAGE_KEY);
        clearRegistrationData();
    }, [clearRegistrationData]);

    const hideUnavailableRequest = useCallback(() => {
        localStorage.removeItem(IIN_STORAGE_KEY);

        previousStatusIdRef.current = null;

        setActiveRequest(null);
        setReviewRequest(null);

        setIin("");
        setStudentForm(initialStudentForm);

        setQueueTypes([]);
        setServices([]);

        setSelectedQueueTypeId("");
        setSelectedServiceId("");

        setIinError("");
        setCancelError("");
        setRegistrationError("");
        setReviewError("");

        setIsReviewSubmitting(false);

        setStep("check-iin");
    }, []);

    /**
     * Запоминает статус без звука.
     *
     * Используется при первом показе заявки.
     */
    const rememberInitialStatus = useCallback((statusId: number) => {
        previousStatusIdRef.current = statusId;
    }, []);

    /**
     * Проверяет изменение статуса и включает звук.
     */
    const notifyIfStatusChanged = useCallback(
        (newStatusId: number) => {
            const previousStatusId = previousStatusIdRef.current;

            if (previousStatusId !== null && previousStatusId !== newStatusId) {
                void playStatusNotification();
            }

            previousStatusIdRef.current = newStatusId;
        },
        [playStatusNotification]
    );

    const applyRequestResponse = useCallback(
        (data: ActiveRequest, options: ApplyRequestOptions) => {
            const { openFormWhenUnavailable, showReviewForCompleted } = options;

            const displayMode = getRequestDisplayMode(data.statusId);

            /**
             * Первое отображение статуса.
             * Здесь звук не запускаем.
             */
            rememberInitialStatus(data.statusId);

            if (displayMode === "active") {
                setReviewRequest(null);
                setReviewError("");

                setActiveRequest(data);
                setStep("check-iin");

                return;
            }

            if (displayMode === "review") {
                setActiveRequest(null);

                if (showReviewForCompleted) {
                    setReviewRequest(data);
                    setReviewError("");
                    setStep("review");

                    return;
                }

                /**
                 * При ручной проверке старый статус 5
                 * разрешает создать новую заявку.
                 */
                localStorage.removeItem(IIN_STORAGE_KEY);

                previousStatusIdRef.current = null;

                setReviewRequest(null);
                setReviewError("");
                setStep("personal-data");

                return;
            }

            /**
             * Статусы 6 и 7.
             */
            localStorage.removeItem(IIN_STORAGE_KEY);

            previousStatusIdRef.current = null;

            setActiveRequest(null);
            setReviewRequest(null);
            setReviewError("");

            if (openFormWhenUnavailable) {
                setStep("personal-data");
                return;
            }

            setIin("");
            setStep("check-iin");
        },
        [rememberInitialStatus]
    );

    const checkIin = useCallback(
        async (
            checkedIin: string,
            options?: {
                saveToStorage?: boolean;
                openFormWhenEmpty?: boolean;
                showReviewForCompleted?: boolean;
            }
        ) => {
            const {
                saveToStorage = false,
                openFormWhenEmpty = true,
                showReviewForCompleted = false,
            } = options ?? {};

            if (!/^\d{12}$/.test(checkedIin)) {
                setIinError(t("newRegisterPage.errors.invalidIin"));
                return;
            }

            try {
                setIsCheckingIin(true);

                setIinError("");
                setCancelError("");
                setReviewError("");

                setActiveRequest(null);
                setReviewRequest(null);

                previousStatusIdRef.current = null;

                if (saveToStorage) {
                    localStorage.setItem(IIN_STORAGE_KEY, checkedIin);
                }

                const data = await checkLastRecordByIin(checkedIin);

                console.log("Последняя заявка пользователя:", data);

                if (data) {
                    applyRequestResponse(data, {
                        openFormWhenUnavailable: openFormWhenEmpty,
                        showReviewForCompleted,
                    });

                    return;
                }

                localStorage.removeItem(IIN_STORAGE_KEY);

                previousStatusIdRef.current = null;

                if (openFormWhenEmpty) {
                    setStep("personal-data");
                    return;
                }

                setIin("");
                setStep("check-iin");
            } catch (error) {
                console.error("Ошибка проверки ИИН:", error);

                setIinError(
                    error instanceof Error
                        ? error.message
                        : t("newRegisterPage.errors.checkIin")
                );
            } finally {
                setIsCheckingIin(false);
            }
        },
        [applyRequestResponse, t]
    );

    const loadCreatedRequest = useCallback(
        async (checkedIin: string): Promise<ActiveRequest | null> => {
            for (
                let attempt = 1;
                attempt <= CREATED_REQUEST_MAX_ATTEMPTS;
                attempt += 1
            ) {
                const data = await checkLastRecordByIin(checkedIin);

                if (data) {
                    return data;
                }

                if (attempt < CREATED_REQUEST_MAX_ATTEMPTS) {
                    await wait(CREATED_REQUEST_RETRY_DELAY);
                }
            }

            return null;
        },
        []
    );

    /**
     * Проверка сохранённого ИИН при загрузке.
     */
    useEffect(() => {
        if (hasAutoCheckedRef.current) {
            return;
        }

        hasAutoCheckedRef.current = true;

        const savedIin = localStorage.getItem(IIN_STORAGE_KEY)?.trim() ?? "";

        if (!savedIin) {
            return;
        }

        if (!/^\d{12}$/.test(savedIin)) {
            localStorage.removeItem(IIN_STORAGE_KEY);

            return;
        }

        setIin(savedIin);

        void checkIin(savedIin, {
            saveToStorage: false,
            openFormWhenEmpty: false,
            showReviewForCompleted: true,
        });
    }, [checkIin]);

    /**
     * Polling активной заявки.
     */
    useEffect(() => {
        if (!activeRecordId || !iin) {
            return;
        }

        let isStopped = false;
        let isRequestInProgress = false;
        let timeoutId: number | null = null;

        const clearPollingTimeout = () => {
            if (timeoutId !== null) {
                window.clearTimeout(timeoutId);
                timeoutId = null;
            }
        };

        const scheduleNextRequest = (
            delay = ACTIVE_REQUEST_REFRESH_INTERVAL
        ) => {
            if (isStopped) {
                return;
            }

            clearPollingTimeout();

            timeoutId = window.setTimeout(() => {
                void refreshActiveRequest();
            }, delay);
        };

        const refreshActiveRequest = async () => {
            if (
                isStopped ||
                isRequestInProgress ||
                document.visibilityState !== "visible"
            ) {
                return;
            }

            try {
                isRequestInProgress = true;

                const data = await checkLastRecordByIin(iin);

                if (isStopped) {
                    return;
                }

                console.log("Обновление активной заявки:", data);

                if (!data) {
                    isStopped = true;
                    clearPollingTimeout();

                    hideUnavailableRequest();

                    return;
                }

                const displayMode = getRequestDisplayMode(data.statusId);

                /**
                 * Проверяем изменение статуса.
                 * Именно здесь будет проигрываться звук.
                 */
                notifyIfStatusChanged(data.statusId);

                if (displayMode === "active") {
                    setActiveRequest(data);
                    return;
                }

                isStopped = true;
                clearPollingTimeout();

                if (displayMode === "review") {
                    setActiveRequest(null);
                    setReviewRequest(data);
                    setReviewError("");
                    setStep("review");

                    return;
                }

                /**
                 * Статусы 6 и 7.
                 */
                hideUnavailableRequest();
            } catch (error) {
                /**
                 * При временной ошибке карточку
                 * не скрываем.
                 */
                console.error("Ошибка обновления заявки:", error);
            } finally {
                isRequestInProgress = false;

                if (!isStopped && document.visibilityState === "visible") {
                    scheduleNextRequest();
                }
            }
        };

        const handleVisibilityChange = () => {
            if (isStopped) {
                return;
            }

            if (document.visibilityState === "hidden") {
                clearPollingTimeout();
                return;
            }

            /**
             * После возвращения во вкладку
             * сразу выполняем запрос.
             */
            clearPollingTimeout();

            if (!isRequestInProgress) {
                void refreshActiveRequest();
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        if (document.visibilityState === "visible") {
            scheduleNextRequest();
        }

        return () => {
            isStopped = true;

            clearPollingTimeout();

            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [activeRecordId, iin, hideUnavailableRequest, notifyIfStatusChanged]);

    const handleIinChange = (value: string) => {
        const onlyNumbers = value.replace(/\D/g, "").slice(0, 12);

        previousStatusIdRef.current = null;

        setIin(onlyNumbers);

        setIinError("");
        setCancelError("");
        setReviewError("");

        setActiveRequest(null);
        setReviewRequest(null);
    };

    /**
     * Ручная проверка ИИН.
     *
     * Старый statusId 5 позволяет
     * создать новую заявку.
     */
    const handleCheckIin = async () => {
        await checkIin(iin, {
            saveToStorage: true,
            openFormWhenEmpty: true,
            showReviewForCompleted: false,
        });
    };

    const handleStudentFormChange = (
        field: keyof StudentFormData,
        value: string
    ) => {
        setStudentForm((previousState) => ({
            ...previousState,
            [field]: value,
        }));
    };

    const handlePersonalDataContinue = async () => {
        if (!studentForm.lastName.trim() || !studentForm.firstName.trim()) {
            return;
        }

        try {
            setIsQueueTypesLoading(true);
            setRegistrationError("");

            const departments = await getQueueTypes();

            setQueueTypes(departments);
            setStep("department-service");
        } catch (error) {
            console.error("Ошибка получения подразделений:", error);

            setRegistrationError(
                error instanceof Error
                    ? error.message
                    : t("newRegisterPage.errors.loadDepartments")
            );
        } finally {
            setIsQueueTypesLoading(false);
        }
    };

    const handleQueueTypeChange = async (queueTypeId: string) => {
        setSelectedQueueTypeId(queueTypeId);
        setSelectedServiceId("");

        setServices([]);
        setRegistrationError("");

        if (!queueTypeId) {
            return;
        }

        try {
            setIsServicesLoading(true);

            const receivedServices = await getServicesByQueueType(queueTypeId);

            setServices(receivedServices);
        } catch (error) {
            console.error("Ошибка получения услуг:", error);

            setRegistrationError(
                error instanceof Error
                    ? error.message
                    : t("newRegisterPage.errors.loadServices")
            );
        } finally {
            setIsServicesLoading(false);
        }
    };

    const handleCreateRecord = async () => {
        if (!selectedServiceId) {
            setRegistrationError(t("newRegisterPage.errors.selectService"));

            return;
        }

        if (!studentForm.lastName.trim() || !studentForm.firstName.trim()) {
            setRegistrationError(
                t("newRegisterPage.errors.fillRequiredFields")
            );

            return;
        }

        try {
            setIsCreating(true);
            setRegistrationError("");

            await createRecord({
                firstName: studentForm.firstName.trim(),
                lastName: studentForm.lastName.trim(),
                surname: studentForm.surname.trim(),
                iin,
                serviceId: selectedServiceId,
                isCreatedByEmployee: true,
                createdBy: null,
            });

            localStorage.setItem(IIN_STORAGE_KEY, iin);

            setShowCreatedAnimation(true);

            await wait(CREATED_ANIMATION_DURATION);

            const createdRequest = await loadCreatedRequest(iin);

            if (!createdRequest) {
                throw new Error(t("newRegisterPage.errors.ticketNotLoaded"));
            }

            console.log("Созданная заявка:", createdRequest);

            setShowCreatedAnimation(false);

            applyRequestResponse(createdRequest, {
                openFormWhenUnavailable: false,
                showReviewForCompleted: true,
            });
        } catch (error) {
            console.error("Ошибка создания заявки:", error);

            setShowCreatedAnimation(false);

            setRegistrationError(
                error instanceof Error
                    ? error.message
                    : t("newRegisterPage.errors.createRequest")
            );
        } finally {
            setIsCreating(false);
        }
    };

    const handleCancelRequest = async () => {
        if (!activeRequest) {
            setCancelError(t("newRegisterPage.errors.activeRequestNotFound"));

            return;
        }

        if (!activeRequest.token) {
            setCancelError(t("newRegisterPage.errors.cancelTokenMissing"));

            return;
        }

        try {
            setIsCancelling(true);
            setCancelError("");

            await cancelActiveRequest(
                activeRequest.recordId,
                activeRequest.token
            );

            localStorage.removeItem(IIN_STORAGE_KEY);

            clearRegistrationData();
        } catch (error) {
            console.error("Ошибка отказа от очереди:", error);

            setCancelError(
                error instanceof Error
                    ? error.message
                    : t("newRegisterPage.errors.cancelRequest")
            );

            throw error;
        } finally {
            setIsCancelling(false);
        }
    };

    const handleSubmitReview = async (rating: number, comment: string) => {
        if (!reviewRequest) {
            setReviewError(t("newRegisterPage.errors.reviewRequestNotFound"));

            return;
        }

        try {
            setIsReviewSubmitting(true);
            setReviewError("");

            await createReview({
                recordId: reviewRequest.recordId,
                rating,
                content: comment,
            });

            console.log("Оценка успешно отправлена:", {
                recordId: reviewRequest.recordId,
                rating,
                content: comment,
            });

            localStorage.removeItem(IIN_STORAGE_KEY);

            clearRegistrationData();
        } catch (error) {
            console.error("Ошибка отправки оценки:", error);

            setReviewError(
                error instanceof Error
                    ? error.message
                    : t("newRegisterPage.errors.submitReview")
            );
        } finally {
            setIsReviewSubmitting(false);
        }
    };

    const handleSkipReview = () => {
        localStorage.removeItem(IIN_STORAGE_KEY);

        setReviewError("");

        clearRegistrationData();
    };

    const handleBackToIin = () => {
        localStorage.removeItem(IIN_STORAGE_KEY);

        previousStatusIdRef.current = null;

        setStudentForm(initialStudentForm);

        setRegistrationError("");
        setIinError("");
        setReviewError("");

        setStep("check-iin");
    };

    const handleBackToPersonalData = () => {
        setRegistrationError("");

        setSelectedQueueTypeId("");
        setSelectedServiceId("");

        setServices([]);

        setStep("personal-data");
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                backgroundColor: "#f3f6fb",
                py: 3,
            }}
        >
            <Container
                maxWidth={false}
                sx={{
                    width: "100%",
                    maxWidth: 430,
                    px: 2,
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        p: 0,
                        overflow: "hidden",
                        borderRadius: "28px",
                        border: "1px solid #e6ebf2",
                        backgroundColor: "#ffffff",
                        boxShadow: "0 18px 50px rgba(15, 23, 42, 0.08)",
                    }}
                >
                    {showCreatedAnimation && (
                        <Box sx={{ p: 2.5 }}>
                            <CreatedRequestAnimation />
                        </Box>
                    )}

                    {!showCreatedAnimation && activeRequest && (
                        <ActiveRequestCard
                            data={activeRequest}
                            isCancelling={isCancelling}
                            cancelError={cancelError}
                            onCancelRequest={handleCancelRequest}
                            onCheckAnotherIin={resetRegistrationState}
                        />
                    )}

                    {!showCreatedAnimation &&
                        !activeRequest &&
                        step === "review" &&
                        reviewRequest && (
                            <Box sx={{ p: 2.5 }}>
                                <ServiceReviewForm
                                    data={reviewRequest}
                                    isSubmitting={isReviewSubmitting}
                                    error={reviewError}
                                    onSubmit={handleSubmitReview}
                                    onSkip={handleSkipReview}
                                />
                            </Box>
                        )}

                    {!showCreatedAnimation &&
                        !activeRequest &&
                        step === "check-iin" && (
                            <Box sx={{ p: 2.5 }}>
                                <IinCheckForm
                                    iin={iin}
                                    error={iinError}
                                    isLoading={isCheckingIin}
                                    onIinChange={handleIinChange}
                                    onCheck={handleCheckIin}
                                />
                            </Box>
                        )}

                    {!showCreatedAnimation &&
                        !activeRequest &&
                        step === "personal-data" && (
                            <Box sx={{ p: 2.5 }}>
                                <PersonalDataForm
                                    form={studentForm}
                                    isLoading={isQueueTypesLoading}
                                    onChange={handleStudentFormChange}
                                    onSubmit={handlePersonalDataContinue}
                                    onBack={handleBackToIin}
                                />
                            </Box>
                        )}

                    {!showCreatedAnimation &&
                        !activeRequest &&
                        step === "department-service" && (
                            <Box sx={{ p: 2.5 }}>
                                <DepartmentServiceForm
                                    queueTypes={queueTypes}
                                    services={services}
                                    selectedQueueTypeId={selectedQueueTypeId}
                                    selectedServiceId={selectedServiceId}
                                    isQueueTypesLoading={isQueueTypesLoading}
                                    isServicesLoading={isServicesLoading}
                                    isCreating={isCreating}
                                    error={registrationError}
                                    onQueueTypeChange={handleQueueTypeChange}
                                    onServiceChange={setSelectedServiceId}
                                    onSubmit={handleCreateRecord}
                                    onBack={handleBackToPersonalData}
                                />
                            </Box>
                        )}
                </Paper>
            </Container>
        </Box>
    );
};
