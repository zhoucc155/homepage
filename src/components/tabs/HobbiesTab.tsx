import React, { useState } from 'react';
import { HOBBIES_DATA } from '../../data/portfolioData';
import { MessageBoardOverlay } from '../MessageBoardOverlay';
import { usePlayer, MusicPlayerContext } from '../MusicPlayerContext';
import type { PlayMode, ViewPlaylistRequest } from '../MusicPlayerContext';
import {
  BookOpen,
  Gamepad2,
  Music,
  Clapperboard,
  Newspaper,
  UtensilsCrossed,
  Compass,
  Ghost,
  Bookmark,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Play
} from 'lucide-react';

// 顶层选择器导轨配置：与 HOBBIES_DATA 的索引一一对应
const HOBBY_TABS: { key: string; label: string; icon: React.ElementType }[] = [
  { key: 'novels-reading', label: '小说阅写', icon: BookOpen },
  { key: 'esports-gaming', label: '电竞观赛', icon: Gamepad2 },
  { key: 'film-music', label: '影视音乐', icon: Clapperboard },
  { key: 'anime-acg', label: '动漫游戏', icon: Ghost },
  { key: 'affairs-history', label: '时政历史', icon: Newspaper },
  { key: 'gourmet-cooking', label: '美食治愈', icon: UtensilsCrossed },
  { key: 'travel-citywalk', label: '时空行旅', icon: Compass },
];

// 手记类互动模块的头部配置（图标 + 点缀色 + 标题）
const NOTE_HEADERS: Record<string, { icon: React.ElementType; iconClass: string; title: string }> = {
  'film-music': { icon: Music, iconClass: 'text-[#F43F5E]', title: '珍藏歌单' },
  'anime-acg': { icon: Ghost, iconClass: 'text-violet-600', title: '心水之作' },
  'affairs-history': { icon: Newspaper, iconClass: 'text-neutral-700', title: '时政与历史手记' },
  'gourmet-cooking': { icon: UtensilsCrossed, iconClass: 'text-rose-600', title: '风味与烹饪手记' },
  'travel-citywalk': { icon: Compass, iconClass: 'text-amber-700', title: '行旅手记' },
};

// 心水之作切换器（仅 anime-acg 使用）：动漫 / 游戏 两组，各 3 件心水作品
const ANIME_PICKS: { key: 'anime' | 'game'; label: string; items: string[] }[] = [
  {
    key: 'anime',
    label: '动漫',
    items: [
      '《进击的巨人》：用环环相扣的悬念结构与世界观反转，把「自由的代价」写成了十年集体记忆。',
      '《鬼灭之刃》：把王道叙事做到极致工业化，是情绪爆点与角色弧线的节奏教科书。',
      '《在下坂本，有何贵干？》：把「帅」风格化到极致，用反差感制造记忆点的案例范本。',
    ],
  },
  {
    key: 'game',
    label: '游戏',
    items: [
      '《魔兽世界》：用社交协作与成长体系构建持续在线的世界，社区归属感的启蒙之作。',
      '《双人成行》：把合作机制本身写成叙事，是强制协作下心流与情感曲线的设计范本。',
      '《塞尔达传说：旷野之息》：用物理与化学引擎把探索自由做成系统级表达，重定义开放世界。',
    ],
  },
];

// 时政与历史手记切换器（仅 affairs-history 使用）：关注的 B 站 UP 主，按细分领域分三页
const POLITY_CHANNELS: { key: 'geo' | 'eco' | 'culture'; label: string; items: string[] }[] = [
  {
    key: 'geo',
    label: '国际时政',
    items: [
      '沈逸老师：复旦学者视角，国际格局与网络空间治理的锐评解读',
      '杨升Alex：一线记者出身的国际时政观察，带着全球南方的视野',
      '玉渊谭天：央视背景，把国际时政拆解到经济逻辑层',
    ],
  },
  {
    key: 'eco',
    label: '财经观察',
    items: [
      '数据库kira：一图财经，用数据图讲透产业与财经热点',
      '南半球聊财经：宏观周期与产业趋势的通俗拆解',
      '硬核的半佛仙人：商业与互联网的暴论外壳、严肃内核',
    ],
  },
  {
    key: 'culture',
    label: '历史人文',
    items: [
      '小约翰可汗：通辽宇宙，用段子讲透亚非拉近代政治史',
      '大象放映室：纪录长片笔法，写影人与时代的互相成就',
      '四月是我的生日：电影深度解说，把作品放回影史与时代语境',
    ],
  },
];

// 珍藏歌单切换器（仅 film-music 使用）：6 个歌单页，每页 4 首
type PlaylistTabKey = 'solo' | 'mood' | 'tipsy' | 'energy' | 'offduty' | 'rock';
// songs 的 bvid：B 站视频 BV 号，配置后点击播放键会通过隐藏 iframe 播放该视频的音频（其余歌曲为纯视觉模拟）
// songs 的 lrc：LRC 歌词原文，播放时在行内滚动展示（方案 A：本地计时器近似时间轴，因为 B 站 iframe 无法读取播放进度）
interface PlaylistSong {
  title: string;
  artist: string;
  duration?: string;
  bvid?: string;
  lrc?: string;
  lrcOffsetMs?: number; // 单曲歌词整体偏移（毫秒），叠加在全局 LRC_OFFSET_MS 上（正值=歌词延后）
}

// B 站 iframe 从挂载到真正出声约有 1~3 秒加载延迟，歌词起表按此常量校准（可按实测调整）
const LRC_OFFSET_MS = 2000;
const LRC_LINE_H = 19; // 歌词行高 px
const RESUME_SEEK_BACK_S = 0.9; // 续播回退量：断点按墙钟记录，含首次点播时 iframe 加载/缓冲的静默期，暂停时音频实际位置比断点早这段时间；B站 t= 直接用断点会让续播前跳丢秒，故回退补偿。校准方法：续播后看歌词与声音是否对齐——歌词超前=调大，滞后=调小（实测 0.7 仍丢秒，0.9 为当前值）
const RESUME_HOLD_MS = 1100; // 续播歌词宽限：iframe 重挂出声前歌词冻结在断点句，过后再走表（下一句时间戳到点自然修正）；歌词恢复走表后仍早于声音就调大，晚于声音就调小（与回退量联动：回退每 +0.2s，本值约 +200ms）

// 解析 LRC：返回按时间升序的 { 秒, 文本 } 列表（忽略空行与无时间戳行）
const parseLrc = (lrc: string) =>
  lrc
    .split('\n')
    .map((line) => {
      const m = line.match(/^\[(\d+):(\d+(?:\.\d+)?)\](.*)$/);
      return m ? { t: Number(m[1]) * 60 + Number(m[2]), text: m[3].trim() } : null;
    })
    .filter((x): x is { t: number; text: string } => !!x && x.text !== '')
    .sort((a, b) => a.t - b.t);

// 《绿洲》歌词（用户提供），已去除重复的元数据行
const LVZHOU_LRC = `[00:02.200]作词 : 徐佳莹/葛大为
[00:03.200]作曲 : 徐佳莹
[00:04.200]编曲 : 陈建骐
[00:31.920]我会唾弃 自己的宽容
[00:39.890]情愿放逐每条背叛的线索
[00:45.579]你的沉着 喧闹得震耳欲聋
[00:51.180]嘲笑我 永远的词穷
[00:59.620]我会庆祝 自己的堕落
[01:06.860]放任爱情恶性循环的作弄
[01:13.770]你的温柔 埋藏甜蜜的阴谋
[01:19.040]怂恿我 做困兽之斗
[01:27.700]你能往前走 我也厌倦了再蹉跎
[01:33.670]紧抱住的绿洲 是残破的海市蜃楼
[01:41.110]你真的要走 我还一厢情愿的奢求
[01:48.650]封印在荒芜的时空 不再前进的我
[02:23.340]我会心疼 自己的成熟
[02:30.670]压抑每个 歇斯底里的念头
[02:38.100]你的借口 浅薄地像根烟头
[02:42.520]熄灭我 最后的渴求
[02:50.870]你能往前走 我也厌倦了再蹉跎
[02:57.400]紧抱住的绿洲 是残破的海市蜃楼
[03:04.710]你真的要走 我还一厢情愿的奢求
[03:12.800]封印在荒芜的时空
[03:19.029]放你向前走 我才看清爱的缺口
[03:25.180]怀抱里的绿洲 是泪水灌溉的朦胧
[03:32.560]现在只能够 无视一厢情愿的倦容
[03:40.110]封印在荒芜的时空 不能再爱的我`;

// 《Hindenburg Lover》双语歌词（用户提供），英文与中文翻译共用同一时间戳
const HINDENBURG_LRC = `[00:02.500]作词 : Anson Long-Seabra
[00:02.500]作曲 : Anson Long-Seabra
[00:03.513]We were floating for days
[00:03.513]我们曾在生活的洪流中浮浮沉沉
[00:07.647]We were flying the way
[00:07.647]我们曾在湛蓝天际上自由翱翔
[00:12.497]That doves do
[00:12.497]就像鸽子一样
[00:16.430]And I loved you
[00:16.430]我曾如此深爱着你
[00:21.168]We were sailing the sky
[00:21.168]我们曾在天际航行
[00:25.909]Watch the clouds passing by
[00:25.909]注视着划过身边的云彩
[00:30.940]Like a dreamland
[00:30.940]简直就像梦境一般
[00:35.050]Where should we land?
[00:35.050]我们应将落在何处
[00:40.047]We were invincible
[00:40.047]我们是所向披靡的
[00:43.928]That’s what they said
[00:43.928]就如人们所说一样
[00:48.435]So indivisible
[00:48.435]我们难舍难分
[00:52.530]Wherever we went
[00:52.530]无论我们去往何方
[00:57.318]Higher and higher, yeah
[00:57.318]就算更高的地方也不害怕
[01:00.833]I guess that we had it all
[01:00.833]我想我们已拥有一切美好事物
[01:05.621]Light up the sky and then
[01:05.621]点亮星空
[01:09.346]We thought that we’d never fall
[01:09.346]我们永不会跌倒
[01:15.120]You were my Hindenburg lover we were flying away
[01:15.120]你曾是我兴登堡号爱人 我们曾要一起远走高飞
[01:19.927]Then we took a wrong turn and it was all up in flames
[01:19.927]但后来我们抉择失误 于是一切化为子虚乌有
[01:24.096]And now I’m staring at the wreckage trying to make it okay
[01:24.096]如今我注视着残骸 试图让一切好起来
[01:28.763]Oh yeah
[01:33.894]And I guess I got burned from the scars on my heart
[01:33.894]我想我的心留下了灼伤的疤痕
[01:38.394]And I’d be lying if I said I didn’t know from the start
[01:38.394]但若我说我从一开始就不知情
[01:42.915]That there was something in between us that would tear us apart
[01:42.915]那我们之间的隔阂会不会让我们痛彻心扉
[01:47.438]Oh yeah
[01:52.492]I can still see your face
[01:52.492]我仍可依稀看清你的容貌
[01:56.876]Looking back through the flames
[01:56.876]回首我们爱情之火
[02:01.519]And I search it
[02:01.519]我寻着蛛丝马迹
[02:06.218]Was it worth it
[02:06.218]这一切是否值得
[02:10.914]No I don’t mind the smoke
[02:10.914]我不介意烟雾弥漫
[02:15.170]But your tears make me choke
[02:15.170]但你的泪水滑落时 令我窒息
[02:19.581]Are you okay?
[02:19.581]你尚且安好?
[02:24.093]Should I go away?
[02:24.093]我是否应离开?
[02:28.076]We were invincible
[02:28.076]我们曾是那么所向披靡
[02:32.162]That’s what they said
[02:32.162]就如他们所说的
[02:36.799]So indivisible
[02:36.799]形影不离的
[02:40.983]Wherever we went
[02:40.983]无论我们身在何处
[02:46.084]Higher and higher, yeah
[02:46.084]就算飞向更高
[02:49.590]We thought that we never fall
[02:49.590]我也觉得我们不会从空掉落
[02:54.666]Light up the sky and then
[02:54.666]点亮星空
[02:58.902]I guess that we had it all
[02:58.902]我想我们亦拥有一切美好
[03:04.764]You were my Hindenburg lover we were flying away
[03:04.764]你曾是我兴登堡号爱人 我们曾要一起远走高飞
[03:09.330]But then we took a wrong turn and it was all up in flames
[03:09.330]但是我们做了一个错误决定 如今一切化为虚有
[03:13.860]And now I’m staring at the wreckage trying make it okay
[03:13.860]而我注视着残骸 试着让一切恢复如初
[03:18.558]Oh yeah
[03:23.865]And I guess I got burned from the scars on my heart
[03:23.865]我想我的内心已经被火焰灼出伤疤
[03:28.311]And I’d be lying if I said I didn’t know from the start
[03:28.311]若我说我从伊始便不知情
[03:32.972]That there was something in between us that would keep us apart
[03:32.972]那我们之间的沟壑会不会让我们心灵分离
[03:37.733]Oh yeah
[04:19.187]You were my Hindenburg lover we were flying away
[04:19.187]你曾是我兴登堡号爱人 我们曾要一起远走高飞
[04:23.786]But then we took a wrong turn and it was all up in flames
[04:23.786]但是那个错误的决定让一切化为灰烬
[04:28.399]And now I’m staring at the wreckage trying make it okay
[04:28.399]如今我注视着残骸 试图让一切重回正轨
[04:33.288]Oh yeah
[04:38.776]And I guess I got burned from the scars on my heart
[04:38.776]我想我的心已不堪负重 伤痕累累
[04:43.257]And I’d be lying if I said I didn’t know from the start
[04:43.257]但若我编织谎言说从开始便不知情
[04:48.101]That there was something in between us that would keep us apart
[04:48.101]我们之间的沟壑会不会让两个人的心绪不再交织
[04:53.146]Oh yeah`;

// 《哀人》歌词（用户提供），已去除尾部制作人员名单，时间戳已整体延后 2.2s
const AIREN_LRC = `[00:02.200]作词 : 门尼
[00:03.200]作曲 : 门尼
[00:04.200]编曲 : 陈竹
[00:05.200]制作人 : 陈竹
[00:18.910]喜欢一个人呆着
[00:22.840]聚会之后的轻松
[00:25.930]一整天 好像全都被慵懒吸收
[00:32.680]有时也会巴不得
[00:36.550]把热烈揣满裤兜
[00:39.490]欢笑间 总怕闪过失控的哀愁
[00:45.670]外面的世界阳光明媚
[00:49.000]但愿会溶解心房以内
[00:52.420]若你看到缺口别逃走
[00:56.200]那是我的温柔
[01:00.460]好羡慕那种本领  看别人歇斯底里
[01:03.640]也不找自己的原因
[01:05.560]你看我 多礼貌的我
[01:07.840]关了灯反了锁
[01:09.820]躲到下陷的被窝
[01:11.290]向影子发了火
[01:13.330]说不出口 心里却吼得嘶哑
[01:16.690]习惯左右 冷不防陷入低气压
[01:19.840]能不能够 从此以后 毫无保留
[01:25.360]SHUT  UP!
[01:26.710]她随意说的话  远比我想得复杂
[01:30.040]吵的最后一架  远比我想得尴尬
[01:33.550]她眼睛里的我  远比我想得廉价
[01:38.620]没人比我更傻
[01:40.420]外面的世界阳光明媚
[01:43.840]但愿会溶解心房以内
[01:47.230]若你看到缺口别逃走
[01:51.100]那是我的温柔
[01:54.100]外面的我一定要颓废
[01:57.550]才能让崩溃与我匹配
[02:00.970]明明伤的是我还是我
[02:04.810]怎还有点后悔
[02:22.450]记忆学会安静了
[02:26.350]安静得像个黑洞
[02:29.260]可碎片 还是翻涌的不知轻重
[02:36.040]删掉还是舍不得
[02:39.970]总好奇他的推送
[02:42.970]渐渐的  风吹草动都隐隐作痛
[02:50.200]还能笑 还能扛得住
[02:53.650]迷了路 还有新退路
[02:57.130]但连呼吸都在卖力的演出
[03:00.460]演不出 毫不在乎
[03:02.920]不堪的 不甘的 交织着忙忙碌碌
[03:06.310]麻痹的 逃避的 乏力着反反复复
[03:09.730]眼里的乌云密布
[03:11.470]下起了嫉妒愤怒
[03:13.270]被丢掉的生日礼物
[03:14.770]和我一样被辜负
[03:16.480]哀人明白 过期的人不该一去不回
[03:22.330]至少
[03:23.260]哀人明白 好多是我活该
[03:27.160]活该总被浪费
[03:30.100]外面的世界阳光明媚
[03:33.550]但愿会溶解心房以内
[03:36.940]若你看到缺口别逃走
[03:40.780]那是我的温柔
[03:43.990]外面的我一定要颓废
[03:47.260]才能让崩溃与我匹配
[03:50.680]明明伤的是我还是我
[03:54.490]怎还有点后悔
[03:57.970]哀人明白 过期的人不该一去不回
[04:03.520]至少
[04:04.390]哀人明白 好多是我活该
[04:08.650]哀人总被浪费`;

// 《Fruit Fly》双语歌词（用户提供，英文与中文翻译共用同一时间戳），时间戳已整体延后 2.2s
const FRUITFLY_LRC = `[00:11.460]Wasting away
[00:11.460]日渐消瘦，
[00:14.530]With a mouthful of sweet things
[00:14.530]满口甜蜜
[00:19.220]I never knew my place
[00:19.220]我从来都不知道我的归属之地
[00:22.510]Biting more than I can swallow
[00:22.510]贪心啃噬 难以下咽
[00:27.110]I don’t wanna win
[00:27.110]我不想大获全胜
[00:29.980]She can keep all of her kills
[00:29.980]猎获可全归于她
[00:34.580]A long and hungry chase
[00:34.580]一场漫长的饥渴追逐
[00:38.490]Away from the shallows
[00:38.490]远离浅滩险境
[00:52.120]Now I sleep alone in your room again
[00:52.120]如今我独自一人 又在你的房间里酣然入睡
[00:59.980]Counting cracks in the ceiling
[00:59.980]细数天花裂痕蔓延
[01:07.480]I hear your car in the distance thru the rain
[01:07.480]我在雨中听到远处传来你汽车的声音
[01:15.710]But you're not coming in
[01:15.710]却不见你踏入
[01:23.690]I hear your car in the distance thru the rain
[01:23.690]我在雨中听到远处传来你汽车的声音
[01:46.470]One, two, three, four, five.
[01:46.470]一 二 三 四 五
[01:48.050]Once I caught a fish alive.
[01:48.050]曾捕获一尾活鱼
[01:50.140]Six, seven, eight, nine, ten.
[01:50.140]六 七 八 九 十
[01:52.440]Then I let it go again.
[01:52.440]又任它游走
[01:54.680]Why did you let it go?
[01:54.680]为何纵它离去？
[01:57.640]Because it bit my finger so.
[01:57.640]因它咬疼我指心
[02:11.180]Now I sleep alone in your room again
[02:11.180]如今我独自一人 又在你的房间里酣然入睡
[02:19.190]Counting cracks in the ceiling
[02:19.190]细数天花裂痕蔓延
[02:26.740]I hear your car in the distance thru the rain
[02:26.740]我在雨中听到远处传来你汽车的声音
[02:35.020]But you're not coming in
[02:35.020]却不见你踏入
[02:42.250]Now I sleep alone in your room again
[02:42.250]如今我独自一人 又在你的房间里酣然入睡
[02:50.850]Counting cracks in the ceiling
[02:50.850]细数天花裂痕蔓延
[02:58.390]I hear your car in the distance thru the rain
[02:58.390]我在雨中听到远处传来你汽车的声音
[03:06.680]But you're not coming in
[03:06.680]终不见你归来
[03:29.290]Nobody loves you like I do, babe
[03:29.290]没有人像我这样深爱着你 宝贝
[03:36.630]Nobody loves you like I do, babe
[03:36.630]没有人像我这样深爱着你 宝贝
[03:44.880]Nobody loves you like I do, babe
[03:44.880]没有人像我这样深爱着你 宝贝
[03:52.710]Nobody, nobody, nobody
[03:52.710]再没有 再没有
[04:17.610]I flutter in circles never landing on nothing
[04:17.610]我不断盘旋 从未找到落处
[04:26.050]I am dying as am waiting
[04:26.050]当我默默等待时 我在垂死挣扎
[04:29.820]I have no place to call home now
[04:29.820]如今我漂泊无依 找不到归宿
[04:33.760]I flutter in circles never landing on nothing
[04:33.760]我不断盘旋 从未找到落处
[04:41.740]I am dying I am waiting
[04:41.740]我奄奄一息 却还在默默等待
[04:45.760]Never landing on nothing
[04:45.760]从未找到落处`;

