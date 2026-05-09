import api from './request';
import type { DeployRequest, DeployResponse, DeployRecord } from './types';

export function triggerDeploy(data: DeployRequest): Promise<DeployResponse> {
  return api.post('/v1/deploy/', data);
}

export function getDeployLogs(
  projectId: number,
  deployId?: number,
): Promise<DeployRecord> {
  return api.get(`/v1/logs/${projectId}`, {
    params: deployId ? { deploy_id: deployId } : undefined,
  });
}
