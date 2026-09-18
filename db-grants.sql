-- =============================================================================
-- Database users for Stadilearn. Run as a DBA after schema.sql.
-- Replace every CHANGE_ME with a strong generated password, and put the same
-- values in .env.local. Never commit real passwords.
--
-- On cPanel/DirectAdmin shared hosting, create the users in the control panel
-- and grant privileges there if GRANT is not allowed. The grants below are the
-- exact privileges each account needs.
-- =============================================================================

-- 1. The app: full read/write on the custom database only.
CREATE USER IF NOT EXISTS 'stadilearn_app'@'localhost' IDENTIFIED BY 'CHANGE_ME';
GRANT SELECT, INSERT, UPDATE, DELETE ON stadilearn.* TO 'stadilearn_app'@'localhost';

-- 2. The AI assistant on the custom database: SELECT on non-PII views and the
--    RAG tables only. It cannot read users, sessions, otp_codes, consents,
--    certificates (names), support, notifications, conversations or audit.
CREATE USER IF NOT EXISTS 'stadilearn_ai'@'localhost' IDENTIFIED BY 'CHANGE_ME';
GRANT SELECT ON stadilearn.ai_v_rag_chunks              TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.ai_v_institutions            TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.ai_v_cohorts                 TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.ai_v_cohort_courses          TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.ai_v_cohort_memberships      TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.ai_v_institution_memberships TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.ai_v_certificate_counts      TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.ai_v_user_counts             TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.rag_index_versions           TO 'stadilearn_ai'@'localhost';
GRANT SELECT ON stadilearn.rag_documents                TO 'stadilearn_ai'@'localhost';

-- 3. The AI assistant and the indexer on Moodle: SELECT on course structure,
--    content and completion tables only. No mdl_user, mdl_user_info_data,
--    mdl_sessions, mdl_logstore_*, mdl_message*, forum posts, quiz attempts,
--    question banks, grades or files.
--    Adjust the database name (Moodle's is not 'moodle' on every host) and
--    the table prefix if it is not mdl_.
CREATE USER IF NOT EXISTS 'moodle_ai_ro'@'localhost' IDENTIFIED BY 'CHANGE_ME';
GRANT SELECT ON moodle.mdl_course                    TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_course_categories         TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_course_sections           TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_course_modules            TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_modules                   TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_page                      TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_label                     TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_book                      TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_book_chapters             TO 'moodle_ai_ro'@'localhost';
GRANT SELECT (id, course, name)  ON moodle.mdl_lesson TO 'moodle_ai_ro'@'localhost';           -- column-level: skips the lesson password
GRANT SELECT ON moodle.mdl_lesson_pages              TO 'moodle_ai_ro'@'localhost';
GRANT SELECT (id, enrol, status, courseid) ON moodle.mdl_enrol TO 'moodle_ai_ro'@'localhost'; -- column-level: skips enrolment keys
GRANT SELECT ON moodle.mdl_user_enrolments           TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_cohort_members            TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_course_completions        TO 'moodle_ai_ro'@'localhost';
GRANT SELECT ON moodle.mdl_course_modules_completion TO 'moodle_ai_ro'@'localhost';

FLUSH PRIVILEGES;
