import { describe, expect, it } from "vitest"
import {
  downloadPrivacyResponseSchema,
  releasePrivacyResponseSchema,
  requestPersonalDataSchema,
} from "@rocketrota/shared/privacy"
import { roleHasAdminPermission } from "@rocketrota/shared/admin"
import { assertResponseForRelease } from "../../../../packages/db/src/privacy/review"
import { renderPersonalDataReport } from "./report"
import { privacyFixture } from "./privacy-fixture"

describe("personal data disclosure review", () => {
  it("requires explicit confirmation and rejects client-selected subject IDs", () => {
    expect(
      requestPersonalDataSchema.safeParse({ confirmed: true }).success
    ).toBe(true)
    expect(
      requestPersonalDataSchema.safeParse({
        confirmed: true,
        userId: "another-user",
      }).success
    ).toBe(false)
    expect(
      requestPersonalDataSchema.safeParse({ confirmed: false }).success
    ).toBe(false)
  })
  it("requires all four release checks", () => {
    const checks = {
      id: privacyFixture.requestId,
      revision: 0,
      identityChecked: true,
      workplaceAuthorityChecked: true,
      thirdPartyDataReviewed: true,
      externalSourcesChecked: true,
    }
    expect(releasePrivacyResponseSchema.safeParse(checks).success).toBe(true)
    for (const key of [
      "identityChecked",
      "workplaceAuthorityChecked",
      "thirdPartyDataReviewed",
      "externalSourcesChecked",
    ]) {
      expect(
        releasePrivacyResponseSchema.safeParse({ ...checks, [key]: false })
          .success
      ).toBe(false)
    }
  })
  it("blocks unfinished explanations and nested authentication secrets", () => {
    expect(() => assertResponseForRelease(privacyFixture)).not.toThrow()
    expect(() =>
      assertResponseForRelease({
        ...privacyFixture,
        summary: "REVIEW REQUIRED: finish this",
      })
    ).toThrow("review explanations")
    expect(() =>
      assertResponseForRelease({
        ...privacyFixture,
        sections: [
          {
            title: "Bad section",
            records: [{ metadata: { accessToken: "secret" } }],
          },
        ],
      })
    ).toThrow("credentials")
  })
  it("renders a readable report without interpreting user content as markup", () => {
    const html = renderPersonalDataReport({
      ...privacyFixture,
      summary: '<script>alert("bad")</script>',
      sections: [
        { title: "Notes", records: [{ body: '<img src=x onerror="bad">' }] },
      ],
    })
    expect(html).not.toContain("<script>")
    expect(html).not.toContain("<img")
    expect(html).toContain("&lt;script&gt;")
    expect(html).toContain("Your RocketRota personal data response")
  })
  it("restricts privacy operations to privileged platform administrators", () => {
    expect(roleHasAdminPermission("owner", "privacy.manage")).toBe(true)
    expect(roleHasAdminPermission("developer", "privacy.manage")).toBe(true)
    expect(roleHasAdminPermission("support", "privacy.manage")).toBe(false)
    expect(roleHasAdminPermission("readonly", "privacy.manage")).toBe(false)
  })
  it("accepts only supported download formats and UUID request IDs", () => {
    expect(
      downloadPrivacyResponseSchema.safeParse({
        id: privacyFixture.requestId,
        format: "html",
      }).success
    ).toBe(true)
    expect(
      downloadPrivacyResponseSchema.safeParse({
        id: "../another-request",
        format: "html",
      }).success
    ).toBe(false)
  })
})