// 《小鸠（After Life After Death）》歌词（用户提供），时间戳已整体延后 2.2s
const XIAOJIU_LRC = `[00:02.200]作词 : 翁传杰
[00:03.200]作曲 : 翁传杰
[00:04.200]编曲 : 浅水ShallowEnd/迟木
[00:05.200]制作人 : 迟木
[00:06.200]监制 : 陈鸿宇
[00:07.200]人声 : 翁传杰/门门Blur
[00:08.200]吉他 : 李兆辰/翁传杰
[00:09.200]贝斯 : 欧阳睿聪
[00:10.200]鼓 : 冉继业
[00:11.200]小号 : 佟志达
[00:12.200]合成器 : SOMA音乐
[00:13.200]和声 : 翁传杰
[00:14.200]采样 : 刘榕蓉
[00:15.200]录音 : 迟木/张俊
[00:16.200]混音 : 迟木
[00:17.200]录音棚 : 玩乐录音棚/迟木工作室/幽兰录音棚
[00:18.200]弦乐编曲 : 迟木
[00:19.200]弦乐录音 : 王昆
[00:20.200]弦乐 : 国际首席爱乐乐团
[00:21.200]弦乐录音棚 : 2496Top Music
[00:22.200]封面设计 : Flashop
[00:23.200]出品 : 做梦唱片
[00:24.200]出品人 : 陈鸿宇
[02:48.200]活在 你在
[02:53.270]如草芥的存在
[02:59.260]盼未来的未来
[03:06.450]拜世事有安排
[03:13.650]而现在 仍还
[03:19.960]恨过去难更改
[03:26.860]怀念谁的责怪
[03:33.700]可世事难重来`;

// 《Training Season》歌词（用户提供，中英对照）
const TRAININGSEASON_LRC = `[00:00.000]作曲 : Kevin Parker/Tobias Jesso Jr./Dua Lipa/Danny L Harle/Caroline Ailin
[00:08.420]Are you, someone that I can give my heart to?
[00:08.420]你是值得托付真心的良人
[00:14.380]Or just the poison that I’m drawn to?
[00:14.380]还是让我沉沦的蛇蝎之毒？
[00:18.340]It can be hard to tell the difference late at night.
[00:18.340]深夜里 这二者实在难以分辨
[00:23.880]Play fair, is that a compass in your nature?
[00:23.880]坦诚相待 是你天性如指南针一样正直
[00:29.950]Or are you tricky cause I been there
[00:29.950]还是因为我曾经受过欺骗 你才显得捉摸不定？
[00:34.110]And baby I don’t need to learn that lesson twice.
[00:34.110]宝贝 我不愿再重蹈覆辙
[00:42.010]But if you really wanna go there…
[00:42.010]如果你真的想和我深入交往
[00:45.630]You should know I
[00:45.630]那就该知道 我需要的是
[00:47.350]Need someone to hold me close
[00:47.350]能紧紧拥我入怀的真命天子
[00:49.140]Deeper than I’ve ever known
[00:49.140]要比我所有前任都投入这段感情
[00:51.070]Whose love feels like a rodeo
[00:51.070]给我的爱 犹如跌宕起伏的竞技
[00:52.940]Knows just how to take control
[00:52.940]懂得必要时 怎么掌控局面
[00:55.470]When I’m vulnerable
[00:55.470]在他面前 我能全然袒露脆弱
[00:56.980]He’s straight talking to my soul
[00:56.980]他的话语直抵灵魂
[00:58.750]Conversation overload, got me feeling vertigo
[00:58.750]与我交流时 滔滔不绝 让我仿佛坠入漩涡 无法自拔
[01:05.150]Are you somebody who can go there?
[01:05.150]你能做到吗？
[01:08.970]Cause I don’t wanna have to show ya
[01:08.970]我不想一遍遍再三确认
[01:12.840]if that aint you then let me know yeah
[01:12.840]要是你做不到 那就告诉我
[01:16.460]Cause training season’s over
[01:16.460]因为感情磨合的训练季已经结束了
[01:26.370]I tried, to see my lovers in a good light
[01:26.370]我努力将我的恋人往好处想
[01:32.390]Don’t wanna do it just to be nice
[01:32.390]并非虚伪客气 也非矫揉造作
[01:36.310]Don’t wanna have to teach you how to love me right.
[01:36.310]我只期待他们懂得如何爱我 无需我谆谆教导
[01:41.870]I hope, it hits me like an arrow
[01:41.870]我希望爱来得电光火石 像一箭穿心般炙热
[01:47.310]Someone with some potential
[01:47.310]难道遇到能与之共度未来的伴侣
[01:51.110]Is it too much to ask for, who understands I
[01:51.110]渴望一份理解 是奢求吗？
[01:57.580]Need someone to hold me close
[01:57.580]我需要的是 能紧紧拥我入怀的真命天子
[01:59.240]Deeper than I’ve ever known
[01:59.240]要比我所有前任都投入这段感情
[02:01.120]Whose love feels like a rodeo
[02:01.120]给我的爱 犹如跌宕起伏的竞技
[02:03.090]Knows just how to take control
[02:03.090]懂得必要时 怎么掌控局面
[02:05.660]When I’m vulnerable
[02:05.660]在他面前 我能全然袒露脆弱
[02:07.100]He’s straight talking to my soul
[02:07.100]他的话语直抵灵魂
[02:08.920]Conversation overload, got me feeling vertigo
[02:08.920]与我交流时 滔滔不绝
[02:15.390]Are you somebody who can go there?
[02:15.390]你能做到吗？
[02:19.190]Cause I don’t wanna have to show ya
[02:19.190]我不想一遍遍再三确认
[02:23.030]if that aint you then let me know yeah
[02:23.030]要是你做不到 那就告诉我
[02:26.870]Cause training season’s over
[02:26.870]因为感情磨合的训练季已经结束了
[02:29.790]Can you compete
[02:29.790]你是否敢一战？
[02:31.670]Now is your time
[02:31.670]时机已至
[02:33.600]Run when you hear that whistle blow
[02:33.600]哨声吹响 即是冲锋号
[02:37.340]Are you on my team
[02:37.340]你是与我并肩作战
[02:39.300]Or stuck on the sidelines
[02:39.300]还是在场外观望
[02:41.350]Waiting for someone to tell you to go?
[02:41.350]等待他人发号施令？
[02:50.000]For someone to tell you to go
[02:50.000]等待他人发号施令
[02:54.360]You should know I
[02:54.360]你本该知晓 我需要的是
[02:56.140]Need someone to hold me close deeper than I’ve ever known
[02:56.140]能紧紧拥我入怀的真命天子 要比我所有前任都投入这段感情
[02:59.700]Whose love feels like a rodeo
[02:59.700]给我的爱 犹如跌宕起伏的竞技
[03:01.770]Knows just how to take control
[03:01.770]懂得必要时 怎么掌控局面
[03:04.250]When I’m vulnerable
[03:04.250]在他面前 我能全然袒露脆弱
[03:05.610]He’s straight talking to my soul
[03:05.610]他的话语直抵灵魂
[03:07.470]Conversation overload
[03:07.470]与我交流时 滔滔不绝
[03:09.500]Cause training season’s over
[03:09.500]因为感情磨合的训练季已经结束了`;

// 《WORK Pt.4》双语歌词（用户提供，英文与中文翻译共用同一时间戳），时间戳已整体延后 2.5s
const WORKPT4_LRC = `[00:02.500]作词 : EDEN/Peperoni/Ollounder/Maddox/Oliv/김홍중/송민기/Alex Karlsson/G-Eazy/Rob Grimaldi/Tima Dee
[00:03.500]作曲 : EDEN/Peperoni/Ollounder/Maddox/Oliv/Alex Karlsson/G-Eazy
[00:07.077]Gotta WORK
[00:07.077]我拼尽全力
[00:08.124]Gotta make that money make purse
[00:08.124]努力赚钱 装满一袋又一袋
[00:10.460]Gotta fur coat so I make it purr
[00:10.460]披上毛皮大衣 潇洒自在
[00:12.906]Give ‘em whip lash when they see me earn
[00:12.906]看到我的收入 他们倍受打击
[00:15.306]Gotta gotta gotta WORK
[00:15.306]我拼尽全力
[00:17.769]Gotta make that money make purse
[00:17.769]努力赚钱 装满一袋又一袋
[00:20.084]Gotta fur coat so I make it purr
[00:20.084]披上毛皮大衣 潇洒自在
[00:22.375]Gotta get that credit get perks
[00:22.375]得到会员卡 享受超高待遇
[00:24.850]Gotta gotta gotta WORK
[00:24.850]我拼尽全力
[00:28.472]We bouta touch down
[00:28.472]我们即将着陆
[00:29.421]Pull up in the Golden State
[00:29.421]降落在加利福尼亚州
[00:30.808]Up in a G6 fully loaded paper plane
[00:30.808]将钱塞满私人飞机启航
[00:33.243]Don’t ever count no sheep ain’t got no time to waste
[00:33.243]还何必要睡觉呢 别再浪费时间
[00:35.539]Always runnin’ on a hundred always wide awake
[00:35.539]加足马力 全速前进 人生活得无比通透
[00:38.088]Gotta keep it undercover on the low
[00:38.088]不过还是别太张扬 低调点
[00:40.425]I don’t ever tell nobody who don’t gotta know
[00:40.425]我可是没和任何人说过 谁都别想知道
[00:42.889]All these bricks stay movin’ like a domino
[00:42.889]一沓沓钱堆起犹如多米诺骨牌
[00:45.171]If you ain’t about the business then Adios
[00:45.171]如果你不是找我谈生意那就慢走不送
[00:47.954]I like to party, when it’s a party
[00:47.954]该狂欢的时候就应该尽情享受
[00:50.093]That’s payin’ me to pull up up up up
[00:50.093]毕竟我也经常受邀出席各种派对
[00:52.676]Know you callin’ but I ain't sorry
[00:52.676]你总是电话轰炸我 但我并不觉得愧疚
[00:55.071]Oh no no no no no
[00:55.071]Oh 不
[00:57.390]Gotta WORK
[00:57.390]我拼尽全力
[00:58.441]Gotta make that money make purse
[00:58.441]努力赚钱 装满一袋又一袋
[01:00.822]Gotta fur coat so I make it purr
[01:00.822]披上毛皮大衣 潇洒自在
[01:03.207]Give ‘em whip lash when they see me earn
[01:03.207]看到我的收入 他们倍受打击
[01:05.509]Gotta gotta gotta WORK
[01:05.509]我拼尽全力
[01:08.349]Gotta make that money make purse
[01:08.349]努力赚钱 装满一袋又一袋
[01:10.560]Gotta fur coat so I make it purr
[01:10.560]披上毛皮大衣 潇洒自在
[01:12.732]Gotta get that credit get perks
[01:12.732]得到会员卡 享受超高待遇
[01:15.157]Gotta gotta gotta WORK
[01:15.157]我拼尽全力
[01:17.163]From the Bay to the Universe
[01:17.163]从海湾到全宇宙
[01:20.495]The World’s mine
[01:20.495]整个世界都属于我
[01:22.034]Young Gerald gets paid to make words rhyme
[01:22.034]年轻时总有人花钱找我填词押韵
[01:24.114]Acting innocent, no it’s not your first time
[01:24.114]一副天真无邪的模样 但其实你早已经是老手
[01:26.430]We’re far away if Libra is her sign
[01:26.430]如果她是天秤座 那我们各走各道吧
[01:28.928]Oooof, Danger Danger
[01:28.928]Oooof 危机四伏
[01:31.607]Don’t be a stranger
[01:31.607]别装作不认识我
[01:34.138]She said no one can save her
[01:34.138]她说谁都无法拯救她
[01:36.341]Her insides, I could rearrange her
[01:36.341]但我可以让她转变想法
[01:38.829]WORK, flex, WORK, flex
[01:38.829]拼尽全力 尽情炫耀
[01:40.705]Always in the lab, how I earn checks
[01:40.705]经常泡呆在录音室才是生财之道
[01:43.156]$100,000 for a verse, yes
[01:43.156]没错 我的一段词价值十万美元
[01:45.367]Wouldn’t lift a finger if it were less
[01:45.367]少一分钱我连手指都不愿动
[01:48.099]Ba ra ba ra bam
[01:49.260]Come in with a bang
[01:49.260]我来势汹汹
[01:50.451]Always drop that fire got that propane
[01:50.451]一把火丢向天然气引发爆炸
[01:52.980]24 K
[01:52.980]24K纯金
[01:54.049]It ain’t no gold plate
[01:54.049]才不是那种镀金品
[01:55.369]Top, bottom, left, right, and back
[01:55.369]我全身上下
[01:56.749]On the whole chain
[01:56.749]戴的都是正品
[01:57.898]I don’t talk no talk, I’m already walking
[01:57.898]一言不发 向前走去
[02:00.289]I don’t got no boss, I’m already poppin’
[02:00.289]才不需要给谁打工 我本来就很有本事
[02:02.547]I don’t plot no plots, it’s already written
[02:02.547]我命中注定会成功 才不搞背地里那套
[02:04.792]I don’t shop no shop, I get it custom fitted
[02:04.792]用不着亲自出门购物 直接定制送上门
[02:07.285]Yeah purr then I wake up in a mansion
[02:07.285]Yeah 我家住大别墅 早上醒来
[02:09.732]Uh make another rack and then I rack it in (Stack, stack)
[02:09.732]Uh 又是新的一笔钱入账 我记录一下
[02:11.992]My clock ticks on a different beat,
[02:11.992]我们的时间概念可不一样
[02:15.364]chasing that dough?
[02:15.364]想知道什么是生财之道
[02:15.674]Wow ride with me
[02:15.674]Wow 那就和我一起来吧
[02:17.400]I like to party, when it’s a party
[02:17.400]该狂欢的时候就应该尽情享受
[02:19.349]That’s payin’ me to pull up up up up
[02:19.349]毕竟我也经常受邀出席各种派对
[02:21.601]Know you callin’ but I ain't sorry
[02:21.601]你总是电话轰炸我 但我并不觉得愧疚
[02:24.072]Oh no no no no no
[02:24.072]Oh 不
[02:25.967]Gotta WORK
[02:25.967]我拼尽全力
[02:27.175]Gotta make that money make purse
[02:27.175]努力赚钱 装满一袋又一袋
[02:29.548]Gotta fur coat so I make it purr
[02:29.548]披上毛皮大衣 潇洒自在
[02:31.745]Give ‘em whip lash when they see me earn
[02:31.745]看到我的收入 他们倍受打击
[02:34.391]Gotta gotta gotta WORK
[02:34.391]我拼尽全力
[02:37.005]Gotta make that money make purse
[02:37.005]努力赚钱 装满一袋又一袋
[02:39.287]Gotta fur coat so I make it purr
[02:39.287]披上毛皮大衣 潇洒自在
[02:41.723]Gotta get that credit get perks
[02:41.723]得到会员卡 享受超高待遇
[02:44.020]Gotta gotta gotta WORK
[02:44.020]我拼尽全力
[02:46.797]Clock tick tick time to turn it up
[02:46.797]时钟的指针滴答作响 还不快行动起来
[02:48.901]Real quick quick Imma double up
[02:48.901]全速前进 我会加倍努力
[02:51.225]I’m invested Imma put it first
[02:51.225]我要对得起我的投资人 那是我的首要任务
[02:53.594]Gotta make the money WORK
[02:53.594]拼尽全力 努力赚钱
[02:59.022]Gotta make that money make purse
[02:59.022]努力赚钱 装满一袋又一袋
[03:04.402]Money make purse
[03:04.402]装满一袋又一袋
[03:08.326]Gotta make that money make purse
[03:08.326]努力赚钱 装满一袋又一袋
[03:13.354]Money make purse
[03:13.354]装满一袋又一袋
[03:17.543]Gotta make that money make
[03:17.543]努力赚钱 装满一袋`;

// 《Hey Gringo》歌词（用户提供，中英双语同刻度），已去除 [by:] 标签行
const HEYGRINGO_LRC = `[00:00.000]作词 : JJ Julius Son
[00:01.000]作曲 : JJ Julius Son
[00:19.117]I've been told that she's good as gold
[00:19.117]我曾被告知她是个金钻佳人
[00:24.577]Yeah and she'll leave you waiting more
[00:24.577]是的，她会把你留下，好让你期待更多
[00:30.006]Laying low but I could see the smoke
[00:30.006]即使躺倒我还是看到了烟雾迷蒙
[00:32.823]And I knew it wouldn't be long
[00:32.823]我知道这不会持续太久
[00:36.452]I could stay, oh, I could stay away
[00:36.452]我可以留下，是的，我可以留下来等
[00:41.551]Long enough to die another day
[00:41.551]一直到我死去的另一天
[00:45.269]I could try to get it right
[00:45.269]我可以试着让这恢复正常
[00:50.155]Whatever's gonna keep you alive, keep you alive
[00:50.155]不论是什么使你存在，使你活着
[00:58.211]Saying "Who is smokin' cigarettes?
[00:58.211]并说着："谁在抽烟呢？"
[01:03.470]Who is smokin' somethin' else?
[01:03.470]是谁在吞云吐雾
[01:07.716]Who is smokin' cigarettes?
[01:07.716]是谁在抽烟
[01:12.166]Who is smokin' somethin' else?"
[01:12.166]是谁在吞云吐雾
[01:33.583]Oh, let it go
[01:33.583]噢，随便了
[01:35.303]Oh, just take it slow
[01:35.303]噢，慢慢来不着急
[01:38.826]Don't you go lookin' for trouble now
[01:38.826]你这不是在找麻烦吗？
[01:41.841]I don't know why I can't let go
[01:41.841]我不知道我为何无法放手
[01:47.009]That woman's got me rear naked choked
[01:47.009]那个女人在我身后毫无防备时让我感到窒息
[01:50.820]Unless I know, "Whew, hey Gringo"
[01:50.820]除非我知道......"嘿，外国佬"
[01:55.825]Whoa, you gotta stay outta Mexico
[01:55.825]喔，你得远离墨西哥
[01:59.602]And I'll say, "Whoa, hey, tranquilo, amigo"
[01:59.602]然后我会说："哇哦！嘿！安静点，哥们。"
[02:04.629]I didn't know she was spoken for
[02:04.629]我不知道她说了什么
[02:07.823]Now I'm a lover, not a fighter
[02:07.823]我现在是个落入爱河的人，而不是个战士
[02:10.467]It's all bueno
[02:10.467]简直皆大欢喜
[02:12.806]Saying "Who is smokin' cigarettes?
[02:12.806]然后说着："谁在抽烟呢？"
[02:17.677]Who is smokin' somethin' else?
[02:17.677]谁在吞云吐雾？
[02:21.958]Who is smokin' cigarettes?
[02:21.958]是谁在抽烟呢？
[02:26.325]Who is smokin' somethin' else?"
[02:26.325]是谁在吞云吐雾？
[02:29.904]Is it you, is it you, is it you?
[02:29.904]是你吗？是你？是你对不对？
[02:35.050]Whew, you better tell the truth
[02:35.050]呼，你最好说实话
[02:38.883]Is it you, is it you, is it you?
[02:38.883]是你吗？是你？是你对不对？
[02:48.486]Light it up, light it up
[02:48.486]点个火，点个火
[02:52.683]Light it up, light it up
[02:52.683]点个火，点个火
[02:57.443]Light it up, light it up
[02:57.443]点个火，点个火
[03:07.268]I saw my soul for the sad strokes and rock and roll
[03:07.268]我看到了我伤心又摇滚的灵魂
[03:14.787]Said I sold my soul to a woman in Mexico
[03:14.787]它说我将自己的灵魂出卖给了一个墨西哥女人
[03:21.935]A woman in Mexico
[03:21.935]一个在墨西哥的女人
[03:26.375]Woah, woah, yeah-yeah, yeah, come on
[03:26.375]喔嚯嚯，耶啊哈哈，来吧
[03:33.682]You know I go, whew
[03:33.682]你知道我会走，呼
[03:36.199]Who is smokin' cigarettes? (Smokin' cigarettes)
[03:36.199]谁在抽烟呢？（抽着烟）
[03:40.314]Who is smokin' somethin' else? (Smokin' somethin' else)
[03:40.314]是谁在吞云吐雾？（吞云吐雾）
[03:44.876]Who is smokin' cigarettes?
[03:44.876]谁在抽烟呢？
[03:49.138]Who is smokin' somethin' else?"
[03:49.138]是谁在吞云吐雾？
[03:53.018]Is it you, is it you, is it you?
[03:53.018]是不是你？是你吗？是你对不对？
[04:01.569]Whew, yeah, yeah
[04:01.569]呼，耶啊哈哈哈
[04:10.379](Is it you, is it you, is it you?)
[04:10.379]（是不是你？是你吗？是你对不对？）
[04:14.793]Whew, whew, whew
[04:14.793]芜湖，芜湖，芜湖起飞
[04:19.027]Yeah-yeah, yeah-yeah
[04:19.027]耶耶耶耶呀哈哈
[04:21.381]Yeah-yeah, yeah-yeah
[04:21.381]耶呀哈哈哈
[04:23.936]Whew, whew, whew
[04:23.936]芜湖，芜湖，芜湖起飞`;

