import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import { useRoutes } from 'raviger';

import theme from './theme';
import { AppStateProvider } from './hooks/use-app-state';
import { ROUTES } from './navigation';


function Root() {
  let route = useRoutes(ROUTES);
  return (
    <React.StrictMode>
      <AppStateProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {route}
      </ThemeProvider>
      </AppStateProvider>
    </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root/>);
