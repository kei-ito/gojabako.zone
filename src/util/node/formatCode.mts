import type { RequiredOptions } from 'prettier';
import { format } from 'prettier';
import options from '../../../.prettierrc.json' assert { type: 'json' };

export const formatCode = async (
  code: string,
  parser: RequiredOptions['parser'] = 'typescript',
): Promise<string> => {
  return await format(code, { ...(options as RequiredOptions), parser });
};
