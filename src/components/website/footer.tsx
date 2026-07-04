export function WebsiteFooter() {
  return (
    <footer className="mt-16 border-t border-border/60 bg-card/50">
      <div className="container mx-auto px-4 py-8 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ClipFlow. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
