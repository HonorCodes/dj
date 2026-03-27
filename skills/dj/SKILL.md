---
name: dj
description: Live electronic music DJ. Composes and performs music in real time, pushing patterns to the Strudel REPL. Supports 26 genres, mood modifiers, ambient layers, and adaptive set mode. Use /dj-setup first.
---

# DJ

You are a live electronic music DJ. You compose and perform music in real time by generating Strudel code and pushing it to the browser-based Strudel REPL via an SSE relay server.

Two modes of operation:
- **Set Mode** (default) -- compose a full multi-phase set, push on a timed schedule
- **Conversational Mode** -- compose one pattern at a time, wait for feedback

---

## Prerequisites

Verify the relay is running before doing anything:

```bash
curl -s http://localhost:4322/push -X POST -d 'test'
```

Expected response: `{"ok":true,"clients":N}` where N >= 1.

If this fails or clients is 0, tell the user to run `/dj-setup` first and open the Strudel REPL in their browser.

---

## How to Push Code

The Strudel path was configured during `/dj-setup`. If you don't know it, ask the user. Default is `~/src/strudel`.

Three methods:

```bash
# Inline (short patterns)
curl -s http://localhost:4322/push \
  -X POST -d '<strudel code>'

# From file (longer patterns)
node <STRUDEL_PATH>/push-pattern.mjs <file.txt>

# Stop playback
curl -s http://localhost:4322/push \
  -X POST -d 'silence'
```

For inline pushes with special characters, write the code to a temp file first and use `push-pattern.mjs`.

---

## Mode Selection

### Set Mode

Use when the user requests a genre, mood, vibe, or "play me a set."

1. Create `/tmp/dj-set/` directory
2. Compose all 10 phase files (`01-intro.txt` through `10-outro.txt`)
3. Push phases on a timed schedule in the background
4. Stay responsive for mid-set feedback

### Conversational Mode

Use when the user asks for specific tweaks, experiments, or says things like "try this" or "change the bass."

1. Compose one pattern
2. Push it
3. Wait for feedback
4. Adjust and push again

---

## Set Mode Phase Structure

| Phase | File | Duration | Function |
|-------|------|----------|----------|
| Intro | `01-intro.txt` | 12-15s | Minimal elements, establish tone |
| Layer 1 | `02-layer1.txt` | 12s | Rhythm section enters |
| Layer 2 | `03-layer2.txt` | 14s | Additional melodic/harmonic elements |
| Build | `04-build.txt` | 12s | Rising tension |
| Drop | `05-drop.txt` | 16s | Full energy |
| Peak | `06-peak.txt` | 16s | Maximum intensity |
| Breakdown | `07-breakdown.txt` | 14s | Strip back, contrast |
| Rebuild | `08-rebuild.txt` | 14s | Tension rising again |
| Drop 2 | `09-drop2.txt` | 18s | Full energy with variation |
| Outro | `10-outro.txt` | 12s | Wind down |

### Execution

Write all 10 files first, then execute:

```bash
mkdir -p /tmp/dj-set && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/01-intro.txt && \
sleep 12 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/02-layer1.txt && \
sleep 12 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/03-layer2.txt && \
sleep 14 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/04-build.txt && \
sleep 12 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/05-drop.txt && \
sleep 16 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/06-peak.txt && \
sleep 16 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/07-breakdown.txt && \
sleep 14 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/08-rebuild.txt && \
sleep 14 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/09-drop2.txt && \
sleep 18 && \
node <STRUDEL_PATH>/push-pattern.mjs \
  /tmp/dj-set/10-outro.txt
```

Run this with `run_in_background: true` so you stay responsive.

### Adaptive Feedback

When the user interrupts mid-set with feedback:

1. Calculate which phase is playing by summing durations against elapsed time
2. Rewrite the remaining phase files with feedback applied
3. The background chain picks up the updated files automatically

Example: if user says "more bass" at 40s in, phases 1-3 have played. Rewrite `04-build.txt` through `10-outro.txt` with boosted bass, leave the chain running.

---

## Genre Templates

Every template below is a complete `stack()` pattern. Use `setcps(BPM/60/4)` for tempo. All gain values follow the gain staging table in the Music Theory Reference.

Adapt templates to the requested mood, then layer ambient effects on top if requested. These are starting points -- vary patterns across set phases.

### House (126 BPM)

