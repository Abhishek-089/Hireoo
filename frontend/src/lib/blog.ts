import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

const BLOG_DIR = path.join(process.cwd(), "content/blog")

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  author: string
  readTime: string
  category: string
  tags: string[]
  coverImage?: string
  content: string
}

export interface BlogPostMeta extends Omit<BlogPost, "content"> {}

function ensureBlogDir() {
  if (!fs.existsSync(BLOG_DIR)) {
    fs.mkdirSync(BLOG_DIR, { recursive: true })
  }
}

export function getAllPostSlugs(): string[] {
  ensureBlogDir()
  return fs
    .readdirSync(BLOG_DIR)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => file.replace(/\.(md|mdx)$/, ""))
}

export function getAllPostsMeta(): BlogPostMeta[] {
  ensureBlogDir()
  const slugs = getAllPostSlugs()

  const posts = slugs
    .map((slug) => {
      const filePath = path.join(BLOG_DIR, `${slug}.md`)
      const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`)
      const fullPath = fs.existsSync(filePath) ? filePath : mdxPath

      if (!fs.existsSync(fullPath)) return null

      const raw = fs.readFileSync(fullPath, "utf-8")
      const { data } = matter(raw)

      return {
        slug: data.slug || slug,
        title: data.title || "",
        description: data.description || "",
        date: data.date || "",
        author: data.author || "Hireoo Team",
        readTime: data.readTime || "5 min read",
        category: data.category || "General",
        tags: data.tags || [],
        coverImage: data.coverImage || null,
      } as BlogPostMeta
    })
    .filter(Boolean) as BlogPostMeta[]

  // Sort by date descending (newest first)
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  ensureBlogDir()

  const filePath = path.join(BLOG_DIR, `${slug}.md`)
  const mdxPath = path.join(BLOG_DIR, `${slug}.mdx`)
  const fullPath = fs.existsSync(filePath) ? filePath : mdxPath

  if (!fs.existsSync(fullPath)) return null

  const raw = fs.readFileSync(fullPath, "utf-8")
  const { data, content: rawContent } = matter(raw)

  const processed = await remark().use(html, { sanitize: false }).process(rawContent)
  const content = processed.toString()

  return {
    slug: data.slug || slug,
    title: data.title || "",
    description: data.description || "",
    date: data.date || "",
    author: data.author || "Hireoo Team",
    readTime: data.readTime || "5 min read",
    category: data.category || "General",
    tags: data.tags || [],
    coverImage: data.coverImage || null,
    content,
  }
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}
