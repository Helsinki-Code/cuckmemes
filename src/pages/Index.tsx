
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ArrowRight, Image, Upload, Download, Zap, UserRound } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <h1 className="text-5xl font-bold leading-tight gradient-heading">
                  Create Hilarious Cuckold Memes in Seconds
                </h1>
                <p className="text-xl text-muted-foreground">
                  Upload your images and let our AI generate personalized cuckold-themed memes. 
                  Easy to use, high quality results, and lightning fast.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button asChild size="lg" className="bg-theme-purple hover:bg-theme-purple/90">
                    <Link to="/generator">
                      Start Creating
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="/pricing">View Pricing</Link>
                  </Button>
                </div>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden animate-float">
                <div className="absolute inset-0 bg-gradient-to-br from-theme-purple/20 to-theme-pink/20 rounded-lg"></div>
                <img 
                  src="/placeholder.svg" 
                  alt="Meme Example" 
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute top-4 text-center w-full p-4 meme-text text-xl">
                  When your wife says she's just going to have coffee
                </div>
                <div className="absolute bottom-4 text-center w-full p-4 meme-text text-xl">
                  But comes home 5 hours later with messy hair
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* How It Works */}
        <section className="py-16 px-6 bg-secondary/30">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 gradient-heading">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Creating hilarious cuckold memes has never been easier. Our AI-powered platform does the heavy lifting for you.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto bg-theme-purple/20 rounded-full flex items-center justify-center mb-4">
                  <Upload className="h-8 w-8 text-theme-purple" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Upload Your Image</h3>
                <p className="text-muted-foreground">
                  Upload any image you want to turn into a cuckold-themed meme
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto bg-theme-pink/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-theme-pink" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Let AI Work Its Magic</h3>
                <p className="text-muted-foreground">
                  Our AI analyzes your image and generates relevant cuckold-themed text
                </p>
              </div>
              
              <div className="bg-card p-6 rounded-lg text-center">
                <div className="w-16 h-16 mx-auto bg-theme-lightBlue/20 rounded-full flex items-center justify-center mb-4">
                  <Download className="h-8 w-8 text-theme-lightBlue" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Download Your Meme</h3>
                <p className="text-muted-foreground">
                  Save your personalized cuckold meme in high quality and share it
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4 gradient-heading">Features</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you need to create the perfect cuckold memes
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-full bg-theme-purple/20 shrink-0">
                  <Image className="h-6 w-6 text-theme-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">AI-Generated Text</h3>
                  <p className="text-muted-foreground">
                    Our advanced AI analyzes your image and generates hilarious and relevant cuckold-themed text.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-full bg-theme-pink/20 shrink-0">
                  <UserRound className="h-6 w-6 text-theme-pink" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Customizable Options</h3>
                  <p className="text-muted-foreground">
                    Customize font size, placement, and styles to create the perfect meme.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-full bg-theme-lightBlue/20 shrink-0">
                  <Download className="h-6 w-6 text-theme-lightBlue" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">High-Quality Downloads</h3>
                  <p className="text-muted-foreground">
                    Download your memes in high resolution for sharing on any platform.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="p-3 rounded-full bg-theme-purple/20 shrink-0">
                  <Zap className="h-6 w-6 text-theme-purple" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
                  <p className="text-muted-foreground">
                    Generate memes in seconds with our optimized AI algorithms.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 px-6 bg-gradient-to-r from-theme-dark to-theme-purple/30">
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold mb-6 text-white">Ready to Create Your First Meme?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start with 5 free memes. No credit card required.
            </p>
            <Button asChild size="lg" className="bg-theme-pink hover:bg-theme-pink/90">
              <Link to="/signup">
                Get Started For Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} CuckoldMemeGen. All rights reserved.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
                Pricing
              </Link>
              <Link to="/generator" className="text-sm text-muted-foreground hover:text-foreground">
                Generator
              </Link>
              <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">
                Login
              </Link>
              <Link to="/signup" className="text-sm text-muted-foreground hover:text-foreground">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
