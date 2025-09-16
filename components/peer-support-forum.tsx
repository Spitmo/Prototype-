"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, MessageCircle, Heart } from "lucide-react"
import { useAppStore } from "@/lib/store"

interface ForumPost {
  id: string
  author: string
  content: string
  timestamp: string
  tags: string[]
  likes: number
  replies: number
}

const initialPosts: ForumPost[] = [
  {
    id: "1",
    author: "Anonymous Student",
    content:
      "Feeling overwhelmed with semester exams. Found some peace through the meditation videos here. Anyone else dealing with exam stress?",
    timestamp: "2 hours ago",
    tags: ["Exam Stress", "Support"],
    likes: 12,
    replies: 5,
  },
  {
    id: "2",
    author: "Peer Volunteer - Raj",
    content:
      "Remember, it's okay to take breaks. Your mental health is as important as your grades. Here if anyone needs to talk! 💙",
    timestamp: "5 hours ago",
    tags: ["Encouragement", "Self-Care"],
    likes: 28,
    replies: 8,
  },
  {
    id: "3",
    author: "Anonymous Student",
    content:
      "First time reaching out. The loneliness in hostel is getting to me. How do you all cope with homesickness?",
    timestamp: "1 day ago",
    tags: ["Homesickness", "First Year"],
    likes: 15,
    replies: 12,
  },
  {
    id: "4",
    author: "Study Buddy - Priya",
    content:
      "Started a study group for anyone dealing with academic anxiety. We meet every Tuesday at 4 PM in the library. All welcome!",
    timestamp: "2 days ago",
    tags: ["Study Group", "Academic Support"],
    likes: 22,
    replies: 7,
  },
]

export default function PeerSupportForum() {
  const [posts, setPosts] = useState<ForumPost[]>(initialPosts)
  const [showCreatePost, setShowCreatePost] = useState(false)
  const [newPostContent, setNewPostContent] = useState("")

  const incrementForumPosts = useAppStore((state) => state.incrementForumPosts)

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return

    const newPost: ForumPost = {
      id: Date.now().toString(),
      author: "You (Anonymous)",
      content: newPostContent,
      timestamp: "Just now",
      tags: ["New"],
      likes: 0,
      replies: 0,
    }

    setPosts([newPost, ...posts])
    setNewPostContent("")
    setShowCreatePost(false)
    incrementForumPosts()
  }

  const handleLikePost = (postId: string) => {
    setPosts(posts.map((post) => (post.id === postId ? { ...post, likes: post.likes + 1 } : post)))
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
        <p className="text-muted-foreground text-lg">Connect with fellow students in a safe, moderated environment</p>
      </div>

      <div className="max-w-4xl mx-auto">
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

        <div className="space-y-6">
          {posts.map((post) => (
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
                    onClick={() => handleLikePost(post.id)}
                    className="flex items-center space-x-1 hover:text-primary transition-colors"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{post.likes}</span>
                  </button>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post.replies} replies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
