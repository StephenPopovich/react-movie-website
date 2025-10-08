export const uid = () =>
  Math.random().toString(36).slice(2) + Date.now().toString(36);

export const formatTime = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
