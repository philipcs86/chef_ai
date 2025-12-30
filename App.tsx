
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Camera, Loader2, UtensilsCrossed, AlertCircle, ExternalLink, X, Leaf, Sparkles } from 'lucide-react';
import { analyzeIngredients } from './services/geminiService';
import { AnalysisResult, AppState } from './types';
import RecipeCard from './components/RecipeCard';

const App: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setResult(null);
        setAppState(AppState.IDLE);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setAppState(AppState.LOADING);
    setErrorMsg(null);
    try {
      const analysis = await analyzeIngredients(selectedImage);
      if (analysis.error) {
        setErrorMsg(analysis.error);
        setAppState(AppState.ERROR);
      } else {
        setResult(analysis);
        setAppState(AppState.SUCCESS);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setSelectedImage(null);
    setResult(null);
    setAppState(AppState.IDLE);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Navbar */}
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-red-600 p-2 rounded-lg">
                <UtensilsCrossed className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Chef AI</span>
            </div>
            <div className="hidden sm:flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500">Chinese Cuisine Generator</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="bg-white border-b mb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Turn Your <span className="text-red-600">Ingredients</span> Into <span className="chinese-font text-5xl sm:text-6xl align-middle">中華料理</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Upload a photo of what's in your fridge. Our AI will analyze the ingredients and suggest 3 authentic Chinese recipes using traditional techniques.
          </p>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Preview */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-slate-400" />
                Input Photo
              </h2>

              {!selectedImage ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all duration-300"
                >
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mb-1">Click to upload photo</p>
                  <p className="text-xs text-slate-400">JPG, PNG or GIF up to 10MB</p>
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleImageChange} 
                    accept="image/*" 
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative group rounded-2xl overflow-hidden border border-slate-100 shadow-inner bg-slate-50">
                    <img 
                      src={selectedImage} 
                      alt="Selected ingredients" 
                      className="w-full aspect-[4/3] object-cover" 
                    />
                    <button 
                      onClick={reset}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full text-slate-600 hover:bg-white hover:text-red-500 shadow-lg transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <button
                    disabled={appState === AppState.LOADING}
                    onClick={handleAnalyze}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-[0.98]"
                  >
                    {appState === AppState.LOADING ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Analyze & Generate Recipes
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{errorMsg}</p>
              </div>
            )}
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7 space-y-6">
            {appState === AppState.LOADING && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-white rounded-3xl border border-dashed border-slate-200">
                <div className="relative w-20 h-20 mb-6">
                  <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <UtensilsCrossed className="w-8 h-8 text-red-600" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Identifying Ingredients...</h3>
                <p className="text-slate-500 max-w-sm">
                  Our Chef AI is consulting traditional culinary libraries to find the perfect dishes for you.
                </p>
              </div>
            )}

            {appState === AppState.IDLE && !selectedImage && (
              <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Leaf className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-400 mb-1">No Analysis Yet</h3>
                <p className="text-slate-400 text-sm max-w-xs">
                  Upload a photo of your vegetables, meats, or seasonings to see recipe suggestions.
                </p>
              </div>
            )}

            {result && appState === AppState.SUCCESS && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Ingredients Chip List */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Detected Ingredients</h3>
                  <div className="flex flex-wrap gap-2">
                    {result.ingredients.map((ing, idx) => (
                      <span 
                        key={idx} 
                        className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-full text-slate-700 text-sm font-medium hover:bg-white hover:border-red-200 transition-all cursor-default"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recipes List */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest px-2">Recommended Dishes</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {result.recipes.map((recipe) => (
                      <RecipeCard key={recipe.id} recipe={recipe} />
                    ))}
                  </div>
                </div>

                {/* Sources Section (Grounding) */}
                {result.sources && result.sources.length > 0 && (
                  <div className="bg-slate-900 rounded-3xl p-6 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                      <Sparkles className="w-32 h-32" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-4">Verified References</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {result.sources.map((source, idx) => (
                        <a 
                          key={idx}
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-colors group"
                        >
                          <span className="text-xs font-medium truncate max-w-[180px] text-slate-300">{source.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-white transition-colors" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-100 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-slate-400 text-sm mb-2">Powered by Gemini 3 Flash and Google Search Grounding</p>
          <p className="text-slate-300 text-xs">© 2024 Chef AI Culinary Labs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
