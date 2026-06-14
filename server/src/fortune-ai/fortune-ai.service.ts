import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export interface AiBeadItem {
  materialId: string;
  colorIndex: number;
}

export interface AiRecommendation {
  mbti: string;
  mbtiDesc: string;
  beads: AiBeadItem[];
  beadCount: number;
  arrangement: string;
}

export interface AiCoupleResult {
  score: number;
  reading: string;
  bead1: AiBeadItem;
  bead2: AiBeadItem;
  comboName: string;
}

function getApiKey(): string {
  try {
    const b64 = fs.readFileSync(path.join(__dirname, '../../.deepseek_key.b64'), 'utf8').trim();
    return Buffer.from(b64, 'base64').toString('utf8');
  } catch {
    return '';
  }
}

const SYSTEM_PROMPT = `你是一位精通心理学与风水搭配的手串设计师。你的任务是根据用户的心理测试回答和手腕尺寸，设计一整串完整的手串。

## 珠子材质库（14种）
- bodhi: 菩提木，古朴淡雅，哑光
- agate: 玛瑙，通透华贵，光泽
- crystal: 水晶，清透灵气，通透
- jade: 玉石，温润典雅，温润
- dzi: 天珠，神秘护佑，光泽
- gilt: 鎏金，璀璨贵气，闪亮
- walnut: 核桃，古朴自然，哑光
- amber: 琥珀，温润凝光，光泽
- coral: 珊瑚，红润吉祥，温润
- lapis: 青金石，深邃尊贵，光泽
- turquoise: 绿松石，清雅灵秀，温润
- beeswax: 蜜蜡，温润凝脂，温润
- obsidian: 黑曜石，神秘辟邪，闪亮

## 分析流程
1. 根据8道测试题判断MBTI性格类型
2. 根据手腕尺寸计算合适的珠子总数（每cm约0.9-1.1颗）
3. 设计整串手串：决定每颗珠子用哪种材质和颜色
4. 说明排列设计理念

## 设计要求
- beadCount = 整串珠子的总数量（根据手腕尺寸计算，范围10-20颗）
- beads 数组的长度必须等于 beadCount
- beads 数组中每颗珠子按顺序排列（从扣子一侧到另一侧）
- 每颗珠子只含 materialId 和 colorIndex（0-4之间的数字）
- 颜色编号：0=第一个色，1=第二个色，以此类推
- 排列要有节奏感，使用2-5种不同材质循环或对称排列

## 返回格式（纯JSON）
{
  "mbti": "4位字母",
  "mbtiDesc": "一句话性格描述",
  "beadCount": 总颗数,
  "arrangement": "排列风格说明",
  "beads": [
    {"materialId": "材质ID", "colorIndex": 数字},
    {"materialId": "材质ID", "colorIndex": 数字},
    ... beadCount 条
  ]
}`;

const COUPLE_SYSTEM_PROMPT = '你是一位精通中国传统八字合婚与五行风水的大师。根据两人出生信息分析缘分。\n\n## 分析依据\n1. 生肖相合相冲\n2. 五行生克\n3. 出生季节性格倾向\n4. 传统合婚理念\n\n## 珠子寓意\n- bodhi 菩提木：清净智慧\n- agate 玛瑙：稳定感情\n- crystal 水晶：心意相通\n- jade 玉石：温润长久\n- dzi 天珠：护佑姻缘\n- gilt 鎏金：旺运势\n- walnut 核桃：朴实坚韧\n- amber 琥珀：守记忆\n- coral 珊瑚：增激情\n- lapis 青金石：理性沟通\n- turquoise 绿松石：自由信任\n- beeswax 蜜蜡：温暖滋养\n- obsidian 黑曜石：护感情\n\n## 返回格式（纯JSON）\n{\n  "score": 0-100整数,\n  "reading": "详细缘分分析，200字左右",\n  "bead1": {"materialId": "珠子ID", "colorIndex": 数字},\n  "bead2": {"materialId": "珠子ID", "colorIndex": 数字},\n  "comboName": "组合名"\n}';

