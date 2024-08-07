import React, { useState, useEffect } from "react";
import GraphViewer from "./GraphViewer";
import { Box, Container, Tab, Tabs } from "@mui/material";
import { useDropzone } from "react-dropzone";
import DropZone from "./DropZone";
import Introduction from "./Introduction";
import useFileHandler from "../hooks/useFileHandler";
import useGraphData from "../hooks/useGraphData";
import DataTableContainer from "./DataTableContainer";
import ReactGA from "react-ga4";

const GraphDataHandler: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0);
  const [graphType, setGraphType] = useState<"2d" | "3d">("2d");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<
    | "entities"
    | "relationships"
    | "documents"
    | "textunits"
    | "communities"
    | "communityReports"
    | "covariates"
  >("entities");
  const [includeDocuments, setIncludeDocuments] = useState(false);
  const [includeTextUnits, setIncludeTextUnits] = useState(false);
  const [includeCommunities, setIncludeCommunities] = useState(false);
  const [includeCovariates, setIncludeCovariates] = useState(false);

  const {
    entities,
    relationships,
    documents,
    textunits,
    communities,
    covariates,
    communityReports,
    handleFilesRead,
  } = useFileHandler();

  const graphData = useGraphData(
    entities,
    relationships,
    documents,
    textunits,
    communities,
    communityReports,
    covariates,
    includeDocuments,
    includeTextUnits,
    includeCommunities,
    includeCovariates
  );

  const hasDocuments = documents.length > 0;
  const hasTextUnits = textunits.length > 0;
  const hasCommunities = communities.length > 0;
  const hasCovariates = covariates.length > 0;

  useEffect(() => {
    if (entities.length > 0) {
      setTabIndex(1);
    }
  }, [entities]);

  useEffect(() => {
    ReactGA.initialize("G-0TD0FXFZDE");
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    handleFilesRead(acceptedFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: false,
    noKeyboard: true,
    accept: {
      "application/x-parquet": [".parquet"],
    },
  });

  const handleChange = (event: React.ChangeEvent<{}>, newValue: number) => {
    setTabIndex(newValue);
    ReactGA.send({
      hitType: "event",
      eventCategory: "Tabs",
      eventAction: "click",
      eventLabel: `Tab ${newValue}`,
    });
  };

  const toggleGraphType = () => {
    setGraphType((prevType) => (prevType === "2d" ? "3d" : "2d"));
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <Tabs value={tabIndex} onChange={handleChange} centered>
        <Tab label="Upload Artifacts" />
        <Tab label="Graph Visualization" />
        <Tab label="Data Tables" />
      </Tabs>
      {tabIndex === 0 && (
        <Container
          maxWidth="md"
          sx={{
            mt: 3,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 64px)",
          }}
        >
          <Introduction />
          <DropZone {...{ getRootProps, getInputProps, isDragActive }} />
        </Container>
      )}
      {tabIndex === 1 && (
        <Box
          p={3}
          sx={{
            height: isFullscreen ? "100vh" : "calc(100vh - 64px)",
            width: isFullscreen ? "100vw" : "100%",
            position: isFullscreen ? "fixed" : "relative",
            top: 0,
            left: 0,
            zIndex: isFullscreen ? 1300 : "auto",
            overflow: "hidden",
          }}
        >
          <GraphViewer
            data={graphData}
            graphType={graphType}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
            onToggleGraphType={toggleGraphType}
            includeDocuments={includeDocuments}
            includeTextUnits={includeTextUnits}
            onIncludeDocumentsChange={() =>
              setIncludeDocuments(!includeDocuments)
            }
            onIncludeTextUnitsChange={() =>
              setIncludeTextUnits(!includeTextUnits)
            }
            includeCommunities={includeCommunities}
            onIncludeCommunitiesChange={() =>
              setIncludeCommunities(!includeCommunities)
            }
            includeCovariates={includeCovariates}
            onIncludeCovariatesChange={() =>
              setIncludeCovariates(!includeCovariates)
            }
            hasDocuments={hasDocuments}
            hasTextUnits={hasTextUnits}
            hasCommunities={hasCommunities}
            hasCovariates={hasCovariates}
          />
        </Box>
      )}

      {tabIndex === 2 && (
        <Box sx={{ display: "flex", height: "calc(100vh - 64px)" }}>
          <DataTableContainer
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            entities={entities}
            relationships={relationships}
            documents={documents}
            textunits={textunits}
            communities={communities}
            communityReports={communityReports}
            covariates={covariates}
          />
        </Box>
      )}
    </>
  );
};

export default GraphDataHandler;