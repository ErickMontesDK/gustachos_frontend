import { useEffect, useState } from "react";

export const usePermissions = () => {
    const [permissionsGranted, setPermissionsGranted] = useState<boolean | null>(null);
    const [permissionError, setPermissionError] = useState("");

    const checkPassivePermissions = async () => {
        setPermissionsGranted(null);
        try {
            if (navigator.permissions && navigator.permissions.query) {
                const [geoStatus, camStatus] = await Promise.all([
                    navigator.permissions.query({ name: 'geolocation' as PermissionName }),
                    // Camera status might not be available in all browsers, default to 'prompt'
                    navigator.permissions.query({ name: 'camera' as PermissionName }).catch(() => ({ state: 'prompt' }))
                ]);

                if (geoStatus.state === 'granted' && camStatus.state === 'granted') {
                    setPermissionsGranted(true);
                } else if (geoStatus.state === 'denied' || camStatus.state === 'denied') {
                    setPermissionError("Permissions are blocked. Click the lock icon (🔒) or settings icon next to the URL to reset and allow them.");
                    setPermissionsGranted(false);
                } else {
                    setPermissionError("Camera and location permissions are required to scan clients.");
                    setPermissionsGranted(false);
                }
            } else {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach(track => track.stop());

                setPermissionError("Touch to verify location permissions.");
                setPermissionsGranted(false);
            }
        } catch (error) {
            console.error("Passive permission check failed:", error);
            setPermissionError("Necessary permissions are active or required.");
            setPermissionsGranted(false);
        }
    };

    const retryPermissions = async () => {
        if (navigator.permissions && navigator.permissions.query) {
            const [geoStatus, camStatus] = await Promise.all([
                navigator.permissions.query({ name: 'geolocation' as PermissionName }),
                navigator.permissions.query({ name: 'camera' as PermissionName }).catch(() => ({ state: 'prompt' }))
            ]);

            if (geoStatus.state === 'denied' || camStatus.state === 'denied') {
                setPermissionError("Access is blocked. Please click the lock icon (🔒) in your address bar and reset permissions to 'Allow'.");
                return;
            }
        }

        setPermissionsGranted(null);
        setPermissionError("");

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            stream.getTracks().forEach(track => track.stop());

            navigator.geolocation.getCurrentPosition(
                () => {
                    setPermissionsGranted(true);
                },
                (err) => {
                    console.error("Manual GPS failure:", err);
                    if (err.code === 1) {
                        setPermissionError("Location access was denied. Please reset it using the lock icon in your browser.");
                    } else {
                        setPermissionError("GPS failed. Please ensure location is enabled on your device.");
                    }
                    setPermissionsGranted(false);
                },
                { timeout: 10000, enableHighAccuracy: true }
            );
        } catch (error: any) {
            console.error("Manual Camera failure:", error);
            setPermissionError("Camera access failed. Please ensure you have allowed access.");
            setPermissionsGranted(false);
        }
    };

    useEffect(() => {
        checkPassivePermissions();
    }, []);

    return {
        permissionsGranted,
        permissionError,
        retryPermissions,
        checkPassivePermissions
    };
};