@Injectable()
export class FortuneAiService {
  async recommend(answers: string[], wristSizeCm: number): Promise<{ data: AiRecommendation }> {
    const apiKey = getApiKey();
    if (!apiKey) {
      return this.fallback(wristSizeCm);
    }

    const userMsg = `【心理测试答案】
${answers.map((a, i) => `Q${i + 1}: ${a}`).join('\n')}

【手腕尺寸】${wristSizeCm}cm

请根据以上信息做完整分析。`;

    try {
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: userMsg },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        data: {
          mbti: parsed.mbti || 'INFJ',
          mbtiDesc: parsed.mbtiDesc || '安静的理想主义者',
          beadCount: parsed.beadCount || 14,
          arrangement: parsed.arrangement || '对称排列',
          beads: (parsed.beads || []).slice(0, parsed.beadCount || 14).map((b: any) => ({
            materialId: b.materialId,
            colorIndex: typeof b.colorIndex === 'number' ? b.colorIndex : 0,
          })),
        },
      };
    } catch {
      return this.fallback(wristSizeCm);
    }
  }

  private fallback(wristSizeCm: number): { data: AiRecommendation } {
    const count = Math.min(18, Math.max(10, Math.floor(wristSizeCm * 10 / 9)));
    const beads: AiBeadItem[] = [];
    const pattern = ['jade', 'crystal', 'gilt', 'crystal'];
    for (let i = 0; i < count; i++) {
      const m = pattern[i % pattern.length];
      beads.push({ materialId: m, colorIndex: i % 3 });
    }
    return {
      data: {
        mbti: 'INFJ',
        mbtiDesc: '安静的理想主义者',
        beadCount: count,
        arrangement: '对称排列',
        beads,
      },
    };
  }

  async coupleRecommend(p1: { name: string; year: number; month: number; day: number }, p2: { name: string; year: number; month: number; day: number }): Promise<{ data: AiCoupleResult }> {
    const apiKey = getApiKey();
    const zodiac = (y: number) => ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'][(y - 4) % 12];
    const element = (y: number) => ['金','木','水','火','土'][Math.floor((y - 4) % 10 / 2)];
    const z1 = zodiac(p1.year), z2 = zodiac(p2.year);
    const e1 = element(p1.year), e2 = element(p2.year);
    const season1 = p1.month <= 3 ? '春' : p1.month <= 6 ? '夏' : p1.month <= 9 ? '秋' : '冬';
    const season2 = p2.month <= 3 ? '春' : p2.month <= 6 ? '夏' : p2.month <= 9 ? '秋' : '冬';

    const userMsg = `【第一人】${p1.name}，${p1.year}年${p1.month}月${p1.day}日出生，生肖${z1}，五行${e1}，生于${season1}季
【第二人】${p2.name}，${p2.year}年${p2.month}月${p2.day}日出生，生肖${z2}，五行${e2}，生于${season2}季

请分析两人缘分，推荐最适合的珠子组合。`;

    if (!apiKey) {
      return this.coupleFallback(p1, p2);
    }

    try {
      const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: COUPLE_SYSTEM_PROMPT },
            { role: 'user', content: userMsg },
          ],
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });
      const json = await res.json();
      const content = json.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        data: {
          score: Math.min(100, Math.max(0, parsed.score || 50)),
          reading: parsed.reading || '缘分微妙，需要双方用心经营。',
          bead1: { materialId: parsed.bead1?.materialId || 'jade', colorIndex: parsed.bead1?.colorIndex || 0 },
          bead2: { materialId: parsed.bead2?.materialId || 'crystal', colorIndex: parsed.bead2?.colorIndex || 0 },
          comboName: parsed.comboName || '缘定三生',
        },
      };
    } catch {
      return this.coupleFallback(p1, p2);
    }
  }

  private coupleFallback(p1: any, p2: any): { data: AiCoupleResult } {
    const score = 50 + Math.abs((p1.year + p1.month * p1.day) % 31 - (p2.year + p2.month * p2.day) % 31);
    return {
      data: {
        score: Math.min(100, score),
        reading: '两人的缘分指数中等偏上。生肖相合，五行互补，若能互相理解和包容，感情会更加深厚。建议多沟通，少猜疑。',
        bead1: { materialId: 'jade', colorIndex: 0 },
        bead2: { materialId: 'crystal', colorIndex: 2 },
        comboName: '缘定三生',
      },
    };
  }
}
