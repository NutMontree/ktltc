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
            <div className="lg:pb-[90px] lg:pt-[120px] fixed bottom-0 left-0 w-full z-50">
                <div className="container mx-auto">
                    <div className="flex flex-wrap items-center justify-between rounded-lg border border-stroke bg-gray-100 px-6 py-8 dark:border-dark-3 dark:bg-dark-2 xs:px-10 md:px-8 lg:px-10">
                        <div className="w-full md:w-7/12 lg:w-2/3">
                            <div className="mb-6 md:mb-0">
                                <h4 className="mb-1 text-xl font-semibold text-dark dark:text-white xs:text-2xl md:text-xl lg:text-2xl">
                                    We use cookies
                                </h4>
                                <p className="text-base text-body-color dark:text-dark-6">
                                    Please, accept these sweeties to continue enjoying our site!
                                </p>
                            </div>
                        </div>
                        <div className="w-full md:w-5/12 lg:w-1/3">
                            <div className="flex items-center space-x-3 md:justify-end">
                                <button className="inline-flex items-center justify-center rounded-md bg-primary px-7 py-3 text-center text-base font-medium text-white hover:bg-blue-dark">
                                    Accept
                                </button>
                                <button className="inline-flex items-center justify-center rounded-md bg-white px-7 py-3 text-center text-base font-medium text-body-color shadow-1 hover:bg-primary hover:text-white dark:bg-dark dark:text-dark-6 dark:shadow-none">
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default CookieConsentBanner;