import React from "react";
import { AppHeader, AppName, Page, Flex, Code, Heading, Paragraph } from "@dynatrace/strato-components-preview";

export const App = () => {
  return (
    <Page>
      <Page.Header>
        <AppHeader>
          <AppName />
        </AppHeader>
      </Page.Header>
      <Page.Main>
        <Flex padding={16} flexDirection="column">
          <Heading level={2}>Hello Dynatrace!</Heading>
          <Paragraph>
            Edit <Code>src/app/App.tsx</Code> and save to reload.
          </Paragraph>
        </Flex>
      </Page.Main>
    </Page>
  );
};
