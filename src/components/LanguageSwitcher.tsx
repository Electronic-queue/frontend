import { useState } from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import i18n from '../i18n';
import { styled } from '@mui/material';

const languages = [
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RU' },
  { code: 'kz', label: 'KZ' },
];

const SwitcherBox = styled(Stack)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  gap: theme.spacing(0.2),
  alignItems: 'center',
  backgroundColor: theme.palette.gray?.main,
  borderRadius: '30px',
  padding: theme.spacing(1),
}));

const SwitcherButton = styled(Button)<{ isActive: boolean }>(
  ({ theme, isActive }) => ({
    minWidth: 50,
    borderRadius: '10px',
    border: 'none',
    color: isActive ? 'white' : theme.palette.text.primary,
    fontSize: '12px',
    fontWeight: 'bold',
    '&:hover': {
      backgroundColor: isActive
        ? theme.palette.primary.light
        : theme.palette.secondary.light,
      color: 'white',
    },
  })
);

const LanguageSwitcher = () => {
  const [currentLanguage, setCurrentLanguage] = useState('ru');

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    setCurrentLanguage(language);
  };

  return (
    <SwitcherBox>
      {languages.map(({ code, label }) => (
        <SwitcherButton
          key={code}
          variant={currentLanguage === code ? 'contained' : 'outlined'}
          onClick={() => changeLanguage(code)}
          isActive={currentLanguage === code}
        >
          {label}
        </SwitcherButton>
      ))}
    </SwitcherBox>
  );
};

export default LanguageSwitcher;
