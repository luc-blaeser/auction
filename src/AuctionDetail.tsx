import './AuctionDetail.css';
import { useEffect, useState } from "react";
import { AuctionDetails, Item } from "./declarations/backend/backend.did";
import { backend } from "./declarations/backend";
import { useParams } from "react-router-dom";
import { getImageSource } from './common';

function AuctionDetail() {
    const { id } = useParams();
    const auctionId = BigInt(id as string);

    const [auctionDetails, setAuctionDetails] = useState<AuctionDetails | undefined>();
    const [newPrice, setNewPrice] = useState(0);
    const [lastError, setLastError] = useState<string | undefined>(undefined);
    const [saving, setSaving] = useState(false);

    const fetchFromBackend = async () => {
        const result = await backend.getAuctionDetails(auctionId);
        setAuctionDetails(result);
    };

    useEffect(() => {
        fetchFromBackend();
        setInterval(fetchFromBackend, 1000);
    }, [auctionId]);

    const makeNewOffer = async () => {
        try {
            setSaving(true);
            await backend.makeBid(auctionId, BigInt(newPrice));
            setLastError(undefined);
            setNewPrice(newPrice + 1);
            fetchFromBackend();
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
        } finally {
            setSaving(false);
        }
    };

    const historyElements = auctionDetails?.bidHistory.map(bid =>
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

    const getLastBid = () => {
        if (auctionDetails == null) {
            return null;
        }
        let history = auctionDetails.bidHistory;
        if (history.length == 0) {
            return null;
        }
        return history[history.length - 1];
    }

    if (newPrice == 0) {
        const currentBid = getLastBid();
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

    const displayItem = (item: Item) => {
        return (
            <>
                <h1>{item.title}</h1>
                <div className="auction-overview">
                    <div className="overview-description">{item.description}</div>
                    <div className="overview-image"><img src={getImageSource(item.image)} /></div>
                </div>
            </>
        );
    }

    const showHistory = () => {
        return (<div className="section">
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
        );
    }

    const showAuction = () => {
        if (auctionDetails == null) {
            throw Error("undefined auction");
        }
        const remainingTime = auctionDetails.remainingTime;
        const currentBid = getLastBid();
        return (
            <>
                {displayItem(auctionDetails.item)}
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
                        <h3>Remaining time: {remainingTime.toString()}</h3>
                        <div className="bid-form">
                            <input type="number" value={newPrice} onChange={(e) => handleNewPriceInput(e.target.value)} />
                            <button onClick={makeNewOffer} disabled={saving} style={{ opacity: saving ? 0.5 : 1 }}>
                                Bid {newPrice}
                            </button>
                        </div>
                        {lastError != null &&
                            <p className="error-message">{lastError}</p>
                        }
                    </div>
                }
                {showHistory()}
            </>
        );
    }

    const isClosed = auctionDetails != null && +auctionDetails.remainingTime.toString() == 0;

    return (
        <>
            {auctionDetails == null ?
                <div className="section">Loading</div>
                :
                showAuction()
            }
        </>
    );
}

export default AuctionDetail;
