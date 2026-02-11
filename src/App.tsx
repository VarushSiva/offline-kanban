import Announcer from "./components/Announcer";
import BoardPage from "./features/board/BoardPage";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-dvh">
      <Announcer />
      <BoardPage />
      <Footer />
    </div>
  );
}
