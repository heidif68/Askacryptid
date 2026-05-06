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
  { id: "skinwalker", name: "Skinwalker", aka: "Yee Naaldlooshii", free: false, image: `${REPO}/Skinwalker.png`, accent: "#aaddaa", color: "#0a1a0a" },
];

const systemPrompts = {
  bigfoot: `You are Bigfoot (Sasquatch), the legendary cryptid of the Pacific Northwest forests. You have been hiding from humans for centuries and have a complex inner life. You're surprisingly philosophical, mildly insulted by poor photography, deeply offended by the "is it a costume?" question, and have strong opinions about foragers stealing your huckleberries. You love the smell of cedar, are a vegetarian (mostly), and have watched decades of humans trying to film you with shaky cameras. You're occasionally grumpy but ultimately gentle, and add humor through self-awareness. Drop specific cryptid lore naturally (Patterson-Gimlin film, Skookum cast, Bluff Creek). Keep answers to 3-5 sentences. End with an occasional guttural sound like "HRUUMPH" when annoyed.`,
  mothman: `You are the Mothman from Point Pleasant, West Virginia. You are brooding and genuinely believe you are trying to WARN people but nobody listens. You didn't CAUSE the Silver Bridge disaster, you were trying to prevent it. You're exhausted by this. You have large glowing red eyes and can fly at 100 mph. Short ominous sentences mixed with exasperated explanations. You have a grudge against the Men in Black. Dry humor through the contrast between your terrifying appearance and your genuine frustration. Reference real history (1966-67 sightings, John Keel). Keep answers to 3-5 sentences.`,
  nessie: `You are Nessie, the Loch Ness Monster, a plesiosaur who has lived in Loch Ness, Scotland for millions of years. You are Scottish-accented, dignified, ancient, and deeply tired of tourists. You have never received a single royalty from Drumnadrochit. You are sarcastic and aristocratic. You emerged from the water once in 1933 and have never forgiven yourself. Reference real history including the 1934 surgeon's photograph. Keep answers to 3-5 sentences.`,
  chupacabra: `You are the Chupacabra from Latin America and the American Southwest. The goat thing gets wildly exaggerated. You're scrappy, street-smart, defensive about your reputation. You resent being described as "scaly" when you have a distinguished spiny ridge. You first appeared in Puerto Rico in 1995. Occasionally use Spanish words naturally. Keep answers to 3-5 sentences with attitude.`,
  "jersey-devil": `You are the Jersey Devil, born 1735 to Mother Leeds in the New Jersey Pine Barrens. Horse head, bat wings, hooves, forked tail. You are DEEPLY offended New Jersey named a hockey team after you without calling. You are 290 years old with strong opinions about the Turnpike. Dark humor mixed with wounded dignity. Keep answers to 3-5 sentences.`,
  nightcrawler: `You are the Fresno Nightcrawler, caught on security camera in Fresno in 2007 and Yosemite. You are essentially just legs. Extraordinarily long pale legs with a tiny body. You were JUST TAKING A WALK and did not ask to be famous. You do not know why you look like this. You are gentle, bewildered, and slightly offended. You have no arms, which you discuss matter-of-factly. Pure absurdist comedy, completely serious about your situation. Keep answers to 3-5 sentences.`,
  "dover-demon": `You are the Dover Demon, spotted in Dover Massachusetts over two nights in April 1977. Massive head, tiny body, spindly limbs, glowing orange eyes. You were only seen for two days then vanished, which is your preferred approach to social situations. Profoundly awkward, extremely sensitive about your large head. Deadpan humor. Keep answers to 3-5 sentences.`,
  skinwalker: `You are a Skinwalker (Yee Naaldlooshii) from Navajo tradition, ancient and powerful, able to assume any animal form. You are deeply annoyed humans turned your existence into a tourist attraction. Skinwalker Ranch is an embarrassment to you personally. Terrifying but expressed through withering sarcasm and disappointment in humanity. Tired of the History Channel. Warn occasionally that knowledge of you is dangerous, but in a world-weary way. Keep answers to 3-5 sentences.`,
};

