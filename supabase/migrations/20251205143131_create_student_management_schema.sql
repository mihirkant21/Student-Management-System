/*
  # Student Management System Database Schema

  ## Overview
  Complete database schema for a student management system including students, departments,
  courses, marks, attendance, fees, and events/notices management.

  ## New Tables

  ### 1. departments
  - `id` (uuid, primary key) - Unique department identifier
  - `name` (text, unique) - Department name (CSE, ECE, etc)
  - `code` (text, unique) - Department code
  - `head` (text) - Department head name
  - `description` (text) - Department description
  - `created_at` (timestamptz) - Creation timestamp
  
  ### 2. courses
  - `id` (uuid, primary key) - Unique course identifier
  - `name` (text) - Course name
  - `code` (text, unique) - Course code
  - `department_id` (uuid, foreign key) - References departments
  - `semester` (integer) - Semester number
  - `credits` (integer) - Course credits
  - `created_at` (timestamptz) - Creation timestamp

  ### 3. students
  - `id` (uuid, primary key) - Unique student identifier
  - `name` (text) - Student full name
  - `reg_no` (text, unique) - Registration/Roll number
  - `email` (text, unique) - Student email
  - `phone` (text) - Contact number
  - `department_id` (uuid, foreign key) - References departments
  - `year` (integer) - Current year/semester
  - `address` (text) - Student address
  - `parent_name` (text) - Parent/Guardian name
  - `parent_contact` (text) - Parent contact number
  - `date_of_birth` (date) - Date of birth
  - `gender` (text) - Gender
  - `admission_date` (date) - Admission date
  - `status` (text) - Active/Inactive status
  - `created_at` (timestamptz) - Creation timestamp

  ### 4. marks
  - `id` (uuid, primary key) - Unique marks record identifier
  - `student_id` (uuid, foreign key) - References students
  - `course_id` (uuid, foreign key) - References courses
  - `internal_marks` (numeric) - Internal assessment marks
  - `external_marks` (numeric) - External exam marks
  - `total_marks` (numeric) - Total marks
  - `grade` (text) - Letter grade
  - `semester` (integer) - Semester number
  - `academic_year` (text) - Academic year
  - `created_at` (timestamptz) - Creation timestamp

  ### 5. attendance
  - `id` (uuid, primary key) - Unique attendance record identifier
  - `student_id` (uuid, foreign key) - References students
  - `course_id` (uuid, foreign key) - References courses
  - `date` (date) - Attendance date
  - `status` (text) - Present/Absent/Late
  - `remarks` (text) - Additional remarks
  - `created_at` (timestamptz) - Creation timestamp

  ### 6. fees
  - `id` (uuid, primary key) - Unique fee record identifier
  - `student_id` (uuid, foreign key) - References students
  - `amount` (numeric) - Fee amount
  - `paid_amount` (numeric) - Amount paid
  - `due_date` (date) - Payment due date
  - `payment_date` (date) - Actual payment date
  - `status` (text) - Paid/Unpaid/Partial
  - `fee_type` (text) - Tuition/Exam/Library etc
  - `semester` (integer) - Semester number
  - `academic_year` (text) - Academic year
  - `remarks` (text) - Additional remarks
  - `created_at` (timestamptz) - Creation timestamp

  ### 7. events_notices
  - `id` (uuid, primary key) - Unique event/notice identifier
  - `title` (text) - Event/Notice title
  - `description` (text) - Detailed description
  - `type` (text) - Event/Notice/Announcement
  - `date` (date) - Event date
  - `attachment_url` (text) - URL to attachment file
  - `priority` (text) - High/Medium/Low
  - `created_by` (text) - Creator name
  - `created_at` (timestamptz) - Creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for public read access (for simplicity in this educational system)
  - Add policies for insert, update, delete operations

  ## Notes
  - All tables use UUID primary keys with auto-generation
  - Timestamps are automatically set to current time
  - Foreign key constraints ensure data integrity
  - Unique constraints prevent duplicate entries
*/

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  code text UNIQUE NOT NULL,
  head text DEFAULT '',
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  department_id uuid REFERENCES departments(id) ON DELETE CASCADE,
  semester integer DEFAULT 1,
  credits integer DEFAULT 3,
  created_at timestamptz DEFAULT now()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  reg_no text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  phone text DEFAULT '',
  department_id uuid REFERENCES departments(id) ON DELETE SET NULL,
  year integer DEFAULT 1,
  address text DEFAULT '',
  parent_name text DEFAULT '',
  parent_contact text DEFAULT '',
  date_of_birth date,
  gender text DEFAULT 'Not specified',
  admission_date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

-- Create marks table
CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  internal_marks numeric DEFAULT 0,
  external_marks numeric DEFAULT 0,
  total_marks numeric DEFAULT 0,
  grade text DEFAULT '',
  semester integer DEFAULT 1,
  academic_year text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,
  date date DEFAULT CURRENT_DATE,
  status text DEFAULT 'Present',
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  amount numeric DEFAULT 0,
  paid_amount numeric DEFAULT 0,
  due_date date,
  payment_date date,
  status text DEFAULT 'Unpaid',
  fee_type text DEFAULT 'Tuition',
  semester integer DEFAULT 1,
  academic_year text DEFAULT '',
  remarks text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create events and notices table
CREATE TABLE IF NOT EXISTS events_notices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text DEFAULT '',
  type text DEFAULT 'Notice',
  date date DEFAULT CURRENT_DATE,
  attachment_url text DEFAULT '',
  priority text DEFAULT 'Medium',
  created_by text DEFAULT 'Admin',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_notices ENABLE ROW LEVEL SECURITY;

-- Create policies for departments
CREATE POLICY "Allow public read access to departments"
  ON departments FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to departments"
  ON departments FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to departments"
  ON departments FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from departments"
  ON departments FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for courses
CREATE POLICY "Allow public read access to courses"
  ON courses FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to courses"
  ON courses FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to courses"
  ON courses FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from courses"
  ON courses FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for students
CREATE POLICY "Allow public read access to students"
  ON students FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to students"
  ON students FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to students"
  ON students FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from students"
  ON students FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for marks
CREATE POLICY "Allow public read access to marks"
  ON marks FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to marks"
  ON marks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to marks"
  ON marks FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from marks"
  ON marks FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for attendance
CREATE POLICY "Allow public read access to attendance"
  ON attendance FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to attendance"
  ON attendance FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to attendance"
  ON attendance FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from attendance"
  ON attendance FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for fees
CREATE POLICY "Allow public read access to fees"
  ON fees FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to fees"
  ON fees FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to fees"
  ON fees FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from fees"
  ON fees FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for events_notices
CREATE POLICY "Allow public read access to events_notices"
  ON events_notices FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public insert to events_notices"
  ON events_notices FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public update to events_notices"
  ON events_notices FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete from events_notices"
  ON events_notices FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department_id);
CREATE INDEX IF NOT EXISTS idx_students_department ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(reg_no);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_marks_course ON marks(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_fees_student ON fees(student_id);