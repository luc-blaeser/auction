import { useEffect, useState } from "react";
import { Item } from "./declarations/backend/backend.did";
import { backend } from "./declarations/backend";
import { Link } from "react-router-dom";

function AuctionView() {
    const [items, setItems] = useState<Item[] | undefined>();

    const getImageSource = (item: Item) => {
        const data = item.image;
        if (data != null) {
            const array = Uint8Array.from(data);
            const blob = new Blob([array.buffer], { type: 'image/png' });
            return URL.createObjectURL(blob);
        } else {
            return "";    
        }
    }

    const list = items?.map(item => {
        const id = items?.indexOf(item);
        return (
            <li key={id}>
                <p>{item?.title}</p>
                <p>{item?.description}</p>
                <img src={getImageSource(item)}/>
                <Link to={"/viewAuction/"+id}>Auction details</Link>
            </li>
        );
    });

    const fetchAuction = async() => {
        let result = await backend.getItems();
        setItems(result);
    }

    useEffect(() => {
        fetchAuction();
    }, []);

    return (
        <ul>
            {list}
        </ul>
    );
}

export default AuctionView;
