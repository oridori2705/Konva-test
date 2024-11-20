import { ChangeEvent } from "react";

interface StrokeWidthAdjusterProps {
  strokeWidth: number;
  setStrokeWidth: (width: number) => void;
}

const StrokeWidthAdjuster = ({
  strokeWidth,
  setStrokeWidth,
}: StrokeWidthAdjusterProps) => {
  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStrokeWidth(Number(event.target.value));
  };

  return (
    <div>
      <input
        type="range"
        min="5"
        max="50"
        value={strokeWidth}
        className="slider"
        id="myRange"
        onChange={handleSliderChange}
      />
      <p>
        선 두께: <span id="value">{strokeWidth}</span>
      </p>
    </div>
  );
};

export default StrokeWidthAdjuster;
