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
          KML sem afetar a estrutura de pastas do seu projeto.
        </p>
      </button>

      <button
        onClick={() => {
          handleAppSelected("app2");
        }}
      >
        <h1>App2</h1>
        <p>
          Ferramenta capaz de remover postes e pontos que não estão sendo utilizados em projetos FTTH,
          com o objetivo de enviar apenas as informações relevantes para a concessionária.
        </p>
      </button>


      <button
        onClick={() => {
          handleAppSelected("app3");
        }}
      >
        <h1>App3</h1>
        <p>
          Ferramenta oferece uma solução sofisticada para o dimensionamento preciso dos materiais necessários para projetos FTTH, calculando de forma inteligente a localização ideal para ancoragem dos cabos em postes.
        </p>
      </button>
    </SideBarContainer>
  );
}
