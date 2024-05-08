
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { canisterId, createActor } from "../declarations/backend";
import { _SERVICE } from "../declarations/backend/backend.did";
import { AuthClient } from "@dfinity/auth-client";

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
    const client = await AuthClient.create();
    const identity = client.getIdentity();
    const backend = createActor(canisterId);
    (Actor.agentOf(backend) as HttpAgent).replaceIdentity(identity);
    return backend;
}
