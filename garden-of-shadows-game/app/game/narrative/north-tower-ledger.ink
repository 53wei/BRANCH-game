=== north_opening ===
北楼里没有雨声。算盘珠却在无人拨动时，一颗接一颗落下。 # speaker:narrator # line:north.opening.001
我整夜都在二层账房。门没开，窗也没开，更没有去过东院。 # speaker:accountant # portrait:composed # line:north.opening.002 # voice:north.accountant.001
可你的账房窗里，东院的假山还没有坍塌。 # speaker:zhaoying # portrait:guarded # line:north.opening.003 # voice:north.zhaoying.001
账目只记发生过的事。至于窗外是什么时候，不归我管。 # speaker:accountant # portrait:composed # line:north.opening.004 # voice:north.accountant.002
* [先问他的账：昨夜最后一笔记在什么时辰？]
    子时三刻。灯油、纸张、修园石料，每一笔都在这里。 # speaker:accountant # portrait:composed # line:north.opening.004a # voice:north.accountant.013 # flag:set:north.inquiry.ledger
    太齐了。像是有人事后把空白填满。 # speaker:zhaoying # portrait:guarded # line:north.opening.004b # voice:north.zhaoying.012
    -> north_opening_continue
* [先问那扇窗：为什么窗里还是案发前？]
    窗只是窗。看见什么，是看窗的人自己的事。 # speaker:accountant # portrait:cornered # line:north.opening.004c # voice:north.accountant.005 # flag:set:north.inquiry.window
    那就让路。我亲自去看。 # speaker:zhaoying # portrait:calm # line:north.opening.004d # voice:north.zhaoying.013
    -> north_opening_continue
= north_opening_continue
那我就从你不肯记的时间开始。 # speaker:zhaoying # portrait:calm # line:north.opening.005 # voice:north.zhaoying.002 # memory:unlock:accountant # objective:start:north-enter:reach-stairs
-> END

=== north_window ===
账房左侧只有一扇窗不肯映出此刻。框内假山完整，框外碎石已在雨里躺了七年。 # speaker:narrator # line:north.window.001
我说过，窗没有开。 # speaker:accountant # portrait:composed # line:north.window.002 # voice:north.accountant.006
* [先摸窗框上的三道硬痕。]
    划痕从外向内收尾。有人翻进来时，用鞋钉刮过这里。 # speaker:zhaoying # portrait:guarded # line:north.window.003a # voice:north.zhaoying.014 # flag:set:north.window.focus.scratches
    木头受潮，什么痕都留得下。 # speaker:accountant # portrait:cornered # line:north.window.004a # voice:north.accountant.007
    -> north_window_end
* [先看窗内没有落下的雨。]
    雨悬在假山上方。窗里不是景，是还没发生完的昨夜。 # speaker:zhaoying # portrait:alarmed # line:north.window.003b # voice:north.zhaoying.015 # flag:set:north.window.focus.time
    你若跨过去，就别怪账目不认你。 # speaker:accountant # portrait:cornered # line:north.window.004b # voice:north.accountant.008
    -> north_window_end
= north_window_end
我不需要账目认我。下一次触碰，我会走进窗里的时间。 # speaker:zhaoying # portrait:calm # line:north.window.005 # voice:north.zhaoying.016
-> END

=== north_past ===
涟漪越过眼睛，雨声忽然停在半空。脚下的泥是干的，完整的假山挡住了七年后的路。 # speaker:narrator # line:north.past.001
* [蹲下检查假山旁的泥。]
    泥里有一串圆形浅印，大小和算盘珠相同。它们一直滚向墙根。 # speaker:zhaoying # portrait:guarded # line:north.past.002a # voice:north.zhaoying.017 # flag:set:north.past.clue.beads
    北楼的珠子多，掉到哪里都不奇怪。 # speaker:accountant # portrait:cornered # line:north.past.003a # voice:north.accountant.009
    -> north_past_end
* [伸手接住一滴悬停的雨。]
    雨滴穿过手背，时间却没有继续。这里保存的不是过去，是你愿意承认的过去。 # speaker:zhaoying # portrait:alarmed # line:north.past.002b # voice:north.zhaoying.018 # flag:set:north.past.clue.rain
    你来查案，不是来审问时间。 # speaker:accountant # portrait:cornered # line:north.past.003b # voice:north.accountant.010
    -> north_past_end
= north_past_end
现在搬不动的石头，在倒下以前或许可以。 # speaker:zhaoying # portrait:calm # line:north.past.004 # voice:north.zhaoying.019
-> END

=== north_rockery ===
假山底部没有园丁常用的撬痕，只有一块被账页包住的木楔。 # speaker:narrator # line:north.rockery.001
* [按账房记忆里的方向推动假山。]
    既然这条路只存在于你的记忆，就让你的记忆亲自把它打开。 # speaker:zhaoying # portrait:calm # line:north.rockery.002a # voice:north.zhaoying.020 # flag:set:north.rockery.choice.direct
    -> north_rockery_end
* [先抽出木楔，查看包裹它的账页。]
    账页少了一笔石料款，日期正是案发当夜。你不是偶然知道这块石头能动。 # speaker:zhaoying # portrait:guarded # line:north.rockery.002b # voice:north.zhaoying.021 # flag:set:north.rockery.choice.ledger
    每座园子都有修缮的账。 # speaker:accountant # portrait:cornered # line:north.rockery.003b # voice:north.accountant.011
    -> north_rockery_end
