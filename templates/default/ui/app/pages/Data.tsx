import React, { useState } from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import { Heading, Paragraph } from "@dynatrace/strato-components/typography";
import {
  RunQueryButton,
  type QueryStateType,
} from "@dynatrace/strato-components-preview/buttons";
import { TimeseriesChart } from "@dynatrace/strato-components-preview/charts";
import {
  convertToTimeseries,
  recommendVisualizations,
} from "@dynatrace/strato-components-preview/conversion-utilities";
import { DQLEditor } from "@dynatrace/strato-components-preview/editors";
import Colors from "@dynatrace/strato-design-tokens/colors";
import { CriticalIcon } from "@dynatrace/strato-icons";
import { useDql } from "@dynatrace-sdk/react-hooks";

export const Data = () => {
  const initialQuery =
    "fetch logs \n| summarize count(), by:{bin(timestamp, 1m)}";

  const [editorQueryString, setEditorQueryString] =
    useState<string>(initialQuery);
  const [queryString, setQueryString] = useState<string>(initialQuery);

  const { data, error, isLoading, cancel, refetch } = useDql({
    query: queryString,
  });

  const recommendations = recommendVisualizations(
    data?.records ?? [],
    data?.types ?? []
  );

  // onClickQuery function is executed when the "RUN QUERY" Button is clicked and fetches the data from Grail.
  function onClickQuery() {
    if (isLoading) {
      cancel();
    } else {
      if (queryString !== editorQueryString) setQueryString(editorQueryString);
      else refetch();
    }
  }

  let queryState: QueryStateType;
  if (error) {
    queryState = "error";
  } else if (isLoading) {
    queryState = "loading";
  } else if (data) {
    queryState = "success";
  } else {
    queryState = "idle";
  }

  return (
    <>
      <Flex flexDirection="column" alignItems="center" padding={32}>
        <img
          src="./assets/Dynatrace_Logo.svg"
          alt="Dynatrace Logo"
          width={150}
          height={150}
          style={{ paddingBottom: 32 }}
        ></img>
        <Heading level={2}>
          Explore the data in your environment by using the Dynatrace Query
          Language
        </Heading>
      </Flex>
      <Flex flexDirection="column" padding={32}>
        <DQLEditor
          value={queryString}
          onChange={(event) => setEditorQueryString(event)}
        />
        <Flex justifyContent={error ? "space-between" : "flex-end"}>
          {error && (
            <Flex
              alignItems={"center"}
              style={{ color: Colors.Text.Critical.Default }}
            >
              <CriticalIcon />
              <Paragraph>{error.message}</Paragraph>
            </Flex>
          )}
          {!error && !data?.records && <Paragraph>no data available</Paragraph>}
          {!error &&
            data?.records &&
            !recommendations.includes("TimeSeriesChart") && (
              <Paragraph>use a query which has time series data</Paragraph>
            )}
          <RunQueryButton
            onClick={onClickQuery}
            queryState={queryState}
          ></RunQueryButton>
        </Flex>
        {data?.records && recommendations.includes("TimeSeriesChart") && (
          <TimeseriesChart
            data={convertToTimeseries(data.records, data.types)}
            gapPolicy="connect"
            variant="line"
          />
        )}
      </Flex>
    </>
  );
};
