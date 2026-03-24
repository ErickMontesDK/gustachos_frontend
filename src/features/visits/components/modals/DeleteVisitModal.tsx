import { useState } from "react";
import Modal from "../../../../components/modal";
import { Trash } from "lucide-react";
import { useDeleteVisit, Visit } from "../../hooks/useVisits";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    visit: Visit | null;
}

export default function DeleteVisitModal({ isOpen, onClose, onSuccess, visit }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { deleteVisit } = useDeleteVisit(
        visit,
        () => {}, 
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

    if (!isOpen || !visit) return null;

    return (
        <Modal
            title="Delete Visit"
            icon={<Trash size={24} />}
            message={`Are you sure you want to delete this visit?`}
            buttonText1="Delete"
            buttonText2="Cancel"
            buttonAction1={() => {
                deleteVisit();
            }}
            buttonAction2={handleClose}
        >
            {errorMessage && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                    {errorMessage}
                </div>
            )}
        </Modal>
    );
}
