
import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@supabase/supabase-js";
import { supabase, getUserSubscription, decrementFreeUsage, saveMeme } from "@/lib/supabase";
import { UserSubscriptionInfo } from "@/types";
import { useNavigate } from "react-router-dom";
import { Download, Upload, RefreshCw } from "lucide-react";

const MemeGenerator = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<UserSubscriptionInfo | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const memeContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Check authentication and subscription status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      
      // Get subscription info
      const subInfo = await getUserSubscription(session.user.id);
      setSubscriptionInfo(subInfo);
    };
    
    checkAuth();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset generated meme when new image is uploaded
      setGeneratedMeme(null);
    }
  };

  const canGenerate = () => {
    if (!subscriptionInfo) return false;
    return subscriptionInfo.hasSubscription || subscriptionInfo.hasFreeUsage;
  };

  const generateMeme = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to generate memes",
      });
      navigate('/login');
      return;
    }
    
    if (!canGenerate()) {
      toast({
        variant: "destructive",
        title: "Subscription required",
        description: "You've used all your free memes. Please subscribe to continue.",
      });
      navigate('/pricing');
      return;
    }
    
    if (!imageFile) {
      toast({
        variant: "destructive",
        title: "Image required",
        description: "Please upload an image first",
      });
      return;
    }
    
    setGenerating(true);
    
    try {
      // Mock the Gemini API call - in a real implementation this would call the Supabase edge function
      // that would then use the Gemini API
      
      // Simulate AI generating text if none is provided
      let generatedTopText = topText;
      let generatedBottomText = bottomText;
      
      if (!topText && !bottomText) {
        // Simulate AI response
        await new Promise(resolve => setTimeout(resolve, 2000));
        generatedTopText = "When she says she's just going out with friends";
        generatedBottomText = "But comes home with another man's scent";
        
        setTopText(generatedTopText);
        setBottomText(generatedBottomText);
      }
      
      // Create meme with canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && imagePreview) {
          const img = new Image();
          img.onload = async () => {
            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;
            
            // Draw image on canvas
            ctx.drawImage(img, 0, 0);
            
            // Add text
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = Math.max(1, fontSize / 15);
            ctx.font = `bold ${fontSize}px Impact`;
            ctx.textAlign = 'center';
            
            // Draw top text
            if (generatedTopText) {
              ctx.fillText(generatedTopText, canvas.width / 2, fontSize + 10);
              ctx.strokeText(generatedTopText, canvas.width / 2, fontSize + 10);
            }
            
            // Draw bottom text
            if (generatedBottomText) {
              ctx.fillText(generatedBottomText, canvas.width / 2, canvas.height - 20);
              ctx.strokeText(generatedBottomText, canvas.width / 2, canvas.height - 20);
            }
            
            // Convert canvas to data URL
            const memeDataUrl = canvas.toDataURL('image/png');
            setGeneratedMeme(memeDataUrl);
            
            // Decrement free usage if applicable
            if (subscriptionInfo?.hasFreeUsage) {
              await decrementFreeUsage(user.id);
              // Update local subscription info
              setSubscriptionInfo({
                ...subscriptionInfo,
                freeRemaining: subscriptionInfo.freeRemaining - 1,
                hasFreeUsage: subscriptionInfo.freeRemaining - 1 > 0
              });
            }
            
            // Save meme to database
            // In a real implementation, you would upload the image to Supabase storage
            // and then save the URL to the database
            const imageUrl = "https://example.com/meme.png"; // Placeholder
            await saveMeme(user.id, imageUrl, generatedTopText, generatedBottomText);
            
            toast({
              title: "Meme generated!",
              description: "Your meme has been generated successfully",
            });
            
            setGenerating(false);
          };
          img.src = imagePreview;
        }
      }
    } catch (error: any) {
      console.error("Error generating meme:", error);
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: error.message || "Failed to generate meme. Please try again.",
      });
      setGenerating(false);
    }
  };

  const downloadMeme = () => {
    if (!generatedMeme) return;
    
    const link = document.createElement('a');
    link.href = generatedMeme;
    link.download = 'cuckold-meme.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Display usage stats and upgrade prompt
  const renderUsageStats = () => {
    if (!subscriptionInfo) return null;
    
    if (subscriptionInfo.hasSubscription) {
      return (
        <div className="text-sm text-green-400 mb-4">
          You have an active {subscriptionInfo.subscription?.plan_type} subscription
        </div>
      );
    }
    
    return (
      <div className="text-sm mb-4">
        {subscriptionInfo.freeRemaining > 0 ? (
          <span className="text-amber-400">
            You have {subscriptionInfo.freeRemaining} free memes remaining
          </span>
        ) : (
          <span className="text-red-400">
            You've used all your free memes. <a href="/pricing" className="underline">Upgrade now</a>
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center gradient-heading">Cuckold Meme Generator</h1>
      
      {renderUsageStats()}
      
      <Tabs defaultValue="create">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="create">Create Meme</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Upload Image</label>
                <div className="flex items-center gap-4">
                  <Input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="flex-1"
                  />
                  <Button variant="outline" size="icon" asChild>
                    <label htmlFor="file-input" className="cursor-pointer">
                      <Upload size={18} />
                      <input
                        id="file-input"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Top Text</label>
                <Input
                  placeholder="Enter top text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Bottom Text</label>
                <Input
                  placeholder="Enter bottom text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Size: {fontSize}px</label>
                <Slider
                  value={[fontSize]}
                  min={16}
                  max={72}
                  step={1}
                  onValueChange={(value) => setFontSize(value[0])}
                />
              </div>
              
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={generateMeme} 
                  disabled={!imageFile || generating || !canGenerate()} 
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Meme"
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground pt-2">
                {!topText && !bottomText ? "Leave text empty to let AI generate it for you!" : ""}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardContent className="p-6">
              <div ref={memeContainerRef} className="meme-container min-h-[300px] rounded-md overflow-hidden mb-4">
                {imagePreview ? (
                  <>
                    {generatedMeme ? (
                      <img 
                        src={generatedMeme} 
                        alt="Generated meme" 
                        className="max-w-full max-h-[500px] object-contain"
                      />
                    ) : (
                      <div className="relative w-full">
                        <img 
                          src={imagePreview} 
                          alt="Meme preview" 
                          className="max-w-full max-h-[500px] object-contain"
                        />
                        {topText && (
                          <div className="meme-text top-text" style={{ fontSize: `${fontSize}px` }}>
                            {topText}
                          </div>
                        )}
                        {bottomText && (
                          <div className="meme-text bottom-text" style={{ fontSize: `${fontSize}px` }}>
                            {bottomText}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <p className="text-muted-foreground">Upload an image to start creating your meme</p>
                  </div>
                )}
              </div>
              
              {generatedMeme && (
                <div className="flex justify-center">
                  <Button onClick={downloadMeme} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Meme
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Hidden canvas for generating memes */}
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default MemeGenerator;
