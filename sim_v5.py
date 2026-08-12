#!/usr/bin/env python3
"""
Simulate v5: Even trait peak distribution across 35 questions.
Parses everything dynamically from script.js to stay in sync.
"""
import re, math, random
from collections import Counter, defaultdict

SCRIPT = r'c:\Users\mickm\Desktop\测测主队\script.js'
with open(SCRIPT, 'r', encoding='utf-8') as f:
    content = f.read()

club_blocks = re.findall(
    r"\{ key:'(\w+)', name:'[^']*', emoji:'[^']*', league:'[^']*',.*?vector:\[([^\]]+)\]\s*\}", content, re.DOTALL)
all_clubs = {k: [int(x.strip()) for x in v.split(',')] for k,v in club_blocks}

t1_match = re.search(r'const TIER1_CLUBS = \[(.*?)\];', content, re.DOTALL)
TIER1 = re.findall(r"'(\w+)'", t1_match.group(1))
print(f"T1 ({len(TIER1)}): {TIER1}")

t2_match = re.search(r'const TIER2_CLUBS = \[(.*?)\];', content, re.DOTALL)
T2_ALL = re.findall(r"'(\w+)'", t2_match.group(1))
TIER3 = [k for k in all_clubs if k not in set(TIER1+T2_ALL)]
print(f"T2: {len(T2_ALL)}, T3: {len(TIER3)}")

persona_match = re.search(r'const PERSONA_TIER_CLUBS = \{(.*?)\};', content, re.DOTALL)
PERSONA_TIER_CLUBS = {}
for m in re.finditer(r"'(\w+)':\s*\{([^}]+)\}", persona_match.group(1), re.DOTALL):
    pname = m.group(1)
    block = m.group(2)
    PERSONA_TIER_CLUBS[pname] = {}
    for tm in re.finditer(r"(\w+):\s*\[(.*?)\]", block, re.DOTALL):
        tier = tm.group(1)
        clubs = re.findall(r"'(\w+)'", tm.group(2))
        PERSONA_TIER_CLUBS[pname][tier] = clubs

print("\n=== Persona T1 pools ===")
for pn in sorted(PERSONA_TIER_CLUBS.keys()):
    t1 = PERSONA_TIER_CLUBS[pn].get('t1', [])
    print(f"  {pn:25s} T1 ({len(t1)}): {t1}")

prov_match = re.search(r'const PROVINCE_CLUB_MAP = \{(.*?)\};', content, re.DOTALL)
PROVINCE_CLUB_MAP = {}
for m in re.finditer(r"'([^']+)':\s*\[(.*?)\]", prov_match.group(1), re.DOTALL):
    PROVINCE_CLUB_MAP[m.group(1)] = re.findall(r"'(\w+)'", m.group(2))
all_provinces = list(PROVINCE_CLUB_MAP.keys())

qs_section = content[content.find('const QUESTIONS'):content.find('];', content.find('const QUESTIONS'))]
raw_traits = re.findall(r'traits:\[([^\]]+)\]', qs_section)
all_options = [[int(x.strip()) for x in rt.split(',')] for rt in raw_traits]
QUESTIONS = [all_options[i:i+4] for i in range(0, len(all_options), 4)]
print(f"\nParsed {len(QUESTIONS)} trait questions ({len(all_options)} options)")

# Verify peaks
peak_counts = {i:0 for i in range(6)}
dim_names = ['honor','spirit','hometown','academy','fans','tactics']
for q in QUESTIONS:
    for opt in q:
        mx = max(opt)
        if mx >= 5:
            peak_counts[opt.index(mx)] += 1
print(f"Peaks: {{{', '.join(f'{dim_names[i]}:{peak_counts[i]}' for i in range(6))}}}")

def cosine(a,b):
    dot = sum(x*y for x,y in zip(a,b))
    na = math.sqrt(sum(x*x for x in a)); nb = math.sqrt(sum(x*x for x in b))
    return dot/(na*nb) if na and nb else 0

def detect_persona(uv):
    labels = ['honor','spirit','hometown','academy','fans','tactics']
    idx = [(uv[i], labels[i]) for i in range(6)]; idx.sort(key=lambda x:x[0],reverse=True)
    gap = idx[0][0]-idx[1][0]; t1=idx[0][1]; t2=idx[1][1]
    if gap>2.0:
        m={'honor':'glory_hunter','spirit':'fighter_spirit','hometown':'hometown_pride',
           'academy':'academy_believer','fans':'fan_culture','tactics':'tactics_nerd'}
        return m.get(t1,'balanced_fan')
    if gap>1.0:
        pair='+'.join(sorted([t1,t2]))
        pm={'academy+fans':'academy_believer','academy+hometown':'hometown_academy',
            'academy+spirit':'fighter_spirit','academy+tactics':'academy_believer',
            'fans+honor':'glory_hunter','fans+hometown':'hometown_pride',
            'fans+spirit':'fan_culture','fans+tactics':'fans_tactics',
            'honor+hometown':'hometown_pride','honor+spirit':'glory_spirit',
            'honor+tactics':'glory_hunter','hometown+spirit':'hometown_pride',
            'hometown+tactics':'hometown_pride','spirit+tactics':'balanced_fan'}
        return pm.get(pair,'balanced_fan')
    return 'balanced_fan'

