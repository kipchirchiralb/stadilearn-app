-- =============================================================================
-- Stadilearn custom platform database (stadilearn.co.ke)
-- Target: MariaDB 11.4+ / MySQL 8+  ·  InnoDB  ·  utf8mb4  ·  all times in UTC
--
-- This database is owned by the Next.js app (full read/write).
-- Moodle (elearning.stadilearn.co.ke) has its own database, which this app only
-- ever SELECTs from. Nothing here is written back to Moodle.
--
-- Roles
--   learner            users.account_type; self-signup; joins cohorts by code
--                      or is added by an institution admin
--   teacher            users.account_type; self-signup; added to institutions
--                      and assigned to cohorts
--   institution admin  institution_members.member_role = 'admin': a teacher
--                      nominated by the super admin for one institution, who
--                      manages that institution's cohorts
--   super_admin        users.account_type; exactly one (enforced by a unique index)
--
-- PII classification
--   Tables marked [PII] hold personal data. The AI assistant's database user
--   (see db-grants.sql) cannot read them. It reads only the ai_v_* views and
--   the RAG tables, which carry numeric IDs but no names, emails or contacts.
--
-- Sections
--   1. Reference data     5. RAG index          9.  Notifications
--   2. Identity & auth    6. AI assistant       10. Reports
--   3. Institutions       7. Support            11. Audit
--   4. Moodle sync        8. Certificates       12. AI read-only views + seeds
-- =============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE DATABASE IF NOT EXISTS stadilearn CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE stadilearn;

-- -----------------------------------------------------------------------------
-- 1. Reference data
-- -----------------------------------------------------------------------------

