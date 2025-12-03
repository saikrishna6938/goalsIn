import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface BarChartProps {
  title?: string;
  data: { name: string; value: number; color: string }[];
  maxValue?: number;
  onSelection?: (selectedItem: any) => void;
}

const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  maxValue,
  onSelection,
}) => {
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);

  return (
    <Card
      sx={{
        display: "flex",
        flex: 1,
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {title && (
        <Typography
          sx={{
            ml: 1,
            fontSize: "0.9em",
            mb: "5px",
            fontWeight: "bold",
          }}
        >
          {title}
        </Typography>
      )}
      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Chart Container */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "97%",
            height: "100%",
            flex: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "flex-start",
              flexGrow: 1,
              width: "95%",
              borderLeft: "2px solid black",
              borderBottom: "2px solid black",
              position: "relative",
              minHeight: 90,
              gap: data.length > 1 ? "2em" : "0px",
            }}
          >
            {/* Vertical Axis Labels */}
            {[
              ...new Set(
                [0, max * 0.25, max * 0.5, max * 0.75, max].map(Math.round)
              ),
            ].map((val, index, arr) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  fontSize: "0.8em",
                  position: "absolute",
                  left: -25,
                  bottom: `${(index / (arr.length - 1)) * 100}%`,
                  transform: "translateY(50%)",
                }}
              >
                {val}
              </Typography>
            ))}

            {/* Bars */}
            {data.map((item, index) => (
              <Box
                key={index}
                sx={{
                  width: `${80 / data.length}%`,
                  maxWidth: "40px",
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || "#1976d2",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "center",
                  position: "relative",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                  transition: "0.3s",
                  marginLeft: index === 0 ? "1.2em" : "0px",
                  marginRight: index === data.length - 1 ? "1.2em" : "0px",
                }}
                onClick={() => onSelection?.(item.name)}
              >
                {/* Value Label */}
                <Typography
                  variant="caption"
                  sx={{
                    position: "absolute",
                    top: -20,
                    fontWeight: "bold",
                  }}
                >
                  {item.value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* X-axis Labels */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              width: "95%",
              mt: "2px",
            }}
          >
            {data.map((item, index) => (
              <Typography
                key={index}
                sx={{
                  width: `${100 / data.length}%`,
                  maxWidth: "68px",
                  textAlign: "center",
                  fontSize: "0.65em",
                  fontWeight: "bold",
                  wordBreak: "break-word",
                  cursor: "pointer",
                  textOverflow: "ellipsis",
                  whiteSpace: "normal",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitBoxOrient: "vertical",
                  WebkitLineClamp: 2,
                  marginLeft: index === 0 ? "1.2em" : "0px",
                }}
                onClick={() => onSelection?.(item.name)}
              >
                {item.name}
              </Typography>
            ))}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default BarChart;
