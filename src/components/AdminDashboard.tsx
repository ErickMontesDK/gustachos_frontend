import React, { useState, useEffect } from 'react';
import {
    Users, MapPin, Store, Briefcase, Activity, CalendarCheck, Clock,
    TrendingUp, ChevronRight, CheckCircle2,
    ShieldCheck, Navigation, AlertTriangle, UserPlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import '../styles/home.css';
import { api } from '../api/axiosInstance';
import { formatDatetime } from '../utils/formatDatetime';

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
    const role = localStorage.getItem("role")?.toLowerCase() || "admin";
    const businessDataStr = localStorage.getItem("business_data");
    const businessData = businessDataStr ? JSON.parse(businessDataStr) : null;
    const timezone = businessData?.time_zone || "America/Mexico_City";
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
        api.get("/users/dashboard/stats/")
            .then(response => {
                setStats(response.data);
            })
            .catch(error => {
                console.error("Error fetching stats: ", error);
            });
    }, []);

    const kpiElements = [
        { label: 'Total Visits', value: stats.visits_today.toString(), icon: <MapPin size={20} />, color: '#eef2ff', iconColor: 'text-primary', url: `/visits-data?date_from=${today.toISOString().split('T')[0]}` },
        { label: 'Productivity Rate', value: `${stats.productive_percentage}%`, icon: <TrendingUp size={20} />, color: '#f0fdf4', iconColor: 'text-success', url: `/visits-data?is_productive=true&date_from=${today.toISOString().split('T')[0]}` },
        { label: 'Validation Rate', value: `${stats.valid_visits_percentage}%`, icon: <ShieldCheck size={20} />, color: '#fdf2f8', iconColor: 'text-danger', url: `/visits-data?is_valid=false&date_from=${today.toISOString().split('T')[0]}` },
        { label: 'Active Deliverers', value: stats.active_deliverers.toString(), icon: <Navigation size={20} />, color: '#fff7ed', iconColor: 'text-warning', url: `/users-data` },
    ];

    return (
        <div className="container-fluid py-4 animate-fade-in" style={{ maxWidth: '1100px' }}>

            {/* Header Section */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-bold mb-1 text-dark">Admin Dashboard 👋</h2>
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
                <div>
                    <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill text-capitalize">
                        {role}
                    </span>
                </div>
            </div>

            {/* Section 1: Top KPIs Row */}
            <div className="row g-3 mb-5">
                {kpiElements.map((kpi, index) => (
                    <a href={kpi.url} className="col-6 col-md-3 kpi-card" key={index}>
                        <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '16px' }}>
                            <div className="card-body p-3">
                                <div className={`p-2 rounded-3 mb-2 d-inline-block ${kpi.iconColor}`} style={{ backgroundColor: kpi.color }}>
                                    {kpi.icon}
                                </div>
                                <h3 className="fw-bold mb-0">{kpi.value}</h3>
                                <small className="text-muted fw-medium">{kpi.label}</small>
                            </div>
                        </div>
                    </a>
                ))}
            </div>

            <div className="row g-4">
                {/* Left Column: Quick Access & Operational Stats */}
                <div className='col-12 col-lg-2'>
                    {/* Quick Access */}
                    <h5 className="fw-bold text-secondary mb-3">Quick Access</h5>
                    <div className="d-grid gap-2">
                        <button className="btn btn-white border-0 shadow-sm p-3 text-start d-flex align-items-center justify-content-between transition-all bg-white rounded-3" onClick={() => navigate('/visits-data')}>
                            <div className="d-flex align-items-center">
                                <MapPin size={18} className="text-success me-3" />
                                <span className="fw-bold">Visits</span>
                            </div>
                            <ChevronRight size={18} className="text-muted" />
                        </button>
                        <button className="btn btn-white border-0 shadow-sm p-3 text-start d-flex align-items-center justify-content-between transition-all bg-white rounded-3" onClick={() => navigate('/clients-data')}>
                            <div className="d-flex align-items-center">
                                <Store size={18} className="text-info me-3" />
                                <span className="fw-bold">Clients</span>
                            </div>
                            <ChevronRight size={18} className="text-muted" />
                        </button>
                        {role === 'admin' && (
                            <>
                                <button className="btn btn-white border-0 shadow-sm p-3 text-start d-flex align-items-center justify-content-between transition-all bg-white rounded-3" onClick={() => navigate('/users-data')}>
                                    <div className="d-flex align-items-center">
                                        <Users size={18} className="text-primary me-3" />
                                        <span className="fw-bold">Users</span>
                                    </div>
                                    <ChevronRight size={18} className="text-muted" />
                                </button>
                                <button className="btn btn-white border-0 shadow-sm p-3 text-start d-flex align-items-center justify-content-between transition-all bg-white rounded-3" onClick={() => navigate('/business-data')}>
                                    <div className="d-flex align-items-center">
                                        <Briefcase size={18} className="text-dark me-3" />
                                        <span className="fw-bold">Settings</span>
                                    </div>
                                    <ChevronRight size={18} className="text-muted" />
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Center Column: Field Activity Feed */}
                <div className="col-12 col-lg-7 order-3 order-lg-2">
                    <h5 className="fw-bold text-secondary mb-3 d-flex align-items-center">
                        <Activity size={18} className="me-2" /> Field Activity Feed
                    </h5>
                    <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                        <ul className="list-group list-group-flush">
                            {stats.recent_activity.length > 0 ? (
                                stats.recent_activity.map((item) => (

                                    <li key={item.id} className="activity-card list-group-item p-4 border-0 border-bottom border-light d-flex justify-content-between align-items-start shadow-sm-hover transition-all">

                                        <a href={`/${item.type === 'visit' ? 'visits-data?date_from=' + formatDatetime(item.timestamp).formattedDate : 'clients-data?code=' + item.metadata.client_code}`} className="d-flex align-items-start">

                                            <div className={`p-3 rounded-2xl me-4 mt-1 ${item.metadata.is_valid === false ? 'bg-danger bg-opacity-10 text-danger' :
                                                item.type === 'visit' ? 'bg-indigo-50 text-primary' : 'bg-green-50 text-success'
                                                }`} style={{
                                                    borderRadius: '18px', backgroundColor:
                                                        item.metadata.is_valid === false ? '' :
                                                            item.type === 'visit' ? '#eef2ff' : '#f0fdf4'
                                                }}>
                                                {item.metadata.is_valid === false ? <AlertTriangle size={24} /> :
                                                    item.type === 'visit' ? <MapPin size={24} /> : <UserPlus size={24} />}
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
                                                    <span className="text-muted fw-normal" style={{ fontSize: '0.85rem' }}>
                                                        by <span className="fw-bold text-secondary">{item.metadata.user_name}</span>
                                                    </span>
                                                </div>
                                                {item.description && (
                                                    <p className="mb-0 text-muted mt-2 p-2 bg-light rounded-3 italic" style={{ fontSize: '0.9rem', borderLeft: '3px solid #dee2e6' }}>
                                                        <Activity size={14} className="me-2 opacity-50" />
                                                        {item.description}
                                                    </p>
                                                )}
                                            </div>
                                        </a>
                                        <div className="text-end ms-3">
                                            <small className="text-muted d-block text-nowrap"><Clock size={12} className="me-1" />{formatTimestamp(item.timestamp)}</small>
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <li className="list-group-item p-5 text-center text-muted border-0 bg-light bg-opacity-50">
                                    <Activity size={32} className="mb-3 opacity-25" />
                                    <p className="mb-0 fw-medium">No recent activity detected today.</p>
                                </li>
                            )}
                        </ul>

                    </div>
                </div>

                {/* Right Column: Growth & Compliance */}
                <div className="col-12 col-lg-3 order-first order-lg-last">
                    {/* Growth Management */}
                    <h5 className="fw-bold text-secondary mb-3">Growth Tracking</h5>
                    <a href="/clients-data" className="card border-0 shadow-sm mb-4 management-card" id="growth-tracking" style={{ borderRadius: '16px', backgroundColor: '#f0f9ff' }}>
                        <div className="card-body p-3">
                            <div className="d-flex align-items-center mb-2 text-info">
                                <UserPlus size={24} className="me-2" />
                                <h3 className="fw-bold mb-0">{stats.registered_clients_today}</h3>
                            </div>
                            <h6 className="fw-bold mb-0">New Clients Registered</h6>
                            <small className="text-muted">Daily prospecting total</small>
                        </div>
                    </a>

                    {/* Quality & Compliance */}
                    <h5 className="fw-bold text-secondary mb-3">Quality Control</h5>
                    <div className="row g-3 mb-4">
                        <div className="col-12">
                            <a href="/visits-data?is_valid=false" className={`card border-0 shadow-sm h-100 bg-opacity-10 bg-danger management-card`} style={{ borderRadius: '12px', borderLeft: `4px solid var(--bs-danger)` }}>
                                <div className="card-body p-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className={`text-danger`}><ShieldCheck size={18} /></span>
                                        <span className={`badge bg-danger`}>{stats.unvalidated_visits_today}</span>
                                    </div>
                                    <h6 className="fw-bold mb-1">Invalid Visits</h6>
                                    <small className="text-muted">Out of policy (today)</small>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
