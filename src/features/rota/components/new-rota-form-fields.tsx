import { CalendarDaysIcon, CircleCheckIcon, MapPinIcon } from "lucide-react"
import { DialogSelectRow, TemplateSelect } from "./new-rota-dialog-fields"
import { NewRotaSourcePicker } from "./new-rota-source-picker"
import type { NewRotaForm } from "../hooks/use-new-rota-form"
import { getFieldError } from "@/lib/forms"
import { createRotaDialogSchema } from "@/lib/rota-schemas"
import { createZodFieldValidator } from "@/lib/validation"

function NewRotaFormFields({ model }: { model: NewRotaForm }) {
  const {
    form,
    locationOptions,
    weekSelectOptions,
    hasExistingRota,
    preview,
    isPreviewPending,
    sourceType,
    availableTemplates,
  } = model
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-2 [&>div:first-child]:order-2 sm:[&>div:first-child]:order-1 [&>div:nth-child(2)]:order-1 sm:[&>div:nth-child(2)]:order-2">
        <form.Field
          name="locationId"
          validators={{
            onSubmit: createZodFieldValidator(
              createRotaDialogSchema.shape.locationId
            ),
          }}
        >
          {(field) => (
            <DialogSelectRow
              id={field.name}
              icon={MapPinIcon}
              iconTone="green"
              label="Location"
              value={field.state.value}
              options={locationOptions}
              error={getFieldError(field)}
              onBlur={field.handleBlur}
              onChange={(value) => {
                field.handleChange(value)
                form.setFieldValue("templateId", "")
              }}
            />
          )}
        </form.Field>

        <form.Field
          name="weekStart"
          validators={{
            onSubmit: createZodFieldValidator(
              createRotaDialogSchema.shape.weekStart
            ),
          }}
        >
          {(field) => (
            <DialogSelectRow
              id={field.name}
              icon={CalendarDaysIcon}
              iconTone="blue"
              label="Week"
              value={field.state.value}
              options={weekSelectOptions}
              error={getFieldError(field)}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      </div>
      {hasExistingRota ? (
        <ExistingRotaNotice />
      ) : (
        <form.Field
          name="sourceType"
          validators={{
            onSubmit: createZodFieldValidator(
              createRotaDialogSchema.shape.sourceType
            ),
          }}
        >
          {(field) => (
            <NewRotaSourcePicker
              value={field.state.value}
              onChange={field.handleChange}
              preview={preview}
              isPreviewPending={isPreviewPending}
              error={getFieldError(field)}
            />
          )}
        </form.Field>
      )}
      {!hasExistingRota && sourceType === "template" ? (
        <form.Field
          name="templateId"
          validators={{
            onSubmit: createZodFieldValidator(
              createRotaDialogSchema.shape.templateId.unwrap()
            ),
          }}
        >
          {(field) => (
            <TemplateSelect
              value={field.state.value}
              templates={availableTemplates}
              error={getFieldError(field)}
              onBlur={field.handleBlur}
              onChange={field.handleChange}
            />
          )}
        </form.Field>
      ) : null}
    </>
  )
}

function ExistingRotaNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-[12px] border border-[#c8d5f7] bg-[#f3f7ff] px-3 py-2.5 text-[#11245a]">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white text-[#0069ff] shadow-[0_4px_12px_rgba(30,50,96,0.06)]">
        <CircleCheckIcon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold">A rota already exists for this week</p>
        <p className="mt-1 text-xs leading-5 font-medium text-[#6c7898]">
          Opening it keeps one rota per location and week.
        </p>
      </div>
    </div>
  )
}

export { NewRotaFormFields }
