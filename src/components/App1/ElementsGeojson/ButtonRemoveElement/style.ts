import styled from 'styled-components'

export const ButtonRemoveElementContainer = styled.button`
    font-size: 1.6rem;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 5px;
    border: 2px solid rgb(231, 50, 50);
    background-color: #000;
    cursor: pointer;
    box-shadow: 0 0 10px #333;
    overflow: hidden;
    transition: .3s;
    :hover {
    background-color: rgb(245, 50, 50);
    transform: scale(1.2);
    box-shadow: 0 0 4px #111;
    transition: .3s;
    }
    ::after{
            content: '🗑';
        }
`