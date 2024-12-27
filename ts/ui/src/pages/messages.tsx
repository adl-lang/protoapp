import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { useApiWithToken } from '@/hooks/use-app-state';
import { useAsyncLoad } from '@/hooks/use-async-result';
import { NON_EMPTY_MULTILINE_STRING_FIELD } from '@/components/forms/model/fields/primitive';
import { useTypedFieldState } from '@/components/forms/model/fields/hooks';
import { Card, CardContent, TextField } from '@mui/material';
import { useState } from 'react';
import { AsyncLoadingButton } from '@/components/Button';

export function Messages() {

  const { api, jwt } = useApiWithToken();

  const [messages, reloadMessages] = useAsyncLoad(
    () => api.recentMessages(jwt, { offset: 0, limit: 10 }),
    [api, jwt]
  );
  const message = useTypedFieldState(NON_EMPTY_MULTILINE_STRING_FIELD);;
  const [showErrors, setShowErrors] = useState(false);

  async function onPost() {
    if (message.isValid()) {
      setShowErrors(false);
      await api.newMessage(jwt, { message: message.value() });
      message.setText("");
      reloadMessages()
    } else {
      setShowErrors(true);
    }
  }

  let renderedMessages = messages.state == 'loading' ? [] :
    messages.value.items.map((m,i) => {
      const posted_at = new Date(m.posted_at);
      return (
        <Card variant="outlined" sx={{ marginBottom: "10px" }} key={i}>
          <CardContent>
            <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
              <b>{m.user_fullname}</b> ({posted_at.toLocaleDateString()} {posted_at.toLocaleTimeString()})
            </Typography>
            <Box sx={{whiteSpace: "pre-wrap"}}>
            {m.message}
            </Box>
          </CardContent>
        </Card>
      )
    });
  renderedMessages.reverse();

  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
          Messages
        </Typography>
        {renderedMessages}
        <TextField
          label="New message"
          required
          variant="outlined"
          color="secondary"
          multiline
          sx={{ mb: 3 }}
          fullWidth
          rows={4}
          onChange={e => message.setText(e.target.value)}
          value={message.text}
          error={showErrors && !message.isValid()}
          helperText={showErrors && message.validationError()}
        />

        <AsyncLoadingButton variant="contained" onClick={onPost}>
          Post
        </AsyncLoadingButton>
      </Box>
    </Container>
  );
}