pop_match = re.search(r'const POPULARITY_BONUS = \{([^}]+)\}', content, re.DOTALL)
pop_bonus = {}
for m in re.finditer(r'(\w+):\s*([\d.]+)', pop_match.group(1)):
    pop_bonus[m.group(1)] = float(m.group(2))

TIER_SPLITS = {
    'glory_hunter':      {'t1': 0.60, 't2': 0.26, 't3': 0.14},
    'fighter_spirit':    {'t1': 0.60, 't2': 0.26, 't3': 0.14},
    'tactics_nerd':      {'t1': 0.60, 't2': 0.26, 't3': 0.14},
    'academy_believer':  {'t1': 0.56, 't2': 0.30, 't3': 0.14},
    'fan_culture':       {'t1': 0.49, 't2': 0.34, 't3': 0.17},
    'glory_spirit':      {'t1': 0.56, 't2': 0.30, 't3': 0.14},
    'hometown_pride':    {'t1': 0.11, 't2': 0.57, 't3': 0.32},
    'hometown_academy':  {'t1': 0.13, 't2': 0.49, 't3': 0.38},
    'fans_tactics':      {'t1': 0.49, 't2': 0.34, 't3': 0.17},
    'balanced_fan':      {'t1': 0.09, 't2': 0.39, 't3': 0.52},
}

def deterministic_hash(s):
    h = 0
    for ch in s:
        h = ((h << 5) - h + ord(ch)) & 0xFFFFFFFF
        if h < 0: h += 0x100000000
    return h

def hash_user_vec(uv):
    return deterministic_hash(','.join(str(round(v, 1)) for v in uv))

def deterministic_tier(persona_type, uv_hash100):
    roll = uv_hash100 / 100.0
    s = TIER_SPLITS.get(persona_type, {'t1': 0.08, 't2': 0.38, 't3': 0.54})
    if roll < s['t1']: return 't1'
    if roll < s['t1'] + s['t2']: return 't2'
    return 't3'

def weighted_select(pool_clubs, uv, htown_clubs, hash_seed):
    weighted = []
    for ck in pool_clubs:
        if ck not in all_clubs: continue
        cos = cosine(uv, all_clubs[ck])
        w = math.pow(max(cos, 0.4), 2) + pop_bonus.get(ck, 0)
        if ck in htown_clubs: w += 0.006
        weighted.append((ck, w))
    if not weighted: return None
    total = sum(w for _, w in weighted)
    roll = (abs(hash_seed) % 10000) / 10000.0
    cumulative = 0
    for ck, w in weighted:
        cumulative += w / total
        if roll < cumulative: return ck
    return weighted[-1][0]

personas = [
    ('Glory_Hunter',[5,1,1,1,1,1]),('Fighter_Spirit',[1,5,1,1,1,1]),
    ('Hometown_Pride',[1,1,5,1,1,1]),('Academy_Believer',[1,1,1,5,1,1]),
    ('Fan_Culture',[1,1,1,1,5,1]),('Tactics_Nerd',[1,1,1,1,1,5]),
    ('Balanced_Fan',[2,2,2,2,2,2]),
]

