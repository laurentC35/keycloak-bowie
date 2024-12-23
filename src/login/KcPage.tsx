import { Suspense, lazy } from "react";
import type { ClassKey } from "keycloakify/login";
import type { KcContext } from "./KcContext";
import { useI18n } from "./i18n";
import DefaultPage from "keycloakify/login/DefaultPage";
import Template from "./Template";
import { tss } from "tss-react/mui";
import { createTheme, ThemeProvider } from "@mui/material";
import backgroundJpgUrl from "./assets/img/background.jpg";

const UserProfileFormFields = lazy(() => import("./UserProfileFormFields"));

const doMakeUserConfirmPassword = true;

const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));

const theme = createTheme({
    palette: {
        mode: "dark",
        background: {
            default: "#000000",
            paper: "#111111"
        },
        text: { primary: "#fff", secondary: "#A1A1A1" }
    }
});

export default function KcPage(props: { kcContext: KcContext }) {
    return (
        <ThemeProvider theme={theme}>
            <KcPageContextualized {...props} />
        </ThemeProvider>
    );
}

const KcPageContextualized = (props: { kcContext: KcContext }) => {
    const { kcContext } = props;

    const { i18n } = useI18n({ kcContext });

    const { classes } = useStyles();

    return (
        <Suspense>
            {(() => {
                switch (kcContext.pageId) {
                    case "login.ftl":
                        return (
                            <Login
                                {...{ kcContext, i18n, classes }}
                                Template={Template}
                                doUseDefaultCss={true}
                            />
                        );
                    case "register.ftl":
                        return (
                            <Register
                                {...{ kcContext, i18n, classes }}
                                Template={Template}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                    default:
                        return (
                            <DefaultPage
                                kcContext={kcContext}
                                i18n={i18n}
                                classes={classes}
                                Template={Template}
                                doUseDefaultCss={true}
                                UserProfileFormFields={UserProfileFormFields}
                                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
                            />
                        );
                }
            })()}
        </Suspense>
    );
};

const useStyles = tss.create(
    ({ theme }) =>
        ({
            kcHeaderClass: {
                color: "white",
                "text-align": "center"
            },
            kcFormCardClass: {
                backgroundColor: "#2d323e",
                margin: "auto",
                padding: 20,
                width: "auto",
                maxWidth: "500px"
            },
            kcHtmlClass: {
                ":root": {
                    colorScheme: "dark"
                }
            },
            kcBodyClass: {
                color: theme.palette.text.primary,
                background: `url(${backgroundJpgUrl}) no-repeat center center fixed`
            }
        }) satisfies { [key in ClassKey]?: unknown }
);
