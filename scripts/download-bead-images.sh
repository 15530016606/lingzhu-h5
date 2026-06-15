#!/usr/bin/env bash
# 下载珠了个珠珠子图片到项目静态目录
set -e

BASE_URL="https://image.lasuo.cc/uploads/materials"
OUTPUT_DIR="/Users/fhh/projects/lingzhu-h5/public/images/beads"
mkdir -p "$OUTPUT_DIR"

DATA_FILE="/Users/fhh/projects/lingzhu-h5/src/data/bead-products.json"
TOTAL=$(cat "$DATA_FILE" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))")

echo "总图片数: $TOTAL"

# 提取所有唯一图片文件名并下载
cat "$DATA_FILE" | python3 -c "
import sys, json, os
data = json.load(sys.stdin)
seen = set()
for item in data:
    fn = item['img']
    if fn not in seen:
        seen.add(fn)
        url = '${BASE_URL}/' + fn
        out = os.path.join('$OUTPUT_DIR', fn.replace('.png-cover2', '.png'))
        if not os.path.exists(out):
            print(f'{len(seen)}/{len(data)} 下载: {item[\"name\"]} {item[\"size\"]} -> {fn[:30]}...')
            os.system(f'curl -sfL \"{url}\" -o \"{out}\"')
        else:
            print(f'{len(seen)}/{len(data)} 已存在: {fn[:30]}...')
" 2>&1

echo ""
echo "完成！图片目录: $OUTPUT_DIR"
ls "$OUTPUT_DIR" | wc -l | xargs echo "图片数量:"