// 《Love Quotes》歌词（用户提供，中英双语同刻度），已去除 [by:] 标签行
const LOVEQUOTES_LRC = `[00:00.000]作词 : Elijah Beuzieron/Jenevieve/Thomas Lee Martinez
[00:01.000]作曲 : Elijah Beuzieron/Jenevieve/Thomas Lee Martinez
[00:12.776]Blast off, I'm gone
[00:12.776]所有的过往都已消逝，我也已离去
[00:14.022]Was it only just a dream
[00:14.022]难道一切都只是一场虚假的梦吗？
[00:17.534]Left him like an old fling
[00:17.534]无情地抛下他就像旧情人做的那样
[00:19.186]Feels like silly puddy
[00:19.186]感觉自己就像个傻瓜一样
[00:20.406]Troubled waters deep and muddy
[00:20.406]陷入水深火热之中
[00:24.160]Never trust another mother's son
[00:24.160]也不愿再次信任另一个男人
[00:27.093]Looking back now see what we've become
[00:27.093]如今蓦然回首，我们已不似往前
[00:30.299]Cause I can't really tell what you been on
[00:30.299]因为我对你所做的一切都感到迷惑
[00:33.654]Sometimes it's like auto pilot
[00:33.654]有时候这感觉就像自动驾驶
[00:36.598]And we can't see eye to eye
[00:36.598]我们始终没有勇气对视
[00:39.372]Out of sight apologies come too late
[00:39.372]看不见的道歉姗姗来迟
[00:42.600]Tell me how to act but please it's not your place
[00:42.600]你又去教我如何行事，但拜托，这是我的地盘
[00:45.628]Feels like I've been with the wolves all my life
[00:45.628]感觉我这辈子一直都在跟一个野兽打交道
[00:48.729]Feels like you've been seeing stars, am I right?
[00:48.729]感觉你一直都不切实际，对吧？
[00:53.024]I don't need some-
[00:53.024]我不需要
[00:56.007]Body to hold
[00:56.007]某些人的怀抱
[00:59.107]When it gets cold
[00:59.107]但当天气逐渐变冷
[01:02.075]And I shiver
[01:02.075]我只好瑟瑟发抖
[01:05.533]I don't need some-
[01:05.533]我不需要
[01:08.898]Body to blame
[01:08.898]去怪罪某些人
[01:11.778]Someone to frame
[01:11.778]亦或是将某些人
[01:14.616]Up in pictures
[01:14.616]定格在相片里
[01:18.341]Now I know how you found your way in
[01:18.341]如今我终于领会到你是如何骗取我的心的了
[01:21.604]Nothing you can do will ever harm me
[01:21.604]你做的任何事都不可能再伤害到我了
[01:24.730]You can even see me at the weigh-ins
[01:24.730]你甚至可以看着我称体重
[01:27.884]You're not on my level, baby, sorry
[01:27.884]你玩不过我的，宝贝，sry
[01:30.594]Out of sight apologies come too late
[01:30.594]看不见的道歉姗姗来迟
[01:33.565]Tell me how to act but please it's not your place
[01:33.565]你又去教我如何行事，但拜托，这是我的地盘
[01:36.867]Feels like I've been with the wolves all my life
[01:36.867]感觉我这辈子一直都在跟一个野兽打交道
[01:39.968]Feels like you've been seeing stars, am I right?
[01:39.968]感觉你一直都不切实际，对吧？
[01:44.043]I don't need some-
[01:44.043]我不需要
[01:47.154]Body to hold
[01:47.154]某些人的怀抱
[01:50.290]When it gets cold
[01:50.290]但当天气逐渐变冷
[01:53.086]And I shiver
[01:53.086]我只好瑟瑟发抖
[01:56.733]I don't need some-
[01:56.733]我不需要
[01:59.926]Body to blame
[01:59.926]去指责某些人
[02:03.211]Someone to frame
[02:03.211]亦或是将某些人
[02:05.809]Up in pictures
[02:05.809]定格在相片里
[02:09.409]It's a mad world in a mad way (Okay)
[02:09.409]整个疯狂的世界都在以不可理喻的方式运行（行的吧）
[02:12.786]Backstage and it's sold out
[02:12.786]在后台，一切都已售罄
[02:15.436]You can keep up the charade, baby
[02:15.436]你可以继续你的表演了呢，宝贝
[02:18.737]Baby, I don't need you, we've fallen out
[02:18.737]但是呢，我再也不需要你了，我们已经彻底结束了
[02:22.230]It's a mad world in a mad way (Okay)
[02:22.230]整个疯狂的世界都在以不可理喻的方式运行（行的吧）
[02:25.540]Backstage and you're not allowed
[02:25.540]在后台，你已经被禁止出场
[02:28.345]You're not standing in my way, baby
[02:28.345]你再也不会阻挡我了呢，宝贝
[02:31.495]Baby, I don't see you, we've fallen out
[02:31.495]我再也不想看见你了，我们已经彻底玩完儿了
[02:35.128]I don't need some-
[02:35.128]我不需要
[02:38.319]Body to hold
[02:38.319]某些人的怀抱
[02:41.433]When it gets cold
[02:41.433]但当天气变冷
[02:44.287]And I shiver
[02:44.287]我只好瑟瑟发抖
[02:47.911]I don't need some-
[02:47.911]我不需要
[02:51.092]Body to blame
[02:51.092]去怪罪某些人
[02:54.262]Someone to frame
[02:54.262]亦或是将某些人
[02:56.878]Up in pictures
[02:56.878]定格在相片中`;

// 《生活因你而火热》歌词（用户提供），已去除编曲信息行
const SHENGHUO_LRC = `[00:00.000]作词 : 彭磊
[00:01.000]作曲 : 彭磊
[00:06.300]勇敢的你
[00:07.850]站在这里
[00:09.790]脸庞清瘦却骄傲
[00:13.300]在这远方
[00:15.330]没人陪伴
[00:17.210]只有幻想和烦恼
[00:20.770]无聊的 渺小的 反对不公平的世界
[00:28.360]没能继续的革命
[00:32.150]不欢而散的告别
[00:35.540]我倒下后
[00:37.500]不敢回头
[00:39.460]不能再见的朋友
[00:43.070]有人堕落
[00:44.960]有人疯了
[00:46.730]有人随着风去了
[00:50.250]我难过
[01:05.130]我不得不去工作
[01:08.820]在大楼的一个角落
[01:12.720]格子间的女孩
[01:16.290]时间久了也很美
[01:20.190]我会和她结婚
[01:23.810]带我去小城过年
[01:27.810]忘了吧那摇滚乐
[01:31.160]奔腾不复的时代
[01:34.810]我倒下后
[01:36.470]不敢回头
[01:38.400]被社会伤害的人们
[01:41.730]有人堕落
[01:43.960]有人疯了
[01:46.800]有人随着风去了
[01:49.360]那些昙花一现的灿烂
[01:53.620]是爆炸的烟火
[01:57.570]那一团耀眼的火焰
[02:01.060]在燃烧着你和我
[02:04.890]那刻骨铭心的恋爱
[02:08.480]总带给我伤害
[02:12.240]那平淡如水的生活
[02:15.900]因为你而火热
[02:48.570]勇敢的你
[02:50.220]站在这里
[02:52.330]脸庞清瘦却骄傲
[02:55.750]在这远方
[02:57.740]没人陪伴
[02:59.650]只有幻想和烦恼
[03:03.420]我倒下后
[03:04.950]不敢回头
[03:07.210]不能再见的朋友
[03:10.700]有人堕落
[03:12.590]有人疯了
[03:14.340]有人随着风去了
[03:17.810]那些昙花一现的灿烂
[03:22.130]是爆炸的烟火
[03:25.920]那一团耀眼的火焰
[03:29.800]在燃烧着你和我
[03:33.460]那刻骨铭心的恋爱
[03:37.170]总带给我伤害
[03:40.750]那平淡如水的生活
[03:44.400]因为你而火热
[04:10.210]那些昙花一现的灿烂
[04:14.150]是爆炸的烟火
[04:17.780]那一团耀眼的火焰
[04:21.510]在燃烧着你和我
[04:25.180]那刻骨铭心的恋爱
[04:28.790]总带给我伤害
[04:32.490]那平淡如水的生活
[04:36.270]因为你而火热`;

// 《想念》歌词（用户提供，Rehearsal Version）
const XIANGNIAN_LRC = `[00:00.000]词 : 梁博（Bruce Liang)
[00:01.000]曲 : 梁博/Jack Lee
[00:02.000]制作人 : 梁博
[00:03.000]吉他 : 梁博/Misha Kalinin
[00:04.000]键盘 : 张效衡
[00:05.000]萨克斯 : 陈嘉俊
[00:06.000]贝斯 : 杜大鹏
[00:07.000]鼓 : 祁大为
[00:08.000]和音 : 李郡洲/秋子
[00:37.020]其实孤独从来都和那些节日无关
[00:42.380]像外面曾与我无关
[00:48.250]就像曾经熟悉的那些单纯的笑脸
[00:53.550]现在也和你无关
[00:58.960]我们都相遇在这里的同一个地点
[01:04.460]又分别在同一时间
[01:09.890]那时候都说好要记住你的诺言
[01:15.250]你的诺言不变
[01:20.200]想念昨天的风
[01:22.470]也想念昨天的雨
[01:25.310]也想念昨天的黄昏和海岸
[01:31.010]想念那时的你
[01:33.610]也想念那时的我
[01:36.180]也想念那时的一切都简单
[01:41.920]想念冬天的雪
[01:44.400]也想念家人的暖
[01:47.110]也想念离开时的那个夜晚
[01:52.750]我在想念
[01:54.770]是否你也在想念
[01:57.480]是否也远在天边
[02:00.310]默默地祝愿
[02:04.430]有些快乐就定格在离开家的那天
[02:09.660]那是个永恒的节点
[02:15.450]从此风雨兼程地走用心地追赶
[02:20.620]可是彩虹永远在天边
[02:26.340]因为相信也因为不信所以去冒险
[02:31.600]看看一切的另一面
[02:37.220]难过时候犹豫的我就看到你的脸
[02:42.300]出现在我心里面
[02:47.350]想念家乡的风
[02:49.850]也想念家乡的路
[02:52.520]也想念家乡的黄昏和海岸
[02:58.290]想念那时的你
[03:00.740]也想念那时的我
[03:03.440]也想念那时的一切都简单
[03:09.240]想念冬天的雪
[03:11.640]也想念家人的暖
[03:14.300]也想念离开时的那个夜晚
[03:20.140]我在想念
[03:22.010]是否你也在想念
[03:24.720]是否也远在天边
[03:27.520]默默地祝愿
[03:52.910]想念家乡的风
[03:55.190]也想念家乡的雨
[03:58.000]也想念家乡的黄昏和海岸
[04:03.790]想念那时的你
[04:06.130]也想念那时的我
[04:08.810]也想念那时的一切都简单
[04:14.680]想念冬天的雪
[04:17.070]也想念家人的暖
[04:19.750]也想念离开时的那个夜晚
[04:25.650]我在想念
[04:27.500]是否你也在想念
[04:30.230]是否也远在天边
[04:32.990]默默地祝愿
[04:59.040]想家 想家 为什么想家
[05:01.870]不说 不说 你也知道吗
[05:04.550]想她 想她 为什么想她
[05:07.180]Na na na na na na na na
[05:09.860]想家 想家 为什么想家
[05:12.730]不说 不说 你也知道吗
[05:15.410]想她 想她 为什么想她
[05:18.060]Na na na na na na na na
[05:20.790]想家 想家 为什么想家
[05:23.590]不说 不说 你也知道吗
[05:26.280]想她 想她 为什么想她
[05:28.980]Na na na na na na na na
[05:31.790]想家 想家 为什么想家
[05:34.530]不说 不说 你也知道吗
[05:37.130]想她 想她
[05:38.800]Na na na na na na na na`;

// 《夜泳 (We Dive)》歌词（用户提供，中英双语同刻度）
const YEYONG_LRC = `[00:00.000]作词Lyricist : 莫非定律乐团
[00:01.000]作曲Composer : 莫非定律乐团
[00:02.000]编曲Arranger : 莫非定律乐团
[00:03.000]制作人Producer : 莫非定律乐团
[00:04.000]合成器Synthesizer : 莫非定律乐团
[00:05.000]配唱制作人Vocal Producer : 莫非定律乐团
[00:06.000]合声编写Choir Arrangement : 莫非定律乐团
[00:07.000]合声Choir : 莫非定律乐团
[00:08.000]录音工程师Recording Engineer : 莫非定律乐团
[00:09.000]人声录音室Vocal Recording Studio : 莫非定律音乐工作室（MoreFeel Studio)
[00:10.000]混音工程师Mixing Engineer : 李子陶
[00:11.000]母带工程师Master Engineer : 李子陶
[00:12.000]音乐发行 : 奔跑怪物
[00:19.770]黄昏到清晨
[00:21.840]怎么会一直深睡
[00:29.220]雾气在弥漫
[00:31.320]它裹着我往下坠
[00:39.240]还以为 双腿已经长出了鱼尾
[00:46.530]漂浮了太久
[00:50.190]不适应陆地的氛围
[00:56.100]于是一到夜晚
[00:58.380]我们就下潜
[01:00.750]一直游到深蓝
[01:02.970]水温里交接
[01:05.520]于是一到夜晚
[01:07.770]我们就失眠
[01:10.110]在我沦陷之前
[01:12.510]你已被拦截
[01:14.040]back back to back to me
[01:14.040]（回声层叠至我心）
[01:17.730]I say back to back to me
[01:17.730]（呢喃反复入梦音）
[01:19.710]just out of sight
[01:19.710]（仿佛近却渐远行）
[01:22.710]back back to back to me
[01:22.710]（回声层叠至我心）
[01:24.270]As I say back to me
[01:24.270]（似是低语唤归期）
[01:27.030]back back to back to me
[01:27.030]（回声层叠至我心）
[01:29.640]just out of sight
[01:29.640]（仿佛近却渐远行）
[01:31.290]I say back to back to me
[01:31.290]（呢喃反复入梦音）
[01:34.500]As I say back to me
[01:34.500]（似是低语唤归期）
[01:35.490]夜晚游泳的人
[01:37.110]在找一个同类
[01:44.490]可是在爱里
[01:46.620]也分不清谁是谁
[01:54.570]夜太黑
[01:55.830]梦再美也开不出蔷薇
[02:02.100]Stay with me,baby
[02:05.340]是如此暧昧的称谓
[02:09.720]hey
[02:11.340]于是一到夜晚
[02:13.680]我们就下潜
[02:16.020]一直游到深蓝
[02:18.300]水温里交接
[02:20.790]于是一到夜晚
[02:23.070]我们就失眠
[02:25.410]让我沦陷
[02:30.210]于是一到夜晚
[02:32.460]身体变柔软
[02:34.920]不让月光溶解
[02:37.140]沉溺的危险
[02:39.630]于是一到夜晚
[02:41.820]世界就松懈
[02:44.250]在我上岸之前
[02:49.260]长出鳞片
[03:34.530]Don't wake me up
[03:34.530]（莫扰梦中人）
[03:41.820]Don't break the tide
[03:41.820]（不惹水中尘）
[03:42.720]This ocean life
[03:42.720]（此海若浮世）
[03:59.700]We love and we dive
[03:59.700]（爱欲共沉沦）`;

// 《special》歌词（用户提供，中英双语同刻度）
const SPECIAL_LRC = `[00:00.000]作曲 : Richie Kotzen
[00:15.290]You said to me im not what your looking for
[00:15.290]你说我并非你所寻真爱
[00:21.990]Your movin on somebody else can give you more
[00:21.990]定有他人给你爱的港湾
[00:28.640]So I let you go thinking will never meet again
[00:28.640]故我放手此生注定不见
[00:35.370]But here you are and baby I wanna know
[00:35.370]但此时你回来让我想说
[00:40.670]Did you wanna be rich did you wanna feel special
[00:40.670]你真的想要钱财名利，美好的感觉吗
[00:49.690]Did you wonder in all this time how I
[00:49.690]你是否想过这段时间
[00:50.950]Was livin without you
[00:50.950]我是如何度过
[00:53.410]Did you wanna be cruel did you think that I never would go on
[00:53.410]你真的要这么残忍吗，你真的想过我会崩溃吗
[01:01.060]Now all the things you thought you had have gone
[01:01.060]如今你已一无所有
[01:05.380]Let that be a lesson to you
[01:05.380]就让这成为你的教训吧
[01:21.840]Its funny how life can change
[01:21.840]生活的变化有时可笑
[01:28.820]You never know until you walk away
[01:28.820]你走以后想必已明了
[01:35.990]I see you now and your lost and afraid
[01:35.990]如今看你失魂又落魄
[01:41.500]Because you know had love
[01:41.500]一切只因你已有真爱
[01:44.540]And you wanted more
[01:44.540]又贪婪不足
[01:47.020]Did you wanna be rich did you wanna feel special
[01:47.020]你真的想要钱财名利，美好的感觉吗
[01:50.510]Did you wonder in all this time how I
[01:50.510]你是否想过这段时间
[01:57.270]Was livin without you
[01:57.270]我是如何度过
[02:01.250]Did you wanna be cruel did you think that I never would go on
[02:01.250]你真的要这么残忍吗，你真的想过我会崩溃吗
[02:07.940]Now all the things you thought you had have gone
[02:07.940]如今你已一无所有
[02:12.230]Let that be a lesson to you
[02:12.230]就让这成为你的教训吧
[02:27.970]I give your more than I ever got back
[02:27.970]我的付出远大于收获
[02:31.740]You left me here to forget about that
[02:31.740]你全然不顾弃我于此
[02:38.130]Now all the things you thought you had have gone
[02:38.130]如今你已一无所有
[02:38.770]Let that be a lesson to you
[02:38.770]就让这成为你的教训吧
[02:47.410]Did you wanna be rich did you wanna feel special
[02:47.410]你真的想要钱财名利，美好的感觉吗
[02:48.120]Did you wonder in all this time how I
[02:48.120]你是否想过这段时间
[02:50.880]Was livin without you
[02:50.880]我是如何度过
[02:53.630]Did you wanna be cruel did you think that I never would go on
[02:53.630]你真的要这么残忍吗，你真的想过我会崩溃吗
[03:00.990]Now all the things you thought you had have gone
[03:00.990]如今你已一无所有
[03:05.230]Let that be a lesson to you
[03:05.230]就让这成为你的教训吧
[03:16.840]Your special your so special your so special to me
[03:16.840]你真的特别你真特别你真特别
[03:21.660]All things that you wanted now you know were wrong
[03:21.660]你知道你错了
[03:27.780]You gave up love for something more
[03:27.780]放弃了爱去追求其他
[03:33.450]let that be a lesson to you
[03:33.450]就让这成为你的教训吧`;

