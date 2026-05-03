from pathlib import Path
import re
root = Path('c:/Users/SCV/3D Objects/utsav sahay')
for path in root.rglob('app/api/**/*.ts'):
    text = path.read_text(encoding='utf-8')
    if 'NextResponse' not in text:
        continue
    original = text
    text = text.replace("import { NextResponse } from 'next/server'\n", '')
    text = re.sub(r'NextResponse\.json\(([^,]+),\s*\{\s*status:\s*(\d+)\s*\}\)',
                  r'new Response(JSON.stringify(\1), { status: \2, headers: { \'Content-Type\': \'application/json\' } })',
                  text)
    text = re.sub(r'NextResponse\.json\(([^)]+)\)',
                  r'new Response(JSON.stringify(\1), { headers: { \'Content-Type\': \'application/json\' } })',
                  text)
    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Patched {path}')
