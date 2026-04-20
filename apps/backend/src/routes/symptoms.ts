import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { Feeling, FIELD_ERRORS, Symptom } from '@emour/core'
import { QueryResult } from 'pg'

export const router = express.Router()

router.post('/', asyncHandler(async(req: Request, res: Response) => {
    const { symptoms, createdAtClient } = req.body

    if (!symptoms) {
        throw ApiError.validation("Validation error", { 
            fields: {
                feelingType: {
                    code: FIELD_ERRORS.REQUIRED,
                },
            }, 
        })
    }
    const result: QueryResult[] = []
    symptoms.array.forEach(async (symptom: any) => {
        const response = await db.query(`
            INSERT INTO symptoms (type, created_at_client)
            VALUES ($1, $2)
            RETURNING
                id,
                type,
                created_at_server   AS "createdAtServer",
                created_at_client   AS "createdAtClient",
                day_part            AS "dayPart"
        `, [symptom, createdAtClient])    
        if (response.rowCount === 0) {
            throw ApiError.internal("Internal server error", { details: "Create symptom record failed" })
        }
        result.push(response.rows[0])
    });
    ApiSuccess.created(res, result)
}))

router.get('/all', asyncHandler(async(req: Request, res: Response) => {
    const result = await db.query(`
        SELECT
            id,
            type,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            day_part            AS "dayPart"
        FROM symptoms
        ORDER BY created_at_server DESC
    `)
    if (result.rowCount === 0) {
        throw ApiError.notFound("Not found", { details: "No symptom records in db" })
    }
    ApiSuccess.ok(res, result.rows)
}))