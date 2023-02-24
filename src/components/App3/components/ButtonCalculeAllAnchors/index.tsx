import { ButtonContainer } from "../../../ButtonStyle/style"

interface props{
    calculeAllAnchors:()=>void
}

export function ButtonCalculeAllAnchors({calculeAllAnchors}:props){
    return (<ButtonContainer title="Calcular Todos" onClick={calculeAllAnchors}>…</ButtonContainer>)
}