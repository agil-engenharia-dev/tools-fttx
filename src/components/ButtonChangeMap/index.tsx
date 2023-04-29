import { ButtonContainer } from "../ButtonStyle/style";
import {FiMap} from 'react-icons/fi'
interface props {
    changeMap:()=>void;
}

export function ButtonChangeMap({changeMap}:props){
    return(
    <ButtonContainer onClick={changeMap} title="Change Map">
        <FiMap/>
    </ButtonContainer>
    )
}