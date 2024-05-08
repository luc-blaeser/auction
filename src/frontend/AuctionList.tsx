import './AuctionList.scss';
import { useEffect, useState } from "react";
import { AuctionOverview } from "../declarations/backend/backend.did";
import { Link, useNavigate } from "react-router-dom";
import { backend, getImageSource } from './common';

function AuctionList() {
    const [list, setList] = useState<AuctionOverview[] | undefined>();
    const navigate = useNavigate();
    const navigationLink = (auctionId: number) => "/viewAuction/" + auctionId;

    const overviewList = list?.map(overview => {
        const id = +overview.id.toString();
        return (
            <li key={id} className="gallery-item" onClick={(_) => navigate(navigationLink(id))}>
                <div className="auction-title">{overview.item.title}</div>
                <div className="auction-description">{overview.item.description}</div>
                {!!overview.item.image?.length && <img src={getImageSource(overview.item.image)} alt="Auction image" />}
                <div className="gallery-item-link">
                    <Link to={navigationLink(id)}>Auction details</Link>
                </div>
            </li>
        );
    });

    const fetchAuction = async () => {
        const result = await backend.getOverviewList();
        setList(result);
    }

    useEffect(() => {
        fetchAuction();
    }, []);

    return (
        <>
            {list == null &&
                <div className="section">Loading</div>
            }
            {list?.length == 0 &&
                <div className="section">No auctions created so far</div>
            }
            {list != null && list.length > 0 &&
                <ul className="gallery">
                    {overviewList}
                </ul>
            }
        </>
    );
}

export default AuctionList;
