-- ==============================================================================
-- ODISHA COMPETITIVE INSTITUTE (OCI) — PRODUCTION MASTER SEED DATA
-- ==============================================================================
-- Module: Initial Academic Data, CMS Data, Examination Bank, Faculty & Batches
-- Target: Supabase PostgreSQL (Production / Staging / Local)
-- ==============================================================================

-- 1. COURSES
INSERT INTO public.courses (id, name, code, category, duration_months, description, is_active)
VALUES
    ('c0000000-0000-0000-0000-000000000001', 'SSC CGL & CHSL Master Foundation', 'SSC-CGL-1Y', 'Central Government', 12, 'Comprehensive 1-year program covering Quantitative Aptitude, Reasoning, English, and General Awareness for SSC exams.', true),
    ('c0000000-0000-0000-0000-000000000002', 'Odisha State Govt Combined (OSSC & OSSSC)', 'ODISHA-GOVT-1Y', 'State Recruitment', 12, 'Targeted coaching for OSSC CGL, OSSSC RI, ARI, Amin, and Odisha Police SI/Constable notifications.', true),
    ('c0000000-0000-0000-0000-000000000003', 'Railway Recruitment Board (RRB NTPC & Group D)', 'RRB-NTPC-6M', 'Railways', 6, 'Speed-building, conceptual clarity, and CBT test series for non-technical railway posts.', true),
    ('c0000000-0000-0000-0000-000000000004', 'Banking & Financial Services (IBPS & SBI PO/Clerk)', 'BANK-PO-1Y', 'Banking', 12, 'Intensive banking coaching focusing on high-speed mental math, data interpretation, and English vocabulary.', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, code = EXCLUDED.code;

-- 2. SUBJECTS
INSERT INTO public.subjects (id, course_id, name, code)
VALUES
    ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Quantitative Aptitude', 'MATH-01'),
    ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'Logical & Analytical Reasoning', 'REAS-01'),
    ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000001', 'English Language & Comprehension', 'ENG-01'),
    ('d0000000-0000-0000-0000-000000000004', 'c0000000-0000-0000-0000-000000000002', 'General Awareness & Odisha GK', 'GK-01')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. BATCHES
INSERT INTO public.batches (id, course_id, name, schedule, room_name, start_date, end_date, capacity, status)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'SSC Pinnacle Morning Super 40', 'Mon-Fri 08:00 AM - 11:30 AM', 'Hall A (Kalinga)', '2026-04-01', '2027-03-31', 40, 'ongoing'),
    ('b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Odisha State Target Batch B', 'Mon-Fri 02:00 PM - 05:30 PM', 'Hall B (Konark)', '2026-04-01', '2027-03-31', 45, 'ongoing'),
    ('b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Railway Express Weekend Batch', 'Sat-Sun 09:00 AM - 04:00 PM', 'Hall C (Barabati)', '2026-05-01', '2026-11-30', 50, 'ongoing')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. FACULTY CMS DATA
