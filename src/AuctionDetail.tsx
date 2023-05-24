import './AuctionDetail.css';
import { useEffect, useState } from "react";
import { Bid, Item } from "./declarations/backend/backend.did";
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
        <tr key={+bid.price.toString()}>
            <td>
                {bid.price.toString()}$
            </td>
            <td>
                {bid.time.toString()} seconds
            </td>
            <td>
                {bid.originator.toString()}
            </td>
        </tr>
    );

    if (newPrice == 0) {
        const proposedPrice = currentBid == null ? 1 : +currentBid.price.toString() + 1;
        setNewPrice(proposedPrice);
    }

    const handleNewPriceInput = (input: string) => {
        try {
            const value = parseInt(input);
            if (value >= 0) {
                setNewPrice(value);
            }
        } catch (error) {
            console.error(error);
        }
    }

    const isClosed = remainingTime == 0;

    const showAuction = () => {
        return (<>
            {
                currentBid != null &&
                <div className="section">
                    <h2>{isClosed ? "Final Deal" : "Current Bid"}</h2>
                    <p className="main-price">{currentBid.price.toString()}$</p>
                    <p>by {currentBid.originator.toString()}</p>
                    <p>{currentBid.time.toString()} seconds after start</p>
                </div>
            }
            {!isClosed &&
                <div className="section">
                    <h2>New Bid</h2>
                    <h3>Remaining time: {remainingTime}</h3>
                    <div className="bid-form">
                        <input type="number" value={newPrice} onChange={(e) => handleNewPriceInput(e.target.value)} />
                        <button onClick={makeNewOffer}>
                            Bid {newPrice}
                        </button>
                    </div>
                    {lastError != null &&
                        <p className="error-message">{lastError}</p>
                    }
                </div>
            }
            <div className="section">
                <h2>History</h2>
                <table className='bid-table'>
                    <thead>
                        <tr>
                            <th>Price</th>
                            <th>Time after start</th>
                            <th>Originator</th>
                        </tr>
                    </thead>
                    <tbody>
                        {historyElements}
                    </tbody>
                </table>
            </div>
        </>);
    }

    return (
        <>
            {loading ?
                <div className="section">Loading</div>
                :
                showAuction()
            }
        </>
    );
}

export default AuctionDetail;
