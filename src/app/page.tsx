import { getAllPosts, getAllCategories } from "@/lib/content";
import HomeClient from "@/components/HomeClient";
import fs from "fs";
import path from "path";

export default function Home() {
  const posts = getAllPosts();
  const categories = getAllCategories();

  let heroEntries = [];
  try {
    const filePath = path.join(process.cwd(), "content", "hero-content.json");
    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, "utf8");
      heroEntries = JSON.parse(fileContents);
    }
  } catch (error) {
    console.error("Error reading hero-content.json:", error);
  }

  // Fallback if empty
  if (heroEntries.length === 0) {
    heroEntries = [
      {
        id: "fallback",
        imageSrc: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=85",
        quote: "In der Stille der Natur findest du die Melodie deines eigenen Herzens wieder.",
        author: "Hildegard von Bingen",
        altText: "Natur Fallback"
      }
    ];
  }

  let sounds = [];
  try {
    const soundsPath = path.join(process.cwd(), "content", "sounds.json");
    if (fs.existsSync(soundsPath)) {
      sounds = JSON.parse(fs.readFileSync(soundsPath, "utf8"));
    }
  } catch (error) {
    console.error("Error reading sounds.json:", error);
  }

  if (sounds.length === 0) {
    sounds = [
      {
        id: "sound-fallback",
        title: "Ambient Fallback",
        type: "nature",
        url: "https://cdn.pixabay.com/audio/2022/10/25/audio_2e2edc41b8.mp3",
        moods: ["Relax"]
      }
    ];
  }

  let bubbleConfig = { requiredPopsForMode: 5 };
  try {
    const bubbleConfigPath = path.join(process.cwd(), "content", "bubble-config.json");
    if (fs.existsSync(bubbleConfigPath)) {
      bubbleConfig = JSON.parse(fs.readFileSync(bubbleConfigPath, "utf8"));
    }
  } catch (error) {
    console.error("Error reading bubble-config.json:", error);
  }

  return <HomeClient initialPosts={posts} categories={categories} heroEntries={heroEntries} sounds={sounds} bubbleConfig={bubbleConfig} />;
}
