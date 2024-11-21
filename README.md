# React + TypeScript + Konva 를 활용한 프로젝트

## 요구사항

1. 드로잉 타입 선택: 직선, 곡선, 원, 직사각형, 다각형

   - 1회성 드로잉이 아닌, 그려진 도형들이 한 화면에서 나타날 수 있어야 합니다.

   - 새로 고침 이후에도 캔버스 내용이 유지되어야 합니다.

2. 선 두께 선택

   - 두께 값의 최소/최대 제한이 필요합니다. (최소 5px, 최대 50px)

3. 컬러 선택

   - 현재 선택된 컬러를 사용자가 인지할 수 있어야 합니다.

4. Undo, Redo

   - 지난 작업으로 돌아갈 수 있어야 하고 마지막으로 작업한 시점으로 돌아올 수도 있어야 합니다.
   - 최근 40개의 작업 기록만 저장되도록 해주세요.

### main브랜치에서 수행했습니다.. 따로 PR 활용하지못한 점 죄송합니다. 해당 README에 해결과정 작성했습니다.

### 🔗(배포URL)[https://konva-test-seven.vercel.app/]

# ✨1. 드로잉 타입 선택 기능 구현

## 🛠️1. 화살표, 직선, 곡선, 원, 직사각형, 다각형, 그리기 기능 구현
- onStageMouseDown, onStageMouseMove,onStageMouseUp을 이용해 드로잉 기능들을 구현했습니다.
- isPaintRef를 이용해 현재 드로잉 중인지 판별하고, 이를 활용했습니다.
- `원`과 `다각형 자동 closed`에서 (거리공식)[https://whatpull-dev.tistory.com/40]을 이용했습니다.
- `곡선`은 `MouseDown -> MouseMove -> MouseUp` 단계에서 시작점과 도착점을 설정하고, 이후 두 번째 `MouseDown -> MouseMove -> MouseUp` 단계에서 기울기를 설정합니다.
- `다각형`은 아래와 같은 과정으로 진행됩니다.
    - MouseDown시 
       - 1. 현재 진행 중인 다각형을 찾습니다.(가장 마지막 요소의 closed상태 판별)
       - 2. 만약 진행 중인 다각형의 좌표가 2개 이상일 경우에는 다각형을 완성하는지 검사합니다.(거리공식 이용) 이후 진행 중인 다각형의 좌표를 추가해줍니다.
       - 3. 만약 진행 중인 다각형의 좌표가 2개 이하일 경우에는 다각형이 아직 시작단계입니다.
    - MouseMove시
       - 다시 현재 진행중인 다각형을 가져옵니다.
       - 현재 다각형의 좌표가 2개 이하인 경우에는 직접 x1,y1좌표를 가져와서 현재 좌표 x,y를 추가합니다.(실시간으로 해당 마우스에 따라 직선이 그려짐)
       - 현재 다각형의 좌표가 2개 이상일 경우에는 slice(0,-2)를 활용합니다.
    - MouseUp시
       - 현재 진행 중인 다각형을 가져와서 closed값을 확인합니다.
       - 현재 다각형 타입이고, closed가 false라면 아직 다각형을 완성한게 아니므로 early return 합니다.
       - 만약 완성됐다면 isPaintRef를 이용해 그리기를 종료합니다.


## 🛠️2. 1회성 드로잉이 아닌, 그려진 도형들이 한 화면에서 나타날 수 있어야 합니다.
- 각 드로잉 데이터를 배열로 관리하고, 화면에 출력했습니다.
```js
 const [lines, setLines] = useState<LineType[]>([]);
// ...
{lines.map((line) => (
    <Line ... />
```
## 🛠️3. 새로 고침 이후에도 캔버스 내용이 유지되어야 합니다.
- `localStorage`를 활용했습니다.
- 저장 시에는 stage에 접근해 (해당 데이터를 json으로 변환)[https://konvajs.org/docs/data_and_serialization/Serialize_a_Stage.html]하고, 이를 localStorage에 저장했습니다.
- 로드 시에는 localStorage에서 json 값을 가져오고, 해당 데이터에서 각 드로일 데이터를 저장한 부분을 추출해 모든 드로잉 State에 저장해서 출력했습니다.
```
//stage 접근
const json = stageRef.current!.toJSON();
//Load 할 때 
const savedData = localStorage.getItem("konva");
const parsedData = JSON.parse(savedData);
const data = parsedData.children[0]?.children || []; //드로잉 데이터가 담겨있음
```


## 🛠️4. 선 두께 선택, 두께 값의 최소/최대 제한이 필요합니다. (최소 5px, 최대 50px)
- useState를 사용해 관리했습니다.
- `<input>`태그의 range옵션을 활용했습니다.

## 🛠️5. 컬러 선택, 현재 선택된 컬러를 사용자가 인지할 수 있어야 합니다.
- useState를 사용해 관리했습니다.
- 선택시 아래와 같이 강조됩니다.
- ![image](https://github.com/user-attachments/assets/a80afd4c-c5e9-4cf2-a37f-221ed94d2a2a)

## 🛠️6. Undo, Redo
- 각 드로잉 데이터에 `timeStamp`라는 `Date`값을 함께 저장하고, 이를 이용해 최신 드로잉 데이터 순으로 정렬했습니다.
- `Undo`시 현재 undo되는 데이터의 `name`을 활용해 `filter()` 했습니다.
- `Redo`시 현재 Redo되는 데이터의 `name`을 활용해 `setState()`로 데이터를 다시 추가했습니다.
- 예외 상황
    - 1. undo를 진행하다가 다시 그리기를 진행할 때
       - 존재하던 Redo 가능 데이터를 제거하고 진행했습니다.
       - 즉, undo 이후 그리기를 진행한다면 존재하던 Redo는 사라집니다.
    - 2. 최근 40개의 작업 기록만 저장되도록 해주세요.
       - `slice(-40)`를 이용해 만약 40개 이상 history가 쌓였다면 제거햬주었습니다.
    - 3. 드로잉 중 새로고침 했을 때
       - 새로고침했을 때 기존 데이터는 저장되어 다시 나타납니다.
       - 현재 프로젝트에서는 드로잉 생성시간이 `Date`로 저장되기 때문에 새로고침 이후에도 undo 기능은 정상 작동하도록 했습니다.
