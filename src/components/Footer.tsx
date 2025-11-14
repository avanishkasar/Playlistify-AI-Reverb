import { Link } from "react-router-dom";
import { Music, Mail, AlertCircle, Github } from "lucide-react";

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-bold text-primary">
              <Music className="w-5 h-5" />
              <span>Apify Playlist AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              AI-powered music playlist generator built for the Apify $1M Challenge
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-primary transition-smooth">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/generator" className="text-muted-foreground hover:text-primary transition-smooth">
                  Generator
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-primary transition-smooth">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/report-issue" className="text-muted-foreground hover:text-primary transition-smooth flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Report Issue
                </Link>
              </li>
              <li>
                <a
                  href="https://apify.com/challenge"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-smooth"
                >
                  Apify Challenge
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-smooth">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Apify Playlist AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="mailto:contact@apifyplaylist.com"
              className="text-muted-foreground hover:text-primary transition-smooth flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span className="text-sm">contact@apifyplaylist.com</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};