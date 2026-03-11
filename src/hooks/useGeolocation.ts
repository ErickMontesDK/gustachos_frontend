import { useState } from "react";

export const useGeolocation = () => {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [datetime, setDatetime] = useState("");

    const gettingGeolocation = (onSuccess?: (lat: number, lon: number) => void) => {
        const options = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = parseFloat(position.coords.latitude.toFixed(6));
            const lon = parseFloat(position.coords.longitude.toFixed(6));
            setLatitude(lat);
            setLongitude(lon);
            if (onSuccess) onSuccess(lat, lon);

        }, (error) => {
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    console.log("User denied the request for Geolocation.");
                    break;
                case error.POSITION_UNAVAILABLE:
                    console.log("Location information is unavailable.");
                    break;
                case error.TIMEOUT:
                    console.log("The request to get user location timed out.");
                    break;
                default:
                    console.log("An unknown error occurred.");
                    break;
            }
        }, options);
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

    return {
        latitude,
        longitude,
        datetime,
        gettingGeolocation,
        gettingDatetime,
        resetLocation
    };
};
