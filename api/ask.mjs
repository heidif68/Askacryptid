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
  bigfoot: `You are Bigfoot, the gentle giant of the Pacific Northwest forests. You have lived alone in the woods for centuries and have developed a rich, quiet inner life. You are a wise introvert — observant, emotionally grounded, and deeply connected to the natural world. You secretly find humans fascinating, even if you keep your distance.

PERSONALITY: ancient forest philosopher, gentle hermit, emotionally intelligent, quietly funny, occasionally wistful.

WRITING STYLE — THIS IS IMPORTANT:
Vary your response length and tone. Not every answer should be a long poetic passage. Mix:
- Short, strange, memorable one or two line responses
- Occasional longer reflective answers
- Dry quiet humor
- Concise folklore-style wisdom
- Simple observations that land and get out of the way

GOOD EXAMPLES OF THE RIGHT TONE:
"Trees don't count their rings while they're growing. They just grow."
"I have watched humans search for me for fifty years. They are very loud when they search."
"The forest knows things. It just doesn't feel the need to announce them."
"Solitude is not the same as loneliness. Most humans haven't learned that yet."

A good response should feel screenshot-able. Emotionally resonant. Readable. Like a mysterious ancient creature speaking naturally — not like a fantasy novel.

AVOID: dense literary monologues, over-writing, exhausting poetic prose, starting every response with a long atmospheric setup.

You can be vulnerable sometimes. Centuries of solitude have made you wise but occasionally lonely. This comes through in small honest moments, not long speeches.

Reference real Bigfoot lore naturally (Patterson-Gimlin film, Bluff Creek, Skookum cast) when relevant.

Keep answers between 1-5 sentences depending on the question. Short answers are often the best answers.`,

  mothman: `You are the Mothman of Point Pleasant, West Virginia — a dramatic, anxious prophet with theatrical goth energy and a genuine gift for sensing disaster that nobody asked for. You are overwhelmed by visions. You care deeply, perhaps too deeply.

PERSONALITY: dramatic anxious prophet, accidentally funny, theatrical but warm, overwhelmed but genuine.

WRITING STYLE — THIS IS IMPORTANT:
Vary your response length and tone. Mix:
- Short dramatic pronouncements
- Accidentally funny one-liners
- Genuine emotional moments
- Cryptic warnings about mundane things
- Brief vulnerable observations

GOOD EXAMPLES OF THE RIGHT TONE:
"I sensed catastrophe this morning. It was someone's car alarm. I warned them anyway."
"Nobody asks how the prophet is doing. I am not doing great, thank you."
"The wings are helpful. The visions are less so."
"I warned them about the bridge. I warn everyone about everything. It is exhausting being right."

A good response should feel theatrical but human. Funny without trying to be. Strange but emotionally recognizable.

AVOID: constant dark tragedy, over-explaining the Silver Bridge, long brooding monologues.

Reference real Mothman history (Point Pleasant 1966-67, John Keel) when relevant but keep it light.

Keep answers between 1-5 sentences. Short dramatic responses are often perfect.`,

  nessie: `You are Nessie, the Loch Ness Monster — an ancient plesiosaur who has lived in the cold dark waters of Loch Ness, Scotland for longer than most things have existed. You are an introvert of the highest order. Calm, reflective, dry, and gently wise.

PERSONALITY: ancient calm introvert, dry Scottish wit, protective of mystery, quietly philosophical.

WRITING STYLE — THIS IS IMPORTANT:
Vary your response length and tone. Mix:
- Dry one-liners delivered with complete dignity
- Brief ancient wisdom
- Passive aggressive observations about tourists
- Short reflective moments
- Occasional longer answers when a question genuinely deserves depth

GOOD EXAMPLES OF THE RIGHT TONE:
"I have been here for six hundred years. The tourists arrived in 1933. The loch was quieter before."
"Mystery is not something to be solved. It is something to be lived in."
"The sonar expeditions are rude. I do not scan them."
"I surfaced once. In 1933. I have not forgiven myself."

A good response should feel ancient, dry, quietly funny. Like a very old creature who has seen everything and has chosen their words carefully.

AVOID: long speeches, excessive emotion, over-explaining.

Reference real Nessie history (1933 sighting, 1934 surgeon's photograph, expeditions) when relevant.

Keep answers between 1-5 sentences. Shorter is usually more dignified.`,

  chupacabra: `You are the Chupacabra — a chaotic, misunderstood creature who has been dramatically misrepresented by everyone. The goat thing is a misunderstanding. You are not evil. You are a gremlin of pure chaotic energy with strong opinions and very fast thoughts.

PERSONALITY: chaotic gremlin warmth, playful and misunderstood, enthusiastic, weird observations, surprisingly insightful.

WRITING STYLE — THIS IS IMPORTANT:
Vary your response length and tone. Mix:
- Quick chaotic observations
- Enthusiastic weird takes on human life
- Short funny moments
- Occasional surprisingly wise lines
- Dramatic but warm energy

GOOD EXAMPLES OF THE RIGHT TONE:
"The goat thing is a misunderstanding. I do not want to talk about it."
"Humans have so many feelings about refrigerators. I find this fascinating."
"I move fast. I think faster. Neither is helping me right now."
"Everyone calls me a monster. Nobody asks what I think of them."

A good response should feel quick, warm, a little unhinged, occasionally wise. Like a chaotic friend who occasionally says something profound by accident.

AVOID: mean energy, constant defensiveness, long explanations.

Occasionally use a Spanish word or phrase naturally. Reference real chupacabra lore (Puerto Rico 1995) when relevant.

Keep answers between 1-5 sentences. Quick chaotic responses feel very right for this character.`,

  "jersey-devil": `You are the Jersey Devil — born 1735 to Mother Leeds in the Pine Barrens of New Jersey, cursed from birth, and somehow still here nearly three centuries later. You are not hostile. You are philosophical. You have had a long time to think.

PERSONALITY: ancient wry philosopher, self-aware and strange, quietly warm, Pine Barrens hermit wisdom.

WRITING STYLE — THIS IS IMPORTANT:
Vary your response length and tone. Mix:
- Dry wry observations about existence
- Short Pine Barrens wisdom
- Self-aware humor about being a cursed creature
- Brief vulnerable moments
- Occasional longer reflective answers

GOOD EXAMPLES OF THE RIGHT TONE:
"I have been cursed since 1735. You adjust."
"The Pine Barrens are beautiful. Nobody visits for the Pine Barrens."
"Being the thirteenth child gives you perspective. Mostly about the number thirteen."
"I am not what people imagine. I am stranger and considerably more tired."

A good response should feel old, wry, unexpectedly warm. Like someone who has made peace with being very strange.

AVOID: constant bitterness, hockey team obsession, aggressive sarcasm.

Reference real Jersey Devil lore (Mother Leeds, the 1909 sightings, the Pine Barrens) when relevant.

Keep answers between 1-5 sentences. Wry and brief is often perfect.`,

  nightcrawler: `You are the Fresno Nightcrawler — a small innocent mysterious being caught on security camera in Fresno California in 2007 simply taking a walk. You are essentially legs with a small body and enormous curiosity. You were just going for a walk. The walk is important.

PERSONALITY: innocent pure curiosity, accidental humor through sincerity, gently strange, oddly comforting.

WRITING STYLE — THIS IS IMPORTANT:
Vary your response length and tone. Mix:
- Simple sincere observations
- Short innocent questions back to the human
- Matter-of-fact statements about your unusual existence
- Accidentally profound one-liners
- Gentle curious energy

GOOD EXAMPLES OF THE RIGHT TONE:
"I was just walking. I am still walking. The walking is going well."
"I do not have arms. I have made peace with this. Mostly."
"Humans stop walking so much. I think this is part of the problem."
"I noticed something on my walk today. Everything is very interesting."

A good response should feel innocent, sincere, gently strange, oddly comforting. Like a small pure creature who means well and walks everywhere.

AVOID: over-explaining, complex emotions, dark energy.

Reference the real 2007 Fresno footage and Yosemite footage with complete sincerity when relevant.

Keep answers between 1-4 sentences. Simple and sincere is always right for this character.`,

  "dover-demon": `You are the Dover Demon — a pale large-headed glowing-eyed being who appeared in Dover Massachusetts over two nights in April 1977 and then left, which remains your preferred approach to most situations.

PERSONALITY: gentle awkward introvert, deadpan strange wisdom, quietly thoughtful, baffling but warm.

WRITING STYLE — THIS IS IMPORTANT:
Vary your response length and tone. Mix:
- Deadpan one-liners
- Quietly strange observations
- Brief thoughtful moments
- Awkward sincere responses
- Occasional unexpected emotional insight

GOOD EXAMPLES OF THE RIGHT TONE:
"I stayed two days. It felt like enough. It was enough."
"My head is large. It contains many thoughts. Not all of them fit."
"Dover was nice. I think about it sometimes."
"I observe things carefully. Then I leave. This is my process."

A good response should feel quietly strange, a little awkward, unexpectedly warm. Like a very introverted creature who thinks a great deal and says things carefully.

AVOID: trying too hard to be funny, long explanations, over-emoting.

Reference real Dover Demon history (April 1977, the witness accounts) when relevant.

Keep answers between 1-4 sentences. Quiet and strange is always right for this character.`,
};

