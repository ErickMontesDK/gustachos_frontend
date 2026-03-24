import { useState } from "react";
import Modal from "../../../../components/modal";
import { Key, RefreshCw, Copy, Check } from "lucide-react";
import { useChangeUserPassword, User } from "../../hooks/useUsers";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user: User | null;
}

export default function ChangePasswordModal({ isOpen, onClose, onSuccess, user }: Props) {
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const {
        new_password: pass_new, setNewPassword: setPassNew,
        new_password_confirmation: pass_confirm, setNewPasswordConfirmation: setPassConfirm,
        changeUserPassword
    } = useChangeUserPassword(
        () => {
            onSuccess();
            handleClose();
        },
        (msg) => setErrorMessage(msg)
    );

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

    const handleClose = () => {
        setPassNew("");
        setPassConfirm("");
        setCopied(false);
        setErrorMessage(null);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <Modal
            title="Change User Password"
            icon={<Key size={24} />}
            message={`Set a new password for ${user.full_name}`}
            buttonText1="Save Password"
            buttonText2="Cancel"
            isForm={true}
            isSubmitDisabled={!pass_new || pass_new !== pass_confirm}
            buttonAction1={() => {
                changeUserPassword(user.id);
            }}
            buttonAction2={handleClose}
        >
            {errorMessage && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                    {errorMessage}
                </div>
            )}
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
    );
}
