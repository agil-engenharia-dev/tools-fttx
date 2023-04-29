import { MapboxMap } from "./components/MapBackgroundRotating/index";
import { WindowFileInput } from "./components/WindowFileInput/index";
import { GlobalStyle } from "./styles/global";
import { SideBar } from "./components/SideBar/index";
import { App1 } from "./components/App1";
import { useState, useMemo } from "react";
import { ThemeProvider } from "styled-components";
import { defaultTheme } from "./styles/themes/default";
import { ThemeType } from "./@types/style";
import { App2 } from "./components/App2";
import { App3 } from "./components/App3";                           
import { App4 } from "./components/App4";

export function App() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [appSelected, setAppSelected] = useState<string | null>('app3');
  const [themeContext, setThemeContext] = useState<ThemeType>(defaultTheme);
  const MapboxMapComponent = useMemo(
    () => <MapboxMap theme={themeContext} />,
    []
  );
  const handleAppSelected = (text: string | null) => setAppSelected(text);
  const handleFileContent = (text: string) => setFileContent(text);

  const renderSideBar = () => {
    
    if (!fileContent && !appSelected) {
      return <SideBar handleAppSelected={handleAppSelected} />;
    }
    return null;
  };

  const renderFileInputWindow = () => {
    if (!fileContent && appSelected) {
      return <WindowFileInput handleFileContent={handleFileContent} handleAppSelected={handleAppSelected} namefile='projeto.kml'/>;
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
      switch(appSelected){
        case 'app1':return <App1 fileContent={fileContent} />;
        case 'app2':return <App2 fileContent={fileContent} />;
        case 'app3':return <App3 fileContent={fileContent} />;
        case 'app4':return <App4 fileContent={fileContent} />;
      }
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