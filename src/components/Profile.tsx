import Layout from "./Layout";
import { useChangeOwnPassword, useUserProfile } from "../features/users/hooks/useUsers";
import { User, Mail, Shield, Fingerprint, Lock, CircleUser } from "lucide-react";
import { useState } from "react";
import Modal from "./modal";

export default function Profile() {
    const { user, error } = useUserProfile();
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordMessage, setPasswordMessage] = useState({
        error: false,
        message: ""
    });

    const { old_password, setOldPassword,
        new_password, setNewPassword,
        new_password_confirmation, setNewPasswordConfirmation,
        changeOwnPassword } = useChangeOwnPassword(
            () => {
                setPasswordMessage({
                    error: false,
                    message: "Password updated successfully!"
                });
                setShowPasswordModal(false);
            },
            (msg) => {
                setPasswordMessage({
                    error: true,
                    message: msg
                });
            }
        );
    const passwordMatch = new_password === new_password_confirmation;
    const isFormValid = new_password.length >= 6;

    if (error) {
        return (
            <Layout>
                <div className="container-fluid animate-fade-in py-4">
                    <div className="alert alert-danger shadow-sm border-0 d-flex align-items-center p-4 rounded-4" role="alert">
                        <Shield className="me-3 text-danger" size={24} />
                        <div>
                            <h6 className="mb-1 fw-bold">Connection Error</h6>
                            <p className="mb-0 opacity-75">{error}</p>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!user) {
        return (
            <Layout>
                <div className="d-flex flex-column justify-content-center align-items-center py-5" style={{ minHeight: '60vh' }}>
                    <div className="spinner-border text-primary mb-3" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="text-muted animate-pulse">Retrieving profile information...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="animate-fade-in p-2">
                {/* Header Header */}
                <div className="card border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
                    <div className="card-body p-4 d-flex align-items-center">
                        <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-4 text-primary d-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                            <CircleUser size={40} />
                        </div>
                        <div>
                            <h1 className="h2 mb-1 fw-bold text-dark">{user.full_name}</h1>
                            <div className="d-flex align-items-center gap-2">
                                <span className="badge bg-primary rounded-pill px-3">{user.role}</span>
                                <span className="text-secondary small">@{user.username}</span>
                            </div>
                            {passwordMessage.error && <div className="text-danger small">{passwordMessage.message}</div>}
                            {!passwordMessage.error && <div className="text-success small">{passwordMessage.message}</div>}
                        </div>
                    </div>
                </div>

                <div className="row g-4">
                    {/* Information Section */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white bg-opacity-75" style={{ backdropFilter: 'blur(8px)' }}>
                            <h5 className="mb-4 fw-bold d-flex align-items-center">
                                <User size={20} className="text-primary me-2" />
                                Personal Details
                            </h5>

                            <div className="row g-3">
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded-3 border border-light">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">First Name</label>
                                        <div className="fw-semibold text-dark">{user.first_name}</div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="p-3 bg-light rounded-3 border border-light">
                                        <label className="text-muted small fw-bold text-uppercase d-block mb-1">Last Name</label>
                                        <div className="fw-semibold text-dark">{user.last_name}</div>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <div className="p-3 bg-light rounded-3 border border-light d-flex align-items-center">
                                        <Mail size={18} className="text-primary me-3" />
                                        <div>
                                            <label className="text-muted small fw-bold text-uppercase d-block mb-1">Email</label>
                                            <div className="fw-semibold text-dark">{user.email}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="col-lg-4">
                        <div className="card border-0 shadow-sm rounded-4 p-4 h-100 bg-white bg-opacity-75" style={{ backdropFilter: 'blur(8px)' }}>
                            <h5 className="mb-4 fw-bold d-flex align-items-center">
                                <Shield size={20} className="text-success me-2" />
                                Account Security
                            </h5>

                            <div className="mb-3 p-3 bg-white rounded-3 border border-light shadow-xs">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">Status</label>
                                <div className="d-flex align-items-center justify-content-between">
                                    <span className="fw-bold text-dark">{user.role}</span>
                                    <span className="badge bg-success bg-opacity-10 text-success border-0 px-2 rounded-1 small">Active</span>
                                </div>
                            </div>

                            <div className="mb-4 p-3 bg-white rounded-3 border border-light shadow-xs">
                                <label className="text-muted small fw-bold text-uppercase d-block mb-1">System ID</label>
                                <div className="d-flex align-items-center">
                                    <Fingerprint size={16} className="text-muted me-2" />
                                    <span className="font-monospace text-primary fw-bold">#000{user.id}</span>
                                </div>
                            </div>

                            <div className="mt-auto">
                                <button
                                    className="btn btn-primary w-100 py-2 rounded-3 shadow-sm d-flex align-items-center justify-content-center"
                                    onClick={() => setShowPasswordModal(true)}
                                >
                                    <Lock size={16} className="me-2" />
                                    Change Password
                                </button>
                                <div className="text-center mt-3">
                                    <span className="text-muted smaller">Last access: {new Date().toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {showPasswordModal && (
                <Modal
                    title="Change Password"
                    message={`Please enter your current password and your new password below.`}
                    buttonText1="Update Password"
                    buttonText2="Cancel"
                    isForm={true}
                    isSubmitDisabled={!isFormValid || !passwordMatch || new_password_confirmation === "" || !old_password}
                    buttonAction1={() => {
                        changeOwnPassword();
                    }}
                    buttonAction2={() => {
                        setShowPasswordModal(false);
                        setOldPassword("");
                        setNewPassword("");
                        setNewPasswordConfirmation("");
                        setPasswordMessage({ error: false, message: "" });
                    }}
                >
                    <div className="row g-3 text-start">
                        {passwordMessage.error && (
                            <div className="col-12">
                                <div className="alert alert-danger py-2 mb-0" role="alert">
                                    {passwordMessage.message}
                                </div>
                            </div>
                        )}
                        {!passwordMatch && new_password_confirmation !== "" && (
                            <div className="col-12">
                                <div className="alert alert-danger py-2 mb-0" role="alert">
                                    Passwords do not match
                                </div>
                            </div>
                        )}
                        <div className="col-12">
                            <label className="form-label font-bold text-dark">Current Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={old_password}
                                onChange={(e) => setOldPassword(e.target.value)}
                                placeholder="Enter current password"
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold text-dark">New Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={new_password}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password"
                                required
                            />
                            <div className="form-text small">
                                Minimum 6 characters required.
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold text-dark">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={new_password_confirmation}
                                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                placeholder="Confirm Password"
                                required
                            />
                        </div>
                    </div>
                </Modal>
            )}

        </Layout>
    );
}