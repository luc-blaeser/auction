import { useEffect, useState } from "react";
import { Bid } from "./declarations/backend/backend.did";
import { backend } from "./declarations/backend";
import { useParams } from "react-router-dom";

function AuctionDetail() {
    const { id } = useParams();
    console.log("DETAIL ID " + id);

    const auctionId = BigInt(id as string);

    const [bidHistory, setBidHistory] = useState<Bid[]>([]);
    const [newPrice, setNewPrice] = useState(0);
    const [lastError, setLastError] = useState<string | undefined>(undefined);

    const fetchFromBackend = async () => {
        const history = await backend.getBidHistory(auctionId);
        setBidHistory(history);
    };

    const currentBid = bidHistory.length == 0 ? undefined : bidHistory[bidHistory.length - 1];

    useEffect(() => {
        fetchFromBackend();
    }, [auctionId]);

    const makeNewOffer = async () => {
        try {
            await backend.makeBid(auctionId, BigInt(newPrice));
            setLastError(undefined);
        } catch (error: any) {
            const errorText: string = error.toString();
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
        <>
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
                <button onClick={makeNewOffer}>
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
        </>
    );
}

export default AuctionDetail;
