/**
 * Apply certificate request tables/columns to an existing database.
 *   npx tsx --env-file-if-exists=.env --env-file-if-exists=.env.local scripts/apply-certificate-schema.ts
 */
import { appDb, closePools } from "@/lib/db";

async function tryExecute(label: string, sql: string, params: (string | number)[] = []) {
  try {
    await appDb.execute(sql, params);
    console.log(`ok: ${label}`);
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String(err.code) : "";
    if (code === "ER_DUP_FIELDNAME" || code === "ER_TABLE_EXISTS_ERROR") {
      console.log(`skip: ${label} (${code})`);
      return;
    }
    throw err;
  }
}

async function main() {
  await tryExecute(
    "certificates.course_summary",
    "ALTER TABLE certificates ADD COLUMN course_summary VARCHAR(1000) NOT NULL DEFAULT '' AFTER course_title",
  );
  await tryExecute(
    "certificate_requests",
    `CREATE TABLE certificate_requests (
      id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id            BIGINT UNSIGNED NOT NULL,
      moodle_course_id   BIGINT UNSIGNED NOT NULL,
      course_title       VARCHAR(255)    NOT NULL,
      course_summary     VARCHAR(1000)   NOT NULL DEFAULT '',
      status             ENUM('pending','issued','declined') NOT NULL DEFAULT 'pending',
      requested_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
      reviewed_at        DATETIME(3)     NULL,
      reviewed_by        BIGINT UNSIGNED NULL,
      decline_reason     VARCHAR(255)    NULL,
      certificate_id     BIGINT UNSIGNED NULL,
      pending_uniq       VARCHAR(40)     GENERATED ALWAYS AS (IF(status = 'pending', CONCAT(user_id, ':', moodle_course_id), NULL)) STORED,
      PRIMARY KEY (id),
      UNIQUE KEY uq_cert_req_pending (pending_uniq),
      KEY ix_cert_req_status (status, requested_at),
      KEY ix_cert_req_user (user_id, moodle_course_id),
      CONSTRAINT fk_cert_req_user     FOREIGN KEY (user_id)        REFERENCES users (id),
      CONSTRAINT fk_cert_req_reviewer FOREIGN KEY (reviewed_by)    REFERENCES users (id) ON DELETE SET NULL,
      CONSTRAINT fk_cert_req_cert     FOREIGN KEY (certificate_id) REFERENCES certificates (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(closePools);