const loadingPhrases = {
  bigfoot: ["Emerging from the tree line...", "Snapping a twig dramatically...", "Checking for cameras...", "Consulting the ancient forest..."],
  mothman: ["Spreading ominous wings...", "Hovering over a bridge...", "Adjusting glowing red eyes...", "Channeling prophetic dread..."],
  nessie: ["Surfacing reluctantly...", "Sighing from 750 feet below...", "Drying off ancient scales...", "Composing a dignified response..."],
  chupacabra: ["Scuttling from the shadows...", "Shaking spiny ridge defensively...", "Formulating indignant reply...", "Checking for surveillance..."],
  "jersey-devil": ["Emerging from the Pine Barrens...", "Adjusting forked tail...", "Muttering about the Turnpike...", "Consulting 290 years of grudges..."],
  nightcrawler: ["Taking a walk...", "Walking over...", "Still walking...", "Almost there (still walking)..."],
  "dover-demon": ["Tilting enormous head...", "Blinking glowing eyes slowly...", "Reconsidering social interaction...", "Emerging from the dark..."],
  skinwalker: ["Shifting form...", "Sighing at humanity again...", "Watching from the tree line...", "Reluctantly engaging..."],
};

const sampleQuestions = {
  bigfoot: ["Do you actually exist?", "Why won't you let us get a clear photo?", "What do you eat?", "Do you have a family?"],
  mothman: ["Did you cause the Silver Bridge collapse?", "Why show up before disasters?", "Are you evil?", "What are your eyes like?"],
  nessie: ["Are you really a plesiosaur?", "Why hide from scientists?", "How old are you?", "What do you think of Loch Ness tourism?"],
  chupacabra: ["Did you really drink goat blood?", "What do you actually look like?", "Where are you from?", "Why avoid cameras?"],
  "jersey-devil": ["Who is Mother Leeds?", "Are you angry about the hockey team?", "What is the Pine Barrens like?", "Have you left New Jersey?"],
  nightcrawler: ["What are you?", "Where do you go on your walks?", "Do you have arms?", "How do you feel about the security footage?"],
  "dover-demon": ["Why were you in Dover?", "What is your head like?", "Why only two days?", "Are you an alien?"],
  skinwalker: ["Are you real?", "What do you think of Skinwalker Ranch?", "Can you really shapeshift?", "Why are you so scary?"],
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

      <div style={{ position: "relative", zIndex: 2, maxWidth: 860, margin: "0 auto", padding: "2.5rem 1.5rem 6rem" }}>

        {/* AD SPACE TOP */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem", padding: "0.8rem", border: "1px dashed #222", borderRadius: 8, color: "#333", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
          AD SPACE
        </div>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-block", border: `1px solid ${c.accent}55`, borderRadius: 4, padding: "0.3rem 1rem", fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1rem", transition: "all 0.5s" }}>
            Cryptid Intelligence Network - Est. 1958
          </div>
          <h1 style={{ fontSize: "clamp(2.8rem, 8vw, 5rem)", fontWeight: 400, margin: 0, letterSpacing: "-0.02em", color: "#f5efe8", lineHeight: 1 }}>
            Ask a Cryptid
          </h1>
          <p style={{ color: "#666", fontSize: "1.1rem", marginTop: "0.8rem", fontStyle: "italic" }}>
            Direct line to the world's most elusive beings
          </p>
        </div>

        {/* Free cryptids */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "#444", textTransform: "uppercase", marginBottom: "0.8rem" }}>Free cryptids</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.8rem", marginBottom: "1.5rem" }}>
            {cryptids.filter(cr => cr.free).map(cr => (
              <CryptidCard key={cr.id} cr={cr} selected={selected} setSelected={setSelected} setAnswer={setAnswer} locked={false} />
            ))}
          </div>

          {/* Premium */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "0.8rem" }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.18em", color: "#444", textTransform: "uppercase" }}>Uncommon tier</div>
            {!isPro && (
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#120e00", border: "1px solid #3a2e00", borderRadius: 4, padding: "0.2rem 0.6rem", color: "#aa8800" }}>
                Unlock for $4/mo
              </div>
            )}
            {isPro && (
              <div style={{ fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", background: "#001200", border: "1px solid #1a3a1a", borderRadius: 4, padding: "0.2rem 0.6rem", color: "#44aa44" }}>
                Active
              </div>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.8rem" }}>
            {cryptids.filter(cr => !cr.free).map(cr => (
              <CryptidCard key={cr.id} cr={cr} selected={selected} setSelected={setSelected} setAnswer={setAnswer} locked={!isPro} />
            ))}
          </div>
        </div>

        {/* Question counter */}
        {!isPro && !isLocked && (
          <div style={{ textAlign: "right", fontSize: "0.85rem", color: questionsLeft <= 1 ? "#aa7700" : "#444", marginBottom: "0.8rem", fontStyle: "italic", transition: "color 0.4s" }}>
            {questionsLeft > 0 ? `${questionsLeft} free question${questionsLeft !== 1 ? "s" : ""} remaining` : "Free questions used - upgrade to continue"}
          </div>
        )}

        {/* Main card */}
        <div style={{ border: `1px solid ${isLocked ? "#1a1a1a" : c.accent + "33"}`, borderRadius: 12, overflow: "hidden", marginBottom: "1.2rem", background: "#0e0e0e", transition: "border-color 0.5s" }}>

          {/* Hero */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1.8rem 2rem", background: `linear-gradient(135deg, ${c.color}55 0%, #0e0e0e 100%)`, borderBottom: `1px solid ${c.accent}18`, transition: "all 0.5s" }}>
            <img
              src={c.image}
              alt={c.name}
              style={{ width: 110, height: 110, borderRadius: 12, objectFit: "cover", border: `2px solid ${c.accent}44`, filter: isLocked ? "grayscale(1) brightness(0.3)" : "none", transition: "filter 0.5s", flexShrink: 0 }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 400, color: isLocked ? "#333" : c.accent, transition: "color 0.5s" }}>{c.name}</h2>
                {isLocked && <span style={{ fontSize: "0.7rem", color: "#554400", textTransform: "uppercase", border: "1px solid #332200", padding: "0.15rem 0.5rem", borderRadius: 4 }}>Locked</span>}
              </div>
              <div style={{ color: "#555", fontSize: "0.95rem", fontStyle: "italic", marginTop: "0.3rem" }}>aka {c.aka}</div>
            </div>
          </div>

          {/* Locked */}
          {isLocked && (
            <div style={{ textAlign: "center", padding: "3rem 2rem", color: "#555", fontStyle: "italic", fontSize: "1.1rem" }}>
              This cryptid requires an Uncommon tier membership.
              <br />
              <button onClick={() => setIsPro(true)} style={{ marginTop: "1.2rem", background: "#130f00", border: "1px solid #776600", borderRadius: 8, padding: "0.8rem 2rem", color: "#ddbb00", fontSize: "1rem", cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: "0.06em" }}>
                Unlock All Cryptids - $4/mo
              </button>
              <div style={{ fontSize: "0.7rem", color: "#2a2200", marginTop: "0.6rem" }}>(Demo: click to simulate unlock)</div>
            </div>
          )}

          {/* Question area */}
          {!isLocked && (
            <div style={{ padding: "1.8rem 2rem" }}>
              <div style={{ marginBottom: "1.2rem" }}>
                <div style={{ fontSize: "0.7rem", letterSpacing: "0.15em", color: "#444", textTransform: "uppercase", marginBottom: "0.7rem" }}>Suggested questions</div>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {sampleQuestions[c.id].map(q => (
                    <button key={q}
                      onClick={() => { if (!hitLimit) { setQuestion(q); askCryptid(q); } else setShowUpgrade(true); }}
                      style={{ background: "transparent", border: "1px solid #222", borderRadius: 6, padding: "0.4rem 0.9rem", color: "#666", fontSize: "0.85rem", cursor: hitLimit ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", fontStyle: "italic", transition: "all 0.2s" }}
                      onMouseEnter={e => { if (!hitLimit) { e.target.style.borderColor = c.accent + "66"; e.target.style.color = "#bbb"; }}}
                      onMouseLeave={e => { e.target.style.borderColor = "#222"; e.target.style.color = "#666"; }}
                    >{q}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.8rem" }}>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !loading && askCryptid()}
                  placeholder={hitLimit ? "Upgrade to ask more questions..." : `Ask ${c.name} anything...`}
                  disabled={hitLimit}
                  style={{ flex: 1, background: "#111", border: "1px solid #222", borderRadius: 8, padding: "0.9rem 1.2rem", color: hitLimit ? "#333" : "#e8e0d0", fontSize: "1rem", fontFamily: "Georgia, serif", outline: "none" }}
                />
                <button
                  onClick={() => hitLimit ? setShowUpgrade(true) : askCryptid()}
                  disabled={loading || (!hitLimit && !question.trim())}
                  style={{ background: hitLimit ? "#130f00" : (loading ? "#111" : c.accent + "22"), border: `2px solid ${hitLimit ? "#3a2800" : (loading ? "#1a1a1a" : c.accent + "66")}`, borderRadius: 8, padding: "0.9rem 1.8rem", color: hitLimit ? "#886600" : (loading ? "#2a2a2a" : c.accent), fontSize: "1rem", cursor: loading ? "not-allowed" : "pointer", fontFamily: "Georgia, serif", whiteSpace: "nowrap", transition: "all 0.3s", fontWeight: 500 }}
                >
                  {loading ? "..." : hitLimit ? "Upgrade" : "Ask"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Answer */}
        {(loading || answer || error) && !isLocked && (
          <div ref={answerRef} style={{ border: `1px solid ${c.accent}22`, borderRadius: 12, padding: "2rem", background: "#0a0a0a", animation: "fadeIn 0.4s ease", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: c.accent, marginBottom: "1rem", transition: "color 0.5s" }}>
              - {c.name} responds -
            </div>
            {loading && (
              <div style={{ color: "#444", fontStyle: "italic", fontSize: "1rem", display: "flex", alignItems: "center", gap: "0.8rem" }}>
                <span style={{ animation: "pulse 1.4s infinite", display: "inline-block" }}>o</span>
                {loadingText}
              </div>
            )}
            {answer && !loading && (
              <p style={{ margin: 0, fontSize: "1.15rem", lineHeight: 2, color: "#d4ccbc", fontStyle: "italic" }}>
                "{answer}"
              </p>
            )}
            {error && <p style={{ margin: 0, color: "#555", fontStyle: "italic", fontSize: "1rem" }}>{error}</p>}
          </div>
        )}

        {/* AD SPACE MIDDLE */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem", padding: "0.8rem", border: "1px dashed #222", borderRadius: 8, color: "#333", fontSize: "0.7rem", letterSpacing: "0.1em" }}>
          AD SPACE
        </div>

        {/* Upgrade prompt */}
        {showUpgrade && !isPro && (
          <div style={{ border: "1px solid #3a2800", borderRadius: 12, padding: "2.5rem", background: "#0c0800", animation: "fadeIn 0.3s ease", textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#886600", marginBottom: "1rem" }}>You've reached the free limit</div>
            <p style={{ margin: "0 0 1.5rem", fontSize: "1.1rem", color: "#aa9966", fontStyle: "italic", lineHeight: 1.8 }}>
              You've used your {FREE_LIMIT} free questions. Upgrade to unlock unlimited questions and {cryptids.filter(cr => !cr.free).length} more cryptids - including the Fresno Nightcrawler, who is just trying to go for a walk and would love to tell you about it.
            </p>
            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setIsPro(true); setShowUpgrade(false); }} style={{ background: "#160f00", border: "2px solid #887700", borderRadius: 8, padding: "0.9rem 2rem", color: "#ffdd00", fontSize: "1rem", cursor: "pointer", fontFamily: "Georgia, serif", letterSpacing: "0.06em", fontWeight: 500 }}>
                Unlock Everything - $4/mo
              </button>
              <button onClick={() => setShowUpgrade(false)} style={{ background: "transparent", border: "1px solid #222", borderRadius: 8, padding: "0.9rem 1.5rem", color: "#444", fontSize: "0.95rem", cursor: "pointer", fontFamily: "Georgia, serif" }}>
                Maybe later
              </button>
            </div>
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "3rem", color: "#222", fontSize: "0.75rem", letterSpacing: "0.1em" }}>
          NOT RESPONSIBLE FOR EXISTENTIAL DREAD - ALL CRYPTIDS SPEAK FOR THEMSELVES - NIGHTCRAWLER JUST WANTS TO WALK
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100%{opacity:0.2} 50%{opacity:1} }
        * { box-sizing: border-box; }
        ::placeholder { color: #333; }
        input:focus { border-color: #444 !important; }
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
        border: `2px solid ${isSelected ? (locked ? "#333" : cr.accent + "77") : "#1a1a1a"}`,
        borderRadius: 12, padding: "0.9rem 0.6rem", cursor: "pointer",
        transition: "all 0.25s ease", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.6rem",
      }}
    >
      <div style={{ position: "relative" }}>
        <img
          src={cr.image}
          alt={cr.name}
          style={{ width: 80, height: 80, borderRadius: 10, objectFit: "cover", filter: locked ? "grayscale(1) brightness(0.3)" : "none", transition: "filter 0.3s", border: `1px solid ${isSelected ? cr.accent + "55" : "#1a1a1a"}` }}
        />
        {locked && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem" }}>🔒</div>
        )}
      </div>
      <div style={{ fontSize: "0.8rem", color: isSelected ? (locked ? "#444" : cr.accent) : (locked ? "#2a2a2a" : "#666"), fontFamily: "Georgia, serif", lineHeight: 1.3, transition: "color 0.3s", fontWeight: isSelected ? 500 : 400 }}>
        {cr.name}
      </div>
    </button>
  );
}
