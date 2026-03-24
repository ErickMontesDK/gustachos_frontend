import Layout from "../../../components/Layout";
import { useState } from "react";
import { useCreateUser, useDeleteUser, User, useUpdateUser, useRestoreUser, useChangeUserPassword } from "../hooks/useUsers";
import { useUsers } from "../hooks/useUsers";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import TableDisplay from "../../../components/TableDisplay";
import { columns } from "./columns";
import Modal from "../../../components/modal";
import { Plus, Trash, Key, RefreshCw, Copy, Check, Users, ListFilter } from "lucide-react";
import "./users-data.css";

export default function UsersData() {
    const userRoles = [
        { id: "ADMIN", name: "Admin" },
        { id: "DELIVERY", name: "Delivery" },
        { id: "OPERATOR", name: "Operator" },
    ];
    const current_role = localStorage.getItem("role") || "";
    const isAdmin = current_role.toLowerCase() === "admin";


    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);


    const {
        users,
        totalPages,
        pagination,
        setPagination,
        filters,
        updateFilters,
        sorting,
        setSorting,
        refresh
    } = useUsers();

    const {
        formData: createData,
        setFormData: setCreateData,
        handleChange: handleCreateChange,
        createUser
    } = useCreateUser(refresh, (msg) => setErrorMessage(msg));

    const {
        formData: updateData,
        setFormData: setUpdateData,
        handleChange: handleUpdateChange,
        updateUser
    } = useUpdateUser(selectedUser, setSelectedUser, refresh, (msg) => setErrorMessage(msg));

    const {
        deleteUser
    } = useDeleteUser(selectedUser, setSelectedUser, refresh, (msg) => setErrorMessage(msg));

    const {
        restoreUser
    } = useRestoreUser(selectedUser, setSelectedUser, refresh, (msg) => setErrorMessage(msg));

    const {
        new_password: pass_new, setNewPassword: setPassNew,
        new_password_confirmation: pass_confirm, setNewPasswordConfirmation: setPassConfirm,
        changeUserPassword
    } = useChangeUserPassword(() => {
        cleaningData();
    }, (msg) => setErrorMessage(msg));


    const passwordMatch = (
        createData.new_password_confirmation !== "" && createData.new_password === createData.new_password_confirmation
    );
    const isCreateFormValid = !!(
        (createData.new_role && createData.new_email && createData.new_first_name && createData.new_last_name && createData.new_password && createData.new_password_confirmation && createData.new_username) &&
        passwordMatch
    );
    const isEditFormValid = !!(updateData.role && updateData.email && updateData.first_name && updateData.last_name);


    const cleaningData = () => {
        setUpdateData({ role: "", email: "", first_name: "", last_name: "" });
        setCreateData({ new_role: "", new_email: "", new_first_name: "", new_last_name: "", new_username: "", new_password: "", new_password_confirmation: "" });

        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowCreateModal(false);
        setShowPasswordModal(false);

        setSelectedUser(null);
        setErrorMessage(null);

        setPassNew("");
        setPassConfirm("");
        setCopied(false);
    };

    const generatePassword = () => {
        const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const passwordLength = 12;
        let password = "";
        for (let i = 0; i < passwordLength; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassNew(password);
        setPassConfirm(password);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pass_new);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Layout>
            <main className="animate-fade-in">
                <header>
                    <h1><Users size={34} className="flex-shrink-0 me-2 text-primary mb-1" />Users Data</h1>
                </header>
                <section className="filters-card p-4 mb-4 shadow-sm border rounded bg-white">

                    {errorMessage && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {errorMessage}
                        </div>
                    )}


                    <h5 className="mb-3 text-secondary">
                        <ListFilter size={20} className="flex-shrink-0 me-2 text-primary mb-1" />Filters
                    </h5>

                    <div className="row g-3 mb-4 align-items-end">
                        <div className="col-md-2">
                            <Select
                                name="role"
                                id="role"
                                value={filters.role}
                                onChange={(e) => updateFilters("role", e.target.value)}
                                options={userRoles}
                                placeholder="All"
                                label="Role"
                            />
                        </div>
                        <div className="col-md-4">
                            <Searchbar
                                name="search"
                                id="search"
                                value={filters.search_term}
                                onChange={(e) => updateFilters("search_term", e.target.value)}
                                placeholder="Search by name, username, email..."
                                label="Search Term"
                            />
                        </div>

                        {isAdmin && (
                            <div className="col-md-3 d-flex align-items-end">
                                <div className="form-check form-switch p-2 border rounded w-100 bg-light d-flex align-items-center filter-switch-container">
                                    <input
                                        className="form-check-input ms-2 me-2"
                                        type="checkbox"
                                        role="switch"
                                        id="show_deleted_users"
                                        checked={filters.is_deleted}
                                        onChange={(e) => updateFilters("is_deleted", e.target.checked)}
                                    />
                                    <label className="form-check-label mb-0" htmlFor="show_deleted_users">Show Deleted</label>
                                </div>
                            </div>
                        )}

                        <div className="col-md-3">
                            <button
                                className="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-2 create-user-btn"
                                onClick={() => {
                                    setErrorMessage(null);
                                    setShowCreateModal(true);
                                }}
                            >
                                <Plus size={20} />
                                Create User
                            </button>
                        </div>

                    </div>
                </section>

                <TableDisplay
                    columns={columns}
                    data={users}
                    pageCount={totalPages}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    sorting={sorting}
                    onSortingChange={setSorting}
                    editEnabled={true}
                    onEdit={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        setShowEditModal(true);
                    }}
                    onDelete={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        setShowDeleteModal(true);
                    }}
                    onRestore={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        restoreUser(user);
                    }}
                    onChangePassword={(user) => {
                        setErrorMessage(null);
                        setSelectedUser(user);
                        setShowPasswordModal(true);
                    }}
                />

            </main>

            {showEditModal && (
                <Modal
                    title="Edit User"
                    message={`Editing user: ${selectedUser?.full_name || '...'}`}
                    buttonText1="Save Changes"
                    buttonText2="Cancel"
                    isForm={true}
                    isSubmitDisabled={!isEditFormValid}
                    buttonAction1={() => {
                        updateUser();
                        cleaningData();
                    }}
                    buttonAction2={() => {
                        cleaningData();
                    }}
                >
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label font-bold">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={updateData.first_name}
                                onChange={(e) => handleUpdateChange('first_name', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={updateData.last_name}
                                onChange={(e) => handleUpdateChange('last_name', e.target.value)}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={updateData.email}
                                onChange={(e) => handleUpdateChange('email', e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <Select
                                label="Role"
                                name="role"
                                value={updateData.role}
                                onChange={(e) => handleUpdateChange('role', e.target.value)}
                                options={userRoles}
                                placeholder="Select role"
                            />
                        </div>
                    </div>
                </Modal>
            )}

            {showDeleteModal && (
                <Modal
                    title="Delete User"
                    icon={<Trash size={24} />}
                    message={`Are you sure you want to delete this user?`}
                    buttonText1="Delete"
                    buttonText2="Cancel"
                    buttonAction1={() => {
                        deleteUser();
                        cleaningData();
                    }}
                    buttonAction2={() => {
                        cleaningData();
                    }}
                />
            )}

            {showCreateModal && (
                <Modal
                    title="Create User"
                    message={`Creating a new user account`}
                    buttonText1="Create User"
                    buttonText2="Cancel"
                    isForm={true}
                    isSubmitDisabled={!isCreateFormValid}
                    buttonAction1={() => {
                        if (!createData.new_first_name || !createData.new_last_name || !createData.new_email || !createData.new_role || !createData.new_password || !createData.new_password_confirmation || !createData.new_username) {
                            setErrorMessage("Please fill in all required fields.");
                            return;
                        }
                        createUser();
                        cleaningData();
                    }}
                    buttonAction2={() => {
                        cleaningData();
                    }}
                >
                    <div className="row g-3">
                        <div className="col-12">
                            <h6 className="border-bottom pb-2 text-secondary">Personal Information</h6>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">First Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={createData.new_first_name}
                                onChange={(e) => handleCreateChange("new_first_name", e.target.value)}
                                placeholder="e.g. John"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={createData.new_last_name}
                                onChange={(e) => handleCreateChange("new_last_name", e.target.value)}
                                placeholder="e.g. Doe"
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={createData.new_email}
                                onChange={(e) => handleCreateChange("new_email", e.target.value)}
                                placeholder="john.doe@example.com"
                                required
                            />
                        </div>

                        <div className="col-12 mt-4">
                            <h6 className="border-bottom pb-2 text-secondary">Account Details</h6>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                value={createData.new_username}
                                onChange={(e) => handleCreateChange("new_username", e.target.value)}
                                placeholder="johndoe"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <Select
                                label="Role"
                                name="role"
                                value={createData.new_role}
                                onChange={(e) => handleCreateChange("new_role", e.target.value)}
                                options={userRoles}
                                placeholder="Select role"
                            />
                        </div>

                        <div className="col-12 mt-4">
                            <h6 className="border-bottom pb-2 text-secondary">Security</h6>
                        </div>
                        {!passwordMatch && createData.new_password_confirmation !== "" && (
                            <div className="alert alert-danger py-2 mb-3" role="alert">
                                Passwords do not match
                            </div>
                        )}
                        <div className="col-md-6">
                            <label className="form-label font-bold">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={createData.new_password}
                                onChange={(e) => handleCreateChange("new_password", e.target.value)}
                                placeholder="Password"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={createData.new_password_confirmation}
                                onChange={(e) => handleCreateChange("new_password_confirmation", e.target.value)}
                                placeholder="Password confirmation"
                                required
                            />
                        </div>
                    </div>

                </Modal>
            )}

            {showPasswordModal && (
                <Modal
                    title="Change User Password"
                    icon={<Key size={24} />}
                    message={`Set a new password for ${selectedUser?.full_name}`}
                    buttonText1="Save Password"
                    buttonText2="Cancel"
                    isForm={true}
                    isSubmitDisabled={!pass_new || pass_new !== pass_confirm}
                    buttonAction1={() => {
                        if (selectedUser) {
                            changeUserPassword(selectedUser.id);
                        }
                    }}
                    buttonAction2={() => {
                        cleaningData();
                    }}
                >
                    <div className="row g-3">
                        <div className="col-12">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <label className="form-label font-bold mb-0">New Password</label>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                                    onClick={generatePassword}
                                >
                                    <RefreshCw size={14} /> Generate
                                </button>
                            </div>
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    value={pass_new}
                                    onChange={(e) => setPassNew(e.target.value)}
                                    placeholder="Enter or generate password"
                                />
                                {pass_new && (
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        onClick={copyToClipboard}
                                        title="Copy to clipboard"
                                    >
                                        {copied ? <Check size={16} color="green" /> : <Copy size={16} />}
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={pass_confirm}
                                onChange={(e) => setPassConfirm(e.target.value)}
                                placeholder="Confirm new password"
                            />
                            {pass_new !== pass_confirm && pass_confirm !== "" && (
                                <div className="text-danger small mt-1">Passwords do not match</div>
                            )}
                        </div>
                    </div>
                </Modal>
            )}

        </Layout>
    );
}