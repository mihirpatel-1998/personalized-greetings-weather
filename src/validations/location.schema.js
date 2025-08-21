const { z } = require('zod');
const mongoose = require('mongoose');

const objectId = z
  .string()
  .refine((v) => mongoose.isValidObjectId(v), { message: 'Invalid id' });

const name = z.string().trim().min(2).max(120);
const latitude = z.number().min(-90).max(90);
const longitude = z.number().min(-180).max(180);
const timezone = z.string().trim().min(1).max(120).optional();
const isActive = z.boolean().optional();

const createLocationSchema = z.object({
  body: z.object({
    name,
    latitude,
    longitude,
    timezone,
    isActive
  })
});

const updateLocationSchema = z.object({
  params: z.object({ id: objectId }),
  body: z
    .object({
      name: name.optional(),
      latitude: latitude.optional(),
      longitude: longitude.optional(),
      timezone,
      isActive
    })
    .refine(
      (data) => Object.keys(data).length > 0,
      'At least one field must be provided'
    )
});

const getOrDeleteByIdSchema = z.object({
  params: z.object({ id: objectId })
});

module.exports = {
  createLocationSchema,
  updateLocationSchema,
  getOrDeleteByIdSchema
};
