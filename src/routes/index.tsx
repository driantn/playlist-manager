import {
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";
import { Homepage } from "./homepage";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Homepage,
});

const str = (v: unknown) => (v == null || v === "" ? undefined : String(v));

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  validateSearch: (s: Record<string, unknown>): { group?: string; q?: string } => ({
    group: str(s.group),
    q: str(s.q),
  }),
  component: lazyRouteComponent(() => import("./editor"), "Editor"),
});

export const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, editorRoute]),
  basepath: import.meta.env.VITE_BASE,
});
