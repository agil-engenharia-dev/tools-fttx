import { SideBarContainer } from "./style"
interface props {
    handleAppSelected:(text:string)=>void;
}
export function SideBar({handleAppSelected}:props){
    return (
        <SideBarContainer>
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Google_Earth_icon.svg"></img>
            <button onClick={()=>{handleAppSelected('app1')}}>
                <h1>App1</h1>
                <p>
                    is simply dummy text of the printing and typesetting industry. 
                    Lorem Ipsum has been the industry's standard dummy text ever since 
                </p>
            </button>
        </SideBarContainer>
    )
}