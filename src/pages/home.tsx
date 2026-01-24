import { Navigate } from "react-router-dom";

export default function Home() {
    const access = localStorage.getItem("access");
    console.log(access);

    if (access === null) {
        return <Navigate to="/login" />
    }

    const role = localStorage.getItem("role") || "";
    const name = localStorage.getItem("name") || "";
    const id = localStorage.getItem("id") || "";

    const handleLogout = () => {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        localStorage.removeItem("role");
        localStorage.removeItem("name");
        localStorage.removeItem("id");
        window.location.href = "/login";
    }

    return (
        <div>
            <h1>Home</h1>
            <p>You are a {role} user</p>
            <p>Name: {name}</p>
            <p>ID: {id}</p>
            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}