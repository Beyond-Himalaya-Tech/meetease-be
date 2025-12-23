import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import NotFoundComponent from "./routes/NotFound";

export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundComponent,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
