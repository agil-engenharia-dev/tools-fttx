import { NumberInputContainer } from "./style"

interface props{
    changeRadiusOfPoints:()=>void
}
export function InputRadiusPoints({changeRadiusOfPoints}:props){
    return(
    <NumberInputContainer className={'leaflet-control'} type="number" min="1" max="20">
    </NumberInputContainer>
    )
}