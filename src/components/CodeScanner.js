import { Scanner } from "@yudiel/react-qr-scanner";

const CodeScannerComponent = ({ isPaused, setIsPaused, handleScan }) => {
    return (
        <div className="scanner-element">
            <Scanner
                onScan={handleScan}
                allowMultiple={false}
                sound={true}
                isPaused={isPaused}
                classNames={{
                    container: "scanner-container",
                    finder: "scanner-finder",
                    mask: "scanner-mask",
                    overlay: "scanner-overlay",
                }}
                onError={(error) => console.log(error?.message)}
            />
            <button onClick={() => setIsPaused(!isPaused)} className="btn btn-outline-primary fw-bold">
                {isPaused ? "Resume" : "Cancel"}
            </button>
        </div>
    );
}

export default CodeScannerComponent;