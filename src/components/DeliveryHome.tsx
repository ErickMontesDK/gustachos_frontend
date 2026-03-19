import { MapPin, Store, CalendarCheck, Clock, CheckCircle2, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { api } from '../api/axiosInstance';

interface RecentActivity {
    id: number;
    type: string;
    title: string;
    timestamp: string;
    description: string;
    metadata: {
        is_productive?: boolean;
        is_valid?: boolean;
        user_name: string;
    }
}

export default function DeliveryHome() {
    const navigate = useNavigate();
    const delivererName = localStorage.getItem("name") || "Deliverer";
    const businessDataStr = localStorage.getItem("business_data");
    const businessData = businessDataStr ? JSON.parse(businessDataStr) : null;
    const timezone = businessData?.time_zone || "America/Mexico_City";
    const today = new Date();

    const [todayStats, setTodayStats] = useState({
        visited_clients_today: 0,
        productive_visits_today: 0,
        registered_clients_today: 0,
        recent_activity: [] as RecentActivity[]
    });

    const formatTimestamp = (ts: string) => {
        try {
            const date = new Date(ts);
            const now = new Date();

            const fmt = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const isToday = fmt.format(date) === fmt.format(now);

            if (isToday) {
                return date.toLocaleTimeString('en-US', {
                    timeZone: timezone,
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } else {
                return date.toLocaleDateString('en-US', {
                    timeZone: timezone,
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            }
        } catch (e) {
            return ts;
        }
    };

    useEffect(() => {
        const fetchTodayStats = async () => {
            try {
                const response = await api.get(`/users/me/dashboard/`);
                setTodayStats(response.data);
            } catch (error) {
                console.error("Error fetching stats: ", error);
            }
        };
        fetchTodayStats();
    }, []);


    return (
        <div className="container-fluid py-4 animate-fade-in" style={{ maxWidth: '800px' }}>

            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark">Hello, {delivererName} 👋</h2>
                    <p className="text-muted mb-0 d-flex align-items-center">
                        <CalendarCheck size={16} className="me-2" />
                        {today.toLocaleDateString('en-US', {
                            timeZone: timezone,
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
            </div>

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
            <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                <ul className="list-group list-group-flush">
                    {todayStats.recent_activity && todayStats.recent_activity.length > 0 ? (
                        todayStats.recent_activity.map((item) => (
                            <li key={item.id} className="list-group-item p-4 border-0 border-bottom border-light d-flex justify-content-between align-items-start shadow-sm-hover transition-all">
                                <div className="d-flex align-items-start">
                                    <div className={`p-3 rounded-2xl me-4 mt-1 ${item.metadata.is_valid === false ? 'bg-danger bg-opacity-10 text-danger' :
                                        item.type === 'visit' ? 'bg-indigo-50 text-primary' : 'bg-green-50 text-success'
                                        }`} style={{ borderRadius: '18px', backgroundColor: item.type === 'visit' ? '#eef2ff' : '#f0fdf4' }}>
                                        {item.metadata.is_valid === false ? <AlertTriangle size={24} /> :
                                            item.type === 'visit' ? <CheckCircle2 size={24} /> : <Store size={24} />}
                                    </div>
                                    <div>
                                        <h5 className="mb-1 fw-bold text-dark" style={{ fontSize: '1.15rem' }}>
                                            {item.title}
                                        </h5>
                                        <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                            {item.type === 'client' ? (
                                                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>
                                                    New client registered
                                                </span>
                                            ) : (
                                                <>
                                                    {item.metadata.is_valid === false ? (
                                                        <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>
                                                            <AlertTriangle size={12} className="me-1" /> Invalid visit
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>
                                                            Visit registered
                                                        </span>
                                                    )}
                                                    {item.metadata.is_productive && (
                                                        <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-1" style={{ fontSize: '0.75rem' }}>
                                                            <CheckCircle2 size={12} className="me-1" /> Productive
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                        {item.description && (
                                            <p className="mb-0 text-muted mt-2 p-2 bg-light rounded-3" style={{ fontSize: '0.9rem', borderLeft: '3px solid #dee2e6', fontStyle: 'italic' }}>
                                                <Activity size={14} className="me-2 opacity-50" />
                                                {item.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="text-end ms-3">
                                    <small className="text-muted d-block whitespace-nowrap"><Clock size={12} className="me-1" />{formatTimestamp(item.timestamp)}</small>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="list-group-item p-5 text-center text-muted border-0 bg-light bg-opacity-50">
                            <Activity size={32} className="mb-3 opacity-25" />
                            <p className="mb-0 fw-medium">No recent activity detected today.</p>
                            <small>Time to hit the field!</small>
                        </li>
                    )}
                </ul>
            </div>

        </div>
    );
}

