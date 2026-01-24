import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();

    const access = localStorage.getItem("access");
    if (access) {
        navigate("/home");
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(username, password);

        axios.post("http://localhost:8000/api/login/", { username, password })
            .then((response) => {
                console.log(response.data);
                localStorage.setItem("access", response.data.access);
                localStorage.setItem("refresh", response.data.refresh);

                const decodedToken: any = jwtDecode(response.data.access);
                localStorage.setItem("role", decodedToken.role.toLowerCase());
                localStorage.setItem("name", decodedToken.name);
                localStorage.setItem("id", decodedToken.user_id);
                console.log(decodedToken);

                navigate("/home");

            })
            .catch((error) => {
                console.error(error);
            });
    }


    return (
        <div>
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Usuario</label>
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                <label htmlFor="password">Contraseña</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="submit">Login</button>
            </form>
        </div>
    );
};