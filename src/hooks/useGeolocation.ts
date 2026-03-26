import { useState } from "react";

export const useGeolocation = () => {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [datetime, setDatetime] = useState("");

    const gettingGeolocation = (onSuccess?: (lat: number, lon: number) => void, onError?: (msg: string) => void, retries = 2) => {
        const options = {
            enableHighAccuracy: true,
            timeout: 15000,   // 👈 de 5s a 15s
            maximumAge: 0,
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = parseFloat(position.coords.latitude.toFixed(6));
                const lon = parseFloat(position.coords.longitude.toFixed(6));
                setLatitude(lat);
                setLongitude(lon);

                if (onSuccess) onSuccess(lat, lon);
                if (onError) onError("");
            },
            (error) => {

                if (latitude !== 0 && longitude !== 0) return;
                if (retries > 0) {
                    // reintenta automáticamente
                    gettingGeolocation(onSuccess, onError, retries - 1);
                    return;
                }
                let msg = "An unknown error occurred.";
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = "Location permission denied.";
                        break;
                    case error.POSITION_UNAVAILABLE:
                        msg = "Location information is unavailable.";
                        break;
                    case error.TIMEOUT:
                        msg = "Location request timed out.";
                        break;
                }
                console.log(msg);
                if (onError) onError(msg);
            },
            options
        );
    };

    const gettingDatetime = () => {
        const date = new Date();
        const isoDatetime = date.toISOString();
        setDatetime(isoDatetime);
        return isoDatetime;
    };

    const resetLocation = () => {
        setLatitude(0);
        setLongitude(0);
        setDatetime("");
    };

    return { latitude, longitude, datetime, gettingGeolocation, gettingDatetime, resetLocation };
};