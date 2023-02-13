import { ChangeEvent, useState } from "react";
import { FileInputContainer } from "./style";


interface props{
  handleFileContent:(text:string)=>void;
}

export function WindowFileInput({handleFileContent}:props) {
  const [file, setFile] = useState<File | null>(null);
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  function handleFileRead(e: ProgressEvent<FileReader>) {
    if (e.target?.result === null) {
    return;
    }
    handleFileContent(e.target!.result as string);
  }

  function handleUploadClick() {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onloadend = handleFileRead;
    reader.readAsText(file);
  }
  return (
    <FileInputContainer>
      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Google_Earth_icon.svg"></img>
      <div>
        <input type="file" onChange={handleFileChange}></input>
        <button onClick={handleUploadClick}>Enviar</button>
      </div>
    </FileInputContainer>
  );
}
