export const getDatePart = (value: string): string =>
  value && value.includes("T") ? value.split("T")[0] : "";

export const getTimePart = (value: string): string =>
  value && value.includes("T") ? value.split("T")[1]?.slice(0, 5) || "" : "";

export const updateDateTime = (
  currentValue: string,
  part: "date" | "time",
  nextValue: string
): string => {
  const currentDate = getDatePart(currentValue);
  const currentTime = getTimePart(currentValue);
  const date = part === "date" ? nextValue : currentDate;
  const time = part === "time" ? nextValue : currentTime;
  if (!date && !time) return "";
  return `${date || ""}T${time || "00:00"}`;
};

export const parseScheduleValue = (value: string): Date | null => {
  if (!value) return null;
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

export const isScheduleRangeInvalid = (
  scheduleStart: string,
  scheduleEnd: string
): boolean => {
  const start = parseScheduleValue(scheduleStart);
  const end = parseScheduleValue(scheduleEnd);
  if (!start || !end) return false;
  return end <= start;
};
