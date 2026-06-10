"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import PostCard from "@/components/PostCard";
import { Spinner, EmptyState } from "@/components/ui/Common";
import { getJSON } from "@/lib/client";
import { useStore } from "@/store/useStore";
import type { PostListItem } from "@/lib/types";

export default function BookmarksPage() {
  const router = useRouter();
  const { user, authLoaded } = useStore();
  const [posts, setPosts] = useState<PostListItem[] | null>(null);

  useEffect(() => {
    if (authLoaded && !user) {
      router.push("/login");
      return;
    }
    if (user) {
      getJSON<{ posts: PostListItem[] }>("/api/bookmarks")
        .then((d) => setPosts(d.posts))
        .catch(() => setPosts([]));
    }
  }, [user, authLoaded, router]);

  if (!authLoaded || (user && posts === null)) return <Spinner className="py-20" />;
  if (!user) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <Bookmark className="h-6 w-6 text-brand-600" />
        <h1 className="text-2xl font-extrabold">Bookmarks</h1>
      </div>
      {posts && posts.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Tap the bookmark icon on any post to save it here."
          icon={<Bookmark className="h-8 w-8" />}
        />
      ) : (
        <div className="space-y-3">
          {posts?.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