CREATE TABLE counties (
  id    TINYINT UNSIGNED NOT NULL,
  name  VARCHAR(40)      NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_counties_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Operational switches and non-secret provider config (e.g. ai.enabled,
-- ai.provider). API keys and DB passwords never go here; they stay in env.
CREATE TABLE app_settings (
  setting_key  VARCHAR(80)     NOT NULL,
  value        JSON            NOT NULL,
  updated_by   BIGINT UNSIGNED NULL,
  updated_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Identity & authentication
-- -----------------------------------------------------------------------------

-- [PII]
CREATE TABLE users (
  id                     BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email                  VARCHAR(254)     NOT NULL,
  full_name              VARCHAR(120)     NOT NULL,
  account_type           ENUM('learner','teacher','super_admin') NOT NULL DEFAULT 'learner',
  status                 ENUM('pending','active','locked','disabled') NOT NULL DEFAULT 'pending',
  preferred_language     ENUM('en','sw')  NOT NULL DEFAULT 'en',
  county_id              TINYINT UNSIGNED NULL,
  job_title              VARCHAR(120)     NULL,
  -- Optional demographics, collected only with the 'demographics' consent.
  gender                 ENUM('female','male','other','prefer_not') NULL,
  age_band               ENUM('under_18','18_24','25_34','35_44','45_54','55_plus') NULL,
  -- Verified link to the learner's Moodle account (Moodle stays authoritative).
  moodle_user_id         BIGINT UNSIGNED  NULL,
  moodle_linked_at       DATETIME(3)      NULL,
  email_verified_at      DATETIME(3)      NULL,
  last_login_at          DATETIME(3)      NULL,
  created_at             DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at             DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  -- Only one row may be super_admin: NULL for everyone else, 1 for that one.
  super_admin_guard      TINYINT AS (IF(account_type = 'super_admin', 1, NULL)) STORED,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_moodle (moodle_user_id),
  UNIQUE KEY uq_users_single_super_admin (super_admin_guard),
  KEY ix_users_county (county_id),
  CONSTRAINT fk_users_county FOREIGN KEY (county_id) REFERENCES counties (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [PII] Consent is recorded per purpose and version, never overwritten.
CREATE TABLE user_consents (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id         BIGINT UNSIGNED NOT NULL,
  purpose         ENUM('terms','privacy','age_or_guardian','demographics','marketing') NOT NULL,
  policy_version  VARCHAR(20)     NOT NULL,
  granted_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  withdrawn_at    DATETIME(3)     NULL,
  PRIMARY KEY (id),
  KEY ix_consents_user (user_id, purpose),
  CONSTRAINT fk_consents_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [PII] Emailed one-time codes. Only a hash of the code is stored.
CREATE TABLE otp_codes (
  id              BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  email           VARCHAR(254)     NOT NULL,
  user_id         BIGINT UNSIGNED  NULL,
  purpose         ENUM('signup','login','recovery','sensitive_action') NOT NULL,
  code_hash       CHAR(64)         NOT NULL,             -- HMAC-SHA256(code, SESSION_SECRET)
  attempts        TINYINT UNSIGNED NOT NULL DEFAULT 0,
  max_attempts    TINYINT UNSIGNED NOT NULL DEFAULT 5,
  expires_at      DATETIME(3)      NOT NULL,
  consumed_at     DATETIME(3)      NULL,
  request_ip_hash CHAR(64)         NULL,
  created_at      DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_otp_lookup (email, purpose, created_at),
  KEY ix_otp_expiry (expires_at),
  CONSTRAINT fk_otp_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [PII] Server-side sessions. The cookie holds a random token; only its SHA-256 is stored.
CREATE TABLE sessions (
  id                   CHAR(64)        NOT NULL,             -- SHA-256 of the cookie token
  user_id              BIGINT UNSIGNED NOT NULL,
  created_at           DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  last_seen_at         DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  idle_expires_at      DATETIME(3)     NOT NULL,
  absolute_expires_at  DATETIME(3)     NOT NULL,
  revoked_at           DATETIME(3)     NULL,
  ip_hash              CHAR(64)        NULL,
  user_agent           VARCHAR(255)    NULL,
  PRIMARY KEY (id),
  KEY ix_sessions_user (user_id),
  KEY ix_sessions_expiry (absolute_expires_at),
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Institutions, programmes and cohorts
-- -----------------------------------------------------------------------------

CREATE TABLE institutions (
  id                   BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  name                 VARCHAR(160)     NOT NULL,
  type                 ENUM('primary_school','secondary_school','tvet','university','ngo','government','company','other') NOT NULL DEFAULT 'other',
  county_id            TINYINT UNSIGNED NULL,
  status               ENUM('pending','active','suspended') NOT NULL DEFAULT 'pending',
  moodle_category_id   BIGINT UNSIGNED  NULL,                -- optional Moodle course category for this institution
  requested_by         BIGINT UNSIGNED  NULL,                -- user who registered it through signup
  approved_by          BIGINT UNSIGNED  NULL,
  approved_at          DATETIME(3)      NULL,
  created_at           DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at           DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_institutions_name (name),
  KEY ix_institutions_county (county_id),
  CONSTRAINT fk_institutions_county    FOREIGN KEY (county_id)    REFERENCES counties (id),
  CONSTRAINT fk_institutions_requester FOREIGN KEY (requested_by) REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_institutions_approver  FOREIGN KEY (approved_by)  REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Who belongs to an institution, and in what capacity. member_role 'admin' is
-- an institution admin: only the super admin may grant it (checked in the app
-- and audited), and only to users whose account_type is 'teacher'.
CREATE TABLE institution_members (
  institution_id  BIGINT UNSIGNED NOT NULL,
  user_id         BIGINT UNSIGNED NOT NULL,
  member_role     ENUM('learner','teacher','admin') NOT NULL,
  status          ENUM('invited','active','removed') NOT NULL DEFAULT 'active',
  nominated_by    BIGINT UNSIGNED NULL,               -- super admin who granted 'admin'
  nominated_at    DATETIME(3)     NULL,
  joined_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (institution_id, user_id),
  KEY ix_inst_members_user (user_id),
  CONSTRAINT fk_inst_members_inst      FOREIGN KEY (institution_id) REFERENCES institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_inst_members_user      FOREIGN KEY (user_id)        REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_inst_members_nominator FOREIGN KEY (nominated_by)   REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A programme groups courses under one banner (e.g. "Digital & AI Literacy").
-- institution_id NULL means a Stadilearn-wide programme.
CREATE TABLE programmes (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  institution_id  BIGINT UNSIGNED NULL,
  name            VARCHAR(160)    NOT NULL,
  description     TEXT            NULL,
  status          ENUM('draft','active','archived') NOT NULL DEFAULT 'active',
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_programmes_inst (institution_id),
  CONSTRAINT fk_programmes_inst FOREIGN KEY (institution_id) REFERENCES institutions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A cohort is a group of learners taking one or more Moodle courses together,
-- managed by its institution's admins. It may mirror a Moodle cohort.
CREATE TABLE cohorts (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  institution_id    BIGINT UNSIGNED NOT NULL,
  programme_id      BIGINT UNSIGNED NULL,
  name              VARCHAR(160)    NOT NULL,
  moodle_cohort_id  BIGINT UNSIGNED NULL,
  join_code         VARCHAR(16)     NULL,               -- learners self-join with this code
  join_code_expires_at DATETIME(3)  NULL,
  starts_on         DATE            NULL,
  ends_on           DATE            NULL,
  status            ENUM('planned','active','completed','archived') NOT NULL DEFAULT 'planned',
  created_by        BIGINT UNSIGNED NULL,
  created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_cohorts_name (institution_id, name),
  UNIQUE KEY uq_cohorts_moodle (moodle_cohort_id),
  UNIQUE KEY uq_cohorts_join_code (join_code),
  KEY ix_cohorts_programme (programme_id),
  CONSTRAINT fk_cohorts_inst      FOREIGN KEY (institution_id) REFERENCES institutions (id) ON DELETE CASCADE,
  CONSTRAINT fk_cohorts_programme FOREIGN KEY (programme_id)   REFERENCES programmes (id) ON DELETE SET NULL,
  CONSTRAINT fk_cohorts_creator   FOREIGN KEY (created_by)     REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Which Moodle courses a cohort takes.
CREATE TABLE cohort_courses (
  cohort_id         BIGINT UNSIGNED NOT NULL,
  moodle_course_id  BIGINT UNSIGNED NOT NULL,
  added_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (cohort_id, moodle_course_id),
  KEY ix_cohort_courses_course (moodle_course_id),
  CONSTRAINT fk_cohort_courses_cohort FOREIGN KEY (cohort_id) REFERENCES cohorts (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learners in a cohort, and the teachers assigned to it.
CREATE TABLE cohort_members (
  cohort_id    BIGINT UNSIGNED NOT NULL,
  user_id      BIGINT UNSIGNED NOT NULL,
  member_role  ENUM('learner','teacher') NOT NULL,
  added_by     BIGINT UNSIGNED NULL,
  added_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  removed_at   DATETIME(3)     NULL,
  PRIMARY KEY (cohort_id, user_id),
  KEY ix_cohort_members_user (user_id),
  CONSTRAINT fk_cohort_members_cohort FOREIGN KEY (cohort_id) REFERENCES cohorts (id) ON DELETE CASCADE,
  CONSTRAINT fk_cohort_members_user   FOREIGN KEY (user_id)   REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_cohort_members_adder  FOREIGN KEY (added_by)  REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Moodle synchronisation (read-only source)
-- -----------------------------------------------------------------------------

-- Resumable checkpoint per job (e.g. 'rag_index').
CREATE TABLE sync_cursors (
  job_name          VARCHAR(60)     NOT NULL,
  last_modified     BIGINT UNSIGNED NOT NULL DEFAULT 0,   -- Moodle unix timestamp
  last_source_id    BIGINT UNSIGNED NOT NULL DEFAULT 0,
  last_success_at   DATETIME(3)     NULL,
  updated_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (job_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE sync_runs (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  job_name        VARCHAR(60)     NOT NULL,
  status          ENUM('running','succeeded','failed','partial') NOT NULL DEFAULT 'running',
  records_read    INT UNSIGNED    NOT NULL DEFAULT 0,
  records_written INT UNSIGNED    NOT NULL DEFAULT 0,
  records_skipped INT UNSIGNED    NOT NULL DEFAULT 0,
  error_message   TEXT            NULL,
  started_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  finished_at     DATETIME(3)     NULL,
  PRIMARY KEY (id),
  KEY ix_sync_runs_job (job_name, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Stale syncs, duplicate mappings, missing institution data, inconsistent completions.
CREATE TABLE data_quality_issues (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  kind          VARCHAR(60)     NOT NULL,
  entity_type   VARCHAR(40)     NOT NULL,
  entity_id     VARCHAR(64)     NOT NULL,
  details       JSON            NULL,
  status        ENUM('open','resolved','ignored') NOT NULL DEFAULT 'open',
  detected_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  resolved_by   BIGINT UNSIGNED NULL,
  resolved_at   DATETIME(3)     NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dq_issue (kind, entity_type, entity_id),
  KEY ix_dq_status (status, detected_at),
  CONSTRAINT fk_dq_resolver FOREIGN KEY (resolved_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 5. RAG index (approved Moodle content + public site content, no PII)
-- -----------------------------------------------------------------------------

-- One row per embedding model/dimension. Changing the model builds a new
-- version alongside the active one, then switches over.
CREATE TABLE rag_index_versions (
  id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
  embed_model     VARCHAR(80)      NOT NULL,
  dimensions      SMALLINT UNSIGNED NOT NULL,
  status          ENUM('building','active','retired') NOT NULL DEFAULT 'building',
  chunk_count     INT UNSIGNED     NOT NULL DEFAULT 0,
  created_at      DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  activated_at    DATETIME(3)      NULL,
  PRIMARY KEY (id),
  KEY ix_rag_versions_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A source document: a Moodle page, book chapter, lesson content page, label,
-- section or course summary, or a public Stadilearn catalogue entry.
CREATE TABLE rag_documents (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  source_type         ENUM('moodle_course','moodle_section','moodle_page','moodle_label','moodle_book_chapter','moodle_lesson_page','site_course') NOT NULL,
  source_key          VARCHAR(64)     NOT NULL,           -- stable key within the source, e.g. 'page:12'
  moodle_course_id    BIGINT UNSIGNED NULL,
  moodle_cm_id        BIGINT UNSIGNED NULL,               -- course module id, for deep links
  course_title        VARCHAR(255)    NULL,
  section_title       VARCHAR(255)    NULL,
  title               VARCHAR(255)    NOT NULL,
  language            ENUM('en','sw','mixed') NOT NULL DEFAULT 'en',
  source_url          VARCHAR(500)    NOT NULL,
  content_hash        CHAR(64)        NOT NULL,           -- SHA-256 of the cleaned text; unchanged = skip
  source_modified_at  DATETIME(3)     NULL,
  indexed_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  withdrawn_at        DATETIME(3)     NULL,               -- hidden, deleted or unpublished in Moodle
  PRIMARY KEY (id),
  UNIQUE KEY uq_rag_docs_source (source_type, source_key),
  KEY ix_rag_docs_course (moodle_course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chunks with their embeddings. MariaDB 11.4 has no VECTOR type, so the
-- embedding is an L2-normalised float32 little-endian array (dimensions * 4
-- bytes) and similarity is a dot product computed in the app. On MariaDB 11.8+
-- this column can move to VECTOR(n) with a VECTOR INDEX.
CREATE TABLE rag_chunks (
  id                BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  document_id       BIGINT UNSIGNED  NOT NULL,
  index_version_id  INT UNSIGNED     NOT NULL,
  chunk_no          SMALLINT UNSIGNED NOT NULL,
  content           TEXT             NOT NULL,
  token_estimate    SMALLINT UNSIGNED NOT NULL,
  embedding         BLOB             NOT NULL,
  created_at        DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_rag_chunks (index_version_id, document_id, chunk_no),
  KEY ix_rag_chunks_doc (document_id),
  CONSTRAINT fk_rag_chunks_doc     FOREIGN KEY (document_id)      REFERENCES rag_documents (id) ON DELETE CASCADE,
  CONSTRAINT fk_rag_chunks_version FOREIGN KEY (index_version_id) REFERENCES rag_index_versions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 6. AI assistant
-- -----------------------------------------------------------------------------

-- [PII] Conversations may contain whatever the user typed.
CREATE TABLE ai_conversations (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id           BIGINT UNSIGNED NOT NULL,
  assistant         ENUM('tutor','support','trainer') NOT NULL,
  moodle_course_id  BIGINT UNSIGNED NULL,               -- tutor scope, if a course was chosen
  title             VARCHAR(160)    NOT NULL,
  created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  archived_at       DATETIME(3)     NULL,
  PRIMARY KEY (id),
  KEY ix_ai_conv_user (user_id, updated_at),
  CONSTRAINT fk_ai_conv_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [PII]
CREATE TABLE ai_messages (
  id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  conversation_id   BIGINT UNSIGNED NOT NULL,
  role              ENUM('user','assistant') NOT NULL,
  content           MEDIUMTEXT      NOT NULL,
  -- Assistant-only metadata, needed for review of flagged answers.
  provider          VARCHAR(40)     NULL,
  model             VARCHAR(80)     NULL,
  prompt_version    VARCHAR(40)     NULL,
  index_version_id  INT UNSIGNED    NULL,
  tools_used        JSON            NULL,                -- names + arguments of safe tools called
  grounded          TINYINT(1)      NULL,                -- 0 = no course material or data tool behind the answer
  created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_ai_msg_conv (conversation_id, id),
  CONSTRAINT fk_ai_msg_conv FOREIGN KEY (conversation_id) REFERENCES ai_conversations (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sources shown under an answer.
CREATE TABLE ai_message_citations (
  message_id   BIGINT UNSIGNED  NOT NULL,
  rank_no      TINYINT UNSIGNED NOT NULL,
  chunk_id     BIGINT UNSIGNED  NULL,
  document_id  BIGINT UNSIGNED  NOT NULL,
  score        FLOAT            NOT NULL,
  PRIMARY KEY (message_id, rank_no),
  KEY ix_ai_cite_doc (document_id),
  CONSTRAINT fk_ai_cite_msg   FOREIGN KEY (message_id)  REFERENCES ai_messages (id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_cite_chunk FOREIGN KEY (chunk_id)    REFERENCES rag_chunks (id) ON DELETE SET NULL,
  CONSTRAINT fk_ai_cite_doc   FOREIGN KEY (document_id) REFERENCES rag_documents (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Learner flags on poor or unsafe answers -> review queue.
CREATE TABLE ai_flags (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  message_id      BIGINT UNSIGNED NOT NULL,
  flagged_by      BIGINT UNSIGNED NOT NULL,
  reason          ENUM('incorrect','unsafe','unhelpful','assessment_help','other') NOT NULL,
  comment         VARCHAR(1000)   NULL,
  status          ENUM('open','reviewing','resolved','dismissed') NOT NULL DEFAULT 'open',
  reviewed_by     BIGINT UNSIGNED NULL,
  reviewed_at     DATETIME(3)     NULL,
  resolution_note VARCHAR(1000)   NULL,
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_ai_flags_once (message_id, flagged_by),
  KEY ix_ai_flags_status (status, created_at),
  CONSTRAINT fk_ai_flags_msg      FOREIGN KEY (message_id)  REFERENCES ai_messages (id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_flags_user     FOREIGN KEY (flagged_by)  REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_flags_reviewer FOREIGN KEY (reviewed_by) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Daily limits. scope_ref: '' for global, a role code ('learner','teacher',
-- 'institution_admin','super_admin'), or an institution/user id as text.
-- The most specific matching row wins: user > institution > role > global.
CREATE TABLE ai_quotas (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  scope           ENUM('global','role','institution','user') NOT NULL,
  scope_ref       VARCHAR(40)     NOT NULL DEFAULT '',
  daily_requests  INT UNSIGNED    NOT NULL,
  daily_tokens    INT UNSIGNED    NULL,
  enabled         TINYINT(1)      NOT NULL DEFAULT 1,
  updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  UNIQUE KEY uq_ai_quotas_scope (scope, scope_ref)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Every provider call: requests, tokens, cost, latency, failures, quota blocks.
CREATE TABLE ai_usage_ledger (
  id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id          BIGINT UNSIGNED NULL,                 -- NULL for background indexing
  institution_id   BIGINT UNSIGNED NULL,
  assistant        ENUM('tutor','support','trainer','indexer') NOT NULL,
  operation        ENUM('chat','embed') NOT NULL,
  provider         VARCHAR(40)     NOT NULL,
  model            VARCHAR(80)     NOT NULL,
  input_tokens     INT UNSIGNED    NOT NULL DEFAULT 0,
  output_tokens    INT UNSIGNED    NOT NULL DEFAULT 0,
  est_cost_usd     DECIMAL(12,6)   NOT NULL DEFAULT 0,
  latency_ms       INT UNSIGNED    NOT NULL DEFAULT 0,
  outcome          ENUM('ok','error','quota_blocked','disabled') NOT NULL,
  error_code       VARCHAR(60)     NULL,
  created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_ai_usage_user_day (user_id, created_at),
  KEY ix_ai_usage_inst_day (institution_id, created_at),
  KEY ix_ai_usage_day (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 7. Support
-- -----------------------------------------------------------------------------

-- [PII]
CREATE TABLE support_tickets (
  id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id             BIGINT UNSIGNED NULL,              -- NULL for public contact-form messages
  contact_name        VARCHAR(120)    NULL,
  contact_email       VARCHAR(254)    NULL,
  source              ENUM('contact_form','ai_escalation','dashboard') NOT NULL,
  ai_conversation_id  BIGINT UNSIGNED NULL,
  subject             VARCHAR(200)    NOT NULL,
  category            ENUM('account','enrolment','course','certificate','ai','institution','other') NOT NULL DEFAULT 'other',
  status              ENUM('open','assigned','waiting_on_user','resolved','closed') NOT NULL DEFAULT 'open',
  assigned_to         BIGINT UNSIGNED NULL,
  created_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updated_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  resolved_at         DATETIME(3)     NULL,
  PRIMARY KEY (id),
  KEY ix_tickets_status (status, created_at),
  KEY ix_tickets_user (user_id),
  CONSTRAINT fk_tickets_user     FOREIGN KEY (user_id)            REFERENCES users (id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_conv     FOREIGN KEY (ai_conversation_id) REFERENCES ai_conversations (id) ON DELETE SET NULL,
  CONSTRAINT fk_tickets_assignee FOREIGN KEY (assigned_to)        REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [PII]
CREATE TABLE support_messages (
  id           BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  ticket_id    BIGINT UNSIGNED NOT NULL,
  author_id    BIGINT UNSIGNED NULL,                    -- NULL = the (anonymous) requester
  body         TEXT            NOT NULL,
  is_internal  TINYINT(1)      NOT NULL DEFAULT 0,     -- staff-only note
  created_at   DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_support_msgs_ticket (ticket_id, id),
  CONSTRAINT fk_support_msgs_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets (id) ON DELETE CASCADE,
  CONSTRAINT fk_support_msgs_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 8. Certificates
-- -----------------------------------------------------------------------------

-- [PII] display_name is a snapshot so the certificate stays stable if the
-- profile changes. Public verification exposes only name, course, date, status.
CREATE TABLE certificates (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  verification_code  VARCHAR(40)     NOT NULL,           -- non-guessable, e.g. SL-7F3K-Q9XA-2M
  user_id            BIGINT UNSIGNED NOT NULL,
  moodle_course_id   BIGINT UNSIGNED NOT NULL,
  course_title       VARCHAR(255)    NOT NULL,
  programme_id       BIGINT UNSIGNED NULL,
  cohort_id          BIGINT UNSIGNED NULL,
  display_name       VARCHAR(120)    NOT NULL,
  completed_on       DATE            NOT NULL,
  status             ENUM('valid','revoked') NOT NULL DEFAULT 'valid',
  issued_by          BIGINT UNSIGNED NULL,               -- NULL = issued automatically
  issued_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  revoked_at         DATETIME(3)     NULL,
  revoke_reason      VARCHAR(255)    NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_cert_code (verification_code),
  UNIQUE KEY uq_cert_user_course (user_id, moodle_course_id),
  KEY ix_cert_cohort (cohort_id),
  CONSTRAINT fk_cert_user      FOREIGN KEY (user_id)      REFERENCES users (id),
  CONSTRAINT fk_cert_programme FOREIGN KEY (programme_id) REFERENCES programmes (id) ON DELETE SET NULL,
  CONSTRAINT fk_cert_cohort    FOREIGN KEY (cohort_id)    REFERENCES cohorts (id) ON DELETE SET NULL,
  CONSTRAINT fk_cert_issuer    FOREIGN KEY (issued_by)    REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE certificate_events (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  certificate_id  BIGINT UNSIGNED NOT NULL,
  action          ENUM('issued','corrected','revoked','reinstated') NOT NULL,
  actor_id        BIGINT UNSIGNED NULL,
  note            VARCHAR(500)    NULL,
  created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (id),
  KEY ix_cert_events_cert (certificate_id),
  CONSTRAINT fk_cert_events_cert  FOREIGN KEY (certificate_id) REFERENCES certificates (id) ON DELETE CASCADE,
  CONSTRAINT fk_cert_events_actor FOREIGN KEY (actor_id)       REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 9. Notifications (email now; channel column leaves room for SMS)
-- -----------------------------------------------------------------------------

CREATE TABLE notification_templates (
  code        VARCHAR(60)  NOT NULL,                   -- e.g. 'otp_login', 'certificate_issued'
  channel     ENUM('email','sms') NOT NULL DEFAULT 'email',
  language    ENUM('en','sw') NOT NULL DEFAULT 'en',
  subject     VARCHAR(200) NULL,
  body        TEXT         NOT NULL,                   -- {{placeholders}}
  updated_by  BIGINT UNSIGNED NULL,
  updated_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (code, channel, language)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- [PII] Queued, retried, deduplicated delivery. OTP values never go in payload;
-- the sender renders them at send time.
CREATE TABLE notification_jobs (
  id                   BIGINT UNSIGNED  NOT NULL AUTO_INCREMENT,
  user_id              BIGINT UNSIGNED  NULL,
  channel              ENUM('email','sms') NOT NULL DEFAULT 'email',
  recipient            VARCHAR(254)     NOT NULL,
  template_code        VARCHAR(60)      NOT NULL,
  payload              JSON             NULL,
  dedupe_key           VARCHAR(120)     NULL,
  status               ENUM('queued','sending','sent','failed','cancelled') NOT NULL DEFAULT 'queued',
  attempts             TINYINT UNSIGNED NOT NULL DEFAULT 0,
  next_attempt_at      DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  provider_message_id  VARCHAR(200)     NULL,
  last_error           VARCHAR(500)     NULL,
  created_at           DATETIME(3)      NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  sent_at              DATETIME(3)      NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_notif_dedupe (dedupe_key),
  KEY ix_notif_queue (status, next_attempt_at),
  KEY ix_notif_user (user_id),
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notification_preferences (
  user_id        BIGINT UNSIGNED NOT NULL,
  category       ENUM('reminders','certificates','support','announcements') NOT NULL,
  email_enabled  TINYINT(1)      NOT NULL DEFAULT 1,
  PRIMARY KEY (user_id, category),
  CONSTRAINT fk_notif_prefs_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 10. Reports (definitions live in code; runs and exports live here)
-- -----------------------------------------------------------------------------

CREATE TABLE report_runs (
  id                 BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  report_type        VARCHAR(60)     NOT NULL,           -- e.g. 'cohort_completion'
  requested_by       BIGINT UNSIGNED NOT NULL,
  institution_id     BIGINT UNSIGNED NULL,               -- scope checked on the server
  filters            JSON            NOT NULL,
  format             ENUM('csv','pdf') NOT NULL,
  status             ENUM('queued','running','ready','failed','expired') NOT NULL DEFAULT 'queued',
  file_path          VARCHAR(500)    NULL,
  row_count          INT UNSIGNED    NULL,
  data_freshness_at  DATETIME(3)     NULL,               -- oldest Moodle read behind the report
  error_message      VARCHAR(500)    NULL,
  created_at         DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  completed_at       DATETIME(3)     NULL,
  expires_at         DATETIME(3)     NULL,
  PRIMARY KEY (id),
  KEY ix_report_runs_user (requested_by, created_at),
  KEY ix_report_runs_expiry (status, expires_at),
  CONSTRAINT fk_report_runs_user FOREIGN KEY (requested_by)   REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_report_runs_inst FOREIGN KEY (institution_id) REFERENCES institutions (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 11. Audit (append-only, enforced by triggers)
-- -----------------------------------------------------------------------------

CREATE TABLE audit_events (
  id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  occurred_at     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  actor_id        BIGINT UNSIGNED NULL,                  -- NULL = system
  action          VARCHAR(64)     NOT NULL,              -- e.g. 'auth.login', 'institution.admin_nominated'
  entity_type     VARCHAR(40)     NULL,
  entity_id       VARCHAR(64)     NULL,
  institution_id  BIGINT UNSIGNED NULL,
  ip_hash         CHAR(64)        NULL,
  details         JSON            NULL,
  PRIMARY KEY (id),
  KEY ix_audit_actor (actor_id, occurred_at),
  KEY ix_audit_entity (entity_type, entity_id),
  KEY ix_audit_action (action, occurred_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER //
CREATE TRIGGER trg_audit_no_update BEFORE UPDATE ON audit_events FOR EACH ROW
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'audit_events is append-only';
//
CREATE TRIGGER trg_audit_no_delete BEFORE DELETE ON audit_events FOR EACH ROW
  SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'audit_events is append-only';
//
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 12a. AI read-only views: no names, emails, phones or free text from people.
--      The AI database user is granted SELECT on these (plus rag_* tables)
--      and nothing else. See db-grants.sql.
-- -----------------------------------------------------------------------------

-- Active, non-withdrawn chunks with citation metadata.
CREATE OR REPLACE VIEW ai_v_rag_chunks AS
SELECT c.id AS chunk_id, c.index_version_id, c.content, c.embedding,
       d.id AS document_id, d.source_type, d.moodle_course_id, d.course_title,
       d.section_title, d.title, d.language, d.source_url
FROM rag_chunks c
JOIN rag_documents d      ON d.id = c.document_id AND d.withdrawn_at IS NULL
JOIN rag_index_versions v ON v.id = c.index_version_id AND v.status = 'active';

CREATE OR REPLACE VIEW ai_v_institutions AS
SELECT i.id AS institution_id, i.name, i.type, co.name AS county, i.status
FROM institutions i LEFT JOIN counties co ON co.id = i.county_id;

CREATE OR REPLACE VIEW ai_v_cohorts AS
SELECT ch.id AS cohort_id, ch.institution_id, ch.name, ch.moodle_cohort_id,
       ch.status, ch.starts_on, ch.ends_on, p.name AS programme
FROM cohorts ch LEFT JOIN programmes p ON p.id = ch.programme_id;

CREATE OR REPLACE VIEW ai_v_cohort_courses AS
SELECT cohort_id, moodle_course_id FROM cohort_courses;

-- Memberships by numeric ID only; used to scope what a user may ask about and
-- to aggregate Moodle progress for a cohort. No names or emails.
CREATE OR REPLACE VIEW ai_v_cohort_memberships AS
SELECT m.cohort_id, m.user_id, m.member_role, u.moodle_user_id
FROM cohort_members m JOIN users u ON u.id = m.user_id
WHERE m.removed_at IS NULL AND u.status = 'active';

CREATE OR REPLACE VIEW ai_v_institution_memberships AS
SELECT institution_id, user_id, member_role FROM institution_members WHERE status = 'active';

-- Aggregated account counts (no individual rows).
CREATE OR REPLACE VIEW ai_v_user_counts AS
SELECT account_type, status, COUNT(*) AS users FROM users GROUP BY account_type, status;

-- Aggregated certificate counts (no names).
CREATE OR REPLACE VIEW ai_v_certificate_counts AS
SELECT moodle_course_id, cohort_id, COUNT(*) AS issued
FROM certificates WHERE status = 'valid'
GROUP BY moodle_course_id, cohort_id;

-- -----------------------------------------------------------------------------
-- 12b. Seed data
-- -----------------------------------------------------------------------------

INSERT INTO counties (id, name) VALUES
 (1,'Mombasa'),(2,'Kwale'),(3,'Kilifi'),(4,'Tana River'),(5,'Lamu'),(6,'Taita-Taveta'),(7,'Garissa'),
 (8,'Wajir'),(9,'Mandera'),(10,'Marsabit'),(11,'Isiolo'),(12,'Meru'),(13,'Tharaka-Nithi'),(14,'Embu'),
 (15,'Kitui'),(16,'Machakos'),(17,'Makueni'),(18,'Nyandarua'),(19,'Nyeri'),(20,'Kirinyaga'),
 (21,'Murang''a'),(22,'Kiambu'),(23,'Turkana'),(24,'West Pokot'),(25,'Samburu'),(26,'Trans Nzoia'),
 (27,'Uasin Gishu'),(28,'Elgeyo-Marakwet'),(29,'Nandi'),(30,'Baringo'),(31,'Laikipia'),(32,'Nakuru'),
 (33,'Narok'),(34,'Kajiado'),(35,'Kericho'),(36,'Bomet'),(37,'Kakamega'),(38,'Vihiga'),(39,'Bungoma'),
 (40,'Busia'),(41,'Siaya'),(42,'Kisumu'),(43,'Homa Bay'),(44,'Migori'),(45,'Kisii'),(46,'Nyamira'),
 (47,'Nairobi');

INSERT INTO app_settings (setting_key, value) VALUES
 ('ai.enabled',          'true'),
 ('ai.tutor.top_k',      '6'),
 ('ai.tutor.min_score',  '0.55');

-- Free-tier friendly defaults; adjust from the admin console.
INSERT INTO ai_quotas (scope, scope_ref, daily_requests, daily_tokens) VALUES
 ('global', '',                  5000, 5000000),
 ('role',   'learner',             30,   60000),
 ('role',   'teacher',             60,  150000),
 ('role',   'institution_admin',   80,  200000),
 ('role',   'super_admin',        200,  500000);

INSERT INTO notification_templates (code, language, subject, body) VALUES
 ('otp_code',           'en', 'Your Stadilearn code', 'Your Stadilearn code is {{code}}. It expires in {{minutes}} minutes. If you did not request it, ignore this email.'),
 ('otp_code',           'sw', 'Nambari yako ya Stadilearn', 'Nambari yako ya Stadilearn ni {{code}}. Itaisha baada ya dakika {{minutes}}. Kama hukuiomba, puuza barua pepe hii.'),
 ('certificate_issued', 'en', 'Your certificate is ready', 'Congratulations {{name}}! Your certificate for {{course}} is ready. Verify it at {{verify_url}}.'),
 ('support_update',     'en', 'Update on your support request', 'There is an update on your request "{{subject}}". Sign in to Stadilearn to read it.');
