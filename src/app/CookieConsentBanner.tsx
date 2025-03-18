import React, { useEffect, useState } from "react";
import cookie from "js-cookie";

const CookieConsentBanner = () => {
    const [showBanner, setShowBanner] = useState(false);

    useEffect(() => {
        const consentCookie = cookie.get("cookieConsent");

        if (!consentCookie) {
            setShowBanner(true);
        }
    }, []);

    const handleAccept = () => {
        setShowBanner(false);
        cookie.set("cookieConsent", "accepted", { expires: 365 });
    };

    const handleReject = () => {
        setShowBanner(false);
        cookie.set("cookieConsent", "rejected", { expires: 365 });
    };

    if (!showBanner) {
        return null;
    }

    return (
        <>

            <div className="fixed bottom-0 left-0 w-full z-50">
                <p>We use cookies</p>
                <p>Please, accept these sweeties to continue enjoying our site!</p>
                <button onClick={handleAccept}>Accept</button> <br />
                <button onClick={handleReject}>Close</button>
            </div>

        </>
    );
};

export default CookieConsentBanner;