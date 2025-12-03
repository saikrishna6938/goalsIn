import { Themecolors } from "api/Colors";

export const sharedInputStyles = {
  root: {
    "& .MuiOutlinedInput-root": {
      "& .MuiInputBase-input": {
        paddingTop: "10px",
        paddingBottom: "10px",
      },
      borderRadius: "4px",
      "& fieldset": {
        borderColor: "#bdbdbd",
      },
      "&:hover fieldset": {
        borderColor: Themecolors.InputBorder2,
      },
      "&.Mui-focused fieldset": {
        borderColor: Themecolors.InputBorder2,
      },
    },
  },

  inputProps: {
    color: Themecolors.InputText_Color1,
    "& .MuiInputBase-input": {
      color: Themecolors.InputText_Color1,
    },
  },

  labelProps: {
    color: Themecolors.InputText_Color1,
    "&.Mui-focused": {
      color: Themecolors.InputText_Color1,
    },
  },
};