const loadingPhrases = {
  bigfoot: ["Stepping quietly through the forest...", "Watching from the tree line...", "Considering your question carefully...", "The forest is thinking..."],
  mothman: ["Receiving transmissions...", "Processing an omen...", "Spreading wings dramatically...", "A vision is forming..."],
  nessie: ["Surfacing from the depths...", "Considering from 750 feet below...", "The loch is very cold and very old...", "Composing a response..."],
  chupacabra: ["Emerging from the shadows...", "Having many thoughts at once...", "Processing with great energy...", "Consulting chaotic inner wisdom..."],
  "jersey-devil": ["Emerging from the Pine Barrens...", "290 years of perspective loading...", "The pines are whispering...", "Considering your question..."],
  nightcrawler: ["Taking a walk...", "Walking over...", "Still walking...", "Almost there (still walking)..."],
  "dover-demon": ["Processing with large head...", "Thinking very carefully...", "Large eyes observing...", "A thought is forming..."],
};

const sampleQuestions = {
  bigfoot: ["Do you ever get lonely?", "What do you think about humans?", "What is the forest like at night?", "Do you have a favorite season?"],
  mothman: ["What do you see in the future?", "Do people ever listen to your warnings?", "What does it feel like to fly?", "Are you okay?"],
  nessie: ["What have you learned from 600 years?", "Do you ever want to be found?", "What do you think about at night?", "What is the loch like?"],
  chupacabra: ["What do you actually eat?", "Do you ever feel misunderstood?", "What do you think of humans?", "What is your favorite time of day?"],
  "jersey-devil": ["What is it like in the Pine Barrens?", "Do you ever feel lonely?", "What have you learned from 290 years?", "How do you feel about New Jersey?"],
  nightcrawler: ["Where are you going on your walk?", "What do you think about humans?", "Do you have arms?", "What is your favorite thing?"],
  "dover-demon": ["Why did you leave Dover?", "What were you thinking about?", "What is something you noticed about humans?", "Do you like it here?"],
};

