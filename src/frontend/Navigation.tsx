import './Navigation.scss';
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { canisterId, createActor } from "../declarations/backend";

const backend = createActor(canisterId);

function Navigation() {
    const [principal, setPrincipal] = useState<Principal | undefined>(undefined);
    const [needLogin, setNeedLogin] = useState(true);

    const authClientPromise = AuthClient.create();

    const signIn = async () => {
        const authClient = await authClientPromise;

        const internetIdentityUrl = import.meta.env.PROD
            ? undefined :
            `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`;

            await new Promise((resolve) => {
                authClient.login({
                    identityProvider: internetIdentityUrl,
                    onSuccess: () => resolve(undefined),
                });
            });

        const identity = authClient.getIdentity();
        updateIdentity(identity);
        setNeedLogin(false);
    };

    const signOut = async () => {
        const authClient = await authClientPromise;
        await authClient.logout();
        const identity = authClient.getIdentity();
        updateIdentity(identity);
        setNeedLogin(true);
    }

    const updateIdentity = (identity: Identity) => {
        setPrincipal(identity.getPrincipal());
        (Actor.agentOf(backend) as HttpAgent).replaceIdentity(identity);
    }

    const setInitialIdentity = async () => {
        try {
            const authClient = await AuthClient.create();
            const identity = authClient.getIdentity();
            updateIdentity(identity);
            setNeedLogin(!await authClient.isAuthenticated());
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        setInitialIdentity();
    }, []);

    return (
        <>
            <div className="menu">
                <div className="menu-item">
                    <Link to="/">List auctions</Link>
                </div>
                <div className="menu-item">
                    <Link to="/newAuction">New auction</Link>
                </div>
                {needLogin ?
                    <div className="menu-item-button" onClick={signIn}>
                        Sign in
                    </div>
                    :
                    <div className="menu-item-button" onClick={signOut}>
                        Sign Out
                    </div>
                }
            </div>
            {!needLogin &&
                <div className="principal">
                    Logged in as: {principal?.toString()}
                </div>
            }
        </>
    );
}

export default Navigation;
