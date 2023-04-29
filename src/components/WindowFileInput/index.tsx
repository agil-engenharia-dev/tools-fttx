import { ChangeEvent, useState } from "react";
import { FileInputContainer } from "./style";
import JSZip from 'jszip';
interface props {
  handleFileContent: (text: string) => void;
  handleAppSelected: (text: string | null) => void;
  namefile?:string;
}

export function WindowFileInput({ handleFileContent ,handleAppSelected, namefile}: props) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const file = e.target.files[0];
  
      // Verifica a extensão do arquivo
      const isKMZ = file.name.endsWith('.kmz');
      const isKML = file.name.endsWith('.kml');
  
      if (isKML) {
        setFile(file);
      } else if (isKMZ) {
        // Descompacta o arquivo KMZ e obtém o conteúdo KML
        const reader = new FileReader();
        reader.onload = async () => {
          const zip = new JSZip();
          const result = await zip.loadAsync(reader.result as ArrayBuffer);
          const kml = await result.file(/\.kml$/i)[0].async('text');
          const kmlFile = new File([kml], `${file.name.slice(0, -4)}.kml`, { type: 'application/vnd.google-earth.kml+xml' });
          setFile(kmlFile);
        };
        reader.readAsArrayBuffer(file);
      } else {
        console.error('O arquivo deve ser do tipo KMZ ou KML');
      }
    }
  };

  const handleFileRead = (e: ProgressEvent<FileReader>) => {
    if (e.target?.result === null) {
      return;
    }
    handleFileContent(e.target!.result as string);
  };

  const handleUploadClick = () => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = handleFileRead;
    reader.readAsText(file);
  };
  
  return (
    <FileInputContainer file={file ? true : false}>
      <img src="https://i.ibb.co/X7y9BBL/image002-5f3f8cb5.png"></img>
      {namefile && <label>Envie o arquivo {namefile}</label>}
      <div>
        <input type="file" onChange={handleFileChange}></input>
        <section>
          {/* <button onClick={()=>handleAppSelected(null)}>Voltar</button> */}
          <button onClick={handleUploadClick}>Enviar</button>

        </section>
      </div>
    </FileInputContainer>
  );
}
