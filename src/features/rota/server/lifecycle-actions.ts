import { createServerFn } from "@tanstack/react-start"
import type { PoolClient } from "pg"

import { getDatabase } from "@/lib/db"
import { deleteDraftRotaSchema, unpublishRotaSchema } from "@/lib/rota-schemas"

import { requireRotaWriteAccess } from "@/features/rota/server/write-access"

const unpublishRota = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => unpublishRotaSchema.parse(input))
  .handler(async ({ data }) => {
    const context = await getRotaLifecycleContext(data.rotaId, "publish")

    if (context.rota.status !== "published") {
      throw new Error("Only published rotas can be unpublished.")
    }

    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")
      await deletePublishedSnapshot(client, context.rota.id)
      await client.query(
        `update public.rotas
         set status = 'draft',
             published_snapshot_version = 0,
             has_unpublished_changes = false,
             published_at = null,
             published_by_user_id = null,
             updated_at = $2
         where id = $1`,
        [context.rota.id, new Date().toISOString()]
      )
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }

    return { success: true }
  })

const deleteDraftRota = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => deleteDraftRotaSchema.parse(input))
  .handler(async ({ data }) => {
    const context = await getRotaLifecycleContext(data.rotaId, "update")

    if (context.rota.status !== "draft") {
      throw new Error("Only draft rotas can be deleted.")
    }

    const database = getDatabase()
    const client = await database.connect()

    try {
      await client.query("BEGIN")
      await client.query(
        `delete from public.rota_shift_assignments
         where rota_shift_id in (
           select id from public.rota_shifts where rota_id = $1
         )`,
        [context.rota.id]
      )
      await client.query(`delete from public.rota_shifts where rota_id = $1`, [
        context.rota.id,
      ])
      await deletePublishedSnapshot(client, context.rota.id)
      await client.query(`delete from public.rota_reads where rota_id = $1`, [
        context.rota.id,
      ])
      await client.query(`delete from public.rotas where id = $1`, [context.rota.id])
      await client.query("COMMIT")
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }

    return { success: true }
  })

async function getRotaLifecycleContext(
  rotaId: string,
  permission: "publish" | "update"
) {
  const context = await requireRotaWriteAccess({
    rotaId,
    permission,
    errorMessage:
      permission === "publish"
        ? "You do not have permission to publish rotas."
        : "You do not have permission to update this rota.",
  })

  return {
    organizationId: context.organizationId,
    rota: context.rota,
    userId: context.userId,
  }
}

async function deletePublishedSnapshot(client: PoolClient, rotaId: string) {
  await client.query(
    `delete from public.rota_published_shift_assignments
     where rota_published_shift_id in (
       select id from public.rota_published_shifts where rota_id = $1
     )`,
    [rotaId]
  )
  await client.query(`delete from public.rota_published_shifts where rota_id = $1`, [
    rotaId,
  ])
}

export { deleteDraftRota, unpublishRota }
