import { FC, useState } from "react";
import React from "react"; // Для использования React.memo
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import i18n from "../i18n";
import { styled } from "@mui/material/styles";

const languages = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "kz", label: "KZ" },
];

const SwitcherBox = styled(Stack)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    gap: theme.spacing(0.2),
    width: theme.spacing(15),
    alignItems: "center",
    backgroundColor: theme.palette.gray.main,
    borderRadius: theme.shape.borderRadius * 4, // mui theme.shape.borderRadius
    paddingLeft: theme.spacing(0.5),
}));

const SwitcherButton = styled(Button)<{ isActive: boolean }>(
    ({ theme, isActive }) => ({
        minWidth: 10,
        height: "35px",
        width: "35px",
        borderRadius: "10px", // поправить !!!
        border: "none",
        color: isActive ? "white" : theme.palette.text.primary,
        fontSize: theme.typography.body1.fontSize,
        fontWeight: "bold",
    })
);

const LanguageSwitcher: FC = () => {
    const [currentLanguage, setCurrentLanguage] = useState<string>("ru");

    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
        setCurrentLanguage(language);
    };

    return (
        <SwitcherBox>
            {languages.map(({ code, label }) => (
                <SwitcherButton
                    key={code}
                    variant={
                        currentLanguage === code ? "contained" : "outlined"
                    }
                    onClick={() => changeLanguage(code)}
                    isActive={currentLanguage === code}
                >
                    {label}
                </SwitcherButton>
            ))}
        </SwitcherBox>
    );
};

export default React.memo(LanguageSwitcher);
