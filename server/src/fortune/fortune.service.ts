import { Injectable } from '@nestjs/common';

export interface Fortune {
  title: string;
  poem: string;
  advice: string;
  category: string;
}

const FORTUNES: Fortune[] = [
  { title: '上上签 · 紫气东来', poem: '紫气东来祥云绕，\n珠联璧合万事兴。\n贵人相助前程远，\n福泽绵长岁月宁。', advice: '今日宜主动出击，把握良机。事业上有贵人相助，感情方面会遇到心仪之人。佩戴此手串可增强运势。', category: '事业' },
  { title: '上吉签 · 花开富贵', poem: '春风送暖入罗帷，\n花开富贵满庭辉。\n良缘天定终须有，\n锦绣前程任鸟飞。', advice: '感情运势极佳，单身者容易邂逅良缘。已有伴侣者关系更加甜蜜。适合约会、表白。', category: '爱情' },
  { title: '中吉签 · 金玉满堂', poem: '金玉满堂非虚言，\n积善之家有余庆。\n财源滚滚如江水，\n守得云开见月明。', advice: '财运亨通，适合投资理财。但切忌贪心，见好就收。正财偏财皆有收获。', category: '财运' },
  { title: '中平签 · 岁岁平安', poem: '平安二字值千金，\n岁月静好便是福。\n身心康健无烦忧，\n喜乐常伴福满门。', advice: '整体运势平稳，身体健康是最大财富。适合调理身体、养生保健。不宜冒进。', category: '健康' },
  { title: '上吉签 · 步步高升', poem: '青云直上九重天，\n步步高升在眼前。\n勤勉耕耘终有获，\n功成名就笑开颜。', advice: '事业运势旺盛，工作得到认可，有晋升机会。适合展示才华、争取机会。', category: '事业' },
  { title: '中吉签 · 喜结良缘', poem: '千里姻缘一线牵，\n相知相守共百年。\n红鸾星动佳期近，\n愿得一心人白首。', advice: '感情运势上升，容易遇到心仪对象。已有伴侣者感情升温，适合谈婚论嫁。', category: '爱情' },
  { title: '上上签 · 凤舞九天', poem: '凤舞九天彩云追，\n才华横溢众望归。\n前程似锦无限好，\n大展宏图正当时。', advice: '各方面运势皆佳，尤其适合展现才华。机会就在眼前，放手一搏必有所成。', category: '综合' },
  { title: '中平签 · 静水流深', poem: '静水流深暗涌藏，\n不争不抢自芬芳。\n沉淀心绪观时变，\n待得风起再翱翔。', advice: '当前宜静不宜动，适合沉淀学习。表面平静但暗藏机遇，耐心等待最佳时机。', category: '学业' },
  { title: '上吉签 · 福星高照', poem: '福星高照满华堂，\n家和万事俱兴旺。\n心想事成皆如意，\n岁岁年年福绵长。', advice: '家庭运势极佳，适合与家人团聚。家庭和睦带来各方面的好运气。宜居家、置产。', category: '家庭' },
  { title: '中吉签 · 破茧成蝶', poem: '破茧成蝶展新姿，\n历经风雨见彩虹。\n莫道前路多艰险，\n苦尽甘来自有功。', advice: '过去努力即将见到成果，突破在即。保持耐心和信心，很快就能看到回报。', category: '综合' },
];

@Injectable()
export class FortuneService {
  getDailyFortune(): { data: Fortune } {
    const today = new Date().toISOString().split('T')[0];
    const hash = today.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const index = hash % FORTUNES.length;
    return { data: FORTUNES[index] };
  }

  getAllFortunes(): { data: Fortune[] } {
    return { data: FORTUNES };
  }
}