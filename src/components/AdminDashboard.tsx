import { useState, useEffect } from 'react';
import {
    Users, MapPin, Store, Briefcase, Activity, CalendarCheck, Clock,
    TrendingUp, ChevronRight,
    ShieldCheck, Navigation, AlertTriangle, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { formatDatetime } from '../utils/formatDatetime';
import { getDashboardStats } from '../features/users/api/usersService';

// Format from recent activities responses
interface RecentActivity {
    id: number;
    type: string;
    title: string;
    timestamp: string;
    description: string;
    metadata: {
        is_productive?: boolean;
        is_valid?: boolean;
        client_code?: string;
        user_name: string;
    }
}

export default function AdminDashboard() {
    const navigate = useNavigate();
    const role = localStorage.getItem("role")?.toLowerCase();
    const businessDataStr = localStorage.getItem("business_data");
    const businessData = businessDataStr ? JSON.parse(businessDataStr) : null;
    const timezone = businessData?.time_zone || "America/Mexico_City";
    const locale = businessData?.locale || "en-US";
    const today = new Date();

    const [stats, setStats] = useState({
        visits_today: 0,
        productive_percentage: 0,
        valid_visits_percentage: 0,
        active_deliverers: 0,
        registered_clients_today: 0,
        unvalidated_visits_today: 0,
        recent_activity: [] as RecentActivity[]
    });

    const formatTimestamp = (timestamp: string) => {
        try {
            const date = new Date(timestamp);
            const now = new Date();

            const formattedDate = new Intl.DateTimeFormat('en-CA', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });

            const isToday = formattedDate.format(date) === formattedDate.format(now);

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
            return timestamp;
        }
    };

    useEffect(() => {
        getDashboardStats()
            .then(data => {
                setStats(data);
            })
            .catch(error => {
                console.error("Error fetching stats: ", error);
            });
    }, []);

    const kpiElements = [
        { label: 'Total Visits', value: stats.visits_today.toString(), icon: <MapPin size={20} />, bgClass: 'kpi-bg-primary', iconColor: 'text-primary', url: `/visits-data?date_from=${today.toISOString().split('T')[0]}` },
        { label: 'Productivity Rate', value: `${stats.productive_percentage}%`, icon: <TrendingUp size={20} />, bgClass: 'kpi-bg-success', iconColor: 'text-success', url: `/visits-data?is_productive=true&date_from=${today.toISOString().split('T')[0]}` },
        { label: 'Validation Rate', value: `${stats.valid_visits_percentage}%`, icon: <ShieldCheck size={20} />, bgClass: 'kpi-bg-danger', iconColor: 'text-danger', url: `/visits-data?is_valid=false&date_from=${today.toISOString().split('T')[0]}` },
        { label: 'Active Deliverers', value: stats.active_deliverers.toString(), icon: <Navigation size={20} />, bgClass: 'kpi-bg-warning', iconColor: 'text-warning', url: `/users-data` },
    ];

    return (
        <main className="container-fluid py-4 animate-fade-in dashboard-container">

            <header className="d-flex justify-content-between align-items-center mb-5">
                <div>
                    <h2 className="fw-bold mb-1 text-dark">Admin Dashboard</h2>
                    <p className="text-muted mb-0 d-flex align-items-center small">
                        <CalendarCheck size={14} className="me-2" />
                        {today.toLocaleDateString(locale, {
                            timeZone: timezone,
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <div>
                    <span className="badge-custom bg-primary bg-opacity-10 text-primary border border-primary border-opacity-10">
                        {role}
                    </span>
                </div>
            </header>


            <section className="row g-3 mb-5">
                {kpiElements.map((kpi, index) => (
                    <a href={kpi.url} className="col-6 col-md-3 kpi-card" key={index}>
                        <div className="card border-0 shadow-sm h-100 kpi-card-inner">
                            <div className="card-body p-3">
                                <div className={`kpi-icon-wrapper ${kpi.iconColor} ${kpi.bgClass}`}>
                                    {kpi.icon}
                                </div>
                                <h3 className="fw-bold mb-0">{kpi.value}</h3>
                                <small className="text-muted fw-medium">{kpi.label}</small>
                            </div>
                        </div>
                    </a>
                ))}
            </section>

            <div className="row g-4">
                {/* Activity Feed */}
                <section className="col-12 col-lg-8 order-2 order-lg-1">
                    <h5 className="fw-bold text-secondary mb-4 d-flex align-items-center">
                        <Activity size={18} className="me-2" /> Field Activity Feed
                    </h5>

                    <div className="activity-card-list">
                        {stats.recent_activity.length > 0 ? (

                            stats.recent_activity.map((item) => (
                                <div key={item.id} className="activity-item">

                                    <a
                                        href={`/${item.type === 'visit' ? 'visits-data?date_from=' + formatDatetime(item.timestamp).formattedDate : 'clients-data?code=' + item.metadata.client_code}`}
                                        className="text-decoration-none d-flex align-items-start">
                                        <div className={`activity-icon-container me-3 ${item.metadata.is_valid === false ? 'activity-icon-danger' :
                                            item.type === 'visit' ? 'activity-icon-primary' : 'activity-icon-success'
                                            }`}>

                                            {item.metadata.is_valid === false ? <AlertTriangle size={20} /> :
                                                item.type === 'visit' ? <MapPin size={20} /> : <UserPlus size={20} />}
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
                                                <span className="text-muted small">by <strong>{item.metadata.user_name}</strong></span>
                                            </div>

                                            {item.description && (
                                                <div className="description-box">
                                                    {item.description}
                                                </div>
                                            )}
                                        </div>
                                    </a>
                                </div>
                            ))
                        ) : (
                            <div className="p-5 text-center text-muted">
                                <Activity size={32} className="mb-3 opacity-25" />
                                <p className="mb-0 fw-medium">No activity to show today.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Sidebar */}
                <aside className="col-12 col-lg-4 order-1 order-lg-2">

                    {/* Daily performance */}
                    <div className="mb-5">
                        <h5 className="fw-bold text-secondary mb-3">Daily Performance</h5>
                        <div className="row g-3">

                            <div className="col-12 col-md-6 col-lg-12">
                                <a href="/clients-data" className="daily-performance card border-0 shadow-sm p-3 text-decoration-none kpi-bg-info radius-lg">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="p-2 rounded-3 bg-white text-info me-3">
                                            <UserPlus size={20} />
                                        </div>
                                        <div>
                                            <h4 className="fw-bold mb-0 text-dark">{stats.registered_clients_today}</h4>
                                            <small className="text-muted">Prospecctions Today</small>
                                        </div>
                                    </div>
                                </a>
                            </div>

                            <div className="col-12 col-md-6 col-lg-12">
                                <a href="/visits-data?is_valid=false" className="daily-performance card border-0 shadow-sm p-3 text-decoration-none kpi-bg-danger radius-lg">
                                    <div className="d-flex align-items-center mb-2">
                                        <div className="p-2 rounded-3 bg-white text-danger me-3">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <div>
                                            <h4 className="fw-bold mb-0 text-dark">{stats.unvalidated_visits_today}</h4>
                                            <small className="text-muted">Invalid Incidents</small>
                                        </div>
                                    </div>
                                </a>
                            </div>

                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mb-4">
                        <h5 className="fw-bold text-secondary mb-3">Quick Actions</h5>
                        <div className="d-grid gap-2">

                            <button className="quick-btn" onClick={() => navigate('/visits-data')}>
                                <div className="d-flex align-items-center">
                                    <MapPin size={18} className="text-success me-3" />
                                    <span className="fw-bold">Visits Registry</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>

                            <button className="quick-btn" onClick={() => navigate('/clients-data')}>
                                <div className="d-flex align-items-center">
                                    <Store size={18} className="text-info me-3" />
                                    <span className="fw-bold">Clients Base</span>
                                </div>
                                <ChevronRight size={18} />
                            </button>

                            {role === 'admin' && (
                                <>
                                    <button className="quick-btn" onClick={() => navigate('/users-data')}>
                                        <div className="d-flex align-items-center">
                                            <Users size={18} className="text-primary me-3" />
                                            <span className="fw-bold">Users Management</span>
                                        </div>
                                        <ChevronRight size={18} />
                                    </button>
                                    <button className="quick-btn" onClick={() => navigate('/business-data')}>
                                        <div className="d-flex align-items-center">
                                            <Briefcase size={18} className="text-dark me-3" />
                                            <span className="fw-bold">System Settings</span>
                                        </div>
                                        <ChevronRight size={18} />
                                    </button>
                                </>
                            )}

                        </div>
                    </div>
                </aside>
            </div>
        </main>
    );
}
