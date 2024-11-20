import { Arrow, Circle, Line, Rect } from "react-konva";
import { KonvaElement } from "../types/PaintTypes";

// 지원하는 Konva 컴포넌트를 매핑
const KonvaComponents = {
  Line: Line,
  Rect: Rect,
  Circle: Circle,
  Arrow: Arrow,
};

const DynamicKonvaRenderer = ({ data }: { data: KonvaElement }) => {
  const Component = KonvaComponents[data.className];
  return (
    <>
      <Component {...data.attrs} />
    </>
  );
};

export default DynamicKonvaRenderer;