def simulate(trials=15):
    all_winners = []
    detections = Counter()
    tier_assignments = Counter()
    persona_winners = defaultdict(list)
    for trial in range(trials):
        for pname, weights in personas:
            for htown in all_provinces:
                seed = abs(hash('ws|%d|%s|%s' % (trial, pname, htown))) % (2**31)
                rng = random.Random(seed)
                traits = [0]*6
                for q_options in QUESTIONS:
                    scores = [sum(opt[i]*weights[i] for i in range(6)) for opt in q_options]
                    total = sum(scores) or 1
                    probs = [s/total + rng.random()*0.05 for s in scores]
                    bi = probs.index(max(probs))
                    for i in range(6): traits[i] += q_options[bi][i]
                mint = min(traits); maxt = max(traits)
                rng_val = maxt - mint if maxt > mint else 1
                uv = [((v-mint)/rng_val)*5 for v in traits]
                persona_type = detect_persona(uv)
                detections[persona_type] += 1
                uv_hash = hash_user_vec(uv)
                uv_hash100 = abs(uv_hash % 100)
                tier = deterministic_tier(persona_type, uv_hash100)
                tier_assignments[tier] += 1
                hc = set()
                for prov, cl in PROVINCE_CLUB_MAP.items():
                    if prov == htown: hc.update(cl)
                mapping = PERSONA_TIER_CLUBS.get(persona_type, PERSONA_TIER_CLUBS.get('balanced_fan', {}))
                pool = mapping.get(tier, TIER1 if tier=='t1' else (T2_ALL if tier=='t2' else TIER3))
                club_hash = deterministic_hash('club|' + str(uv_hash))
                winner = weighted_select(pool, uv, hc, club_hash)
                if winner:
                    all_winners.append(winner)
                    persona_winners[pname].append(winner)
    counter = Counter(all_winners)
    n = len(all_winners)
    t1_pct = 100*sum(counter.get(k,0) for k in TIER1)/n
    t2_pct = 100*sum(counter.get(k,0) for k in T2_ALL)/n
    t3_pct = 100*sum(counter.get(k,0) for k in TIER3)/n
    t3_alive = sum(1 for k in TIER3 if counter.get(k,0) > 0)
    dead_t1 = [k for k in TIER1 if counter.get(k,0)==0]
    dead_t2 = sum(1 for k in T2_ALL if counter.get(k,0)==0)
    return t1_pct, t2_pct, t3_pct, t3_alive, dead_t1, dead_t2, counter, persona_winners, n, detections, tier_assignments

print("\n" + "="*60)
print("RUNNING V5 SIMULATION (15 trials x 7 personas x 31 provinces)")
print("="*60)
t1,t2,t3,alive,d1,d2,counter,pw,n,det,ta = simulate(trials=15)

print(f'\nDistribution: T1={t1:.1f}% T2={t2:.1f}% T3={t3:.1f}% (target 50/30/20)')
print(f'T3 alive: {alive}/{len(TIER3)}')
print(f'Dead T1: {d1}')
print(f'Dead T2: {d2}/{len(T2_ALL)}')
print(f'Sample size: {n}')

print(f'\nPersona detections:')
for pn, cnt in det.most_common():
    print(f'  {pn}: {100*cnt/sum(det.values()):.1f}%')

print(f'\nTier assignments:')
for tk in ['t1','t2','t3']:
    print(f'  {tk}: {100*ta.get(tk,0)/sum(ta.values()):.1f}%')

print(f'\n--- T1 ({len(TIER1)}) ---')
for k in sorted(TIER1, key=lambda x: counter.get(x,0), reverse=True):
    pct = 100*counter.get(k,0)/n
    bar = '█' * max(1, int(pct * 2))
    print(f'  {k:20s} {pct:5.1f}% {bar}')

print(f'\n--- T2 TOP 20 ---')
for k in sorted(T2_ALL, key=lambda x: counter.get(x,0), reverse=True)[:20]:
    pct = 100*counter.get(k,0)/n
    if pct > 0.05:
        print(f'  {k:25s} {pct:5.1f}%')

dead_t2_clubs = [k for k in T2_ALL if counter.get(k,0)==0]
if dead_t2_clubs:
    print(f'  Dead ({len(dead_t2_clubs)}/{len(T2_ALL)}): {dead_t2_clubs[:15]}')

print(f'\n--- T3 TOP 20 ---')
t3_sorted = sorted([(k,counter.get(k,0)) for k in TIER3], key=lambda x:x[1], reverse=True)
for k, cnt in t3_sorted[:20]:
    pct = 100*cnt/n
    if pct > 0.05:
        print(f'  {k:25s} {pct:5.1f}%')
print(f'  ({alive} alive, {len(TIER3)-alive} dead out of {len(TIER3)})')

print(f'\n--- PERSONA -> TOP 3 CLUBS ---')
for pname, _ in personas:
    pw_list = pw.get(pname, [])
    if pw_list:
        pc = Counter(pw_list)
        top3 = pc.most_common(3)
        parts = []
        for ck, cnt in top3:
            t = 'T1' if ck in TIER1 else ('T2' if ck in T2_ALL else 'T3')
            parts.append(f'{t}:{ck}({100*cnt/len(pw_list):.0f}%)')
        print(f'  {pname:22s} -> {" | ".join(parts)}')

print(f'\n=== VERIFICATION ===')
if len(d1) == 0:
    print(f'[PASS] All {len(TIER1)} T1 clubs alive!')
else:
    print(f'[FAIL] Dead T1: {d1}')

print(f'\nKey metrics:')
print(f'  Zhejiang: {100*counter.get("zhejiang",0)/n:.1f}%')
print(f'  Atletico: {100*counter.get("atletico",0)/n:.1f}%')
print(f'  PSG:      {100*counter.get("psg",0)/n:.1f}%')
