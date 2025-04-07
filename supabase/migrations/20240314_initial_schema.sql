-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    grade TEXT NOT NULL,
    class_number TEXT NOT NULL,
    teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    number TEXT NOT NULL,
    honorific TEXT,
    icon_type TEXT,
    level INTEGER DEFAULT 0,
    exp INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS missions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    condition TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS mission_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mission_id UUID REFERENCES missions(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS praise_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS roadmaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS point_shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT -1, -- -1 means unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS purchase_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id UUID REFERENCES point_shop_items(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    points_spent INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_missions_class_id ON missions(class_id);
CREATE INDEX IF NOT EXISTS idx_mission_achievements_mission_id ON mission_achievements(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_achievements_student_id ON mission_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_praise_cards_class_id ON praise_cards(class_id);
CREATE INDEX IF NOT EXISTS idx_praise_cards_student_id ON praise_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_class_id ON roadmaps(class_id);
CREATE INDEX IF NOT EXISTS idx_point_shop_items_class_id ON point_shop_items(class_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_student_id ON purchase_history(student_id);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE mission_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE praise_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE point_shop_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users policies
CREATE POLICY "Users can view their own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Classes policies
CREATE POLICY "Teachers can view their own classes"
ON classes FOR SELECT
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can insert their own classes"
ON classes FOR INSERT
WITH CHECK (auth.uid() = teacher_id);

CREATE POLICY "Teachers can update their own classes"
ON classes FOR UPDATE
USING (auth.uid() = teacher_id);

CREATE POLICY "Teachers can delete their own classes"
ON classes FOR DELETE
USING (auth.uid() = teacher_id);

-- Students policies
CREATE POLICY "Teachers can view students in their classes"
ON students FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = students.class_id
        AND classes.teacher_id = auth.uid()
    )
);

CREATE POLICY "Teachers can manage students in their classes"
ON students FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = students.class_id
        AND classes.teacher_id = auth.uid()
    )
);

-- Missions policies
CREATE POLICY "Teachers can view missions in their classes"
ON missions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = missions.class_id
        AND classes.teacher_id = auth.uid()
    )
);

CREATE POLICY "Teachers can manage missions in their classes"
ON missions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM classes
        WHERE classes.id = missions.class_id
        AND classes.teacher_id = auth.uid()
    )
);

-- Add triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_missions_updated_at
    BEFORE UPDATE ON missions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roadmaps_updated_at
    BEFORE UPDATE ON roadmaps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_point_shop_items_updated_at
    BEFORE UPDATE ON point_shop_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 