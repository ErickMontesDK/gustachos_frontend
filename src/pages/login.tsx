import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { User, Lock, LogIn } from 'lucide-react';
import '../styles/login.css';
import { publicApi } from '../api/axiosInstance';

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const access = localStorage.getItem("access");
        if (access) {
            navigate("/home");
        }
    }, [navigate]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const url = "login/";

        publicApi.post(url, { username, password })
            .then((response) => {
                localStorage.setItem("access", response.data.access);
                localStorage.setItem("refresh", response.data.refresh);

                const decodedToken: any = jwtDecode(response.data.access); //TODO: check the type of the token
                localStorage.setItem("role", decodedToken.role.toLowerCase());
                localStorage.setItem("name", decodedToken.name);
                localStorage.setItem("id", decodedToken.user_id);

                navigate("/home");
            })
            .catch((error) => {
                console.error(error);
                setError("Wrong username or password");
            })
            .finally(() => {
                setIsLoading(false);
            });
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <img src="./images/logo-simple.png" alt="Logo" className="login-logo" />
                    <h2 className="fw-bold mb-0">EchoRoute</h2>
                    <p className="small text-secondary mb-0 opacity-75 mt-2">Login to continue</p>
                </div>
                <div className="login-body">
                    {error && (
                        <div className="alert alert-danger small py-2 d-flex align-items-center mb-4">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-secondary text-uppercase" htmlFor="username">User</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <User size={18} className="text-secondary" />
                                </span>
                                <input
                                    type="text"
                                    className="form-control bg-light border-start-0 py-2"
                                    id="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-secondary text-uppercase" htmlFor="password">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-end-0">
                                    <Lock size={18} className="text-secondary" />
                                </span>
                                <input
                                    type="password"
                                    className="form-control bg-light border-start-0 py-2"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100 py-2 fw-bold d-flex align-items-center justify-content-center gap-2 mt-2"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                            ) : (
                                <>
                                    <LogIn size={18} />
                                    Login
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
