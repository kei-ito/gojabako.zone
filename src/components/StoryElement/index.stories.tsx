import type { StoryObj } from "@storybook/react";
import { StoryElement } from ".";

export const Default: StoryObj = {
  render: () => (
    <StoryElement.Gallery>
      <StoryElement.Heading>Columns</StoryElement.Heading>
      <StoryElement.Columns
        columns={{ 1: "C1", 2: "C2", 3: "C3" }}
        render={({ column }) => `Column ${column}`}
      />
      <StoryElement.Heading>Rows</StoryElement.Heading>
      <StoryElement.Rows
        rows={{ 1: "R1", 2: "R2", 3: "R3" }}
        render={({ row }) => `Row ${row}`}
      />
      <StoryElement.Heading>Table</StoryElement.Heading>
      <StoryElement.Table
        columns={{ 1: "C1", 2: "C2", 3: "C3" }}
        rows={{ 1: "R1", 2: "R2", 3: "R3" }}
        render={({ column, row }) => `Table ${column}, ${row}`}
      />
    </StoryElement.Gallery>
  ),
};
