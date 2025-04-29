import {
  countAllContacts,
  createContact,
  deleteContact,
  getAllContacts,
  getContactById,
} from '../services/contacts.js';
import createHttpError from 'http-errors';
import { parsePaginationParams } from '../utils/parsePaginationParams.js';
import { parseSortParams } from '../utils/parseSortParams.js';
import { parseFilterParams } from '../utils/parseFilterParams.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { saveFileToUploadDir } from '../utils/saveFileToUploadDir.js';
import { ContactsCollection } from '../db/models/contact.js';
import { FEATURE } from '../constants/index.js';

export const getContactsController = async (req, res) => {
  const { page, perPage } = parsePaginationParams(req.query);
  const { sortBy, sortOrder } = parseSortParams(req.query);
  const { contactType, isFavorite } = parseFilterParams(req.query);

  const userId = req.user._id;

  const [contacts, totalItems] = await Promise.all([
    getAllContacts({
      userId,
      page,
      perPage,
      sortBy,
      sortOrder,
      contactType,
      isFavorite,
    }),
    countAllContacts({ userId, contactType, isFavorite }),
  ]);

  const totalPages = Math.ceil(totalItems / perPage);
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: {
      data: contacts,
      page,
      perPage,
      totalItems,
      totalPages,
      hasPreviousPage,
      hasNextPage,
    },
  });
};

export const getContactByIdController = async (req, res, next) => {
  const { contactId } = req.params;
  const contact = await getContactById(contactId, req.user._id);

  if (!contact) {
    throw createHttpError(404, 'Contact not found');
  }

  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};

export const createContactController = async (req, res, next) => {
  const photo = req.file;
  let photoUrl;

  try {
    if (photo) {
      if (getEnvVar('ENABLE_CLOUDINARY') === 'true') {
        photoUrl = await saveFileToCloudinary(photo);
      } else {
        photoUrl = await saveFileToUploadDir(photo);
      }
    }

    const contact = await createContact({
      ...req.body,
      userId: req.user._id,
      photo: photoUrl,
    });

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
  } catch (error) {
    console.error('Error while creating contact:', error);
    next(createHttpError(500, 'Failed to create contact'));
  }
};

export const patchContactController = async (req, res, next) => {
  const { contactId } = req.params;
  const userId = req.user._id;
  const photo = req.file;

  let photoUrl;

  try {
    if (photo) {
      if (getEnvVar(FEATURE.ENABLE_CLOUDINARY) === 'true') {
        photoUrl = await saveFileToCloudinary(photo);
      } else {
        photoUrl = await saveFileToUploadDir(photo);
      }
    }

    const updateData = {
      ...req.body,
      ...(photoUrl && { photo: photoUrl }),
    };

    const result = await ContactsCollection.findOneAndUpdate(
      { _id: contactId, userId },
      updateData,
      { new: true },
    );

    if (!result) {
      return next(createHttpError(404, 'Contact not found'));
    }

    res.status(200).json({
      status: 200,
      message: 'Successfully updated contact!',
      data: result,
    });
  } catch (error) {
    console.error('Error while updating contact:', error.message);
    next(createHttpError(500, 'Failed to update contact'));
  }
};

export const deleteContactController = async (req, res, next) => {
  const { contactId } = req.params;

  const contact = await deleteContact(contactId, req.user._id);

  if (!contact) {
    next(createHttpError(404, 'Contact not found'));
    return;
  }

  res.status(204).send();
};
