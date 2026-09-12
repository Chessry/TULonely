import { UniversityActivity, Room, UserProfile, NotificationItem } from '../types';

export const INITIAL_USER: UserProfile = {
  id: '',
  name: '',
  fullName: '',
  studentId: '',
  email: '',
  faculty: '',
  year: '',
  campus: 'ศูนย์รังสิต',
  bio: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  interests: [],
  favoriteRooms: [],
  favoriteActivities: [],
};

export const UNIVERSITY_ACTIVITIES: UniversityActivity[] = [
  {
    id: 'act-freshy-day',
    title: 'TU Freshy Day & Night 2026',
    date: '25 สิงหาคม 2026',
    time: '16:00 – 21:30 น.',
    location: 'ยิมเนเซียม 5 (Gym 5), มธ. ศูนย์รังสิต',
    campus: 'ศูนย์รังสิต',
    description: 'มหกรรมต้อนรับเพื่อนใหม่ มธ. คอนเสิร์ตสุดมันส์จากศิลปินชื่อดัง การแสดงจากชุมนุมต่าง ๆ และกิจกรรมสร้างความสัมพันธ์เพื่อนใหม่!',
    tags: ['#มหาวิทยาลัย', '#Freshy', '#คอนเสิร์ต', '#เพื่อนใหม่'],
    coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=80',
    accentColor: '#E04B5A',
    organizer: 'องค์การนักศึกษามหาวิทยาลัยธรรมศาสตร์ (อมธ.)',
    icon: '🎉',
    category: 'university'
  },
  {
    id: 'act-tu-games',
    title: 'TU Games ครั้งที่ 40 (กีฬานักศึกษาธรรมศาสตร์)',
    date: '28 สิงหาคม 2026',
    time: '08:30 – 19:00 น.',
    location: 'Main Stadium & อาคารยิมเนเซียม 4, ศูนย์รังสิต',
    campus: 'ศูนย์รังสิต',
    description: 'การแข่งขันกีฬาประเพณีภายในมหาวิทยาลัยธรรมศาสตร์ ลุ้นเชียร์ทุกคณะ กรีฑา ฟุตบอล บาสเกตบอล และขบวนพาเหรดสุดอลังการ',
    tags: ['#TUGames', '#กีฬา', '#เชียร์ลีดเดอร์', '#TU40'],
    coverImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=80',
    accentColor: '#F59E0B',
    organizer: 'กองกิจการนักศึกษา มธ.',
    icon: '🏆',
    category: 'university'
  },
  {
    id: 'act-openhouse',
    title: 'Thammasat Open House 2026',
    date: '2 กันยายน 2026',
    time: '09:00 – 16:30 น.',
    location: 'อาคารเรียนรวมสังคมศาสตร์ (SC3) & ศูนย์ประชุม มธ.',
    campus: 'ศูนย์รังสิต',
    description: 'เปิดบ้านธรรมศาสตร์ นิทรรศการทุกคณะ แนะนำหลักสูตร กิจกรรมเวิร์กช็อปจากพี่ ๆ ทุกสาขาวิชา',
    tags: ['#OpenHouse', '#แนะนำคณะ', '#มธรังสิต', '#Workshop'],
    coverImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80',
    accentColor: '#3B82F6',
    organizer: 'ฝ่ายวิชาการ มหาวิทยาลัยธรรมศาสตร์',
    icon: '🏫',
    category: 'university'
  },
  {
    id: 'act-dome-night-run',
    title: 'Dome Night Run 2026 วิ่งรอบโดมใต้แสงดาว',
    date: '5 กันยายน 2026',
    time: '18:30 – 21:00 น.',
    location: 'ลานป๋วย 100 ปี (Puey Park), ศูนย์รังสิต',
    campus: 'ศูนย์รังสิต',
    description: 'งานวิ่งการกุศลและสุขภาพรอบสวนป๋วย 100 ปี เพลิดเพลินกับไฟประดับสุดชิคและมินิคอนเสิร์ตหลังเข้าเส้นชัย',
    tags: ['#DomeRun', '#วิ่งกลางคืน', '#PueyPark', '#สุขภาพ'],
    coverImage: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&auto=format&fit=crop&q=80',
    accentColor: '#10B981',
    organizer: 'สโมสรนักศึกษาสหเวชศาสตร์',
    icon: '🏃',
    category: 'university'
  },
  {
    id: 'act-filmfest',
    title: 'Thammasat Film Festival 2026 เทศกาลหนังนักศึกษา',
    date: '8 กันยายน 2026',
    time: '17:00 – 22:00 น.',
    location: 'ห้องฉายภาพยนตร์ คณะ JC ศูนย์รังสิต',
    campus: 'ศูนย์รังสิต',
    description: 'ชมภาพยนตร์สั้น ผลงานธีสิสนักศึกษา JC และหนังอินดี้ระดับนานาชาติ พร้อมเสวนากับผู้กำกับชื่อดัง',
    tags: ['#FilmFest', '#JC', '#ดูหนัง', '#ศูนย์รังสิต'],
    coverImage: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop&q=80',
    accentColor: '#8B5CF6',
    organizer: 'คณะวารสารศาสตร์และสื่อสารมวลชน',
    icon: '🎬',
    category: 'university'
  }
];

