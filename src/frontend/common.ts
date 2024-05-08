
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { canisterId, createActor } from "../declarations/backend";

export function getImageSource(imageData: Uint8Array | number[]) {
    if (imageData != null) {
        const array = Uint8Array.from(imageData);
        const blob = new Blob([array.buffer], { type: 'image/png' });
        return URL.createObjectURL(blob);
    } else {
        return "";
    }
}

export const backend = createActor(canisterId);
    
export function setActorIdentity(identity: Identity) {
    (Actor.agentOf(backend) as HttpAgent).replaceIdentity(identity);
}
