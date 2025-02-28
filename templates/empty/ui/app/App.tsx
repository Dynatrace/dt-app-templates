import React from "react";

import { Flex } from "@dynatrace/strato-components/layouts";
import {
  Code,
  Heading,
  Paragraph,
} from "@dynatrace/strato-components/typography";
import { AppHeader, Page } from "@dynatrace/strato-components-preview/layouts";

export const App = () => {
  return (
    <Page>
      <Page.Header>
        <AppHeader />
      </Page.Header>
      <Page.Main>
        <Flex padding={16} flexDirection="column">
          <Heading level={2}>Hello Dynatrace!</Heading>
          <Paragraph>
            Edit <Code>ui/app/App.tsx</Code> and save to reload.
          </Paragraph>
        </Flex>
      </Page.Main>
    </Page>
  );
};
