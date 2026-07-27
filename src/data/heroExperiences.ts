export interface HeroExperience {
  id: string;
  quote: string;
  author: string;
  category: "Natur" | "Philosophie" | "Ganzheitliche Gesundheit" | "DIY Kosmetik" | "Ernährung" | "Frequenzen" | "Funktionelles Training";
  mediaUrl: string;
  mediaType: "video" | "image";
  audioUrl: string; // Public domain ambient sounds / nature audio
  audioLabel: string;
  accentColor: string;
}

export const HERO_EXPERIENCES: HeroExperience[] = [
  {
    id: "experience-1",
    quote: "In der Stille der Natur findest du die Melodie deines eigenen Herzens wieder.",
    author: "Hildegard von Bingen",
    category: "Natur",
    mediaUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Rain_and_birds_in_forest.ogg",
    audioLabel: "Sanftes Waldrauschen & Vogelgesang",
    accentColor: "sage",
  },
  {
    id: "experience-2",
    quote: "Du hast die Macht über deinen Geist – nicht über äußere Ereignisse. Erkenne dies, und du wirst Stärke finden.",
    author: "Marc Aurel",
    category: "Philosophie",
    mediaUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Ocean_Waves_%28surf%29.ogg",
    audioLabel: "Beruhigende Meereswellen am Abend",
    accentColor: "terracotta",
  },
  {
    id: "experience-3",
    quote: "Wahre Heilung beginnt mit der Erlaubnis, im gegenwärtigen Moment genau so zu sein, wie man ist.",
    author: "Koulners Gedanken",
    category: "Ganzheitliche Gesundheit",
    mediaUrl: "https://images.unsplash.com/photo-1518241353330-0f797f83560f?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Soft_wind_through_pines.ogg",
    audioLabel: "Weicher Wind in den Kiefern",
    accentColor: "amber",
  },
  {
    id: "experience-4",
    quote: "Was wir der Haut schenken, nährt nicht nur die Hülle, sondern streichelt die Seele.",
    author: "Alte Botaniker-Weisheit",
    category: "DIY Kosmetik",
    mediaUrl: "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Creek_in_spring.ogg",
    audioLabel: "Sanft plätschernde Bergquelle",
    accentColor: "sage",
  },
  {
    id: "experience-5",
    quote: "Das Leben ist wie eine Seifenblase: Im Licht erstrahlt sie im schönsten Glanz, verletzlich und grenzenlos frei.",
    author: "Koulners Bubble",
    category: "Philosophie",
    mediaUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/e/e4/Rain_and_birds_in_forest.ogg",
    audioLabel: "Leichter Regenschauer in der Abendsonne",
    accentColor: "terracotta",
  },
  {
    id: "experience-6",
    quote: "Lass deine Nahrung deine Medizin sein und deine Medizin deine Nahrung.",
    author: "Hippokrates",
    category: "Ernährung",
    mediaUrl: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/8/87/Creek_in_spring.ogg",
    audioLabel: "Harmonischer Morgen im Garten",
    accentColor: "amber",
  },
  {
    id: "experience-7",
    quote: "Wenn du die Geheimnisse des Universums finden willst, denke in Begriffen von Energie, Frequenz und Vibration.",
    author: "Nikola Tesla",
    category: "Frequenzen",
    mediaUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/2/29/Ocean_Waves_%28surf%29.ogg",
    audioLabel: "432 Hz Solfeggio Resonanz & Wellen",
    accentColor: "sage",
  },
  {
    id: "experience-8",
    quote: "Dein Körper ist kein Werkzeug, das du zwingen musst, sondern ein weiser Fluss, der nach natürlicher Bewegung sucht.",
    author: "Joseph Pilates",
    category: "Funktionelles Training",
    mediaUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=2000&q=85",
    mediaType: "image",
    audioUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b3/Soft_wind_through_pines.ogg",
    audioLabel: "Fließende Atem- & Bewegungsstille",
    accentColor: "terracotta",
  }
];
