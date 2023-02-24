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
import { App2 } from "./components/App2";
import { App3 } from "./components/App3";

export function App() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [appSelected, setAppSelected] = useState<string | null>(null);
  const [themeContext, setThemeContext] = useState<ThemeType>(defaultTheme);
  const MapboxMapComponent = useMemo(
    () => <MapboxMap theme={themeContext} />,
    []
  );
  const handleAppSelected = (text: string) => setAppSelected(text);
  const handleFileContent = (text: string) => setFileContent(text);

  const renderSideBar = () => {
    
    if (!fileContent && !appSelected) {
      return <SideBar handleAppSelected={handleAppSelected} />;
    }
    return null;
  };

  const renderFileInputWindow = () => {
    if (!fileContent && appSelected) {
      return <WindowFileInput handleFileContent={handleFileContent} namefile='projeto.kml'/>;
    }
    return null;
  };

  const renderMapboxMapComponent = () => {
    if (!appSelected || !fileContent) {
      return MapboxMapComponent;
    }
    return null;
  };

  const renderApps = () => {
    if (fileContent && appSelected) {
      if (appSelected==='app1')
        return <App1 fileContent={fileContent} />;
      if (appSelected==='app2')
        return <App2 fileContent={fileContent} />;
      if (appSelected==='app3')
        return <App3 fileContent={fileContent} />;
    }
    return null;
  };
  return (
    <ThemeProvider theme={themeContext}>
      {renderFileInputWindow()}
      {renderSideBar()}
      {renderApps()}
      {renderMapboxMapComponent()}
      <GlobalStyle />
    </ThemeProvider>
  );
}