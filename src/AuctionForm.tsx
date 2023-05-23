import { useState } from "react";
import { backend } from "./declarations/backend";
import { useNavigate } from "react-router-dom";

function CreateAuction() {
    const [title, setTitle] = useState("Auction title");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState(Uint8Array.of());
    const [duration, setDuration] = useState(60);
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
        <div className="card">
            <h1>Start New Auction</h1>
            <h2>Title</h2>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
            <textarea rows={10} cols={100} value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="file" onChange={(e) => changeFile(e.target.files?.[0])} />
            <p>Duration: </p>
            <input type="text" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} />
            <button onClick={newAuction} disabled={saving}>
                Create new auction
            </button>
        </div>
    );
}

export default CreateAuction;
