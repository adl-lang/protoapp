import { Landing } from "./pages/landing";
import { ApiWorkbench } from "./pages/api-workbench";

export const ROUTES = {
  "/": () => <Landing />,
  "/api-workbench": () => <ApiWorkbench />,
};

export function landingUrl(): string {
  return "/";
}

export function workbenchUrl(): string {
  return "/api-workbench";
}
