import { ButtonContainer } from "../../ButtonStyle/style"

interface props{
    removeNotUsedPoints:()=>void
}

export function ButtonRemovePointsNotUsed({removeNotUsedPoints}:props){
    return (<ButtonContainer title="Remove Point Not Used" onClick={removeNotUsedPoints}>☨</ButtonContainer>)
}