export const getExamStartTimestamp = (startedAt) => {
  if (startedAt instanceof Date) {
    const timestamp = startedAt.getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
  if (typeof startedAt !== 'string' || !startedAt.trim()) return null;

  const value = startedAt.trim();
  const normalized = /^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;
  const timestamp = Date.parse(normalized);
  return Number.isFinite(timestamp) ? timestamp : null;
};

export const getRemainingExamSeconds = (durationMinutes, startedAt, now = Date.now()) => {
  const duration = Number(durationMinutes);
  const startTimestamp = getExamStartTimestamp(startedAt);
  if (!Number.isFinite(duration) || duration <= 0 || startTimestamp === null) return null;

  const elapsedSeconds = Math.max(0, Math.floor((now - startTimestamp) / 1000));
  return Math.max(0, duration * 60 - elapsedSeconds);
};
