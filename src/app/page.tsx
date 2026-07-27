import { getAllPosts, getAllCategories } from "@/lib/content";
import HomeClient from "@/components/HomeClient";

export default function Home() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  return <HomeClient initialPosts={posts} categories={categories} />;
}
