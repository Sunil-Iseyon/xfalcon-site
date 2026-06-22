# Global Filter Architecture & Implementation Guide

**Project:** xFalcon IPL Analytics Hub
**Last Updated:** 2026-03-31
**Scope:** All 10 dashboards, consistent filtering experience

---

## Filtering Strategy

**No Hardcoded Exclusions:** User selected "all seasons included, no exclusions needed" during onboarding.

**Result:** All dashboards include:
- Full 18-season history (2008-2025)
- All 15 active franchises (includes historical teams)
- All 301 players
- All 1,171 matches
- All venues where matches occurred

Filtering is purely **interactive** — users select what they want to see, nothing is filtered out by default.

---

## Primary Filter Dimensions

All dashboards implement these filters in consistent order (left-to-right in topbar or sidebar):

### 1. Season Year Filter

**Type:** Multi-select dropdown or checklist
**Source Table:** DIM_SEASON
**Source Column:** SEASON_YEAR
**Values:** 2008, 2009, 2010, ..., 2025 (18 options)
**Default:** Current season (2025) OR last completed season (2024)
**Behavior:**
- Single or multiple years selectable
- "All Seasons" quick-select option
- Shows season count badge (e.g., "Seasons (3)" if 3 selected)

**SQL Snippet:**
```sql
WHERE SEASON_KEY IN (
  SELECT SEASON_KEY FROM DIM_SEASON
  WHERE SEASON_YEAR IN (:selected_seasons)
)
```

**Implementation Note:**
- Cascade to other filters: Selecting one season enables franchise/venue/player filters appropriately
- Early seasons (2008-2010) may have incomplete data — display warning if selected
- 2020 season: Postponed to UAE (display note about location change)

---

### 2. Franchise/Team Filter

**Type:** Multi-select dropdown or franchise logo grid
**Source Table:** DIM_FRANCHISE
**Source Column:** FRANCHISE_NAME or TEAM_CODE
**Values:** 15 franchises
```
MI (Mumbai Indians)
CSK (Chennai Super Kings)
RCB (Royal Challengers Bangalore)
KKR (Kolkata Knight Riders)
DC (Delhi Capitals, formerly Delhi Daredevils)
RR (Rajasthan Royals)
SRH (Sunrisers Hyderabad)
PBKS (Punjab Kings, formerly Kings XI Punjab)
GT (Gujarat Titans, 2022+)
LSG (Lucknow Super Giants, 2022+)
DD (Delhi Daredevils, 2008-2018, historical)
PW (Pune Warriors, 2015-2016, historical)
RPS (Rising Pune Supergiants, 2016-2017, historical)
CSK Alt (2011-2013 historical variant)
RR Alt (2011 historical variant)
```

**Default:** All franchises (or current 8 franchises if 2024-2025 season)
**Behavior:**
- Single or multiple franchises selectable
- Display franchise logo + team code
- "All Teams" quick-select option
- Home franchise field pre-populated if historical analysis

**SQL Snippet:**
```sql
WHERE FRANCHISE_KEY IN (
  SELECT FRANCHISE_KEY FROM DIM_FRANCHISE
  WHERE TEAM_CODE IN (:selected_teams)
) OR (
  WINNING_TEAM_CODE IN (:selected_teams) OR
  LOSING_TEAM_CODE IN (:selected_teams)
)
```

**Implementation Note:**
- Some historical franchises (DD, PW) ceased operations
- 2022 expansion added GT and LSG (new franchises)
- Filter should show "Active Teams: 8" in 2024-2025 seasons
- Head-to-head dashboard may require "Team A" and "Team B" separate filters

---

### 3. Venue/City Filter

**Type:** Multi-select dropdown or geographic map
**Source Table:** DIM_VENUE
**Source Columns:** VENUE_NAME, CITY, STATE
**Values:** 18 venues
```
Arun Jaitley Stadium (Delhi) — DC home
Wankhede Stadium (Mumbai) — MI home
M.A. Chidambaram Stadium (Chennai) — CSK home
Eden Gardens (Kolkata) — KKR home
Arun Jaitley Stadium (Delhi) — Multi-tenant
Narendra Modi Stadium (Ahmedabad) — GT home
Ekana Cricket Stadium (Lucknow) — LSG home
Rajiv Gandhi International (Hyderabad) — SRH home
Holkar Cricket Stadium (Indore) — Multi-tenant
Bhai Jaan Singh Stadium (Pune) — Multi-tenant
ACA-VDCA Stadium (Visakhapatnam) — Multi-tenant
Bharat Ratna Sardar Vallabhbhai Patel Stadium (Motera) — Alt name for Narendra Modi
...and others
```

