import React from "react";
import {
  Flex,
  Heading,
  Paragraph,
  Strong,
  useCurrentTheme,
} from "@dynatrace/strato-components";
import { Card } from "../components/Card";

export const Home = () => {
  const theme = useCurrentTheme();
  return (
    <Flex flexDirection="column" alignItems="center" padding={32}>
      <img
        src="./assets/Dynatrace_Logo.svg"
        alt="Dynatrace Logo"
        width={150}
        height={150}
        style={{ paddingBottom: 32 }}
      ></img>

      <Heading>Welcome To Your Dynatrace App</Heading>
      <Paragraph>
        Edit <Strong>src/app/pages/Home.tsx</Strong> and save to reload the app.
      </Paragraph>
      <Paragraph>
        For more information and help on app development, check out the
        following:
      </Paragraph>

      <Flex gap={48} paddingTop={64} flexFlow="wrap">
        <Card
          href="/data"
          inAppLink
          imgSrc={
            theme === "light" ? "./assets/data.png" : "./assets/data_dark.png"
          }
          name="Explore data"
        />
        <Card
          href="https://dt-url.net/developers"
          imgSrc={
            theme === "light"
              ? "./assets/devportal.png"
              : "./assets/devportal_dark.png"
          }
          name="Dynatrace Developer"
        />
        <Card
          href="https://dt-url.net/devcommunity"
          imgSrc={
            theme === "light"
              ? "./assets/community.png"
              : "./assets/community_dark.png"
          }
          name="Developer Community"
        />
      </Flex>
    </Flex>
  );
};