// 《Say》歌词（用户提供）
const SAY_LRC = `[00:00.000]作词 : Elie Rizk/Imad Royal/Casey Luong/Patrick “J. Que” Smith/James Ryan Ho/Trey Campbell
[00:01.000]作曲 : Elie Rizk/Imad Royal/Casey Luong/Patrick “J. Que” Smith/James Ryan Ho/Trey Campbell
[00:05.189]Say it, say it
[00:05.189]说吧 说出口吧
[00:07.787]You do this all the time
[00:07.787]你每每都欲言又止
[00:10.292]No sense in holding back tonight
[00:10.292]今夜无需矜持 倾吐你的心意
[00:14.708]Can't contain it
[00:14.708]即便有心克制
[00:17.426]Even if I tried
[00:17.426]我也藏不住情愫
[00:19.592]Get lost in the moment
[00:19.592]只想沉醉于此刻
[00:21.576]Get lost with you, but I
[00:21.576]与你共赴昏沉 但我
[00:23.542]Can't read your mind
[00:23.542]读不懂你的心
[00:27.978]When all you do is dance on the line
[00:27.978]始终游离在暧昧边缘的你
[00:32.876]Can't read your mind
[00:32.876]你的心意难以捉摸
[00:36.759]All I need is a sign
[00:36.759]我只要一个暗示而已
[00:42.355]Say the word
[00:42.355]挑明心意吧
[00:44.559]I know what you're thinking, but just say it first
[00:44.559]我清楚你在想什么 但请你先开口
[00:49.008]Been waiting all this time for you to take your turn
[00:49.008]我等了这么久 待你表露心迹
[00:53.842]In my arms for a second
[00:53.842]在我怀中思忖片刻
[00:56.308]Baby, say the word and I'll be yours
[00:56.308]亲爱的 就说出口吧 我会为你沦陷的
[01:03.475]The look you're giving me gives you away
[01:03.475]不过一瞥便倾心 你的爱意实在难掩
[01:08.059]You finally found the high that you've been chasing
[01:08.059]我终于寻获了你梦寐以求的畅快淋漓
[01:12.835]Only one more choice you gotta make
[01:12.835]只差一个抉择 便能圆满
[01:17.576]I need you to tell me 'cause I
[01:17.576]只需你袒露心意 因为我
[01:20.026]Can't read your mind
[01:20.026]读不懂你的心
[01:23.659]All I need is a sign
[01:23.659]我只要一个暗示而已
[01:29.326]Say the word
[01:29.326]挑明心意吧
[01:31.592]I know what you're thinking, but just say it first
[01:31.592]我清楚你在想什么 但请你先开口
[01:36.027]Been waiting all this time for you to take your turn
[01:36.027]我等了这么久 待你表露心迹
[01:41.043]In my arms for a second
[01:41.043]在我怀中思忖片刻
[01:43.460]Baby, say the word and I'll be yours
[01:43.460]亲爱的 就说出口吧 我会为你沦陷的
[01:50.408]So close to your body, can you feel it?
[01:50.408]这般贴近你的身体 你感受得到吗
[01:55.076]Come and spend the night with someone new
[01:55.076]留下来吧 与全新的遇见共度良宵
[01:59.791]Talking with your hands, but do you mean it?
[01:59.791]你的双手在诉说着什么 是真心流露吗
[02:04.476]Baby, all you gotta do is
[02:04.476]亲爱的 你只需
[02:06.942]Say the word
[02:06.942]挑明心意
[02:09.210]I know what you're thinking, but just say it first
[02:09.210]我清楚你在想什么 但请你先开口
[02:13.643]Been waiting all this time for you to take your turn
[02:13.643]我等了这么久 待你表露心迹
[02:18.694]In my arms for a second
[02:18.694]在我怀中思忖片刻
[02:20.994]Baby, say the word and I'll be yours
[02:20.994]亲爱的 就说出口吧 我会为你沦陷的
[02:25.694]Say the word
[02:25.694]挑明心意吧
[02:28.042]I know what you're thinking, but just say it first
[02:28.042]我清楚你在想什么 但请你先开口
[02:32.559]Been waiting all this time for you to take your turn
[02:32.559]我等了这么久 待你表露心迹
[02:37.384]In my arms for a second
[02:37.384]在我怀中思忖片刻
[02:39.826]Baby, say the word and I'll be yours
[02:39.826]亲爱的 就说出口吧 我会为你沦陷的
[02:44.442]Say the word
[02:44.442]别再犹豫
[02:49.142]Say the word
[02:49.142]挑明心意吧
[02:53.876]Say the word
[02:53.876]就说出口吧`;

// 《Shivers》歌词（用户提供，中英双语同刻度）
const SHIVERS_LRC = `[00:00.000]作词 : Ed Sheeran/Johnny McDaid/Kal Lavelle/Steve Mac
[00:01.000]作曲 : Ed Sheeran/Johnny McDaid/Kal Lavelle/Steve Mac
[00:11.938]I took an arrow to the heart
[00:11.938]心扉恍然被击中
[00:15.342]I never kissed a mouth that tastes like yours
[00:15.342]从未品味过似你双唇般的滋味
[00:18.761]Strawberries and something more
[00:18.761]那如草莓般的甜蜜 余韵无穷
[00:22.304]Oh yeah I want it all
[00:22.304]我渴望无比
[00:25.548]Lipstick on my guitar
[00:25.548]那余留在我吉他上的口红吻印
[00:29.012]Fill up the engine we can drive real far
[00:29.012]蓄势待发 就驰骋得 弥足遥远
[00:32.394]Go dancing underneath the stars
[00:32.394]漫天星辰下纵情起舞
[00:35.928]Oh yeah I want it all
[00:35.928]我如此享受
[00:39.353]You got me feeling like
[00:39.353]你令我情不自禁
[00:41.306]I wanna be that guy
[00:41.306]我想成为你真命天子
[00:43.060]I wanna kiss your eyes
[00:43.060]期盼吻你眼眸
[00:44.760]I wanna drink that smile
[00:44.760]迷醉那微笑间
[00:46.424]I wanna feel like I
[00:46.424]我情不自禁 想成为
[00:48.142]Like my souls on fire
[00:48.142]似饱满激情被点燃
[00:49.491]I wanna stay up all day and all night
[00:49.491]纵使日夜交替 我都难以入眠
[00:52.421]Yeah  you got me singing like
[00:52.421]你令我引吭高歌
[00:54.460]Ooh, I love it when you do it like that
[00:54.460]你举手投足 我都迷恋万分
[00:57.316]And when you're close up
[00:57.316]当你逐步朝我靠近
[00:58.758]Give me the shivers
[00:58.758]我悸动不已
[01:00.528]Oh baby you wanna dance 'til the sunlight cracks
[01:00.528]亲爱的 你愿同我共舞 至日光点滴渗透
[01:03.880]And when they say the party's over then we'll bring it right back
[01:03.880]即便派对宣告结束 但你我仍能渲染狂欢气氛
[01:07.467]And we'll say
[01:07.467]人尽皆知
[01:08.060]Ooh, I love it when you do it like that
[01:08.060]你举手投足 我都迷恋万分
[01:10.887]And when you're close up
[01:10.887]当你逐步朝我靠近
[01:12.415]Give me the shivers
[01:12.415]我悸动不已
[01:14.083]Oh baby you wanna dance 'til the sunlight cracks
[01:14.083]亲爱的 你愿同我共舞 至日光点滴渗透
[01:17.637]And when they say the party's over then we'll bring it right back
[01:17.637]即便派对宣告结束 但你我仍能渲染狂欢气氛
[01:21.106]Into the car
[01:21.106]微暗夜晚
[01:23.403]On the backseat in the moonlit dark
[01:23.403]月光映照下坐进车后座
[01:26.795]Wrap me up between your legs and arms
[01:26.795]你将我裹挟在双腿与臂弯间
[01:30.197]Oh I can't get enough
[01:30.197]我欲求不满
[01:33.483]You know you could tear me apart
[01:33.483]你深知自己能将我撕得粉碎
[01:36.891]Put me back together and take my heart
[01:36.891]重新拼凑 随后俘获我心
[01:40.472]I never thought that I could love this hard
[01:40.472]未曾料想自己如此深爱
[01:43.765]Oh I can't get enough
[01:43.765]我欲求不满
[01:46.748]You got me feeling like
[01:46.748]你令我情不自禁
[01:49.321]I wanna be that guy
[01:49.321]想成为你真命天子
[01:51.078]I wanna kiss your eyes
[01:51.078]我期盼吻你眼眸
[01:52.809]I wanna drink that smile
[01:52.809]迷醉那微笑间
[01:54.457]I wanna feel like I
[01:54.457]我情不自禁 想成为
[01:56.184]Like my souls on fire
[01:56.184]似饱满激情被点燃
[01:57.619]I wanna stay up all day and all night
[01:57.619]纵使日夜交替 我都难以入眠
[02:00.503]Yeah you got me singing like
[02:00.503]你令我引吭高歌
[02:02.502]Ooh, I love it when you do it like that
[02:02.502]你举手投足 我都迷恋万分
[02:05.356]And when you're close up
[02:05.356]当你逐步朝我靠近
[02:06.873]Give me the shivers
[02:06.873]我悸动不已
[02:08.542]Oh baby you wanna dance 'til the sunlight cracks
[02:08.542]亲爱的 你愿同我共舞 至日光点滴渗透
[02:12.059]And when they say the party's over then we'll bring it right back
[02:12.059]即便派对宣告结束 但你我仍能渲染狂欢气氛
[02:15.542]And we'll say ooh, I love it when you do it like that
[02:15.542]人尽皆知 你举手投足 我都迷恋万分
[02:18.979]And when you're close up
[02:18.979]当你逐步朝我靠近
[02:20.621]Give me the shivers
[02:20.621]我悸动不已
[02:22.191]Oh baby you wanna dance 'til the sunlight cracks
[02:22.191]亲爱的 你愿同我共舞 至日光点滴渗透
[02:25.649]And when they say the party's over then we'll bring it right back
[02:25.649]即便派对宣告结束 但你我仍能渲染狂欢气氛
[02:29.291]Baby you burn so hot
[02:29.291]亲爱的 你热辣无比 我悸动不已
[02:31.666]You make me shiver with the fire you got
[02:31.666]你爱火燎及我心 情愫便萌生
[02:35.002]This thing we started I don't want it to stop, you know you make me shiver
[02:35.002]怎能就此止步 你明知令我动情
[02:42.754]Baby you burn so hot
[02:42.754]亲爱的 你热辣无比 我悸动不已
[02:45.347]You make me shiver with the fire you got
[02:45.347]你爱火燎及我心 情愫便萌生
[02:48.619]This thing we started I don't want it to stop, you know you make me shiver
[02:48.619]怎能就此止步 你明知自己能令我动情
[02:54.938]Yeah you got me singing like
[02:54.938]你令我引吭高歌
[02:56.880]Ooh, I love it when you do it like that
[02:56.880]你举手投足 我都迷恋万分
[02:59.876]And when you're close up
[02:59.876]当你逐步朝我靠近
[03:01.368]Give me the shivers
[03:01.368]我悸动不已
[03:02.947]Oh baby you wanna dance 'til the sunlight cracks
[03:02.947]亲爱的 你愿同我共舞 至日光点滴渗透
[03:06.344]And when they say the party's over then we'll bring it right back
[03:06.344]即便派对宣告结束 但你我仍能渲染狂欢气氛
[03:10.394]Ooh, I love it when you do it like that
[03:10.394]人尽皆知 你举手投足 我都迷恋万分
[03:13.499]And when you're close up
[03:13.499]当你逐步朝我靠近
[03:14.913]Give me the shivers
[03:14.913]我悸动不已
[03:16.690]Oh baby you wanna dance 'til the sunlight cracks
[03:16.690]亲爱的 你愿同我共舞 至日光点滴渗透
[03:20.096]And when they say the party's over then we'll bring it right back
[03:20.096]即便派对宣告结束 但你我仍能渲染狂欢气氛`;

// 《Schizophrenic》歌词（用户提供，中英双语同刻度），已去重重复行
const SCHIZOPHRENIC_LRC = `[00:00.000]作词 : Brian Cheng
[00:01.000]作曲 : Brian Cheng
[00:02.000]编曲 : Brian Cheng
[00:03.000]混音 : 全相彦
[00:04.000]母带 : 全相彦
[00:05.000]制作人 : 满街
[00:06.000]监制 : 张驰钧
[00:07.000]出品 : 网易音乐人*焱宜文传
[00:11.180]You're poison ivy
[00:11.180]你是那剧毒的藤蔓
[00:13.160]You're the toxin to my skin
[00:13.160]侵蚀着我的皮肤
[00:16.780]But you make me
[00:16.780]但你却让我
[00:18.330]Wanna feel that itch again
[00:18.330]想念那种痛痒
[00:21.930]You stop my heartbeat
[00:21.930]你只需看我一眼
[00:23.570]When you give me just a glance
[00:23.570]便能停止我的心跳
[00:26.310]Leaving me a can of lightning shaking in my chest
[00:26.310]在我的胸口埋下一瓶闪电 使我颤抖
[00:31.590]Girl you got me turning in my bed
[00:31.590]你让我翻来覆去的失眠
[00:34.230]I cannot forget you in that dress
[00:34.230]让我惦记你穿长裙的模样
[00:36.890]And it has been killing me killing me
[00:36.890]在你离开后
[00:39.660]After you left
[00:39.660]让我痛苦不已
[00:42.070]Staring at the ceiling in a daze
[00:42.070]我发着呆盯着天花板
[00:44.900]When I hear a voice from outer space
[00:44.900]却听到一个飘渺的声音
[00:47.390]It keeps repeating those five letters of your name
[00:47.390]它不停重复着你名字的五个字母
[00:52.720]Schizophrenic
[00:52.720]精神分裂
[00:55.500]Got me talking to myself
[00:55.500]你让我自言自语
[00:58.130]I'm still learning
[00:58.130]我还在学着
[01:00.710]To share my head with someone else
[01:00.710]适应你活在我的脑子里
[01:03.470]Schizophrenic
[01:03.470]精神分裂
[01:06.700]I can't breathe within these clouds
[01:06.700]我在这云层里无法呼吸
[01:08.840]You can watch me suffocate but
[01:08.840]但我宁愿失去氧气
[01:11.890]You won't catch me coming down
[01:11.890]也不愿下坠
[01:18.360]Don't leave me wasted
[01:18.360]请别留我一人颓废
[01:19.600]On this wasteland of a hill
[01:19.600]在这半山腰的荒野
[01:23.430]Return to save me
[01:23.430]回来拯救我吧
[01:24.870]I'll be waiting for you still
[01:24.870]我还会等着你
[01:27.290]So
[01:27.290]所以
[01:28.840]Before you take off
[01:28.840]在你离开之前
[01:30.310]Won't you take my eyes to go
[01:30.310]请带走我的双眼
[01:33.070]I don't wanna see this mimic of you anymore
[01:33.070]我已不想再看到你的重影
[01:38.400]Girl you got me turning in my bed
[01:38.400]你让我翻来覆去的失眠
[01:40.820]I cannot forget you in that dress
[01:40.820]让我惦记你穿长裙的模样
[01:43.480]And it has been killing me killing me
[01:43.480]在你离开后
[01:46.470]After you left
[01:46.470]让我痛苦不已
[01:48.720]Staring at the ceiling in a daze
[01:48.720]我发着呆盯着天花板
[01:51.480]When I hear a voice from outer space
[01:51.480]却听到一个飘渺的声音
[01:54.170]It keeps repeating those five letters of your name
[01:54.170]它不停重复着你名字的五个字母
[01:59.440]Schizophrenic
[01:59.440]精神分裂
[02:02.210]Got me talking to myself
[02:02.210]你让我自言自语
[02:04.770]I'm still learning
[02:04.770]我还在学着
[02:07.440]To share my head with someone else
[02:07.440]适应你活在我的脑子里
[02:10.150]Schizophrenic
[02:10.150]精神分裂
[02:13.200]I can't breathe within these clouds
[02:13.200]我在这云层里无法呼吸
[02:15.500]You can watch me suffocate but
[02:15.500]但我宁愿失去氧气
[02:18.180]You won't catch me coming down
[02:18.180]也不愿下坠
[02:21.780]*instrumental*
[02:42.530]Schizophrenic
[02:42.530]精神分裂
[02:44.920]Got me talking to myself
[02:44.920]你让我自言自语
[02:47.390]I'm still learning
[02:47.390]我还在学着
[02:50.220]To share my head with someone else
[02:50.220]适应你活在我的脑子里
[02:52.520]Schizophrenic
[02:52.520]精神分裂
[02:55.840]I can't breathe within these clouds
[02:55.840]我在这云层里无法呼吸
[02:58.170]You can watch me suffocate but
[02:58.170]但我宁愿失去氧气
[03:01.130]You won't catch me coming down
[03:01.130]也不愿下坠
[03:04.470](Don't you leave me)
[03:04.470](请别离开我)
[03:05.510](Don't you leave me all alone)
[03:05.510](请别留我孤独)
[03:07.200](Don't you leave me)
[03:07.200](请别离开我)
[03:08.340](Don't you leave me on my own)
[03:08.340](请别留我独自一人)
[03:10.280](Don't you leave me)
[03:10.280](请别离开我)
[03:10.920](Don't you leave me all alone)
[03:10.920](请别留我孤独)
[03:12.640](Don't you leave me)
[03:12.640](请别离开我)
[03:13.570]I hear you talking to me
[03:13.570]我听到你在和我说话
[03:14.060](Don't you leave me on my own)
[03:14.060](请别留我独自一人)
[03:22.030]You got me, you got me
[03:22.030]你让我 你让我
[03:23.360]Schizophrenic
[03:23.360]精神分裂
[03:26.680](Don't be afraid of me)
[03:26.680](别怕我)
[03:28.830](Let go and talk to me)
[03:28.830](放下防备和我说话吧)
[03:31.320](Come close and sing for me)
[03:31.320](靠近我 为我唱歌吧)
[03:34.150]Are you talking to me
[03:34.150]你在和我说话吗
[03:36.670](Don't be afraid of me)
[03:36.670](别怕我)
[03:39.290](Let go and talk to me)
[03:39.290](和我说话吧)
[03:41.080]You can watch me suffocate but
[03:41.080]我宁愿失去氧气
[03:44.080]You won't catch me coming down
[03:44.080]也不愿下坠`;

