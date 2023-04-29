import styled from "styled-components";

export const StyledTable = styled.table`
border: 1px solid black;
border-collapse: collapse;
width: 100%;

th,
td {
  padding: 10px;
  border: 2px solid black;
  text-align: center;
}

th {
  background-color: gray;
}
`;
