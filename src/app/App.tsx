import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import FloatingChatButton from "../components/layout/FloatingChatButton";

function App() {
  return (
    <div className="min-h-screen bg-[#f5f1ea] text-black">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
}
export default App;