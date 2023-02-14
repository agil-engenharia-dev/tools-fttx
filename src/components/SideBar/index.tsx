import { SideBarContainer } from "./style";

interface props {
  handleAppSelected: (text: string) => void;
}
export function SideBar({ handleAppSelected }: props) {
  return (
    <SideBarContainer>
      <img src="https://i.ibb.co/X7y9BBL/image002-5f3f8cb5.png"></img>
      <button
        onClick={() => {
          handleAppSelected("app1");
        }}
      >
        <h1>App1</h1>
        <p>
          Uma ferramenta eficiente para remover múltiplos elementos de arquivos
          KML sem afetar a estrutura de pastas do seu projeto
        </p>
      </button>
    </SideBarContainer>
  );
}