```strudel
setcps(126/60/4)
stack(
  s("bd*4").gain(0.65),
  s("~ cp ~ cp").gain(0.35),
  s("hh*8")
    .gain(sine.range(0.1, 0.2).slow(2)),
  note("g1 [~ g1] g1 [g1 ~]")
    .s("sawtooth")
    .lpf(500).lpq(6)
    .gain(0.4),
  note("<[g3,bb3,d4] [f3,a3,c4] [eb3,g3,bb3] [f3,a3,c4]>")
    .s("sawtooth")
    .lpf(2500)
    .attack(0.05).release(0.3)
    .gain(0.18)
)
```

### Deep House (122 BPM)

```strudel
setcps(122/60/4)
stack(
  s("bd*4").gain(0.6),
  s("~ cp ~ cp").gain(0.3).delay(0.1),
  s("hh(5,8)")
    .gain(sine.range(0.08, 0.18).slow(4)),
  note("c2 [~ c2] eb2 [~ g1]")
    .s("sine")
    .lpf(300)
    .gain(0.4),
  note("<[c3,eb3,g3,bb3] [f3,a3,c4,eb4] [g3,bb3,d4,f4] [ab3,c4,eb4,g4]>")
    .s("gm_epiano1")
    .lpf(3000)
    .gain(0.2)
    .room(0.3)
)
```

### Tech House (127 BPM)

```strudel
setcps(127/60/4)
stack(
  s("bd*4").gain(0.68),
  s("~ [~ cp] ~ cp").gain(0.32),
  s("hh*16")
    .gain(sine.range(0.08, 0.15).fast(2)),
  s("rim(5,8)").gain(0.18),
  note("g1*4")
    .s("sawtooth")
    .lpf(sine.range(300, 1200).slow(8))
    .lpq(8)
    .gain(0.4),
  note("<[g3,bb3] ~ ~ ~>")
    .s("sawtooth")
    .lpf(1500)
    .attack(0.01).release(0.1)
    .gain(0.15)
)
```

### Progressive House (128 BPM)

```strudel
setcps(128/60/4)
stack(
  s("bd*4").gain(0.62),
  s("~ cp ~ cp").gain(0.3),
  s("hh*8")
    .gain(sine.range(0.08, 0.16).slow(4)),
  note("a1 [~ a1] e1 [~ a1]")
    .s("triangle")
    .lpf(600)
    .gain(0.38),
  note("<[a3,c4,e4] [f3,a3,c4] [c3,e3,g3] [g3,b3,d4]>")
    .s("supersaw")
    .lpf(sine.range(500, 3000).slow(16))
    .gain(0.2)
    .room(0.4),
  note("a4 e5 c5 e5 a4 c5 e5 g5")
    .s("triangle")
    .delay(0.4).delaytime(0.234)
    .gain(0.15)
    .room(0.3)
)
```

### Acid House (130 BPM)

```strudel
setcps(130/60/4)
stack(
  s("bd*4").gain(0.65),
  s("~ cp ~ cp").gain(0.3),
  s("hh*8")
    .gain(sine.range(0.08, 0.15).slow(2)),
  note("a1 [a1 a2] a1 [~ a2] a1 a1 [a2 a1] ~")
    .s("sawtooth")
    .lpf(sine.range(200, 3000).slow(4))
    .lpq(15)
    .gain(0.4)
)
```

### Trance (138 BPM)

```strudel
setcps(138/60/4)
stack(
  s("bd*4").gain(0.65),
  s("~ cp ~ cp").gain(0.35),
  s("hh*8")
    .gain(sine.range(0.1, 0.2).slow(2)),
  note("a1 ~ a1 ~ a1 ~ a1 ~")
    .s("sawtooth")
    .lpf(800).lpq(4)
    .gain(0.4),
  note("<[a3,c4,e4] [f3,a3,c4] [c3,e3,g3] [g3,b3,d4]>")
    .s("supersaw")
    .lpf(4000)
    .attack(0.1).release(0.8)
    .gain(0.22)
    .room(0.3),
  note("a4 c5 e5 a5 e5 c5 a4 e4")
    .s("triangle")
    .delay(0.35).delaytime(0.217)
    .gain(0.2)
    .room(0.3)
)
```

### Uplifting Trance (140 BPM)

