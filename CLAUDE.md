# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Pokemon Team Builder (宝可梦对战队伍配置辅助) — an AI-assisted tool for official format (63 singles / 64 doubles) Pokémon battle team building. The AI acts as a "team-building coach" that helps players understand structural trade-offs, **not** an optimizer that generates optimal teams.

**Current status:** Phase 0 complete (design freeze). Phase 1 (minimal runnable version) is next.

## Build & Development

No package.json or build tooling exists yet. The codebase is TypeScript files without a configured compiler. Per project instructions, **do not run builds or dev servers** — only perform coding work.

## Architecture

```
data/           Curated Pokémon data & role tag definitions (human-maintained)
docs/           Design specs — these are the project's highest-priority constraints
prompt/         LLM prompt construction (the core implementation code)
```

### Key Files

- `prompt/buildTeamPrompt.ts` — Core logic. Defines `Team` and `PokemonSlot` types, builds structured user prompts for the LLM from team state. Exports `buildTeamPrompt(team)` returning `{ system, user }`.
- `prompt/system.ts` — Exports `SYSTEM_PROMPT` constant used by the prompt builder.
- `data/pokemon.json` — Curated Pokémon entries with schema: `{ id, name, types, roles, commonMoves, notes }`. All in Chinese. Currently ~8 entries, target 30-50.
- `data/role-tags.md` — Human-curated role vocabulary (先发, 转场, 物理输出, 特殊输出, 物盾, 特盾, 状态施加, 速度控制, 终结/收割, 节奏点). These tags are **not** model-inferred.

### Core Types (prompt/buildTeamPrompt.ts)

- `Team.format`: `"63-single" | "64-double"`
- `Team.lockedPokemon`: user-locked (cannot be replaced)
- `Team.rejectedPokemon`: user-rejected (must not be suggested)
- `Team.strategyTags`: optional team style hints
- `PokemonSlot`: `{ name, roles, notes? }`

## Design Constraints (from docs/ai-spec.md)

These are **engineering-level highest-priority constraints** — implementation must conform:

1. AI must never generate a complete 6-Pokémon team in one shot
2. AI must never frame suggestions as "the only correct answer"
3. AI must respect user rejections (rejected Pokémon/styles)
4. AI must always explain reasoning, never give conclusions without justification
5. AI gives 2-3 directional options with trade-off analysis, not a single recommendation
6. Role tags in `data/` are human-maintained domain knowledge — do not auto-generate or infer them

**Self-check before adding features:** (1) Does this make AI more judge-like? (2) Does it reduce user participation? (3) Is it replacing user decisions? If any answer is yes, defer to post-MVP.

## Language

All user-facing text, data, prompts, and documentation are in **Chinese (简体中文)**. Code identifiers and comments are in English/Chinese mix.
