export const getUUID = (name: string) => {
  const buffer = Buffer.from(name, "utf-8");
  const base64Text = buffer.toString("base64");
  return base64Text;
};
