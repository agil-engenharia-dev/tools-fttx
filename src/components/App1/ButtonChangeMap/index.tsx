import { ButtonContainer } from "../ButtonStyle/style";

interface props {
    changeMap:()=>void;
}

export function ButtonChangeMap({changeMap}:props){
    return(
    <ButtonContainer onClick={changeMap} title="trocar mapa">
        <img src="https://cdn-icons-png.flaticon.com/512/235/235861.png" alt="botao troca mapa" />
    </ButtonContainer>
    )
}