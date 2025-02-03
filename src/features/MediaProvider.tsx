import { FC, PropsWithChildren, createContext } from "react";
import useMedia, { IMedia } from "src/hooks/useMedia";

export const MediaContext = createContext<IMedia | null>(null);

const MediaProvider: FC<PropsWithChildren> = ({ children }) => {
    const media = useMedia();

    return (
        <MediaContext.Provider value={media}>{children}</MediaContext.Provider>
    );
};

export default MediaProvider;
