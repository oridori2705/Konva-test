import Konva from "konva";

export type Shape = {
  id: string;
  color: string;
  x?: number;
  y?: number;
};

export type RectangleType = Shape & {
  width: number;
  height: number;
  x: number;
  y: number;
};

export type CircleType = Shape & {
  radius: number;
  x: number;
  y: number;
};

export type FreeLineType = Shape & {
  points: number[];
};

export type PolygonType = Shape & {
  points: number[];
  closed?: boolean;
};

export type LineType = Shape & {
  points: [number, number, number, number];
};

export type SplineType = Shape & {
  points: number[];
};

export type KonvaElement =
  | {
      className: "Line";
      attrs: Konva.LineConfig;
    }
  | {
      className: "Rect";
      attrs: Konva.RectConfig;
    }
  | {
      className: "Circle";
      attrs: Konva.CircleConfig;
    };
