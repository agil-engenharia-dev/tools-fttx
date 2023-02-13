import { MapboxMap } from "./components/MapBackgroundRotating/index";
import { WindowFileInput } from "./components/WindowFileInput/index";
import { GlobalStyle } from "./styles/global";
import { SideBar } from "./components/SideBar/index";
import { App1 } from "./components/App1";
import { useState, useEffect,useMemo} from "react";

export function App() {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [appSelected, setAppSelected] = useState<string | null>(null);
  const MapboxMapComponent = useMemo(() => <MapboxMap />, []);

  const handleAppSelected = (text:string) => setAppSelected(text);
  const handleFileContent = (text:string) => setFileContent(text);

  return (
    <div>
      {fileContent && !appSelected && (<SideBar handleAppSelected={handleAppSelected}/>)}
      {!fileContent && (<WindowFileInput handleFileContent={handleFileContent}/>)}
      {fileContent && appSelected && <App1 fileContent={fileContent}/>}
      {!appSelected && MapboxMapComponent}
      <GlobalStyle/>
    </div>
  );
}

