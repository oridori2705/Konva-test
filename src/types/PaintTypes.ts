import Konva from "konva";
import { CircleConfig } from "konva/lib/shapes/Circle";
import { LineConfig } from "konva/lib/shapes/Line";
import { RectConfig } from "konva/lib/shapes/Rect";

export type RectangleType = {
  width: number;
  height: number;
  x: number;
  y: number;
} & RectConfig;

export type CircleType = {
  radius: number;
  x: number;
  y: number;
} & CircleConfig;

export type FreeLineType = {
  points: number[];
} & LineConfig;

export type PolygonType = {
  points: number[];
  closed?: boolean;
} & LineConfig;

export type LineType = {
  points: [number, number, number, number];
} & LineConfig;

export type SplineType = {
  points: number[];
} & LineConfig;

export type KonvaElement =
  | {
      className: "Line";
      attrs: { timeStamp: number } & Konva.LineConfig;
    }
  | {
      className: "Rect";
      attrs: { timeStamp: number } & Konva.RectConfig;
    }
  | {
      className: "Circle";
      attrs: { timeStamp: number } & Konva.CircleConfig;
    }
  | {
      className: "Rect";
      attrs: { timeStamp: number } & Konva.RectConfig;
    };
