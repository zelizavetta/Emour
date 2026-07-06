import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { FIELD_ERRORS } from '@emour/core'

export const router = express.Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const { name, dosage, times, createdAtClient, clientTimezone } = req.body

    if (!name) {
        throw ApiError.validation("Validation error", {
            fields: { name: { code: FIELD_ERRORS.REQUIRED } },
        })
    }
    if (!Array.isArray(times) || times.length === 0) {
        throw ApiError.validation("Validation error", {
            fields: { times: { code: FIELD_ERRORS.REQUIRED } },
        })
    }

    const result = await db.query(`
        INSERT INTO meds (name, dosage, times, enabled, created_at_client, client_timezone)
        VALUES ($1, $2, $3::jsonb, true, $4, $5)
        RETURNING
            id,
            'med'               AS "type",
            name,
            dosage,
            times,
            enabled,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
    `, [name, dosage ?? '', JSON.stringify(times), createdAtClient, clientTimezone])

    if (result.rowCount === 0) {
        throw ApiError.internal("Internal server error", { details: "Create med failed" })
    }

    ApiSuccess.created(res, result.rows[0])
}))

router.get('/all', asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT
            id,
            'med'               AS "type",
            name,
            dosage,
            times,
            enabled,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
        FROM meds
        ORDER BY created_at_server DESC
    `)

    ApiSuccess.ok(res, result.rows)
}))

router.patch('/:medId/enabled', asyncHandler(async (req: Request, res: Response) => {
    const { medId } = req.params
    const { enabled } = req.body

    if (typeof enabled !== 'boolean') {
        throw ApiError.validation("Validation error", {
            fields: { enabled: { code: FIELD_ERRORS.INVALID, message: "enabled must be a boolean" } },
        })
    }

    const result = await db.query(
        `UPDATE meds SET enabled = $1 WHERE id = $2 RETURNING id`,
        [enabled, medId]
    )

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))

router.delete('/:medId', asyncHandler(async (req: Request, res: Response) => {
    const { medId } = req.params

    const result = await db.query(
        `DELETE FROM meds WHERE id = $1 RETURNING id`,
        [medId]
    )

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))
