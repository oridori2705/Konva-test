import styled from "@emotion/styled";

export const DrawBox = styled.div<{ size: number }>`
  border: 1px solid black;
  width: ${({ size }) => `${size}px`};
  height: ${({ size }) => `${size}px`};
`;

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  margin: 20px;
  gap: 5px;
`;

export const Button = styled.button`
  background-color: #6200ea;
  color: white;
  border: none;
  border-radius: 5px;
  padding: 10px 15px;
  margin: 0 10px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #3700b3;
  }

  &:active {
    background-color: #03dac6;
  }
`;

export const SubContainer = styled.div`
  display: flex;
  flex-direction: row;
`;
