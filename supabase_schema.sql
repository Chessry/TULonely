-- ==============================================================================
-- TUlonely - Supabase SQL Database Schema
-- Run this script in the Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Create Profiles Table (Stores user information linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT,
  full_name TEXT,
  student_id TEXT,
  email TEXT,
  faculty TEXT,
  year TEXT,
  campus TEXT,
  bio TEXT,
  avatar TEXT,
  interests JSONB DEFAULT '[]'::JSONB,
  favorite_rooms JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

-- Allow users to insert/update their own profile
CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);


-- 2. Create Rooms Table (Stores activity rooms created by students)
CREATE TABLE IF NOT EXISTS public.rooms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  university_activity_id TEXT,
  university_activity_title TEXT,
  creator JSONB NOT NULL,
  activity_date TEXT,
  activity_time TEXT,
  location TEXT,
  campus TEXT DEFAULT 'ศูนย์รังสิต',
  tags JSONB DEFAULT '[]'::JSONB,
  max_participants INT DEFAULT 4,
  participants JSONB DEFAULT '[]'::JSONB,
  recruitment_deadline TEXT,
  recruitment_option TEXT DEFAULT 'datetime',
  recruitment_hours INT,
  status TEXT DEFAULT 'open',
  chat_messages JSONB DEFAULT '[]'::JSONB,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for Rooms
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view rooms
CREATE POLICY "Rooms are viewable by everyone" 
ON public.rooms FOR SELECT USING (true);

-- Allow authenticated or client users to insert rooms
CREATE POLICY "Enable insert for all users" 
ON public.rooms FOR INSERT WITH CHECK (true);

-- Allow update of rooms (e.g. join room, chat messages)
CREATE POLICY "Enable update for all users" 
ON public.rooms FOR UPDATE USING (true);

-- Allow delete of rooms
CREATE POLICY "Enable delete for all users" 
ON public.rooms FOR DELETE USING (true);


-- 3. Enable Supabase Realtime for Real-time Chat and Room Updates
BEGIN;
  -- Add table to realtime publication
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.rooms;
COMMIT;


-- 4. Create Category Items Table (Tags / Items per Category)
CREATE TABLE IF NOT EXISTS public.category_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL, -- 'food', 'sports', 'study', 'entertainment', 'university'
  name TEXT NOT NULL,      -- Tag name e.g. '#สุกี้ตี๋น้อย'
  tag TEXT,               -- Tag e.g. '#สุกี้ตี๋น้อย'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for category_items
ALTER TABLE public.category_items ENABLE ROW LEVEL SECURITY;

-- Allow public to view category items
CREATE POLICY "Category items are viewable by everyone" 
ON public.category_items FOR SELECT USING (true);

-- Allow authenticated users or anon to insert category items if needed
CREATE POLICY "Enable insert for category_items" 
ON public.category_items FOR INSERT WITH CHECK (true);

-- Initial seed for category_items
INSERT INTO public.category_items (category, name, tag) VALUES
  ('food', '#สุกี้ตี๋น้อย', '#สุกี้ตี๋น้อย'),
  ('food', '#ชาบูหมูกระทะ', '#ชาบูหมูกระทะ'),
  ('food', '#โรงอาหารSC', '#โรงอาหารSC'),
  ('food', '#หารค่าส่ง', '#หารค่าส่ง'),
  ('food', '#อาหารตามสั่ง', '#อาหารตามสั่ง'),
  ('food', '#ตลาดนัดอินเตอร์', '#ตลาดนัดอินเตอร์'),
  ('sports', '#วิ่งGym4', '#วิ่งGym4'),
  ('sports', '#แบดมินตัน', '#แบดมินตัน'),
  ('sports', '#สระว่ายน้ำ50m', '#สระว่ายน้ำ50m'),
  ('sports', '#ฟุตบอลสนามราษฎร', '#ฟุตบอลสนามราษฎร'),
  ('sports', '#บาสเกตบอล', '#บาสเกตบอล'),
  ('sports', '#ฟิตเนส', '#ฟิตเนส'),
  ('study', '#อ่านหนังสือป๋วย', '#อ่านหนังสือป๋วย'),
  ('study', '#ติวแคลคูลัส', '#ติวแคลคูลัส'),
  ('study', '#ฟิสิกส์', '#ฟิสิกส์'),
  ('study', '#ห้องสมุดสัญญา', '#ห้องสมุดสัญญา'),
  ('study', '#หาเพื่อนติวสอบ', '#หาเพื่อนติวสอบ'),
  ('study', '#ติวเขียนโปรแกรม', '#ติวเขียนโปรแกรม'),
  ('entertainment', '#บอร์ดเกม', '#บอร์ดเกม'),
  ('entertainment', '#ดูหนังZpell', '#ดูหนังZpell'),
  ('entertainment', '#คาราโอเกะ', '#คาราโอเกะ'),
  ('entertainment', '#ร้านกาแฟนั่งชิล', '#ร้านกาแฟนั่งชิล'),
  ('entertainment', '#ดนตรีสด', '#ดนตรีสด'),
  ('entertainment', '#ROVตีป้อม', '#ROVตีป้อม'),
  ('university', '#FreshyDay', '#FreshyDay'),
  ('university', '#TUGames', '#TUGames'),
  ('university', '#OpenHouse', '#OpenHouse'),
  ('university', '#DomeRun', '#DomeRun'),
  ('university', '#งานกิจกรรมมธ', '#งานกิจกรรมมธ')
ON CONFLICT DO NOTHING;

