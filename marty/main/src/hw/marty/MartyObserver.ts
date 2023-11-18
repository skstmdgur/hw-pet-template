import type { RICConnEvent, RICUpdateEvent } from "@robotical/ricjs";

export interface MartyObservable {
    // Subscribe
    subscribe: (observer: MartyObserver, topics:Array<string>) => void; 

    // Unsubscribe
    unsubscribe: (observer: MartyObserver) => void;
    // Publish
    publish: (eventType: string, eventEnum: RICConnEvent | RICUpdateEvent, eventName: string, eventData: string | object | null | undefined) => void;
}

export interface MartyObserver {
    // Callback
    notify:(eventType: string, eventEnum: RICConnEvent | RICUpdateEvent, eventName: string, eventData: string | object | null | undefined) => void;
}
