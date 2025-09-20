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
  likedBy: string[] // ✅ users who liked
}

export default function PeerSupportForum() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const incrementForumPosts = useAppStore((state) => state.incrementForumPosts)
  const router = useRouter()

  // ✅ Realtime listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "forumPosts"), (snapshot) => {
      const loaded: ForumPost[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      })) as ForumPost[]
      setPosts(loaded)
    })
    return () => unsub()
  }, [])

  // ✅ Create new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return

    await addDoc(collection(db, "forumPosts"), {
      author: "You (Anonymous)",
      content: newPostContent,
      timestamp: new Date().toLocaleString(),
      tags: ["New"],
      likes: 0,
      replies: 0,
      likedBy: [],
    })

    setNewPostContent("")
    setShowCreatePost(false)
    incrementForumPosts()
  }

  // ✅ Like / Unlike
  const handleToggleLike = async (post: ForumPost) => {
    const userId = auth.currentUser?.uid
    if (!userId) {
      router.push("/login") // ⬅️ redirect to login if not logged in
      return
    }

    const postRef = doc(db, "forumPosts", post.id)

    if (post.likedBy.includes(userId)) {
      // 👎 Unlike
      await updateDoc(postRef, {
        likes: increment(-1),
        likedBy: arrayRemove(userId),
      })
    } else {
      // 👍 Like
      await updateDoc(postRef, {
        likes: increment(1),
        likedBy: arrayUnion(userId),
      })
    }
  }

  return (
    <section id="forum" className="py-16">
      <div className="text-center mb-12">
        <div className="relative inline-block p-4 mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-white to-green-600 p-0.5 rounded-lg">
            <div className="bg-white rounded-lg h-full w-full"></div>
          </div>
          <div className="relative">
            <h2 className="text-3xl font-bold text-black">Peer Support Community</h2>
          </div>
        </div>
        <p className="text-muted-foreground text-lg">
          Connect with fellow students in a safe, moderated environment
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* ✅ Create Post */}
        <div className="mb-8">
          {!showCreatePost ? (
            <Button onClick={() => setShowCreatePost(true)} className="w-full md:w-auto">
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
                  <Button onClick={handleCreatePost} disabled={!newPostContent.trim()}>
                    Post Anonymously
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ✅ Posts List */}
        <div className="space-y-6">
          {posts.map((post) => {
            const userId = auth.currentUser?.uid
            const isLiked = userId ? post.likedBy.includes(userId) : false

            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-medium text-primary">{post.author}</span>
                      <span className="text-muted-foreground text-sm ml-2">{post.timestamp}</span>
                    </div>
                  </div>

                  <p className="text-foreground mb-4 text-pretty">{post.content}</p>

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
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-black text-black" : ""}`} />
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
