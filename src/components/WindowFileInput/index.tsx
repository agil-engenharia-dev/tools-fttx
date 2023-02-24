import { ChangeEvent, useState } from "react";
import { FileInputContainer } from "./style";

interface props {
  handleFileContent: (text: string) => void;
  namefile?:string;
}

export function WindowFileInput({ handleFileContent , namefile}: props) {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
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
        <button onClick={handleUploadClick}>Enviar</button>
      </div>
    </FileInputContainer>
  );
}
