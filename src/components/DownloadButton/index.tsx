import { ButtonContainer } from "../ButtonStyle/style"

interface props{
    saveKml:()=>void
}

export function DownloadButton({saveKml}:props){
    return (<ButtonContainer title="Download" onClick={saveKml}>⭳</ButtonContainer>)

}