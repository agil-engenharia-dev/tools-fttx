import { ButtonContainer } from "../../../ButtonStyle/style"
import {FaDrawPolygon} from 'react-icons/fa'
interface props{
    calculeAnchorsInPolygons:()=>void
}

export function ButtonCalculeAnchorsInPolygons({calculeAnchorsInPolygons}:props){
    return (<ButtonContainer title="Calcular ferragens do poligono" onClick={calculeAnchorsInPolygons}><FaDrawPolygon/></ButtonContainer>)
}