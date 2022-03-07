import { useEffect } from "react";

export enum STUDIO_EVENT {
    CONFIRM_ADD_CUBE,
    CANCEL_CONFIRM_ADD_CUBE,
    CONFIRM_REMOVE_CUBE,
    CANCEL_CONFIRM_REMOVE_CUBE,
}

type EventHandler = (event: STUDIO_EVENT, data?: any) => void;
type EventHandlerId = number;
type EventPackage = {
    handler: EventHandler;
    id: EventHandlerId;
};

class StudioEvents {
    private handlers: EventPackage[] = [];

    addHandler = (handler: EventHandler): EventHandlerId => {
        const id = this._genHandlerId();
        this.handlers.push({
            id,
            handler,
        });

        return id;
    };

    removeHandler = (id: EventHandlerId) => {
        this.handlers = this.handlers.filter((h) => h.id !== id);
    };

    emit = (event: STUDIO_EVENT, data?: any) => {
        for (const h of this.handlers) {
            h.handler(event, data);
        }
    };

    private _genHandlerId = () => Math.random();
}

export const studioEventSystem = new StudioEvents();

export function useStudioEventHandler(handler: EventHandler, deps?: any[]) {
    useEffect(() => {
        const id = studioEventSystem.addHandler(handler);

        return () => studioEventSystem.removeHandler(id);
    }, deps);
}
