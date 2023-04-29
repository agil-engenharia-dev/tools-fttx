import { ButtonContainer } from "../ButtonStyle/style";

export function ButtonHome() {
  return (
    <ButtonContainer 
      className={'leaflet-control'} 
      onClick={() => location.reload()} 
      style={{'position':'absolute', 'top':'5px', 'left':'5px' }}
      title={'Home'}
      >
      <img src="https://i.ibb.co/X7y9BBL/image002-5f3f8cb5.png"></img>
    </ButtonContainer>
  );
}
