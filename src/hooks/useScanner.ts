import { useState } from "react";

export const useScanner = () => {
    const [isScannerPaused, setIsScannerPaused] = useState(true);
    const [isScannerLoading, setIsScannerLoading] = useState(false);
    const [isScannerUsed, setIsScannerUsed] = useState(false);

    const startScanner = () => {
        setIsScannerPaused(false);
        setIsScannerUsed(false);
    };

    const stopScanner = () => {
        setIsScannerPaused(true);
    };

    const resetScanner = () => {
        setIsScannerPaused(true);
        setIsScannerUsed(false);
        setIsScannerLoading(false);
    };

    return {
        isScannerPaused,
        setIsScannerPaused,
        isScannerLoading,
        setIsScannerLoading,
        isScannerUsed,
        setIsScannerUsed,
        startScanner,
        stopScanner,
        resetScanner
    };
};
