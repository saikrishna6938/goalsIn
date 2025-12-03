import React, { useState, useEffect } from "react";
import { Box, Button, styled } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { observer } from "mobx-react-lite";
import taskStore from "app/mobxStore/TaskStore";
import { Themecolors } from "api/Colors";

const NavButton = styled(Button)(() => ({
  minWidth: "30px",
  height: "25px",
  borderRadius: "6px",
  padding: 0,
  background: "white",
  color: "black",
  border: "1px solid white",
  "&:hover": {
    backgroundImage: Themecolors.B_hv3,
  },
}));

const PaginationNavigator: React.FC = observer(() => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [index, setIndex] = useState(0);

  const storedTaskIds = taskStore.selectedTaskIds.slice();

  useEffect(() => {
    if (id && storedTaskIds.length > 0) {
      const currentIndex = storedTaskIds.findIndex(
        (taskId) => taskId === Number(id)
      );
      if (currentIndex !== -1) setIndex(currentIndex);
    }
  }, [id, storedTaskIds]);

  const handlePrev = () => {
    if (index > 0) {
      const newIndex = index - 1;
      setIndex(newIndex);
      navigate(`/user/task/${storedTaskIds[newIndex]}`, { replace: true });
    }
  };

  const handleNext = () => {
    if (index < storedTaskIds.length - 1) {
      const newIndex = index + 1;
      setIndex(newIndex);
      navigate(`/user/task/${storedTaskIds[newIndex]}`, { replace: true });
    }
  };

  if (!storedTaskIds.length) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <NavButton onClick={handlePrev} disabled={index === 0}>
        <ArrowLeft />
      </NavButton>

      <Box sx={{ mx: 1 }}>
        {index + 1}/{storedTaskIds.length}
      </Box>

      <NavButton
        onClick={handleNext}
        disabled={index === storedTaskIds.length - 1}
      >
        <ArrowRight />
      </NavButton>
    </Box>
  );
});

export default PaginationNavigator;
