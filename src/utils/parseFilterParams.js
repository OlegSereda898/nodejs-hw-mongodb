export const parseFilterParams = (query) => {
  const { contactType, isFavorite } = query;

  const parsedIsFavorite =
    isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined;

  return {
    contactType: contactType || undefined,
    isFavorite: parsedIsFavorite,
  };
};
