import Announcer from "./components/Announcer";
import BoardPage from "./features/board/BoardPage";

export default function App() {
  return (
    <div className="min-h-dvh">
      <Announcer />
      <BoardPage />
    </div>
  );
}
