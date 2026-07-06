import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { FIELD_ERRORS } from '@emour/core'

export const router = express.Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const { feelingType, score, createdAtClient, clientTimezone } = req.body

    if (!feelingType) {
        throw ApiError.validation("Validation error", {
            fields: { feelingType: { code: FIELD_ERRORS.REQUIRED } },
        })
    }
    if (typeof score !== "number") {
        throw ApiError.validation("Validation error", {
            fields: { score: { code: FIELD_ERRORS.INVALID, message: "score must be a number" } },
        })
    }

    const result = await db.query(`
        INSERT INTO feelings (feeling_type, score, created_at_client, client_timezone)
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            feeling_type        AS "feelingType",
            score,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone",
            day_part            AS "dayPart"
    `, [feelingType, score, createdAtClient, clientTimezone])

    if (result.rowCount === 0) {
        throw ApiError.internal("Internal server error", { details: "Create feeling failed" })
    }

    ApiSuccess.created(res, { type: "feeling", ...result.rows[0] })
}))

router.get('/all', asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT
            id,
            feeling_type        AS "feelingType",
            score,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone",
            day_part            AS "dayPart"
        FROM feelings
        ORDER BY created_at_server DESC
    `)

    ApiSuccess.ok(res, result.rows.map(row => ({ type: "feeling", ...row })))
}))
