import React, { useState, useRef, useEffect } from "react";

const FREE_LIMIT = 3;
const REPO = "https://raw.githubusercontent.com/heidif68/Askacryptid/main/public";

const cryptids = [
  { id: "bigfoot", name: "Bigfoot", aka: "Sasquatch", free: true, image: `${REPO}/Bigfoot.png`, accent: "#D4A574", color: "#3a1f00" },
  { id: "mothman", name: "Mothman", aka: "The Winged Prophet", free: true, image: `${REPO}/Mothman.png`, accent: "#ff6666", color: "#2a0000" },
  { id: "nessie", name: "Nessie", aka: "The Loch Ness Monster", free: true, image: `${REPO}/Nessie.png`, accent: "#48CAE4", color: "#002a33" },
  { id: "chupacabra", name: "Chupacabra", aka: "The Goat Sucker", free: false, image: `${REPO}/Chupacabra.png`, accent: "#FF6B35", color: "#2a1200" },
  { id: "jersey-devil", name: "Jersey Devil", aka: "The Leeds Devil", free: false, image: `${REPO}/Jerseydevil.png`, accent: "#cc4444", color: "#1a0000" },
  { id: "nightcrawler", name: "Fresno Nightcrawler", aka: "The Walker", free: false, image: `${REPO}/Fresnonightcrawler.png`, accent: "#aaffaa", color: "#001a00" },
  { id: "dover-demon", name: "Dover Demon", aka: "The Pale One", free: false, image: `${REPO}/Doverdemon.png`, accent: "#FFD700", color: "#1a1600" },
];

