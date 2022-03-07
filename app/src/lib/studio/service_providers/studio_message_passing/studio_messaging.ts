export enum STUDIO_MESSAGES {}

type Handler = (msg: STUDIO_MESSAGES) => void;
type HandlerId = number;
type HandlerPackage = {
    handler: Handler;
    id: HandlerId;
};

class StudioMessaging {
    handlers: Handler[] = [];
}

export const studioMessaging = new StudioMessaging();
