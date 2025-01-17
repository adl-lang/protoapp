
import React, { useCallback, useEffect, useState } from 'react';
import { Service } from '../service';
import { FetchHttp } from '../service/fetch-http';
import { ApiWithToken, Auth, JwtClaims, expiry_secs } from '../auth';
import { jwtDecode } from "jwt-decode";

import { LoginResp, makeRefreshReq } from '@/adl-gen/protoapp/apis/types';
import { logoutUrl } from '@/navigation';
import { useNavigate } from 'raviger';

const protoappApi = new Service(
  new FetchHttp(),
  '/api',
);


export interface AppState {
  api: Service,
  authState: AuthState,
  setAuthStateFromLogin(resp: LoginResp): void,
  logout(): Promise<void>,
}

export type AuthState
  = { kind: "loading" }
  | { kind: "noauth" }
  | { kind: "auth", auth: Auth }
  | { kind: "authfailed" }
  ;


export const AppStateContext =
  React.createContext<AppState | undefined>(undefined);


export function AppStateProvider(props: {
  children?: React.ReactNode;
}) {
  const [authState, setAuthState] = useState<AuthState>({ kind: "loading" });
  const navigate = useNavigate();

  async function setAuthStateFromLogin(resp: LoginResp) {
    switch (resp.kind) {
      case "tokens": {
        const jwt = resp.value.access_jwt;
        const jwt_decoded = jwtDecode(jwt) as JwtClaims;
        console.log("jwt", jwt_decoded);
        let auth = { jwt, jwt_decoded };
        setAuthState({ kind: "auth", auth });
        break;
      }
      case "invalid_credentials": {
        setAuthState({ kind: "authfailed" });
        break;
      }
    }
  }

  async function logout() {
    await protoappApi.logout({});
    console.log(`logout`);
    setAuthState({ kind: 'noauth' });
  }

  async function refresh() {
    console.log("Refreshing JWT");
    const resp = await protoappApi.refresh(makeRefreshReq({}));
    switch (resp.kind) {
      case 'invalid_refresh_token':
        setAuthState({kind:'noauth'});
        break;
      case 'access_token':
        const jwt = resp.value;
        const jwt_decoded = jwtDecode(jwt) as JwtClaims;
        console.log("jwt", jwt_decoded);
        let auth = { jwt, jwt_decoded };
        setAuthState({ kind: "auth", auth });
        break;
    }
  }

  const renewJwt = useCallback( async () =>  {
    if (authState.kind === 'auth') {
      const claims = authState.auth.jwt_decoded;
      if (expiry_secs(claims) < 60) {
        await refresh();
      }
    }
  }, [authState]);


  // Attempt to refresh a token on page load, relying on the refreshToken cookie
  useEffect(() => {
    refresh()
  }, []);


  // Refresh the token whenever we have less than 30 seconds to expire
  useEffect(() => {
    const interval = setInterval(renewJwt, 10 * 1000);
    return () => clearInterval(interval);
  }, [renewJwt]);
  
  const apiManager = {
    api: protoappApi,
    authState,
    setAuthStateFromLogin,
    logout
  };

  return (
    <AppStateContext.Provider value={apiManager}>
      {props.children}
    </AppStateContext.Provider>
  );
}

export function useAppState(): AppState {
  const appState = React.useContext(AppStateContext);
  if (!appState) {
    throw new Error('useAppState invalid outside an AppStateProvider');
  }
  return appState;
}

export function useApiWithToken(): ApiWithToken {
  const appState = useAppState();
  if (appState.authState.kind !== 'auth') {
    throw new Error('useApiWithToken called when user not logged in');
  }
  return {
    api: appState.api,
    jwt: appState.authState.auth.jwt,
    jwt_decoded: appState.authState.auth.jwt_decoded,

  }
}
