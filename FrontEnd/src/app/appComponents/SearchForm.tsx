import React, { useState } from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledFieldContainer = styled("div")({
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  border: "1px solid #ddd",
  borderRadius: "4px",
  padding: "16px",
  margin: "8px 0",
});

const StyledField = styled("div")({
  maxWidth: "500px",
  padding: "8px", // for some space between fields
  minWidth: "200px",
});

export interface SearchField {
  name: string;
  type: string;
}

export interface SearchFormProps {
  fields: SearchField[];
  onSubmit: (values: any) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ fields, onSubmit }) => {
  const [values, setValues] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    onSubmit(values);
  };

  return (
    <Container>
      <StyledFieldContainer>
        {fields.map((field) => {
          const FieldComponent = (() => {
            if (field.type.includes("VARCHAR") || field.type.includes("TEXT")) {
              return (
                <TextField
                  key={field.name}
                  label={field.name}
                  variant="outlined"
                  fullWidth
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              );
            } else if (field.type.includes("BOOLEAN")) {
              return (
                <FormControl fullWidth variant="outlined" key={field.name}>
                  <InputLabel>{field.name}</InputLabel>
                  <Select
                    value={values[field.name] || ""}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    label={field.name}
                  >
                    <MenuItem href="">Yes</MenuItem>
                    <MenuItem href="">No</MenuItem>
                  </Select>
                </FormControl>
              );
            } else {
              return (
                <TextField
                  key={field.name}
                  label={field.name}
                  variant="outlined"
                  fullWidth
                  type="number"
                  value={values[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                />
              );
            }
          })();

          return <StyledField key={field.name}>{FieldComponent}</StyledField>;
        })}
      </StyledFieldContainer>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        Search
      </Button>
    </Container>
  );
};

export default SearchForm;
