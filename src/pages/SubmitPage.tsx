import { useState } from "react"
import { motion } from "motion/react"
import { Icon } from "@iconify/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { REGIONS } from "@/data/events"

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  organizer: z.string().min(2, "Organizer name is required"),
  description: z.string().min(20, "Please provide a short description"),
  deadline: z.string().min(1, "Deadline is required"),
  region: z.string().min(1, "Region is required"),
  format: z.enum(["online", "in-person", "hybrid"], { message: "Select a format" }),
  source_url: z.string().url("Must be a valid URL"),
  contact_email: z.string().email("Must be a valid email address"),
})

type FormData = z.infer<typeof schema>

export default function SubmitPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  function onSubmit(_data: FormData) {
    // Simulate async review submission
    return new Promise<void>((resolve) => setTimeout(() => { setSubmitted(true); resolve() }, 800))
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="mx-auto max-w-lg px-4 sm:px-6 py-20 text-center"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-[10px] bg-accent mx-auto mb-4">
          <Icon icon="fluent:checkmark-circle-16-filled" width={24} className="text-primary" aria-hidden="true" />
        </div>
        <h1 className="text-[20px] font-bold text-foreground mb-2">Submission received</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Thank you. Our team will review your submission and reach out if we need more information.
          Approved events typically appear within 3–5 business days.
        </p>
      </motion.div>
    )
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-10"
    >
      <h1 className="text-[24px] font-bold text-foreground mb-1">Submit a Hackathon</h1>
      <p className="text-sm text-muted-foreground mb-2">
        Know of a Philippine hackathon or tech competition not listed here? Submit it for review.
      </p>
      <div className="mb-6 flex items-start gap-2 rounded-[8px] bg-muted px-4 py-3">
        <Icon icon="fluent:info-16-regular" width={16} className="text-muted-foreground mt-0.5 shrink-0" aria-hidden="true" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          All submissions are reviewed before appearing publicly. Your contact email is used only for
          verification and will not be published on the site.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="title">Event Title</Label>
          <Input
            id="title"
            placeholder="e.g. UP Diliman CodeSprint 2025"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? "title-error" : undefined}
            {...register("title")}
            className="rounded-[8px]"
          />
          {errors.title && (
            <p id="title-error" role="alert" className="text-xs text-destructive">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Organizer */}
        <div className="space-y-1.5">
          <Label htmlFor="organizer">Organizer Name</Label>
          <Input
            id="organizer"
            placeholder="e.g. Department of Science and Technology"
            aria-invalid={!!errors.organizer}
            aria-describedby={errors.organizer ? "organizer-error" : undefined}
            {...register("organizer")}
            className="rounded-[8px]"
          />
          {errors.organizer && (
            <p id="organizer-error" role="alert" className="text-xs text-destructive">
              {errors.organizer.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">Short Description</Label>
          <Textarea
            id="description"
            placeholder="Brief overview of the event, topics, and who can join..."
            rows={4}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? "description-error" : undefined}
            {...register("description")}
            className="rounded-[8px] resize-none"
          />
          {errors.description && (
            <p id="description-error" role="alert" className="text-xs text-destructive">
              {errors.description.message}
            </p>
          )}
        </div>

        {/* Deadline + Region row */}
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="deadline">Registration Deadline</Label>
            <Input
              id="deadline"
              type="date"
              aria-invalid={!!errors.deadline}
              aria-describedby={errors.deadline ? "deadline-error" : undefined}
              {...register("deadline")}
              className="rounded-[8px]"
            />
            {errors.deadline && (
              <p id="deadline-error" role="alert" className="text-xs text-destructive">
                {errors.deadline.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="region">Region</Label>
            <div className="relative">
              <select
                id="region"
                aria-invalid={!!errors.region}
                aria-describedby={errors.region ? "region-error" : undefined}
                {...register("region")}
                className="w-full h-9 rounded-[8px] border border-input bg-background px-3 pr-8 text-sm appearance-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-foreground"
              >
                <option value="">Select region</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <Icon
                icon="fluent:chevron-down-16-regular"
                width={14}
                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            {errors.region && (
              <p id="region-error" role="alert" className="text-xs text-destructive">
                {errors.region.message}
              </p>
            )}
          </div>
        </div>

        {/* Format */}
        <fieldset>
          <legend className="text-sm font-medium text-foreground mb-2">Event Format</legend>
          <div className="flex flex-wrap gap-2">
            {(["online", "in-person", "hybrid"] as const).map((fmt) => (
              <label
                key={fmt}
                className="flex items-center gap-2 cursor-pointer rounded-[6px] border border-input px-3 py-1.5 text-sm has-[:checked]:border-primary/50 has-[:checked]:bg-accent has-[:checked]:text-accent-foreground transition-colors"
              >
                <input
                  type="radio"
                  value={fmt}
                  {...register("format")}
                  className="sr-only"
                />
                {fmt === "online" ? "Online" : fmt === "in-person" ? "In-Person" : "Hybrid"}
              </label>
            ))}
          </div>
          {errors.format && (
            <p role="alert" className="text-xs text-destructive mt-1">
              {errors.format.message}
            </p>
          )}
        </fieldset>

        {/* Source URL */}
        <div className="space-y-1.5">
          <Label htmlFor="source_url">Source URL</Label>
          <p className="text-xs text-muted-foreground">Link to the original Facebook post or official registration page.</p>
          <Input
            id="source_url"
            type="url"
            placeholder="https://"
            aria-invalid={!!errors.source_url}
            aria-describedby={errors.source_url ? "source_url-error" : undefined}
            {...register("source_url")}
            className="rounded-[8px]"
          />
          {errors.source_url && (
            <p id="source_url-error" role="alert" className="text-xs text-destructive">
              {errors.source_url.message}
            </p>
          )}
        </div>

        {/* Contact email */}
        <div className="space-y-1.5">
          <Label htmlFor="contact_email">Your Contact Email</Label>
          <p className="text-xs text-muted-foreground">For verification only. This will not be published.</p>
          <Input
            id="contact_email"
            type="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.contact_email}
            aria-describedby={errors.contact_email ? "contact_email-error" : undefined}
            {...register("contact_email")}
            className="rounded-[8px]"
          />
          {errors.contact_email && (
            <p id="contact_email-error" role="alert" className="text-xs text-destructive">
              {errors.contact_email.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 rounded-[8px] bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Icon icon="fluent:spinner-ios-20-regular" width={16} className="animate-spin" aria-hidden="true" />
              Submitting...
            </>
          ) : (
            "Submit for Review"
          )}
        </button>
      </form>
    </motion.main>
  )
}