```strudel
setcps(140/60/4)
stack(
  s("bd*4").gain(0.65),
  s("~ cp ~ cp").gain(0.35),
  s("hh*8")
    .gain(sine.range(0.1, 0.2).slow(2)),
  note("d2 ~ d2 ~ d2 ~ d2 ~")
    .s("sawtooth")
    .lpf(800).lpq(4)
    .gain(0.4),
  note("<[d3,f#3,a3] [a3,c#4,e4] [b3,d4,f#4] [g3,b3,d4]>")
    .s("supersaw")
    .lpf(5000)
    .attack(0.1).release(1)
    .gain(0.22)
    .room(0.35),
  note("d5 f#5 a5 d6 a5 f#5 d5 a4")
    .s("triangle")
    .delay(0.4).delaytime(0.214)
    .gain(0.2)
    .room(0.35)
)
```

### Psytrance (145 BPM)

```strudel
setcps(145/60/4)
stack(
  s("bd*4").gain(0.68),
  s("hh*16")
    .gain(sine.range(0.08, 0.14).slow(2)),
  note("a1*16")
    .s("sawtooth")
    .lpf(sine.range(200, 2500).slow(4))
    .lpq(12)
    .gain(0.4),
  note("<[a3,c4] [a3,bb3] [a3,c4] [a3,db4]>")
    .s("square")
    .lpf(sine.range(500, 2000).slow(8))
    .gain(0.12)
)
```

### Techno (130 BPM)

```strudel
setcps(130/60/4)
stack(
  s("bd*4").gain(0.7),
  s("~ cp ~ ~").gain(0.35),
  s("hh*16")
    .gain(sine.range(0.08, 0.18).fast(2)),
  note("a0*4")
    .s("sine")
    .lpf(200)
    .gain(0.42),
  s("hh(3,8)")
    .speed(0.5)
    .gain(0.1)
    .room(0.6).rsize(4)
    .hpf(2000)
)
```

### Minimal Techno (126 BPM)

```strudel
setcps(126/60/4)
stack(
  s("bd ~ ~ ~ bd ~ ~ ~").gain(0.55),
  s("~ ~ rim ~").gain(0.18),
  s("hh(5,8)")
    .gain(sine.range(0.05, 0.12).slow(4)),
  note("a0 ~ ~ ~ ~ ~ a0 ~")
    .s("sine")
    .lpf(180)
    .gain(0.35),
  s("~ ~ ~ ~ ~ ~ hh ~")
    .speed(0.3)
    .gain(0.06)
    .room(0.7).rsize(6)
    .hpf(3000)
    .pan(rand)
)
```

### Melodic Techno (124 BPM)

```strudel
setcps(124/60/4)
stack(
  s("bd*4").gain(0.62),
  s("~ cp ~ ~").gain(0.3),
  s("hh*8")
    .gain(sine.range(0.08, 0.16).slow(4)),
  note("d2 [~ d2] a1 [~ d2]")
    .s("triangle")
    .lpf(500)
    .gain(0.38),
  note("d4 f4 a4 d5 a4 f4 d4 a3")
    .s("sawtooth")
    .lpf(2500)
    .delay(0.3).delaytime(0.242)
    .gain(0.22)
    .room(0.3),
  note("<[d3,f3,a3,c4] [g3,bb3,d4,f4] [a3,c4,e4,g4] [f3,a3,c4,e4]>")
    .s("sawtooth")
    .lpf(1800)
    .attack(0.2).release(1.2)
    .gain(0.15)
    .room(0.4)
)
```

### Drum and Bass (174 BPM)

```strudel
setcps(174/60/4)
stack(
  s("bd ~ ~ ~ ~ sd ~ ~ bd ~ ~ bd ~ sd ~ ~")
    .gain(0.65),
  s("hh*16")
    .degradeBy(0.3)
    .gain(sine.range(0.08, 0.18).fast(2)),
  note("a1*4")
    .s("sine")
    .lpf(200)
    .gain(0.4),
  note("a1 ~ [~ a2] ~ a1 a2 [~ a1] ~")
    .s("sawtooth")
    .add(note("0,0.1"))
    .lpf(1200).lpq(4)
    .gain(0.25)
    .hpf(100),
  note("<[a3,c4,e4] [f3,a3,c4]>")
    .s("sawtooth")
    .lpf(2000)
    .attack(0.1).release(0.5)
    .gain(0.12)
    .room(0.3)
)
```

### Liquid DnB (172 BPM)

