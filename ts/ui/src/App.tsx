import { Service } from "./service";
import { AdlRequestError } from "./service/service-base";
import { FetchHttp } from "./service/fetch-http";

import * as API from "@protoapp/adl/protoapp/apis/ui";
import React, { useState, useEffect, useCallback } from "react";

const service = new Service(new FetchHttp(), "/api");

// NOTE: This is a toy implementation of a client-side app that demonstrates the
// use of a `Service` to make typesafe RPC requests from the ADL generated API-definition.

const App: React.FC = () => {
  // Login form state
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // Auth state
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Messages state
  const [messages, setMessages] = useState<API.Message[]>([]); // ADL defined API.Message
  const [newMessage, setNewMessage] = useState<string>("");

  const handleLogoutImmediate = useCallback(() => {
    setAccessToken(null);
    setMessages([]);
  }, []);

  const handleApiError = useCallback(
    (err: unknown) => {
      console.error(`API call failed`);
      if (err instanceof AdlRequestError && err.respStatus === 401 && accessToken) {
        console.log("Received 401, logging out.");
        handleLogoutImmediate();
      }
    },
    [accessToken, handleLogoutImmediate],
  );

  const fetchUserInfo = useCallback(async () => {
    if (!accessToken) return;
    try {
      await service.whoAmI(accessToken, null);
    } catch (err) {
      handleApiError(err);
    }
  }, [accessToken, handleApiError]);

  const fetchMessages = useCallback(async () => {
    if (!accessToken) return;
    try {
      const messageData = await service.recentMessages(accessToken, { page: { offset: 0, limit: 50 } });
      setMessages(messageData.items);
    } catch (err) {
      handleApiError(err);
    }
  }, [accessToken, handleApiError]);

  useEffect(() => {
    if (accessToken) {
      fetchUserInfo();
      fetchMessages();
    } else {
      setMessages([]);
    }
  }, [accessToken, fetchMessages, fetchUserInfo]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await service.login({ email, password });
      if (response.kind === "tokens") {
        setAccessToken(response.value.access_jwt);
        setEmail("");
        setPassword("");
      } else if (response.kind === "invalid_credentials") {
        console.warn("Invalid login credentials");
      }
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleLogout = useCallback(async () => {
    try {
      await service.logout({});
    } catch (err) {
      handleApiError(err);
    } finally {
      handleLogoutImmediate();
    }
  }, [handleApiError, handleLogoutImmediate]);

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !accessToken) return;
    try {
      await service.newMessage(accessToken, { message: newMessage });
      setNewMessage("");
      await fetchMessages();
    } catch (err) {
      handleApiError(err);
    }
  };

  return (
    <div>
      <h1>Protoapp</h1>

      {accessToken === null ?
        <form onSubmit={handleLogin}>
          <h2>Login</h2>
          <div>
            <label>Email: </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label>Password: </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button type="submit">Login</button>
        </form>
      : <div>
          <button onClick={handleLogout}>Logout</button>

          <div>
            <h3>Messages</h3>
            <button onClick={fetchMessages}>Refresh Messages</button>
            <ul>
              {messages.length === 0 && <li>No messages yet.</li>}
              {messages.map((msg) => (
                <li key={msg.id}>
                  <strong>{msg.user_fullname || "Unknown User"}</strong> ({new Date(msg.posted_at).toLocaleString()}):
                  <p>{msg.message}</p>
                </li>
              ))}
            </ul>
          </div>

          <h3>Post a New Message</h3>
          <form onSubmit={handlePostMessage}>
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={5}
              placeholder="Enter your message..."
              required
            />
            <button type="submit" disabled={!newMessage.trim()}>
              Post Message
            </button>
          </form>
        </div>
      }
    </div>
  );
};

export default App;