= north_rockery_end
石缝发出一声闷响。假山向侧面移开，七年后的现在也随之改路。 # speaker:narrator # line:north.rockery.004
-> END

=== north_scratches ===
三道硬痕都从窗外向里收尾。有人翻进来，不是翻出去。 # speaker:zhaoying # portrait:guarded # line:north.scratches.001 # voice:north.zhaoying.003
木头受潮也会开裂。你不能拿一扇旧窗给我定罪。 # speaker:accountant # portrait:cornered # line:north.scratches.002 # voice:north.accountant.003
* [谨慎记录：这里只能证明有人翻窗。]
    我不写你的名字，只写方向：从外向内。 # speaker:zhaoying # portrait:calm # line:north.scratches.003a # voice:north.zhaoying.004 # flag:set:north.scratches.judgment.cautious
    -> north_scratches_end
* [直接追问：你为什么从东院翻回账房？]
    你的账把门封死了，窗却替你留下了入口。 # speaker:zhaoying # portrait:guarded # line:north.scratches.003b # voice:north.zhaoying.022 # flag:set:north.scratches.judgment.press
    证明路存在，不等于证明走路的人是我。 # speaker:accountant # portrait:cornered # line:north.scratches.004b # voice:north.accountant.012
    -> north_scratches_end
= north_scratches_end
无论是谁翻过，这句“整夜紧闭”已经不能成立。 # speaker:zhaoying # portrait:calm # line:north.scratches.005 # voice:north.zhaoying.023
-> END

=== north_passage ===
假山移开以后，墙下露出一条直通东院的暗道。潮泥上还有算盘珠滚过的凹痕。 # speaker:narrator # line:north.passage.001
你说自己没去过东院。 # speaker:zhaoying # portrait:guarded # line:north.passage.002 # voice:north.zhaoying.005
知道一条路，不等于走过一条路。园丁也知道它，他把出口埋了。 # speaker:accountant # portrait:cornered # line:north.passage.003 # voice:north.accountant.004
* [追问暗道：只有熟悉它的人才会准备木楔。]
    你提前记下修缮款，又把入口藏在可移动的假山后。 # speaker:zhaoying # portrait:guarded # line:north.passage.004a # voice:north.zhaoying.024 # flag:set:north.passage.judgment.route
    -> north_passage_end
* [追问算盘珠：珠痕为什么一直滚进暗道？]
    泥里每一粒凹痕都来自北楼。你的账本留在桌上，算盘却替你走完了路。 # speaker:zhaoying # portrait:guarded # line:north.passage.004b # voice:north.zhaoying.025 # flag:set:north.passage.judgment.beads
    -> north_passage_end
= north_passage_end
可在园丁的记忆里，这里不是暗道，是一条回到原处的泥径。你们至少有一个人在删路。 # speaker:zhaoying # portrait:calm # line:north.passage.005 # voice:north.zhaoying.006
-> END

=== north_trust ===
窗框、假山和暗道都是真的；它们为什么出现，却仍有三种说法。 # speaker:narrator # line:north.trust.001
现在选择的不是“谁无罪”，而是哪份记忆先成为可以行走的北楼。 # speaker:zhaoying # portrait:calm # line:north.trust.002 # voice:north.zhaoying.007
* [采用账房的版本，保留秘密通道。]
    暗道留下。它的尽头摊着一本被改过总数的私账。 # speaker:zhaoying # portrait:guarded # line:north.trust.003a # voice:north.zhaoying.008 # trust:set:north-route-owner:accountant:north.trust.accountant
    -> north_trust_end
* [采用园丁的版本，让暗道重新坍塌。]
    泥径封死之前，一把带血的园艺剪从石缝里滑了出来。 # speaker:zhaoying # portrait:guarded # line:north.trust.003b # voice:north.zhaoying.009 # trust:set:north-route-owner:gardener:north.trust.gardener
    -> north_trust_end
* [采用夫人的版本，追查她在二层留下的影子。]
    楼上的灯重新亮起。账页之间夹着一封不该写给账房的私信。 # speaker:zhaoying # portrait:alarmed # line:north.trust.003c # voice:north.zhaoying.010 # trust:set:north-route-owner:wife:north.trust.wife
    -> north_trust_end
= north_trust_end
北楼开始按你采用的说法重新排列。 # speaker:narrator # line:north.trust.004
-> END

=== north_completion ===
一条路被保留，另外两条退进墙里。北楼的账平了，但东院多出了一笔没有姓名的支出。 # speaker:narrator # line:north.complete.001
钱买了什么？ # speaker:zhaoying # portrait:guarded # line:north.complete.002 # voice:north.zhaoying.011
不是东西。是让一个人从四份证词里消失。 # speaker:steward # portrait:knowing # line:north.complete.003 # voice:north.steward.001
前厅还有第四个人。他画下了一扇谁都不肯承认的门。 # speaker:steward # portrait:threatening # line:north.complete.004 # voice:north.steward.002 # flag:set:north.chapter.complete
-> END
