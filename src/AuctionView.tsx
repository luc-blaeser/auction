import { useEffect, useState } from "react";
import { Auction } from "./declarations/backend/backend.did";
import { backend } from "./declarations/backend";

function AuctionView() {
    const [auction, setAuction] = useState<Auction | undefined>();

    const fetchAuction = async() => {
        let result = await backend.getAuction();
        console.log("RESULT" + result);
        if (result.length == 0) {
            setAuction(undefined);
        } else {
            setAuction(result[0]);
        }
    }

    const getImageSource = () => {
        const data = auction?.image;
        if (data != null) {
            const array = Uint8Array.from(data);
            const blob = new Blob([array.buffer], { type: 'image/png' });
            return URL.createObjectURL(blob);
        } else {
            return "";    
        }
    }

    useEffect(() => {
        fetchAuction();
    }, []);

    return (
        <div className="card">
            <h2>View Auction</h2>
            <p>{auction?.title}</p>
            <p>{auction?.description}</p>
            <img src={getImageSource()}/>
        </div>
    );
}

export default AuctionView;
