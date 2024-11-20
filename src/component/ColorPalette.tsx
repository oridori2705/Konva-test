import { memo } from "react";

export type ColorCode =
  | "#000"
  | "#FF5733"
  | "#33FF57"
  | "#3357FF"
  | "#F1C40F"
  | "#9B59B6"
  | "#E67E22"
  | "#2ECC71"
  | "#3498DB";

const colors: ColorCode[] = [
  "#000",
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
  onColorChange: (color: ColorCode) => void;
}

const ColorPalette = memo(({ onColorChange }: ColorPaletteProps) => {
  const handleColorClick = (color: ColorCode) => {
    onColorChange(color);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {colors.map((color) => (
        <button
          key={color}
          onClick={() => handleColorClick(color)}
          style={{
            backgroundColor: color,
            color: "#fff",
            border: "none",
            padding: "10px",
            margin: "5px 0",
            cursor: "pointer",
            borderRadius: "5px",
          }}
        ></button>
      ))}
    </div>
  );
});

ColorPalette.displayName = "ColorPaletteComponent";

export default ColorPalette;
