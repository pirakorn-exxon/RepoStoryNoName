import React from 'react';
import {
    HorizontalHeader,
    Button,
    SunIcon,
    MoonIcon
} from "@exxonmobil/react-unity";
import { useHistory, useLocation } from 'react-router-dom';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "../../authConfig";

/**
 * 
 * The main application header. To learn more about the Horizontal Header in React Unity,
 * visit: https://reactunity.azurewebsites.net/#/Headers%20and%20footers?id=horizontalheader
 * 
 * For Vertical Headers, see: https://reactunity.azurewebsites.net/#/Headers%20and%20footers?id=verticalheader
 * 
 * This example header comes prebuilt with a button to toggle darkmode. See src/App.js for the usage and implementation
 * of the ThemeProvider. 
 * 
 * This header also includes logic to navigate using react-router. For more, see: https://reactrouter.com/web/api
 * 
 * @prop {boolean} inDarkMode - Keeps track of whether or not the app is in dark mode
 * @prop {function} onDarkModeChange - Takes a boolean that sets the dark mode status
 */

function ProfileContent() {
    const { instance, accounts } = useMsal();
    const isAuthenticated = useIsAuthenticated();

    if (!isAuthenticated) {
        instance.loginRedirect(loginRequest).catch(e => {
            console.error(e);
        });
    }

    const name = accounts[0] && accounts[0].name;
    let profileGreeting = ''

    const myDate = new Date();
    const hrs = myDate.getHours();

    let greet;

    if (hrs < 12)
        greet = 'Good Morning';
    else if (hrs >= 12 && hrs <= 17)
        greet = 'Good Afternoon';
    else if (hrs >= 17 && hrs <= 24)
        greet = 'Good Evening';


    if (isAuthenticated){
        profileGreeting = greet +": "+name;
    }
    return (
        <>
            <span>{profileGreeting}</span>
        </>
    );
};

const Header = ({ inDarkMode, onDarkModeChange }) => {
    const history = useHistory();
    const location = useLocation();

    return (
        <HorizontalHeader
            variant="large"
            color="main"
            title="Repo Story"
            kicker="By Shared Services team"
        >
            <HorizontalHeader.Nav>
                <HorizontalHeader.Nav.Item
                    onClick={() => history.push("/")}
                    active={location.pathname === "/"}
                >
                    Home
                </HorizontalHeader.Nav.Item>
                <HorizontalHeader.Nav.Item
                    onClick={() => history.push("/about")}
                    active={location.pathname === "/about"}
                >
                    About
                </HorizontalHeader.Nav.Item>
                <HorizontalHeader.Nav.Item>
                    <Button variant="bare" onClick={() => onDarkModeChange(self => !self)}>
                        {inDarkMode ? <SunIcon /> : <MoonIcon />}
                    </Button>
                </HorizontalHeader.Nav.Item>
            </HorizontalHeader.Nav>
            <HorizontalHeader.GlobalNav>
                <HorizontalHeader.GlobalNav.Item className='em-is-aligned-right'>
                    <AuthenticatedTemplate>
                        <ProfileContent />
                    </AuthenticatedTemplate>
                    <UnauthenticatedTemplate>
                        <ProfileContent />
                    </UnauthenticatedTemplate>
                    {/* <AzureAD provider={authProvider} forceLogin={true}>
                        {
                            ({ login, logout, authenticationState, error, accountInfo }) => {
                                console.log(authenticationState);
                                switch (authenticationState) {
                                    case AuthenticationState.Authenticated: {
                                        const myDate = new Date();
                                        const hrs = myDate.getHours();

                                        let greet;

                                        if (hrs < 12)
                                            greet = 'Good Morning';
                                        else if (hrs >= 12 && hrs <= 17)
                                            greet = 'Good Afternoon';
                                        else if (hrs >= 17 && hrs <= 24)
                                            greet = 'Good Evening';
                                        return (
                                            <span>{greet}: {accountInfo.account.name}</span>
                                        )
                                    }

                                    case AuthenticationState.Unauthenticated:
                                        return (
                                            <span>An error occured during authentication, please try again!</span>
                                        )

                                    case AuthenticationState.InProgress:
                                        return (
                                            <span>Authenticating...</span>
                                        )
                                }
                            }
                        }
                    </AzureAD> */}

                </HorizontalHeader.GlobalNav.Item>

            </HorizontalHeader.GlobalNav>
        </HorizontalHeader>
    )
}

export default Header;