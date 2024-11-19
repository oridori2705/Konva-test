import { useCallback, useRef, useState } from "react";
import { Arrow, Circle, Layer, Line, Rect, Stage } from "react-konva";
import {
  LineType,
  CircleType,
  FreeLineType,
  PolygonType,
  RectangleType,
  SplineType,
} from "./types/PaintTypes";
import { Button, Container, DrawBox } from "./style/Stage.Styled";
const SIZE = 500;

const DrawAction = {
  Select: "select",
  Rectangle: "rectangle",
  Circle: "circle",
  freeLine: "freeLine",
  Arrow: "arrow",
  Polygon: "polygon",
  Line: "line",
  Spline: "spline",
};

function App() {
  const [color, setColor] = useState("#000");
  const [drawAction, setDrawAction] = useState(DrawAction.Select);
  const [arrow, setArrow] = useState<LineType>();
  const [rectangle, setRectangle] = useState<RectangleType>();
  const [circle, setCircle] = useState<CircleType>();
  const [freeLine, setFreeLine] = useState<FreeLineType>();
  const [polygon, setPolygon] = useState<PolygonType>();
  const [line, setLine] = useState<LineType>();
  const [spline, setSpline] = useState<SplineType>();

  const stageRef = useRef<any>(null);
  const isPaintRef = useRef(false);

  const onStageMouseDown = useCallback(() => {
    if (drawAction === DrawAction.Select) return;

    isPaintRef.current = true;

    const stage = stageRef?.current;

    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;

    switch (drawAction) {
      case DrawAction.Arrow: {
        setArrow({ id: "1", color, points: [x, y, x, y] });
        break;
      }
      case DrawAction.Line: {
        setLine({ id: "2", color, points: [x, y, x, y] });
        break;
      }
      case DrawAction.Spline: {
        setSpline((prev) => {
          const initPoints: number[] = [x, y];
          const prevInit = prev ? prev : { id: "3", color, points: initPoints };
          if (
            prevInit.points.length === 6 &&
            prevInit.points[0] === prevInit.points[2] &&
            prevInit.points[1] === prevInit.points[3]
          ) {
            const [x1, y1, , , x3, y3] = prevInit.points;
            return { ...prevInit, points: [x1, y1, x, y, x3, y3] };
          }
          return prevInit;
        });
        break;
      }
      case DrawAction.Rectangle: {
        setRectangle({ id: "4", color, x, y, height: 1, width: 1 });
        break;
      }
      case DrawAction.Circle: {
        setCircle({ id: "5", color, x, y, radius: 1 });
        break;
      }
      case DrawAction.freeLine: {
        setFreeLine({ id: "6", color, points: [x, y] });
        break;
      }
      case DrawAction.Polygon: {
        setPolygon((prev) => {
          const newPoints: number[] = [...(prev?.points || []), x, y];
          const prevInit = prev ? prev : { id: "7", color, points: newPoints };

          if (newPoints.length > 2) {
            const firstX = newPoints[0];
            const firstY = newPoints[1];
            const dist = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);

            if (dist < 5) {
              return {
                ...prevInit,
                points: newPoints,
                closed: true,
              };
            }
          }
          return { id: "7", color, points: newPoints };
        });
        break;
      }
    }
  }, [drawAction, color]);

  const onStageMouseMove = useCallback(() => {
    if (drawAction === DrawAction.Select || !isPaintRef.current) return;

    const stage = stageRef?.current;
    const pos = stage?.getPointerPosition();
    const x = pos?.x || 0;
    const y = pos?.y || 0;

    switch (drawAction) {
      case DrawAction.Arrow: {
        setArrow((prev) => {
          const prevInit = prev
            ? prev
            : { id: "1", color, points: [x, y, x, y] };
          return {
            ...prevInit,
            points: [prevInit.points[0] || 0, prevInit.points[1] || 0, x, y],
          };
        });
        break;
      }
      case DrawAction.Line: {
        setLine((prev) => {
          const prevInit = prev
            ? prev
            : { id: "2", color, points: [x, y, x, y] };
          return {
            ...prevInit,
            points: [prevInit.points[0], prevInit.points[1], x, y],
          };
        });
        break;
      }
      case DrawAction.Spline: {
        setSpline((prev) => {
          if (!prev) return prev;
          if (
            prev.points.length === 6 &&
            prev.points[0] !== prev.points[2] &&
            prev.points[1] !== prev.points[3]
          ) {
            const [x1, y1, , , x3, y3] = prev.points;
            return { ...prev, points: [x1, y1, x, y, x3, y3] };
          } else if (prev.points.length <= 6) {
            const [x1, y1] = prev.points;
            return { ...prev, points: [x1, y1, x1, y1, x, y] };
          }
        });
        break;
      }
      case DrawAction.Rectangle: {
        setRectangle((prev) => {
          const prevInit = prev
            ? prev
            : { id: "4", color, x: 0, y: 0, height: 1, width: 1 };
          return {
            ...prevInit,
            height: y - prevInit.y,
            width: x - prevInit.x,
          };
        });
        break;
      }
      case DrawAction.Circle: {
        setCircle((prev) => {
          const prevInit = prev
            ? prev
            : { id: "5", color, x: 0, y: 0, radius: 1 };
          return {
            ...prevInit,
            radius: ((x - prevInit.x) ** 2 + (y - prevInit.y) ** 2) ** 0.5,
          };
        });
        break;
      }
      case DrawAction.freeLine: {
        setFreeLine((prev) => {
          const prevInit = prev ? prev : { id: "6", color, points: [x, y] };
          return {
            ...prevInit,
            points: [...prevInit.points, x, y],
          };
        });
        break;
      }
      case DrawAction.Polygon: {
        setPolygon((prev) => {
          const newPoints: number[] = [...(prev?.points || []), x, y];
          const prevInit = prev ? prev : { id: "7", color, points: newPoints };
          if (prevInit.points.length <= 2)
            return {
              ...prevInit,
              points: [prevInit.points[0], prevInit.points[1], x, y],
            };

          const currentPoints = [...prevInit.points.slice(0, -2), x, y];
          return { ...prevInit, points: currentPoints };
        });
        break;
      }
    }
  }, [drawAction, color]);

  const onStageMouseUp = useCallback(() => {
    if (drawAction === DrawAction.Polygon && !polygon?.closed) return;
    isPaintRef.current = false;
  }, [drawAction, polygon]);

  return (
    <Container>
      <div>
        <Button onClick={() => setDrawAction("arrow")}>화살표</Button>
        <Button onClick={() => setDrawAction("line")}>직선</Button>
        <Button onClick={() => setDrawAction("spline")}>곡선</Button>
        <Button onClick={() => setDrawAction("rectangle")}>직사각형</Button>
        <Button onClick={() => setDrawAction("circle")}>원</Button>
        <Button onClick={() => setDrawAction("freeLine")}>그리기</Button>
        <Button onClick={() => setDrawAction("polygon")}>다각형</Button>
      </div>
      <DrawBox size={SIZE}>
        <Stage
          height={SIZE}
          width={SIZE}
          ref={stageRef}
          onMouseUp={onStageMouseUp}
          onMouseDown={onStageMouseDown}
          onMouseMove={onStageMouseMove}
        >
          <Layer>
            {arrow && (
              <Arrow
                key={arrow.id}
                id={arrow.id}
                points={arrow.points}
                fill={arrow.color}
                stroke={arrow.color}
                strokeWidth={4}
              />
            )}
            {line && (
              <Line
                key={line.id}
                id={line.id}
                lineCap="square"
                lineJoin="bevel"
                stroke={line.color}
                points={line.points}
                strokeWidth={4}
              />
            )}
            {spline && (
              <Line
                key={spline.id}
                id={spline.id}
                lineCap="round"
                lineJoin="round"
                stroke={spline.color}
                points={spline.points}
                tension={0.5}
                strokeWidth={4}
              />
            )}
            {rectangle && (
              <Rect
                key={rectangle.id}
                id={rectangle.id}
                x={rectangle.x}
                y={rectangle.y}
                height={rectangle.height}
                width={rectangle.width}
                stroke={rectangle.color}
                strokeWidth={4}
              />
            )}
            {circle && (
              <Circle
                key={circle.id}
                id={circle.id}
                x={circle.x}
                y={circle.y}
                radius={circle.radius}
                stroke={circle.color}
                strokeWidth={4}
              />
            )}
            {freeLine && (
              <Line
                key={freeLine.id}
                id={freeLine.id}
                lineCap="round"
                lineJoin="round"
                stroke={freeLine.color}
                points={freeLine.points}
                strokeWidth={4}
              />
            )}
            {polygon && (
              <Line
                key={polygon.id}
                id={polygon.id}
                points={polygon.points}
                stroke={polygon.color}
                closed={polygon.closed}
                strokeWidth={4}
              />
            )}
          </Layer>
        </Stage>
      </DrawBox>
    </Container>
  );
}

export default App;
