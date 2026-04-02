import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Video } from "@shared/schema";
import { Play, Clock, Filter, ExternalLink, X } from "lucide-react";

const CATEGORIES = ["All", "Meditation", "Breathing", "Yoga", "Relaxation", "Ambient", "Education", "Sleep", "Crisis Support", "Routine", "ASMR"];

function getStressRangeColor(min: number, max: number): { badge: string; text: string } {
  const avg = (min + max) / 2;
  if (avg <= 3) return { badge: "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800", text: "Low Stress" };
  if (avg <= 6) return { badge: "bg-yellow-50 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800", text: "Moderate" };
  return { badge: "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800", text: "High Stress" };
};

function VideoCard({ video, onPlay }: { video: Video; onPlay: (video: Video) => void }) {
  const stressInfo = getStressRangeColor(video.minStressLevel, video.maxStressLevel);

  return (
    <Card
      data-testid={`video-card-${video.id}`}
      className="overflow-visible group"
    >
      <CardContent className="p-0">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.id}/320/180`;
            }}
          />
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              data-testid={`play-video-${video.id}`}
              onClick={() => onPlay(video)}
              className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
            >
              <Play className="w-5 h-5 text-foreground ml-0.5" fill="currentColor" />
            </button>
          </div>
          {/* Duration badge */}
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-0.5 rounded-md">
            {video.durationMinutes}:00
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-foreground leading-tight mb-1 line-clamp-2">
            {video.title}
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
            {video.description}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-xs">{video.category}</Badge>
            <div className={`text-xs px-2 py-0.5 rounded-md border ${stressInfo.badge}`}>
              {stressInfo.text}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
              <Clock className="w-3 h-3" />
              <span>{video.durationMinutes} min</span>
            </div>
          </div>

          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-3"
            data-testid={`button-watch-${video.id}`}
            onClick={() => onPlay(video)}
          >
            <Play className="w-3 h-3 mr-2" fill="currentColor" />
            Watch Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function VideoModal({ video, onClose }: { video: Video | null; onClose: () => void }) {
  if (!video) return null;

  return (
    <Dialog open={!!video} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full p-0" data-testid="video-modal">
        <DialogHeader className="px-5 pt-5 pb-0">
          <div className="flex items-start justify-between gap-3 pr-8">
            <DialogTitle className="text-base leading-tight">{video.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="aspect-video w-full bg-black mt-3">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="px-5 py-4">
          <p className="text-sm text-muted-foreground leading-relaxed mb-3">{video.description}</p>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{video.category}</Badge>
            <div className={`text-xs px-2 py-0.5 rounded-md border ${getStressRangeColor(video.minStressLevel, video.maxStressLevel).badge}`}>
              Stress Level {video.minStressLevel}–{video.maxStressLevel}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{video.durationMinutes} min</span>
            </div>
            <a
              href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-muted-foreground ml-auto"
              data-testid="link-youtube"
            >
              <ExternalLink className="w-3 h-3" />
              Open on YouTube
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function Videos() {
  const [filterLevel, setFilterLevel] = useState<number[]>([5]);
  const [useFilter, setUseFilter] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  const { data: allVideos = [], isLoading } = useQuery<Video[]>({
    queryKey: ["/api/videos"],
  });

  const filteredVideos = allVideos.filter(video => {
    const levelMatch = !useFilter || (filterLevel[0] >= video.minStressLevel && filterLevel[0] <= video.maxStressLevel);
    const catMatch = selectedCategory === "All" || video.category === selectedCategory;
    return levelMatch && catMatch;
  });

  const stressLevelLabel = filterLevel[0] <= 3 ? "Low" : filterLevel[0] <= 6 ? "Moderate" : filterLevel[0] <= 8 ? "High" : "Very High";

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="px-6 py-6 pb-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Video Library</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Guided content curated for your stress level</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Filter by Stress Level</Label>
                  <Button
                    variant={useFilter ? "default" : "secondary"}
                    size="sm"
                    data-testid="button-toggle-video-filter"
                    onClick={() => setUseFilter(!useFilter)}
                  >
                    <Filter className="w-3 h-3 mr-1.5" />
                    {useFilter ? `Level ${filterLevel[0]} (${stressLevelLabel})` : "All Levels"}
                  </Button>
                </div>
                {useFilter && (
                  <div className="space-y-2">
                    <Slider
                      data-testid="slider-video-filter-level"
                      min={1}
                      max={10}
                      step={1}
                      value={filterLevel}
                      onValueChange={setFilterLevel}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 — Very Calm</span>
                      <span>10 — Overwhelmed</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    data-testid={`filter-video-cat-${cat}`}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                      selectedCategory === cat
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-muted border-border text-muted-foreground hover-elevate"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredVideos.length} video{filteredVideos.length !== 1 ? "s" : ""} available
          </p>
        </div>
      </div>

      <div className="px-6 pb-6">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="animate-pulse overflow-hidden">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Filter className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">No videos match your filters</p>
            <p className="text-muted-foreground text-sm">Try adjusting the stress level or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredVideos.map(video => (
              <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
            ))}
          </div>
        )}
      </div>

      <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
    </div>
  );
}
