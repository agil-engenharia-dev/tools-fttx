import { ButtonContainer } from "../../../ButtonStyle/style"

interface props{
    calculeAnchorsInPolygons:()=>void
}

export function ButtonCalculeAnchorsInPolygons({calculeAnchorsInPolygons}:props){
    return (<ButtonContainer title="Calcular" onClick={calculeAnchorsInPolygons}>⸳</ButtonContainer>)
}