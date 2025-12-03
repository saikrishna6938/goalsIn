import React, { useEffect, useState } from "react";
import { Box, Grid, MenuItem, TextField } from "@mui/material";
import { api } from "api/API";
import TextInputField from "app/components/regularinputs/TextInpuField";

interface Props {
  currentObj: any;
  status: any[];
  onChangePayload?: (payload: {
    fromStateId: number | string;
    toStateId: number | string;
    actionId: number | string;
    transitionId?: number | string;
  }) => void;
}

const Transition: React.FC<Props> = ({
  currentObj,
  status,
  onChangePayload,
}) => {
  const [transitions, setTransitions] = useState<any[]>([]);
  const [fromStateId, setFromStateId] = useState<number | string>("");
  const [toStateId, setToStateId] = useState<number | string>("");
  const [transitionId, SetTransitionId] = useState<number | string>("");

  useEffect(() => {
    const payload: any = {
      fromStateId,
      toStateId,
      actionId: currentObj.id,
    };

    if (transitionId !== "") {
      payload.transitionId = transitionId;
    }

    onChangePayload(payload);
  }, [fromStateId, toStateId, currentObj?.id, transitionId, onChangePayload]);

  useEffect(() => {
    if (!transitions.length && currentObj?.documentStateId) {
      setFromStateId(currentObj.documentStateId);
    }
  }, [currentObj, transitions]);

  useEffect(() => {
    const fetchTransitions = async () => {
      try {
        const response = await api.get(
          `administrator/workflows/actions/transitions/${currentObj.id}`
        );
        const data = response.data;
        setTransitions(data);
        if (data.length > 0) {
          setFromStateId(data[0].fromStateId);
          setToStateId(data[0].toStateId);
          SetTransitionId(data[0].transitionId);
        }
      } catch (err) {
        console.error("Error fetching transitions", err);
      }
    };

    fetchTransitions();
  }, []);

  return (
    <Box sx={{ flexGrow: 1, mb: "2em" }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextInputField
            label="Action Id"
            value={currentObj.id}
            variant="standard"
            readOnly
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="From State"
            value={fromStateId}
            onChange={(e) => setFromStateId(e.target.value)}
            variant="standard"
            InputProps={{
              readOnly: !!transitions.length,
            }}
          >
            {status?.map((item) => (
              <MenuItem key={item.documentStateId} value={item.documentStateId}>
                {item.documentStateName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            select
            label="To State"
            value={toStateId}
            onChange={(e) => setToStateId(e.target.value)}
            variant="standard"
          >
            {status.map((item) => (
              <MenuItem key={item.documentStateId} value={item.documentStateId}>
                {item.documentStateName}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Transition;
