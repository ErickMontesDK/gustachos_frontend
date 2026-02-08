import { RefreshCw } from "lucide-react";

export default function Modal({ title, message, buttonText1, buttonText2, buttonAction1, buttonAction2, icon }: { title: string, message: string, buttonText1: React.ReactNode, buttonText2: React.ReactNode, buttonAction1: () => void, buttonAction2: () => void, icon: React.ReactNode }) {
    return (
        // <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
        //     <div className="modal-dialog modal-dialog-centered text-white text-center">
        //         <div className="p-4 bg-dark border border-danger" style={{ borderRadius: '24px' }}>
        //             {icon && icon}
        //             <h2 className="fw-bold mb-3" style={{ letterSpacing: '-0.025em' }}>{title}</h2>
        //             <p className="mb-4 text-muted">{message}</p>
        //             <div className="d-grip gap-2">
        //                 <button className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center py-3" style={{ borderRadius: '12px' }} onClick={buttonAction1}>
        //                     {buttonText1}
        //                 </button>
        //                 <button className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center py-3" style={{ borderRadius: '12px' }} onClick={buttonAction2}>
        //                     {buttonText2}
        //                 </button>
        //             </div>
        //         </div>
        //     </div>
        // </div>


        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '24px', overflow: 'hidden' }}>
                    <div className="modal-body p-5 text-center">
                        {icon &&
                            <div className="mb-4 d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px', backgroundColor: 'var(--success-subtle)', borderRadius: '50%', color: 'var(--success-color)' }}>
                                {icon}
                            </div>
                        }
                        <h2 className="fw-bold mb-3" style={{ letterSpacing: '-0.025em' }}>{title}</h2>
                        <p className="text-muted mb-4">
                            {message}
                        </p>
                        <div className="d-grid gap-2">
                            <button className="btn btn-primary btn-lg fw-bold d-flex align-items-center justify-content-center py-3" style={{ borderRadius: '12px' }} onClick={buttonAction1}>
                                {buttonText1}
                            </button>
                            {buttonText2 &&
                                <button className="btn btn-outline-secondary btn-lg fw-bold d-flex align-items-center justify-content-center py-3" style={{ borderRadius: '12px' }} onClick={buttonAction2}>
                                    {buttonText2}
                                </button>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}