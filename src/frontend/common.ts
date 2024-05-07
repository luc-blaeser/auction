import { AuthClient } from "@dfinity/auth-client";
import { backend } from "../declarations/backend";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { _SERVICE } from "../declarations/backend/backend.did";

export function getImageSource(imageData: Uint8Array | number[]) {
    if (imageData != null) {
        const array = Uint8Array.from(imageData);
        const blob = new Blob([array.buffer], { type: 'image/png' });
        return URL.createObjectURL(blob);
    } else {
        return "";
    }
}

export async function getBackend(): Promise<ActorSubclass<_SERVICE>> {
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();
    (Actor.agentOf(backend) as HttpAgent).replaceIdentity(identity);
    return backend;
}