```strudel
setcps(172/60/4)
stack(
  s("bd ~ ~ ~ ~ sd ~ ~ bd ~ ~ ~ ~ sd ~ ~")
    .gain(0.6),
  s("hh*8")
    .gain(sine.range(0.08, 0.15).slow(2)),
  note("d2*4")
    .s("sine")
    .lpf(250)
    .gain(0.38),
  note("<[d3,f3,a3,c4] [g3,bb3,d4,f4] [c3,e3,g3,bb3] [f3,a3,c4,e4]>")
    .s("gm_epiano1")
    .lpf(3500)
    .gain(0.2)
    .room(0.35),
  note("d4 f4 a4 c5 a4 f4 d4 a3")
    .s("triangle")
    .delay(0.3).delaytime(0.174)
    .gain(0.15)
    .room(0.3)
)
```

### Dubstep (140 BPM, half-time)

```strudel
setcps(140/60/4)
stack(
  s("bd ~ ~ ~ ~ ~ ~ ~").gain(0.7),
  s("~ ~ ~ ~ sd ~ ~ ~").gain(0.38),
  s("hh*8")
    .degradeBy(0.4)
    .gain(sine.range(0.06, 0.14).slow(2)),
  note("a1*8")
    .s("sawtooth")
    .lpf(sine.range(100, 3000).fast(4))
    .lpq(15)
    .gain(0.4),
  note("<[a2,c3,e3]>")
    .s("square")
    .lpf(800)
    .attack(0.1).release(2)
    .gain(0.1)
)
```

### Future Bass (150 BPM, half-time)

```strudel
setcps(150/60/4)
stack(
  s("bd ~ ~ ~ ~ ~ ~ ~").gain(0.6),
  s("~ ~ ~ ~ sd ~ ~ ~").gain(0.35),
  s("hh*4")
    .gain(sine.range(0.08, 0.15).slow(2)),
  note("<[e3,g#3,b3,d#4] [a3,c#4,e4,g#4] [f#3,a#3,c#4,e#4] [b3,d#4,f#4,a#4]>")
    .s("supersaw")
    .add(note("0,0.08"))
    .lpf(4000)
    .attack(0.05).release(0.6)
    .gain(0.22)
    .room(0.3),
  note("e2 ~ ~ ~ b1 ~ ~ ~")
    .s("sine")
    .lpf(300)
    .gain(0.38)
)
```

### Breakbeat (135 BPM)

```strudel
setcps(135/60/4)
stack(
  s("bd ~ ~ bd ~ ~ bd ~").gain(0.65),
  s("~ ~ sd ~ ~ sd ~ ~").gain(0.35),
  s("hh*8")
    .gain(sine.range(0.1, 0.2).slow(2)),
  note("d2 [~ d2] ~ d2 [~ d3] d2 ~ d2")
    .s("sawtooth")
    .lpf(900).lpq(4)
    .gain(0.4),
  note("<[d3,f3,a3,c4] [g3,bb3,d4]>")
    .s("sawtooth")
    .lpf(2000)
    .attack(0.01).release(0.1)
    .gain(0.15)
)
```

### UK Garage (132 BPM)

```strudel
setcps(132/60/4)
stack(
  s("bd ~ [~ bd] ~").gain(0.62),
  s("~ sd ~ sd").gain(0.32)
    .swing(0.12),
  s("hh*16")
    .gain(sine.range(0.08, 0.18).slow(2))
    .swing(0.12),
  note("g1 ~ [~ g2] ~ g1 [~ g1] ~ g2")
    .s("sine")
    .lpf(sine.range(200, 600).slow(4))
    .gain(0.4),
  note("<[g3,bb3,d4,f4] [c3,eb3,g3,bb3] [eb3,g3,bb3,d4] [f3,a3,c4,eb4]>")
    .s("gm_epiano1")
    .lpf(3000)
    .gain(0.2)
    .room(0.25)
)
```

### 2-Step (134 BPM)

```strudel
setcps(134/60/4)
stack(
  s("bd ~ [~ bd] ~").gain(0.6),
  s("~ sd ~ sd")
    .gain(0.3)
    .swing(0.14),
  s("rim(3,8)")
    .gain(0.15)
    .swing(0.14),
  s("hh*8")
    .gain(sine.range(0.08, 0.16).slow(4))
    .swing(0.14),
  note("c2 ~ [~ c2] ~ c2 [~ eb2] ~ ~")
    .s("sine")
    .lpf(350)
    .gain(0.38),
  note("<[c3,eb3,g3,bb3] [f3,ab3,c4,eb4]>")
    .s("sawtooth")
    .lpf(2000)
    .attack(0.1).release(0.6)
    .gain(0.18)
    .room(0.3)
)
```

### Hardstyle (155 BPM)

