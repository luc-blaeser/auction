import './AuctionForm.scss';
import { useState } from "react";
import { backend } from "../declarations/backend";
import { useNavigate } from "react-router-dom";

function CreateAuction() {
    const [title, setTitle] = useState("My Auction");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(Uint8Array.of());
    const [duration, setDuration] = useState(120);
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const newAuction = async () => {
        setSaving(true);
        try {
            let newAuction = {
                title,
                description,
                image,
            };
            await backend.newAuction(newAuction, BigInt(duration));
            navigate("/");
        } catch (error) {
            console.log(error);
        } finally {
            setSaving(false);
        }
    }

    const changeFile = async (file: File | undefined) => {
        let data = Uint8Array.of();
        if (file != null) {
            const stream = await file.stream();
            const reader = stream.getReader();
            while (true) {
                const part = await reader.read();
                const chunk = part.value;
                if (chunk == null) {
                    break;
                }
                data = concatUint8Arrays(data, chunk);
            }
        }
        setImage(data);
    }

    // TODO: Faster way of concatenation
    const concatUint8Arrays = (left: Uint8Array, right: Uint8Array): Uint8Array => {
        let temporary: number[] = [];
        for (let element of left) {
            temporary.push(element);
        }
        for (let element of right) {
            temporary.push(element);
        }
        return Uint8Array.from(temporary);
    }

    return (
        <>
            <h1>Start New Auction</h1>
            <div className="auction-form" style={{ opacity: saving ? 0.5 : 1 }}>
                <div className="auction-form-row">
                    <div className="auction-form-label">Title: </div>
                    <div className="auction-form-input">
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                </div>
                <div className="auction-form-row">
                    <div className="auction-form-label">Description: </div>
                    <div className="auction-form-input">
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>
                </div>
                <div className="auction-form-row">
                    <div className="auction-form-label">Picture (PNG only): </div>
                    <div className="auction-form-input">
                        <input type="file" accept='.png' onChange={(e) => changeFile(e.target.files?.[0])} />
                    </div>
                </div>
                <div className="auction-form-row">
                    <div className="auction-form-label">Duration: </div>
                    <div className="auction-form-input">
                        <input type="range" min={60} max={600} value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} />
                        <p>{duration} seconds</p>
                    </div>
                </div>
                <div className="auction-form-footer">
                    <button className='auction-form-button' onClick={newAuction} disabled={saving}>
                        Create new auction
                    </button>
                </div>
            </div>
        </>
    );
}

export default CreateAuction;
