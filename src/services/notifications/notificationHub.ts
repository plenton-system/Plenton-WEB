import { LogLevel, HubConnectionBuilder } from '@microsoft/signalr';

import { HttpAuthState } from 'src/services/api';

const BASE_URL = (import.meta.env.VITE_BASE_URL ?? 'http://localhost:5226').replace(/\/$/, '');

export function createNotificationHubConnection() {
  return new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/hubs/notification`, {
      accessTokenFactory: () => HttpAuthState.getAccessToken() ?? '',
      withCredentials: true,
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Warning)
    .build();
}
