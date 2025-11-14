import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Github, Twitter, Linkedin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Get in Touch</h1>
            <p className="text-lg text-muted-foreground">
              Have questions or feedback? We'd love to hear from you!
            </p>
          </div>

          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>
                Reach out to us through any of these channels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border hover:border-primary transition-smooth">
                <Mail className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <a
                    href="mailto:contact@apifyplaylist.com"
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    contact@apifyplaylist.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border hover:border-primary transition-smooth">
                <Github className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">GitHub</h3>
                  <a
                    href="https://github.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    github.com/apifyplaylist
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border hover:border-primary transition-smooth">
                <Twitter className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">Twitter</h3>
                  <a
                    href="https://twitter.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    @apifyplaylist
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg bg-card/50 border border-border hover:border-primary transition-smooth">
                <Linkedin className="w-6 h-6 text-primary" />
                <div>
                  <h3 className="font-semibold text-foreground">LinkedIn</h3>
                  <a
                    href="https://linkedin.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-smooth"
                  >
                    linkedin.com/company/apifyplaylist
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect bg-gradient-hero">
            <CardContent className="p-6 text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">About This Project</h2>
              <p className="text-white/90">
                This project was created for the Apify $1M Challenge. We're building an
                AI-powered music playlist generator that uses Apify Actors to scrape and
                analyze music data from various sources.
              </p>
              <a
                href="https://apify.com/challenge"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-white font-semibold hover:underline"
              >
                Learn more about the Apify Challenge →
              </a>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}