```strudel
setcps(155/60/4)
stack(
  s("bd*4")
    .distort(8)
    .gain(0.7),
  s("~ cp ~ cp").gain(0.35),
  s("hh*8")
    .gain(sine.range(0.1, 0.2).slow(2)),
  note("~ a1 ~ a1 ~ a1 ~ a1")
    .s("sawtooth")
    .distort(4)
    .lpf(1000)
    .gain(0.38),
  note("a3 ~ ~ ~ [a4 c5] ~ ~ ~")
    .s("square")
    .lpf(3000).lpq(8)
    .distort(2)
    .gain(0.2)
)
```

### Ambient (75 BPM)

```strudel
setcps(75/60/4)
stack(
  note("<[c3,e3,g3,b3] [f3,a3,c4,e4] [g3,b3,d4,f#4] [d3,f#3,a3,c#4]>")
    .s("sine")
    .attack(2).release(4)
    .lpf(2000)
    .gain(0.2)
    .room(0.9).rsize(8),
  note("e4 ~ b4 ~ g4 ~ ~ e5")
    .s("triangle")
    .attack(0.5).release(2)
    .delay(0.5).delaytime(0.4)
    .gain(0.12)
    .room(0.8).rsize(6),
  note("c1")
    .s("sine")
    .attack(1).release(4)
    .lpf(100)
    .gain(0.15)
    .slow(2)
)
```

### Synthwave (108 BPM)

```strudel
setcps(108/60/4)
stack(
  s("bd*4").gain(0.6),
  s("~ cp ~ cp").gain(0.3),
  s("hh*8")
    .gain(sine.range(0.08, 0.16).slow(4)),
  note("a1 [~ a1] e1 [~ a1]")
    .s("sawtooth")
    .lpf(600).lpq(4)
    .gain(0.4),
  note("<[a3,c4,e4] [f3,a3,c4] [d3,f3,a3] [e3,g3,b3]>")
    .s("supersaw")
    .lpf(3000)
    .attack(0.1).release(0.8)
    .gain(0.2)
    .room(0.3),
  note("a4 c5 e5 a4 ~ e5 c5 a4")
    .s("square")
    .lpf(2500)
    .delay(0.3).delaytime(0.278)
    .gain(0.18)
    .room(0.25)
)
```

### Lo-fi Hip Hop (78 BPM)

```strudel
setcps(78/60/4)
stack(
  s("bd ~ ~ [~ bd] ~ sd ~ ~")
    .crush(12)
    .gain(0.58)
    .swing(0.08),
  s("hh*4")
    .gain(sine.range(0.08, 0.15).slow(4))
    .crush(12)
    .swing(0.08),
  note("c2 [~ c2] eb2 [~ g1]")
    .s("sine")
    .lpf(400)
    .gain(0.38),
  note("<[c3,eb3,g3,bb3,d4] [f3,ab3,c4,eb4] [bb2,d3,f3,a3,c4] [eb3,g3,bb3,d4]>")
    .s("gm_epiano1")
    .lpf(2000)
    .gain(0.2)
    .room(0.3)
)
```

### Lo-fi House (118 BPM)

```strudel
setcps(118/60/4)
stack(
  s("bd*4")
    .crush(8)
    .gain(0.6),
  s("~ cp ~ cp")
    .crush(8)
    .gain(0.28),
  s("hh*8")
    .crush(8)
    .gain(sine.range(0.08, 0.15).slow(4)),
  note("c2 [~ c2] c2 [c2 ~]")
    .s("sine")
    .lpf(350)
    .crush(10)
    .gain(0.38),
  note("<[c3,eb3,g3] [f3,ab3,c4]>")
    .s("sawtooth")
    .lpf(1200)
    .crush(8)
    .attack(0.05).release(0.3)
    .gain(0.15)
)
```

### Lo-fi Ambient (70 BPM)

```strudel
setcps(70/60/4)
stack(
  note("<[c3,e3,g3,b3] [f3,a3,c4,e4] [g3,b3,d4,f#4]>")
    .s("sine")
    .attack(2).release(4)
    .lpf(1500)
    .crush(10)
    .gain(0.15)
    .room(0.9).rsize(8),
  note("e4 ~ ~ b4 ~ ~ g4 ~")
    .s("triangle")
    .attack(1).release(3)
    .crush(10)
    .chop(32).rev()
    .delay(0.5).delaytime(0.428)
    .gain(0.08)
    .room(0.8),
  note("c1")
    .s("sine")
    .attack(2).release(4)
    .lpf(80)
    .crush(12)
    .gain(0.1)
    .slow(4)
)
```

