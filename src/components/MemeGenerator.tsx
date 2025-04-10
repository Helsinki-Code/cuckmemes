import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { User } from "@supabase/supabase-js";
import { supabase, getUserSubscription, decrementFreeUsage, saveMeme } from "@/lib/supabase";
import { Meme, UserSubscriptionInfo } from "@/types";
import { useNavigate } from "react-router-dom";
import { Download, Upload, RefreshCw, RotateCw } from "lucide-react";
import { generateMemeText } from "@/lib/gemini";
import RecentMemes from "@/components/RecentMemes";

const MemeGenerator = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [topText, setTopText] = useState("");
  const [bottomText, setBottomText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [regeneratingText, setRegeneratingText] = useState(false);
  const [generatedMeme, setGeneratedMeme] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscriptionInfo, setSubscriptionInfo] = useState<UserSubscriptionInfo | null>(null);
  const [isSubscriptionLoading, setIsSubscriptionLoading] = useState(true);
  const [usedRegeneration, setUsedRegeneration] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const memeContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/login');
          return;
        }
        
        console.log("User authenticated:", session.user.id);
        setUser(session.user);
        
        try {
          setIsSubscriptionLoading(true);
          const subInfo = await getUserSubscription(session.user.id);
          console.log("Subscription info:", subInfo);
          setSubscriptionInfo(subInfo);
        } catch (error) {
          console.error("Error fetching subscription info:", error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not fetch subscription status. Please try again.",
          });
          
          setSubscriptionInfo({
            hasFreeUsage: true,
            freeRemaining: 5,
            hasSubscription: false
          });
        } finally {
          setIsSubscriptionLoading(false);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        toast({
          variant: "destructive",
          title: "Authentication error",
          description: "Please try logging in again",
        });
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      setGeneratedMeme(null);
      setUsedRegeneration(false);
    }
  };

  const canGenerate = () => {
    if (isSubscriptionLoading) {
      console.log("Still loading subscription info");
      return false;
    }
    
    if (!subscriptionInfo) {
      console.log("No subscription info available");
      return true;
    }
    
    console.log("Checking if user can generate meme:", subscriptionInfo);
    
    if (subscriptionInfo.hasSubscription) {
      console.log("User has active subscription");
      return true;
    }
    
    if (subscriptionInfo.hasFreeUsage && subscriptionInfo.freeRemaining > 0) {
      console.log("User has free usage remaining:", subscriptionInfo.freeRemaining);
      return true;
    }
    
    console.log("User cannot generate meme");
    return false;
  };

  const regenerateText = async () => {
    if (!imagePreview || regeneratingText) return;
    
    setRegeneratingText(true);
    
    try {
      toast({
        title: "Regenerating text...",
        description: "Please wait while we generate new text",
      });
      
      const response = await generateMemeText(imagePreview);
      setTopText(response.topText);
      setBottomText(response.bottomText);
      
      toast({
        title: "Text regenerated",
        description: "New text has been generated for your meme",
      });
    } catch (error: any) {
      console.error("Error regenerating text:", error);
      toast({
        variant: "destructive",
        title: "Regeneration failed",
        description: error.message || "Failed to regenerate text. Please try again.",
      });
    } finally {
      setRegeneratingText(false);
    }
  };

  const handleMemeSelection = (meme: Meme) => {
    setTopText(meme.top_text);
    setBottomText(meme.bottom_text);
    toast({
      title: "Meme text loaded",
      description: "You can now edit and regenerate with this text",
    });
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
    
    console.log("Starting meme generation, checking if user can generate");
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
      let generatedTopText = topText;
      let generatedBottomText = bottomText;
      
      if (!topText && !bottomText && imagePreview) {
        toast({
          title: "AI is generating text...",
          description: "This may take a few seconds",
        });
        
        try {
          const response = await generateMemeText(imagePreview);
          generatedTopText = response.topText;
          generatedBottomText = response.bottomText;
          
          setTopText(generatedTopText);
          setBottomText(generatedBottomText);
          
          console.log("AI generated text:", generatedTopText, generatedBottomText);
        } catch (error: any) {
          console.error("Error generating text with Gemini:", error);
          toast({
            variant: "destructive",
            title: "AI text generation failed",
            description: "Using fallback text instead. Try again later.",
          });
          
          generatedTopText = "When she says she's just going out with friends";
          generatedBottomText = "But comes home with another man's scent";
          setTopText(generatedTopText);
          setBottomText(generatedBottomText);
        }
      }
      
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx && imagePreview) {
          const img = new Image();
          img.onload = async () => {
            canvas.width = img.width;
            canvas.height = img.height;
            
            ctx.drawImage(img, 0, 0);
            
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = Math.max(1, fontSize / 15);
            ctx.font = `bold ${fontSize}px Impact`;
            ctx.textAlign = 'center';
            
            if (generatedTopText) {
              ctx.fillText(generatedTopText, canvas.width / 2, fontSize + 10);
              ctx.strokeText(generatedTopText, canvas.width / 2, fontSize + 10);
            }
            
            if (generatedBottomText) {
              ctx.fillText(generatedBottomText, canvas.width / 2, canvas.height - 20);
              ctx.strokeText(generatedBottomText, canvas.width / 2, canvas.height - 20);
            }
            
            const memeDataUrl = canvas.toDataURL('image/png');
            setGeneratedMeme(memeDataUrl);
            
            if (!usedRegeneration && !subscriptionInfo?.hasSubscription) {
              console.log("Decrementing free usage for non-subscriber");
              const decremented = await decrementFreeUsage(user.id);
              
              if (decremented) {
                console.log("Successfully decremented free usage");
              }
            } else {
              console.log("User has subscription or is regenerating, not decrementing free usage");
              await decrementFreeUsage(user.id);
            }
            
            setUsedRegeneration(true);
            
            const imageUrl = memeDataUrl.substring(0, 100) + "...";
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

  const renderUsageStats = () => {
    if (isSubscriptionLoading) {
      return (
        <div className="text-sm text-gray-400 mb-4">
          Loading subscription info...
        </div>
      );
    }
    
    if (!subscriptionInfo) {
      return (
        <div className="text-sm text-amber-400 mb-4">
          You have 5 free memes remaining
        </div>
      );
    }
    
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
            You have {5} free memes remaining
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
      
      {user && <RecentMemes userId={user.id} onSelectMeme={handleMemeSelection} />}
      
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
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium">Top Text</label>
                  {imagePreview && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={regenerateText} 
                      disabled={regeneratingText || !imagePreview}
                      className="h-6 px-2 text-xs"
                    >
                      {regeneratingText ? (
                        <RotateCw className="mr-1 h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="mr-1 h-3 w-3" />
                      )}
                      Regenerate Text
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Enter top text (or leave empty for AI generation)"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Bottom Text</label>
                <Input
                  placeholder="Enter bottom text (or leave empty for AI generation)"
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
                  disabled={!imageFile || generating || isSubscriptionLoading || !canGenerate()} 
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : generatedMeme ? (
                    "Regenerate Meme"
                  ) : (
                    "Generate Meme"
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-center text-muted-foreground pt-2">
                {!topText && !bottomText ? "Leave text empty to let AI generate it for you using Google's Gemini!" : ""}
                {generatedMeme && "You can regenerate as many times as you want with the same image!"}
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
      
      <canvas ref={canvasRef} className="hidden"></canvas>
    </div>
  );
};

export default MemeGenerator;
