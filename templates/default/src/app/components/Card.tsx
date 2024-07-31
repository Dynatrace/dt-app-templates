import Borders from "@dynatrace/strato-design-tokens/borders";
import BoxShadows from "@dynatrace/strato-design-tokens/box-shadows";
import Colors from "@dynatrace/strato-design-tokens/colors";
import { Flex, Link } from "@dynatrace/strato-components";
import { Link as RouterLink } from "react-router-dom";
import React from "react";

type CardProps = {
  /** Absolute or relative link for the Card */
  href: string;
  /** The src for the image to show. */
  imgSrc: string;
  /** The name for the Card to show below the image. */
  name: string;
  /** Is the link target in the app? default: false */
  inAppLink?: boolean;
};

export const Card = ({ href, inAppLink, imgSrc, name }: CardProps) => {
  const content = (
    <Flex flexDirection="column" alignItems="center" gap={24}>
      <img src={imgSrc} alt={name} height="100px" width="100px" />
      {name}
    </Flex>
  );

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={24}
      style={{
        width: "210px",
        height: "210px",
        textAlign: "center",
        border: `${Colors.Border.Neutral.Default}`,
        borderRadius: `${Borders.Radius.Container.Default}`,
        background: `${Colors.Background.Surface.Default}`,
        boxShadow: `${BoxShadows.Surface.Raised.Rest}`,
      }}
    >
      {/* An in-app link needs to be handled by react-router to avoid full page reloads */}
      {inAppLink ? (
        <Link as={RouterLink} to={href}>
          {content}
        </Link>
      ) : (
        <Link target="_blank" href={href} rel="noopener noreferrer">
          {content}
        </Link>
      )}
    </Flex>
  );
};