**Default:** All venues
**Behavior:**
- Single or multiple venues selectable
- Filter by city: "Mumbai" → shows both Wankhede and any alternate venues
- "All Venues" quick-select option
- Shows venue capacity (informational)
- Geographic context: "3 venues selected"

**SQL Snippet:**
```sql
WHERE VENUE_KEY IN (
  SELECT VENUE_KEY FROM DIM_VENUE
  WHERE VENUE_NAME IN (:selected_venues)
)
```

**Implementation Note:**
- 2020-2021: COVID years used neutral venues in UAE (separate venue records)
- Some venues have multiple names (renovations, rebranding)
- Capacity varies significantly (19K to 132K)
- Display note if international venue selected (limited matches)

---

### 4. Match Type Filter

**Type:** Radio buttons or dropdown
**Source Table:** DIM_MATCH
**Source Column:** MATCH_TYPE
**Values:**
- League (default): Regular season league matches (~56 per season)
- Playoff: All knockout matches (Qualifiers, Eliminators, Finals) (~5-7 per season)
- Both (default): All matches

**Behavior:**
- Single select only (not multi-select)
- "League Stage Only" and "Playoffs Only" quick options
- Shows match count for selection

**SQL Snippet:**
```sql
WHERE MATCH_TYPE IN (
  CASE
    WHEN :match_type = 'League' THEN 'League'
    WHEN :match_type = 'Playoff' THEN ('Playoff', 'Qualifier 1', 'Qualifier 2', 'Eliminator', 'Final')
    ELSE ('League', 'Playoff', 'Qualifier 1', 'Qualifier 2', 'Eliminator', 'Final')
  END
)
```

**Implementation Note:**
- Playoff bracket varies by season (2008-2021 vs. 2022+)
- Finals always single match (high viewership dashboard focus)
- Playoffs more prestigious for player performance metrics

---

### 5. Player Role Filter

**Type:** Multi-select checklist
**Source Table:** DIM_PLAYER
**Source Column:** PLAYER_ROLE
**Values:**
- Batsman
- Bowler
- All-Rounder
- Wicket-Keeper

**Default:** All roles (or context-dependent)
**Behavior:**
- Single or multiple roles selectable
- Shows count per role
- "All Roles" and "Specialist Batsmen Only" quick-select options
- Affects Player Analytics and MVP dashboards primarily

**SQL Snippet:**
```sql
WHERE PLAYER_ROLE IN (:selected_roles)
```

**Implementation Note:**
- Some players multi-functional (wicket-keepers who bat, bowlers who bat)
- FACT_PLAYER_SEASON_STATS has PLAYER_ROLE_SEASON for season-specific classification
- Role affects metric interpretation (batting avg more important for batsmen, economy for bowlers)

---

### 6. Nationality Filter

**Type:** Radio or toggle buttons
**Source Table:** DIM_PLAYER
**Source Column:** NATIONALITY
**Values:**
- Indian
- Overseas (all non-Indian)
- Both (default)

**Behavior:**
- Quick toggle: "Indian" | "Overseas" | "All"
- Shows count (e.g., "175 Indian, 126 Overseas")
- Overseas players include all international nationalities (Australia, South Africa, West Indies, etc.)

**SQL Snippet:**
```sql
WHERE (
  CASE
    WHEN :nationality = 'Indian' THEN NATIONALITY = 'Indian'
    WHEN :nationality = 'Overseas' THEN NATIONALITY != 'Indian'
    ELSE 1=1
  END
)
```

**Implementation Note:**
- IPL rules: Minimum Indians, maximum overseas per XI
- Overseas players command higher auction prices
- Nationality blend important for team composition analysis

---

## Currency Display

### Formatting Rule
All financial values displayed as:

**Primary:** INR Crore (exact amounts)
**Secondary:** USD equivalent in parentheses

**Display Format:**
```
₹45.2 Cr ($5.4M USD)
```

**Conversion:**
```
1 Crore INR ≈ $120,000 USD
Multiply all Crore amounts by 0.12 for USD equivalent
```

**Implementation in HTML:**
```html
<span class="currency-value">
  <span class="crore">₹{amount_cr}</span>
  <span class="usd">($&{amount_cr * 0.12}M USD)</span>
</span>
```

**CSS Styling:**
```css
.currency-value {
  font-family: 'Monaco', monospace;
  font-size: 14px;
  font-weight: 600;
}

.crore {
  color: #F5F7FA; /* Primary text */
  margin-right: 4px;
}

.usd {
  color: #8B95A5; /* Secondary text */
  font-size: 12px;
}
```

