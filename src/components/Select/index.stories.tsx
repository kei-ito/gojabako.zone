import type { StoryObj } from '@storybook/react';
import { StoryElement } from '../StoryElement';
import { Select } from '.';

export const Default: StoryObj = {
  render: () => (
    <StoryElement.Gallery>
      <StoryElement.Heading>CryptoKeyStore</StoryElement.Heading>
      <Select value="2">
        <option value="1">option1</option>
        <option value="2">option2</option>
        <option value="3">option3</option>
      </Select>
    </StoryElement.Gallery>
  ),
};
