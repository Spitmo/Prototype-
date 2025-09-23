"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageCircle, Heart, Trash } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { db } from "@/lib/firebase"
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  increment,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore"

// ✅ Persistent Guest ID
function getGuestId() {
  if (typeof window === "undefined") return "guest"
  let id = localStorage.getItem("guestId")
  if (!id) {
    id = "guest_" + Math.random().toString(36).slice(2, 10)
    localStorage.setItem("guestId", id)
  }
  return id
}
const guestId = getGuestId()

interface ForumPost {
  id: string
  author: string
  authorId?: string
  content: string
  createdAt: string
  tags: string[]
  likes: number
  replies: number
  likedBy: string[]
}

interface Reply {
  id: string
  author: string
  authorId?: string
  content: string
  createdAt: string
}

export default function PeerSupportForum() {
  const [posts, setPosts] = useState<ForumPost[]>([])
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({})
  const [replies, setReplies] = useState<{ [key: string]: Reply[] }>({})
  const incrementForumPosts = useAppStore((state) => state.incrementForumPosts)

  // 🔹 Load posts realtime
  useEffect(() => {
    const postsRef = query(collection(db, "forumPosts"), orderBy("createdAt", "desc"))
    const unsubPosts = onSnapshot(postsRef, (snapshot) => {
      const loaded: ForumPost[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          author: data.author ?? "Anonymous",
          authorId: data.authorId ?? "guest",
          content: data.content ?? "",
          createdAt: data.createdAt?.toDate().toLocaleString() ?? "",
          tags: data.tags ?? [],
          likes: data.likes ?? 0,
          replies: data.replies ?? 0,
          likedBy: (data.likedBy ?? []) as string[],
        }
      })
      setPosts(loaded)

      // Setup replies listeners
      loaded.forEach((post) => {
        const repliesRef = query(
          collection(db, "forumPosts", post.id, "replies"),
          orderBy("createdAt", "asc")
        )
        onSnapshot(repliesRef, (snap) => {
          const replyList = snap.docs.map((d) => {
            const data = d.data()
            return {
              id: d.id,
              author: data.author ?? "Anonymous",
              authorId: data.authorId ?? "guest",
              content: data.content ?? "",
              createdAt: data.createdAt?.toDate().toLocaleString() ?? "",
            }
          })
          setReplies((prev) => ({
            ...prev,
            [post.id]: replyList || [],
          }))
        })
      })
    })

    return () => unsubPosts()
  }, [])

  // 🔹 Create new post
  const handleCreatePost = async () => {
    if (!newPostContent.trim() || loading) return
    setLoading(true)

    try {
      await addDoc(collection(db, "forumPosts"), {
        author: "Anonymous",
        authorId: guestId,
        content: newPostContent,
        createdAt: serverTimestamp(),
        tags: ["New"],
        likes: 0,
        replies: 0,
        likedBy: [],
      })

      setNewPostContent("")
      setShowCreatePost(false)
      incrementForumPosts()
    } catch (error) {
      console.error("❌ Error adding post:", error)
      alert("Failed to post. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // 🔹 Like / Unlike
  const handleToggleLike = async (post: ForumPost) => {
    const postRef = doc(db, "forumPosts", post.id)
    const alreadyLiked = (post.likedBy || []).includes(guestId)

    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === post.id
          ? {
              ...p,
              likes: p.likes + (alreadyLiked ? -1 : 1),
              likedBy: alreadyLiked
                ? p.likedBy.filter((id) => id !== guestId)
                : [...p.likedBy, guestId],
            }
          : p
      )
    )

    await updateDoc(postRef, {
      likes: increment(alreadyLiked ? -1 : 1),
      likedBy: alreadyLiked ? arrayRemove(guestId) : arrayUnion(guestId),
    })
  }

  // 🔹 Add reply
  const handleAddReply = async (postId: string) => {
    const replyText = replyInputs[postId]?.trim()
    if (!replyText) return

    try {
      await addDoc(collection(db, "forumPosts", postId, "replies"), {
        author: "Anonymous",
        authorId: guestId,
        content: replyText,
        createdAt: serverTimestamp(),
      })

      setReplyInputs((prev) => ({ ...prev, [postId]: "" }))
    } catch (err) {
      console.error("❌ Error adding reply:", err)
    }
  }

  // 🔹 Delete reply
  const handleDeleteReply = async (postId: string, replyId: string) => {
    try {
      await deleteDoc(doc(db, "forumPosts", postId, "replies", replyId))
    } catch (err) {
      console.error("❌ Error deleting reply:", err)
    }
  }

  return (
    <section id="peer-support" className="py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-block rounded-2xl p-[3px] bg-gradient-to-r from-orange-500 via-white to-green-500">
          <div className="bg-white rounded-xl px-10 py-5">
            <h2 className="text-3xl font-bold text-black">Peer Support Community</h2>
          </div>
        </div>
        <p className="text-muted-foreground text-lg mt-4">
          Connect with fellow students in a safe, moderated environment
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Create Post */}
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
                  <Button onClick={handleCreatePost} disabled={!newPostContent.trim() || loading}>
                    {loading ? "Posting..." : "Post Anonymously"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreatePost(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => {
            const isLiked = (post.likedBy || []).includes(guestId)
            const postReplies = replies[post.id] || []

            return (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <span className="font-medium text-primary">{post.author}</span>
                    <span className="text-muted-foreground text-sm ml-2">{post.createdAt}</span>
                  </div>

                  <p className="text-foreground mb-4">{post.content}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Like button */}
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <button
                      onClick={() => handleToggleLike(post)}
                      className="flex items-center space-x-1 hover:text-primary transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${isLiked ? "fill-black text-black" : ""}`} />
                      <span>{post.likes}</span>
                    </button>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Replies */}
                  <div className="space-y-2 mb-4">
                    {postReplies.map((reply) => (
                      <div key={reply.id} className="pl-4 border-l text-sm flex justify-between">
                        <div>
                          <span className="font-medium">{reply.author}</span>{" "}
                          <span className="text-muted-foreground text-xs">{reply.createdAt}</span>
                          <p>{reply.content}</p>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteReply(post.id, reply.id)}
                        >
                          <Trash className="w-3 h-3 text-red-500" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Reply input */}
                  <div className="flex space-x-2">
                    <Textarea
                      placeholder="Write a reply... (Enter to send, Shift+Enter for new line)"
                      value={replyInputs[post.id] || ""}
                      onChange={(e) =>
                        setReplyInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleAddReply(post.id)
                        }
                      }}
                      className="min-h-12 flex-1"
                    />
                    <Button onClick={() => handleAddReply(post.id)}>Reply</Button>
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
