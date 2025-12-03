import React, { useEffect, useState } from "react";
// Removed unused Dialog imports
import { styled } from "@mui/material";
import { api } from "api/API";
import appStore from "app/mobxStore/AppStore";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Icon,
  IconButton,
  Modal,
  TextField,
  Typography,
  Card,
} from "@mui/material";
import { observer } from "mobx-react";
import { toJS } from "mobx";
interface Entity {
  entityId: number;
  entityName: string;
  entityLocation: string;
  entityPhone: string;
  entityDescription: string;
}

interface EntityDialogProps {
  onClose: () => void;
}

// Tile-style entity card aligned with Files/Create tiles
const EntityTile = styled(Card)<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: 72,
    padding: theme.spacing(1, 1.5),
    cursor: "pointer",
    border: `1px solid ${
      selected ? theme.palette.primary.main : theme.palette.divider
    }`,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 0,
    boxShadow: selected ? theme.shadows[2] : "none",
    transition: theme.transitions.create(
      ["transform", "box-shadow", "background-color", "border-color"],
      { duration: theme.transitions.duration.shortest }
    ),
    overflow: "hidden",
    "&:hover": {
      transform: "translateY(-2px)",
      boxShadow: theme.shadows[3],
      backgroundColor: theme.palette.action.hover,
    },
  })
);

const TileTitle = styled(Typography)(({ theme }) => ({
  position: "absolute",
  left: 8,
  right: 8,
  bottom: 8,
  textAlign: "center",
  fontWeight: 600,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
}));

const ModalContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",
  maxWidth: 830,
  height: "auto",
  maxHeight: "70%",
  backgroundColor: theme.palette.background.paper,
  borderRadius: 0,
  boxShadow: theme.shadows[6],
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
}));

const EntityDialog: React.FC<EntityDialogProps> = observer(({ onClose }) => {
  const [entities, setEntities] = useState([]);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<number | null>(null);

  useEffect(() => {
    setOpen(appStore.showEntityDialog);
  }, [`${appStore.showEntityDialog}`]);

  useEffect(() => {
    if (!appStore.loginResponse.success) return;
    if (appStore.userEntities.length > 0) {
      setEntities(toJS(appStore.userEntities));
      return;
    }

    api
      .get(`get-user-entities/${appStore.loginResponse.user[0].userId}`)
      .then((res) => {
        if (res.success) {
          if (res.data.length > 1) {
            setOpen(false);
            // const selectedEntity = res.data[0]?.entityId;
            // appStore.setSelectedEntity(selectedEntity);
          }
          const entities = res.data ?? [];
          appStore.setUserEntities(entities);
          setEntities(entities);
        }
      })
      .catch((err) => {
        throw err;
      });
  }, [appStore.loginResponse.success]);

  const filteredEntities = entities.filter((entity) =>
    entity.entityName.toLowerCase().includes(filter.toLowerCase())
  );
  const columnCount = filteredEntities.length >= 5 ? 3 : 2;
  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          appStore.setShowEntityDialog(false);
        }}
      >
        <ModalContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: (t) => `1px solid ${t.palette.divider}`,
              gap: 2,
              px: 2,
              py: 1,
            }}
          >
            <Typography
              id="entity-dialog-title"
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                whiteSpace: "nowrap",
              }}
            >
              Select an Entity
            </Typography>
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, ml: "auto" }}
            >
              <TextField
                variant="outlined"
                placeholder="Filter entities..."
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  width: 280,
                  "& .MuiOutlinedInput-root": {
                    height: 36,
                  },
                }}
              />

              <IconButton
                onClick={() => {
                  appStore.setShowEntityDialog(false);
                  setOpen(false);
                }}
                sx={{
                  color: "grey.600",
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              overflowX: "hidden",
              p: 2,
              display: "grid",
              gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
              gap: 1.5,
            }}
          >
            {filteredEntities.map((entity) => (
              <EntityTile
                key={entity.entityId}
                selected={entity.entityId === appStore.selectedEntity}
                onClick={() => {
                  setSelectedEntity(entity.entityId);
                  appStore.setSelectedEntity(entity.entityId);
                  appStore.setShowEntityDialog(false);
                  setOpen(false);
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minWidth: 0,
                    width: "100%",
                  }}
                >
                  <Icon
                    sx={{ color: (t) => t.palette.primary.main, fontSize: 20 }}
                  >
                    business
                  </Icon>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    title={entity.entityName}
                    sx={{
                      minWidth: 0,
                      flex: 1,
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      lineHeight: 1.3,
                      maxHeight: "2.6em",
                    }}
                  >
                    {entity.entityName}
                  </Typography>
                </Box>
              </EntityTile>
            ))}
          </Box>
        </ModalContent>
      </Modal>
    </>
  );
});

export default EntityDialog;
