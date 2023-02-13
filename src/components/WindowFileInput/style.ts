import styled from "styled-components";

export const FileInputContainer = styled.div`
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
    background-color: #2E2E2E;
    opacity: .8;
    z-index: 1;

    img{
        padding-top:30px;
        width: 100px;
        height: 110px;
        opacity: .5;
    }

    div{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        input::file-selector-button,button{
            border: none;
            background: #364F79;
            padding: 10px 20px;
            border-radius: 10px;
            color: #fff;
            cursor: pointer;
            transition: .5s;
            width: 150px;
            height: 50px;
            opacity: .6;
        }

        input::file-selector-button{
            margin-right: 30px;
        }
        input::file-selector-button:hover{
            opacity:1;
        }
        button:hover{
            opacity:1;
        }
    }

`
