import { memo } from "react";
import {
  ColorPaletteButton,
  ColorPaletteContainer,
} from "../style/Stage.Styled";

export type ColorCode =
  | "#000000"
  | "#FF5733"
  | "#33FF57"
  | "#3357FF"
  | "#F1C40F"
  | "#9B59B6"
  | "#E67E22"
  | "#2ECC71"
  | "#3498DB";

const colors: ColorCode[] = [
  "#000000",
  "#FF5733",
  "#33FF57",
  "#3357FF",
  "#F1C40F",
  "#9B59B6",
  "#E67E22",
  "#2ECC71",
  "#3498DB",
];

interface ColorPaletteProps {
  currentColor: string;
  onColorChange: (color: ColorCode) => void;
}

const ColorPalette = memo(
  ({ currentColor, onColorChange }: ColorPaletteProps) => {
    const handleColorClick = (color: ColorCode) => {
      onColorChange(color);
    };

    return (
      <ColorPaletteContainer>
        {colors.map((color) => (
          <ColorPaletteButton
            key={color}
            onClick={() => handleColorClick(color)}
            color={color}
            currentColor={currentColor === color}
          />
        ))}
      </ColorPaletteContainer>
    );
  }
);

ColorPalette.displayName = "ColorPaletteComponent";

export default ColorPalette;
