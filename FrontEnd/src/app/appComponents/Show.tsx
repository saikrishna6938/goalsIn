import React from "react";

interface ShowProps {
  condition: boolean;
  children: React.ReactNode;
}

const Show: React.FC<ShowProps> = ({ condition, children }) => {
  return condition ? <>{children}</> : null;
};

export default Show;
