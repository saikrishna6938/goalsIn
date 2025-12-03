import React from "react";
import { Paper, Typography, styled } from "@mui/material";

const DocumentContainer = styled(Paper)`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 150px;
  padding: 40px;
  box-sizing: border-box;
  cursor: pointer;
  margin: 10px;
  background-color: transparent; // Removes Paper's default background

  background-image: linear-gradient(
      rgba(255, 255, 255, 0.95),
      rgba(255, 255, 255, 0.95)
    ),
    url("http://localhost:3000/assets/images/document.png");
  background-repeat: no-repeat;
  background-position: center;
  background-attachment: local;
  background-size: contain;
  border-radius: 0;
  border: 0.5px solid #e0e0e0;
  :hover {
    background-image: linear-gradient(
        rgba(245, 245, 245, 0.95),
        rgba(245, 245, 245, 0.95)
      ),
      url("http://localhost:3000/assets/images/document.png");
  }
`;

interface DocumentViewProps {
  title: string;
  id: number;
  onDocumentClick: Function;
}
const DocumentView: React.FC<DocumentViewProps> = ({
  title,
  id,
  onDocumentClick,
}) => {
  return (
    <DocumentContainer elevation={0} onClick={() => onDocumentClick(id)}>
      <Typography variant="h6" component="h1">
        {title}
      </Typography>
    </DocumentContainer>
  );
};

export default DocumentView;
