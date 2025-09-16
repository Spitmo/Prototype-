export default function BackgroundAnimation() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-gradient-wellness absolute inset-0 opacity-5" />
      <div className="absolute inset-0">
        <div className="animate-float absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
        <div
          className="animate-float absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="animate-float absolute bottom-20 left-1/3 w-40 h-40 bg-accent/10 rounded-full blur-xl"
          style={{ animationDelay: "4s" }}
        />
      </div>
    </div>
  )
}
