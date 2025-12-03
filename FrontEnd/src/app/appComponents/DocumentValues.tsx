import React, { useState } from "react";
import { Box, IconButton, Paper, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { ProfileHeaderStyle } from "./HeaderBox";
import AttachmentList from "app/formComponents/AttachmentList";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ExpandLess } from "@mui/icons-material";
import { Themecolors, fonts } from "api/Colors";
type FormDetail = {
  order: string;
  attributeName: string;
  attributeDescription: string;
  attributeType: string;
};

type FormDetailsGroup = {
  groupName: string;
  repeated: boolean;
  form: FormDetail[];
};

type Section = {
  sectionName: string;
  initialValues: Record<string, string>;
  formDetails: FormDetailsGroup[];
};

type SectionsData = {
  documentTagType: string;
  selections: any[];
  sections: Section[];
};

const StyledSection = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
  display: "grid",
  gridTemplateColumns: "repeat(1, 1fr)",
  marginBottom: theme.spacing(1),
  padding: theme.spacing(1),
}));

const StyledGroup = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  width: "100%",
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

const MainContainer = styled(Box)(({ theme }) => ({
  height: "100%",
  overflowY: "auto",
  padding: theme.spacing(1),
}));

const StyledTitle = styled(Box)({
  gridColumn: "span 2",
  cursor: "pointer",
});

const StyledSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: "0.875rem",
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
  gridColumn: "1 / -1",
  fontWeight: 500,
  fontFamily: fonts.poppins,
}));

const StyledField = styled(Box)(({ theme }) => ({
  width: "100%",
  padding: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  display: "flex",
  flexDirection: "column",
  boxSizing: "border-box",
  borderRadius: 4,
}));

const FieldLabel = styled(Typography)({
  fontWeight: 500,
  marginBottom: 4,
  fontSize: "0.75rem",
  fontFamily: fonts.inter,
});

const FieldValue = styled(Typography)({
  fontWeight: 400,
  color: Themecolors.InputText_Color2,
  fontSize: "0.875rem",
  wordWrap: "break-word",
  overflowWrap: "break-word",
  whiteSpace: "normal",
  display: "block",
  wordBreak: "break-word",
  fontFamily: fonts.open_sans,
});

const FormField: React.FC<{ detail: FormDetail; initialValue: string }> = ({
  detail,
  initialValue,
}) => (
  <StyledField>
    <FieldLabel>{detail.attributeDescription}:</FieldLabel>
    <FieldValue>{initialValue}</FieldValue>
  </StyledField>
);

const SectionComponent: React.FC<{
  section: Section;
  index: number;
  openFile: Function;
}> = ({ section, index, openFile }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };
  const hadnleClick = (file: any) => {
    // console.log("file==", file);
    openFile(file);
  };
  const renderField = (field: FormDetail) => {
    if (field.attributeType === "5") {
      return (
        <StyledField key={field.order}>
          <FieldLabel>{field.attributeName}:</FieldLabel>
          <AttachmentList
            key={`attachments-${field.order}`}
            attachments={(section.initialValues[field.order] as any) ?? []}
            onOpenAttachment={(file) => {
              hadnleClick(file);
            }}
            showHeader={false}
          />
        </StyledField>
      );
    } else {
      return (
        <StyledField key={field.order}>
          <FieldLabel>{field.attributeName}:</FieldLabel>
          <FieldValue>
            {String(section.initialValues[field.order]).length > 0
              ? section.initialValues[field.order]
              : "NA"}
          </FieldValue>
        </StyledField>
      );
    }
  };

  return (
    <StyledSection>
      <StyledTitle onClick={toggleAccordion}>
        <ProfileHeaderStyle>
          <Typography
            sx={{
              fontSize: "0.875rem",
              fontWeight: 500,
              fontFamily: fonts.poppins,
              color: Themecolors.H_text1,
              cursor: "pointer",
              flexGrow: 1,
            }}
          >
            {section.sectionName}
          </Typography>
          {index > 0 && (
            <IconButton
              color="default"
              size="small"
              onClick={toggleAccordion}
              sx={{ color: Themecolors.H_text1 }}
            >
              {isOpen ? <ExpandLess /> : <ExpandMoreIcon />}
            </IconButton>
          )}
        </ProfileHeaderStyle>
      </StyledTitle>
      {(isOpen || index === 0) && (
        <div>
          {section.formDetails.map((group, idx) => (
            <FormGroup
              key={idx}
              group={group}
              initialValues={section.initialValues}
              renderField={renderField}
            />
          ))}
        </div>
      )}
    </StyledSection>
  );
};

const FormGroup: React.FC<{
  group: FormDetailsGroup;
  initialValues: Record<string, string>;
  renderField: (field: FormDetail) => React.ReactNode;
}> = ({ group, initialValues, renderField }) => (
  <StyledGroup>
    <StyledSubtitle>{group.groupName}</StyledSubtitle>
    {group.form.map((detail) => renderField(detail))}
  </StyledGroup>
);

const DocumentValues: React.FC<{ data: SectionsData; openFile: Function }> = ({
  data,
  openFile,
}) => {
  return (
    <MainContainer>
      {data.sections.map((section: Section, sectionIndex: number) => (
        <SectionComponent
          key={sectionIndex}
          section={section}
          index={sectionIndex}
          openFile={openFile}
        />
      ))}
    </MainContainer>
  );
};

export default DocumentValues;
