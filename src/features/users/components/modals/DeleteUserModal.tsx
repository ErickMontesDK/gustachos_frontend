import Modal from "../../../../components/modal";
import { Trash } from "lucide-react";
import { useDeleteUser, User } from "../../hooks/useUsers";
import { useState } from "react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function DeleteUserModal({ isOpen, onClose, onSuccess, user }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { deleteUser } = useDeleteUser(
        user,
        () => { },
        () => {
            onSuccess();
            handleClose();
        },
        (msg) => setErrorMessage(msg)
    );

    const handleClose = () => {
        setErrorMessage(null);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <Modal
            title="Delete User"
            icon={<Trash size={24} />}
            message={`Are you sure you want to delete this user?`}
            buttonText1="Delete"
            buttonText2="Cancel"
            buttonAction1={() => {
                deleteUser();
            }}
            buttonAction2={handleClose}
            showCloseButton={true}
        >
            {errorMessage && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                    {errorMessage}
                </div>
            )}
        </Modal>
    );
}