// 《纤维》歌词（用户提供，纯中文单行）
const XIANWEI_LRC = `[00:00.000]作词 : 小寒
[00:01.000]作曲 : Tutus x Bears
[00:02.000]编曲 : 常石磊/Derrick Sepnio
[00:03.000]制作 : 常石磊
[00:04.000]和声编写 : 常石磊
[00:05.000]和声 : 林忆莲
[00:06.000]电吉他 : Derrick Sepnio
[00:07.000]吉他 : 恭硕良
[00:08.000]Program : 常石磊/Kelvin Avon
[00:09.000]剪辑 : 常石磊/倪涵文/Kelvin Avon
[00:10.000]录音 : 倪涵文@ Tweak Tone Labs
[00:11.000]混音 : Brent Clark
[00:12.000]母带处理 : Ryan Smith
[00:55.200]纤维
[00:55.350]房里铺叠整齐不太熟悉
[01:05.100]往事如短丝堆集洒落窗前光线里
[01:15.330]我可以接受感情已瓦解成雨
[01:21.720]可以接受你断线会有意义
[01:27.210]可以却还没勇气
[01:34.410]有没有足够回忆能编织成棉被
[01:40.590]有如你臂弯在温暖我的背
[01:45.720]我只剩下拼凑不了你的纤维
[01:59.910]答应你会复习幸福程序
[02:10.920]包括你先离席包括你我道别离
[02:16.860]我也许还想亚麻色衬衫的你
[02:27.240]也许还想我拥抱太过亲密
[02:32.730]也许太仔细喔
[02:37.200]有没有足够回忆能编织成棉被
[02:43.410]有如你臂弯在温暖我的背
[02:48.450]我只剩下拼凑不了你的纤维
[03:00.000]当时我们不懂挨近一点
[03:02.760]不一定交集成诺言
[03:05.460]太用力结果拧捻成断裂点不再相连
[03:10.980]当时我们不懂分开一点
[03:13.740]不一定徘徊在边缘
[03:16.440]如今只能从纸屑取得半点微弱关联
[03:25.650]我们是飘零在风裡的纤维
[03:43.080]只能远远避开彼此的周围`;

// 《周旋》歌词（用户提供）
const ZHOUXUAN_LRC = `[00:00.000]作词 : 王以太/艾热 AIR
[00:01.000]作曲 : 王以太/艾热 AIR
[00:02.000]制作人 : 王以太/艾热 AIR/卡斯/LusciousBB
[00:21.870]诚实会让我讨厌你的话诚实的像是胶片
[00:25.890]爱你像不停发烧你用行动在为我的炎症消炎
[00:29.670]消磨了很多力气但我的青春已不值一提
[00:33.630]我只想在你欠我的账本上再狠狠的记上一笔
[00:37.500]你是我情话的由来
[00:39.360]而我是你情话的韭菜
[00:41.430]自愿暴露给你的答案早已经经不起任何的修改
[00:45.270]陷入了泥潭我心里面明白也斗争过
[00:49.170]失衡的棋盘我也只能参考你修正我
[00:53.100]参考你修正我
[00:54.570]比自己找出口有用的多
[00:56.550]但是你关上灯一盏一盏
[00:58.530]演绎的剧情是《一半一半》
[01:00.660]一半是憧憬一半是回忆
[01:02.550]继续下去也是差不多
[01:04.410]最后也没有圆满的段落
[01:06.360]直到连电话也打不通
[01:08.370]每朵黎明的乌云
[01:09.750]都像在对我不停的提醒
[01:11.730]他们说如果你再不放手
[01:13.620]身边的笑脸都变成泥泞
[01:15.600]我说心碎的揣测
[01:17.580]快乐过廉价的快乐
[01:19.530]假装能凝视你眼睛
[01:21.300]你善意的谎言我相信
[01:26.580]但你是一个 heartbreaker sundowner
[01:28.140]多希望是你周旋着我妥协着
[01:34.470]但最后却是言语刺骨手冰冷
[01:38.820]我无法感谢你嘴里的同情
[01:42.240]多希望你是 gold digger mindseeker
[01:46.050]是你对我在索取着罗列着
[01:50.070]但现实却是我无法让你兴奋
[01:54.570]你连被追求都难以配合 是谁的错
[02:18.000]可能吧恍若一场短暂又绚烂的烟花
[02:23.880]过客是注定陌路像宿命有偏差
[02:27.690]倾尽一切还被戏谑我不强求
[02:31.230]挽留无效感受不到手心残余温柔
[02:34.830]幻觉是相濡以沫却都耐不住磕碰
[02:38.070]目光所及都隐着痛困于过往不醒的梦
[02:42.000]爱若要被命运捉弄 又何必让心波动
[02:46.560]终究还是落空下一个又会是谁
[02:50.190]往昔的点点滴滴永久于彼此的影子里留下了烙印
[02:54.600]承诺它奄奄一息重演着相似的剧情变泡影
[02:58.530]以为海面在暴风雨还有你理解
[03:02.400]回忆无声肆虐侵略虚无的每一夜
[03:07.380]一眼万年只是我以为
[03:11.040]自卑蔓延着早将我击退
[03:14.730]所以不再问原因不奢求怜悯
[03:17.220]凝视你眼睛
[03:18.450]善意的谎言也终将尽
[03:23.700]但你是一个 heartbreaker sundowner
[03:24.900]多希望是你
[03:28.860]周旋着妥协着
[03:31.470]但最后却是言语刺骨
[03:34.260]手冰冷
[03:35.850]我无法感谢你嘴里的同情
[03:39.210]多希望你是 gold digger mindseeker
[03:43.080]是你对我在索取着罗列着
[03:47.040]但现实却是
[03:48.360]我无法让你兴奋
[03:51.690]你连被追求都难以配合 是谁的错
[03:55.770]像灰色的天空还没下雨
[03:59.850]我远远看着你暂时还没靠近
[04:03.720]期待我吐的烟能够将你抱紧
[04:07.650]你还没成为我生命里的教训
[04:11.460]但雨总会落下
[04:13.680]一滴一滴
[04:15.570]湖面涟漪让我看不清了倒影
[04:19.560]我的心里话终究让你扫兴
[04:23.190]你是我永远唱不上去的高音
[04:45.730]编曲 : LusciousBB/卡斯
[04:46.350]吉他 : 毕研财
[04:46.980]录音 : LusciousBB
[04:47.600]混音 : 小武
[04:48.230]母带 : 小武
[04:48.850]发行统筹 : 王子/pshone/舒丽园
[04:49.480]营销 : 戴欣怡/ayu阿油
[04:50.100]监制 : 王璟`;

// 《THE LONELIEST》歌词（用户提供，中英双语同刻度）
const THELONELIEST_LRC = `[00:00.000]作词 : Victoria/Thomas Raggi/Ethan Torchio/Damiano David/Rami Yacoub/Jason Evigan/Sarah Hudson/James Abrahart
[00:01.000]作曲 : Victoria/Thomas Raggi/Ethan Torchio/Damiano David/Rami Yacoub/Jason Evigan/Sarah Hudson/James Abrahart
[00:03.443]You'll be the saddest part of me
[00:03.443]你将是我生命里 最为悲伤的一隅
[00:07.054]A part of me that will never be mine
[00:07.054]在我之外 永久游离
[00:12.525]It's obvious
[00:12.525]显而易见
[00:14.252]Tonight is gonna be the loneliest
[00:14.252]今夜注定 最是孤寂
[00:18.211]You're still the oxygen I breathe
[00:18.211]你仍是我赖以生存的氧气
[00:21.971]I see your face when I close my eyes
[00:21.971]阖上双眼 你的面庞便浮现
[00:27.054]It's torturous
[00:27.054]今夜
[00:29.160]Tonight is gonna be the loneliest
[00:29.160]注定最是 煎熬孤寂
[00:33.796]There's a few lines that I have wrote
[00:33.796]写下几行遗言
[00:36.846]In case of death, that's what I want, that's what I want
[00:36.846]若死神降临 那便是我所想 便是我心中所求
[00:47.793]So don't be sad when I'll be gone
[00:47.793]故当我离开 莫要难过
[00:51.648]There's just one thing I hope you know, I loved you so
[00:51.648]只期盼你明了 我曾爱你如许
[01:01.963]'Cause I don't even care about the time I've got left here
[01:01.963]我甚至不在乎 剩下的时间有几多
[01:05.470]The only thing I know now is that I wanna spend it
[01:05.470]我此刻唯一所求 便是与你相守到底
[01:09.082]With you, with you nobody else here
[01:09.082]岁月静好 无人叨扰
[01:13.277]Tonight is gonna be the loneliest
[01:13.277]今夜注定 最是孤寂
[01:16.999]You'll be the saddest part of me
[01:16.999]你将是我生命里 最为悲伤的一隅
[01:20.692]A part of me that will never be mine
[01:20.692]在我之外 永久游离
[01:25.939]It's obvious
[01:25.939]显而易见
[01:28.162]Tonight is gonna be the loneliest
[01:28.162]今夜注定 最是孤寂
[01:32.030]You're still the oxygen I breathe
[01:32.030]你仍是我赖以生存的氧气
[01:35.481]I see your face when I close my eyes
[01:35.481]阖上双眼 你的面庞便浮现
[01:40.948]It's torturous
[01:40.948]今夜
[01:42.859]Tonight is gonna be the loneliest
[01:42.859]注定最是 煎熬孤寂
[01:46.831]I'm sorry but I gotta go
[01:46.831]对不起 但我得走了
[01:50.515]If you'll ever miss me give this song another go
[01:50.515]若是想我 便再唱起这首歌
[02:00.908]And I just keep on thinking how you made me feel better
[02:00.908]每每因你 我才渐入佳境 真让人不舍
[02:04.677]And all the crazy little things that we did together
[02:04.677]携手放肆的一点一滴 走马灯般闪过
[02:08.342]In the end, in the end, it doesn't matter
[02:08.342]到最后  到头来 一切都无所谓了
[02:11.854]If tonight is gonna be the loneliest
[02:11.854]若今夜 注定最孤寂
[02:16.400]You'll be the saddest part of me
[02:16.400]你将是我生命里 最为悲伤的一隅
[02:19.807]A part of me that will never be mine
[02:19.807]在我之外 永久游离
[02:25.381]It's obvious
[02:25.381]显而易见
[02:27.301]Tonight is gonna be the loneliest
[02:27.301]今夜注定 最是孤寂
[02:31.052]You're still the oxygen I breathe
[02:31.052]你仍是我赖以生存的氧气
[02:34.554]I see your face when I close my eyes
[02:34.554]阖上双眼 你的面庞便浮现
[02:40.028]It's torturous
[02:40.028]今夜
[02:42.046]Tonight is gonna be the loneliest
[02:42.046]注定最是 煎熬孤寂
[03:15.507]You'll be the saddest part of me
[03:15.507]你将是我生命里 最为悲伤的一隅
[03:19.030]A part of me that will never be mine
[03:19.030]在我之外 永久游离
[03:24.059]It's obvious
[03:24.059]显而易见
[03:26.017]Tonight is gonna be the loneliest
[03:26.017]今夜注定 最是孤寂
[03:30.289]You'll be the saddest part of me
[03:30.289]你将是我生命里 最为悲伤的一隅
[03:33.712]A part of me that will never be mine
[03:33.712]在我之外 永久游离
[03:39.176]It's obvious
[03:39.176]显而易见
[03:41.044]Tonight is gonna be the loneliest
[03:41.044]今夜注定 最是孤寂
[03:44.735]You're still the oxygen I breathe
[03:44.735]你仍是我赖以生存的氧气
[03:48.517]I see your face when I close my eyes
[03:48.517]阖上双眼 你的面庞便浮现
[03:53.888]It's torturous
[03:53.888]今夜
[03:55.833]Tonight is gonna be the loneliest
[03:55.833]注定最是 煎熬孤寂`;

// 《Sunshine》歌词（用户提供，中英双语同刻度）
const SUNSHINE_LRC = `[00:00.000]作词 : Ryan Tedder/Brent Kutzle/Tyler Spry/Zach Skelton/Casey Smith/Noel Zancanella
[00:00.113]作曲 : Ryan Tedder/Brent Kutzle/Tyler Spry/Zach Skelton/Casey Smith/Noel Zancanella
[00:00.226]Running through this strange life
[00:00.226]我在不同寻常的人生中疾驰
[00:01.972]Chasing all them green lights
[00:01.972]畅想着通行无阻
[00:03.701]Throwing off the shade for a little bit of sunshine
[00:03.701]抛开阴霾 拥抱一线暖阳
[00:07.176]Hit me with them good vibes
[00:07.176]满怀正能量 将我环绕
[00:08.837]Pictures on my phone like
[00:08.837]手机显示的图片都预示着
[00:10.570]Everything is so fire
[00:10.570]一切都饱含热情
[00:12.188]A little bit of sunshine
[00:12.188]一线暖阳
[00:14.004]Crazy lately I've been finding
[00:14.004]近来真是疯狂 我在确认
[00:15.718]Tryna write myself a sermon
[00:15.718]试图为自己写篇布道
[00:17.381]You just trynna get a word in life is not fair
[00:17.381]你想倾诉 生活四处充满不公
[00:20.378]I been working on my tunnel vision
[00:20.378]我竭力克制狭隘思维
[00:22.530]Tryna get a new prescription
[00:22.530]想寻求全新的出路
[00:24.244]Taking swings and even missing but I don't care
[00:24.244]挥舞拳脚 虽然都未命中 但我不在乎
[00:27.268]I'm dancing more Just a little bit
[00:27.268]继续舞动会儿吧
[00:29.181]Breathing more Just a little bit
[00:29.181]继续呼吸下吧
[00:30.866]Care a little less Just a little bit
[00:30.866]不要那么在意就好
[00:32.511]Like life is woo hoo
[00:32.511]生活就犹如惊叹号
[00:34.178]I'm making more just a little bit
[00:34.178]再多挣些钱
[00:35.986]Spend a little more to get rid of it
[00:35.986]增大点开销 来摆脱烦恼
[00:37.718]Smile a little more and I'm into it
[00:37.718]绽放微笑 我沉醉其间
[00:39.472]I I I I
[00:41.071]I've been running through this strange life
[00:41.071]我在不同寻常的人生中疾驰
[00:43.173]Chasing all them green lights
[00:43.173]畅想着通行无阻
[00:44.869]Throwing off the shade for a little bit of sunshine
[00:44.869]抛开阴霾 拥抱一线暖阳
[00:48.333]Hit me with them good vibes
[00:48.333]满怀正能量 将我环绕
[00:50.027]Pictures on my phone like
[00:50.027]手机显示的图片都预示着
[00:51.757]Everything is so fire
[00:51.757]一切都饱含热情
[00:53.411]A little bit of sunshine
[00:53.411]一线暖阳
[01:00.169]A little bit of sunshine
[01:00.169]一线暖阳
[01:07.039]A little bit of sunshine
[01:07.039]一线暖阳
[01:08.863]Another day, another selfish
[01:08.863]崭新的一天 继续别样地自私着
[01:10.490]Moment I've been feeling helpless
[01:10.490]我总是倍感无助
[01:12.276]Sick of seein' all the selfies, now I don't care
[01:12.276]看腻的自拍 现在我已不在乎
[01:15.583]Found myself a new vocation
[01:15.583]内心萌生全新的使命感
[01:17.408]Calibrated motivation
[01:17.408]调整好动机
[01:19.155]No more static change the station
[01:19.155]麻烦烟消云散 切换频道
[01:20.870]Headin' somewhere
[01:20.870]朝着目标进发
[01:22.187]I'm dancing more Just a little bit
[01:22.187]继续舞动会儿吧
[01:24.045]Breathing more Just a little bit
[01:24.045]继续呼吸下吧
[01:25.714]Care a little less Just a little bit
[01:25.714]不要那么在意就好
[01:27.404]Like life is woo hoo
[01:27.404]生活就犹如惊叹号
[01:29.002]I'm making more just a little bit
[01:29.002]再多挣些钱
[01:30.824]Spend a little more to get rid of it
[01:30.824]增大点开销 来摆脱烦恼
[01:32.533]Smile a little more and I'm into it
[01:32.533]绽放微笑 我沉醉其间
[01:34.396]Honestly man lately I've been
[01:34.396]伙计 说实话 近来我在
[01:35.732]I, I, I, I-I've been running through this strange life
[01:35.732]不同寻常的人生中疾驰
[01:37.989]Chasing all them green lights
[01:37.989]畅想着通行无阻
[01:39.733]Throwing off the shade for a little bit of sunshine
[01:39.733]抛开阴霾 拥抱一线暖阳
[01:43.166]Hit me with them good vibes
[01:43.166]满怀正能量 将我环绕
[01:44.902]Pictures on my phone live
[01:44.902]手机显示的图片都预示着
[01:46.614]Everything is so fire
[01:46.614]一切都饱含热情
[01:48.267]A little bit of sunshine
[01:48.267]一线暖阳
[01:55.027]A little bit of sunshine
[01:55.027]一线暖阳
[02:01.890]A little bit of sunshine
[02:01.890]一线暖阳
[02:03.764]I don't really know any other way to say this
[02:03.764]我实在不知还能如何表达
[02:05.345]Can't slow down trying to keep up with the changes
[02:05.345]无法放缓步伐 竭尽全力紧跟世事变迁
[02:07.145]Punch that number in the name when I clock in
[02:07.145]我打卡上班 在自己姓名那栏输入数字
[02:08.837]Now I feel like Michael with a cane when I walk in
[02:08.837]我走进来的时候就像拄拐杖的迈克尔
[02:10.549]Basically life is the same thing unless you don't want the same thing
[02:10.549]其实生活本就一成不变 除非你想要做出改变
[02:13.984]Probably should want and get a feature but I didn't
[02:13.984]或许该去找人合作 但我还是算了
[02:15.468]I've been saving up the money cause it's better for the business
[02:15.468]一直以来我都在攒钱 毕竟对我的事业来说多多益善
[02:16.683]I, I, I, I-I've been running through this strange life
[02:16.683]我在不同寻常的人生中疾驰
[02:19.173]Chasing all them green lights
[02:19.173]畅想着通行无阻
[02:20.885]Throwing off the shade for a little bit of sunshine (Yeah)
[02:20.885]抛开阴霾 拥抱一线暖阳
[02:28.851]Woo! Woo!
[02:28.851]令人惊叹
[02:31.012]A little bit of sunshine
[02:31.012]一线暖阳
[02:38.043]A little bit of sunshine
[02:38.043]一线暖阳`;

