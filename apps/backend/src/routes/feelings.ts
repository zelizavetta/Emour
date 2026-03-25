import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { CreateFeelingRecordReq, Feeling } from '@emour/core/dist/types/records'

export const router = express.Router()

router.post('/', asyncHandler(async(req: Request, res: Response) => {
    const { feelingType, score, createdAtClient } = req.body as CreateFeelingRecordReq

    if (!feelingType) {
        throw ApiError.badRequest("VALIDATION_ERROR", "checkType is required");
    }

    if (typeof score !== "number") {
        throw ApiError.badRequest("VALIDATION_ERROR", "score must be a number");
    }

    const result = await db.query<Feeling>(`
        INSERT INTO checks (check_type, score, created_at_client)
        VALUES ($1, $2, $3)
        RETURNING
            id,
            check_type          AS checkType,
            score               AS score,
            created_at_server   AS createdAtServer,
            created_at_client   AS createdAtClient,
            day_part            AS dayPart
    `, [feelingType, score, createdAtClient])

    if (result.rowCount === 0) {
        throw ApiError.internal("INSERT_FAILED", "create check record failed")
    }

    ApiSuccess.created(res, result)
}))

router.get('/', asyncHandler(async(req: Request, res: Response) => {
    const result = await db.query<Feeling[]>(`
        SELECT
            id,
            check_type          AS checkType,
            score               AS score,
            created_at_server   AS createdAtServer,
            created_at_client   AS createdAtClient,
            day_part            AS dayPart
        FROM checks
        ORDER BY created_at_server DESC
    `)
    if (result.rowCount === 0) {
        throw ApiError.notFound("CHECK_RECORDS_NOT_FOUND", "no check records in db")
    }

    ApiSuccess.ok(res, result)
}))