import { Landing } from "./pages/landing";
import { RequireLogin } from "./components/RequireLogin";
import { Messages } from "./pages/messages";
import { Logout } from "./pages/logout";
import { Login } from "./pages/login";
import { AdminDashboard } from "./pages/admin-dashboard";

export const ROUTES = {
  '/': () => <Landing />,
  '/login': () => <Login />,
  '/logout': () => <Logout/>,
  '/messages': () => <RequireLogin><Messages/></RequireLogin>,
  '/admin': () =>
    <RequireLogin><AdminDashboard/></RequireLogin>,
};


export function landingUrl(): string {
  return '/';
}

export function loginUrl(): string {
  return '/login';
}

export function logoutUrl(): string {
  return '/logout';
}

export function messagesUrl(): string {
  return '/messages';
}

