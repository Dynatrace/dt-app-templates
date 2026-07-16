import React from "react";
import {
  AppHeader,
  Flex,
  PageLayout,
} from "@dynatrace/strato-components/layouts";
import {
  Code,
  Heading,
  Paragraph,
} from "@dynatrace/strato-components/typography";

export const App = () => {
  return (
    <PageLayout>
      <PageLayout.Header>
        <AppHeader />
      </PageLayout.Header>
      <PageLayout.Content>
        <Flex padding={16} flexDirection="column">
          <Heading level={2}>Hello Dynatrace!</Heading>
          <Paragraph>
            Edit <Code>ui/app/App.tsx</Code> and save to reload.
          </Paragraph>
        </Flex>
      </PageLayout.Content>
    </PageLayout>
  );
};
