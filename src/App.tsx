import { useCallback, useRef, useState } from "react";
import { Arrow, Circle, Layer, Line, Rect, Stage } from "react-konva";
import {
  LineType,
  FreeLineType,
  PolygonType,
  SplineType,
  KonvaElement,
} from "./types/PaintTypes";
import { Button, Container, DrawBox, SubContainer } from "./style/Stage.Styled";
import { v4 as uuid } from "uuid";
import Konva from "konva";
import ColorPalette, { ColorCode } from "./component/ColorPalette";
import StrokeWidthAdjuster from "./component/StrokeWidthAdjuster";
import DrawActionPalette from "./component/DrawActionPalette";
import { RectConfig } from "konva/lib/shapes/Rect";
import { CircleConfig } from "konva/lib/shapes/Circle";

const SIZE = 500;
const MAX_HISTORY_LENGTH = 40;

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

const getInitialShapes = (savedData: string | null, shapeName: string) => {
  if (savedData) {
    const parsedData = JSON.parse(savedData);
    const data = parsedData.children[0]?.children || [];

    return data
      .filter((shape: KonvaElement) => shape.attrs.name === shapeName)
      .map((shape: KonvaElement) => ({
        ...shape.attrs,
        id: shape.attrs.id,
        color: shape.attrs.stroke,
        points: shape.attrs.points,
        strokeWidth: shape.attrs.strokeWidth,
        timeStamp: shape.attrs.timeStamp,
      }));
  }
  return [];
};

