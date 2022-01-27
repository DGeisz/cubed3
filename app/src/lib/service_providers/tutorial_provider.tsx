import React, { useContext, useState } from "react";

export enum TutorialPage {
    Welcome,
}

interface Tutorial {
    showTutorial: boolean;
    page: TutorialPage;
    nextPage: () => void;
}

const TutorialContext = React.createContext<Tutorial>({
    showTutorial: true,
    page: TutorialPage.Welcome,
    nextPage: () => {},
});

export function withTutorial<Props>(
    Component: React.FC<Props>
): React.FC<Props> {
    return function Comp(props) {
        const [showTutorial, setShowTutorial] = useState<boolean>(false);
        const [page, setPage] = useState<TutorialPage>(TutorialPage.Welcome);

        const nextPage = () => setPage((page) => page + 1);

        return (
            <TutorialContext.Provider
                value={{
                    showTutorial,
                    page,
                    nextPage,
                }}
            >
                <Component {...props} />
            </TutorialContext.Provider>
        );
    };
}

export function useTutorial() {
    return useContext(TutorialContext);
}
