const isError = (input: unknown): input is Error & { code?: string } => {
  return input instanceof Error;
};

export const ignoreENOENT = (error: unknown) => {
  if (isError(error) && error.code === 'ENOENT') {
    return null;
  }
  throw error;
};
