import { createHashHistory, createMemoryHistory, createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  const apk = import.meta.env.VITE_APK === "1";
  if (!apk) {
    return createRouter({ routeTree, defaultErrorComponent: AppErrorComponent });
  }
  const history = typeof document !== "undefined" ? createHashHistory() : createMemoryHistory();
  return createRouter({
    routeTree,
    defaultErrorComponent: AppErrorComponent,
    history,
  });
}