### Examples:
```
₹1.5 Cr ($180K USD)           [Auction price]
₹35 Cr ($4.2M USD)            [Total franchise revenue]
₹7 Cr ($840K USD)             [Operating profit]
₹2,100 Cr ($252M USD)         [Franchise valuation]
₹180M ($21.6K USD)            [Gate revenue]
```

### Dashboard Guidelines:
- Tooltip: Show full conversion on hover
- Table columns: Abbreviate to "₹ (Cr)" header, show both in cells
- Charts: Use Crore only (space constraint), convert on hover
- Reports: Full format with USD equivalent

---

## Filter Interdependencies (Cascading Logic)

### Cascade Chain:
```
Season Year Filter
    ↓
Franchise Filter (filtered by franchises active in selected season)
    ↓
Venue Filter (filtered by venues used in selected season)
    ↓
Match Type Filter (filtered by match types played in selected season)
    ↓
Player Role / Nationality (independent, applies to player tables)
```

### Examples:

**Scenario 1: Select 2010 Season**
- Franchise filter shows only 8 franchises (2010 lineup: no GT, LSG, etc.)
- Venue filter shows only 11 venues (limited number of grounds in 2010)
- Match type: League, no Playoffs in 2010 (changed from 2011)
- Player list: 157 unique players in 2010

**Scenario 2: Select 2024 Season + GT Franchise**
- Match type enabled: League + Playoffs (GT qualified)
- Venue filter: Shows venues in India only (no international matches in 2024)
- Player filter: Shows 25 GT players from 2024 roster

**Scenario 3: Select Overseas Players Only**
- Franchise filter: All teams enabled (all have overseas players)
- Player role: All roles enabled (overseas bowlers, batsmen, all-rounders all exist)
- Season: All seasons (overseas players existed throughout)

---

## Filter State Management

### Saving Filter Preferences:
- **Browser Local Storage:** Save user's last-selected filters
- **Session Duration:** Filters persist within same browser session
- **Share Button:** Generate URL with filter state: `https://...dashboard?season=2024&teams=MI,CSK&match_type=League`

### Default State (New User):
```
Season: 2024 (current/latest)
Franchise: All 8 active franchises
Venue: All venues
Match Type: Both (League + Playoffs)
Player Role: All
Nationality: All
```

### Reset Button:
- Single click returns to defaults
- Or "Clear All Filters" option

---

## Filter Validation Rules

### Business Rules:
1. **Cannot filter to zero results**
   - If no matches meet filter criteria, show warning
   - Example: "Overseas only" + "2008 season" → 0 overseas players in 2008
   - Solution: Disable incompatible selections or show disabled option

2. **Season drives validity**
   - Selecting a season enables valid franchises/venues only
   - Grayed-out options for unavailable choices with tooltip

3. **Player filters independent**
   - Role and Nationality filters work on any season/team/venue combination
   - No cascading validation (independent tables)

---

## API/Query Pattern

### Filter Parameter Structure:
```javascript
{
  season_years: [2024, 2023],           // Array of year integers
  franchise_codes: ['MI', 'CSK'],       // Array of team codes
  venues: ['Wankhede Stadium'],         // Array of venue names
  match_type: 'Both',                   // Single: 'League' | 'Playoff' | 'Both'
  player_roles: ['Batsman', 'All-Rounder'],  // Array of roles
  nationality: 'Both'                   // Single: 'Indian' | 'Overseas' | 'Both'
}
```

### SQL WHERE Clause Generation:
```sql
WHERE 1=1
  AND (CASE
    WHEN '{season_years}' != ''
    THEN SEASON_KEY IN (SELECT SEASON_KEY FROM DIM_SEASON WHERE SEASON_YEAR IN ({season_years}))
    ELSE 1=1
  END)

  AND (CASE
    WHEN '{franchise_codes}' != ''
    THEN TEAM_CODE IN ({franchise_codes})
    ELSE 1=1
  END)

  AND (CASE
    WHEN '{venues}' != ''
    THEN VENUE_KEY IN (SELECT VENUE_KEY FROM DIM_VENUE WHERE VENUE_NAME IN ({venues}))
    ELSE 1=1
  END)

  AND (CASE
    WHEN '{match_type}' = 'League' THEN MATCH_TYPE = 'League'
    WHEN '{match_type}' = 'Playoff' THEN MATCH_TYPE IN ('Playoff', 'Qualifier 1', 'Qualifier 2', 'Eliminator', 'Final')
    ELSE 1=1
  END)

  AND (CASE
    WHEN '{player_roles}' != ''
    THEN PLAYER_ROLE IN ({player_roles})
    ELSE 1=1
  END)

  AND (CASE
    WHEN '{nationality}' = 'Indian' THEN NATIONALITY = 'Indian'
    WHEN '{nationality}' = 'Overseas' THEN NATIONALITY != 'Indian'
    ELSE 1=1
  END)
```

