import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";

// Always is en-US, todo change if have multi-lang for display dateTime.
TimeAgo.addDefaultLocale(en);

export function convertDateTime(inputDateTime: string): string {
  const parsedDateTime = new Date(inputDateTime);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const month = monthNames[parsedDateTime.getUTCMonth()];
  const day = parsedDateTime.getUTCDate();
  const year = parsedDateTime.getUTCFullYear();

  const formattedDate = `${month} ${day}, ${year}`;

  return formattedDate;
}

export function calculatorLastLogin(dateTime: string, _locale?: string) {
  const parsedDateTime = new Date(dateTime ?? "");

  if (isNaN(parsedDateTime.getTime())) {
    return "Invalid date";
  }

  const timeAgo = new TimeAgo("en-US");
  const timeAgoString = timeAgo.format(parsedDateTime);

  return timeAgoString;
}

export const roleDataLeader = [
  {
    label: "Editor",
    value: "edit",
  },
  {
    label: "Guest",
    value: "viewer",
  },
  {
    label: "Leader",
    value: "leader",
  },
] as const;
export const roleData = [
  {
    label: "Editor",
    value: "edit",
  },
  {
    label: "Guest",
    value: "viewer",
  },
] as const;

export const roleDataProduct = [
  {
    label: "Editor",
    value: "edit",
  },
  {
    label: "Guest",
    value: "viewer",
  },
  {
    label: "Leader",
    value: "leader",
  },
  {
    label: "Admin",
    value: "admin",
  },
] as const;