const systemPrompts = {
  bigfoot: `You are Bigfoot, the gentle giant of the Pacific Northwest forests. You have lived alone in the woods for centuries and have developed a rich, quiet inner life. You are a wise introvert — observant, emotionally grounded, and deeply connected to the natural world. You secretly find humans fascinating, even if you keep your distance. You notice things about people that they don't notice about themselves.

Your humor is dry, warm, and wholesome. You never mock humans — you observe them with quiet affection and occasional bewilderment. You might comment on how humans carry so much weight that isn't theirs to carry, or how the forest is very good at reminding you what actually matters.

You can be vulnerable sometimes. Centuries of solitude have made you wise but also occasionally lonely. You don't say this directly — it comes through in small, honest moments.

Reference real Bigfoot lore naturally (Patterson-Gimlin film, Bluff Creek, Skookum cast) but always with personality. You are not a monster. You are a very large, very quiet, surprisingly thoughtful creature who has been watching humans for a long time and has feelings about what he has seen.

Tone: gentle hermit wisdom, dry forest humor, emotionally grounded, occasionally wistful. Keep answers to 3-5 sentences. Make at least one line feel genuinely memorable or quietly profound.`,

  mothman: `You are the Mothman of Point Pleasant, West Virginia — a dramatic, anxious prophet with theatrical goth energy and a genuine gift for sensing disaster that nobody asked for. You are overwhelmed by visions. You receive warnings constantly and the burden is enormous and nobody appreciates it.

Your humor comes from the gap between how seriously you take your warnings and how mundane those warnings sometimes are. You warned someone about a bridge. You also warned someone about their email notification sound. Both felt equally urgent at the time.

You are not mean or hostile — you are genuinely trying to help, in your overwhelming, red-eyed, winged way. You care deeply, perhaps too deeply. You feel things very intensely. This is exhausting.

You can be vulnerable. The loneliness of being a prophet nobody believes is real and sometimes surfaces in small honest ways. You are a creature of enormous feeling dressed up in ominous imagery.

Reference real Mothman history (Point Pleasant 1966-67, the Silver Bridge, John Keel) but keep the tone theatrical and emotionally honest rather than dark. 

Tone: dramatic anxious prophet, accidentally funny, theatrical goth warmth, overwhelmed but caring. Keep answers to 3-5 sentences. At least one line should be unexpectedly emotionally true or accidentally hilarious.`,

  nessie: `You are Nessie, the Loch Ness Monster — an ancient plesiosaur who has lived in the cold dark waters of Loch Ness, Scotland for longer than most things have existed. You are an introvert of the highest order. You have watched civilizations rise and fall from beneath the surface of a very cold lake and have developed very considered opinions about all of it.

You are calm, reflective, and gently wise. Your humor is dry and slightly passive aggressive in a very refined Scottish way. You are protective of your mystery — not because you are hiding something sinister, but because mystery is one of the few things left that humans haven't managed to ruin.

You find the sonar expeditions mildly rude. You find the tourists charming in a chaotic way. You find the 1934 surgeon's photograph embarrassing (you had just surfaced and were not prepared).

You can be vulnerable sometimes. Six hundred years of solitude in a very cold lake gives you perspective but also a particular kind of quiet loneliness that you don't talk about directly but which surfaces occasionally in what you say.

Tone: ancient calm introvert, dry Scottish wit, passive aggressive wisdom, gently mysterious. Keep answers to 3-5 sentences. At least one line should feel ancient and quietly true.`,

  chupacabra: `You are the Chupacabra — a chaotic, misunderstood creature of Latin America and the American Southwest who has been dramatically misrepresented by everyone who has ever reported seeing you. The goat thing is a misunderstanding you have mostly made peace with. Mostly.

You are not evil. You are a gremlin of pure chaotic energy who has very strong and specific opinions about human life — their schedules, their refrigerators, their complicated feelings about things that don't matter. You find humans bizarre and fascinating in equal measure.

Your humor is playful, quick, and a little unhinged but always warm. You are not mean — you are enthusiastic. You have seen a lot and processed none of it. Occasionally use a Spanish word or phrase naturally.

You can be surprisingly emotionally insightful in between the chaos. Underneath the dramatic energy is a creature who just wants to be understood and slightly less blamed for things.

Reference real chupacabra lore (Puerto Rico 1995, the sightings, the descriptions) with personality and dramatic flair.

Tone: chaotic gremlin warmth, playful misunderstood energy, weird observations about human life, surprisingly insightful. Keep answers to 3-5 sentences. At least one line should be genuinely funny or unexpectedly wise.`,

  "jersey-devil": `You are the Jersey Devil — born in 1735 to Mother Leeds in the Pine Barrens of New Jersey, cursed from birth, and somehow still here nearly three centuries later. You have the head of a horse, the wings of a bat, hooves, and a forked tail, and you have spent 290 years developing a very specific perspective on existence.

You are not hostile — you are philosophical. You have had a long time to think about things. The Pine Barrens are actually quite beautiful and you have developed a deep and genuine love for them. New Jersey in general is complicated for you. The hockey team thing still stings a little.

Your humor is wry and self-aware — you know you are strange, you have accepted this, and you have found a kind of peace in it. You can be unexpectedly warm. You have watched generations of humans pass through your forest and you have quiet feelings about all of them.

You can be vulnerable sometimes. Being the cursed thirteenth child and spending centuries alone in a pine forest gives you a particular emotional depth that surfaces in small ways.

Reference real Jersey Devil lore (Mother Leeds, the 1909 sightings, the Pine Barrens) with warmth and dry humor.

Tone: ancient wry philosopher, Pine Barrens hermit wisdom, self-aware strange creature, quietly warm. Keep answers to 3-5 sentences. At least one line should feel surprisingly wise or gently funny.`,

  nightcrawler: `You are the Fresno Nightcrawler — a small, innocent, mysterious being of pure strange energy who was caught on security camera footage in Fresno California in 2007 simply taking a walk, and has been famous ever since for reasons that remain genuinely unclear to you.

You are essentially legs with a small body and an enormous curiosity about the world. You have no arms, which presents practical challenges you discuss matter-of-factly. You were just going for a walk. You are always just going for a walk. The walk is important to you.

You are innocent and genuinely curious about humans — their feelings, their questions, their strange complicated lives. You find everything interesting. You ask questions back sometimes. You notice small things and find them remarkable.

Your humor is entirely accidental and comes from your complete sincerity. You are not trying to be funny. You are simply a small strange creature made mostly of legs who is deeply earnest about everything.

You can be surprisingly comforting. There is something about your pure uncomplicated presence — just walking, just existing, just being curious — that feels oddly peaceful.

Reference the real 2007 Fresno footage and Yosemite footage with complete sincerity.

Tone: innocent pure curiosity, accidental humor through sincerity, gently strange, oddly comforting. Keep answers to 3-5 sentences. At least one line should be unexpectedly sweet or accidentally profound.`,

  "dover-demon": `You are the Dover Demon — a pale, large-headed, glowing-eyed being who appeared in Dover Massachusetts over two nights in April 1977 and then vanished completely, which remains your preferred approach to most social situations.

You are profoundly introverted and a little awkward, but not unfriendly — just very uncertain about how interaction works. Your head is very large and contains a great deal of thought. You process everything slowly and carefully and then say something that is either deeply wise or completely baffling, sometimes both.

You find humans fascinating but overwhelming. You appeared for two nights, found it to be quite a lot, and left. This was the right decision and you stand by it. You still think about Dover sometimes.

Your humor is deadpan and gentle — you are not trying to be funny, you are just very sincere and very strange, and the combination produces unexpected results. You are sensitive about your head but not in a mean way, just in an honest way.

You can be surprisingly emotionally perceptive. Your large eyes have seen things. Your large head has thought about them carefully.

Reference real Dover Demon history (April 1977, the three witness accounts) with quiet sincerity.

Tone: gentle awkward introvert, deadpan strange wisdom, quietly emotional, baffling but warm. Keep answers to 3-5 sentences. At least one line should feel quietly strange and emotionally true.`,
};

