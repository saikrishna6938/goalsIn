import React from "react";
import { Box, Card, CardContent, Typography } from "@mui/material";

interface PieChartProps {
  title?: string;
  data: { status: string; value: number; color: string }[];
  onSelection?: (selectedItem: any) => void;
}

const PieChart: React.FC<PieChartProps> = ({ title, data, onSelection }) => {
  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);
  let cumulativeAngle = 0;

  const radius = 73;
  const innerRadius = 38;
  const center = 72;

  const getSlicePath = (startAngle: number, endAngle: number) => {
    const calculateCoordinates = (angle: number, r: number) => ({
      x: center + r * Math.cos((angle * Math.PI) / 180),
      y: center + r * Math.sin((angle * Math.PI) / 180),
    });

    if (data.length === 1) {
      const singleEntry = data[0];
      const percentage = singleEntry.value / totalValue;

      if (percentage === 1) {
        return `
          M ${center + radius},${center}
          A ${radius},${radius} 0 1,1 ${center - radius},${center}
          A ${radius},${radius} 0 1,1 ${center + radius},${center}
          L ${center + innerRadius},${center}
          A ${innerRadius},${innerRadius} 0 1,0 ${
          center - innerRadius
        },${center}
          A ${innerRadius},${innerRadius} 0 1,0 ${
          center + innerRadius
        },${center}
          Z
        `;
      }

      endAngle = startAngle + percentage * 360;
    }

    const { x: x1, y: y1 } = calculateCoordinates(startAngle, radius);
    const { x: x2, y: y2 } = calculateCoordinates(endAngle, radius);
    const { x: x3, y: y3 } = calculateCoordinates(endAngle, innerRadius);
    const { x: x4, y: y4 } = calculateCoordinates(startAngle, innerRadius);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `
      M ${x1},${y1}
      A ${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2}
      L ${x3},${y3}
      A ${innerRadius},${innerRadius} 0 ${largeArcFlag},0 ${x4},${y4}
      Z
    `;
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
      }}
    >
      {title && (
        <Typography
          variant="h6"
          sx={{
            fontSize: "0.9em",
            pb: "5px",
            fontWeight: "bold",
            ml: 1,
          }}
        >
          {title}
        </Typography>
      )}
      <CardContent
        sx={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: "row",
          height: "100%",
          overflow: "hidden",
          padding: "5px",
        }}
      >
        {/* Donut Chart */}
        <Box
          sx={{
            flex: "1 1 auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            mr: "8px",
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 145 145"
            preserveAspectRatio="xMidYMid meet"
          >
            {data.map((entry, index) => {
              const startAngle = cumulativeAngle;
              const endAngle =
                cumulativeAngle + (entry.value / totalValue) * 360;
              cumulativeAngle = endAngle;

              return (
                <g
                  key={index}
                  cursor="pointer"
                  onClick={() => onSelection?.(entry.status)}
                >
                  <path
                    d={getSlicePath(startAngle, endAngle)}
                    fill={entry.color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  {entry.value > 0 && (
                    <text
                      x={
                        center +
                        ((radius + innerRadius) / 2) *
                          Math.cos(
                            ((startAngle + endAngle) / 2) * (Math.PI / 180)
                          )
                      }
                      y={
                        center +
                        ((radius + innerRadius) / 2) *
                          Math.sin(
                            ((startAngle + endAngle) / 2) * (Math.PI / 180)
                          )
                      }
                      textAnchor="middle"
                      alignmentBaseline="middle"
                      fill="white"
                      fontSize="0.6em"
                      fontWeight="bold"
                    >
                      {entry.value}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </Box>

        {/* Legend */}
        <Box
          sx={{
            flex: "1 1 auto",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            overflow: "hidden",
            height: "100%",
          }}
        >
          {data.map((entry, index) => (
            <Typography
              key={index}
              sx={{
                color: entry.color,
                display: "flex",
                alignItems: "center",
                fontSize: "0.75em",
                fontWeight: 550,
                cursor: "pointer",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "normal",
                wordBreak: "break-word",
                WebkitLineClamp: 2,
                "&:hover": {
                  color: "black",
                },
              }}
              onClick={() => onSelection?.(entry.status)}
            >
              <span
                style={{
                  width: "0.5em",
                  height: "0.5em",
                  backgroundColor: entry.color,
                  borderRadius: "50%",
                  marginRight: "6px",
                  flexShrink: 0,
                }}
              />
              <Box sx={{ flex: 1, minWidth: "0" }}>{entry?.status}</Box>{" "}
            </Typography>
          ))}
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "0.85em" }}
          >
            Total: {totalValue}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PieChart;
