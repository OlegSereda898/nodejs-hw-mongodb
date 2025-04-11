export const parseFilterParams = (query) => {
  const { contactType, isFavorite } = query;

  let parsedIsFavorite;
  if (isFavorite === 'true') parsedIsFavorite = true;
  if (isFavorite === 'false') parsedIsFavorite = false;

  return {
    contactType: contactType || undefined,
    isFavorite: parsedIsFavorite,
  };
};
