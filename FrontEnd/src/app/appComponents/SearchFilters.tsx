import React, { useState } from "react";
import {
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Autocomplete,
  Box,
  Card,
  Stack,
} from "@mui/material";
import { HeaderBox, InfoBox } from "./HeaderBox";
import { Themecolors, fonts } from "api/Colors";

interface Selection {
  [key: string]: string;
}

interface Detail {
  name: string;
  value: string;
  isFilter: boolean;
  dataType: string;
  selections: Selection;
  fieldType: number;
}

interface Section {
  title: string;
  description: string;
  columnType: number;
  details: Detail[];
}

interface SearchComponentProps {
  data: Section[];
  setValues: any; // Consider using a more specific type for setValues
}

const SearchFilters: React.FC<SearchComponentProps> = ({ data, setValues }) => {
  const [filterValues, setFilterValues] = useState(() => {
    const initialFilterValues = {};
    data.forEach((section) => {
      section.details.forEach((detail) => {
        if (detail.isFilter) {
          initialFilterValues[detail.value] = "";
        }
      });
    });
    return initialFilterValues;
  });

  const handleChange = (name: string, value: string) => {
    setFilterValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  if (!data.length) return <></>;
  return (
    <Box
      style={{
        minWidth: "300px",
        paddingBottom: "12px",
        height: "100%",
      }}
    >
      {data.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          <Card
            sx={{
              mb: 1.25,
              border: "1px solid #e0e0e0",
              borderRadius: 1.5,
              overflow: "hidden",
            }}
          >
            <HeaderBox
              sx={{
                height: 44,
                px: 1.5,
                backgroundColor: "#fafafa",
                color: Themecolors.Dg_bg2,
              }}
            >
              <InfoBox>
                <Typography
                  variant="overline"
                  sx={{ fontFamily: fonts.poppins, letterSpacing: 0.6 }}
                >
                  {section.title}
                </Typography>
              </InfoBox>
            </HeaderBox>

            <Box sx={{ p: 1.25 }}>
              <Stack spacing={1}>
                {section.description && (
                  <Typography
                    variant="caption"
                    sx={{ color: "text.secondary", fontFamily: fonts.inter }}
                  >
                    {section.description}
                  </Typography>
                )}

                {section.details
                  .filter((detail) => detail.isFilter)
                  .map((detail, index) => {
                    switch (detail.fieldType) {
                      case 1: {
                        // Text with autocomplete suggestions
                        const options = Object.values(detail.selections || {});
                        const inputVal = filterValues[detail.value] ?? "";
                        return (
                          <Autocomplete
                            key={index}
                            freeSolo
                            options={options as string[]}
                            inputValue={inputVal}
                            onInputChange={(ev, newInput) => {
                              handleChange(detail.value, newInput || "");
                            }}
                            onChange={(ev: any, value: string | null) => {
                              handleChange(detail.value, value || "");
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={detail.name}
                                variant="outlined"
                                size="small"
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    "& fieldset": {
                                      borderColor: "#e0e0e0",
                                    },
                                    "&:hover fieldset": {
                                      borderColor: "#bdbdbd",
                                    },
                                    "&.Mui-focused fieldset": {
                                      borderColor: "#bdbdbd",
                                    },
                                  },
                                }}
                              />)
                            }
                          />
                        );
                      }
                      case 6: {
                        // Numeric input
                        return (
                          <TextField
                            key={index}
                            type="number"
                            label={detail.name}
                            variant="outlined"
                            fullWidth
                            size="small"
                            value={filterValues[detail.value] ?? ""}
                            onChange={(ev) => {
                              handleChange(detail.value, ev.target.value);
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                  borderColor: "#e0e0e0",
                                },
                                "&:hover fieldset": {
                                  borderColor: "#bdbdbd",
                                },
                                "&.Mui-focused fieldset": {
                                  borderColor: "#bdbdbd",
                                },
                              },
                            }}
                          />
                        );
                      }
                      case 8: {
                        // Dropdown
                        const currentValue = filterValues[detail.value] ?? "";
                        return (
                          <FormControl fullWidth key={index} size="small">
                            <InputLabel>{detail.name}</InputLabel>
                            <Select
                              value={currentValue}
                              label={detail.name}
                              onChange={(ev) => {
                                const newValue = ev.target.value as string;
                                if (detail.dataType === "number") {
                                  handleChange(detail.value, `${newValue}`);
                                } else {
                                  handleChange(detail.value, newValue);
                                }
                              }}
                              sx={{
                                "& .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#e0e0e0",
                                },
                                "&:hover .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#bdbdbd",
                                },
                                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                  borderColor: "#bdbdbd",
                                },
                              }}
                            >
                              {Object.entries(detail.selections || {}).map(
                                ([key, value]) => (
                                  <MenuItem key={key} value={key}>
                                    {value}
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>
                        );
                      }
                      default:
                        return null;
                    }
                  })}
              </Stack>
            </Box>
          </Card>
        </React.Fragment>
      ))}
    </Box>
  );
};

export default SearchFilters;
