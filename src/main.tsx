import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import "./index.css";
import { router } from "./routes";
import { useStore } from "./store";

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Resolves even if IndexedDB fails, so the app still starts (just empty).
useStore.persist.rehydrate().then(() =>
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  ),
);