// 《RODEO DRIVE》歌词（用户提供，俄中双语同刻度）
const RODEODRIVE_LRC = `[00:00.000]作词 : Измайлова Адэлина ,Измайлова Хава
[00:00.000]作曲 : Василь Шарапов
[00:00.000]RODEO DRIVE - Adelina
[00:19.450]Там
[00:19.450]唯有在那里
[00:22.620]Море тёплым молоком
[00:22.620]温暖的海水如同牛奶
[00:27.380]Вниз стекает по ногам моим в мелкий песок
[00:27.380]顺着我的双腿流淌 汇入细腻的沙中
[00:32.410]Нежно так
[00:32.410]如此温柔
[00:37.250]Только там
[00:37.250]唯有在那里
[00:41.700]Кожа - карамель и соль
[00:41.700]肌肤宛如焦糖与盐
[00:46.630]На губах твоих я таю
[00:46.630]我在你的唇上融化
[00:49.210]Вдыхая
[00:49.210]将爱意深深吸入
[00:50.040]В тебя
[00:50.040]融入你的身体
[00:51.620]Всю любовь
[00:51.620]全部的爱意
[00:56.430]Только там
[00:56.430]唯有在那里
[01:00.230]Родео драйв
[01:00.230]奢华的天堂
[01:02.460]Мы ловим кайф
[01:02.460]我们尽情享受
[01:04.840]Между поцелуями
[01:04.840]于亲吻的间隙
[01:07.240]Wonderful life
[01:07.240]感受美妙生活
[01:09.610]Ласково нежно
[01:09.610]温柔细腻
[01:12.020]Но так небрежно
[01:12.020]却又如此随性
[01:14.440]Hold me tight
[01:14.440]紧紧拥我入怀
[01:16.980]Hey hey hey hey
[01:16.980]嘿
[01:19.230]Родео драйв
[01:19.230]奢华的天堂
[01:21.650]Мы ловим кайф
[01:21.650]我们尽情享受
[01:24.000]Между поцелуями
[01:24.000]于亲吻的间隙
[01:26.440]Wonderful life
[01:26.440]感受美妙生活
[01:28.800]Ласково нежно
[01:28.800]温柔细腻
[01:31.250]Но так небрежно
[01:31.250]却又如此随性
[01:33.700]Hold me tight
[01:33.700]紧紧拥我入怀
[01:36.120]Hey hey hey hey
[01:36.120]嘿
[01:38.670]Остановись
[01:38.670]请停驻此刻
[01:40.800]Ты меня слышишь
[01:40.800]你可听见我的心声
[01:43.240]Время застыло
[01:43.240]时间凝固
[01:45.640]Медленно дышишь
[01:45.640]你的呼吸悠长
[01:48.040]Нет никого
[01:48.040]再无他人
[01:50.440]Кроме тебя
[01:50.440]唯有你我相伴
[01:52.810]Сейчас
[01:52.810]就在此刻
[01:56.460]Только там
[01:56.460]唯有在那里
[01:58.880]Мы с тобой как дети у костра
[01:58.880]你我宛如篝火旁的孩童
[02:03.550]Жадные до света и тепла
[02:03.550]渴望光明和温暖
[02:09.680]Нам так легко
[02:09.680]一切都轻松自在
[02:15.830]Только там
[02:15.830]唯在方寸之间
[02:19.450]Родео драйв
[02:19.450]奢华的天堂
[02:21.640]Мы ловим кайф
[02:21.640]我们尽情享受
[02:24.090]Между поцелуями
[02:24.090]于亲吻间隙
[02:26.500]Wonderful life
[02:26.500]享受美妙生活
[02:28.820]Ласково нежно
[02:28.820]温柔细腻
[02:31.240]Но так небрежно
[02:31.240]却又如此随性
[02:33.700]Hold me tight
[02:33.700]紧紧拥我入怀
[02:36.120]Hey hey hey hey
[02:36.120]嘿
[02:38.450]Родео драйв
[02:38.450]奢华的天堂
[02:40.830]Мы ловим кайф
[02:40.830]我们尽情享受
[02:43.210]Между поцелуями
[02:43.210]于亲吻间隙
[02:45.640]Wonderful life
[02:45.640]享受美妙生活
[02:48.050]Ласково нежно
[02:48.050]温柔细腻
[02:50.420]Но так небрежно
[02:50.420]却又如此随性
[02:52.820]Hold me tight
[02:52.820]紧紧拥我入怀
[02:55.220]Hey hey hey hey
[02:55.220]嘿 我永远爱你`;

// 《白日梦蓝》歌词（用户提供）
const BAIRIMENGLAN_LRC = `[00:00.000]作词 : 子键
[00:01.000]作曲 : 子键
[01:22.070]青春是青涩的年代
[01:27.190]我明白 明天不会有色彩
[01:35.080]社会是伤害的比赛
[01:40.479]当我醒来时才明白
[01:48.750]请你不要离开
[01:52.130]这里胜似花开
[01:55.330]没有人能够掩盖
[01:58.740]梦境中的色彩
[02:01.860]请你不要离开
[02:05.160]这里胜似花开
[02:09.300]没有人会去涂改
[02:12.050]梦境中的色彩
[02:42.620]头上蓝色时光流淌
[02:50.200]空荡的世界沮丧
[03:36.820]请你不要离开
[03:39.710]这里胜似花开
[03:42.960]没有人能够掩盖
[03:46.310]梦境中的色彩
[03:49.760]请你不要离开
[03:52.890]这里胜似花开
[03:56.310]没有人会去涂改
[03:59.780]梦境中的色彩
[04:03.350]青春是青涩的年代
[04:08.240]我明白 明天不会有色彩
[04:16.600]社会是伤害的比赛
[04:21.640]当我醒来时才明白`;

// 《你永远是我的宝贝，宝贝》歌词（用户提供），已去除编曲信息行、空时间戳行及尾部制作人员名单
const BAOBEI_LRC = `[00:00.000]作词 : 李永驻
[00:01.000]作曲 : 李永驻
[00:22.446]真的吗？心情有好点了
[00:26.631]等下个陌生人 点亮心里的灯
[00:32.578]对与不对 难懂的罗生门
[00:36.828]让它掉入照后镜里拼命向你追
[00:42.578]你笑很美 别急着去枯萎
[00:47.079]任何的痛苦都不会通通白白受罪
[00:52.582]你永远是我的宝贝，宝贝
[01:02.328]嘿，嘘～累了就先睡
[01:07.265]或许 我当你抱枕
[01:12.262]一起 把夜当棉被
[01:16.713]盖住是非 无论错对
[01:23.704]我要唱的多大声
[01:26.215]你笑才能毫无防备
[01:30.657]我不要你孤单面对
[01:33.866]到现在没告诉谁
[01:36.359]那一夜我其实没睡
[01:40.855]我不要你又一个人
[01:44.058]欸～～我说过我不要你孤单面对
[01:54.046]欸～～我说过我不要你又一个人
[02:22.524]我许了一万个愿望你觉得
[02:26.466]最后到底几个会成真
[02:31.168]几个摔地落空心好疼
[02:34.662]有些人就会笑你憨
[02:36.663]其实他们比你惨啰
[02:40.611]非得跟你比行头 谁更好没准
[02:44.359]浪子的故事很美，张力很疼
[02:48.598]Oh no!假的，宝贝！
[02:51.282]吹嘘的谁都会吹
[02:54.281]爱过地注定疼 有血有肉的人
[02:59.715]跟着我唱一遍 把悲伤逼出黑夜
[03:04.468]我要唱的多大声
[03:07.219]你笑才能毫无防备
[03:11.916]我不要你孤单面对
[03:14.671]到现在没告诉谁
[03:17.411]那一夜我其实没睡
[03:21.596]我不要你又一个人
[03:24.854]欸～～我说过我不要你孤单面对
[03:35.109]欸～～我说过我不要你又一个人
[03:49.139]你永远是我的宝贝 宝贝宝贝 宝贝宝贝
[03:59.335]你永远是我的宝贝 宝贝宝贝 宝贝宝贝
[04:10.286]你永远是我的宝贝 宝贝宝贝 宝贝宝贝
[04:20.526]你永远是我的宝贝 宝贝宝贝 宝贝宝贝
[04:33.040]我要唱的多大声
[04:35.489]你笑才能毫无防备
[04:39.979]我不要你孤单面对
[04:43.229]到现在没告诉谁
[04:45.981]那一夜我其实没睡
[04:50.230]我不要你又一个人
[04:53.229]欸～～我说过我不要你孤单面对
[05:03.487]欸～～我说过我不要你又一个人`;

// 《美好的事可不可以发生在我身上》歌词（用户提供）
const MEIHAO_LRC = `[00:00.000]作词 : ARNY Wu
[00:01.000]作曲 : ARNY Wu/張譯云 Gail 米/Creed Zhao/陳佑祥 sionC/侯啟泰 CT
[00:33.960]毫无意外的旅程 做到壹些不劳而获的梦 看似幸运啊
[00:47.020]毫无意外的旅程 平淡如水的爱情 看似安稳啊
[00:59.640]毫无意外的旅程 得到一些可以任性的机会 看似自由啊
[01:12.500]毫无意外的旅程 做到别人也想要做的事 看似精彩啊
[01:27.220]但是事实上发生的从来没想过
[01:31.350]真正想要的都被别人拿走
[01:34.460]没决定太多事就这样到了今天
[01:40.260]然后接下来变成了硬撑的烂局
[01:43.980]再打一剂希望麻醉了痛苦
[01:47.190]只能进 不能退 扛不起 放不下
[01:50.490]不得不走下去
[01:52.750]我们半推半就的人生
[01:59.040]没有和你一样被眷顾的未来
[02:05.840]我们半推半就的人生
[02:11.730]怎么过啊 怎么过啊
[02:45.350]毫无意外的旅程 得到一些可以任性的机会 看似自由啊
[02:58.150]毫无意外的旅程 做到别人也想要做的事 看似精彩啊
[03:09.850]但是事实上发生的从来没想过
[03:13.760]真正想要的都被别人拿走
[03:16.850]没决定太多事就这样到了今天
[03:22.650]然后接下来变成了硬撑的烂局
[03:26.300]再打一剂希望麻醉了痛苦
[03:29.660]只能进 不能退 扛不起 放不下
[03:32.890]不得不走下去
[03:35.130]我们半推半就的人生
[03:41.400]没有和你一样被眷顾的未来
[03:48.080]我们半推半就的人生
[03:54.170]怎么过啊 怎么过啊
[04:01.380]我们半推半就的人生
[04:07.210]没有和你一样被眷顾的未来
[04:13.640]我们半推半就的人生
[04:19.800]怎么过啊 怎么过啊
[04:27.450]迷惘的灵魂啊 安静地运转吧
[04:40.280]忍耐的灵魂啊 安静地运转吧
[04:52.880]迷惘的灵魂啊 安静地运转吧
[05:05.590]忍耐的灵魂啊 安静地运转吧`;

// 行内迷你歌词窗：播放中按本地计时器滚动展示当前句（句级高亮 + 垂直滚动 + 上下渐隐）
const LyricScroller: React.FC<{ lrc: string; active: boolean; startAt: number; offsetMs?: number; holdMs?: number }> = ({ lrc, active, startAt, offsetMs = 0, holdMs = 0 }) => {
  const lines = React.useMemo(() => parseLrc(lrc), [lrc]);
  const offset = LRC_OFFSET_MS - offsetMs; // 全局起表校准 − 单曲延后量（offsetMs 正值 = 歌词整体延后）
  // 懒初始化：歌词窗跨歌单页切回重挂载时，按父层起表时刻直接算出当前句，避免从第 0 句闪一下
  const [idx, setIdx] = React.useState(() => {
    if (!active) return 0;
    const elapsed = (performance.now() - startAt + offset) / 1000;
    let i = 0;
    for (let k = 0; k < lines.length; k++) {
      if (lines[k].t <= elapsed) i = k;
      else break;
    }
    return i;
  });

  React.useEffect(() => {
    if (!active) return; // 暂停：停表并冻结当前句（歌词窗保持展示断点句，续播激活时由下方逻辑重新定位）
    const t0 = startAt || performance.now(); // 起表时刻由父层持有：重挂载后仍能续算播放进度
    const holdSec = holdMs / 1000;
    // 断点基准：激活瞬间的歌词钟读数（续播=断点句位置，新播≈起表处）；同步定位当前句，不等首个 500ms tick
    const base = (performance.now() - t0 + offset) / 1000;
    // 走表取 max(断点位置, 自然时钟−宽限)：续播宽限期内冻结在断点句（等 iframe 重挂出声，歌词不先跑），到点后 1:1 推进，下一句时间戳到点自然切换修正
    const pos = () => Math.max(base, (performance.now() - t0 + offset) / 1000 - holdSec);
    const locate = () => {
      const elapsed = pos();
      let i = 0;
      for (let k = 0; k < lines.length; k++) {
        if (lines[k].t <= elapsed) i = k;
        else break;
      }
      return i;
    };
    setIdx(locate());
    const timer = setInterval(() => {
      const i = locate();
      setIdx((prev) => (prev === i ? prev : i));
    }, 500);
    return () => clearInterval(timer);
  }, [active, lines, startAt, offset, holdMs]);

  // 双语同刻度：idx 命中组内最后一行（中文），回溯到组首（英文）对齐，整组一起高亮
  const curT = lines[idx]?.t ?? 0;
  let anchor = idx;
  while (anchor > 0 && lines[anchor - 1].t === curT) anchor--;
  let groupSize = 1;
  while (anchor + groupSize < lines.length && lines[anchor + groupSize].t === curT) groupSize++;
  // 组在窗内垂直定位：双语组(38px)正好占满窗口；单行组垂直居中
  const offsetY = (38 - groupSize * LRC_LINE_H) / 2 - anchor * LRC_LINE_H;

  // 当前组内超宽句跑马灯：句首展示 delay 后匀速左移，句尾在下一句开始前 0.5s 对齐窗右边；句切换时重置
  const boxRef = React.useRef<HTMLDivElement>(null);
  const nextT = lines[anchor + groupSize]?.t ?? curT + 30;
  React.useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.querySelectorAll<HTMLElement>('[data-line]').forEach((el) => {
      el.getAnimations().forEach((a) => a.cancel());
      el.style.transform = '';
      if (Math.abs(Number(el.dataset.t) - curT) >= 0.02) return;
      const overflow = el.scrollWidth - el.clientWidth;
      if (overflow <= 4) return;
      // 句间隔太短时按比例压缩句首展示与提前量；仍来不及滚（rollMs≤300）则左对齐句首，避免居中裁切只露出句中一段
      const spanMs = (nextT - curT) * 1000;
      const delay = Math.min(1200, spanMs * 0.35);
      const rollMs = spanMs - delay - 500;
      if (rollMs > 300) {
        el.animate(
          [{ transform: 'translateX(0)' }, { transform: `translateX(${-overflow}px)` }],
          { duration: Math.min(overflow * 55, rollMs), delay, easing: 'linear', fill: 'forwards' }
        );
      } else {
        el.style.transform = `translateX(${overflow / 2}px)`;
      }
    });
  }, [anchor, curT]);

  return (
    <div ref={boxRef} className="relative w-full max-w-[220px] h-[38px] overflow-hidden">
      <div
        className="absolute left-0 right-0"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        {lines.map((l, i) => (
          <div
            key={i}
            data-line
            data-t={l.t}
            className={`h-[19px] leading-[19px] text-center whitespace-nowrap transition-all duration-300 ${
              Math.abs(l.t - curT) < 0.02 ? 'text-[12px] text-[#7E8491]' : 'text-[11px] text-[#A5AAB8]/70 opacity-0'
            }`}
          >
            {l.text}
          </div>
        ))}
      </div>
    </div>
  );
};

// 歌名/歌手窗体：未播放随内容展开完整展示；播放中平滑收窄至窄窗，超宽文本循环跑马灯（复制一份无缝匀速左移，速度同歌词窗 55ms/px）
const OVERFLOW_NARROW_W = 112; // 播放中窗体宽度
const OverflowMarquee: React.FC<{ text: string; className?: string; active: boolean }> = ({ text, className, active }) => {
  const boxRef = React.useRef<HTMLDivElement>(null); // 静态单份文本：w-max 常驻，测量自然宽度
  const rollRef = React.useRef<HTMLDivElement>(null); // 循环轨道：双份文本无缝左移
  const [naturalW, setNaturalW] = React.useState(0);

  // useLayoutEffect：首帧绘制前测得自然宽度，避免宽度 0 闪断；w-max 保证测量值不随窗体缩放
  React.useLayoutEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    setNaturalW(box.scrollWidth);
  }, [text]);

  // 播放中仅超宽文本收窄至窄窗跑马灯；短于窄窗的文本保持字数适配宽度
  const boxW = active ? Math.min(naturalW, OVERFLOW_NARROW_W) : naturalW;
  const overflow = active ? naturalW - OVERFLOW_NARROW_W : 0;
  const loop = overflow > 4; // 与歌词窗同阈值：轻微溢出不滚

  React.useEffect(() => {
    if (!loop) return;
    const roll = rollRef.current;
    if (!roll) return;
    const gap = 48; // 复制段间隔
    const anim = roll.animate(
      // 位移 = 一整段文本 + 间隔：第二份文本精确落到第一份起始位，循环点无缝衔接
      [{ transform: 'translateX(0)' }, { transform: `translateX(${-(naturalW + gap)}px)` }],
      { duration: (naturalW + gap) * 55, delay: 300, easing: 'linear', iterations: Infinity } // delay 对齐窗体收窄过渡
    );
    return () => anim.cancel();
  }, [loop, naturalW, text]);

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      // 未测出自然宽度前不写 width（auto 渲染自然宽度）：auto→px 不可插值，避免挂载帧触发 0→宽度的左到右展开过渡
      style={{ width: naturalW ? boxW : undefined, transition: 'width 300ms ease' }}
    >
      <div ref={boxRef} className={`w-max whitespace-nowrap ${loop ? 'invisible' : ''}`}>{text}</div>
      {loop && (
        <div ref={rollRef} className="absolute left-0 top-0 flex w-max whitespace-nowrap">
          <span className="shrink-0">{text}</span>
          <span className="shrink-0 pl-12" aria-hidden="true">{text}</span>
        </div>
      )}
    </div>
  );
};

const PLAYLIST_TABS: { key: PlaylistTabKey; label: string; songs: PlaylistSong[] }[] = [
  {
    key: 'solo',
    label: '独处',
    songs: [
      { title: '绿洲', artist: '徐佳莹', duration: '04:13', bvid: 'BV11SANeREGd', lrc: LVZHOU_LRC },
      { title: 'Hindenburg Lover', artist: 'Anson Seabra', duration: '05:03', bvid: 'BV1kJAXeDEdf', lrc: HINDENBURG_LRC },
      { title: '纤维', artist: '林忆莲', duration: '04:16', bvid: 'BV1Xt421A7EA', lrc: XIANWEI_LRC, lrcOffsetMs: 500 },
      { title: '周旋', artist: '王以太 / 艾热 AIR', duration: '04:51', bvid: 'BV1KQ8U6ZEfq', lrc: ZHOUXUAN_LRC, lrcOffsetMs: 2200 },
    ],
  },
  {
    key: 'mood',
    label: '情绪',
    songs: [
      { title: '哀人（i）', artist: '门尼', duration: '04:12', bvid: 'BV1rz846xEMb', lrc: AIREN_LRC },
      { title: 'Schizophrenic', artist: 'Brian Cheng', duration: '03:50', bvid: 'BV1sx2XBuE8a', lrc: SCHIZOPHRENIC_LRC, lrcOffsetMs: 2300 },
      { title: 'THE LONELIEST', artist: 'Måneskin', duration: '04:08', bvid: 'BV1284y1j7nc', lrc: THELONELIEST_LRC, lrcOffsetMs: 2700 },
      { title: '美好的事可不可以发生在我身上', artist: '康士坦的变化球', duration: '06:03', bvid: 'BV1kdKWe5EhT', lrc: MEIHAO_LRC, lrcOffsetMs: 2200 },
    ],
  },
  {
    key: 'tipsy',
    label: '微醺',
    songs: [
      { title: 'Love Quotes', artist: 'Jenevieve', duration: '03:15', bvid: 'BV1r8RqYJEQg', lrc: LOVEQUOTES_LRC, lrcOffsetMs: 2200 },
      { title: '夜泳 (We Dive)', artist: '莫非定律乐团', duration: '04:11', bvid: 'BV1G4rrB3ETM', lrc: YEYONG_LRC, lrcOffsetMs: 2200 },
      { title: 'Say', artist: 'Keshi', duration: '03:06', bvid: 'BV1Mm421G7ct', lrc: SAY_LRC, lrcOffsetMs: 5300 },
      { title: 'RODEO DRIVE', artist: 'Adelina', duration: '03:03', bvid: 'BV1Bhk1YBErs', lrc: RODEODRIVE_LRC, lrcOffsetMs: 2500 },
    ],
  },
  {
    key: 'energy',
    label: '通勤',
    songs: [
      { title: '生活因你而火热', artist: '新裤子', duration: '04:52', bvid: 'BV1zG4y1X7Se', lrc: SHENGHUO_LRC, lrcOffsetMs: 2200 },
      { title: '白日梦蓝', artist: '刺猬', duration: '04:49', bvid: 'BV1894y1q7Gr', lrc: BAIRIMENGLAN_LRC, lrcOffsetMs: 2200 },
      { title: 'Training Season', artist: 'Dua Lipa', duration: '03:30', bvid: 'BV1H7tw6mEaN', lrc: TRAININGSEASON_LRC, lrcOffsetMs: 2200 },
      { title: 'WORK Pt.4', artist: 'ATEEZ / G-Eazy', duration: '03:23', bvid: 'BV1oTFkeMEhk', lrc: WORKPT4_LRC },
    ],
  },
  {
    key: 'offduty',
    label: '下班',
    songs: [
      { title: 'Hey Gringo', artist: 'KALEO', duration: '04:45', bvid: 'BV1DQ8RzcEFD', lrc: HEYGRINGO_LRC, lrcOffsetMs: 7000 },
      { title: 'Sunshine', artist: 'OneRepublic', duration: '02:45', bvid: 'BV1un6zYPEyw', lrc: SUNSHINE_LRC, lrcOffsetMs: 2500 },
      { title: 'Shivers', artist: 'Ed Sheeran', duration: '03:53', bvid: 'BV1TG4y1371i', lrc: SHIVERS_LRC, lrcOffsetMs: 9700 },
      { title: 'special', artist: 'Richie Kotzen', duration: '05:12', bvid: 'BV1BaKLzMEYK', lrc: SPECIAL_LRC, lrcOffsetMs: 1900 },
    ],
  },
  {
    key: 'rock',
    label: '摇滚',
    songs: [
      { title: 'Fruit Fly', artist: '窦靖童 / 黑裙子', duration: '05:35', bvid: 'BV1FYxaz3EBw', lrc: FRUITFLY_LRC },
      { title: '想念', artist: '梁博', duration: '06:37', bvid: 'BV1Qr421W763', lrc: XIANGNIAN_LRC, lrcOffsetMs: 2700 },
      { title: '你永远是我的宝贝，宝贝', artist: '康姆士COM\'Z', duration: '05:22', bvid: 'BV15eSCYVEqm', lrc: BAOBEI_LRC, lrcOffsetMs: 3000 },
      { title: '小鸠（After Life After Death）', artist: '浅水ShallowEnd', duration: '10:38', bvid: 'BV1tXwwzkEHy', lrc: XIAOJIU_LRC },
    ],
  },
];

