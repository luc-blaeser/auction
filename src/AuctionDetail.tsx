import { useEffect, useState } from "react";
import { Bid } from "./declarations/backend/backend.did";
import { backend } from "./declarations/backend";
import { useParams } from "react-router-dom";

function AuctionDetail() {
    const { id } = useParams();
    const auctionId = BigInt(id as string);

    const [loading, setLoading] = useState(true);
    const [bidHistory, setBidHistory] = useState<Bid[]>([]);
    const [remainingTime, setRemainingTime] = useState(1);
    const [newPrice, setNewPrice] = useState(0);
    const [lastError, setLastError] = useState<string | undefined>(undefined);

    const fetchFromBackend = async () => {
        const history = await backend.getBidHistory(auctionId);
        setBidHistory(history);
        const time = await backend.getRemainingTime(auctionId);
        setRemainingTime(+time.toString());
        setLoading(false);
    };

    const currentBid = bidHistory.length == 0 ? undefined : bidHistory[bidHistory.length - 1];

    useEffect(() => {
        fetchFromBackend();
        setInterval(fetchFromBackend, 1000);
    }, [auctionId]);

    const makeNewOffer = async () => {
        try {
            await backend.makeBid(auctionId, BigInt(newPrice));
            setLastError(undefined);
        } catch (error: any) {
            const errorText: string = error.toString();
            if (errorText.indexOf("Price too low") >= 0) {
                setLastError("Price too low");
            } else if (errorText.indexOf("Auction closed") >= 0) {
                setLastError("Auction closed");
            } else {
                setLastError(errorText);
            }
            return;
        }
        fetchFromBackend();
    };

    const historyElements = bidHistory.map(bid =>
        <li key={+bid.price.toString()}>
            Bid {bid.price.toString()}$ after {bid.time.toString()} seconds by {bid.originator.toString()}
        </li>
    );

    if (newPrice == 0) {
        const proposedPrice = currentBid == null ? 1 : +currentBid.price.toString() + 1;
        setNewPrice(proposedPrice);
    }

    const isClosed = remainingTime == 0;

    const showAuction = () => {
        return (<>
            {isClosed &&
                <h2>Closed</h2>
            }
            {
                currentBid != null &&
                <div className="card">
                    <h2>{isClosed ? "Final Deal" : "Current Bid"}</h2>
                    <p>{currentBid.price.toString()}$ after {currentBid.time.toString()} seconds by {currentBid.originator.toString()}</p>
                </div>
            }
            {!isClosed &&
                <div className="card">
                    <h2>New Bid</h2>
                    <h3>Remaining time: {remainingTime}</h3>
                    <input type="text" value={newPrice} onChange={(e) => setNewPrice(parseInt(e.target.value))} />
                    <button onClick={makeNewOffer}>
                        Bid {newPrice}
                    </button>
                    {lastError != null &&
                        <p>{lastError}</p>
                    }
                </div>
            }
            <div className="card">
                <h2>History</h2>
                <ul>{historyElements}</ul>
            </div>
        </>);
    }

    return (
        <>
            {loading ?
                <div className="card">Loading</div>
                :
                showAuction()
            }
        </>
    );
}

export default AuctionDetail;
