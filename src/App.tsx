import { MapboxMap } from "./components/MapBackgroundRotating/index";
import { WindowFileInput } from "./components/WindowFileInput/index";
import { GlobalStyle } from "./styles/global";
import { SideBar } from "./components/SideBar/index";
import { App1 } from "./components/App1";
import { useState, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "./styles/themes/default";
import { darkTheme } from "./styles/themes/dark";
import { ThemeType } from "./@types/style";

export function App() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [appSelected, setAppSelected] = useState<string | null>(null);
  const [themeContext, setThemeContext] = useState<ThemeType>(darkTheme);
  const MapboxMapComponent = useMemo(
    () => <MapboxMap theme={themeContext} />,
    []
  );
  const handleAppSelected = (text: string) => setAppSelected(text);
  const handleFileContent = (text: string) => setFileContent(text);

  const renderSideBar = () => {
    
    if (fileContent && !appSelected) {
      setThemeContext(defaultTheme)
      return <SideBar handleAppSelected={handleAppSelected} />;
    }
    return null;
  };

  const renderFileInputWindow = () => {
    if (!fileContent) {
      return <WindowFileInput handleFileContent={handleFileContent} />;
    }
    return null;
  };

  const renderMapboxMapComponent = () => {
    if (!appSelected) {
      return MapboxMapComponent;
    }
    return null;
  };

  const renderApp1 = () => {
    if (fileContent && appSelected) {
      return <App1 fileContent={fileContent} />;
    }
    return null;
  };
  return (
    <ThemeProvider theme={themeContext}>
      {renderFileInputWindow()}
      {renderSideBar()}
      {renderApp1()}
      {renderMapboxMapComponent()}
      <GlobalStyle />
    </ThemeProvider>
  );
}