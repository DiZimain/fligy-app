# Fligy MVP Concept

## Product idea

`Fligy` is a hardcore productivity companion where the user's real-life discipline directly affects the life of a bonded pet.

The emotional hook is not "complete more tasks", but "keep your creature alive, growing, and safe".

## Positioning

- Format: website first, Telegram Mini App next
- Audience: broad self-improvement audience
- Core fantasy: "My actions shape the condition of my companion"
- Tone: emotional, tense, rewarding

## Why a pet companion works better than a human avatar

- It is universal and does not depend on age, gender, or identity
- Users forgive stylization and abstraction more easily
- Care mechanics feel natural
- Cosmetics, food, habitat, moods, and evolution are easier to design
- Telegram audiences respond well to short emotional loops and collectible visuals

## Core loop

1. User completes a real-life action
2. The action gives rewards to the pet
3. The pet changes state visually and emotionally
4. The player protects a streak and avoids penalties
5. Rewards unlock care items, cosmetics, and habitat upgrades
6. The stronger the bond, the higher the fear of losing progress

## Hardcore layer

The product should feel strict, but not unfair.

Recommended penalty model for MVP:

- Missing key actions reduces `energy`
- Repeated failures reduce `trust`
- Broken streaks remove `shield` charges first
- If the player keeps neglecting the pet, the pet becomes `weak`, `sad`, or `ill`
- Recovery is possible, but requires several good days in a row

Avoid permanent death in V1. It creates rage quits and kills retention too early.

## Companion concept

Start with one original creature instead of a real animal.

Working concept:

- Name: `Fligy`
- Type: small magical companion
- Identity: soft, loyal, slightly mysterious
- States: sleeping, calm, happy, focused, weak, sad, ill, evolving

This gives enough room for both cute and hardcore UX.

## First version MVP

### Main gameplay systems

- Daily tasks
- Habits
- Neurocards
- Streak
- Pet stats
- Coins
- Shop
- Penalties
- Visual pet reactions
- Daily random micro-quest
- Neuro points

## Neurocard system

The main interaction model should shift from plain task items to `neurocards`.

Each neurocard contains:

- clear action title
- trigger or part of day
- instant buffs
- long-term buffs
- neuro point cost
- rank
- progress cells for the current rank

This makes each habit feel like a concrete RPG quest instead of a vague self-improvement intention.

## Buffs and debuffs

Every useful action should have two reward layers:

- `Instant buffs`: what the player feels right away
- `Long-term buffs`: what the player is building into their character over time

The system should also communicate harmful actions as `debuffs`, especially fast-dopamine traps that burn neuro points.

## Rank progression

Neurocards should not be endless.

- A card has 5 progress cells
- Each day of completion fills 1 cell
- When the track is filled, the card ranks up
- Recommended rank ladder: `C -> B -> A -> S -> SS -> SSS`
- Each new rank should slightly increase the card difficulty

This gives closure, momentum, and a reason to keep leveling a habit instead of just checking a box forever.

## Neuro points

Introduce `neuro points` as the main daily cognitive resource.

- Morning baseline: `100 NP`
- Hard quests spend neuro points
- Restorative actions can return a small amount
- Fast dopamine should visibly burn a large amount of NP

This creates a strategic layer around timing and self-control.

### Pet stats for MVP

- `Energy`: drops when the user ignores core actions
- `Mood`: reflects recent success or failure
- `Trust`: long-term relationship meter
- `Evolution XP`: grows from completed actions

### Rewards

- Coins for tasks and habits
- XP for growth and evolution
- Streak bonuses for consistent days
- Random bonus item for perfect days

### Penalties

- Missed day: energy loss
- Missed important task: mood loss
- Several bad days: trust loss
- Broken streak: loss of shield or bonus multiplier

## Daily action model

The first version should support three action types:

- `Habit`: repeatable daily action like sleep, water, gym
- `Task`: one-off meaningful action for the day
- `Project`: deep work or mission step that builds a larger goal
- `Rescue action`: emergency recovery action when the pet is in danger
- `Random quest`: daily novelty mission to break routine

## Win condition for a day

A day counts as protected when the user does at least:

- 1 important task, or
- 2 habits, or
- 1 focus session plus 1 habit

This makes the system strict but still recoverable.

## Screens for V1

### 1. Home

- Pet scene
- Current mood/state
- Streak
- Energy, mood, trust
- Today's actions
- Quick reward feedback

### 2. Actions

- Habit list
- Daily task list
- Complete button with instant animation
- Weight or difficulty marker

### 3. Shop

- Food
- Accessories
- Habitat items
- Protective consumables like shields

### 4. Progress

- Evolution stages
- XP bar
- Weekly history
- Streak calendar

### 5. Recovery / danger state

- Visible warning when the pet is declining
- Recovery plan for the next 24-72 hours
- Limited-time chance to restore stability

## Emotional design principles

- The pet must react often
- Failure should feel uncomfortable, not insulting
- The interface should create attachment before punishment
- Feedback should be visual first, textual second

## Economy for MVP

Simple economy is enough at the start.

- Task complete: `+20 coins`, `+15 XP`
- Habit complete: `+8 coins`, `+10 XP`
- Focus session: `+15 coins`, `+15 XP`
- Perfect day: `+40 bonus coins`
- Streak day 3/7/14: milestone reward
- Missed day: `-25 energy`
- Bad streak break: lose 1 shield if available, otherwise trust penalty

## Website first, Telegram second

### Website phase

- Fast iteration
- Easy visual prototyping
- Easier balancing of mechanics
- Simpler onboarding and testing

### Telegram Mini App phase

- Short daily sessions fit the format
- Notifications and reminders are more native to user behavior
- Viral loops are easier through Telegram sharing and invites

## Technical recommendation

For the first web version:

- Frontend: plain HTML/CSS/JS or React if we want scalable UI fast
- Storage: local state first, then backend
- Backend later: Python FastAPI or Node.js
- First deploy goal: fully playable local prototype

Given the current repository, the fastest path is:

1. Rework the existing web prototype into the pet-companion concept
2. Replace generic productivity widgets with pet stats and action flows
3. Keep storage local while tuning the loop
4. Add backend only after the loop feels addictive

## Next implementation step

The next practical task should be:

`transform the current homepage into a Fligy dashboard with a visible pet, pet stats, today's actions, shop preview, and danger/recovery states`
