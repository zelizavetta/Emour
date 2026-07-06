import express from 'express'
import { db } from '../db'
import { Request, Response } from 'express'
import { ApiError } from '../errors/ApiError'
import { asyncHandler } from '../asyncHandler'
import { ApiSuccess } from '../success/ApiSuccess'
import { FIELD_ERRORS } from '@emour/core'

export const router = express.Router()

router.post('/', asyncHandler(async (req: Request, res: Response) => {
    const { text, title, createdAtClient, clientTimezone } = req.body

    if (!text) throw ApiError.validation("Validation error", { fields: { text: { code: FIELD_ERRORS.REQUIRED } } })
    if (!title) throw ApiError.validation("Validation error", { fields: { title: { code: FIELD_ERRORS.REQUIRED } } })
    if (!createdAtClient) throw ApiError.validation("Validation error", { fields: { createdAtClient: { code: FIELD_ERRORS.REQUIRED } } })
    if (!clientTimezone) throw ApiError.validation("Validation error", { fields: { clientTimezone: { code: FIELD_ERRORS.REQUIRED } } })

    const result = await db.query(`
        INSERT INTO notes (text, title, created_at_client, client_timezone)
        VALUES ($1, $2, $3, $4)
        RETURNING
            id,
            text,
            title,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
    `, [text, title, createdAtClient, clientTimezone])

    if (result.rowCount === 0) {
        throw ApiError.internal("Internal server error", { details: "Create note failed" })
    }

    ApiSuccess.created(res, result.rows[0])
}))

router.patch('/title/:noteId', asyncHandler(async (req: Request, res: Response) => {
    const { title } = req.body
    const { noteId } = req.params

    if (!title) throw ApiError.validation("Validation error", { fields: { title: { code: FIELD_ERRORS.REQUIRED } } })

    const result = await db.query(
        `UPDATE notes SET title = $1 WHERE id = $2 RETURNING id`,
        [title, noteId]
    )

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))

router.patch('/text/:noteId', asyncHandler(async (req: Request, res: Response) => {
    const { text } = req.body
    const { noteId } = req.params

    if (!text) throw ApiError.validation("Validation error", { fields: { text: { code: FIELD_ERRORS.REQUIRED } } })

    const result = await db.query(
        `UPDATE notes SET text = $1 WHERE id = $2 RETURNING id`,
        [text, noteId]
    )

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))

router.get('/all', asyncHandler(async (_req: Request, res: Response) => {
    const result = await db.query(`
        SELECT
            id,
            text,
            title,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
        FROM notes
        ORDER BY created_at_server DESC
    `)

    ApiSuccess.ok(res, result.rows)
}))

router.get('/:noteId', asyncHandler(async (req: Request, res: Response) => {
    const { noteId } = req.params

    const result = await db.query(`
        SELECT id, text, title,
            created_at_server   AS "createdAtServer",
            created_at_client   AS "createdAtClient",
            client_timezone     AS "clientTimezone"
        FROM notes WHERE id = $1
    `, [noteId])

    if (result.rowCount === 0) throw ApiError.notFound("Not found")

    ApiSuccess.ok(res, result.rows[0])
}))
