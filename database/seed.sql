-- =====================================
-- TASKFLOW INITIAL SEED DATA
-- =====================================

-- 1. SEED DEFAULT USERS (Alex & Admin)
-- Passwords:
-- alex.morgan@taskflow.dev: taskflow2026
-- admin@taskflow.dev: admin123
INSERT INTO users (id, name, full_name, email, password_hash, role, title, department, status, avatar, created_at)
VALUES 
    (1, 'Alex', 'Alex Morgan', 'alex.morgan@taskflow.dev', '$2a$10$EtZoUJ7wovP5ETuXgmKkde3ZnGRKO6X4safpTYkE5yEnOe9DQ9PM6', 'user', 'Frontend Developer', 'Engineering', 'Active', 'A', '2026-01-15 00:00:00'),
    (2, 'Admin', 'TaskFlow Administrator', 'admin@taskflow.dev', '$2a$10$BXNIKSuYzDnd3M6UsHXcoeR3fqQ7v2EUgD64ZGWHAId5Dps7noPsm', 'admin', 'System Administrator', 'Operations', 'Active', 'AD', '2025-10-01 00:00:00')
ON CONFLICT (email) DO NOTHING;

-- Synchronize users sequence
SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- 2. SEED DEFAULT CATEGORIES FOR ALEX (user_id = 1)
INSERT INTO categories (id, user_id, name, created_at)
VALUES 
    (1, 1, 'Work', CURRENT_TIMESTAMP),
    (2, 1, 'Study', CURRENT_TIMESTAMP),
    (3, 1, 'Personal', CURRENT_TIMESTAMP),
    (4, 1, 'Other', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Synchronize categories sequence
SELECT setval('categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM categories));

-- 3. SEED INITIAL TASKS FOR ALEX (user_id = 1)
INSERT INTO tasks (id, user_id, category_id, title, description, status, priority, due_date, created_at, updated_at)
VALUES 
    (1, 1, 1, 'Finish project report', 'Compile quarterly performance metrics, frontend benchmarks, and deliverables summary.', 'In Progress', 'High', '2026-11-18', '2026-11-16 09:00:00', CURRENT_TIMESTAMP),
    (2, 1, 2, 'Study Angular 20 & signals architecture', 'Review standalone component tree, signal stores, reactive forms, and routing guards.', 'Completed', 'Medium', '2026-11-18', '2026-11-15 11:30:00', CURRENT_TIMESTAMP),
    (3, 1, 3, 'Go for a 30-minute evening walk', 'Refresh and take a break around the community park after the afternoon sprint.', 'Pending', 'Low', '2026-11-19', '2026-11-17 14:20:00', CURRENT_TIMESTAMP),
    (4, 1, 3, 'Read Chapter 4 of Atomic Habits', 'Focus on habit stacking and environmental cues for high productivity.', 'Pending', 'Low', '2026-11-14', '2026-11-10 10:00:00', CURRENT_TIMESTAMP),
    (5, 1, 1, 'Plan sprint deliverables', 'Map out roadmap milestones, team priorities, and ticket estimates.', 'Pending', 'Medium', '2026-11-20', '2026-11-17 16:45:00', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Synchronize tasks sequence
SELECT setval('tasks_id_seq', (SELECT COALESCE(MAX(id), 5) FROM tasks));
