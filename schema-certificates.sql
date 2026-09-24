-- Apply to an existing Stadilearn database that already ran schema.sql.
-- Safe to skip a statement if it has already been applied.

ALTER TABLE certificates
  ADD COLUMN course_summary VARCHAR(1000) NOT NULL DEFAULT '' AFTER course_title;

CREATE TABLE IF NOT EXISTS certificate_requests (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
