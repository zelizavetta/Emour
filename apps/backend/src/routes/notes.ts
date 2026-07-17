import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { FIELD_ERRORS, EMOTIONS } from '@emour/core'

export const router = express.Router()

const VALID_EMOTIONS = EMOTIONS.map(e => e.value)

router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const { text, title, emotion, createdAtClient, clientTimezone } = req.body

    if (!title) throw ApiError.validation("Validation error", { fields: { title: { code: FIELD_ERRORS.REQUIRED } } })
    if (!emotion) throw ApiError.validation("Validation error", { fields: { emotion: { code: FIELD_ERRORS.REQUIRED } } })
    if (!VALID_EMOTIONS.includes(emotion)) throw ApiError.validation("Validation error", { fields: { emotion: { code: FIELD_ERRORS.INVALID } } })
    if (!createdAtClient) throw ApiError.validation("Validation error", { fields: { createdAtClient: { code: FIELD_ERRORS.REQUIRED } } })
    if (!clientTimezone) throw ApiError.validation("Validation error", { fields: { clientTimezone: { code: FIELD_ERRORS.REQUIRED } } })

    const result = await db.query(`
        INSERT INTO notes (text, title, emotion, created_at_client, client_timezone)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
            id,
            'note'              AS "type",
            text,
            title,
            emotion,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
    `, [text ?? '', title, emotion, createdAtClient, clientTimezone])

    if (result.rowCount === 0) {
        throw ApiError.internal("Internal server error", { details: "Create note failed" })
    }

    ApiSuccess.created(res, result.rows[0])
}))

router.get('/all', asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT
            id,
            'note'              AS "type",
            text,
            title,
            emotion,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
        FROM notes
        ORDER BY created_at_client DESC
    `)

    ApiSuccess.ok(res, result.rows)
}))

router.get('/:noteId', asyncHandler(async (req: Request, res: Response) => {
    const { noteId } = req.params

    const result = await db.query(`
        SELECT
            id,
            'note'              AS "type",
            text,
            title,
            emotion,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
        FROM notes WHERE id = $1
    `, [noteId])

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))

router.patch('/:noteId', asyncHandler(async (req: Request, res: Response) => {
    const { noteId } = req.params
    const { text, title, emotion, createdAtClient, clientTimezone } = req.body

    if (!title) throw ApiError.validation("Validation error", { fields: { title: { code: FIELD_ERRORS.REQUIRED } } })
    if (!emotion) throw ApiError.validation("Validation error", { fields: { emotion: { code: FIELD_ERRORS.REQUIRED } } })
    if (!VALID_EMOTIONS.includes(emotion)) throw ApiError.validation("Validation error", { fields: { emotion: { code: FIELD_ERRORS.INVALID } } })
    if (!createdAtClient) throw ApiError.validation("Validation error", { fields: { createdAtClient: { code: FIELD_ERRORS.REQUIRED } } })
    if (!clientTimezone) throw ApiError.validation("Validation error", { fields: { clientTimezone: { code: FIELD_ERRORS.REQUIRED } } })

    const result = await db.query(`
        UPDATE notes
        SET text = $1, title = $2, emotion = $3, created_at_client = $4, client_timezone = $5
        WHERE id = $6
        RETURNING
            id,
            'note'              AS "type",
            text,
            title,
            emotion,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
    `, [text ?? '', title, emotion, createdAtClient, clientTimezone, noteId])

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))

router.delete('/:noteId', asyncHandler(async (req: Request, res: Response) => {
    const { noteId } = req.params

    const result = await db.query(
        `DELETE FROM notes WHERE id = $1 RETURNING id`,
        [noteId]
    )

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))
