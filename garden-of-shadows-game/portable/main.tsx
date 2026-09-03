import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import CreditsPage from "../app/credits/page";
import Home from "../app/page";
import "../app/globals.css";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Portable game root element was not found.");
}

const Page = window.location.pathname === "/credits" ? CreditsPage : Home;

createRoot(root).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
