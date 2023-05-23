import { Link } from "react-router-dom";
import './Navigation.css';
import { useEffect, useState } from "react";
import { Principal } from "@dfinity/principal";
import { AuthClient } from "@dfinity/auth-client";
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { backend } from "./declarations/backend";

function Navigation() {
    const [principal, setPrincipal] = useState<Principal | undefined>(undefined);
    const [needLogin, setNeedLogin] = useState(true);

    const signIn = async () => {
        const authClient = await AuthClient.create();

        const internetIdentityUrl = `http://localhost:4943/?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`;

        if (!await authClient.isAuthenticated()) {
            await new Promise((resolve) => {
                authClient.login({
                    identityProvider: internetIdentityUrl,
                    onSuccess: () => resolve(undefined),
                });
            });
        }

        const identity = authClient.getIdentity();
        updateIdentity(identity);
        setNeedLogin(false);
    };

    const signOut = async () => {
        const authClient = await AuthClient.create();
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
        <div className="menu">
            <div className="card">
                {needLogin ?
                    <button onClick={signIn}>
                        Sign in
                    </button>
                    :
                    <>
                        <p className="principal">Account: {principal?.toString()}</p>
                        <button onClick={signOut}>
                            Sign Out
                        </button>
                    </>
                }
            </div>
            <div className="menu-item">
                <Link to="/">List auctions</Link>
            </div>
            <div className="menu-item">
                <Link to="/newAuction">New auction</Link>
            </div>
        </div>
    );
}

export default Navigation;
