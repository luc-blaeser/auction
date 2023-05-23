import { useEffect, useState } from 'react';
import './App.css';
import motokoLogo from './assets/motoko_moving.png';
import motokoShadowLogo from './assets/motoko_shadow.png';
import { backend } from './declarations/backend';
import { Principal } from "@dfinity/principal";
import { AuthClient, ERROR_USER_INTERRUPT } from "@dfinity/auth-client";
import { Actor, HttpAgent, Identity } from "@dfinity/agent";
import { Bid } from './declarations/backend/backend.did';
import AuctionForm from './AuctionForm';
import AuctionView from './AuctionView';

function App() {
  const [loading, setLoading] = useState(false);
  const [principal, setPrincipal] = useState<Principal | undefined>(undefined);
  const [needLogin, setNeedLogin] = useState(true);
  const [currentBid, setCurrentBid] = useState<Bid | undefined>(undefined);
  const [bidHistory, setBidHistory] = useState<Bid[]>([]);
  const [newPrice, setNewPrice] = useState(0);
  const [lastError, setLastError] = useState<string|undefined>(undefined);

  const fetchFromBackend = async () => {
    try {
      setLoading(true);
      const bid = await backend.currentBid();
      if (bid.length == 0) {
        setCurrentBid(undefined);
      } else {
        setCurrentBid(bid[0]);
      }
      const history = await backend.getBidHistory();
      setBidHistory(history);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromBackend();
    setInitialIdentity();
  }, []);

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
      setLoading(true);
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      updateIdentity(identity);
      setNeedLogin(!await authClient.isAuthenticated());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const makeNewOffer = async () => {
    console.log("Make new bid " + newPrice);
    try {
      await backend.makeBid(BigInt(newPrice));
      setLastError(undefined);
    } catch (error: any) {
      const errorText:string = error.toString();
      if (errorText.indexOf("Price too low") >= 0) {
        setLastError("Price too low");
      } else {
        setLastError(errorText);
      }
      return;
    }
    fetchFromBackend();
  };

  const historyElements = bidHistory.map(bid =>
    <li key={+bid.price.toString()}>
      Bid {bid.price.toString()}$ by {bid.originator.toString()}
    </li>
  );

  if (newPrice == 0) {
    const proposedPrice = currentBid == null ? 1 : +currentBid.price.toString() + 1;
    setNewPrice(proposedPrice);
  }

  return (
    <div className="App">
      <div>
        <a
          href="https://internetcomputer.org/docs/current/developer-docs/build/cdks/motoko-dfinity/motoko/"
          target="_blank"
        >
          <span className="logo-stack">
            <img
              src={motokoShadowLogo}
              className="logo motoko-shadow"
              alt="Motoko logo"
            />
            <img src={motokoLogo} className="logo motoko" alt="Motoko logo" />
          </span>
        </a>
      </div>
      <h1>Motoko Auction</h1>
      <div className="card">
        {needLogin ?
          <button onClick={signIn} style={{ opacity: loading ? 0.5 : 1 }}>
            Sign in
          </button>
          :
          <button onClick={signOut} style={{ opacity: loading ? 0.5 : 1 }}>
            Sign Out
          </button>
        }
        <p className="principal">Principal: {principal?.toString()}</p>
      </div>
      {
          currentBid != null &&
        <div className="card">
          <h2>Current Bid</h2>
          <p>{currentBid.price.toString()}$ by {currentBid.originator.toString()}</p>
        </div>
        }
      <div className="card">
        <h2>New Bid</h2>
        <input type="text" value={newPrice} onChange={(e) => setNewPrice(parseInt(e.target.value))} />
        <button onClick={makeNewOffer} style={{ opacity: loading ? 0.5 : 1 }}>
          Bid {newPrice}
        </button>
        {lastError != null &&
        <p>{lastError}</p>
        }
      </div>
      <div className="card">
        <h2>History</h2>
        <ul>{historyElements}</ul>
      </div>
      <AuctionForm/>
      <AuctionView/>
    </div>
  );
}

export default App;
