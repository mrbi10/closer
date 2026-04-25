export const extractErrorMessage = (error, fallbackMessage = 'Something went wrong.') => {
  if (!error) {
    return fallbackMessage;
  }

  const responseData = error?.response?.data;

  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData;
  }

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message;
  }

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    const firstError = responseData.errors[0];
    if (typeof firstError === 'string') {
      return firstError;
    }
    if (typeof firstError?.message === 'string' && firstError.message.trim()) {
      return firstError.message;
    }
  }

  if (typeof error.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};
