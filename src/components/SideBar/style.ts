import styled from "styled-components";

interface props{}

export const SideBarContainer = styled.div<props>`
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: ${props=>props.theme.secondary};
    opacity: .8;
    width: 400px;
    height: 100%;
    z-index: 1;

    img{
        margin-top: 30px;
        opacity: 1;
    }

    button{
        border: none;
        background-color: ${props=>props.theme.secondary};
        border: 2px solid ${props=>props.theme.primary};
        opacity: .7;
        margin: 20px 50px 20px 50px;
        border-radius: 10px;
        box-shadow: 2px 2px 2px 1px rgba(0, 0, 0, 0.2);
        
        h1{
            padding-top: 10px;
        }

        p{
            padding:10px;
        }
        
    }
    button:hover{
        background-color: ${props=>props.theme.primary};;
        opacity: 1;
    }

`