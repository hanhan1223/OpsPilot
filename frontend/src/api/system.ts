import api from './request';
import type { SystemStatus } from './types';

export function getSystemStatus(): Promise<SystemStatus> {
  return api.get('/v1/system/status');
}
