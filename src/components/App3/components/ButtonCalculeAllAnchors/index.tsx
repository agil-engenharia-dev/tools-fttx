import { ButtonContainer } from "../../../ButtonStyle/style"
import {MdOutlinePolyline} from 'react-icons/md'
interface props{
    calculeAllAnchors:()=>void
}

export function ButtonCalculeAllAnchors({calculeAllAnchors}:props){
    return (<ButtonContainer title="Calcular Todos" onClick={calculeAllAnchors}><MdOutlinePolyline/></ButtonContainer>)
}