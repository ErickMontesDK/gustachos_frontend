import Layout from "../../../components/Layout";
import { useEffect, useState } from "react";
import { useChangePassword, useCreateUser, useDeleteUser, User, useUpdateUser } from "../hooks/useUsers";
import { useUsers } from "../hooks/useUsers";
import Select from "../../../components/common/inputs/Select";
import Searchbar from "../../../components/common/inputs/Searchbar";
import TableDisplay from "../../../components/TableDisplay";
import { columns } from "./columns";
import Modal from "../../../components/modal";
import { Plus, Trash } from "lucide-react";

export default function UsersData() {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const userRoles = [
        { id: "ADMIN", name: "Admin" },
        { id: "DELIVERY", name: "Delivery" },
        { id: "OPERATOR", name: "Operator" },
    ];

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
        user,
        role, setRole,
        email, setEmail,
        first_name, setFirstName,
        last_name, setLastName,
        updateUser
    } = useUpdateUser(selectedUser, setSelectedUser, refresh, (msg) => setErrorMessage(msg));

    const {
        deleteUser
    } = useDeleteUser(selectedUser, setSelectedUser, refresh, (msg) => setErrorMessage(msg));

    const {
        new_role, setNewRole,
        new_email, setNewEmail,
        new_first_name, setNewFirstName,
        new_last_name, setNewLastName,
        new_password, setNewPassword,
        new_password_confirmation, setNewPasswordConfirmation,
        new_username, setNewUsername,
        createUser
    } = useCreateUser(refresh, (msg) => setErrorMessage(msg));


    const passwordMatch = (
        new_password_confirmation !== "" && new_password === new_password_confirmation
    );
    const isCreateFormValid = !!(
        (new_role && new_email && new_first_name && new_last_name && new_password && new_password_confirmation && new_username) &&
        passwordMatch
    );
    const isEditFormValid = !!(role && email && first_name && last_name);

    const cleaningData = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setRole("");
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowCreateModal(false);
        setSelectedUser(null);
        setErrorMessage(null);
        setNewFirstName("");
        setNewLastName("");
        setNewEmail("");
        setNewRole("");
        setNewPassword("");
        setNewPasswordConfirmation("");
    }

    return (
        <Layout>
            <div className="animate-fade-in">
                <h1>Users Data</h1>
                <div className="filters-card p-4 mb-4 shadow-sm border rounded bg-white">

                    {errorMessage && (
                        <div className="alert alert-danger py-2 mb-3" role="alert">
                            {errorMessage}
                        </div>
                    )}


                    <h5 className="mb-3 text-secondary">Filters</h5>

                    <div className="row g-3 mb-4">
                        <div className="col-md-3">
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
                        <div className="col-md-6">
                            <Searchbar
                                name="search"
                                id="search"
                                value={filters.search_term}
                                onChange={(e) => updateFilters("search_term", e.target.value)}
                                placeholder="Search by name, code, address..."
                                label="Search Term"
                            />
                        </div>

                        <div className="col-3 d-flex justify-content-end pt-4">
                            <button
                                className="btn btn-primary w-50"
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
                </div>

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
                />

            </div>

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
                                value={first_name}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={last_name}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="col-md-6">
                            <Select
                                label="Role"
                                name="role"
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
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
                        if (!new_first_name || !new_last_name || !new_email || !new_role || !new_password || !new_password_confirmation || !new_username) {
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
                                value={new_first_name}
                                onChange={(e) => setNewFirstName(e.target.value)}
                                placeholder="e.g. John"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">Last Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={new_last_name}
                                onChange={(e) => setNewLastName(e.target.value)}
                                placeholder="e.g. Doe"
                                required
                            />
                        </div>
                        <div className="col-12">
                            <label className="form-label font-bold">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                value={new_email}
                                onChange={(e) => setNewEmail(e.target.value)}
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
                                value={new_username}
                                onChange={(e) => setNewUsername(e.target.value)}
                                placeholder="johndoe"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <Select
                                label="Role"
                                name="role"
                                value={new_role}
                                onChange={(e) => setNewRole(e.target.value)}
                                options={userRoles}
                                placeholder="Select role"
                            />
                        </div>

                        <div className="col-12 mt-4">
                            <h6 className="border-bottom pb-2 text-secondary">Security</h6>
                        </div>
                        {!passwordMatch && new_password_confirmation !== "" && (
                            <div className="alert alert-danger py-2 mb-3" role="alert">
                                Passwords do not match
                            </div>
                        )}
                        <div className="col-md-6">
                            <label className="form-label font-bold">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={new_password}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Password"
                                required
                            />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label font-bold">Confirm Password</label>
                            <input
                                type="password"
                                className="form-control"
                                value={new_password_confirmation}
                                onChange={(e) => setNewPasswordConfirmation(e.target.value)}
                                placeholder="Password confirmation"
                                required
                            />
                        </div>
                    </div>

                </Modal>
            )}

        </Layout>
    );
}