// 按歌曲 key（歌单 key:歌名）跨所有歌单页查找歌曲对象
const findSongByKey = (key: string | null): PlaylistSong | null => {
  if (!key) return null;
  for (const p of PLAYLIST_TABS) {
    const hit = p.songs.find((s) => `${p.key}:${s.title}` === key);
    if (hit) return hit;
  }
  return null;
};

// 全部歌单的扁平歌曲 key 列表（按歌单与曲目顺序）：顺序播放跨歌单推进、随机播放跨歌单选取
const ALL_SONG_KEYS: string[] = PLAYLIST_TABS.flatMap((p) => p.songs.map((s) => `${p.key}:${s.title}`));

// ============================================================
// 全局音乐播放器 Provider：播放状态提升至应用根部，导航栏黑胶与影视音乐歌单页共享同一份状态；
// 音频 iframe 挂在 Provider 根部而非歌单页内——切换任意 tab 播放不中断（全局播放器重构：已删除网易云分支）
// ============================================================
export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<string | null>(null); // 当前播放歌曲（歌单 key:歌名）
  const [songPaused, setSongPaused] = useState(false); // 当前歌曲是否处于暂停态
  const [focusedSong, setFocusedSong] = useState<string | null>(null); // 背景被选取的歌曲行（白底+边框+阴影），与播放状态独立
  const [playStartedAt, setPlayStartedAt] = useState(0); // 播放起表时刻（performance.now()），歌词窗重挂载后仍能续算进度
  const [lyricHoldMs, setLyricHoldMs] = useState(0); // 歌词走表宽限（ms）：续播时先冻结断点句，等 iframe 重挂出声再推进
  const [playNonce, setPlayNonce] = useState(0); // iframe 重挂计数：同曲重启（单曲循环/重播）时强制重载 iframe
  const [playMode, setPlayModeState] = useState<PlayMode>(() => {
    const saved = localStorage.getItem('mb_play_mode');
    return saved === 'loop-one' || saved === 'shuffle' ? saved : 'order';
  });
  const [viewRequest, setViewRequest] = useState<ViewPlaylistRequest | null>(null);
  // 当前歌曲已播放秒数（断点续播）：暂停时记下断点，恢复时作为 B 站 iframe 的 t= 起始参数与歌词续算基准
  const elapsedBaseRef = React.useRef(0);

  const setPlayMode = (mode: PlayMode) => {
    setPlayModeState(mode);
    localStorage.setItem('mb_play_mode', mode); // 连播模式本地持久化
  };

  // 开播一首歌：断点清零 + 重挂 iframe（key 递增）+ 歌词从零起表
  const startSong = (key: string) => {
    elapsedBaseRef.current = 0;
    setCurrentSong(key);
    setSongPaused(false);
    setFocusedSong(key);
    setPlayStartedAt(performance.now());
    setLyricHoldMs(0);
    setPlayNonce((n) => n + 1);
  };

  // 歌曲播放控制：同一首=播放/暂停切换，其他歌=切换播放；切歌时背景选取态跟随
  const toggleSong = (key: string) => {
    if (currentSong === key) {
      if (songPaused) {
        setPlayStartedAt(performance.now() - elapsedBaseRef.current * 1000); // 续播：起表回拨到断点，歌词同步续算
        setLyricHoldMs(RESUME_HOLD_MS); // 歌词先冻结断点句，宽限后再走表
      } else {
        elapsedBaseRef.current = (performance.now() - playStartedAt) / 1000; // 暂停：记下断点
      }
      setSongPaused(!songPaused);
    } else {
      startSong(key);
    }
  };

  // 导航栏黑胶播放/暂停键：已选歌=播放/暂停切换；从未选歌时默认从「独处」歌单第一首开始
  const playPause = () => {
    if (currentSong) {
      toggleSong(currentSong);
      return;
    }
    const first = PLAYLIST_TABS[0].songs[0];
    startSong(`${PLAYLIST_TABS[0].key}:${first.title}`);
  };

  // 「查看歌单」：带自增序号广播跳转请求（App 切到爱好 tab，歌单页落到对应列表）
  const viewPlaylist = () => {
    setViewRequest((r) => ({
      n: (r?.n ?? 0) + 1,
      playlistKey: currentSong ? currentSong.split(':')[0] : null, // 无播放记录时为 null，落地默认独处歌单
      songKey: currentSong,
    }));
  };

  // 正在播放的歌曲对象（跨歌单页查找）：控制全局 iframe 与时长定时器；暂停时为 null
  const playingSong = currentSong && !songPaused ? findSongByKey(currentSong) : null;

  // 按连播模式切到下一首（跨歌单：顺序播完最后一个歌单的末曲回卷到第一个歌单，随机从全部歌单选取）；
  // 播完自动切歌与手动切歌共用（manual=true 供切歌键用，单曲循环模式下也前进到列表下一首）
  const advanceSong = (manual: boolean) => {
    if (!currentSong) return;
    if (!manual && playMode === 'loop-one') {
      startSong(currentSong); // 单曲循环：同曲重启（nonce 递增强制重挂 iframe）
      return;
    }
    if (playMode === 'shuffle' && ALL_SONG_KEYS.length > 1) {
      let r = Math.max(0, ALL_SONG_KEYS.indexOf(currentSong));
      while (ALL_SONG_KEYS[r] === currentSong) r = Math.floor(Math.random() * ALL_SONG_KEYS.length);
      startSong(ALL_SONG_KEYS[r]);
      return;
    }
    const idx = Math.max(0, ALL_SONG_KEYS.indexOf(currentSong));
    const next = ALL_SONG_KEYS[(idx + 1) % ALL_SONG_KEYS.length]; // 顺序播放：全局下一首，末尾回卷第一首
    if (next) startSong(next);
  };

  // 手动切歌：未播放时按当前模式起播——随机模式从全部歌单随机起一首，其余从第一个歌单第一首开始
  const skipSong = () => {
    if (currentSong) {
      advanceSong(true);
      return;
    }
    const r =
      playMode === 'shuffle' && ALL_SONG_KEYS.length > 1
        ? Math.floor(Math.random() * ALL_SONG_KEYS.length)
        : 0;
    startSong(ALL_SONG_KEYS[r]);
  };

  // 播完自动切歌：B 站 iframe 无跨域结束事件，按配置时长定时近似检测（+2s 出声延迟余量；续播时扣除回退补偿）
  React.useEffect(() => {
    if (!playingSong || !playingSong.duration || !currentSong) return;
    const [m, s] = playingSong.duration.split(':').map(Number);
    const played = Math.max(0, elapsedBaseRef.current - RESUME_SEEK_BACK_S);
    const timer = setTimeout(() => advanceSong(false), Math.max(3000, (m * 60 + s - played) * 1000 + 2000));
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playingSong, songPaused, playMode, currentSong]);

  return (
    <MusicPlayerContext.Provider
      value={{
        currentSong,
        songPaused,
        focusedSong,
        setFocusedSong,
        playStartedAt,
        lyricHoldMs,
        playMode,
        setPlayMode,
        toggleSong,
        playPause,
        skipSong,
        viewPlaylist,
        viewRequest,
        isPlaying: !!playingSong,
      }}
    >
      {children}
      {/* 全局音频 iframe（B 站外链播放器）：fixed 微型容器不影响任何布局，切 tab/页面不卸载，播放全程连续 */}
      <div className="fixed top-0 left-0 h-px w-px overflow-hidden opacity-0 pointer-events-none" aria-hidden="true">
        {playingSong && playingSong.bvid && (
          <iframe
            key={playNonce}
            src={`https://player.bilibili.com/player.html?bvid=${playingSong.bvid}&autoplay=1&danmaku=0&t=${elapsedBaseRef.current >= 1 ? Math.max(0, elapsedBaseRef.current - RESUME_SEEK_BACK_S).toFixed(1) : '0'}`}
            allow="autoplay; encrypted-media"
            title={playingSong.title}
            className="h-px w-px border-0"
          />
        )}
      </div>
    </MusicPlayerContext.Provider>
  );
};

// 推荐片单（仅 film-music 使用）：电影 / 剧集两组，配合片单头部切换器
type FilmPick = { title: string; meta: string; note: string };
const FILM_MOVIES: FilmPick[] = [
  { title: '《看不见的客人》', meta: '奥里奥尔·保罗 · 2016 · 反转悬疑', note: '密室疑云下的谎言闭环，每一次辩解都是对上一版叙事的推翻。' },
  { title: '《十二公民》', meta: '徐昂 · 2015 · 本土化怒汉', note: '一场模拟法庭的十二人辩论，把偏见与程序正义谈得掷地有声。' },
  { title: '《寻梦环游记》', meta: '皮克斯 · 2017 · 奇幻治愈', note: '以亡灵节重构生死观，「请记住我」是对遗忘最温柔的抵抗。' },
];
const FILM_SERIES: FilmPick[] = [
  { title: '《漫长的季节》', meta: '辛爽 · 2023 · 生活悬疑', note: '时代洪流下的父辈群像，「往前看，别回头」是释然也是体面。' },
  { title: '《觉醒年代》', meta: '张永新 · 2021 · 思想群像', note: '从新文化运动到建党的思想激荡，让教科书里的人物重新有了体温。' },
  { title: '《大明王朝1566》', meta: '张黎 · 2007 · 历史正剧', note: '朝堂博弈与权力语言的极致书写，每一句台词都有弦外之音。' },
];
const FILM_TABS: { key: 'movie' | 'series'; label: string }[] = [
  { key: 'movie', label: '电影' },
  { key: 'series', label: '剧集' },
];