function App() {
  const savedData = localStorage.getItem("konva");
  const [strokeWidth, setStrokeWidth] = useState<number>(5);
  const [color, setColor] = useState<ColorCode>("#000000");
  const [drawAction, setDrawAction] = useState(DrawAction.Select);
  const [arrows, setArrows] = useState<LineType[]>(() =>
    getInitialShapes(savedData, "arrow")
  );
  const [rectangles, setRectangles] = useState<RectConfig[]>(() =>
    getInitialShapes(savedData, "rectangle")
  );
  const [circles, setCircles] = useState<CircleConfig[]>(() =>
    getInitialShapes(savedData, "circle")
  );
  const [freeLines, setFreeLines] = useState<FreeLineType[]>(() =>
    getInitialShapes(savedData, "freedraw")
  );
  const [polygons, setPolygons] = useState<PolygonType[]>(() =>
    getInitialShapes(savedData, "polygon")
  );
  const [lines, setLines] = useState<LineType[]>(() =>
    getInitialShapes(savedData, "line")
  );
  const [splines, setSplines] = useState<SplineType[]>(() =>
    getInitialShapes(savedData, "spline")
  );

  const historyStep = useRef<number>(0);
  const [history, setHistory] = useState<KonvaElement[]>(() => {
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      const data = parsedData.children[0]?.children || [];
      historyStep.current =
        data.length > MAX_HISTORY_LENGTH ? MAX_HISTORY_LENGTH : data.length;
      const sortedShapes = data.sort(
        (a: KonvaElement, b: KonvaElement) =>
          a.attrs.timeStamp - b.attrs.timeStamp
      );
      return sortedShapes.slice(-MAX_HISTORY_LENGTH);
    }
    return [];
  });

  const stageRef = useRef<Konva.Stage>(null);
  const isPaintRef = useRef(false);
  const currentShapeIdRef = useRef<string | null>(null);
  const isPaintFirstSplineRef = useRef(true);

  const undo = () => {
    if (historyStep.current === 0) {
      return;
    }
    historyStep.current -= 1;
    const previous = history[historyStep.current];
    undoRestoreState(previous);
  };

  const redo = () => {
    if (history.length === historyStep.current) {
      return;
    }
    const next = history[historyStep.current];
    historyStep.current += 1;
    redoRestoreState(next);
  };

  //undo시 해당되는 데이터 업데이트
  const undoRestoreState = (state: KonvaElement) => {
    const { attrs } = state;
    const { id, name } = attrs;

    if (name === "arrow") {
      setArrows((prev) => prev.filter((d) => d.id !== id));
    } else if (name === "rectangle") {
      setRectangles((prev) => prev.filter((d) => d.id !== id));
    } else if (name === "circle") {
      setCircles((prev) => prev.filter((d) => d.id !== id));
    } else if (name === "freedraw") {
      setFreeLines((prev) => prev.filter((d) => d.id !== id));
    } else if (name === "polygon") {
      setPolygons((prev) => prev.filter((d) => d.id !== id));
    } else if (name === "line") {
      setLines((prev) => prev.filter((d) => d.id !== id));
    } else if (name === "spline") {
      setSplines((prev) => prev.filter((d) => d.id !== id));
    }
  };

  //redo시 해당되는 데이터 업데이트
  const redoRestoreState = (state: KonvaElement) => {
    const { attrs } = state;
    const { id, name, stroke, points } = attrs;

    if (name === "arrow") {
      setArrows((prev) => [...prev, { ...attrs, points, color: stroke }]);
    } else if (name === "rectangle") {
      setRectangles((prev) => [...prev, { ...attrs, color: stroke }]);
    } else if (name === "circle") {
      setCircles((prev) => [...prev, { ...attrs, points, id, color: stroke }]);
    } else if (name === "freedraw") {
      setFreeLines((prev) => [
        ...prev,
        { ...attrs, points, id, color: stroke },
      ]);
    } else if (name === "polygon") {
      setPolygons((prev) => [...prev, { ...attrs, points, id, color: stroke }]);
    } else if (name === "line") {
      setLines((prev) => [...prev, { ...attrs, points, id, color: stroke }]);
    } else if (name === "spline") {
      setSplines((prev) => [...prev, { ...attrs, points, id, color: stroke }]);
    }
  };

  const handleColorChange = useCallback((color: ColorCode) => {
    setColor(color);
  }, []);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
  }, []);

  const handleDrawAction = useCallback((action: string) => {
    setDrawAction(action);
  }, []);

  //모두 지우기 기능
  const onClear = useCallback(() => {
    if (!confirm("기록된 히스토리까지 모두 지워집니다.")) return;
    isPaintRef.current = false;
    currentShapeIdRef.current = null;
    isPaintFirstSplineRef.current = true;
    setRectangles([]);
    setCircles([]);
    setFreeLines([]);
    setArrows([]);
    setLines([]);
    setSplines([]);
    setPolygons([]);
    setHistory([]);
    historyStep.current = 0;
    localStorage.removeItem("konva");
  }, []);

  //MouseDown
  const onStageMouseDown = useCallback(() => {
    if (drawAction === DrawAction.Select || !stageRef.current) return;

    isPaintRef.current = true;

    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const x = (pos!.x as number) || 0;
    const y = (pos!.y as number) || 0;
    const id = uuid();
    const timeStamp = Date.now();

    switch (drawAction) {
      case DrawAction.Arrow: {
        currentShapeIdRef.current = id;
        setArrows((prev) => [
          ...prev,
          { id, color, strokeWidth, timeStamp, points: [x, y, x, y] },
        ]);
        break;
      }
      case DrawAction.Line: {
        currentShapeIdRef.current = id;
        setLines((prev) => [
          ...prev,
          { id, color, strokeWidth, timeStamp, points: [x, y, x, y] },
        ]);
        break;
      }
      case DrawAction.Spline: {
        if (isPaintFirstSplineRef.current) {
          //곡선 첫 번째 클릭
          currentShapeIdRef.current = id;
          setSplines((prev) => [
            ...prev,
            { id, color, strokeWidth, timeStamp, points: [x, y] },
          ]);
        } else {
          //곡선 두 번째 클릭
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
          { id, color, strokeWidth, timeStamp, x, y, height: 1, width: 1 },
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
            timeStamp,
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
            timeStamp,
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
          //현재 진행 중인 폴리곤 데이터 OR 초기 데이터
          const lastPolygon =
            prev.length > 0 && !prev[prev.length - 1].closed
              ? {
                  ...prev[prev.length - 1],
                  points: [...prev[prev.length - 1].points, x, y],
                }
              : {
                  id,
                  color,
                  strokeWidth,
                  timeStamp,
                  points: [x, y],
                  closed: false,
                };

          //폴리곤을 완성시키는 경우
          if (lastPolygon.points.length > 2) {
            const firstX = lastPolygon.points[0];
            const firstY = lastPolygon.points[1];
            const dist = Math.sqrt((x - firstX) ** 2 + (y - firstY) ** 2);
            if (dist < 10) {
              const completedPolygon = {
                ...lastPolygon,
                points: lastPolygon.points,
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

  //MouseMove
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
                  height: y - rectangle.y!,
                  width: x - rectangle.x!,
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
                  radius: ((x - circle.x!) ** 2 + (y - circle.y!) ** 2) ** 0.5,
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

          if (lastPolygon.closed) return prev;

          return prev.map((polygon) => {
            if (polygon.id !== lastPolygon.id) {
              return polygon;
            }
            // 현재 폴리곤인 경우, 조건에 따라 points를 수정
            const newPoints =
              lastPolygon.points.length <= 2
                ? [polygon.points[0], lastPolygon.points[1], x, y] // 첫 번째 시작일 때
                : [...polygon.points.slice(0, -2), x, y]; // 그 외 경우

            return {
              ...polygon,
              points: newPoints,
            };
          });
        });
        break;
      }
    }
  }, [drawAction]);

  //MouseUp
  const onStageMouseUp = useCallback(() => {
    const saveHistoryAndLocalStorage = () => {
      const json = stageRef.current!.toJSON();
      const parsedData = JSON.parse(json);
      const newData: KonvaElement[] = parsedData.children[0].children;
      setHistory((prev) => {
        //만약 redo할 데이터가 있는 상태인데 그리기를 시도했을 때 redo할 데이터들 제거
        if (historyStep.current <= prev.length) {
          const slicePrev = prev.slice(0, historyStep.current - 1);
          const updatedData = newData.filter(
            (newItem) =>
              !slicePrev.some((his) => his.attrs.id === newItem.attrs.id)
          );
          const resultData = slicePrev
            .concat(updatedData)
            .sort(
              (a: KonvaElement, b: KonvaElement) =>
                a.attrs.timeStamp - b.attrs.timeStamp
            );
          // 기록 개수가 MAX_HISTORY_LENGTH를 초과하면 앞에서 제거
          if (resultData.length > MAX_HISTORY_LENGTH) {
            historyStep.current = MAX_HISTORY_LENGTH;
            return resultData.slice(-MAX_HISTORY_LENGTH);
          }
          return resultData;
        } else {
          const updatedData = newData.filter(
            (newItem) => !prev.some((his) => his.attrs.id === newItem.attrs.id)
          );
          const resultData = prev
            .concat(updatedData)
            .sort(
              (a: KonvaElement, b: KonvaElement) =>
                a.attrs.timeStamp - b.attrs.timeStamp
            );
          // 기록 개수가 MAX_HISTORY_LENGTH를 초과하면 앞에서 제거
          if (resultData.length > MAX_HISTORY_LENGTH) {
            historyStep.current = MAX_HISTORY_LENGTH;
            return resultData.slice(-MAX_HISTORY_LENGTH);
          }
          return resultData;
        }
      });
      historyStep.current += 1;
      localStorage.setItem("konva", json);
    };
    const handleSplineAction = () => {
      if (!isPaintFirstSplineRef.current) {
        isPaintRef.current = false;
        isPaintFirstSplineRef.current = true;
        saveHistoryAndLocalStorage();
        return;
      }
      isPaintRef.current = false;
      isPaintFirstSplineRef.current = false;
    };

    const isPolygonDrawingUnfinished = () =>
      drawAction === DrawAction.Polygon &&
      !polygons[polygons.length - 1]?.closed;

    if (isPolygonDrawingUnfinished() || drawAction === DrawAction.Select)
      return;

    if (drawAction === DrawAction.Spline) {
      handleSplineAction();
      return;
    }

    if (!isPaintRef.current) return;
    isPaintRef.current = false;
    saveHistoryAndLocalStorage();
  }, [drawAction, polygons]);

  return (
    <Container>
      <div>
        <Button onClick={undo} disabled={historyStep.current === 0}>
          Undo
        </Button>
        <Button
          onClick={redo}
          disabled={history.length === historyStep.current}
        >
          Redo
        </Button>
        <DrawActionPalette
          onClear={onClear}
          currentAction={drawAction}
          setDrawAction={handleDrawAction}
        />
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
            onMouseLeave={onStageMouseUp}
          >
            <Layer>
              {arrows.map((arrow) => (
                <Arrow
                  name="arrow"
                  key={arrow.id}
                  id={arrow.id}
                  points={arrow.points}
                  fill={arrow.color}
                  stroke={arrow.color}
                  strokeWidth={arrow.strokeWidth}
                  timeStamp={arrow.timeStamp}
                />
              ))}
              {lines.map((line) => (
                <Line
                  name="line"
                  key={line.id}
                  id={line.id}
                  lineCap="square"
                  lineJoin="bevel"
                  stroke={line.color}
                  points={line.points}
                  strokeWidth={line.strokeWidth}
                  timeStamp={line.timeStamp}
                />
              ))}
              {splines.map((spline) => (
                <Line
                  name="spline"
                  key={spline.id}
                  id={spline.id}
                  lineCap="round"
                  lineJoin="round"
                  stroke={spline.color}
                  points={spline.points}
                  tension={0.5}
                  strokeWidth={spline.strokeWidth}
                  timeStamp={spline.timeStamp}
                />
              ))}
              {rectangles.map((rectangle) => (
                <Rect
                  name="rectangle"
                  key={rectangle.id}
                  id={rectangle.id}
                  x={rectangle.x}
                  y={rectangle.y}
                  height={rectangle.height}
                  width={rectangle.width}
                  stroke={rectangle.color}
                  strokeWidth={rectangle.strokeWidth}
                  timeStamp={rectangle.timeStamp}
                />
              ))}
              {circles.map((circle) => (
                <Circle
                  name="circle"
                  key={circle.id}
                  id={circle.id}
                  x={circle.x}
                  y={circle.y}
                  radius={circle.radius}
                  stroke={circle.color}
                  strokeWidth={circle.strokeWidth}
                  timeStamp={circle.timeStamp}
                />
              ))}
              {freeLines.map((freeLine) => (
                <Line
                  name="freedraw"
                  key={freeLine.id}
                  id={freeLine.id}
                  lineCap="round"
                  lineJoin="round"
                  stroke={freeLine.color}
                  points={freeLine.points}
                  strokeWidth={freeLine.strokeWidth}
                  timeStamp={freeLine.timeStamp}
                />
              ))}
              {polygons.map((polygon) => (
                <Line
                  name="polygon"
                  key={polygon.id}
                  id={polygon.id}
                  points={polygon.points}
                  stroke={polygon.color}
                  closed={polygon.closed}
                  strokeWidth={polygon.strokeWidth}
                  timeStamp={polygon.timeStamp}
                />
              ))}
            </Layer>
          </Stage>
        </DrawBox>
        <ColorPalette currentColor={color} onColorChange={handleColorChange} />
        <StrokeWidthAdjuster
          strokeWidth={strokeWidth}
          setStrokeWidth={handleStrokeWidthChange}
        />
      </SubContainer>
    </Container>
  );
}

export default App;
