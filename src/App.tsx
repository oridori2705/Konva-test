import { useCallback, useEffect, useRef, useState } from "react";
import { Arrow, Circle, Layer, Line, Rect, Stage } from "react-konva";
import {
  LineType,
  CircleType,
  FreeLineType,
  PolygonType,
  RectangleType,
  SplineType,
  KonvaElement,
} from "./types/PaintTypes";
import { Button, Container, DrawBox, SubContainer } from "./style/Stage.Styled";
import { v4 as uuid } from "uuid";
import Konva from "konva";
import DynamicKonvaRenderer from "./component/DynamicKonvaRenderer";
import ColorPalette, { ColorCode } from "./component/ColorPalette";
import StrokeWidthAdjuster from "./component/StrokeWidthAdjuster";

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
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [color, setColor] = useState<ColorCode>("#000");
  const [drawAction, setDrawAction] = useState(DrawAction.Select);
  const [arrows, setArrows] = useState<LineType[]>([]);
  const [rectangles, setRectangles] = useState<RectangleType[]>([]);
  const [circles, setCircles] = useState<CircleType[]>([]);
  const [freeLines, setFreeLines] = useState<FreeLineType[]>([]);
  const [polygons, setPolygons] = useState<PolygonType[]>([]);
  const [lines, setLines] = useState<LineType[]>([]);
  const [splines, setSplines] = useState<SplineType[]>([]);
  const [shapes, setShapes] = useState<KonvaElement[]>([]);

  const stageRef = useRef<Konva.Stage>(null);
  const isPaintRef = useRef(false);
  const currentShapeIdRef = useRef<string>();
  const isPaintFirstSplineRef = useRef(true);

  const handleColorChange = useCallback((color: ColorCode) => {
    setColor(color);
  }, []);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
  }, []);

  const onClear = useCallback(() => {
    setRectangles([]);
    setCircles([]);
    setFreeLines([]);
    setArrows([]);
    setLines([]);
    setSplines([]);
    setPolygons([]);
    setShapes([]);
  }, []);

  const onStageMouseDown = useCallback(() => {
    if (drawAction === DrawAction.Select || !stageRef.current) return;

    isPaintRef.current = true;

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const x = (pos!.x as number) || 0;
    const y = (pos!.y as number) || 0;
    const id = uuid();

    switch (drawAction) {
      case DrawAction.Arrow: {
        currentShapeIdRef.current = id;
        setArrows((prev) => [
          ...prev,
          { id, color, strokeWidth, points: [x, y, x, y] },
        ]);
        break;
      }
      case DrawAction.Line: {
        currentShapeIdRef.current = id;
        setLines((prev) => [
          ...prev,
          { id, color, strokeWidth, points: [x, y, x, y] },
        ]);
        break;
      }
      case DrawAction.Spline: {
        if (isPaintFirstSplineRef.current) {
          //첫 번째 클릭
          currentShapeIdRef.current = id;
          setSplines((prev) => [
            ...prev,
            { id, color, strokeWidth, points: [x, y] },
          ]);
        } else {
          // 두 번째 클릭
          setSplines((prev) => {
            const lastSpline = prev[prev.length - 1];
            const [x1, y1, , , x3, y3] = lastSpline.points;

            return prev.map((spline) =>
              spline.id === lastSpline.id
                ? {
                    ...spline,
                    points: [x1, y1, x, y, x3, y3],
                  }
                : spline
            );
          });
        }
        break;
      }
      case DrawAction.Rectangle: {
        currentShapeIdRef.current = id;
        setRectangles((prev) => [
          ...prev,
          { id, color, strokeWidth, x, y, height: 1, width: 1 },
        ]);
        break;
      }
      case DrawAction.Circle: {
        currentShapeIdRef.current = id;
        setCircles((prev) => [
          ...prev,
          {
            id,
            radius: 1,
            x,
            y,
            color,
            strokeWidth,
          },
        ]);
        break;
      }
      case DrawAction.freeLine: {
        currentShapeIdRef.current = id;
        setFreeLines((prev) => [
          ...prev,
          {
            id,
            points: [x, y],
            color,
            strokeWidth,
          },
        ]);
        break;
      }
      case DrawAction.Polygon: {
        currentShapeIdRef.current = id;

        const updatePolygonList = (
          polygons: PolygonType[],
          updatedPolygon: PolygonType
        ) => {
          return polygons.length === 0
            ? [updatedPolygon]
            : [
                ...polygons.filter(
                  (polygon) => polygon.id !== updatedPolygon.id
                ),
                updatedPolygon,
              ];
        };

        setPolygons((prev) => {
          //현재 진행 중인 폴리곤
          const lastPolygon =
            prev.length > 0 && !prev[prev.length - 1].closed
              ? {
                  ...prev[prev.length - 1],
                  points: [...prev[prev.length - 1].points, x, y],
                }
              : { id, color, strokeWidth, points: [x, y], closed: false };

          //폴리곤을 완성시키는 경우
          if (lastPolygon.points.length > 2) {
            const firstX = lastPolygon.points[0];
            const firstY = lastPolygon.points[1];
            const dist = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
            if (dist < 10) {
              const completedPolygon = {
                ...lastPolygon,
                points: lastPolygon.points.slice(0, -2),
                closed: true,
              };
              return updatePolygonList(prev, completedPolygon);
            }
          }
          // 폴리곤이 진행 중인 경우
          return updatePolygonList(prev, lastPolygon);
        });
        break;
      }
    }
  }, [drawAction, color, strokeWidth]);

  const onStageMouseMove = useCallback(() => {
    if (drawAction === DrawAction.Select || !isPaintRef.current) return;

    const stage = stageRef?.current;
    const pos = stage?.getPointerPosition();
    const x = (pos?.x as number) || 0;
    const y = (pos?.y as number) || 0;

    const currentId = currentShapeIdRef.current;

    switch (drawAction) {
      case DrawAction.Arrow: {
        setArrows((prevArrows) =>
          prevArrows.map((arrow) =>
            arrow.id === currentId
              ? {
                  ...arrow,
                  points: [arrow.points[0], arrow.points[1], x, y],
                }
              : arrow
          )
        );
        break;
      }
      case DrawAction.Line: {
        setLines((prevLines) =>
          prevLines.map((line) =>
            line.id === currentId
              ? {
                  ...line,
                  points: [line.points[0], line.points[1], x, y],
                }
              : line
          )
        );
        break;
      }
      case DrawAction.Spline: {
        const updateSpline = (spline: SplineType) => {
          // 첫 번째 Move(끝점을 정하는 미리보기)
          if (isPaintFirstSplineRef.current) {
            const [x1, y1] = spline.points;
            return [x1, y1, x1, y1, x, y];
          } else {
            //두 번째 Move(기울기 정하는 미리보기)
            const [x1, y1, , , x3, y3] = spline.points;
            return [x1, y1, x, y, x3, y3];
          }
        };
        setSplines((prev) => {
          return prev.map((spline) =>
            spline.id === currentId
              ? {
                  ...spline,
                  points: updateSpline(spline),
                }
              : spline
          );
        });
        break;
      }
      case DrawAction.Rectangle: {
        setRectangles((prev) =>
          prev?.map((rectangle) =>
            rectangle.id === currentId
              ? {
                  ...rectangle,
                  height: y - rectangle.y,
                  width: x - rectangle.x,
                }
              : rectangle
          )
        );
        break;
      }
      case DrawAction.Circle: {
        setCircles((prev) =>
          prev?.map((circle) =>
            circle.id === currentId
              ? {
                  ...circle,
                  radius: ((x - circle.x) ** 2 + (y - circle.y) ** 2) ** 0.5,
                }
              : circle
          )
        );
        break;
      }
      case DrawAction.freeLine: {
        setFreeLines((prev) =>
          prev.map((freeLine) =>
            freeLine.id === currentId
              ? {
                  ...freeLine,
                  points: [...freeLine.points, x, y],
                }
              : freeLine
          )
        );
        break;
      }
      case DrawAction.Polygon: {
        setPolygons((prev) => {
          if (prev.length === 0) return prev;

          const lastPolygon = prev[prev.length - 1];

          if (lastPolygon.points.length <= 2) {
            return prev.map((polygon) =>
              polygon.id === lastPolygon.id
                ? {
                    ...polygon,
                    points: [polygon.points[0], lastPolygon.points[1], x, y],
                  }
                : polygon
            );
          }

          return prev.map((polygon) =>
            polygon.id === lastPolygon.id
              ? {
                  ...polygon,
                  points: [...polygon.points.slice(0, -2), x, y],
                }
              : polygon
          );
        });
        break;
      }
    }
  }, [drawAction]);

  const onStageMouseUp = useCallback(() => {
    if (
      drawAction === DrawAction.Polygon &&
      !polygons[polygons.length - 1].closed
    )
      return;

    isPaintFirstSplineRef.current = !isPaintFirstSplineRef.current;
    isPaintRef.current = false;

    const json = stageRef.current!.toJSON();
    localStorage.setItem("konva", json);
  }, [drawAction, polygons]);

  useEffect(() => {
    const savedData = localStorage.getItem("konva");

    if (savedData) {
      const parsedData = JSON.parse(savedData);

      setShapes(parsedData.children[0]?.children || []);
    }
  }, []);

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
        <Button onClick={onClear}>모두 지우기</Button>
      </div>
      <SubContainer>
        <DrawBox size={SIZE}>
          <Stage
            id="MainStage"
            height={SIZE}
            width={SIZE}
            ref={stageRef}
            onMouseUp={onStageMouseUp}
            onMouseDown={onStageMouseDown}
            onMouseMove={onStageMouseMove}
          >
            <Layer>
              {shapes.map((element, index) => (
                <DynamicKonvaRenderer key={index} data={element} />
              ))}
              {arrows.map((arrow) => (
                <Arrow
                  key={arrow.id}
                  id={arrow.id}
                  points={arrow.points}
                  fill={arrow.color}
                  stroke={arrow.color}
                  strokeWidth={arrow.strokeWidth}
                />
              ))}
              {lines.map((line) => (
                <Line
                  key={line.id}
                  id={line.id}
                  lineCap="square"
                  lineJoin="bevel"
                  stroke={line.color}
                  points={line.points}
                  strokeWidth={line.strokeWidth}
                />
              ))}
              {splines.map((spline) => (
                <Line
                  key={spline.id}
                  id={spline.id}
                  lineCap="round"
                  lineJoin="round"
                  stroke={spline.color}
                  points={spline.points}
                  tension={0.5}
                  strokeWidth={spline.strokeWidth}
                />
              ))}
              {rectangles.map((rectangle) => (
                <Rect
                  key={rectangle.id}
                  id={rectangle.id}
                  x={rectangle.x}
                  y={rectangle.y}
                  height={rectangle.height}
                  width={rectangle.width}
                  stroke={rectangle.color}
                  strokeWidth={rectangle.strokeWidth}
                />
              ))}
              {circles.map((circle) => (
                <Circle
                  key={circle.id}
                  id={circle.id}
                  x={circle.x}
                  y={circle.y}
                  radius={circle.radius}
                  stroke={circle.color}
                  strokeWidth={circle.strokeWidth}
                />
              ))}
              {freeLines.map((freeLine) => (
                <Line
                  key={freeLine.id}
                  id={freeLine.id}
                  lineCap="round"
                  lineJoin="round"
                  stroke={freeLine.color}
                  points={freeLine.points}
                  strokeWidth={freeLine.strokeWidth}
                />
              ))}
              {polygons.map((polygon) => (
                <Line
                  key={polygon.id}
                  id={polygon.id}
                  points={polygon.points}
                  stroke={polygon.color}
                  closed={polygon.closed}
                  strokeWidth={polygon.strokeWidth}
                />
              ))}
            </Layer>
          </Stage>
        </DrawBox>
        <ColorPalette onColorChange={handleColorChange} />
        <StrokeWidthAdjuster
          strokeWidth={strokeWidth}
          setStrokeWidth={handleStrokeWidthChange}
        />
      </SubContainer>
    </Container>
  );
}

export default App;
