export type TabKey = 'home' | 'about' | 'achievements' | 'hobbies' | 'works';

export interface ProjectItem {
  id: string;
  title: string;
  subtitle: string;
  category: '二次元社区' | '泛娱乐声音' | '智慧文旅' | 'AI编程全栈' | 'OTA平台' | 'WorkBuddy & DeepSeek';
  categoryEn: 'ACG Community' | 'Audio & Voice' | 'Cultural Tourism' | 'AI & Engineering' | 'OTA Platform' | 'AI Native · Gemini';
  year: string;
  client: string;
  role: string;
  image: string;
  gallery?: string[];
  video?: string;
  /** 视频封面构图：fill=铺满裁剪（默认），portrait=3:4 竖版裁剪居中 + 同视频模糊衬底 */
  videoFrame?: 'fill' | 'portrait';
  /** 竖版视频未开始播放时显示的封面图 */
  videoPoster?: string;
  summary: string;
  metrics: { label: string; value: string }[];
  tags: string[];
  description: string;
  challenge: string;
  solution: string;
  technologies: string[];
  featured?: boolean;
  track?: 'acg' | 'audio' | 'ota';
  period?: string;
  sideBadge?: string;
  sop?: string;
  hideModalFooter?: boolean;
  activityUrl?: string;
  activityLabel?: string;
  links?: { label: string; url: string }[];
}

export interface ServiceItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  iconType: 'web' | 'mobile' | 'product';
  deliverables: string[];
  badgeText: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  isFeatured?: boolean;
  slug: string;
  content: string;
}

export interface MilestoneItem {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  year?: string;
  stat?: string;
}

export interface AestheticColorGroup {
  name: string;
  englishName: string;
  colors: { hex: string; name: string }[];
  description: string;
  isRecommended: boolean;
}

export interface HobbyItem {
  id: string;
  title: string;
  englishTitle: string;
  badgeTitle?: string;
  tagline: string;
  image: string;
  category: string;
  specs: { label: string; value: string }[];
  description: string;
  details: string[];
}
