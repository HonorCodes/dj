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

**House & Disco**
- Deep house, tech house, minimal house, acid house, disco

**Trance & Progressive**
- Trance, progressive trance, psytrance, uplifting trance

**Techno**
- Techno, minimal techno, industrial techno, dub techno

**Bass Music**
- Drum and bass, dubstep, UK garage, jungle

**Breaks & Downtempo**
- Breakbeat, trip-hop, downtempo, IDM

**Chill**
- Lo-fi, ambient, chillwave, synthwave

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
2. Claude generates Strudel pattern code based on your prompt
3. The code is pushed to the relay via HTTP POST
4. The browser receives it over SSE and evaluates it in the Strudel REPL
5. Music plays immediately -- transitions happen in real time

## License

MIT
