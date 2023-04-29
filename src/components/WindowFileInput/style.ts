import styled from "styled-components";

interface props{
    file:boolean;
}

export const FileInputContainer = styled.div<props>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 300px;
    border-radius: 20px;
    background-color: ${props=>props.theme.secondary};
    opacity: .8;
    z-index: 1;

    img{
        padding-top:30px;
        padding-bottom: 10px;
        height: 110px;
        opacity: 1;
    }

    label{

    }

    div{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        input::file-selector-button, button{
            border: none;
            background-color: ${props=>props.theme.primary};
            color: ${props=>props.theme.fontColor};
            padding: 10px 20px;
            border-radius: 10px;
            cursor: pointer;
            transition: .5s;
            width: 150px;
            height: 50px;
            opacity: 1;
        }
        
        section{
            display: flex;
            gap :20%;
        }

        button{
            ${props=>{
            return(!props.file && `
                background-color:${props.theme.secondary};
                border:2px solid ${props.theme.primary};
                cursor: initial;
                `)
            }}

        }

        
        input::file-selector-button{
            margin-right: 30px;
        }
    }

`
