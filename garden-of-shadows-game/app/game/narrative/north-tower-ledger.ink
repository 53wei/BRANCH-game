=== north_opening ===
北楼里没有雨声。算盘珠却在无人拨动时，一颗接一颗落下。 # speaker:narrator # line:north.opening.001
我整夜都在二层账房。门没开，窗也没开，更没有去过东院。 # speaker:accountant # portrait:composed # line:north.opening.002 # voice:north.accountant.001
可你的账房窗里，东院的假山还没有坍塌。 # speaker:zhaoying # portrait:guarded # line:north.opening.003 # voice:north.zhaoying.001
账目只记发生过的事。至于窗外是什么时候，不归我管。 # speaker:accountant # portrait:composed # line:north.opening.004 # voice:north.accountant.002
那我就从你不肯记的时间开始。 # speaker:zhaoying # portrait:calm # line:north.opening.005 # voice:north.zhaoying.002 # memory:unlock:accountant # objective:start:north-enter:reach-stairs
-> END

=== north_scratches ===
三道硬痕都从窗外向里收尾。有人翻进来，不是翻出去。 # speaker:zhaoying # portrait:guarded # line:north.scratches.001 # voice:north.zhaoying.003
木头受潮也会开裂。你不能拿一扇旧窗给我定罪。 # speaker:accountant # portrait:cornered # line:north.scratches.002 # voice:north.accountant.003
我没有定罪。我只记下：你的“整夜紧闭”和夫人的窗框，不能同时成立。 # speaker:zhaoying # portrait:calm # line:north.scratches.003 # voice:north.zhaoying.004
-> END

=== north_passage ===
假山移开以后，墙下露出一条直通东院的暗道。潮泥上还有算盘珠滚过的凹痕。 # speaker:narrator # line:north.passage.001
你说自己没去过东院。 # speaker:zhaoying # portrait:guarded # line:north.passage.002 # voice:north.zhaoying.005
知道一条路，不等于走过一条路。园丁也知道它，他把出口埋了。 # speaker:accountant # portrait:cornered # line:north.passage.003 # voice:north.accountant.004
可在园丁的记忆里，这里不是暗道，是一条回到原处的泥径。你们至少有一个人在删路。 # speaker:zhaoying # portrait:guarded # line:north.passage.004 # voice:north.zhaoying.006
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
