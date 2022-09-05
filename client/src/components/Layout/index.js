import React, { useState } from 'react';
import { 
    ThemeProvider, 
    Container,
    unityTheme,
    unityDarkTheme,
    Page,
  } from "@exxonmobil/react-unity";
  import Header from 'components/Header';
  import Footer from 'components/Footer';
  
  /**
   * 
   * The main layout of the application. Uses a ThemeProvider to toggle 
   * between a light and dark theme, and a React Unity Page component to set the layout of the page.
   * 
   * To learn more about the ThemeProvider in React Unity, see: https://reactunity.azurewebsites.net/#/Theme?id=themeprovider
   * 
   * To learn more about the Page and other possible layouts in React Unity, see: https://reactunity.azurewebsites.net/#/Layouts
   * 
   */
  
  function Layout({ children, ...props }) {
  
    const [inDarkMode, setInDarkMode] = useState(false);
  
    return (
      <ThemeProvider theme={inDarkMode ? unityDarkTheme : unityTheme}>
          <Page>
            <Page.Header>
              <Header inDarkMode={inDarkMode} onDarkModeChange={setInDarkMode} />
            </Page.Header>
            <Page.Body className="main">
              <Container className="content">
                {children}
              </Container>
            </Page.Body>
            <Page.Footer>
              <Footer />
            </Page.Footer>
          </Page>
      </ThemeProvider>
    );
  }
  
  export default Layout;
  