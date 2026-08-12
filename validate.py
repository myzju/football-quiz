import re
content = open(r'c:\Users\mickm\Desktop\测测主队\script.js', 'r', encoding='utf-8').read()
b = content.count('{') - content.count('}')
k = content.count('[') - content.count(']')
p = content.count('(') - content.count(')')
print(f'Brackets: curly={b:+d} square={k:+d} paren={p:+d}')
print('[PASS] All balanced' if b==0 and k==0 and p==0 else '[WARN]')

clubs = re.findall(r"key:'(\w+)'", content)
print(f'Clubs: {len(clubs)} total')

t1m = re.search(r'const TIER1_CLUBS = \[(.*?)\];', content, re.DOTALL)
t1 = re.findall(r"'(\w+)'", t1m.group(1))
print(f'T1 ({len(t1)}): {t1}')

t2m = re.search(r'const TIER2_CLUBS = \[(.*?)\];', content, re.DOTALL)
t2 = re.findall(r"'(\w+)'", t2m.group(1))
print(f'T2: {len(t2)}')
print(f'T3: {len(clubs)-len(t1)-len(t2)}')

qs = len(re.findall(r'\{ id:\d+, question:', content))
fill = content.count("type:'fill'")
print(f'Questions: {qs} total ({qs-fill} trait + {fill} fill-in)')

for fn in ['getDeterministicTier','detectPersona','personaTierSplit',
           'PERSONA_TIER_CLUBS','POPULARITY_BONUS','showResult','cosineSimilarity']:
    status = '[OK]' if fn in content else '[MISS]'
    print(f'  {status} {fn}')

print('Validation complete')