export const INITIAL_ROOMS: Room[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const TU_FACULTIES = [
  'วิศวกรรมศาสตร์ (TSE)',
  'ศิลปศาสตร์ (LArts)',
  'พาณิชย์และการบัญชี (TBS)',
  'นิติศาสตร์',
  'รัฐศาสตร์ (PolSci)',
  'เศรษฐศาสตร์ (Econ)',
  'วารสารศาสตร์และสื่อสารมวลชน (JC)',
  'สังคมวิทยาและมานุษยวิทยา',
  'วิทยาศาสตร์และเทคโนโลยี (SciTU)',
  'สถาปัตยกรรมศาสตร์และการผังเมือง (TDS)',
  'แพทยศาสตร์ (MedTU)',
  'สหเวชศาสตร์',
  'พยาบาลศาสตร์',
  'ทันตแพทยศาสตร์',
  'เภสัชศาสตร์',
  'สาธารณสุขศาสตร์',
  'วิทยาลัยนวัตกรรม (CITU)',
  'วิทยาลัยสหวิทยาการ',
  'สถาบันเทคโนโลยีนานาชาติสิรินธร (SIIT)',
  'วิทยาลัยนานาชาติปรีดี พนมยงค์ (PBIC)',
  'วิทยาลัยพัฒนศาสตร์ ป๋วย อึ๊งภากรณ์'
];

export const TU_CAMPUSES = [
  'ศูนย์รังสิต'
];

export const CATEGORY_METADATA: Record<
  string,
  {
    name: string;
    englishName: string;
    tagline: string;
    icon: string;
    color: string;
    bgBadge: string;
    borderAccent: string;
    popularTags: string[];
    description: string;
  }
> = {
  university: {
    name: 'กิจกรรมมหาลัย',
    englishName: 'University Events',
    tagline: 'ไปเปิดโลกกิจกรรมใหม่ ๆ กัน 🎉',
    icon: '🎉',
    color: '#8B1D2C',
    bgBadge: 'bg-[#8B1D2C]/10 text-[#8B1D2C]',
    borderAccent: 'border-[#8B1D2C]',
    popularTags: ['#Freshy', '#TUGames', '#OpenHouse', '#คอนเสิร์ต', '#เพื่อนใหม่', '#จิตอาสา'],
    description: 'กิจกรรมอย่างเป็นทางการของมหาวิทยาลัยธรรมศาสตร์ ชมรม และงานเทศกาล สร้างห้องหาเพื่อนไปร่วมงานด้วยกัน'
  },
  food: {
    name: 'กินข้าว',
    englishName: 'Food & Drinks',
    tagline: 'หาเพื่อนกินข้าว ไม่ต้องกินคนเดียว 🍜',
    icon: '🍜',
    color: '#E04B5A',
    bgBadge: 'bg-[#E04B5A]/10 text-[#E04B5A]',
    borderAccent: 'border-[#E04B5A]',
    popularTags: ['#อาหารตามสั่ง', '#ปิ้งย่าง', '#ชาบู', '#เมนูเส้น', '#ของหวาน', '#USquare', '#เชียงราก', '#โรงอาหารSC'],
    description: 'หาเพื่อนแชร์โต๊ะกินข้าว ตะลุยร้านอร่อยรอบมหาลัย TU Dome, U-Square หรือโรงอาหาร SC'
  },
  sports: {
    name: 'กีฬา',
    englishName: 'Sports & Fitness',
    tagline: 'หาเพื่อนออกแรง ไปเล่นด้วยกัน ⚽',
    icon: '⚽',
    color: '#10B981',
    bgBadge: 'bg-[#10B981]/10 text-[#10B981]',
    borderAccent: 'border-[#10B981]',
    popularTags: ['#ฟุตบอล', '#บาส', '#แบดมินตัน', '#วอลเลย์บอล', '#วิ่ง', '#Gym4', '#Gym5', '#สระว่ายน้ำ'],
    description: 'หาเพื่อนเล่นกีฬา รวมทีมเตะบอล จองคอร์ทแบดมินตัน หรือชวนไปวิ่งรอบสวนป๋วย 100 ปี'
  },
  study: {
    name: 'ติว / อ่านหนังสือ',
    englishName: 'Study & Tutoring',
    tagline: 'อ่านคนเดียวมันเหงา มาอ่านด้วยกัน 📚',
    icon: '📚',
    color: '#3B82F6',
    bgBadge: 'bg-[#3B82F6]/10 text-[#3B82F6]',
    borderAccent: 'border-[#3B82F6]',
    popularTags: ['#วิศวะ', '#Calculus', '#อ่านหนังสือ', '#ติว', '#หอสมุดป๋วย', '#กฎหมาย', '#บัญชี', '#Midterm'],
    description: 'สร้างกลุ่มติววิชาต่าง ๆ แลกเปลี่ยนสรุป นั่งอ่านหนังสือแบบ Focus Group ที่หอสมุดป๋วย อึ๊งภากรณ์'
  },
  entertainment: {
    name: 'บันเทิง',
    englishName: 'Entertainment & Hangout',
    tagline: 'หาเพื่อนเล่น ดู ฟัง และสนุกไปด้วยกัน 🎬',
    icon: '🎬',
    color: '#8B5CF6',
    bgBadge: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
    borderAccent: 'border-[#8B5CF6]',
    popularTags: ['#เล่นเกม', '#BoardGame', '#ดูหนัง', '#Karaoke', '#Concert', '#Zpell', '#ฟิวเจอร์', '#บอร์ดเกม'],
    description: 'หาเพื่อนเล่นบอร์ดเกม ร้องเกะ ไปดูหนังที่ Zpell หรือแฮงเอาท์หลังเลิกเรียน'
  },
  activity: {
    name: 'กิจกรรมมหาลัย',
    englishName: 'activity',
    tagline: 'ไปเปิดโลกกิจกรรมใหม่ ๆ กัน 🎉',
    icon: '🏛️',
    color: '#8B1D2C',
    bgBadge: 'bg-[#8B1D2C]/10 text-[#8B1D2C]',
    borderAccent: 'border-[#8B1D2C]',
    popularTags: ['#Freshy', '#TUGames', '#OpenHouse', '#คอนเสิร์ต', '#เพื่อนใหม่', '#จิตอาสา'],
    description: 'กิจกรรมอย่างเป็นทางการของมหาวิทยาลัยธรรมศาสตร์ ชมรม และงานเทศกาล สร้างห้องหาเพื่อนไปร่วมงานด้วยกัน'
  },
  restaurants: {
    name: 'กินข้าว',
    englishName: 'restaurants',
    tagline: 'หาเพื่อนกินข้าว ไม่ต้องกินคนเดียว 🍜',
    icon: '🍜',
    color: '#E04B5A',
    bgBadge: 'bg-[#E04B5A]/10 text-[#E04B5A]',
    borderAccent: 'border-[#E04B5A]',
    popularTags: ['#อาหารตามสั่ง', '#ปิ้งย่าง', '#ชาบู', '#เมนูเส้น', '#ของหวาน', '#USquare', '#เชียงราก', '#โรงอาหารSC'],
    description: 'หาเพื่อนแชร์โต๊ะกินข้าว ตะลุยร้านอร่อยรอบมหาลัย TU Dome, U-Square หรือโรงอาหาร SC'
  }
};
