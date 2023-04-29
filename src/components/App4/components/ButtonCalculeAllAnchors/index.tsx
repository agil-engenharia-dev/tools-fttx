import { ButtonContainer } from "../../../ButtonStyle/style"
import {RiGitBranchLine} from 'react-icons/ri'
interface props{
    calculeAllAnchors:()=>void
}

export function ButtonCalculeAllAnchors({calculeAllAnchors}:props){
    return (<ButtonContainer title="Calcular Todos" onClick={calculeAllAnchors}><RiGitBranchLine/></ButtonContainer>)
}