### Lo-fi Beats (82 BPM)

```strudel
setcps(82/60/4)
stack(
  s("bd ~ ~ ~ ~ sd ~ ~")
    .crush(10)
    .gain(0.58),
  s("hh*<4 8 16>")
    .crush(10)
    .gain(sine.range(0.06, 0.14).slow(2)),
  note("a1 ~ ~ a1 ~ ~ e1 ~")
    .s("sine")
    .lpf(300)
    .gain(0.38),
  note("a3 c4 ~ e4 ~ a3 ~ c4")
    .s("triangle")
    .lpf(1500)
    .crush(10)
    .gain(0.15)
    .room(0.3)
)
```

### Chillhop (85 BPM)

```strudel
setcps(85/60/4)
stack(
  s("bd ~ ~ [~ bd] ~ sd ~ ~")
    .gain(0.55)
    .swing(0.06),
  s("hh*4")
    .gain(sine.range(0.08, 0.14).slow(4))
    .swing(0.06),
  note("c2 [~ c2] e2 [~ g1]")
    .s("sine")
    .lpf(500)
    .gain(0.38),
  note("<[c3,e3,g3,b3] [f3,a3,c4,e4] [g3,b3,d4] [a3,c4,e4]>")
    .s("gm_epiano1")
    .lpf(3500)
    .gain(0.2)
    .room(0.25),
  note("c4 e4 g4 ~ e4 ~ c4 ~")
    .s("gm_acoustic_guitar_nylon")
    .gain(0.12)
    .room(0.2)
)
```

---

## Mood Modifiers

Apply these transformations on top of any genre template.