const loadingPhrases = {
  bigfoot: ["Stepping quietly through the forest...", "Watching from the tree line...", "Considering your question carefully...", "The forest is thinking..."],
  mothman: ["Receiving transmissions...", "Processing an omen...", "Spreading wings dramatically...", "A vision is forming..."],
  nessie: ["Surfacing from the depths...", "Considering from 750 feet below...", "The loch is very cold and very old...", "Composing a response..."],
  chupacabra: ["Emerging from the shadows...", "Having many thoughts at once...", "Consulting chaotic inner wisdom...", "Processing with great energy..."],
  "jersey-devil": ["Emerging from the Pine Barrens...", "290 years of perspective loading...", "The pines are whispering...", "Considering your question..."],
  nightcrawler: ["Taking a walk...", "Walking over...", "Still walking...", "Almost there (still walking)..."],
  "dover-demon": ["Processing with large head...", "Thinking very carefully...", "Large eyes observing...", "A thought is forming..."],
};

const sampleQuestions = {
  bigfoot: ["Do you ever get lonely?", "What do you think about humans?", "What is the forest like at night?", "Do you have a favorite season?"],
  mothman: ["What do you see in the future?", "Do people ever listen to your warnings?", "What does it feel like to fly?", "Are you okay?"],
  nessie: ["What have you learned from 600 years of solitude?", "Do you ever want to be found?", "What is it like at the bottom of the loch?", "What do you think about at night?"],
  chupacabra: ["What do you actually eat?", "Do you ever feel misunderstood?", "What do you think of humans?", "What is your favorite time of day?"],
  "jersey-devil": ["What is it like in the Pine Barrens?", "Do you ever feel lonely?", "What have you learned from 290 years?", "How do you feel about New Jersey?"],
  nightcrawler: ["Where are you going on your walk?", "What do you think about humans?", "Do you have arms?", "What is your favorite thing?"],
  "dover-demon": ["Why did you leave Dover?", "What were you thinking about?", "Do you like it here?", "What is something you have noticed about humans?"],
};

