import { z } from "zod"

const organizationScopedUserSchema = z.object({
  organizationId: z.string().trim().min(1, "Choose an organization."),
  userId: z.string().trim().min(1, "Choose a user."),
})

const contactEmailSchema = z
  .string()
  .trim()
  .max(160, "Contact email is too long.")
  .refine(
    (value) => value.length === 0 || z.email().safeParse(value).success,
    "Enter a valid contact email."
  )

const contactPhoneSchema = z
  .string()
  .trim()
  .max(40, "Contact phone number is too long.")
  .refine(
    (value) => value.length === 0 || /^[+()\d\s.-]{5,40}$/.test(value),
    "Enter a valid contact phone number."
  )

const getGeneralSettingsInputSchema = organizationScopedUserSchema

const updateGeneralSettingsInputSchema = organizationScopedUserSchema.extend({
  contactEmail: contactEmailSchema,
  contactPhone: contactPhoneSchema,
})

export {
  contactEmailSchema,
  contactPhoneSchema,
  getGeneralSettingsInputSchema,
  updateGeneralSettingsInputSchema,
}
