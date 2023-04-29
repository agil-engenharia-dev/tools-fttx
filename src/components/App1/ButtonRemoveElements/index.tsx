import { ButtonContainer } from "../../ButtonStyle/style"
import { TrashButtonContainer } from "../../TrashButtonContainer/style"
import {SlClose} from 'react-icons/sl'
interface props{
    removeElementsInPolygon:()=>void
}

export function ButtonRemoveElements({removeElementsInPolygon}:props){
    return (<ButtonContainer title="Remove Point In Polygons" onClick={removeElementsInPolygon}><SlClose/></ButtonContainer>)
}