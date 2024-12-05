import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { KcPage } from "./kc.gen";

// The following block can be uncommented to test a specific page with `yarn dev`
// Don't forget to comment back or your bundle size will increase

import { getKcContextMock } from "./login/KcPageStory";

if (import.meta.env.DEV) {
    window.kcContext = getKcContextMock({
        pageId: "register.ftl",
        overrides: {
            themeVersion: "keycloak.v2",
            realm: {
                name: "conception",
                displayName: "Atelier de Conception",
                displayNameHtml:
                    "<b>Filière d'enquête</b><hr/><h4>Atelier de conception d'enquête</h4>"
            },
            locale: {
                currentLanguageTag: "fr"
            }
        }
    });
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {!window.kcContext ? (
            <h1>No Keycloak Context</h1>
        ) : (
            <KcPage kcContext={window.kcContext} />
        )}
    </StrictMode>
);
