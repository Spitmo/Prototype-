"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageCircle, Heart } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { db, auth } from "@/lib/firebase"
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
} from "firebase/firestore"
import { useRouter } from "next/navigation"

interface ForumPost {
  id: string
  author: string
  content: string
  timestamp: string
  tags: string[]
  likes: number
  replies: number
  likedBy: string[]
}

export default function PeerSupportForum() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const incrementForumPosts = useAppStore((state) => state.incrementForumPosts)
  const router = useRouter()

  // 🔹 Realtime listener (fixed unsub crash)
  useEffect(() => {
    let unsub: (() => void) | null = null

    try {
      unsub = onSnapshot(collection(db, "forumPosts"), (snapshot) => {
        const loaded: ForumPost[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data()
          return {
            id: docSnap.id,
            author: data.author ?? "Anonymous",
            content: data.content ?? "",
            timestamp: data.timestamp?.toDate().toLocaleString() ?? "",
            tags: data.tags ?? [],
            likes: data.likes ?? 0,
            replies: data.replies ?? 0,
            likedBy: data.likedBy ?? [],
          }
        })
        setPosts(loaded)
      })
    } catch (error) {
      console.error("❌ Firestore listener error:", error)
    }

    return () => {
      if (unsub) unsub()
    }
  }, [])

  // 🔹 Create new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    await addDoc(collection(db, "forumPosts"), {
      author: "You (Anonymous)",
      content: newPostContent,
      timestamp: serverTimestamp(),
      tags: ["New"],
      likes: 0,
      replies: 0,
      likedBy: [],
    })

    setNewPostContent("")
    setShowCreatePost(false)
    incrementForumPosts()
  }

  // 🔹 Like / Unlike
  const handleToggleLike = async (post: ForumPost) => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      router.push("/login")
      return
    }

    const postRef = doc(db, "forumPosts", post.id)

    if (post.likedBy.includes(userId)) {
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      })
    } else {
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      })
    }
  }

  return (
    <section id="peer-support" className="py-16">
      {/* 🔹 Section Header */}
      <div className="text-center mb-12">
        <div className="inline-block rounded-2xl p-[3px] bg-gradient-to-r from-orange-500 via-white to-green-500">
          <div className="bg-white rounded-xl px-10 py-5">
            <h2 className="text-3xl font-bold text-black">
              Peer Support Community
            </h2>
          </div>
        </div>
        <p className="text-muted-foreground text-lg mt-4">
          Connect with fellow students in a safe, moderated environment
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* 🔹 Create Post */}
        <div className="mb-8 flex justify-end">
          {!showCreatePost ? (
            <Button onClick={() => setShowCreatePost(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Share Your Story
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Share Your Thoughts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Share your thoughts, experiences, or ask for support. You can post anonymously."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="min-h-24"
                />
                <div className="flex space-x-2">
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPostContent.trim()}
                  >
                    Post Anonymously
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* 🔹 Posts List */}
        <div className="space-y-6">
          {posts.map((post) => {
            const userId = auth.currentUser?.uid
            const isLiked = userId ? post.likedBy.includes(userId) : false

            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-medium text-primary">
                        {post.author}
                      </span>
                      <span className="text-muted-foreground text-sm ml-2">
                        {post.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-foreground mb-4 text-pretty">
                    {post.content}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isLiked ? "fill-black text-black" : ""
                        }`}
                      />
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.replies} replies</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
