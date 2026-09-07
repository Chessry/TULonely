import { UniversityActivity, Room, UserProfile, NotificationItem } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user-me-noah',
  name: 'Noah',
  fullName: 'ณภัทร ปิติเจริญวงศ์',
  studentId: '650965xxxx',
  email: 'noah.p@dome.tu.ac.th',
  faculty: 'วิศวกรรมศาสตร์ (TSE)',
  year: 'ปี 3',
  campus: 'ศูนย์รังสิต',
  bio: 'หาเพื่อนกินข้าว เล่นบอร์ดเกม และไปวิ่งที่สระว่ายน้ำ 50 เมตรครับ ทักได้เลย 👋',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  interests: ['#บอร์ดเกม', '#อาหารตามสั่ง', '#วิ่งออกกำลัง', '#Freshy', '#Calculus', '#คอนเสิร์ต'],
  favoriteRooms: ['room-freshy-1', 'room-food-shabu'],
  favoriteActivities: ['act-freshy-day', 'act-openhouse'],
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

export const INITIAL_ROOMS: Room[] = [
  // Under TU Freshy Day
  {
    id: 'room-freshy-1',
    title: 'หาเพื่อนไป Freshy Day โซนยืนหน้าเวที 🎸',
    description: 'อยากไปยืนเกาะขอบเวทีดูคอนเสิร์ตกับเพื่อนใหม่ ใครยังไม่มีตี้ไปด้วยกัน มาจอยกันได้เลยครับ นัดเจอกันลานอินเตอร์ก่อน 15:30 น.',
    category: 'university',
    universityActivityId: 'act-freshy-day',
    universityActivityTitle: 'TU Freshy Day & Night 2026',
    creator: {
      id: 'user-me-noah',
      name: 'Noah',
      studentId: '650965xxxx',
      faculty: 'วิศวกรรมศาสตร์ (TSE)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'เด็กวิดวะชอบฟังเพลงอินดี้'
    },
    activityDate: '25 สิงหาคม 2026',
    activityTime: '16:00 น.',
    location: 'ยิมเนเซียม 5 (Gym 5), ศูนย์รังสิต',
    campus: 'ศูนย์รังสิต',
    tags: ['#Freshy', '#เพื่อนใหม่', '#คอนเสิร์ต', '#TSE'],
    maxParticipants: 5,
    participants: [
      {
        id: 'user-me-noah',
        name: 'Noah',
        studentId: '650965xxxx',
        faculty: 'วิศวกรรมศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '10 นาทีที่แล้ว',
        isHost: true
      },
      {
        id: 'user-2',
        name: 'ฟ้าใส (Fah)',
        studentId: '660465xxxx',
        faculty: 'ศิลปศาสตร์ (LArts)',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '8 นาทีที่แล้ว',
        isHost: false
      },
      {
        id: 'user-3',
        name: 'เต้ (Tae)',
        studentId: '650165xxxx',
        faculty: 'นิติศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '5 นาทีที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 24,
    status: 'open',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    viewsCount: 142,
    chatMessages: [
      {
        id: 'msg-1',
        senderId: 'user-me-noah',
        senderName: 'Noah',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        text: 'ยินดีต้อนรับทุกคนครับ! วันงานเดี๋ยวนัดเจอกันตรงทางเข้ายิม 5 ฝั่งสระว่ายน้ำนะครับ',
        timestamp: '16:40 น.'
      },
      {
        id: 'msg-2',
        senderId: 'user-2',
        senderName: 'ฟ้าใส (Fah)',
        senderAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        text: 'เค้าไปจาก SC เลิกบ่าย 3 พอดีเลย เจอกันค่า ✨',
        timestamp: '16:45 น.'
      }
    ]
  },
  {
    id: 'room-freshy-2',
    title: 'ไปงานพร้อมกันหลังเลิกเรียน ฝั่งเชียงราก 🚌',
    description: 'ใครอยู่หอฝั่งประตูเชียงราก 2 อยากมีเพื่อนเดินไปด้วยกัน นัดเจอกันหน้าเซเว่นประตูเชียงราก 16:30 น.',
    category: 'university',
    universityActivityId: 'act-freshy-day',
    universityActivityTitle: 'TU Freshy Day & Night 2026',
    creator: {
      id: 'user-4',
      name: 'มายด์ (Mind)',
      studentId: '670365xxxx',
      faculty: 'พาณิชย์และการบัญชี (TBS)',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      bio: 'เด็กบัญชีปี 1 หาเพื่อนใหม่ครับ'
    },
    activityDate: '25 สิงหาคม 2026',
    activityTime: '16:30 น.',
    location: 'หน้า 7-Eleven ประตูเชียงราก 2',
    campus: 'ศูนย์รังสิต',
    tags: ['#Freshy', '#เชียงราก', '#เด็กหอ', '#ปี1'],
    maxParticipants: 4,
    participants: [
      {
        id: 'user-4',
        name: 'มายด์ (Mind)',
        studentId: '670365xxxx',
        faculty: 'พาณิชย์และการบัญชี',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
        joinedAt: '1 ชั่วโมงที่แล้ว',
        isHost: true
      },
      {
        id: 'user-5',
        name: 'กันต์ (Gun)',
        studentId: '670265xxxx',
        faculty: 'รัฐศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '40 นาทีที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 24,
    status: 'open',
    createdAt: new Date(Date.now() - 7200 * 1000).toISOString(),
    viewsCount: 89,
    chatMessages: []
  },
  {
    id: 'room-freshy-3',
    title: 'แก๊งเด็กหอนอก รวมตัวนั่งรถตู้ไปงาน Freshy ที่ยิม 5 🚐',
    description: 'ใครอยู่หอนอกแล้วจะไปงาน Freshy ที่ยิม 5 รังสิต รวมตัวกันขึ้นรถสองแถว/รถตู้ นัดเจอกันประตูเชียงราก 1 14:30 น. นะครับ',
    category: 'university',
    universityActivityId: 'act-freshy-day',
    universityActivityTitle: 'TU Freshy Day & Night 2026',
    creator: {
      id: 'user-6',
      name: 'ภีม (Peem)',
      studentId: '650865xxxx',
      faculty: 'วารสารศาสตร์ฯ (JC)',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      bio: 'เด็ก มธ. รังสิต ชอบถ่ายรูป'
    },
    activityDate: '25 สิงหาคม 2026',
    activityTime: '14:30 น.',
    location: 'หน้า 7-Eleven ประตูเชียงราก 1',
    campus: 'ศูนย์รังสิต',
    tags: ['#เชียงราก', '#เด็กหอ', '#JC', '#Freshy'],
    maxParticipants: 4,
    participants: [
      {
        id: 'user-6',
        name: 'ภีม (Peem)',
        studentId: '650865xxxx',
        faculty: 'วารสารศาสตร์ฯ',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        joinedAt: '3 ชั่วโมงที่แล้ว',
        isHost: true
      },
      {
        id: 'user-7',
        name: 'บอส (Boss)',
        studentId: '650565xxxx',
        faculty: 'เศรษฐศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2 ชั่วโมงที่แล้ว',
        isHost: false
      },
      {
        id: 'user-8',
        name: 'แพรวา (Pear)',
        studentId: '660365xxxx',
        faculty: 'พาณิชย์และการบัญชี',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        joinedAt: '1 ชั่วโมงที่แล้ว',
        isHost: false
      },
      {
        id: 'user-9',
        name: 'นุ่น (Noon)',
        studentId: '650665xxxx',
        faculty: 'สังคมวิทยาและมานุษยวิทยา',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        joinedAt: '30 นาทีที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 12,
    status: 'full',
    createdAt: new Date(Date.now() - 10000 * 1000).toISOString(),
    viewsCount: 230,
    chatMessages: []
  },

  // General: Food (🍜 กินข้าว)
  {
    id: 'room-food-shabu',
    title: 'หาเพื่อนกินสุกี้ตี๋น้อย หลัง มธ. รังสิต คืนนี้ 🥘',
    description: 'อยากกินชาบูมากกกก ปิดเล่มรายงานเสร็จอยากฉลอง ใครยังไม่มีแพลนข้าวเย็นมาตี้กันได้ครับ หารเท่ากัน สบายๆ',
    category: 'food',
    creator: {
      id: 'user-10',
      name: 'วิน (Win)',
      studentId: '640965xxxx',
      faculty: 'วิทยาศาสตร์และเทคโนโลยี',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      bio: 'สายบุฟเฟต์ กินไม่อั้น'
    },
    activityDate: 'วันนี้',
    activityTime: '19:30 น.',
    location: 'สุกี้ตี๋น้อย สาขา TU Dome Plaza รังสิต',
    campus: 'ศูนย์รังสิต',
    tags: ['#ชาบู', '#ปิ้งย่าง', '#บุฟเฟต์', '#TUDome', '#หารเท่า'],
    maxParticipants: 4,
    participants: [
      {
        id: 'user-10',
        name: 'วิน (Win)',
        studentId: '640965xxxx',
        faculty: 'วิทยาศาสตร์และเทคโนโลยี',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        joinedAt: '30 นาทีที่แล้ว',
        isHost: true
      },
      {
        id: 'user-11',
        name: 'แจน (Jan)',
        studentId: '650465xxxx',
        faculty: 'ศิลปกรรมศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        joinedAt: '15 นาทีที่แล้ว',
        isHost: false
      },
      {
        id: 'user-12',
        name: 'โอ๊ต (Oat)',
        studentId: '650165xxxx',
        faculty: 'สถาปัตยกรรมศาสตร์ฯ',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        joinedAt: '5 นาทีที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 2 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 4,
    status: 'almost_full',
    createdAt: new Date(Date.now() - 3600 * 1000).toISOString(),
    viewsCount: 164,
    chatMessages: [
      {
        id: 'm-f1',
        senderId: 'user-10',
        senderName: 'วิน (Win)',
        senderAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        text: 'ขออีก 1 คนครบโต๊ะ 4 คนพอดีครับ ใครว่างกดจอยได้เลย!',
        timestamp: '17:15 น.'
      }
    ]
  },
  {
    id: 'room-food-canteen',
    title: 'หาเพื่อนกินข้าวมื้อเที่ยง โรงอาหาร SC 🍜',
    description: 'วันนี้คาบเช้าเลิก SC กินเตี๋ยวต้มยำป้าอ้วน ใครกินคนเดียวเหงาๆ มานั่งโต๊ะเดียวกันคุยเล่นได้น้า',
    category: 'food',
    creator: {
      id: 'user-13',
      name: 'พลอย (Ploy)',
      studentId: '660665xxxx',
      faculty: 'แพทยศาสตร์',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'เด็กแพทย์ชอบกินของอร่อย'
    },
    activityDate: 'พรุ่งนี้',
    activityTime: '12:00 น.',
    location: 'โรงอาหาร SC (Green Canteen)',
    campus: 'ศูนย์รังสิต',
    tags: ['#อาหารตามสั่ง', '#เมนูเส้น', '#SC', '#มื้อเที่ยง'],
    maxParticipants: 4,
    participants: [
      {
        id: 'user-13',
        name: 'พลอย (Ploy)',
        studentId: '660665xxxx',
        faculty: 'แพทยศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '1 ชั่วโมงที่แล้ว',
        isHost: true
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 18 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 24,
    status: 'open',
    createdAt: new Date(Date.now() - 3000 * 1000).toISOString(),
    viewsCount: 78,
    chatMessages: []
  },

  // General: Sports (⚽ กีฬา)
  {
    id: 'room-sports-badminton',
    title: 'ชวนตีแบดมินตัน Gym 4 รังสิต ขอ 2 คน 🏸',
    description: 'จองคอร์ท Gym 4 ไว้แล้ว 18:00 - 20:00 น. เล่นสนุกๆ ไม่เน้นซีเรียส มีลูกแบดพร้อมครับ ขอคนมาช่วยหารค่าคอร์ทคนละ 40 บ.',
    category: 'sports',
    creator: {
      id: 'user-14',
      name: 'กานต์ (Karn)',
      studentId: '650765xxxx',
      faculty: 'วิทยาลัยนวัตกรรม (CITU)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      bio: 'ชอบเล่นแบดและวิ่ง'
    },
    activityDate: 'วันนี้',
    activityTime: '18:00 – 20:00 น.',
    location: 'โรงยิมเนเซียม 4, ศูนย์รังสิต',
    campus: 'ศูนย์รังสิต',
    tags: ['#แบดมินตัน', '#Gym4', '#ออกกำลังกาย', '#หารค่าคอร์ท'],
    maxParticipants: 4,
    participants: [
      {
        id: 'user-14',
        name: 'กานต์ (Karn)',
        studentId: '650765xxxx',
        faculty: 'วิทยาลัยนวัตกรรม',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2 ชั่วโมงที่แล้ว',
        isHost: true
      },
      {
        id: 'user-15',
        name: 'บิว (Bew)',
        studentId: '660265xxxx',
        faculty: 'พยาบาลศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
        joinedAt: '1 ชั่วโมงที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 3 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 6,
    status: 'open',
    createdAt: new Date(Date.now() - 4000 * 1000).toISOString(),
    viewsCount: 112,
    chatMessages: []
  },
  {
    id: 'room-sports-football',
    title: 'เตะฟุตบอลสนาม 7 คน หญ้าเทียมหลังยิม ⚽',
    description: 'ขาดอีก 3-4 คนจัดทีมเตะกระชับมิตร เตะเสร็จไปหาข้าวกินต่อ ชิลๆ ทุกคณะมาได้เลยครับ',
    category: 'sports',
    creator: {
      id: 'user-16',
      name: 'ฟลุ๊ค (Fluke)',
      studentId: '650965xxxx',
      faculty: 'วิศวกรรมศาสตร์ (TSE)',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      bio: 'ปีกขวาตัวจี๊ด'
    },
    activityDate: 'พรุ่งนี้',
    activityTime: '17:00 น.',
    location: 'สนามหญ้าเทียมศูนย์กีฬาธรรมศาสตร์',
    campus: 'ศูนย์รังสิต',
    tags: ['#ฟุตบอล', '#สนามหญ้าเทียม', '#บอลกระชับมิตร'],
    maxParticipants: 10,
    participants: [
      {
        id: 'user-16',
        name: 'ฟลุ๊ค (Fluke)',
        studentId: '650965xxxx',
        faculty: 'วิศวกรรมศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '4 ชั่วโมงที่แล้ว',
        isHost: true
      },
      {
        id: 'user-17',
        name: 'นนท์ (Non)',
        studentId: '650165xxxx',
        faculty: 'นิติศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
        joinedAt: '3 ชั่วโมงที่แล้ว',
        isHost: false
      },
      {
        id: 'user-18',
        name: 'พี (Pee)',
        studentId: '660565xxxx',
        faculty: 'เศรษฐศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2 ชั่วโมงที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 20 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 24,
    status: 'open',
    createdAt: new Date(Date.now() - 5000 * 1000).toISOString(),
    viewsCount: 95,
    chatMessages: []
  },

  // General: Study (📚 ติว / อ่านหนังสือ)
  {
    id: 'room-study-calc',
    title: 'ติว Calculus 1 ทำโจทย์ข้อสอบเก่า Midterm 📐',
    description: 'รวมกลุ่มติวแคล 1 มีสรุปสูตรและข้อสอบย้อนหลัง 5 ปี ใครไม่เข้าใจเรื่อง Limit หรือ Derivative มานั่งทำโจทย์ด้วยกันได้เลย ติวให้ฟรี!',
    category: 'study',
    creator: {
      id: 'user-19',
      name: 'อาร์ม (Arm)',
      studentId: '640965xxxx',
      faculty: 'วิศวกรรมศาสตร์ (TSE)',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      bio: 'TA Calculus ช่วยน้องๆ ผ่าน F'
    },
    activityDate: '26 สิงหาคม 2026',
    activityTime: '13:00 – 17:00 น.',
    location: 'ห้อง Study Room ชั้น 3 หอสมุดป๋วย อึ๊งภากรณ์',
    campus: 'ศูนย์รังสิต',
    tags: ['#Calculus', '#วิศวะ', '#วิทยาศาสตร์', '#หอสมุดป๋วย', '#ติวข้อสอบ'],
    maxParticipants: 6,
    participants: [
      {
        id: 'user-19',
        name: 'อาร์ม (Arm)',
        studentId: '640965xxxx',
        faculty: 'วิศวกรรมศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '5 ชั่วโมงที่แล้ว',
        isHost: true
      },
      {
        id: 'user-20',
        name: 'พรีม (Preme)',
        studentId: '670965xxxx',
        faculty: 'วิศวกรรมศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        joinedAt: '4 ชั่วโมงที่แล้ว',
        isHost: false
      },
      {
        id: 'user-21',
        name: 'กอล์ฟ (Golf)',
        studentId: '670965xxxx',
        faculty: 'วิทยาศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        joinedAt: '3 ชั่วโมงที่แล้ว',
        isHost: false
      },
      {
        id: 'user-22',
        name: 'จูน (June)',
        studentId: '670965xxxx',
        faculty: 'สถาปัตย์',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        joinedAt: '2 ชั่วโมงที่แล้ว',
        isHost: false
      },
      {
        id: 'user-23',
        name: 'มีน (Mean)',
        studentId: '670965xxxx',
        faculty: 'วิศวกรรมศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
        joinedAt: '1 ชั่วโมงที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 48,
    status: 'almost_full',
    createdAt: new Date(Date.now() - 8000 * 1000).toISOString(),
    viewsCount: 310,
    chatMessages: []
  },

  // General: Entertainment (🎬 บันเทิง)
  {
    id: 'room-ent-boardgame',
    title: 'เล่นบอร์ดเกม Avalon & Catan ที่ร้าน U-Square 🎲',
    description: 'หาเพื่อนเล่นบอร์ดเกมแนวปาร์ตี้/บลัฟ/วางแผน เล่นไม่เป็นไม่ต้องห่วง มีคนสอนกติกาให้หมดครับ นั่งยาวๆ สบายๆ',
    category: 'entertainment',
    creator: {
      id: 'user-24',
      name: 'แบงค์ (Bank)',
      studentId: '650365xxxx',
      faculty: 'พาณิชย์และการบัญชี (TBS)',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      bio: 'เจ้าพ่อบอร์ดเกม'
    },
    activityDate: '27 สิงหาคม 2026',
    activityTime: '18:00 – 22:00 น.',
    location: 'ร้าน Board Game Cafe ฝั่ง U-Square รังสิต',
    campus: 'ศูนย์รังสิต',
    tags: ['#BoardGame', '#Avalon', '#Catan', '#USquare', '#เล่นเกม'],
    maxParticipants: 6,
    participants: [
      {
        id: 'user-24',
        name: 'แบงค์ (Bank)',
        studentId: '650365xxxx',
        faculty: 'พาณิชย์และการบัญชี',
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        joinedAt: '6 ชั่วโมงที่แล้ว',
        isHost: true
      },
      {
        id: 'user-25',
        name: 'แพร (Prae)',
        studentId: '660865xxxx',
        faculty: 'JC',
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        joinedAt: '3 ชั่วโมงที่แล้ว',
        isHost: false
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 36 * 3600 * 1000).toISOString(),
    recruitmentOption: 'hours',
    recruitmentHours: 48,
    status: 'open',
    createdAt: new Date(Date.now() - 9000 * 1000).toISOString(),
    viewsCount: 154,
    chatMessages: []
  },
  {
    id: 'room-ent-karaoke',
    title: 'ร้องเกะคลายเครียดหลังสอบ Zpell ฟิวเจอร์ 🎤',
    description: 'สอบเสร็จต้องปลดปล่อย หาเพื่อนสายร้องเพลง T-Pop / K-Pop / เพลงสากล ร้องเพี้ยนไม่ว่า ขอแค่จอย!',
    category: 'entertainment',
    creator: {
      id: 'user-26',
      name: 'ดรีม (Dream)',
      studentId: '650465xxxx',
      faculty: 'ศิลปศาสตร์',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      bio: 'นักร้องเสียงทองคำ'
    },
    activityDate: '29 สิงหาคม 2026',
    activityTime: '17:30 น.',
    location: 'Karaoke Zone @ Zpell ฟิวเจอร์พาร์ครังสิต',
    campus: 'ศูนย์รังสิต',
    tags: ['#Karaoke', '#Zpell', '#ร้องเพลง', '#คลายเครียด'],
    maxParticipants: 5,
    participants: [
      {
        id: 'user-26',
        name: 'ดรีม (Dream)',
        studentId: '650465xxxx',
        faculty: 'ศิลปศาสตร์',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        joinedAt: '1 วันที่แล้ว',
        isHost: true
      }
    ],
    recruitmentDeadline: new Date(Date.now() + 60 * 3600 * 1000).toISOString(),
    recruitmentOption: 'datetime',
    status: 'open',
    createdAt: new Date(Date.now() - 15000 * 1000).toISOString(),
    viewsCount: 88,
    chatMessages: []
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'join',
    title: 'มีเพื่อนใหม่เข้าร่วมห้องของคุณ! 🎉',
    description: 'เต้ (นิติศาสตร์) ได้เข้าร่วมห้อง "หาเพื่อนไป Freshy Day โซนยืนหน้าเวที 🎸"',
    time: '5 นาทีที่แล้ว',
    read: false,
    targetRoomId: 'room-freshy-1'
  },
  {
    id: 'notif-2',
    type: 'almost_full',
    title: 'ห้องที่คุณสนใจใกล้เต็มแล้ว ⚡',
    description: 'ห้อง "หาเพื่อนกินสุกี้ตี๋น้อย หลัง มธ." มีสมาชิก 3/4 คนแล้ว เหลืออีกเพียง 1 ที่นั่ง!',
    time: '20 นาทีที่แล้ว',
    read: false,
    targetRoomId: 'room-food-shabu'
  },
  {
    id: 'notif-3',
    type: 'activity_soon',
    title: 'กิจกรรม มธ. กำลังจะเริ่มในอีก 7 วัน ✨',
    description: 'TU Freshy Day & Night 2026 พร้อมเปิดบ้านต้อนรับเพื่อนใหม่แล้ว เช็คห้องที่จอยไว้เลย',
    time: '2 ชั่วโมงที่แล้ว',
    read: true,
    targetActivityId: 'act-freshy-day'
  },
  {
    id: 'notif-4',
    type: 'chat',
    title: 'ข้อความใหม่จากห้อง Freshy Day 💬',
    description: 'ฟ้าใส: "เค้าไปจาก SC เลิกบ่าย 3 พอดีเลย เจอกันค่า ✨"',
    time: '3 ชั่วโมงที่แล้ว',
    read: true,
    targetRoomId: 'room-freshy-1'
  }
];

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
  }
};
