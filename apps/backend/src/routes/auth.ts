import { Router } from "express";
import { db } from "../db";
import { signAccessToken } from "../utils/jwt";
import { AuthRequest, requireAuth } from "../middleware/requireAuth";

const router = Router();

type DeviceAuthBody = {
  installationId?: string;
  platform?: string;
  appVersion?: string;
  deviceModel?: string;
};

router.post("/device", async (req, res) => {
  const { installationId, platform, appVersion, deviceModel } =
    req.body as DeviceAuthBody;

  if (!installationId || typeof installationId !== "string") {
    return res.status(400).json({
      message: "installationId is required",
    });
  }

  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const existingDevice = await client.query(
      `
      SELECT d.user_id
      FROM devices d
      WHERE d.installation_id = $1
      LIMIT 1
      `,
      [installationId]
    );

    let userId: string;

    if (existingDevice.rowCount && existingDevice.rows[0]) {
      userId = existingDevice.rows[0].user_id;

      await client.query(
        `
        UPDATE devices
        SET
          last_seen_at = now(),
          platform = COALESCE($2, platform),
          app_version = COALESCE($3, app_version),
          device_model = COALESCE($4, device_model)
        WHERE installation_id = $1
        `,
        [installationId, platform ?? null, appVersion ?? null, deviceModel ?? null]
      );
    } else {
      const newUser = await client.query(
        `
        INSERT INTO users (is_anonymous)
        VALUES (TRUE)
        RETURNING id
        `
      );

      userId = newUser.rows[0].id;

      await client.query(
        `
        INSERT INTO devices (
          user_id,
          installation_id,
          platform,
          app_version,
          device_model
        )
        VALUES ($1, $2, $3, $4, $5)
        `,
        [
          userId,
          installationId,
          platform ?? null,
          appVersion ?? null,
          deviceModel ?? null,
        ]
      );
    }

    await client.query("COMMIT");

    const accessToken = signAccessToken({ userId });

    return res.json({
      user: {
        id: userId,
        isAnonymous: true,
      },
      accessToken,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("POST /auth/device error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  } finally {
    client.release();
  }
});

router.get("/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const result = await db.query(
      `
      SELECT id, is_anonymous, email, created_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [req.user!.id]
    );

    if (!result.rowCount) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const user = result.rows[0];

    return res.json({
      user: {
        id: user.id,
        isAnonymous: user.is_anonymous,
        email: user.email,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("GET /auth/me error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});

export default router;