INSERT INTO public.website_faculty (id, name, subject, qualification, experience_years, photo_url, biography, display_order, is_published)
VALUES
    ('f0000000-0000-0000-0000-000000000001', 'Er. R. K. Mohapatra', 'Quantitative Aptitude', 'B.Tech (NIT Rourkela)', '10+ Years', '/faculty/mohapatra.jpg', 'Specialist in Vedic mathematics and high-speed calculation techniques for competitive exams.', 1, true),
    ('f0000000-0000-0000-0000-000000000002', 'Prof. Arvind Verma', 'Reasoning & Mental Ability', 'M.Sc Mathematics', '12+ Years', '/faculty/verma.jpg', 'Expert mentor in verbal & non-verbal reasoning, puzzle solving, and syllogisms.', 2, true),
    ('f0000000-0000-0000-0000-000000000003', 'Dr. S. K. Nayak', 'General Studies & Odisha Heritage', 'Ph.D History & Public Admin', '15+ Years', '/faculty/nayak.jpg', 'Director and Chief Academic Mentor with deep expertise in state history, polity, and civil services guidance.', 3, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. TESTIMONIALS & SUCCESS STORIES
INSERT INTO public.website_testimonials (id, student_name, exam, rating, photo_url, testimonial, year, is_featured, is_published)
VALUES
    ('da000000-0000-0000-0000-000000000001', 'Priyanka Das', 'OSSC CGL 2024', 5, '/testimonials/priyanka.jpg', 'The daily practice worksheets and Saturday mock exams at OCI Bhadrak transformed my preparation. I cleared OSSC CGL in my first attempt!', '2024', true, true),
    ('da000000-0000-0000-0000-000000000002', 'Bikash Mohanty', 'Railway NTPC', 5, '/testimonials/bikash.jpg', 'Regular CBT mock tests prepared me for the actual computer-based exam environment with zero exam anxiety.', '2024', true, true)
ON CONFLICT (id) DO UPDATE SET testimonial = EXCLUDED.testimonial;

INSERT INTO public.website_success_stories (id, student_name, exam, achievement, year, photo_url, story, is_featured, is_published)
VALUES
    ('db000000-0000-0000-0000-000000000001', 'Subhashree Priyadarshini', 'OSSC Inspector of Supplies', 'State Rank 4', '2024', '/success/subhashree.jpg', 'Completed the 1-year foundation course at OCI Bhadrak. Systematic guidance in General Awareness and Reasoning helped achieve State Rank 4.', true, true),
    ('db000000-0000-0000-0000-000000000002', 'Manas Kumar Jena', 'SSC CGL (Auditor)', 'All India Rank 142', '2023', '/success/manas.jpg', 'Daily math practice and personal mentorship on error analysis by OCI faculty made the difference.', true, true)
ON CONFLICT (id) DO UPDATE SET achievement = EXCLUDED.achievement;

-- 6. CBT EXAMS & SAMPLE QUESTIONS
INSERT INTO public.exams (id, course_id, title, duration_minutes, total_marks, is_published, scheduled_date)
VALUES
    ('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'All India SSC CGL Tier-1 Full Mock Test #01', 60, 200, true, NOW())
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

INSERT INTO public.questions (id, subject, topic, question, options, correct_option_index, explanation, difficulty, marks, negative_marks)
VALUES
    (
        'dc000000-0000-0000-0000-000000000001',
        'Quantitative Aptitude',
        'Percentages & Profit-Loss',
        'A shopkeeper sells an article at a discount of 20% on the marked price and still earns a profit of 25%. If the marked price is Rs. 500, what is the cost price?',
        '["Rs. 320", "Rs. 350", "Rs. 300", "Rs. 400"]'::jsonb,
        0,
        'Selling Price = 500 * (1 - 0.20) = Rs. 400. Cost Price = 400 / 1.25 = Rs. 320.',
        'Medium',
        2,
        0.5
    ),
    (
        'dc000000-0000-0000-0000-000000000002',
        'Logical Reasoning',
        'Syllogisms',
        'Statements: All rivers are water. Some water is clean. Conclusions: I. Some clean is water. II. All rivers are clean.',
        '["Only conclusion I follows", "Only conclusion II follows", "Both I and II follow", "Neither follows"]'::jsonb,
        0,
        'Since Some water is clean, by converse Some clean is water (Conclusion I is valid). Conclusion II does not necessarily follow.',
        'Easy',
        2,
        0.5
    ),
    (
        'dc000000-0000-0000-0000-000000000003',
        'General Awareness',
        'Odisha History & Geography',
        'In which year was the historic Salt Satyagraha launched at Inchudi in Balasore district of Odisha?',
        '["1930", "1920", "1942", "1919"]'::jsonb,
        0,
        'The Inchudi Salt Satyagraha was launched on April 13, 1930, led by Gopabandhu Choudhury and Acharya Harihar.',
        'Medium',
        2,
        0.5
    )
ON CONFLICT (id) DO UPDATE SET question = EXCLUDED.question;

-- 7. ANNOUNCEMENTS
INSERT INTO public.announcements (id, title, content, category, is_urgent)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'OSSC CGL 2026 Batch Admissions Open', 'New morning and weekend batches commence next Monday. Contact admission desk for syllabus roadmap.', 'Admissions', true),
    ('a0000000-0000-0000-0000-000000000002', 'Weekly Full-Length Mock Test Schedule', 'All registered students must attend the offline and CBT mock test on Sunday at 9:00 AM.', 'Examination', false)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
