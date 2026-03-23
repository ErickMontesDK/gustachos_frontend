import { MapPin, Store, Clock, CheckCircle2, Activity, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { useState, useEffect } from 'react';
import { getDeliveryStats } from '../features/users/api/usersService';

import { DashboardProps, RecentActivity } from '../pages/home';



export default function DeliveryHome({ formatTimestamp }: DashboardProps) {
    const navigate = useNavigate();

    const [todayStats, setTodayStats] = useState({
        visited_clients_today: 0,
        productive_visits_today: 0,
        registered_clients_today: 0,
        recent_activity: [] as RecentActivity[]
    });

    useEffect(() => {
        getDeliveryStats()
            .then((data) => {
                setTodayStats(data);
            })
            .catch((error) => {
                console.error("Error fetching delivery stats:", error);
            });
    }, []);

    return (
        <>
            <h5 className="fw-bold text-secondary mb-3">Quick Actions</h5>
            <section className="row g-3 mb-5">

                <div className="col-6">
                    <div
                        className="card h-100 border-0 shadow-sm text-center py-4 action-card kpi-bg-info"
                        onClick={() => navigate('/register-visit')}
                    >
                        <div className="card-body p-0 d-flex flex-column align-items-center justify-content-center">
                            <MapPin size={40} className="text-info mb-3" />
                            <h6 className="fw-bold text-info mb-0">Register<br />Visit</h6>
                        </div>
                    </div>
                </div>

                <div className="col-6">
                    <div
                        className="card h-100 border-0 shadow-sm text-center py-4 action-card kpi-bg-success"
                        onClick={() => navigate('/register-client')}
                    >
                        <div className="card-body p-0 d-flex flex-column align-items-center justify-content-center">
                            <Store size={40} className="text-success mb-3" />
                            <h6 className="fw-bold text-success mb-0">Register<br />Client</h6>
                        </div>
                    </div>
                </div>
            </section>

            {/* Summary */}
            <h5 className="fw-bold text-secondary mb-3">Today's Summary</h5>
            <section className="row g-3 mb-5">
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3 summary-card">
                        <div className="card-body p-0">
                            <h3 className="fw-bold text-dark mb-0">{todayStats.visited_clients_today}</h3>
                            <small className="text-muted">Visits</small>
                        </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3 summary-card">
                        <div className="card-body p-0">
                            <h3 className="fw-bold text-success mb-0">{todayStats.productive_visits_today}</h3>
                            <small className="text-muted">Productive</small>
                        </div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card border-0 shadow-sm text-center py-3 summary-card">
                        <div className="card-body p-0">
                            <h3 className="fw-bold text-primary mb-0">{todayStats.registered_clients_today}</h3>
                            <small className="text-muted">New Clients</small>
                        </div>
                    </div>
                </div>
            </section>

            {/* Recent Activity */}
            <h5 className="fw-bold text-secondary mb-3 d-flex align-items-center">
                <Activity size={18} className="me-2" /> Recent Activity
            </h5>
            <div className="activity-card-list mb-4">
                {todayStats.recent_activity && todayStats.recent_activity.length > 0 ? (
                    todayStats.recent_activity.map((item) => (
                        <div key={item.id} className="activity-item">
                            <div className="text-decoration-none d-flex align-items-start">
                                <div className={`activity-icon-container me-3 ${item.metadata.is_valid === false ? 'activity-icon-danger' :
                                    item.type === 'visit' ? 'activity-icon-primary' : 'activity-icon-success'
                                    }`}>
                                    {item.metadata.is_valid === false ? <AlertTriangle size={20} /> :
                                        item.type === 'visit' ? <CheckCircle2 size={20} /> : <Store size={20} />}
                                </div>
                                <div className="flex-grow-1">
                                    <div className="d-flex justify-content-between align-items-start mb-1">
                                        <h6 className="mb-0 fw-bold text-dark">{item.title}</h6>
                                        <small className="text-muted d-flex align-items-center">
                                            <Clock size={12} className="me-1" />
                                            {formatTimestamp(item.timestamp)}
                                        </small>
                                    </div>

                                    <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
                                        {item.type === 'client' ? (
                                            <span className="badge-custom bg-success-subtle text-success">New Registration</span>
                                        ) : (
                                            <>
                                                {item.metadata.is_valid === false ? (
                                                    <span className="badge-custom bg-danger-subtle text-danger">Invalid Visit</span>
                                                ) : (
                                                    <span className="badge-custom bg-primary-subtle text-primary">Visit Recorded</span>
                                                )}
                                                {item.metadata.is_productive && (
                                                    <span className="badge-custom bg-success-subtle text-success">Productive</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {item.description && (
                                        <div className="description-box italic">
                                            <Activity size={14} className="me-2 opacity-50" />
                                            {item.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-5 text-center text-muted border-0 bg-light bg-opacity-50">
                        <Activity size={32} className="mb-3 opacity-25" />
                        <p className="mb-0 fw-medium">No recent activity detected today.</p>
                        <small>Time to hit the field!</small>
                    </div>
                )}
            </div>
        </>
    );
}

