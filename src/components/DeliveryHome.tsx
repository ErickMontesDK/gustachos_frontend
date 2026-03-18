import { MapPin, Store, CalendarCheck, Clock, CheckCircle2, Navigation, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from './Layout';
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { api } from '../api/axiosInstance';
import { formatDatetime } from '../utils/formatDatetime';

interface RecentActivity {
    id: number;
    type: string;
    client_name: string;
    time: string;
    status: string;
}

export default function DeliveryHome() {
    const navigate = useNavigate();
    const delivererName = localStorage.getItem("name") || "Deliverer";
    const [todayStats, setTodayStats] = useState({
        visited_clients_today: 0,
        productive_visits_today: 0,
        registered_clients_today: 0,
        recent_activity: [] as RecentActivity[]
    });

    useEffect(() => {
        const fetchTodayStats = async () => {
            const response = await api.get(`/users/me/dashboard/`);
            const business = localStorage.getItem("business_data");
            const timezone = business ? JSON.parse(business).time_zone : "America/Mexico_City";
            const locale = business ? JSON.parse(business).locale : "es-ES";
            const data = response.data;
            data.recent_activity.forEach((activity: RecentActivity) => {
                const { formattedDate, formattedTime } = formatDatetime(activity.time, timezone, locale);
                activity.time = `${formattedDate} ${formattedTime}`;
            });
            setTodayStats(data);
        };
        fetchTodayStats();
    }, []);


    return (
        <div className="container-fluid py-4 animate-fade-in" style={{ maxWidth: '800px' }}>

            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark">Hello, {delivererName} 👋</h2>
                    <p className="text-muted mb-0 d-flex align-items-center">
                        <CalendarCheck size={16} className="me-2" />
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>



            {/* Quick Actions (Primary Focus for Driver) */}
            <h5 className="fw-bold text-secondary mb-3">Quick Actions</h5>
            <div className="row g-3 mb-5">
                <div className="col-6">
                    <div
                        className="card h-100 border-0 shadow-sm text-center py-4 action-card"
                        style={{ cursor: 'pointer', borderRadius: '16px', backgroundColor: '#eef2ff', transition: 'transform 0.2s' }}
                        onClick={() => navigate('/register-visit')}
                    >
                        <div className="card-body p-0 d-flex flex-column align-items-center justify-content-center">
                            <MapPin size={40} className="text-primary mb-3" />
                            <h6 className="fw-bold text-primary mb-0">Register<br />Visit</h6>
                        </div>
                    </div>
                </div>
                <div className="col-6">
                    <div
                        className="card h-100 border-0 shadow-sm text-center py-4 action-card"
                        style={{ cursor: 'pointer', borderRadius: '16px', backgroundColor: '#f0fdf4', transition: 'transform 0.2s' }}
                        onClick={() => navigate('/register-client')}
                    >
                        <div className="card-body p-0 d-flex flex-column align-items-center justify-content-center">
                            <Store size={40} className="text-success mb-3" />
                            <h6 className="fw-bold text-success mb-0">Register<br />Client</h6>
                        </div>
                    </div>
                </div>
            </div>

            {/* Today's Summary */}
            <h5 className="fw-bold text-secondary mb-3">Today's Summary</h5>
            <div className="row g-3 mb-5">
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-0">
                            <h3 className="fw-bold text-dark mb-0">{todayStats.visited_clients_today}</h3>
                            <small className="text-muted">Visits</small>
                        </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-0">
                            <h3 className="fw-bold text-success mb-0">{todayStats.productive_visits_today}</h3>
                            <small className="text-muted">Productive</small>
                        </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3" style={{ borderRadius: '12px' }}>
                        <div className="card-body p-0">
                            <h3 className="fw-bold text-primary mb-0">{todayStats.registered_clients_today}</h3>
                            <small className="text-muted">New</small>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <h5 className="fw-bold text-secondary mb-3 d-flex align-items-center">
                <Activity size={18} className="me-2" /> Recent Activity
            </h5>
            <div className="card border-0 shadow-sm" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                <ul className="list-group list-group-flush">
                    {todayStats.recent_activity && todayStats.recent_activity.length > 0 ? (
                        todayStats.recent_activity.map((activity, index) => (
                            <li key={index} className="list-group-item d-flex justify-content-between align-items-center p-3 border-0 border-bottom border-light shadow-sm-hover transition-all">
                                <div className="d-flex align-items-center">
                                    <div className={`rounded-circle p-2 me-3 ${activity.status === 'productive' || activity.status === 'new' ? 'bg-success bg-opacity-10 text-success' : 'bg-danger bg-opacity-10 text-danger'}`}>
                                        {activity.type === 'visit' ? <CheckCircle2 size={20} /> : <Store size={20} />}
                                    </div>
                                    <div>
                                        <h6 className="mb-0 fw-bold">{activity.client_name}</h6>
                                        <small className="text-muted">
                                            {activity.type === 'visit'
                                                ? (activity.status === 'productive' ? 'Productive visit' : 'Unproductive visit')
                                                : 'New client registered'}
                                        </small>
                                    </div>
                                </div>
                                <div className="text-end">
                                    <small className="text-muted d-block"><Clock size={12} className="me-1" />{activity.time}</small>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item p-4 text-center text-muted border-0">
                            No recent activity found today.
                        </li>
                    )}
                </ul>

            </div>

        </div>
    );
}

