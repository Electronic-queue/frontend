import { FC, useEffect, useState } from "react";
import Button, { ButtonProps } from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import i18n from "../i18n";
import { styled } from "@mui/material/styles";
import React from "react";

const languages = [
    { code: "en", label: "EN" },
    { code: "ru", label: "RU" },
    { code: "kz", label: "KZ" },
];

const SwitcherBox = styled(Stack)(({ theme }) => ({
    flexDirection: "row",
    gap: theme.spacing(0.5),
    width: "fit-content",
    alignItems: "center",
    backgroundColor: theme.palette.gray.main,
    borderRadius: theme.shape.borderRadius * 4,
    padding: theme.spacing(1, 2),
}));

const SwitcherButton = styled(
    ({ isActive, ...rest }: { isActive: boolean } & ButtonProps) => (
        <Button {...rest} data-active={isActive} />
    )
)(({ theme, isActive }) => ({
    minWidth: 10,
    height: "35px",
    width: "35px",
    borderRadius: theme.shape.borderRadius * 3,
    border: "none",
    color: isActive ? "white" : theme.palette.text.primary,
    fontSize: theme.typography.body1.fontSize,
    fontWeight: "bold",
}));

const MemoizedSwitcherButton = React.memo(SwitcherButton);

const LanguageSwitcher: FC = () => {
    const [currentLanguage, setCurrentLanguage] = useState<string>(
        i18n.language || "ru"
    );

    useEffect(() => {
        const onLanguageChanged = (lng: string) => setCurrentLanguage(lng);
        i18n.on("languageChanged", onLanguageChanged);
        return () => i18n.off("languageChanged", onLanguageChanged);
    }, []);

    const changeLanguage = (language: string) => {
        i18n.changeLanguage(language);
    };

    return (
        <SwitcherBox>
            {languages.map(({ code, label }) => (
                <MemoizedSwitcherButton
                    key={code}
                    variant={
                        currentLanguage === code ? "contained" : "outlined"
                    }
                    onClick={() => changeLanguage(code)}
                    isActive={currentLanguage === code}
                >
                    {label}
                </MemoizedSwitcherButton>
            ))}
        </SwitcherBox>
    );
};

export default React.memo(LanguageSwitcher);
