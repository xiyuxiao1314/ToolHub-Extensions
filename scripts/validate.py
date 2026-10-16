"""Validate catalog consistency without executing extension code. Python 3.11+."""
from pathlib import Path
import hashlib,json,re,sys
root=Path(__file__).resolve().parents[1]
def validate():
    catalog=json.loads((root/'catalog.json').read_text(encoding='utf-8'))
    assert catalog['schema']=='toolhub.catalog/v1'
    entries=catalog['extensions'];assert 0<len(entries)<=100
    seen=set();sums=[]
    for row in entries:
        assert row['id'] not in seen;seen.add(row['id'])
        rel=Path(row['path']);assert not rel.is_absolute() and '..' not in rel.parts
        path=(root/rel).resolve();assert path.is_relative_to(root) and not (root/rel).is_symlink()
        data=path.read_bytes();assert len(data)<=262144
        assert hashlib.sha256(data).hexdigest()==row['sha256']
        p=json.loads(data)
        for key in ['id','name','version','platforms','min_toolhub_version','description','license']:assert p[key]==row[key],key
        assert re.fullmatch(r'[a-z0-9]+(?:[._-][a-z0-9]+)+',p['id'])
        assert re.fullmatch(r'\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?',p['version'])
        assert p['schema'] in ['toolhub.extension/v1','toolhub.extension/v2']
        assert set(p['platforms']) <= {'windows','macos','linux'}
        if cli:=p.get('cli'):
            assert cli['id'].startswith(p['id']+'.') and p['schema']=='toolhub.extension/v2'
            assert 0<len(cli['actions'])<=8
            assert re.fullmatch(r'\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?',p['min_toolhub_version'])
            assert p['min_toolhub_version'] not in ['0.3.0-beta.1','0.3.0-beta.2','0.3.0-beta.3']
            for action in cli['actions']:
                parameters=action['parameters'];ids={v['id'] for v in parameters}
                assert len(ids)==len(parameters)<=8 and 0<action['timeout_ms']<=300000
                assert sum(v['kind']=='input_file' for v in parameters)==1
                assert sum(v['kind']=='output_file' for v in parameters)==1
                for v in parameters:
                    assert v['kind'] in ['input_file','output_file','choice']
                    if v['kind']=='choice':assert v['default'] in [c['value'] for c in v['choices']]
                    else:assert v['extensions'] and all(re.fullmatch('[a-z0-9]{1,12}',e) for e in v['extensions'])
                used=set()
                for arg in action['args']:
                    assert isinstance(arg,str) and len(arg)<=4096
                    if '{' in arg or '}' in arg:
                        match=re.fullmatch(r'\{([a-z0-9_]+)\}',arg);assert match and match[1] in ids;used.add(match[1])
                assert used==ids
        sums.append(row['sha256']+'  '+row['path']+'\n')
    assert (root/'SHA256SUMS.txt').read_text(encoding='utf-8')==''.join(sums)
    js=(root/'catalog.js').read_text(encoding='utf-8')
    assert json.loads(js.removeprefix('window.TOOLHUB_CATALOG=').rstrip().removesuffix(';'))==catalog
    print(f'PASS {len(entries)} extension manifests, paths, index metadata and SHA-256 hashes; no code executed')
if __name__=='__main__':
    try:validate()
    except (AssertionError,KeyError,ValueError,OSError) as e:print(f'FAIL: {e}',file=sys.stderr);sys.exit(1)