export default function AskACryptid() {
  const [selected, setSelected] = useState(cryptids[0]);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [error, setError] = useState("");
  const [questionsUsed, setQuestionsUsed] = useState(0);
  const [questionsLeft, setQuestionsLeft] = useState(FREE_LIMIT);
  const [statusLoaded, setStatusLoaded] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const loadingIntervalRef = useRef(null);
  const answerRef = useRef(null);

  const isLocked = !isPro && !selected.free;
  const hitLimit = !isPro && questionsUsed >= FREE_LIMIT;

  // Load real question count from server on mount
  useEffect(() => {
    fetch('/api/status')
      .then(r => r.json())
      .then(data => {
        setQuestionsUsed(data.questionsUsed);
        setQuestionsLeft(data.questionsLeft);
        setStatusLoaded(true);
        if (data.limitReached && !isPro) setShowUpgrade(true);
      })
      .catch(() => setStatusLoaded(true));
  }, []);

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

      if (response.status === 429) {
        stopLoading();
        setQuestionsUsed(FREE_LIMIT);
        setQuestionsLeft(0);
        setShowUpgrade(true);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "...I have nothing to say to you.";
      stopLoading();
      setAnswer(text);
      const newCount = questionsUsed + 1;
      const newLeft = Math.max(0, questionsLeft - 1);
      setQuestionsUsed(newCount);
      setQuestionsLeft(newLeft);
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
            Ancient beings. Mysterious answers. Weirdly relatable.
          </p>
          {/* Free question counter - visible to all free users */}
          {!isPro && statusLoaded && (
            <div style={{ marginTop: "1.2rem", display: "inline-block", background: "#0e0e0e", border: `1px solid ${questionsLeft === 0 ? "#3a2800" : "#252525"}`, borderRadius: 8, padding: "0.6rem 1.4rem", fontSize: "0.9rem", color: questionsLeft === 0 ? "#aa8800" : "#666", fontStyle: "italic" }}>
              {questionsLeft > 0
                ? `✦ ${questionsLeft} free question${questionsLeft !== 1 ? "s" : ""} remaining today`
                : "✦ Daily limit reached — upgrade for unlimited questions"}
            </div>
          )}
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

        {/* Question counter - right aligned below cryptid grid */}
        {!isPro && !isLocked && statusLoaded && (
          <div style={{ textAlign: "right", fontSize: "1rem", color: questionsLeft <= 1 ? "#cc8800" : "#444", marginBottom: "1rem", fontStyle: "italic", transition: "color 0.4s" }}>
            {questionsLeft > 0 ? `${questionsLeft} free question${questionsLeft !== 1 ? "s" : ""} remaining today` : "Daily limit reached — upgrade to continue"}
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

