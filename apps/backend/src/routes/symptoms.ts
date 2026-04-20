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
    const { symptoms, createdAtClient, clientTimezone } = req.body

    if (!symptoms) {
        throw ApiError.validation("Validation error", { 
            fields: {
                type: {
                    code: FIELD_ERRORS.REQUIRED,
                },
            }, 
        })
    }
    console.log('symptoms: ', symptoms)
    const result = []
    for (const symptom of symptoms) {
        const response = await db.query(`
            INSERT INTO symptoms (symptom_type, created_at_client, client_timezone)
            VALUES ($1, $2, $3)
            RETURNING
                id,
                symptom_type        AS "symptomType",
                created_at_server   AS "createdAtServer",
                created_at_client   AS "createdAtClient",
                client_timezone     AS "clientTimezone",
                day_part            AS "dayPart"
        `, [symptom, createdAtClient, clientTimezone])    
        if (response.rowCount === 0) {
            throw ApiError.internal("Internal server error", { details: "Create symptom record failed" })
        }
        console.log('symptom: ', response.rows[0])
        result.push(response.rows[0])
    }
    
    ApiSuccess.created(res, result.map(row => {return({type: "symptom", ...row})}))
}))

router.get('/all', asyncHandler(async(req: Request, res: Response) => {
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
    if (result.rowCount === 0) {
        throw ApiError.notFound("Not found", { details: "No symptom records in db" })
    }
    ApiSuccess.ok(res, result.rows.map(row => {return({type: "symptom", ...row})}))
}))