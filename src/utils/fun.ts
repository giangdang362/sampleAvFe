import TimeAgo from "javascript-time-ago";

export function getDifferenceTime(date: string) {
  const timeAgo = new TimeAgo("en-US");
  return timeAgo.format(new Date(date), "round");
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}
