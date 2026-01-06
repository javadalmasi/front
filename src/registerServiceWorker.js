/* eslint-disable no-console */

import { registerSW } from "virtual:pwa-register";
import { debugLogger } from "./utils/DebugLogger";

if (process.env.NODE_ENV === "production") {
    // Register service worker with update functionality
    registerSW({
        onNeedRefresh() {
            // Dispatch a custom event to notify the app about the update
            window.dispatchEvent(new CustomEvent('pwaUpdateAvailable'));
        },
        onRegisteredSW(swScriptUrl, registration) {
            debugLogger.log('Service Worker registered with scope:', registration?.scope);

            // Check for updates periodically
            if (registration && registration.active) {
                setInterval(() => {
                    registration.update();
                }, 60000); // Check for updates every minute
            }
        },
        onRegisterError(error) {
            debugLogger.error('Service Worker registration error:', error);
        }
    });
}