---

## Filter UI Component Library

### Filter Button/Dropdown Style:

**Closed State:**
```
[Season ▼]    [Franchises ▼]    [Venues ▼]    [Match Type ▼]    [Player Role ▼]    [Nationality]
```

**Open State (Dropdown Menu):**
```
┌─────────────────────────────────┐
│ Season Year                     │
│ ☐ 2008  ☐ 2009  ☐ 2010  ...   │
│ ☐ 2024  ☐ 2025                │
├─────────────────────────────────┤
│ [All Seasons] [Last 5] [Clear]  │
└─────────────────────────────────┘
```

**Applied Filter Chip:**
```
[Filter] ✕
Example: Season: 2024, Franchises: MI, CSK
```

### Component Specifications:

**Filter Container:**
- Background: Transparent or #152238 (Dark Slate)
- Padding: 12px horizontal
- Border-bottom: 1px solid #1A2D47
- Height: 48px (fits in topbar)

**Filter Dropdown Button:**
- Background: #1A2D47 (Deep Navy)
- Text: #F5F7FA (Off-white), 13px
- Padding: 8px 12px
- Border-radius: 4px
- Hover: Background #006AFF, text #FFFFFF

**Dropdown Menu:**
- Max-height: 400px (scrollable if >8 options)
- Width: Flexible, minimum 200px
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.4)
- Z-index: 1000 (above dashboard content)

**Checkbox in Filter Menu:**
- Size: 18px
- Color unchecked: #1A2D47
- Color checked: #F26522 (Orange)
- Label text: 14px, #F5F7FA

---

## Filter Reset Behavior

### Reset Button:
- Located far-right of filter row (optional)
- Icon: ↻ (refresh icon)
- Tooltip: "Reset all filters to default"
- Action: One click returns to default state (no confirmation)

### Keyboard Shortcut:
- Optional: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) to reset filters

---

## Special Filter Scenarios

### COVID-19 Years (2020-2021)
- 2020: Highlight as "Postponed/Moved to UAE"
- 2021: Highlight as "In UAE"
- Venue filter shows Emirates Old Trafford (Manchester) and Sheikh Zayed Stadium (Abu Dhabi)

### Mega Auction Years (2019, 2022)
- 2019: Display note "Mega Auction - All Franchises Rebuilt"
- 2022: Display note "Mega Auction with GT/LSG Entry"

### Expansion Years
- 2015 (10 teams): Display note "Expansion Year"
- 2022 (10 teams): Display note "Expansion Year (GT, LSG)"

---

## Accessibility Compliance

### Keyboard Navigation:
- Tab key navigates through filters
- Enter key opens dropdown
- Arrow keys navigate options within dropdown
- Space key selects/deselects option
- Escape key closes dropdown

### Screen Reader:
- All filters labeled with <label for="filter-id">
- Dropdown marked as ARIA role="listbox"
- Selected items announced by screen reader
- Filter count announced: "Season filter, 3 of 18 selected"

### Color Blindness:
- Selected options use checkmark + background color
- Not color-dependent only
- "All Seasons" vs. individual selections clear from text

---

## Performance Considerations

### Client-Side Filtering vs. Server-Side:
- **Small dashboards (< 50K rows):** Client-side filter (faster, snappier)
- **Large dashboards (> 100K rows):** Server-side filter (reduce data transfer)

### Caching:
- Cache filter results for 5-10 minutes (user-specific session)
- Clear cache on new filter selection

### Optimization:
- Load only active season's franchises/venues on page load
- Lazy-load player lists (on demand when Player Role filter accessed)

---

## Testing Checklist

- [ ] Season filter loads all 18 seasons correctly
- [ ] Franchise filter disabled for franchises not in selected season
- [ ] Venue filter cascades based on season + franchise
- [ ] Match Type shows only applicable options (Playoffs greyed-out for 2008)
- [ ] Currency conversion accurate (Crore × 0.12 = USD)
- [ ] Filter state saved in local storage (survives refresh)
- [ ] URL share link includes filter parameters
- [ ] Reset button works (returns to defaults)
- [ ] No results handled gracefully (informative message)
- [ ] Keyboard navigation works (Tab, Arrow, Enter, Escape)
- [ ] Screen reader announces filter selections
- [ ] Mobile responsive (filters stack or compress on small screens)

---

**Last Updated:** 2026-03-31
**Review Cycle:** Quarterly (post-IPL season)
**Owned By:** xFalcon Analytics Platform Team
