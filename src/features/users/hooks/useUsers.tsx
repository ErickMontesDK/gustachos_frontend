import { SortingState } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { usePaginatedData } from "../../../hooks/usePaginatedData";
import { userMapper } from "../utils/userMappers";
import {
    getUsers,
    updateUser as updateUserService,
    deleteUser as deleteUserService,
    createUser as createUserService,
    getUserProfile,
    changeOwnPassword as changeOwnPasswordService,
    changeUserPassword as changeUserPasswordService,
    restoreUser as restoreUserService
} from "../api/usersService";

export interface User {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string;
    role: string;
    isDeleted: boolean;
}

interface filters {
    search_term: string;
    role: string;
    page: number;
    page_size: number;
    sorting: string;
    is_deleted: boolean;
}

const DEFAULT_FILTERS: filters = {
    search_term: "",
    role: "",
    page: 1,
    page_size: 15,
    sorting: "",
    is_deleted: false,
};

export const useUserProfile = () => {
    const [user, setUser] = useState<User | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const controller = new AbortController();

        getUserProfile()
            .then(data => {
                setUser(userMapper(data));
            })
            .catch(error => {
                setError(error.message || "Error fetching user");
            });

        return () => controller.abort();
    }, []);

    return { user, error };
}

export const useUsers = () => {
    const { data: users, ...rest } = usePaginatedData({
        defaultFilters: DEFAULT_FILTERS,
        fetchData: getUsers,
        mapData: userMapper,
        formatFilters: (filters) => ({
            search_term: filters.search_term || undefined,
            role: filters.role || undefined,
            is_deleted: filters.is_deleted || undefined,
        })
    });

    return {
        users,
        ...rest
    };
}

export const useUpdateUser = (user: User | null, setUser: (user: User | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [formData, setFormData] = useState({
        role: "",
        email: "",
        first_name: "",
        last_name: ""
    });

    useEffect(() => {
        if (!user) return;

        setFormData({
            role: user.role || "",
            email: user.email || "",
            first_name: user.first_name || "",
            last_name: user.last_name || ""
        });
    }, [user])

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateUser = () => {
        updateUserService(user!.id, formData)
            .then(() => {
                setUser(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error updating user:", error);
                if (onError) onError(error.message || "Error updating user");
            });
    }

    return {
        formData,
        setFormData,
        handleChange,
        updateUser
    }
}


export const useDeleteUser = (user: User | null, setUser: (user: User | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const deleteUser = () => {
        deleteUserService(user!.id)
            .then(() => {
                setUser(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error deleting user:", error);
                if (onError) onError(error.message || "Error deleting user");
            });
    }

    return {
        deleteUser
    }
}

export const useCreateUser = (onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [formData, setFormData] = useState({
        new_role: "",
        new_email: "",
        new_first_name: "",
        new_last_name: "",
        new_username: "",
        new_password: "",
        new_password_confirmation: ""
    });

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const createUser = () => {

        if (formData.new_password !== formData.new_password_confirmation) {
            if (onError) onError("Passwords do not match");
            return;
        }

        createUserService({
            role: formData.new_role,
            email: formData.new_email,
            first_name: formData.new_first_name,
            last_name: formData.new_last_name,
            password: formData.new_password,
            username: formData.new_username,
        })
            .then(() => {
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error creating user:", error);
                if (onError) onError(error.message || "Error creating user");
            });
    }

    return {
        formData,
        setFormData,
        handleChange,
        createUser
    }
}

export const useChangeOwnPassword = (onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [old_password, setOldPassword] = useState("");
    const [new_password, setNewPassword] = useState("");
    const [new_password_confirmation, setNewPasswordConfirmation] = useState("");

    const changeOwnPassword = () => {
        if (new_password !== new_password_confirmation) {
            if (onError) onError("Passwords do not match");
            return;
        }

        changeOwnPasswordService({
            old_password: old_password,
            new_password: new_password,
        })
            .then(() => {
                if (onSuccess) onSuccess();
                setOldPassword("");
                setNewPassword("");
                setNewPasswordConfirmation("");
            })
            .catch(error => {
                console.error("Error changing password:", error);

                if (error.message && typeof error.message === 'object' && error.message.old_password) {
                    const msg = Array.isArray(error.message.old_password)
                        ? error.message.old_password[0]
                        : error.message.old_password;
                    if (onError) onError(msg);
                } else {
                    if (onError) onError(error.message || "Error changing password");
                }
            });
    }

    return {
        old_password, setOldPassword,
        new_password, setNewPassword,
        new_password_confirmation, setNewPasswordConfirmation,
        changeOwnPassword
    }
}

export const useRestoreUser = (userState: User | null, setUser: (user: User | null) => void, onSuccess?: () => void, onError?: (msg: string) => void) => {
    const restoreUser = (userToRestore?: User) => {
        const targetUser = userToRestore || userState;
        if (!targetUser) return;

        restoreUserService(targetUser.id)
            .then(() => {
                setUser(null);
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error restoring user:", error);
                if (onError) onError(error.message || "Error restoring user");
            });
    }

    return {
        restoreUser
    }
}

export const useChangeUserPassword = (onSuccess?: () => void, onError?: (msg: string) => void) => {
    const [new_password, setNewPassword] = useState("");
    const [new_password_confirmation, setNewPasswordConfirmation] = useState("");

    const changeUserPassword = (id: number) => {
        if (!new_password) {
            if (onError) onError("Please enter a new password");
            return;
        }

        if (new_password !== new_password_confirmation) {
            if (onError) onError("Passwords do not match");
            return;
        }

        changeUserPasswordService(id, {
            new_password: new_password,
        })
            .then(() => {
                if (onSuccess) onSuccess();
            })
            .catch(error => {
                console.error("Error changing user password:", error);
                if (onError) onError(error.message || "Error changing user password");
            });
    }

    return {
        new_password, setNewPassword,
        new_password_confirmation, setNewPasswordConfirmation,
        changeUserPassword
    }
}

