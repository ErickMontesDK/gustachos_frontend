import { useState } from "react";
import Modal from "../../../../components/modal";
import { Trash } from "lucide-react";
import { useDeleteClient, Client } from "../../hooks/useClients";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    client: Client | null;
}

export default function DeleteClientModal({ isOpen, onClose, onSuccess, client }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { deleteClient } = useDeleteClient(
        client,
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

    if (!isOpen || !client) return null;

    return (
        <Modal
            title="Delete Client"
            icon={<Trash size={24} />}
            message={`Are you sure you want to delete this client?`}
            buttonText1="Delete"
            buttonText2="Cancel"
            buttonAction1={() => {
                deleteClient();
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
