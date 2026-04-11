import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { Feeling, FIELD_ERRORS } from '@emour/core'

export const router = express.Router()

router.post('/', asyncHandler(async(req: Request, res: Response) => {
    const { feelingType, score, createdAtClient } = req.body

    if (!feelingType) {
        throw ApiError.validation("Validation error", { 
            fields: {
                feelingType: {
                    code: FIELD_ERRORS.REQUIRED,
                },
            }, 
        })
    }

    if (typeof score !== "number") {
        throw ApiError.validation("Validation error", { 
            fields: {
                score: {
                    code: FIELD_ERRORS.INVALID,
                    message: "score must be a number"
                },
            }, 
        })
    }

    const result = await db.query<Feeling>(`
        INSERT INTO checks (check_type, score, created_at_client)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            check_type          AS "feelingType",
            score               AS "score",
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            day_part            AS "dayPart"
    `, [feelingType, score, createdAtClient])

    if (result.rowCount === 0) {
        throw ApiError.internal("Internal server error", { details: "Create check record failed" })
    }

    ApiSuccess.created(res, result.rows[0])
}))

router.get('/all', asyncHandler(async(req: Request, res: Response) => {
    const result = await db.query<Feeling[]>(`
        SELECT
            id,
            check_type          AS "feelingType",
            score               AS "score",
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            day_part            AS "dayPart"
        FROM checks
        ORDER BY created_at_server DESC
    `)
    if (result.rowCount === 0) {
        throw ApiError.notFound("Not found", { details: "No check records in db" })
    }

    ApiSuccess.ok(res, result.rows)
}))