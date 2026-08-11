import re

with open(r'c:\Users\mickm\Desktop\测测主队\script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# (club_key, old_vector_tail, new_vector_tail)
# old_vector_tail is the ] } part to disambiguate
adj = [
    ('zhejiang',       'vector:[2,3,5,4,2,3]', 'vector:[3,3,5,5,3,4]'),
    ('shanghai_port',  'vector:[3,2,2,2,2,4]', 'vector:[4,2,2,3,3,4]'),
    ('shanghai_shenhua','vector:[2,3,5,2,5,1]', 'vector:[3,3,5,3,5,2]'),
    ('beijing_guoan',  'vector:[1,5,5,2,5,2]', 'vector:[2,5,5,3,5,3]'),
    ('shandong_taishan','vector:[3,2,3,5,3,2]', 'vector:[3,3,3,5,4,3]'),
    ('chengdu_rongcheng','vector:[1,3,4,1,5,3]', 'vector:[2,3,5,2,5,4]'),
    ('wuhan_three_towns','vector:[2,3,4,1,3,2]', 'vector:[2,3,4,2,3,3]'),
    ('tianjin_jinmen',  'vector:[2,2,5,1,3,1]', 'vector:[2,3,5,1,3,2]'),
    ('changchun_yatai', 'vector:[2,2,4,1,2,1]', 'vector:[2,3,4,1,2,2]'),
    ('henan',           'vector:[1,4,5,1,4,1]', 'vector:[2,4,5,2,4,2]'),
    ('shenzhen_peng',   'vector:[0,1,2,2,1,3]', 'vector:[1,2,3,2,2,3]'),
    ('qingdao_hainiu',  'vector:[1,2,5,1,3,1]', 'vector:[2,3,5,1,3,2]'),
    ('nantong_zhiyun',  'vector:[1,3,5,1,3,1]', 'vector:[1,3,5,1,3,2]'),
    ('cangzhou',        'vector:[1,3,2,1,2,1]', 'vector:[1,3,3,1,2,2]'),
    ('meizhou_hakka',   'vector:[1,2,5,1,2,1]', 'vector:[2,3,5,1,2,2]'),
    ('liaoning_tieren', 'vector:[2,4,5,1,4,2]', 'vector:[2,4,5,2,4,3]'),
]

for key, old_v, new_v in adj:
    pattern = re.compile(r"(\{ key:'" + re.escape(key) + r"'.*?)" + re.escape(old_v), re.DOTALL)
    m = pattern.search(content)
    if m:
        content = content[:m.start(1)] + m.group(1) + new_v + content[m.end():]
        print(f"[OK] {key}: {old_v} -> {new_v}")
    else:
        print(f"[FAIL] {key}")

with open(r'c:\Users\mickm\Desktop\测测主队\script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("\nDone!")
