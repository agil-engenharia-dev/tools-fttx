import styled from "styled-components";

export const SideBarContainer = styled.div`
    position: absolute;
    display: flex;
    flex-direction: column;
    align-items: center;
    background: #2E2E2E;
    opacity: .8;
    width: 400px;
    height: 100%;
    z-index: 1;

    img{
        margin-top: 30px;
        height:110px;
        opacity: .5;
    }

    button{
        border: none;
        background-color: #121212;
        opacity: .7;
        margin: 50px;
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
        background-color: #364F79;
        opacity: 1;
    }

`