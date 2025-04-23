import { ContactsCollection } from '../db/models/contact.js';

export const getAllContacts = async ({
  userId,
  page,
  perPage,
  sortBy,
  sortOrder,
  contactType,
  isFavorite,
}) => {
  const query = { userId };

  if (contactType) query.contactType = contactType;
  if (isFavorite !== undefined) query.isFavourite = isFavorite;

  const skip = (page - 1) * perPage;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  const contacts = await ContactsCollection.find(query)
    .skip(skip)
    .limit(perPage)
    .sort(sort);

  return contacts;
};

export const getContactById = async (contactId, userId) => {
  return await ContactsCollection.findOne({ _id: contactId, userId });
};

export const createContact = async (payload) => {
  const contact = await ContactsCollection.create(payload);
  return contact;
};

export const updateContact = async (contactId, data, userId) => {
  return await ContactsCollection.findOneAndUpdate(
    { _id: contactId, userId },
    data,
    { new: true },
  );
};

export const deleteContact = async (contactId, userId) => {
  return await ContactsCollection.findOneAndDelete({ _id: contactId, userId });
};

export const countAllContacts = async ({ userId, contactType, isFavorite }) => {
  const query = { userId };
  if (contactType) query.contactType = contactType;
  if (isFavorite !== undefined) {
    query.isFavourite = isFavorite === 'true' || isFavorite === true;
  }

  return await ContactsCollection.countDocuments(query);
};
