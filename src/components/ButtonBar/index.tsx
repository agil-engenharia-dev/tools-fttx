import React from "react"
import { ButtonBarContainer } from "./style";


type ButtonBarProps = {
    children: React.ReactNode;
  }

export function ButtonBar({ children }:ButtonBarProps) {
    return (
      <ButtonBarContainer className={'leaflet-control'}>
        {children}
      </ButtonBarContainer>
    );
  };