import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Music, Sparkles, Search, Save, Eye, EyeOff, ExternalLink, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { spotifyService } from "@/services/spotifyService";
import { spotifyServiceNew } from "@/services/spotifyServiceNew";
import { spotifyServiceBackend } from "@/services/spotifyServiceBackend";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const GENRES = ["pop", "rock", "hip-hop", "electronic", "jazz", "classical", "country", "indie", "R&B", "metal"];
const MOODS = ["happy", "sad", "energetic", "calm", "romantic", "angry", "peaceful", "excited", "melancholic"];
const ACTIVITIES = ["workout", "study", "party", "sleep", "relax", "focus", "drive", "dance", "morning", "night"];

const Generator = () => {
  const [description, setDescription] = useState("");
  const [playlistTitle, setPlaylistTitle] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [trackCount, setTrackCount] = useState([20]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tracks, setTracks] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Spotify credentials state
  const [clientId, setClientId] = useState(() => {
    return localStorage.getItem('spotify_client_id') || 
           import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
  });
  const [clientSecret, setClientSecret] = useState(() => {
    return localStorage.getItem('spotify_client_secret') || 
           import.meta.env.VITE_SPOTIFY_CLIENT_SECRET || '';
  });
  const [refreshToken, setRefreshToken] = useState(() => {
    return localStorage.getItem('spotify_refresh_token') || 
           import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN || '';
  });
  const [credentialsSaved, setCredentialsSaved] = useState(() => {
    const hasStored = !!localStorage.getItem('spotify_client_id') && 
      !!localStorage.getItem('spotify_client_secret') && 
      !!localStorage.getItem('spotify_refresh_token');
    const hasEnv = !!import.meta.env.VITE_SPOTIFY_CLIENT_ID && 
      !!import.meta.env.VITE_SPOTIFY_CLIENT_SECRET && 
      !!import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN;
    return hasStored || hasEnv;
  });
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showRefreshToken, setShowRefreshToken] = useState(false);

  // Auto-save credentials from env vars on mount
  useEffect(() => {
    const envClientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const envClientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
    const envRefreshToken = import.meta.env.VITE_SPOTIFY_REFRESH_TOKEN;
    
    console.log('🔍 Environment variables check:', {
      hasEnvClientId: !!envClientId,
      hasEnvClientSecret: !!envClientSecret,
      hasEnvRefreshToken: !!envRefreshToken,
      envClientId: envClientId,
      envClientIdLength: envClientId?.length,
    });
    
    if (envClientId && envClientSecret && envRefreshToken) {
      localStorage.setItem('spotify_client_id', envClientId);
      localStorage.setItem('spotify_client_secret', envClientSecret);
      localStorage.setItem('spotify_refresh_token', envRefreshToken);
      setClientId(envClientId);
      setClientSecret(envClientSecret);
      setRefreshToken(envRefreshToken);
      setCredentialsSaved(true);
      console.log('✅ Credentials loaded and saved from environment variables');
    } else {
      console.warn('⚠️ Some credentials missing from environment');
    }
  }, []);

  // Auto-test functionality
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('test') === 'true' && credentialsSaved && clientId && clientSecret && refreshToken) {
      console.log('🧪 Auto-testing playlist generation...');
      setTimeout(() => {
        // Set some test data
        setSelectedGenres(['pop', 'rock', 'electronic']);
        setSelectedMoods(['happy', 'energetic']);
        setSelectedActivities(['workout']);
        setDescription('An energetic workout playlist with pop and rock music');
        
        // Trigger generation after a short delay
        setTimeout(() => {
          console.log('🧪 Triggering auto-generation...');
          console.log('🧪 Credentials state:', {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            hasRefreshToken: !!refreshToken,
            credentialsSaved,
          });
          generatePlaylist();
        }, 1000);
      }, 1000);
    }
  }, [credentialsSaved, clientId, clientSecret, refreshToken]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleSelection = (item: string, list: string[], setList: (list: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const saveCredentials = () => {
    if (!clientId || !clientSecret || !refreshToken) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all credential fields",
        variant: "destructive",
      });
      return;
    }
    
    localStorage.setItem('spotify_client_id', clientId);
    localStorage.setItem('spotify_client_secret', clientSecret);
    localStorage.setItem('spotify_refresh_token', refreshToken);
    setCredentialsSaved(true);
    
    toast({
      title: "✅ Credentials Saved",
      description: "You're ready to generate playlists!",
    });
  };

  const generatePlaylist = async () => {
    // Check credentials first
    if (!credentialsSaved || !clientId || !clientSecret || !refreshToken) {
      const error = "Please save your Spotify credentials first";
      setErrorMessage(error);
      toast({
        title: "❌ Credentials Required",
        description: error,
        variant: "destructive",
      });
      return;
    }

    if (!description && selectedGenres.length === 0) {
      const error = "Please describe your playlist or select at least one genre";
      setErrorMessage(error);
      toast({
        title: "Missing information",
        description: error,
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setErrorMessage(""); // Clear previous errors
    try {
      console.log("🎵 Generating playlist...", {
        description,
        genres: selectedGenres,
        moods: selectedMoods,
        activities: selectedActivities,
        trackCount: trackCount[0]
      });

      const tracks = await spotifyServiceBackend.generatePlaylist(
        {
          clientId,
          clientSecret,
          refreshToken,
        },
        selectedGenres,
        selectedMoods,
        selectedActivities,
        trackCount[0]
      );

      console.log("✅ Generated playlist with", tracks.length, "tracks");

      setTracks(tracks);
      toast({
        title: "✅ Playlist generated!",
        description: `Found ${tracks.length} tracks for you`,
      });
    } catch (error: any) {
      console.error("❌ Error generating playlist:", error);
      
      // Create detailed error message
      let errorMessage = error.message || "Failed to generate playlist. Please check your credentials and try again.";
      let errorDetails = '';
      
      if (error.details) {
        errorDetails = typeof error.details === 'string' ? error.details : JSON.stringify(error.details, null, 2);
      }
      
      // Full error for display
      const fullError = `❌ Error: ${errorMessage}\n\nDetails:\n${errorDetails || 'No additional details'}\n\nStack:\n${error.stack || 'No stack trace'}`;
      
      // Set error message for display
      setErrorMessage(fullError);
      
      // Log to console for debugging
      console.error("Full error object:", error);
      console.error("Error message:", errorMessage);
      if (errorDetails) console.error("Error details:", errorDetails);
      console.log('\n\n📋 COPYABLE ERROR:\n' + fullError + '\n\n');
      
      // Show toast
      toast({
        title: "❌ Generation failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlaylist = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save playlists",
      });
      navigate("/auth");
      return;
    }

    if (!playlistTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please give your playlist a title",
        variant: "destructive",
      });
      return;
    }

    if (tracks.length === 0) {
      toast({
        title: "No tracks",
        description: "Generate a playlist first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("playlists").insert({
        user_id: user.id,
        title: playlistTitle,
        description,
        genres: selectedGenres,
        moods: selectedMoods,
        activities: selectedActivities,
        track_count: trackCount[0],
        tracks,
        is_public: false,
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Playlist saved successfully",
      });

      setPlaylistTitle("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const saveToSpotify = async () => {
    if (!clientId || !clientSecret || !refreshToken) {
      toast({
        title: "Missing Spotify credentials",
        description: "Please configure your Spotify API credentials first",
        variant: "destructive",
      });
      return;
    }

    if (!playlistTitle.trim()) {
      toast({
        title: "Missing title",
        description: "Please give your playlist a title",
        variant: "destructive",
      });
      return;
    }

    if (tracks.length === 0) {
      toast({
        title: "No tracks",
        description: "Generate a playlist first",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      console.log('🎵 Saving playlist to Spotify...');
      
      // Create playlist on Spotify using backend (working old implementation)
      const trackUris = tracks.map(t => t.uri);
      const playlistUrl = await spotifyServiceBackend.createPlaylistOnSpotify(
        {
          clientId: clientId,
          clientSecret: clientSecret,
          refreshToken: refreshToken,
        },
        playlistTitle,
        trackUris,
        description || `Created with AI Groove Lab • ${tracks.length} tracks`
      );

      toast({
        title: "🎉 Playlist created on Spotify!",
        description: `"${playlistTitle}" with ${tracks.length} tracks`,
      });

      console.log('✅ Playlist URL:', playlistUrl);
      
      // Open the playlist in Spotify
      window.open(playlistUrl, '_blank');

    } catch (error: any) {
      console.error('❌ Error saving to Spotify:', error);
      toast({
        title: "Error saving to Spotify",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <div className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
        {/* Spotify Credentials Section */}
        <div className="max-w-3xl mx-auto mb-8 animate-fade-in">
          <Accordion type="single" collapsible defaultValue={credentialsSaved ? undefined : "credentials"}>
            <AccordionItem 
              value="credentials" 
              className={`glass-effect border-2 rounded-lg ${!credentialsSaved ? 'border-yellow-500/50' : 'border-border'}`}
            >
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-center gap-3 text-left">
                  <Key className="h-5 w-5 text-primary" />
                  <span className="font-semibold text-lg">🔑 Spotify API Setup (Required)</span>
                  {!credentialsSaved && (
                    <Badge variant="destructive" className="ml-2">Required</Badge>
                  )}
                  {credentialsSaved && (
                    <Badge className="ml-2 bg-green-500">Ready</Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4">
                  <Alert className="border-yellow-500/50 bg-yellow-500/10">
                    <AlertDescription>
                      You need Spotify Developer credentials to generate playlists. These are stored locally in your browser.
                    </AlertDescription>
                  </Alert>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open('https://developer.spotify.com/dashboard', '_blank')}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Get Your Credentials from Spotify Developer Dashboard
                  </Button>

                  <Card className="glass-effect border-border">
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Client ID</label>
                        <Input
                          type="text"
                          placeholder="Your Spotify Client ID"
                          value={clientId}
                          onChange={(e) => setClientId(e.target.value)}
                          className="bg-secondary border-border"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Client Secret</label>
                        <div className="relative">
                          <Input
                            type={showClientSecret ? "text" : "password"}
                            placeholder="Your Spotify Client Secret"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                            className="bg-secondary border-border pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowClientSecret(!showClientSecret)}
                          >
                            {showClientSecret ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Refresh Token</label>
                        <div className="relative">
                          <Input
                            type={showRefreshToken ? "text" : "password"}
                            placeholder="Your Spotify Refresh Token"
                            value={refreshToken}
                            onChange={(e) => setRefreshToken(e.target.value)}
                            className="bg-secondary border-border pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                            onClick={() => setShowRefreshToken(!showRefreshToken)}
                          >
                            {showRefreshToken ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <Button
                        onClick={saveCredentials}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save Credentials
                      </Button>

                      <div className="flex items-center justify-center gap-2 pt-2">
                        {credentialsSaved ? (
                          <Badge className="bg-green-500">✅ Credentials Ready</Badge>
                        ) : (
                          <Badge variant="destructive">❌ Credentials Required</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass-effect border-border bg-secondary/50">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 text-sm">How to get your credentials:</h3>
                      <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Visit developer.spotify.com/dashboard</li>
                        <li>Create a new app or select an existing one</li>
                        <li>Copy your Client ID and Client Secret</li>
                        <li>Follow Spotify's guide to obtain a refresh token</li>
                      </ol>
                    </CardContent>
                  </Card>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent">
            Create Your Playlist
          </h1>
          <p className="text-muted-foreground text-lg">
            Describe your vibe and let AI do the magic
          </p>
          {credentialsSaved && (
            <Button
              onClick={() => {
                setSelectedGenres(['pop', 'rock', 'electronic']);
                setSelectedMoods(['happy', 'energetic']);
                setSelectedActivities(['workout']);
                setDescription('An energetic workout playlist');
                setTimeout(() => generatePlaylist(), 500);
              }}
              variant="outline"
              className="mt-4"
            >
              🧪 Quick Test (Auto-fill & Generate)
            </Button>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card className="glass-effect border-border">
              <CardContent className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Describe Your Playlist
                  </label>
                  <Textarea
                    placeholder="e.g., 'upbeat workout music', 'chill study vibes', 'romantic dinner jazz'"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[120px] bg-secondary border-border"
                  />
                </div>

                {/* Genres */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Genres (select up to 5)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {GENRES.map((genre) => (
                      <Badge
                        key={genre}
                        variant={selectedGenres.includes(genre) ? "default" : "outline"}
                        className="cursor-pointer transition-smooth hover:scale-105"
                        onClick={() => toggleSelection(genre, selectedGenres, setSelectedGenres)}
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Moods */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Mood</label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((mood) => (
                      <Badge
                        key={mood}
                        variant={selectedMoods.includes(mood) ? "default" : "outline"}
                        className="cursor-pointer transition-smooth hover:scale-105"
                        onClick={() => toggleSelection(mood, selectedMoods, setSelectedMoods)}
                      >
                        {mood}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Activities */}
                <div>
                  <label className="text-sm font-medium mb-3 block">Activity</label>
                  <div className="flex flex-wrap gap-2">
                    {ACTIVITIES.map((activity) => (
                      <Badge
                        key={activity}
                        variant={selectedActivities.includes(activity) ? "default" : "outline"}
                        className="cursor-pointer transition-smooth hover:scale-105"
                        onClick={() => toggleSelection(activity, selectedActivities, setSelectedActivities)}
                      >
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Track Count */}
                <div>
                  <label className="text-sm font-medium mb-3 block">
                    Number of Tracks: {trackCount[0]}
                  </label>
                  <Slider
                    value={trackCount}
                    onValueChange={setTrackCount}
                    min={5}
                    max={50}
                    step={5}
                    className="w-full"
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={generatePlaylist}
                  disabled={isGenerating || !credentialsSaved}
                  className="w-full h-12 text-lg font-semibold shadow-glow"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Music className="mr-2 h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Generate Playlist
                    </>
                  )}
                </Button>
                {!credentialsSaved && (
                  <p className="text-xs text-yellow-500 text-center">
                    ⚠️ Please save your Spotify credentials above to generate playlists
                  </p>
                )}
                
                {/* Error Display */}
                {errorMessage && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>
                      <div className="space-y-2">
                        <div className="font-semibold">Error occurred:</div>
                        <pre className="text-xs bg-destructive/10 p-3 rounded overflow-x-auto whitespace-pre-wrap break-words select-all">
                          {errorMessage}
                        </pre>
                        <div className="text-xs text-muted-foreground">
                          💡 Tip: Click and drag to select the error above, then Ctrl+C to copy
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Save Playlist Section */}
                {tracks.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <label className="text-sm font-medium mb-2 block">
                        Playlist Title
                      </label>
                      <Input
                        placeholder="My Awesome Playlist"
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>
                    <Button
                      onClick={savePlaylist}
                      disabled={isSaving || !user}
                      className="w-full"
                      variant="secondary"
                    >
                      {isSaving ? (
                        <>
                          <Music className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save Playlist
                        </>
                      )}
                    </Button>
                    {!user && (
                      <p className="text-xs text-muted-foreground text-center">
                        Sign in to save your playlists
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview Section */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="glass-effect border-border h-full">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <Music className="mr-2 h-6 w-6 text-primary" />
                  Track Preview
                </h2>
                {tracks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center text-muted-foreground">
                    <Search className="h-16 w-16 mb-4 opacity-50" />
                    <p>Your generated tracks will appear here</p>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 space-y-3">
                      <Input
                        placeholder="Playlist title (e.g., My Workout Mix)"
                        value={playlistTitle}
                        onChange={(e) => setPlaylistTitle(e.target.value)}
                        className="glass-effect"
                      />
                      <Button
                        onClick={saveToSpotify}
                        disabled={isSaving || !playlistTitle.trim()}
                        className="w-full bg-spotify-green hover:bg-spotify-green/90"
                      >
                        {isSaving ? "Saving..." : "💾 Save to Spotify"}
                      </Button>
                    </div>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {tracks.map((track, index) => (
                      <Card
                        key={track.id || index}
                        className="bg-secondary/50 border-border hover:bg-secondary transition-smooth"
                      >
                        <CardContent className="p-4 flex items-center gap-4">
                          {track.albumArt && (
                            <img
                              src={track.albumArt}
                              alt={track.name}
                              className="w-16 h-16 rounded object-cover"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{track.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {track.artist}
                            </p>
                            {track.album && (
                              <p className="text-xs text-muted-foreground truncate">
                                {track.album}
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {Math.floor(track.duration / 60000)}:
                            {String(Math.floor((track.duration % 60000) / 1000)).padStart(2, "0")}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default Generator;
