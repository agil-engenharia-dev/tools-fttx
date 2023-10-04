import { ButtonContainer } from "../ButtonStyle/style"
import {GrDocumentCsv} from 'react-icons/gr'
interface props{
    save:()=>void
}

export function DownloadButton({save}:props){
    return (<ButtonContainer title="Download" onClick={save}><GrDocumentCsv/></ButtonContainer>)

}