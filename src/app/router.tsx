import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import HomePage from "../pages/Home/HomePage";
import ProductsPage from "../pages/Products/ProductsPage";
import QuotePage from "../pages/Quote/QuotePage";
import PricingPage from "../pages/Pricing/PricingPage";
import B2BPage from "../pages/B2B/B2BPage";
import ContactPage from "../pages/Contact/ContactPage";
import CartPage from "../pages/Cart/CartPage";
import CheckoutPage from "../pages/Checkout/CheckoutPage";
import CheckoutSuccessPage from "../pages/Checkout/CheckoutSuccessPage";
import LoginPage from "../pages/Login/LoginPage";
import AccountPage from "../pages/Account/AccountPage";
import ProductDetailsPage from "../pages/ProductDetails/ProductDetailsPage";
import EditorPage from "../pages/Editor/EditorPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products", element: <ProductsPage /> },
      { path: "quote", element: <QuotePage /> },
      { path: "shop", element: <Navigate to="/quote" replace /> },
      { path: "pricing", element: <PricingPage /> },
      { path: "b2b", element: <B2BPage /> },
      { path: "contact", element: <ContactPage /> },
      { path: "faq", element: <Navigate to="/contact" replace /> },
      { path: "cart", element: <CartPage /> },
      { path: "checkout", element: <CheckoutPage /> },
      { path: "checkout/success", element: <CheckoutSuccessPage /> },
      { path: "why", element: <Navigate to="/" replace /> },
      { path: "account", element: <AccountPage /> },
      {
        path: "orders",
        element: <Navigate to="/account?tab=orders" replace />,
      },
      { path: "login", element: <LoginPage /> },
      { path: "products/:id", element: <ProductDetailsPage /> },
    ],
  },
  { path: "/editor/new", element: <EditorPage /> },
  { path: "/editor/:designId", element: <EditorPage /> },
]);
