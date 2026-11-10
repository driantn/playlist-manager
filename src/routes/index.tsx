import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Homepage } from "./homepage";
import { Editor } from "./editor";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Homepage,
});

// The router JSON-parses params, so a group named "2024" arrives as a number.
const str = (v: unknown) => (v == null || v === "" ? undefined : String(v));

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  validateSearch: (s: Record<string, unknown>): { group?: string; q?: string } => ({
    group: str(s.group),
    q: str(s.q),
  }),
  component: Editor,
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, editorRoute]),
  basepath: import.meta.env.VITE_BASE,
});
