import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/axiosInstance";
import Layout from "./Layout";

export default function RegisterVisit() {
    const [client, setClient] = useState(1);
    const [deliverer, setDeliverer] = useState(3);
    const [visited_at, setVisitedAt] = useState(new Date().toISOString());
    const [latitude_recorded, setLatitudeRecorded] = useState(49.281899);
    const [longitude_recorded, setLongitudeRecorded] = useState(-123.107605);
    const [is_productive, setIsProductive] = useState(false);
    const [notes, setNotes] = useState("Test visit");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const role = localStorage.getItem("role") || "";
    const name = localStorage.getItem("name") || "";

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const url = "visits/";

        api.post(url, { client, deliverer, visited_at, latitude_recorded, longitude_recorded, is_productive, notes })
            .then((response) => {
                alert("Visit registered successfully");
            })
            .catch((error) => {
                console.error(error);
                setError("Error registering visit: " + error.response.data);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    const renderForm = () => {
        return (
            <>
                <h2>Register Visit</h2>
                <form onSubmit={handleSubmit}>
                    {/* <input type="text" placeholder="Client" value={client} onChange={(e) => setClient(e.target.value)} />
                <input type="text" placeholder="Deliverer" value={deliverer} onChange={(e) => setDeliverer(e.target.value)} />
                <input type="text" placeholder="Visited at" value={visited_at} onChange={(e) => setVisitedAt(e.target.value)} />
                <input type="text" placeholder="Latitude recorded" value={latitude_recorded} onChange={(e) => setLatitudeRecorded(e.target.value)} />
                <input type="text" placeholder="Longitude recorded" value={longitude_recorded} onChange={(e) => setLongitudeRecorded(e.target.value)} />
                <input type="checkbox" name="is_productive" id="is_productive" checked={is_productive} onChange={(e) => setIsProductive(e.target.checked)} />
                <input type="text" placeholder="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} /> */}
                    <button type="submit">
                        {isLoading ? (
                            <>
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Registering...
                            </>
                        ) : (
                            <>
                                Register
                            </>
                        )}
                    </button>
                </form>
            </>
        );
    }

    return (
        <Layout role={role} name={name}>
            {renderForm()}
        </Layout>
    );
}