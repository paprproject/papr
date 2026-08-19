import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import FloatingChatButton from "../components/layout/FloatingChatButton";
import RouteScrollManager from "../components/layout/RouteScrollManager";

function App() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-[#f5f1ea] text-black">
      <RouteScrollManager />
      <Navbar />
      <main className="flex-1">
        <div key={location.pathname} className="route-transition">
          <Outlet />
        </div>
      </main>
      <Footer />
      <FloatingChatButton />
    </div>
  );
}
export default App;
