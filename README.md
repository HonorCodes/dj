# dj

A Claude Code skill that turns Claude into a live electronic music DJ. Claude composes and performs music in real time, pushing patterns to the [Strudel](https://strudel.cc) REPL running in your browser.

An SSE relay server bridges Claude and the browser -- Claude sends code, the relay pushes it to Strudel, and the pattern starts playing instantly. No page refresh, no copy-paste.

## Prerequisites

- Node.js 18+
- A modern browser (Chrome, Firefox, Safari)

## Installation

Clone the repo and install it as a Claude Code skill:

```
git clone https://github.com/honorcodes/dj.git
```

Add the skill to your Claude Code configuration. See the `skill/` directory for the skill definition files.

## Quick Start

```
/dj-setup
```

This starts the SSE relay server, opens Strudel in your browser, and patches it to receive live code pushes.

Then just ask:

```
/dj play me some lo-fi
```

## Genres

26 genres, each with its own phase structure and arrangement arc (no universal template -- every genre gets a purpose-built set structure).

**House Family**
- House, deep house, tech house, progressive house, acid house

**Trance Family**
- Trance, uplifting trance, psytrance

**Techno Family**
- Techno, minimal techno, melodic techno

**Bass Music**
- Drum and bass, liquid DnB, dubstep, future bass

**Breaks & Garage**
- Breakbeat, UK garage, 2-step

**Hard Dance**
- Hardstyle

**Retro**
- Synthwave

**Lo-fi Family**
- Lo-fi hip hop, lo-fi house, lo-fi ambient, lo-fi beats, chillhop (all include vinyl crackle layer)

**Ambient**
- Ambient (single long-form pattern, no discrete phases)

## Mood Modifiers

Append a mood to shape the feel:

- **euphoric** -- big builds, bright chords, peak-time energy
- **dark** -- minor keys, heavy bass, brooding atmosphere
- **melancholic** -- slow pads, detuned leads, wistful melodies
- **funky** -- syncopated grooves, disco bass, rhythmic stabs
- **dreamy** -- reverb-washed pads, gentle arpeggios, soft textures

## Post-Processing Effects

Ask for a spatial treatment to alter the mix:

- **muffled / next room** -- low-pass filtered, sounds like it's bleeding through a wall
- **distant** -- heavy reverb, reduced highs, far-away feel
- **vinyl** -- crackle, warmth, slight wow and flutter
- **tape** -- saturation, hiss, subtle pitch drift

## Ambient Layers

Add a background atmosphere on top of any genre:

- **rain** -- steady rainfall
- **storm** -- thunder, heavy rain, wind
- **cafe** -- murmured conversation, clinking cups
- **fire** -- crackling fireplace
- **night** -- crickets, distant sounds, gentle breeze

## Example Prompts

```
/dj play some deep house with a dreamy mood
/dj dark minimal techno, vinyl effect
/dj lo-fi with rain and cafe ambience
/dj uplifting trance, euphoric, make it build
/dj switch to drum and bass, keep it funky
/dj add a storm layer
/dj make it sound like it's coming from the next room
/dj slow it down, more melancholic
```

## How It Works

1. The SSE relay server (`src/live-relay.mjs`) listens on port 4322
2. Claude generates Strudel pattern code using `setcpm(BPM/4)` tempo and `$:` per-layer syntax
3. The code is pushed to the relay via HTTP POST
4. The browser receives it over SSE and evaluates it in the Strudel REPL
5. Music plays immediately -- transitions happen in real time

In set mode, Claude looks up the genre's specific phase structure (each genre has its own arc -- house uses 7 phases, psytrance uses 6, ambient uses a single long-form pattern, etc.), writes one file per phase, and pushes them on a timed schedule.

## License

MIT
