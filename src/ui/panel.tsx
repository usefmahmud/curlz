import { RGBA } from "@opentui/core";
import type { BoxProps } from "@opentui/react";

const dimBorder = RGBA.fromInts(255, 255, 255, 128);
const dimTitle = RGBA.fromInts(255, 255, 255, 96);

export type PanelProps = BoxProps & { title: string };

export function Panel({ title, children, ...props }: PanelProps) {
  return (
    <box
      border
      borderStyle="single"
      borderColor={dimBorder}
      title={title}
      titleColor={dimTitle}
      {...props}
    >
      {children}
    </box>
  );
}
