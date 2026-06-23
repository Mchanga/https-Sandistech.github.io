export type Role = "guest" | "user" | "admin";
export type PostType = "news" | "business" | "event";

export interface SafeUser {
  id: number;
  fullName: string;
  email: string;
  role: Role;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
}

export interface PostListItem {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  category: string;
  type: PostType;
  views: number;
  likes: number;
  commentsCount: number;
  rating?: number;
  ratingCount?: number;
  featured?: boolean;
  status?: string;
  createdAt: string;
  authorName: string | null;
  authorAvatar: string | null;
}

export interface PostDetail extends PostListItem {
  content: string;
  authorId: number;
  allowComments?: boolean;
  subCategory?: string | null;
  tags?: string | null;
}

export interface ReviewItem {
  id: number;
  rating: number;
  comment: string | null;
  createdAt: string;
  userId: number;
  userName: string | null;
  userAvatar: string | null;
}

export interface CommentItem {
  id: number;
  comment: string;
  createdAt: string;
  userId: number;
  userName: string | null;
  userAvatar: string | null;
}

export interface Business {
  id: number;
  name: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  category: string;
  imageUrl: string | null;
  logo: string | null;
  rating: number;
  reviews: number;
}

export interface EventItem {
  id: number;
  title: string;
  description: string | null;
  location: string | null;
  organizer: string | null;
  startDate: string;
  endDate: string | null;
  category: string;
  imageUrl: string | null;
  rsvpCount?: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  content: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface ChatRoom {
  id: number;
  name: string;
  description: string | null;
}

export interface ChatMessageItem {
  id: number;
  roomId: number;
  message: string;
  createdAt: string;
  userId: number;
  userName: string | null;
  userAvatar: string | null;
}
