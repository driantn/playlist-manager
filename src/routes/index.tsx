import { createRoute, createRouter } from "@tanstack/react-router";
import { Homepage } from "./homepage";
import { Editor } from "./editor";
import { rootRoute } from "./__root";
import { z } from "zod";

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Homepage,
});

const editorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/editor",
  validateSearch: (search) =>
    z
      .object({
        group: z.string().optional().default(""),
      })
      .parse(search),
  component: Editor,
});

const routeTree = rootRoute.addChildren([indexRoute, editorRoute]);

export const router = createRouter({
  routeTree,
  basepath: import.meta.env.VITE_BASE,
});
