-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables
-- Class table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  grade TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  school_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  user_id UUID NOT NULL
);

-- Student table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  number INTEGER NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  honorific TEXT,
  icon_type TEXT,
  level INTEGER DEFAULT 1,
  exp INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(class_id, number)
);

-- Mission table
CREATE TABLE IF NOT EXISTS missions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  condition TEXT NOT NULL,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Mission achievement table
CREATE TABLE IF NOT EXISTS mission_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mission_id UUID NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(student_id, mission_id)
);

-- Roadmap table
CREATE TABLE IF NOT EXISTS roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  reward_title TEXT NOT NULL,
  icon TEXT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Roadmap step table
CREATE TABLE IF NOT EXISTS roadmap_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roadmap step achievement table
CREATE TABLE IF NOT EXISTS roadmap_step_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  step_id UUID NOT NULL REFERENCES roadmap_steps(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(student_id, step_id)
);

-- Praise card table
CREATE TABLE IF NOT EXISTS praise_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Point shop item table
CREATE TABLE IF NOT EXISTS point_shop_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  image_url TEXT,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Purchase history table
CREATE TABLE IF NOT EXISTS purchase_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES point_shop_items(id) ON DELETE CASCADE,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  used BOOLEAN DEFAULT FALSE,
  used_date TIMESTAMP WITH TIME ZONE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_students_class_id ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_missions_class_id ON missions(class_id);
CREATE INDEX IF NOT EXISTS idx_mission_achievements_mission_id ON mission_achievements(mission_id);
CREATE INDEX IF NOT EXISTS idx_mission_achievements_student_id ON mission_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_mission_achievements_class_id ON mission_achievements(class_id);
CREATE INDEX IF NOT EXISTS idx_roadmaps_class_id ON roadmaps(class_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_steps_roadmap_id ON roadmap_steps(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_step_achievements_step_id ON roadmap_step_achievements(step_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_step_achievements_student_id ON roadmap_step_achievements(student_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_step_achievements_class_id ON roadmap_step_achievements(class_id);
CREATE INDEX IF NOT EXISTS idx_praise_cards_student_id ON praise_cards(student_id);
CREATE INDEX IF NOT EXISTS idx_praise_cards_class_id ON praise_cards(class_id);
CREATE INDEX IF NOT EXISTS idx_point_shop_items_class_id ON point_shop_items(class_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_student_id ON purchase_history(student_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_item_id ON purchase_history(item_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_class_id ON purchase_history(class_id); 