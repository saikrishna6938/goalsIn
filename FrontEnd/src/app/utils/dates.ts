export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);

  const formattedDate = new Intl.DateTimeFormat("en-GB").format(date);

  const formattedTime = date.toLocaleTimeString([], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  return `${formattedTime}`;
};
