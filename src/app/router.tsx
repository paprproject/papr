import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import HomePage from "../pages/Home/HomePage";
import ProductsPage from "../pages/Products/ProductsPage";
import ShopPage from "../pages/Shop/ShopPage";
import PricingPage from "../pages/Pricing/PricingPage";
import B2BPage from "../pages/B2B/B2BPage";
import FAQPage from "../pages/FAQ/FAQPage";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "shop", element: <ShopPage /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "b2b", element: <B2BPage /> },
      { path: "faq", element: <FAQPage /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
    ],
  },
]);