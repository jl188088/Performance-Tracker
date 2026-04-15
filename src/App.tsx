import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Activity, Clock, MapPin, TrendingUp, AlertTriangle, User, Zap, Calendar, Target, ChevronRight, Loader2, Info, Settings, Heart, Gauge, History, RotateCcw, BarChart3 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { analyzeWorkout } from "@/lib/gemini";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

interface WorkoutRecord {
  id: string;
  date: string;
  distance: number;
  time: string;
  pace: string;
  heartRate: number;
  cadence: number;
  rpe: number;
  analysis: string;
}

export default function App() {
  const [distance, setDistance] = useState("");
  const [time, setTime] = useState("");
  const [pace, setPace] = useState("");
  const [cadence, setCadence] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [rpe, setRpe] = useState([5]);
  const [notes, setNotes] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(true);
  const [history, setHistory] = useState<WorkoutRecord[]>([]);

  // Load history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("motion_coach_history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem("motion_coach_history", JSON.stringify(history));
  }, [history]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeWorkout({ 
        distance, 
        time, 
        pace, 
        cadence, 
        heartRate, 
        rpe: rpe[0].toString(), 
        notes 
      });
      
      const newRecord: WorkoutRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        distance: parseFloat(distance),
        time,
        pace,
        heartRate: parseInt(heartRate) || 0,
        cadence: parseInt(cadence) || 0,
        rpe: rpe[0],
        analysis: result || "",
      };

      setHistory(prev => [newRecord, ...prev].slice(0, 10)); // Keep last 10
      setAnalysis(result || "Analysis failed.");
      setShowInput(false);
    } catch (error) {
      console.error("Analysis error:", error);
      setAnalysis("An error occurred.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setDistance("");
    setTime("");
    setPace("");
    setCadence("");
    setHeartRate("");
    setRpe([5]);
    setNotes("");
    setAnalysis(null);
    setShowInput(true);
  };

  const parsedAnalysis = useMemo(() => {
    if (!analysis) return null;
    const sections = analysis.split(/\d+\.\s+/).filter(Boolean);
    return {
      summary: sections[0] || "",
      performance: sections[1] || "",
      strengths: sections[2] || "",
      weaknesses: sections[3] || "",
      fatigue: sections[4] || "",
      risk: sections[5] || "",
      improvement: sections[6] || "",
      training: sections[7] || "",
      profile: sections[8] || "",
      insight: sections[9] || "",
    };
  }, [analysis]);

  const stats = useMemo(() => {
    if (history.length === 0) return null;
    const totalDist = history.reduce((acc, curr) => acc + curr.distance, 0);
    const avgDist = totalDist / history.length;
    const avgHR = history.reduce((acc, curr) => acc + curr.heartRate, 0) / history.length;
    return { totalDist, avgDist, avgHR };
  }, [history]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-background">
      {/* Header */}
      <header className="h-[70px] px-8 flex items-center justify-between border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 180 }}
            className="w-8 h-8 border-2 border-primary rounded-lg rotate-45 flex items-center justify-center bg-primary/10"
          >
            <Activity className="w-4 h-4 text-primary -rotate-45" />
          </motion.div>
          <div className="flex flex-col">
            <span className="font-black tracking-[3px] text-base uppercase italic leading-none">Motion Intelligence</span>
            <span className="text-[9px] font-mono text-primary uppercase tracking-widest mt-1">Performance Lab v5.0</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 px-4 py-1.5 bg-white/5 rounded-full border border-white/5">
            <div className="flex items-center gap-2">
              <span className="label-mono mb-0 text-[8px] opacity-40">Status</span>
              <div className="w-1.5 h-1.5 bg-[var(--accent-green)] rounded-full animate-pulse shadow-[0_0_8px_var(--accent-green)]" />
            </div>
            <div className="w-[1px] h-3 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="label-mono mb-0 text-[8px] opacity-40">Sync</span>
              <span className="text-[9px] font-mono text-[var(--accent-green)]">ONLINE</span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setShowInput(!showInput)} className="hover:bg-primary/10 hover:text-primary transition-colors">
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-[320px_1fr_320px] gap-[1px] bg-white/5 overflow-hidden">
        
        {/* Left Panel: Inputs & History */}
        <section className="bg-[#08080A] p-6 flex flex-col gap-8 overflow-y-auto border-r border-white/5">
          <AnimatePresence mode="wait">
            {showInput ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="label-mono text-primary font-bold">Session Telemetry</p>
                    <Badge variant="outline" className="text-[8px] border-white/10 uppercase">Manual Entry</Badge>
                  </div>
                  
                  <form onSubmit={handleAnalyze} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="label-mono text-[9px] opacity-50">Distance (km)</Label>
                        <div className="relative group">
                          <MapPin className="absolute left-3 top-2.5 w-3.5 h-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                          <Input value={distance} onChange={(e) => setDistance(e.target.value)} className="bg-white/5 border-white/5 h-10 text-xs pl-9 focus:ring-1 focus:ring-primary transition-all" placeholder="0.0" required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="label-mono text-[9px] opacity-50">Time (min)</Label>
                        <div className="relative group">
                          <Clock className="absolute left-3 top-2.5 w-3.5 h-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                          <Input value={time} onChange={(e) => setTime(e.target.value)} className="bg-white/5 border-white/5 h-10 text-xs pl-9 focus:ring-1 focus:ring-primary transition-all" placeholder="00:00" required />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="label-mono text-[9px] opacity-50">Heart Rate (avg)</Label>
                        <div className="relative group">
                          <Heart className="absolute left-3 top-2.5 w-3.5 h-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                          <Input value={heartRate} onChange={(e) => setHeartRate(e.target.value)} className="bg-white/5 border-white/5 h-10 text-xs pl-9 focus:ring-1 focus:ring-primary transition-all" placeholder="bpm" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="label-mono text-[9px] opacity-50">Cadence (avg)</Label>
                        <div className="relative group">
                          <Gauge className="absolute left-3 top-2.5 w-3.5 h-3.5 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                          <Input value={cadence} onChange={(e) => setCadence(e.target.value)} className="bg-white/5 border-white/5 h-10 text-xs pl-9 focus:ring-1 focus:ring-primary transition-all" placeholder="spm" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center">
                        <Label className="label-mono text-[9px] opacity-50">Perceived Exertion (RPE)</Label>
                        <span className="text-xs font-mono font-bold text-primary">{rpe[0]}/10</span>
                      </div>
                      <Slider 
                        value={rpe} 
                        onValueChange={(val) => setRpe(val as number[])} 
                        max={10} 
                        step={1} 
                        className="py-2"
                      />
                      <div className="flex justify-between text-[8px] font-mono opacity-30 uppercase">
                        <span>Rest</span>
                        <span>Max</span>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="label-mono text-[9px] opacity-50">Subjective Notes</Label>
                      <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="bg-white/5 border-white/5 min-h-[80px] text-xs resize-none focus:ring-1 focus:ring-primary transition-all" placeholder="How did you feel?" />
                    </div>

                    <Button type="submit" className="w-full h-11 text-[11px] uppercase tracking-[0.2em] font-black italic bg-primary hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.3)]" disabled={isAnalyzing}>
                      {isAnalyzing ? <Loader2 className="animate-spin w-4 h-4" /> : "Initiate Analysis"}
                    </Button>
                  </form>
                </div>

                <div className="w-full h-[1px] bg-white/5" />

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-primary" />
                    <p className="label-mono text-[9px] mb-0">Recent Sessions</p>
                  </div>
                  <div className="space-y-2">
                    {history.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground opacity-40 italic">No historical data available.</p>
                    ) : history.map(record => (
                      <div key={record.id} className="p-3 bg-white/5 rounded-lg border border-white/5 hover:border-primary/30 transition-colors cursor-pointer group" onClick={() => { setAnalysis(record.analysis); setShowInput(false); }}>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold">{record.distance}km Run</span>
                          <span className="text-[8px] font-mono opacity-40">{new Date(record.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-3 text-[9px] font-mono opacity-60">
                          <span>{record.time}</span>
                          <span>{record.heartRate} BPM</span>
                          <ChevronRight className="w-3 h-3 ml-auto group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="profile-view"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <Button variant="ghost" size="sm" onClick={handleReset} className="w-full h-9 text-[10px] font-mono opacity-50 hover:opacity-100 hover:bg-white/5">
                  <RotateCcw className="w-3 h-3 mr-2" /> NEW_SESSION
                </Button>

                {parsedAnalysis && (
                  <>
                    <div>
                      <p className="label-mono">Athlete Profile</p>
                      <div className="athlete-card bg-gradient-to-br from-[var(--surface-accent)] to-transparent">
                        <div className="text-lg font-black italic text-primary uppercase tracking-tight">
                          {parsedAnalysis.profile.split('\n')[0].replace(/Athlete Profile:?\s*/i, '')}
                        </div>
                        <p className="text-[11px] mt-2 text-muted-foreground leading-relaxed">
                          {parsedAnalysis.profile.split('\n').slice(1).join(' ')}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="label-mono">Core Strengths</p>
                      <div className="bullet-list text-[13px]">
                        <ReactMarkdown>{parsedAnalysis.strengths}</ReactMarkdown>
                      </div>
                    </div>

                    <div>
                      <p className="label-mono">Identified Weaknesses</p>
                      <div className="bullet-list weakness-list text-[13px]">
                        <ReactMarkdown>{parsedAnalysis.weaknesses}</ReactMarkdown>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Center Panel: Analytics */}
        <section className="bg-background p-8 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {!parsedAnalysis && !isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-primary rounded-full blur-[100px]"
                  />
                  <Activity className="w-24 h-24 opacity-10 relative z-10" />
                </div>
                <h2 className="text-2xl font-black italic uppercase tracking-[0.3em] opacity-20 mb-2">System Idle</h2>
                <p className="label-mono opacity-20">Awaiting Telemetry Stream</p>
              </div>
            ) : isAnalyzing ? (
              <div className="h-full flex flex-col items-center justify-center space-y-8">
                <div className="relative">
                  <div className="w-20 h-20 border-2 border-primary/10 rounded-full" />
                  <div className="absolute inset-0 w-20 h-20 border-t-2 border-primary rounded-full animate-spin" />
                  <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <p className="label-mono animate-pulse tracking-[0.5em] text-primary">Processing Telemetry</p>
                  <p className="text-[10px] font-mono opacity-30">Running sports science heuristics...</p>
                </div>
              </div>
            ) : parsedAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-12 max-w-4xl mx-auto"
              >
                <div className="space-y-4 border-l-2 border-primary pl-8">
                  <p className="label-mono text-primary">Session Intelligence</p>
                  <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
                    {distance}km <span className="text-primary">Session</span>
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-2xl">
                    {parsedAnalysis.summary}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="stat-box group hover:border-primary/50 transition-colors">
                    <p className="label-mono text-[9px]">Avg Pace</p>
                    <div className="text-3xl font-black font-mono italic">{pace || "N/A"}<small className="text-xs opacity-30 ml-1">/km</small></div>
                  </div>
                  <div className="stat-box group hover:border-primary/50 transition-colors">
                    <p className="label-mono text-[9px]">Duration</p>
                    <div className="text-3xl font-black font-mono italic">{time}</div>
                  </div>
                  <div className="stat-box group hover:border-primary/50 transition-colors">
                    <p className="label-mono text-[9px]">Avg HR</p>
                    <div className="text-3xl font-black font-mono italic text-[var(--accent-red)]">{heartRate || "---"}</div>
                  </div>
                  <div className="stat-box group hover:border-primary/50 transition-colors">
                    <p className="label-mono text-[9px]">Intensity</p>
                    <div className="text-3xl font-black font-mono italic text-primary">{rpe[0]}<small className="text-xs opacity-30 ml-1">RPE</small></div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <p className="label-mono">Performance Quality Index</p>
                    <Badge variant="outline" className="font-mono text-[9px] opacity-40">REALTIME_SIMULATION</Badge>
                  </div>
                  <div className="viz-container bg-black/20">
                    {[40, 45, 42, 55, 60, 58, 75, 85, 80, 95, 92, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ delay: i * 0.05, type: "spring", stiffness: 100 }}
                        className="viz-bar shadow-[0_0_15px_rgba(0,242,255,0.2)]"
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      <p className="label-mono mb-0">Improvement Plan</p>
                    </div>
                    <div className="text-sm leading-relaxed text-muted-foreground bg-white/5 p-6 rounded-2xl border border-white/5">
                      <ReactMarkdown>{parsedAnalysis.improvement}</ReactMarkdown>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <p className="label-mono mb-0">Training Suggestion</p>
                    </div>
                    <div className="text-sm leading-relaxed text-muted-foreground bg-white/5 p-6 rounded-2xl border border-white/5">
                      <ReactMarkdown>{parsedAnalysis.training}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Right Panel: Progress & Risk */}
        <section className="bg-[#08080A] p-6 flex flex-col gap-8 overflow-y-auto border-l border-white/5">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <p className="label-mono mb-0">Progress Analytics</p>
            </div>
            
            {stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[8px] font-mono opacity-40 uppercase mb-1">Total Vol</p>
                    <div className="text-xl font-black italic">{stats.totalDist.toFixed(1)}<small className="text-[10px] ml-1 opacity-40">KM</small></div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                    <p className="text-[8px] font-mono opacity-40 uppercase mb-1">Avg HR</p>
                    <div className="text-xl font-black italic text-[var(--accent-red)]">{stats.avgHR.toFixed(0)}<small className="text-[10px] ml-1 opacity-40">BPM</small></div>
                  </div>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <p className="text-[8px] font-mono opacity-40 uppercase mb-1">Workout Frequency</p>
                  <div className="flex gap-1 h-8 items-end">
                    {history.slice(0, 7).reverse().map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${(h.distance / 20) * 100}%` }}
                        className="flex-1 bg-primary/40 rounded-t-sm"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 bg-white/5 rounded-xl border border-dashed border-white/10 text-center">
                <p className="text-[10px] text-muted-foreground opacity-40 italic">Accumulate sessions to generate progress insights.</p>
              </div>
            )}
          </div>

          {parsedAnalysis && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="w-full h-[1px] bg-white/5" />
              
              <div>
                <p className="label-mono">Injury Risk Index</p>
                <div className="risk-meter relative">
                  <motion.div 
                    animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-[var(--accent-red)] rounded-full blur-2xl opacity-10"
                  />
                  <div className="text-4xl font-black text-[var(--accent-red)] font-mono italic relative z-10">
                    {parsedAnalysis.risk.match(/\d+/)?.[0] || "0"}
                  </div>
                  <p className="label-mono text-[8px] mb-0 relative z-10">Risk Score</p>
                </div>
                <p className="text-[11px] text-center mt-6 text-muted-foreground leading-relaxed px-4">
                  {parsedAnalysis.risk.split('\n').slice(1).join(' ')}
                </p>
              </div>

              <div className="bg-gradient-to-br from-[var(--surface-accent)] to-transparent p-5 rounded-2xl border border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                  <p className="label-mono mb-0">Fatigue Status</p>
                  <Badge variant="outline" className="text-[8px] border-[var(--accent-green)] text-[var(--accent-green)]">OPTIMAL</Badge>
                </div>
                <div className="flex justify-between items-baseline">
                  <span className="font-black italic text-xl text-[var(--accent-green)] uppercase">
                    {parsedAnalysis.fatigue.match(/Low|Medium|High/i)?.[0] || "STABLE"}
                  </span>
                  <span className="font-mono text-lg opacity-60">24h</span>
                </div>
                <div className="h-1.5 bg-black/40 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "65%" }}
                    className="h-full bg-[var(--accent-green)] shadow-[0_0_10px_var(--accent-green)]" 
                  />
                </div>
              </div>
            </motion.div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="h-20 bg-black/60 backdrop-blur-xl border-t border-primary/30 px-8 flex items-center gap-6 relative overflow-hidden">
        <motion.div 
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-0 left-0 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"
        />
        <Badge className="bg-primary text-background font-black italic text-[10px] px-4 py-1.5 rounded-md uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          Strategic Insight
        </Badge>
        <p className="italic text-sm font-medium text-foreground/90 tracking-tight">
          {parsedAnalysis?.insight || "Awaiting session data for strategic performance insight."}
        </p>
        <div className="ml-auto flex items-center gap-4 opacity-30">
          <span className="text-[10px] font-mono uppercase tracking-widest">Lab_ID: {new Date().getTime().toString(16).toUpperCase()}</span>
          <div className="w-[1px] h-4 bg-white/10" />
          <Activity className="w-4 h-4" />
        </div>
      </footer>
    </div>
  );
}
