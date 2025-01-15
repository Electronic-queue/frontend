import { PropsWithChildren } from 'react';
import { styled } from '@mui/material/styles';
import Stack from '@mui/material/Stack';

export interface IPageProps {
  fullHeight?: boolean;
}

const PageContainer = styled(Stack)(({ theme }) => ({
  margin: '0 auto', // Центрируем по горизонтали
  padding: theme.spacing(3),
  flexGrow: 1,
  flexShrink: 1,
  height: 'calc(100vh - 85.5px)',
  alignItems: 'center',
  maxWidth: '1200px', // Ограничиваем ширину
}));

const Page = ({ children }: PropsWithChildren<IPageProps>) => (
  <PageContainer spacing={3}>{children}</PageContainer>
);

export default Page;
