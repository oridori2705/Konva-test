import { memo } from "react";
import { Button, DrawButton } from "../style/Stage.Styled";

interface DrawAction {
  label: string;
  action: string;
}

interface DrawActionPaletteProps {
  onClear: () => void;
  currentAction: string;
  setDrawAction: (action: string) => void;
}

const drawActions: DrawAction[] = [
  { label: "화살표", action: "arrow" },
  { label: "직선", action: "line" },
  { label: "곡선", action: "spline" },
  { label: "직사각형", action: "rectangle" },
  { label: "원", action: "circle" },
  { label: "그리기", action: "freeLine" },
  { label: "다각형", action: "polygon" },
];

const DrawActionPalette = memo(
  ({ onClear, setDrawAction, currentAction }: DrawActionPaletteProps) => {
    return (
      <>
        {drawActions.map(({ label, action }) => (
          <DrawButton
            currentButton={action === currentAction}
            key={label}
            onClick={() => setDrawAction(action)}
          >
            {label}
          </DrawButton>
        ))}
        <Button onClick={onClear}>모두 지우기</Button>
      </>
    );
  }
);

DrawActionPalette.displayName = "DrawActionPaletteComponent";

export default DrawActionPalette;
