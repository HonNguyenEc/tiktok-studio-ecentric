const cooldownRegistry = new Map<string, number>();

export const createRequestId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const canRunWithCooldown = (actionKey: string, cooldownMs: number): boolean => {
  const now = Date.now();
  const prev = cooldownRegistry.get(actionKey) || 0;
  if (now - prev < cooldownMs) return false;
  cooldownRegistry.set(actionKey, now);
  return true;
};
