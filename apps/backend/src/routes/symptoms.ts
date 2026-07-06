import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { FIELD_ERRORS } from '@emour/core'

export const router = express.Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const { symptoms, createdAtClient, clientTimezone } = req.body

    if (!Array.isArray(symptoms) || symptoms.length === 0) {
        throw ApiError.validation("Validation error", {
            fields: { symptoms: { code: FIELD_ERRORS.REQUIRED } },
        })
    }

    const values = symptoms.map((_: string, i: number) =>
        `($${i * 3 + 1}, $${i * 3 + 2}, $${i * 3 + 3})`
    ).join(', ')

    const params: unknown[] = symptoms.flatMap((symptom: string) =>
        [symptom, createdAtClient, clientTimezone]
    )

    const result = await db.query(`
        INSERT INTO symptoms (symptom_type, created_at_client, client_timezone)
        VALUES ${values}
        RETURNING
            id,
            symptom_type        AS "symptomType",
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone",
            day_part            AS "dayPart"
    `, params)

    ApiSuccess.created(res, result.rows.map(row => ({ type: "symptom", ...row })))
}))

router.get('/all', asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT
            id,
            symptom_type        AS "symptomType",
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone",
            day_part            AS "dayPart"
        FROM symptoms
        ORDER BY created_at_server DESC
    `)

    ApiSuccess.ok(res, result.rows.map(row => ({ type: "symptom", ...row })))
}))