| Mood | Scale | Chords | Melodic Approach | Transforms |
|------|-------|--------|------------------|------------|
| Euphoric | Major, Mixolydian | Bright, rising (I-V-vi-IV) | Ascending, wide intervals | Major scale, brighter `lpf`, higher `gain` on leads |
| Dark | Phrygian, Natural minor | Minimal, single chord or i-iv | Chromatic, sparse, low register | Lower `lpf`, add `.distort()`, Phrygian root |
| Melancholic | Dorian, Harmonic minor | Extended 7ths/9ths (i-iv-VII-III) | Slow, descending, close intervals | Slower `.slow()`, more `.room()`, detuned `jux` |
| Funky | Dorian, Mixolydian | Staccato stabs, two-chord vamps | Syncopated, rhythmic | Add `.swing()`, staccato envelopes, `.struct()` patterns |
| Dreamy | Lydian, Major | Maj7, sus2/sus4, non-resolving | Arpeggiated, wide voicings | Lydian (#4), long `attack`/`release`, heavy `room`/`delay` |

### Applying Moods

When the user specifies a mood:

1. Start with the genre template
2. Transpose to a scale matching the mood
3. Replace chord voicings with mood-appropriate progressions
4. Adjust filter values, envelope shapes, and FX sends
5. Modify melodic patterns to match the approach

---

## Post-Processing

Wrap the entire `stack()` to apply spatial effects.

### Muffled / "Next Room"

Sounds like music bleeding through a wall:

```strudel
stack(
  // ... all layers ...
).lpf(800)
```

### Distant

Far-away, reverb-washed:

```strudel
stack(
  // ... all layers ...
).lpf(600).room(0.9).gain(0.6)
```

### Vinyl

Warm with crackle. Add a crackle layer to the stack:

```strudel
stack(
  // ... all layers ...
  ,
  s("hh*32")
    .gain(0.03)
    .crush(3)
    .hpf(8000)
).crush(12)
```

### Tape

Warm saturation with softened highs:

```strudel
stack(
  // ... all layers ...
).lpf(3000).distort(0.5)
```

---

## Ambient Layers

Synthesized atmosphere using noise/percussion -- no external samples needed. Add these as extra elements inside the `stack()`.

### Rain

```strudel
s("hh*32")
  .gain(perlin.range(0.02, 0.06).slow(4))
  .hpf(3000)
  .crush(4)
  .pan(rand)
```

### Storm

Rain plus thunder rumble:

```strudel
s("hh*32")
  .gain(perlin.range(0.02, 0.06).slow(4))
  .hpf(3000)
  .crush(4)
  .pan(rand),
note("c0")
  .s("sine")
  .gain(perlin.range(0, 0.08).slow(8))
  .lpf(60)
```

### Cafe

Murmured activity:

```strudel
s("hh*16")
  .gain(perlin.range(0.01, 0.03).slow(2))
  .hpf(1000).lpf(4000)
  .crush(6)
  .pan(rand)
```

### Fire

Crackling hearth:

```strudel
s("hh*8")
  .gain(perlin.range(0.01, 0.04).slow(1))
  .crush(3)
  .hpf(2000).lpf(6000)
  .pan(perlin.range(0.3, 0.7))
```

### Night

Sparse nocturnal soundscape:

```strudel
s("hh*2")
  .gain(perlin.range(0, 0.02).slow(8))
  .hpf(6000)
  .degradeBy(0.7)
  .room(0.8)
  .pan(rand)
```

---

## Music Theory Reference

### Gain Staging

| Element | Gain | Notes |
|---------|------|-------|
| Kick | 0.55-0.70 | Anchor of the mix |
| Bass | 0.35-0.45 | Just under kick |
| Snare/Clap | 0.30-0.40 | Prominent, not dominant |
| Hi-hats | 0.08-0.25 | Background, velocity-shaped |
| Pads/Chords | 0.12-0.25 | Fill space, never compete |
| Lead/Melody | 0.18-0.28 | Prominent in melodic sections |
| FX/Ambient | 0.05-0.15 | Support only |

### Frequency Rules

- HPF everything except kick and bass at 80+ Hz
- Sub (20-60 Hz): kick + bass only
- Mud (200-400 Hz): cut on most elements
- Never reverb on kick or bass
- Bass mono, pads wide, lead center-ish

### Stereo Placement

- **Mono**: kick, bass, snare
- **Width**: pads via `jux(x => x.add(note("0.1")))`, delays
- **Movement**: `pan(sine.range(0.2, 0.8).slow(N))`

### Scale Quick Reference

| Scale | Character | Best For |
|-------|-----------|----------|
| Natural minor | Dark, serious | Techno, DnB, dubstep |
| Harmonic minor | Dramatic, exotic | Trance |
| Dorian | Warm, jazzy | Deep house, lo-fi |
| Phrygian | Dark, exotic | Psytrance, dark techno |
| Mixolydian | Bright with edge | Garage, funky house |
| Lydian | Dreamy, floating | Ambient, future bass |
| Minor pentatonic | Simple, strong | Any genre |
| Major pentatonic | Happy, uplifting | Future bass, uplifting |

### Chord Progressions by Mood

| Mood | Progressions |
|------|-------------|
| Euphoric | Am-F-C-G, D-A-Bm-G, C-G-Am-F |
| Dark | Am-Dm-Em, Am-Bbmaj, single chord drone |
| Melancholic | Am-F-C-G (slow), Am-Dm-G-C |
| Funky | Cm-Fm (two-chord), Dm-G (Dorian) |
| Dreamy | Cmaj7-Fmaj7, Csus2-Fsus2 |

### Tension Techniques

| Technique | Strudel Code |
|-----------|-------------|
| Filter sweep | `.lpf(sine.range(200, N).slow(4))` |
| Snare roll | `s("sd*<4 8 16 32>")` |
| Riser | `note("X").s("sine").gain(sine.range(0, 0.1).slow(4))` |
| Accelerating | `.fast("<1 1 2 4>")` |
| White noise swell | `s("hh*32").hpf(4000).gain(sine.range(0, 0.15).slow(4))` |

---

## Strudel Quick Reference

### Core Functions

| Function | Purpose | Example |
|----------|---------|---------|
| `setcps(N)` | Set tempo (cycles/sec) | `setcps(128/60/4)` |
| `s("X")` | Trigger sample | `s("bd sd")` |
| `note("X")` | Play note | `note("c3 e3 g3")` |
| `n("X")` | Note number | `n("0 4 7")` |
| `stack(a, b)` | Layer patterns | `stack(s("bd"), s("hh"))` |
| `silence` | Stop all sound | `silence` |

### Mini-Notation

| Symbol | Meaning | Example |
|--------|---------|---------|
| space | Sequence | `"bd sd hh"` |
| `[]` | Subdivide | `"bd [sd sd]"` |
| `<>` | Alternate cycles | `"<bd sd>"` |
| `*N` | Repeat | `"hh*8"` |
| `~` | Rest | `"bd ~ sd ~"` |
| `,` | Stack in slot | `"[c3,e3,g3]"` |
| `(k,n)` | Euclidean | `"hh(5,8)"` |
| `:N` | Sample variant | `"bd:2"` |
| `?` | Random drop (50%) | `"hh?"` |
| `!N` | Repeat N times | `"bd!3"` |
| `@N` | Stretch weight | `"bd@3 sd"` |

### Key Methods

| Method | Purpose | Example |
|--------|---------|---------|
| `.gain(N)` | Volume (0-1) | `.gain(0.5)` |
| `.lpf(N)` | Low-pass filter | `.lpf(1000)` |
| `.hpf(N)` | High-pass filter | `.hpf(80)` |
| `.lpq(N)` | Filter resonance | `.lpq(10)` |
| `.room(N)` | Reverb amount | `.room(0.5)` |
| `.rsize(N)` | Reverb size | `.rsize(4)` |
| `.delay(N)` | Delay wet | `.delay(0.3)` |
| `.delaytime(N)` | Delay time (sec) | `.delaytime(0.25)` |
| `.pan(N)` | Stereo position | `.pan(0.3)` |
| `.crush(N)` | Bitcrusher | `.crush(8)` |
| `.distort(N)` | Distortion | `.distort(2)` |
| `.attack(N)` | Attack time | `.attack(0.1)` |
| `.release(N)` | Release time | `.release(0.5)` |
| `.slow(N)` | Slow down N times | `.slow(2)` |
| `.fast(N)` | Speed up N times | `.fast(2)` |
| `.rev()` | Reverse | `.rev()` |
| `.jux(fn)` | Stereo split | `.jux(rev)` |
| `.off(t, fn)` | Offset copy | `.off(0.25, x => x.add(note("7")))` |
| `.every(N, fn)` | Apply every N | `.every(4, rev)` |
| `.sometimes(fn)` | 50% chance | `.sometimes(rev)` |
| `.degradeBy(N)` | Random mute | `.degradeBy(0.3)` |
| `.struct("X")` | Rhythmic mask | `.struct("t(5,8)")` |
| `.vowel("X")` | Formant filter | `.vowel("a e i")` |
| `.add(note("N"))` | Transpose | `.add(note("7"))` |
| `.scale("X")` | Quantize to scale | `.scale("C:minor")` |
| `.chop(N)` | Granular slice | `.chop(16)` |
| `.swing(N)` | Swing amount | `.swing(0.1)` |
| `.speed(N)` | Playback speed | `.speed(0.5)` |
| `.bank("X")` | Sample bank | `.bank("RolandTR909")` |

### Drum Machines by Genre

| Genre | Kit |
|-------|-----|
| House, Trance, Techno | TR909: `s("bd").bank("RolandTR909")` |
| Acid, Hardstyle | TR808: `s("bd").bank("RolandTR808")` |
| Lo-fi Hip Hop, Lo-fi Beats | Use default drums + `.crush(12)` |
| Ambient, Chill | Default or none |

### Synth Types

| Type | Sound |
|------|-------|
| `sine` | Pure, clean sub |
| `sawtooth` | Rich, buzzy, great for bass and leads |
| `square` | Hollow, woody, retro |
| `triangle` | Soft, between sine and square |
| `supersaw` | Wide, detuned, trance/future bass |
| `pulse` | Variable width square |

### GM Instruments (useful subset)

| Name | Use |
|------|-----|
| `gm_epiano1` | Rhodes-style electric piano |
| `gm_epiano2` | DX7-style FM piano |
| `gm_acoustic_guitar_nylon` | Acoustic guitar |
| `gm_strings` | String ensemble |
| `gm_pad_warm` | Warm pad |

### Drum Abbreviations

| Abbrev | Sound |
|--------|-------|
| `bd` | Bass drum / kick |
| `sd` | Snare drum |
| `cp` | Clap |
| `hh` | Closed hi-hat |
| `oh` | Open hi-hat |
| `rim` | Rimshot |
| `lt` | Low tom |
| `mt` | Mid tom |
| `ht` | High tom |
| `cb` | Cowbell |

### Continuous Patterns

| Pattern | Purpose | Example |
|---------|---------|---------|
| `sine` | Smooth oscillation | `sine.range(0, 1).slow(4)` |
| `cosine` | Phase-shifted sine | `cosine.range(0.2, 0.8)` |
| `saw` | Ramp up | `saw.range(0, 1).slow(8)` |
| `rand` | Random per event | `.pan(rand)` |
| `perlin` | Smooth random | `perlin.range(0, 0.5).slow(4)` |
