import { FC, useEffect, useState } from "react";
import React from "react"; // Для использования React.memo
import Button, { ButtonProps } from "@mui/material/Button";
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
    borderRadius: theme.shape.borderRadius * 4,
    paddingLeft: theme.spacing(0.5),
}));

const SwitcherButton = styled(
    ({ isActive, ...rest }: { isActive: boolean } & ButtonProps) => (
        <Button {...rest} />
    )
)(({ theme, isActive }) => ({
    minWidth: 10,
    height: "35px",
    width: "35px",
    borderRadius: theme.shape.borderRadius * 4,
    border: "none",
    color: isActive ? "white" : theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: "bold",
}));

const LanguageSwitcher: FC = () => {
    const [currentLanguage, setCurrentLanguage] = useState<string>(
        i18n.language || "ru"
    );

    useEffect(() => {
        const onLanguageChanged = (lng: string) => {
            setCurrentLanguage(lng);
        };

        i18n.on("languageChanged", onLanguageChanged);

        return () => {
            i18n.off("languageChanged", onLanguageChanged);
        };
    }, []);

    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
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
