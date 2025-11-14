import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Music, Sparkles, TrendingUp, Users } from "lucide-react";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      {/* Hero Section */}
      <section className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-spotify-green/20 via-background to-background" />
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary">
              <Sparkles className="w-4 h-4" />
              <span>Built for Apify $1M Challenge</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
              AI-Powered Music
              <br />
              <span className="text-primary">Playlist Generator</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Create personalized music playlists using advanced AI and Apify Actors. 
              Describe your mood, select genres, and let our AI curate the perfect soundtrack.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg shadow-glow">
                <Link to="/generator">
                  <Music className="w-5 h-5 mr-2" />
                  Start Creating
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link to="/contact">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Apify Playlist AI?
            </h2>
            <p className="text-lg text-muted-foreground">
              Powered by Apify Actors and cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="glass-effect hover:shadow-glow transition-smooth">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">AI-Powered</h3>
                <p className="text-muted-foreground">
                  Advanced AI algorithms analyze your preferences to create perfect playlists
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect hover:shadow-glow transition-smooth">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Apify Integration</h3>
                <p className="text-muted-foreground">
                  Leverages Apify Actors to scrape and analyze music data from multiple sources
                </p>
              </CardContent>
            </Card>

            <Card className="glass-effect hover:shadow-glow transition-smooth">
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Personalized</h3>
                <p className="text-muted-foreground">
                  Save your playlists, track your history, and discover new music tailored to you
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="glass-effect bg-gradient-hero max-w-4xl mx-auto">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                Ready to Create Your Perfect Playlist?
              </h2>
              <p className="text-xl text-white/90">
                Join thousands of music lovers using AI to discover their next favorite songs
              </p>
              <Button asChild size="lg" variant="secondary" className="text-lg">
                <Link to="/generator">
                  <Music className="w-5 h-5 mr-2" />
                  Get Started Now
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
}