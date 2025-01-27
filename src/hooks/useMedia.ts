import { useMediaQuery, useTheme } from "@mui/material";

export interface IMedia {
    lessThanMobile: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

const useMedia = (): IMedia => {
    const theme = useTheme();
    const lessThanMobile = useMediaQuery(theme.breakpoints.between("sm", "xs"));
    const isMobile = useMediaQuery(theme.breakpoints.between("xs", "md"));
    const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg"));
    const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
    return { lessThanMobile, isMobile, isTablet, isDesktop };
};

export default useMedia;