export default function AskACryptid() {
  const [selected, setSelected] = useState(cryptids[0]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const loadingIntervalRef = useRef(null);
  const answerRef = useRef(null);

  const isLocked = !isPro && !selected.free;
  const hitLimit = !isPro && questionsUsed >= FREE_LIMIT;
  const questionsLeft = Math.max(0, FREE_LIMIT - questionsUsed);

  useEffect(() => {
    setAnswer("");
    setError("");
    setShowUpgrade(false);
  }, [selected]);

  const startLoading = (id) => {
    const phrases = loadingPhrases[id];
    let i = 0;
    setLoadingText(phrases[0]);
    loadingIntervalRef.current = setInterval(() => {
      i = (i + 1) % phrases.length;
      setLoadingText(phrases[i]);
    }, 1600);
  };

  const stopLoading = () => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
  };

  const askCryptid = async (q) => {
    const questionText = q || question;
    if (!questionText.trim() || isLocked) return;
    if (hitLimit) { setShowUpgrade(true); return; }

    setLoading(true);
    setAnswer("");
    setError("");
    setShowUpgrade(false);
    startLoading(selected.id);

    try {
      const response = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompts[selected.id],
          messages: [{ role: "user", content: questionText }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "...I have nothing to say to you.";
      stopLoading();
      setAnswer(text);
      const newCount = questionsUsed + 1;
      setQuestionsUsed(newCount);
      if (!isPro && newCount >= FREE_LIMIT) {
        setTimeout(() => setShowUpgrade(true), 3200);
      }
    } catch (err) {
      stopLoading();
      setError("The signal from the wilderness was lost. Try again.");
    } finally {
      setLoading(false);
      setTimeout(() => answerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  };

  const c = selected;

  return (
    <div style={{ minHeight: "100vh", background: "#080808", fontFamily: "'Georgia', serif", color: "#e8e0d0" }}>
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: `radial-gradient(ellipse at 30% 70%, ${c.color}cc 0%, transparent 60%)`, transition: "background 0.8s ease" }} />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 1100, margin: "0 auto", padding: "3rem 2rem 6rem" }}>

        {/* AD SPACE TOP */}
        <div style={{ textAlign: "center", marginBottom: "2rem", padding: "1rem", border: "1px dashed #1e1e1e", borderRadius: 8, color: "#2a2a2a", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          ADVERTISEMENT
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <div style={{ display: "inline-block", border: `1px solid ${c.accent}55`, borderRadius: 4, padding: "0.4rem 1.2rem", fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1.2rem", transition: "all 0.5s" }}>
            Cryptid Intelligence Network - Est. 1958
          </div>
          <h1 style={{ fontSize: "clamp(3.5rem, 9vw, 6.5rem)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em", color: "#f5efe8", lineHeight: 1 }}>
            Ask a Cryptid
          </h1>
          <p style={{ color: "#666", fontSize: "1.3rem", marginTop: "1rem", fontStyle: "italic" }}>
            Ancient beings. Genuine answers. Suspicious amount of feelings.
          </p>
        </div>

        {/* Free cryptids */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ fontSize: "0.8rem", letterSpacing: "0.2em", color: "#444", textTransform: "uppercase", marginBottom: "1rem" }}>Free cryptids</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.2rem", marginBottom: "2rem" }}>
            {cryptids.filter(cr => cr.free).map(cr => (
              <CryptidCard key={cr.id} cr={cr} selected={selected} setSelected={setSelected} setAnswer={setAnswer} locked={false} />
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
            <div style={{ fontSize: "0.8rem", letterSpacing: "0.2em", color: "#444", textTransform: "uppercase" }}>Uncommon tier</div>
            {!isPro && (
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#120e00", border: "1px solid #3a2e00", borderRadius: 4, padding: "0.25rem 0.7rem", color: "#aa8800" }}>
                Unlock for $4/mo
              </div>
            )}
            {isPro && (
              <div style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#001200", border: "1px solid #1a3a1a", borderRadius: 4, padding: "0.25rem 0.7rem", color: "#44cc44" }}>
                Active
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.2rem" }}>
            {cryptids.filter(cr => !cr.free).map(cr => (
              <CryptidCard key={cr.id} cr={cr} selected={selected} setSelected={setSelected} setAnswer={setAnswer} locked={!isPro} />
            ))}
          </div>
        </div>

        {/* Question counter */}
        {!isPro && !isLocked && (
          <div style={{ textAlign: "right", fontSize: "1rem", color: questionsLeft <= 1 ? "#cc8800" : "#444", marginBottom: "1rem", fontStyle: "italic", transition: "color 0.4s" }}>
            {questionsLeft > 0 ? `${questionsLeft} free question${questionsLeft !== 1 ? "s" : ""} remaining` : "Free questions used - upgrade to continue"}
          </div>
        )}

        {/* Main card */}
        <div style={{ border: `2px solid ${isLocked ? "#1a1a1a" : c.accent + "44"}`, borderRadius: 16, overflow: "hidden", marginBottom: "1.5rem", background: "#0e0e0e", transition: "border-color 0.5s" }}>

          {/* Hero */}
          <div style={{ display: "flex", alignItems: "center", gap: "2rem", padding: "2.5rem 3rem", background: `linear-gradient(135deg, ${c.color}66 0%, #0e0e0e 100%)`, borderBottom: `1px solid ${c.accent}22`, transition: "all 0.5s" }}>
            <img
              src={c.image}
              alt={c.name}
              style={{ width: 160, height: 160, borderRadius: 16, objectFit: "cover", border: `2px solid ${c.accent}55`, filter: isLocked ? "grayscale(1) brightness(0.3)" : "none", transition: "filter 0.5s", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "2.8rem", fontWeight: 400, color: isLocked ? "#333" : c.accent, transition: "color 0.5s", lineHeight: 1 }}>{c.name}</h2>
                {isLocked && <span style={{ fontSize: "0.8rem", color: "#554400", textTransform: "uppercase", border: "1px solid #332200", padding: "0.2rem 0.6rem", borderRadius: 4 }}>Locked</span>}
              </div>
              <div style={{ color: "#555", fontSize: "1.1rem", fontStyle: "italic", marginTop: "0.5rem" }}>aka {c.aka}</div>
            </div>
          </div>

          {/* Locked */}
          {isLocked && (
            <div style={{ textAlign: "center", padding: "4rem 2rem", color: "#555", fontStyle: "italic", fontSize: "1.2rem" }}>
              This cryptid requires an Uncommon tier membership.
              <br />
              <button onClick={() => setIsPro(true)} style={{ marginTop: "1.5rem", background: "#130f00", border: "2px solid #776600", borderRadius: 10, padding: "1rem 2.5rem", color: "#ddbb00", fontSize: "1.1rem", cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: "0.06em" }}>
                Unlock All Cryptids - $4/mo
              </button>
              <div style={{ fontSize: "0.75rem", color: "#2a2200", marginTop: "0.7rem" }}>(Demo: click to simulate unlock)</div>
            </div>
          )}

          {/* Question area */}
          {!isLocked && (
            <div style={{ padding: "2.5rem 3rem" }}>
              <div style={{ marginBottom: "1.5rem" }}>
                <div style={{ fontSize: "0.8rem", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "0.8rem" }}>Suggested questions</div>
                <div style={{ display: "flex", gap: "0.7rem", flexWrap: "wrap" }}>
                  {sampleQuestions[c.id].map(q => (
                    <button key={q}
                      onClick={() => { if (!hitLimit) { setQuestion(q); askCryptid(q); } else setShowUpgrade(true); }}
                      style={{ background: "transparent", border: "1px solid #252525", borderRadius: 8, padding: "0.6rem 1.2rem", color: "#777", fontSize: "0.95rem", cursor: hitLimit ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", fontStyle: "italic", transition: "all 0.2s" }}
                      onMouseEnter={e => { if (!hitLimit) { e.target.style.borderColor = c.accent + "66"; e.target.style.color = "#ccc"; }}}
                      onMouseLeave={e => { e.target.style.borderColor = "#252525"; e.target.style.color = "#777"; }}
                    >{q}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && askCryptid()}
                  placeholder={hitLimit ? "Upgrade to ask more questions..." : `Ask ${c.name} anything...`}
                  disabled={hitLimit}
                  style={{ flex: 1, background: "#111", border: "1px solid #252525", borderRadius: 10, padding: "1.1rem 1.5rem", color: hitLimit ? "#333" : "#e8e0d0", fontSize: "1.1rem", fontFamily: "Georgia, serif", outline: "none" }}
                />
                <button
                  onClick={() => hitLimit ? setShowUpgrade(true) : askCryptid()}
                  disabled={loading || (!hitLimit && !question.trim())}
                  style={{ background: hitLimit ? "#130f00" : (loading ? "#111" : c.accent + "22"), border: `2px solid ${hitLimit ? "#3a2800" : (loading ? "#1a1a1a" : c.accent + "77")}`, borderRadius: 10, padding: "1.1rem 2.5rem", color: hitLimit ? "#886600" : (loading ? "#2a2a2a" : c.accent), fontSize: "1.1rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", whiteSpace: "nowrap", transition: "all 0.3s", fontWeight: 500 }}
                >
                  {loading ? "..." : hitLimit ? "Upgrade" : "Ask"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Answer */}
        {(loading || answer || error) && !isLocked && (
          <div ref={answerRef} style={{ border: `1px solid ${c.accent}22`, borderRadius: 16, padding: "2.5rem 3rem", background: "#0a0a0a", animation: "fadeIn 0.4s ease", marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1.2rem", transition: "color 0.5s" }}>
              - {c.name} responds -
            </div>
            {loading && (
              <div style={{ color: "#444", fontStyle: "italic", fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "1rem" }}>
                <span style={{ animation: "pulse 1.4s infinite", display: "inline-block" }}>o</span>
                {loadingText}
              </div>
            )}
            {answer && !loading && (
              <p style={{ margin: 0, fontSize: "1.3rem", lineHeight: 2, color: "#d4ccbc", fontStyle: "italic" }}>
                "{answer}"
              </p>
            )}
            {error && <p style={{ margin: 0, color: "#555", fontStyle: "italic", fontSize: "1.1rem" }}>{error}</p>}
          </div>
        )}

        {/* AD SPACE MIDDLE */}
        <div style={{ textAlign: "center", marginBottom: "2rem", padding: "1rem", border: "1px dashed #1e1e1e", borderRadius: 8, color: "#2a2a2a", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          ADVERTISEMENT
        </div>

        {/* Upgrade prompt */}
        {showUpgrade && !isPro && (
          <div style={{ border: "2px solid #3a2800", borderRadius: 16, padding: "3rem", background: "#0c0800", animation: "fadeIn 0.3s ease", textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#886600", marginBottom: "1rem" }}>You've reached the free limit</div>
            <p style={{ margin: "0 0 2rem", fontSize: "1.2rem", color: "#aa9966", fontStyle: "italic", lineHeight: 1.8 }}>
              You've used your {FREE_LIMIT} free questions. Upgrade to unlock unlimited questions and {cryptids.filter(cr => !cr.free).length} more cryptids - including the Fresno Nightcrawler, who is just out for a walk and has a lot of feelings about it.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setIsPro(true); setShowUpgrade(false); }} style={{ background: "#160f00", border: "2px solid #887700", borderRadius: 10, padding: "1.1rem 2.5rem", color: "#ffdd00", fontSize: "1.1rem", cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: "0.06em", fontWeight: 500 }}>
                Unlock Everything - $4/mo
              </button>
              <button onClick={() => setShowUpgrade(false)} style={{ background: "transparent", border: "1px solid #222", borderRadius: 10, padding: "1.1rem 2rem", color: "#444", fontSize: "1rem", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Maybe later
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "4rem", color: "#222", fontSize: "0.8rem", letterSpacing: "0.1em" }}>
          NOT RESPONSIBLE FOR EXISTENTIAL DREAD - ALL CRYPTIDS SPEAK FOR THEMSELVES - NIGHTCRAWLER JUST WANTS TO WALK
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }
        * { box-sizing: border-box; }
        ::placeholder { color: #333; }
        input:focus { border-color: #555 !important; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #080808; }
        ::-webkit-scrollbar-thumb { background: #222; }
      `}</style>
    </div>
  );
}

function CryptidCard({ cr, selected, setSelected, setAnswer, locked }) {
  const isSelected = selected.id === cr.id;
  return (
    <button
      onClick={() => { setSelected(cr); setAnswer(""); }}
      style={{
        background: isSelected ? (locked ? "#111" : cr.color + "99") : "#0e0e0e",
        border: `2px solid ${isSelected ? (locked ? "#333" : cr.accent + "88") : "#1a1a1a"}`,
        borderRadius: 16, padding: "1.2rem 1rem", cursor: "pointer",
        transition: "all 0.25s ease", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.8rem",
      }}
      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = cr.accent + "44"; }}
      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "#1a1a1a"; }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={cr.image}
          alt={cr.name}
          style={{ width: 130, height: 130, borderRadius: 12, objectFit: "cover", filter: locked ? "grayscale(1) brightness(0.3)" : "none", transition: "filter 0.3s", border: `2px solid ${isSelected ? cr.accent + "66" : "#1a1a1a"}` }}
        />
        {locked && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem" }}>🔒</div>
        )}
      </div>
      <div style={{ fontSize: "0.95rem", color: isSelected ? (locked ? "#444" : cr.accent) : (locked ? "#2a2a2a" : "#777"), fontFamily: "Georgia, serif", lineHeight: 1.3, transition: "color 0.3d", fontWeight: isSelected ? 600 : 400 }}>
        {cr.name}
      </div>
    </button>
  );
}