export const HobbiesTab: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [bookPage, setBookPage] = useState(0);
  const [msgActive, setMsgActive] = useState(false); // 留言板激活态
  const [activeEsportsTab, setActiveEsportsTab] = useState<'bp' | 'flow'>('flow');
  const [animePicksTab, setAnimePicksTab] = useState<'anime' | 'game'>('anime');
  const [polityTab, setPolityTab] = useState<'geo' | 'eco' | 'culture'>('geo');
  const [activePlaylistTab, setActivePlaylistTab] = useState<PlaylistTabKey>('solo');
  // 播放状态由全局 MusicPlayerProvider 持有（导航栏黑胶与歌单页共享），此处仅消费
  const {
    currentSong,
    songPaused,
    focusedSong,
    setFocusedSong,
    playStartedAt,
    lyricHoldMs,
    toggleSong,
    viewRequest,
  } = usePlayer();
  const [playlistOpen, setPlaylistOpen] = useState(true); // 珍藏歌单折叠态（默认展开；收起仅隐藏 UI，不打断播放）
  const [filmPicksOpen, setFilmPicksOpen] = useState(false); // 推荐片单折叠态（与珍藏歌单互斥：展开其一时另一个自动折叠）
  const [activeFilmTab, setActiveFilmTab] = useState<'movie' | 'series'>('movie'); // 片单切换器：电影 / 剧集
  const playlistAnchorRef = React.useRef<HTMLDivElement | null>(null); // 「查看歌单」滚动定位锚点（歌单模块头部）

  // 正在播放的歌曲对象（跨歌单页查找）：驱动红名/音量条/歌词窗等 UI
  const playingSong = currentSong && !songPaused ? findSongByKey(currentSong) : null;
  // 正在播放的歌单 key（songKey 格式为 `${playlist.key}:${title}`，取前缀即可）；暂停时为 null
  const playingPlaylistKey = currentSong && playingSong ? currentSong.split(':')[0] : null;

  // 「查看歌单」跳转请求（导航栏黑胶模块发起）：落到影视音乐页并展开正在播放（或最后播放）歌曲所在歌单，滚动定位到模块
  React.useEffect(() => {
    if (!viewRequest) return;
    const filmIdx = HOBBIES_DATA.findIndex((h) => h.id === 'film-music');
    if (filmIdx >= 0) setActiveIndex(filmIdx);
    setActivePlaylistTab((viewRequest.playlistKey ?? 'solo') as PlaylistTabKey);
    setPlaylistOpen(true);
    setFilmPicksOpen(false); // 手风琴：歌单展开时片单收起
    if (viewRequest.songKey) setFocusedSong(viewRequest.songKey);
    const t = setTimeout(
      () => playlistAnchorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
      200 // 等标签页切换渲染完成后再定位
    );
    return () => clearTimeout(t);
  }, [viewRequest, setFocusedSong]);

  const novelShelves: Record<string, { title: string; author: string; genre: string; thought: string }[]> = {
    '科幻宇宙': [
      { title: '《三体》', author: '刘慈欣', genre: '科幻宇宙', thought: '宏大宇宙社会学与极致人性博弈的终极叙事范本。' },
      { title: '《十日终焉》', author: '杀虫队队员', genre: '悬疑无限流', thought: '终焉之地的规则博弈与人性试炼，环环相扣的悬念与群像塑造。' },
      { title: '《绍宋》', author: '榴弹怕水', genre: '架空历史', thought: '靖康之变后的王朝再造，考据严谨的历史推演与家国叙事。' },
    ],
    '架空与群像': [
      { title: '《青云之上》', author: '莲花郎面', genre: '仙侠群像', thought: '仙侠世界里的众生道途，群像弧光与古典意蕴交相辉映。' },
      { title: '《观鹤笔记》', author: '她与灯', genre: '架空历史', thought: '以现代史学视角凝望明代文人风骨，考据细腻、悲悯而克制的家国叙事。' },
    ],
    '经典哲思': [
      { title: '《穿进赛博游戏后干掉BOSS成功上位》', author: '桉柏', genre: '赛博无限流', thought: '赛博都市里的逆袭上位之路，热血群像与情感羁绊交织的沉浸式爽感叙事。' },
    ],
  };

  const hobby = HOBBIES_DATA[activeIndex];
  const activeTab = HOBBY_TABS[activeIndex];
  // 书单平铺分页：每页 3 本，prev/next 翻页
  const NOVEL_PAGE_SIZE = 3;
  const allNovelBooks = Object.values(novelShelves).flat();
  const novelPageCount = Math.ceil(allNovelBooks.length / NOVEL_PAGE_SIZE);
  // 书单增删后页数自动收缩，页码越界时钳制到最后一页
  const currentBookPage = Math.min(bookPage, novelPageCount - 1);
  // 交错排序：偶数索引（0, 2）左图右字；奇数索引（1, 3）左字右图
  const isImageLeft = activeIndex % 2 === 0;

  return (
    <div className="space-y-16 sm:space-y-20">
      {/* Header */}
      <section className="space-y-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-neutral-500 mb-2 inline-block">
          Life & Inspirations · 我的爱好与生活方式
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 tracking-tight">
          灵感来自于生活与爱好的滋养
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 max-w-2xl leading-relaxed font-normal">
          真实的生活感官是工作最好的调味剂。从小说的世界观推演、电竞的战术心流、到厨房里慢熬一碗浓汤、背上行囊漫步老城，每一种热爱都在塑造着我的敏锐触觉与共情力。
        </p>
      </section>

      {/* ============================================================== */}
      {/* 双层一体化卡榫结构：顶层导轨 + 下方展台                          */}
      {/* ============================================================== */}
      <div className="w-full">
        {/* 1. 顶层平铺选择器导轨（Roof Deck） */}
        <div className="w-full bg-[#EFEFF2] border border-b-0 border-neutral-200/90 rounded-t-3xl overflow-hidden relative z-10 shadow-xs">
          <div className="grid grid-cols-4 sm:grid-cols-7 w-full divide-x divide-neutral-200/70">
            {HOBBY_TABS.map((tab, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveIndex(idx);
                    setMsgActive(false); // 切换爱好时退出留言板
                  }}
                  className={`h-11 sm:h-12 w-full flex items-center justify-center gap-2 text-[13px] transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-white text-neutral-900 font-bold border-t-2 border-t-neutral-900 z-20 shadow-xs'
                      : 'bg-[#F5F5F7] hover:bg-[#EAEAEF] text-neutral-500 hover:text-neutral-900 font-medium z-10'
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. 下方 50/50 交错展台主卡片（Showcase Stage） */}
        <section className="w-full bg-white border border-neutral-200/90 rounded-b-3xl p-6 sm:p-10 lg:p-12 shadow-xs min-h-[500px]">
          <div
            key={hobby.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center animate-stage-fade"
          >
            {/* 文字与互动侧（50%） */}
            <div className={`w-full lg:col-span-6 space-y-4 max-w-[580px] order-1 ${isImageLeft ? 'lg:order-2' : 'lg:order-1'}`}>
              {/* 1. 顶部分类元数据（Kicker） */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono text-neutral-400 uppercase tracking-wider">
                <span className="text-neutral-900 font-bold">{String(activeIndex + 1).padStart(2, '0')}</span>
                <span aria-hidden="true">·</span>
                <span>{hobby.englishTitle}</span>
                <span aria-hidden="true">·</span>
                <span>{activeTab.label}</span>
              </div>

              {/* 2. 主副标题组合 */}
              <div className="space-y-1.5">
                <h2 className="text-4xl font-extrabold text-neutral-900 tracking-tight leading-tight">
                  {hobby.title}
                </h2>
                <p className="text-[15px] text-neutral-500 font-normal leading-relaxed">
                  “{hobby.tagline}”
                </p>
              </div>

              {/* 3. 核心思考正文 */}
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                {hobby.description}
              </p>

              {/* 4. 双列留白焦点指标卡（影视音乐页不展示：左栏已有歌单与片单模块） */}
              {hobby.id !== 'film-music' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {[hobby.specs[0], hobby.specs[3]].map((spec, i) => (
                    <div key={i} className="bg-neutral-50/90 border border-neutral-100 rounded-2xl p-3.5 space-y-0.5">
                      <div className="text-[11px] font-mono text-neutral-400 uppercase">{spec.label}</div>
                      <div className="text-xs font-bold text-neutral-800 leading-snug whitespace-pre-line">{spec.value}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* 下方专属互动模块（影视音乐为「珍藏歌单 + 推荐片单」合并的单卡片手风琴模块，两分区互斥展开） */}
              {/* 外层不设任何间距，全部下沉为子元素自身 padding（影视音乐）：子模块通栏铺满卡片、border-t 分隔线贯通到边缘；其余爱好仍用子元素 margin 保持内缩浮岛式布局 */}
              <div className={`mt-7 bg-neutral-50 border border-neutral-200/80 rounded-xl overflow-hidden transition-all duration-300 space-y-1.5 ${hobby.id === 'film-music' ? '[&>*]:px-4 [&>*:first-child]:pt-3 [&>*:last-child]:pb-3' : '[&>*]:mx-4 [&>*:first-child]:mt-4 [&>*:last-child]:mb-4'}`}>
                {/* 小说：精选书单与反哺 */}
                {hobby.id === 'novels-reading' && (
                  <>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                        <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                        <span>精选书单与反哺</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-mono text-neutral-400">{currentBookPage + 1} / {novelPageCount}</span>
                        <button
                          onClick={() => setBookPage((p) => Math.max(0, p - 1))}
                          disabled={currentBookPage === 0}
                          aria-label="上一页"
                          className="w-7 h-7 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setBookPage((p) => Math.min(novelPageCount - 1, p + 1))}
                          disabled={currentBookPage === novelPageCount - 1}
                          aria-label="下一页"
                          className="w-7 h-7 rounded-lg bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:border-neutral-300 flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {allNovelBooks
                        .slice(currentBookPage * NOVEL_PAGE_SIZE, currentBookPage * NOVEL_PAGE_SIZE + NOVEL_PAGE_SIZE)
                        .map((book, i) => (
                        <div key={i} className="bg-white border border-neutral-200/60 rounded-xl p-3 space-y-0.5">
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="text-xs font-bold text-neutral-900">
                              {book.title}
                              <span className="text-[11px] text-neutral-300 font-normal mx-1.5" aria-hidden="true">·</span>
                              <span className="text-[11px] text-neutral-600 font-normal">{book.author}</span>
                            </span>
                            <span className="text-[11px] text-neutral-600 shrink-0">{book.genre}</span>
                          </div>
                          <p className="text-xs text-neutral-600 leading-relaxed">{book.thought}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* 电竞：竞技心流与体验反哺 */}
                {hobby.id === 'esports-gaming' && (
                  <>
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                        <Gamepad2 className="w-3.5 h-3.5 text-neutral-900" />
                        <span>竞技心流与体验反哺</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {(['flow', 'bp'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setActiveEsportsTab(tab)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                              activeEsportsTab === tab
                                ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                                : 'bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900'
                            }`}
                          >
                            {tab === 'flow' ? '逆风心流' : '战术BP'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border border-neutral-200/60 rounded-xl p-3 text-xs text-neutral-600 leading-relaxed">
                      {activeEsportsTab === 'flow' && (
                        <p>电竞在高压劣势局面下的逆风翻盘，依赖极度冷静的心态与清晰的优先级判断。在业务突发考验时，这种抗压定力让我始终能稳步破局。</p>
                      )}
                      {activeEsportsTab === 'bp' && (
                        <p>B/P 阵容博弈本质是有限资源下的博弈论。如何扬长避短、克制敌方强势点，与关键时刻作运营策略取舍的逻辑完全相通。</p>
                      )}
                    </div>
                  </>
                )}

                {/* 手记列表：音乐（带歌单切换器）/ 影视 / 时政历史 / 美食 / 时空行旅 */}
                {NOTE_HEADERS[hobby.id] && (() => {
                  const note = NOTE_HEADERS[hobby.id];
                  const isPlaylist = hobby.id === 'film-music';
                  const currentPlaylist =
                    PLAYLIST_TABS.find((p) => p.key === activePlaylistTab) ?? PLAYLIST_TABS[0];
                  return (
                    <>
                      {/* 模块头部：珍藏歌单标题栏可点击折叠/展开（仅隐藏 UI，不打断播放）；折叠且播放中时头部右侧保留音量条提示，未播放时右侧显示 SOUND PICKS 英文说明（与片单折叠态 SCREEN PICKS 呼应），不显示歌名/歌手/歌词。mb-0! 覆盖 space-y 的 6px 下边距；pb-3 常驻 12px 下内边距——展开时下边缘画通栏分隔线（与推荐片单顶部分隔线同色）再贴首行歌曲，收起时不画线、为片单分隔线留 12px 呼吸感 */}
                      <div ref={playlistAnchorRef} className={`flex items-center justify-between gap-3 flex-wrap ${isPlaylist ? `mb-0! pb-3 ${playlistOpen ? 'border-b border-neutral-200/40' : ''}` : ''}`}>
                        {isPlaylist ? (
                          <button
                            onClick={() => {
                              const next = !playlistOpen;
                              setPlaylistOpen(next);
                              if (next) {
                                setFilmPicksOpen(false); // 手风琴：展开歌单时自动收起片单
                                if (playingPlaylistKey) {
                                  const hit = PLAYLIST_TABS.find((p) => p.key === playingPlaylistKey)?.key; // 定位到播放歌曲所在歌单页
                                  if (hit) setActivePlaylistTab(hit);
                                }
                              }
                            }}
                            aria-expanded={playlistOpen}
                            className="flex items-center gap-1.5 text-[13px] font-bold text-neutral-800 cursor-pointer rounded-lg px-2 py-1 -ml-2 -my-1"
                          >
                            <ChevronDown
                              className={`w-3.5 h-3.5 text-neutral-400 hover:text-neutral-500 transition-all duration-200 ${playlistOpen ? '' : '-rotate-90'}`}
                            />
                            {/* 点击判定锁定在折叠符号：文字区阻断冒泡并还原光标，点击文字不再触发折叠（按钮回车键仍可操作） */}
                            <span
                              className="text-xs font-bold cursor-default"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {note.title}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-800">
                            <note.icon className={`w-3.5 h-3.5 ${note.iconClass}`} />
                            <span>{note.title}</span>
                          </div>
                        )}
                        {/* 心水之作切换器：动漫 / 游戏 双页，样式与推荐片单 tabs 一致 */}
                        {hobby.id === 'anime-acg' && (
                          <div className="flex items-center gap-1">
                            {ANIME_PICKS.map((p) => (
                              <button
                                key={p.key}
                                onClick={() => setAnimePicksTab(p.key)}
                                className={`px-2 py-[2px] rounded-lg text-[11px] font-mono border border-transparent transition-all cursor-pointer ${
                                  animePicksTab === p.key
                                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white hover:ring-1 hover:ring-black/5 hover:shadow-xs'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {/* 时政与历史：关注 UP 主切换器，按细分领域分页，样式与推荐片单 tabs 一致 */}
                        {hobby.id === 'affairs-history' && (
                          <div className="flex items-center gap-1">
                            {POLITY_CHANNELS.map((p) => (
                              <button
                                key={p.key}
                                onClick={() => setPolityTab(p.key)}
                                className={`px-2 py-[2px] rounded-lg text-[11px] font-mono border border-transparent transition-all cursor-pointer ${
                                  polityTab === p.key
                                    ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                                    : 'text-neutral-500 hover:text-neutral-900 hover:bg-white hover:ring-1 hover:ring-black/5 hover:shadow-xs'
                                }`}
                              >
                                {p.label}
                              </button>
                            ))}
                          </div>
                        )}
                        {isPlaylist && !playlistOpen && playingSong && (
                          /* 折叠且播放中：头部右侧保留音量条提示（暂停时 playingSong 为 null 自动隐藏） */
                          <span className="flex items-end justify-center gap-[2.5px] h-2.5 self-end mr-1">
                            <span className="w-[2px] h-full rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '0s' }} />
                            <span className="w-[2px] h-full rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '-0.3s' }} />
                            <span className="w-[2px] h-full rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '-0.6s' }} />
                          </span>
                        )}
                        {isPlaylist && !playlistOpen && !playingSong && (
                          /* 折叠且未播放：头部右侧显示英文说明，样式与片单折叠态的 SCREEN PICKS 一致 */
                          <span className="text-[11px] font-mono text-neutral-400 tracking-wide">SOUND PICKS</span>
                        )}
                        {isPlaylist && playlistOpen && (
                          <div className="flex items-center gap-1">
                            {PLAYLIST_TABS.map((p) => {
                              // 后台播放中且未停留在该歌单页的 tab：文字换成音量条，hover 或选中时恢复文字
                              const barsHere = playingPlaylistKey === p.key && activePlaylistTab !== p.key;
                              return (
                                <button
                                  key={p.key}
                                  onClick={() => setActivePlaylistTab(p.key)} // 仅切换歌单页，不打断当前播放与选取态
                                  className={`group/tab relative px-2 py-[2px] rounded-lg text-[11px] font-mono border border-transparent transition-all cursor-pointer ${
                                    activePlaylistTab === p.key
                                      ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-white hover:ring-1 hover:ring-black/5 hover:shadow-xs'
                                  }`}
                                >
                                  <span className={`transition-opacity ${barsHere ? 'opacity-0 group-hover/tab:opacity-100' : ''}`}>{p.label}</span>
                                  {barsHere && (
                                    <span className="absolute inset-0 flex items-end justify-center gap-[2.5px] pb-[2px] transition-opacity group-hover/tab:opacity-0">
                                      <span className="w-[2px] h-3 rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '0s' }} />
                                      <span className="w-[2px] h-3 rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '-0.3s' }} />
                                      <span className="w-[2px] h-3 rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '-0.6s' }} />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {/* 音乐歌单：可折叠容器（grid-rows 1fr/0fr 高度过渡，随内容实际高度平滑收缩无跳跃感；收起仅隐藏 UI，头部 iframe 仍挂载，播放不中断）。已移除顶部分隔线，与头部靠分隔线衔接；px-0! 抵消容器的 [&>*]:px-4，歌曲行通栏铺满卡片，行内边距 px-6.5 补偿保持文字位置不变；mb-0! 抵消 space-y 的 6px 下边距，末行歌曲直接贴合片单分隔线 */}
                      <div
                        className={`grid transition-all duration-300 ease-in-out ${
                          isPlaylist
                            ? `px-0! mb-0! ${playlistOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`
                            : ''
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden space-y-0.5">
                        {isPlaylist
                          ? currentPlaylist.songs.map((s, i) => {
                              const songKey = `${currentPlaylist.key}:${s.title}`;
                              const selected = currentSong === songKey; // 播放中的歌（红名/音量条/暂停键）
                              const playing = selected && !songPaused;
                              const focused = focusedSong === songKey; // 背景被选取态（白底+边框+阴影），与播放独立
                              return (
                                <button
                                  key={songKey}
                                  onClick={() => setFocusedSong(songKey)} // 点击模块：仅移动背景选取态，不改变播放
                                  className={`group/song relative w-full flex items-center gap-3.5 px-6.5 py-1.5 rounded-xl border border-transparent text-left transition-all cursor-default ${
                                    // 悬浮/选中效果与头部折叠按钮一致：白底 + 1px black/5 描边（用预留边框而非 ring，通栏下 ring 会被 overflow-hidden 裁切）+ 6px/0.06 柔光
                                    focused ? 'bg-white border-black/5 shadow-[0_0_6px_rgba(0,0,0,0.06)]' : 'hover:bg-white hover:border-black/5 hover:shadow-[0_0_6px_rgba(0,0,0,0.06)]'
                                  }`}
                                >
                                  {/* 左侧槽位：未选中(序号→hover播放键) / 播放中(音量条→hover暂停键) / 暂停(红色播放键常显) */}
                                  <span className="relative w-4 h-4 shrink-0 flex items-center justify-center">
                                    <span className={`text-xs transition-opacity ${selected ? 'opacity-0' : 'text-[#7E8491] group-hover/song:opacity-0'}`}>
                                      {String(i + 1).padStart(2, '0')}
                                    </span>
                                    {!selected && (
                                      <Play
                                        className="absolute w-4 h-4 text-[#7E8491] opacity-0 group-hover/song:opacity-100 transition-opacity cursor-pointer hover:text-[#545A66]"
                                        fill="currentColor"
                                        onClick={() => toggleSong(songKey)}
                                      />
                                    )}
                                    {playing && (
                                      <>
                                        <span className="absolute flex items-end justify-center gap-[3px] h-3.5 transition-opacity group-hover/song:opacity-0">
                                          <span className="w-[2px] h-full rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '0s' }} />
                                          <span className="w-[2px] h-full rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '-0.3s' }} />
                                          <span className="w-[2px] h-full rounded-full bg-[#F43F5E] animate-eq" style={{ animationDelay: '-0.6s' }} />
                                        </span>
                                        <svg
                                          viewBox="0 0 24 24"
                                          className="absolute w-[18px] h-[18px] text-[#7E8491] opacity-0 group-hover/song:opacity-100 transition-opacity cursor-pointer hover:text-[#545A66]"
                                          fill="currentColor"
                                          aria-hidden="true"
                                          onClick={() => toggleSong(songKey)}
                                        >
                                          <rect x="6.25" y="3" width="4" height="18" rx="1" />
                                          <rect x="13.75" y="3" width="4" height="18" rx="1" />
                                        </svg>
                                      </>
                                    )}
                                    {selected && songPaused && (
                                      <Play
                                        className="absolute w-4 h-4 text-[#7E8491] transition-opacity cursor-pointer hover:text-[#545A66]"
                                        fill="currentColor"
                                        onClick={() => toggleSong(songKey)}
                                      />
                                    )}
                                  </span>
                                  {/* 歌名 + 歌手双行；播放中平滑收窄为窄窗 + 超宽跑马灯，未播放按内容完整展示；选中且配置了歌词时，右侧空隙展示滚动歌词窗 */}
                                  <div className="flex-1 min-w-0 flex items-center gap-3 ml-1">
                                    <div className="shrink-0 space-y-0.5">
                                      <OverflowMarquee
                                        text={s.title}
                                        active={playing}
                                        className={`text-sm transition-colors ${selected ? 'text-[#F43F5E]' : 'text-neutral-800'}`}
                                      />
                                      <OverflowMarquee
                                        text={s.artist}
                                        active={playing}
                                        className={`text-xs transition-colors ${selected ? 'text-[#F43F5E]' : 'text-[#7E8491]'}`}
                                      />
                                    </div>
                                    {selected && s.lrc && (
                                      <div className={`flex-1 min-w-0 flex justify-center transition-opacity duration-300 ${selected ? 'opacity-100' : 'opacity-0'}`}>
                                        <LyricScroller lrc={s.lrc} active={playing} startAt={playStartedAt} offsetMs={s.lrcOffsetMs} holdMs={lyricHoldMs} />
                                      </div>
                                    )}
                                  </div>
                                  {/* 右侧歌曲时长 */}
                                  {s.duration && (
                                    <span className="shrink-0 text-[11.5px] tracking-wide text-[#A5AAB8]">
                                      {s.duration}
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          : (hobby.id === 'affairs-history'
                              ? (POLITY_CHANNELS.find((p) => p.key === polityTab) ?? POLITY_CHANNELS[0]).items
                              : hobby.id === 'anime-acg'
                                ? (ANIME_PICKS.find((p) => p.key === animePicksTab) ?? ANIME_PICKS[0]).items
                                : hobby.details
                            ).map((d, i) => (
                              <div key={i} className="bg-white border border-neutral-200/60 rounded-xl p-2.5 flex items-start gap-2 text-xs text-neutral-600 leading-relaxed">
                                <span className="text-neutral-400 shrink-0">–</span>
                                <span>{d}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* 推荐片单：与珍藏歌单同卡片的手风琴分区（互斥展开，默认折叠）；分隔线内上下各 12px（pt-3/pb-3），mb-0! 抵消 space-y 的 6px 下边距，与下方片单区域零间距衔接，展开/折叠态一致 */}
                {hobby.id === 'film-music' && (
                  <>
                    <div className="flex items-center justify-between gap-3 flex-wrap border-t border-neutral-200/40 pt-3 pb-3 mt-0! mb-0!">
                      <button
                        onClick={() => {
                          const next = !filmPicksOpen;
                          setFilmPicksOpen(next);
                          if (next) setPlaylistOpen(false); // 手风琴：展开片单时自动收起歌单
                        }}
                        aria-expanded={filmPicksOpen}
                        className="flex items-center gap-1.5 text-[13px] font-bold text-neutral-800 cursor-pointer rounded-lg px-2 py-1 -ml-2 -my-1"
                      >
                        <ChevronDown
                          className={`w-3.5 h-3.5 text-neutral-400 hover:text-neutral-500 transition-all duration-200 ${filmPicksOpen ? '' : '-rotate-90'}`}
                        />
                        {/* 点击判定锁定在折叠符号：文字区阻断冒泡并还原光标，点击文字不再触发折叠（按钮回车键仍可操作） */}
                        <span
                          className="text-xs font-bold cursor-default"
                          onClick={(e) => e.stopPropagation()}
                        >
                          推荐片单
                        </span>
                      </button>
                      {filmPicksOpen ? (
                        <div className="flex items-center gap-1">
                          {FILM_TABS.map((t) => (
                            <button
                              key={t.key}
                              onClick={() => setActiveFilmTab(t.key)}
                              className={`group/tab relative px-2 py-[2px] rounded-lg text-[11px] font-mono border border-transparent transition-all cursor-pointer ${
                                activeFilmTab === t.key
                                  ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-white hover:ring-1 hover:ring-black/5 hover:shadow-xs'
                              }`}
                            >
                              <span className="transition-opacity">{t.label}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono text-neutral-400 tracking-wide">SCREEN PICKS</span>
                      )}
                    </div>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        // 展开态 pb-3（从容器 last-child 规则接管）；折叠态 pb-0! 真正零占位，仅头部 div 撑起卡底，transition-all 同步过渡 padding
                        filmPicksOpen ? 'grid-rows-[1fr] opacity-100 pb-3' : 'grid-rows-[0fr] opacity-0 pb-0!'
                      }`}
                    >
                      <div className="min-h-0 overflow-hidden space-y-2">
                        {(activeFilmTab === 'movie' ? FILM_MOVIES : FILM_SERIES).map((f) => (
                          <div key={f.title} className="bg-white border border-neutral-200/60 rounded-xl p-3 space-y-0.5">
                            <div className="flex items-baseline justify-between gap-3">
                              <span className="text-xs font-bold text-neutral-900">{f.title}</span>
                              <span className="text-[11px] text-neutral-600 shrink-0">{f.meta}</span>
                            </div>
                            <p className="text-xs text-neutral-600 leading-relaxed">{f.note}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 大图画报侧（50%，纵向撑满） */}
            <div className={`w-full lg:col-span-6 self-stretch flex flex-col order-2 ${isImageLeft ? 'lg:order-1' : 'lg:order-2'}`}>
              <div
                data-hobby-card={hobby.id}
                className={`relative w-full h-[360px] sm:h-[480px] lg:h-full min-h-[460px] lg:min-h-[580px] ${hobby.id === 'film-music' || hobby.id === 'esports-gaming' ? 'lg:max-h-[580px]' : ''} rounded-2xl border border-neutral-200 overflow-hidden shadow-xs bg-neutral-900 group ${msgActive ? '' : 'cursor-pointer'}`}
                onClick={() => setMsgActive(true)}
              >
                <img
                  src={hobby.image}
                  alt={hobby.title}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-transform duration-500 ease-out ${msgActive ? '' : 'group-hover:scale-102'}`}
                />
                {/* 左上角英文角标 */}
                <div className="absolute top-4 left-4 bg-neutral-900/80 backdrop-blur-md rounded-lg px-3 py-1.5 text-xs font-mono font-medium tracking-wide uppercase text-white">
                  {(hobby.badgeTitle ?? hobby.englishTitle).toUpperCase()}
                </div>
                {/* 留言板遮罩：hover 预览 / 点击激活 */}
                <MessageBoardOverlay
                  hobbyId={hobby.id}
                  active={msgActive}
                  onClose={() => setMsgActive(false)}
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
