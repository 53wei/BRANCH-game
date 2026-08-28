=== front_opening ===
前厅里的雨被拖得很慢。每一滴都像要等谁把最后一笔画完。 # speaker:narrator # line:front.opening.001
我只在前厅等候。画的是中庭，没去过东院。 # speaker:painter # portrait:distant # line:front.opening.002 # voice:front.painter.001
可你身后的走廊只有一半颜色，另一半成了白墙。 # speaker:zhaoying # portrait:guarded # line:front.opening.003 # voice:front.zhaoying.001
记忆不是地图。没看见的地方，自然不必画。 # speaker:painter # portrait:distant # line:front.opening.004 # voice:front.painter.002
* [追问画作：既然没去东院，为什么画里有一扇门？]
    那只是构图。园林讲究借景，画也一样。 # speaker:painter # portrait:unsettled # line:front.opening.005a # voice:front.painter.003 # flag:set:front.inquiry.door
    -> front_opening_end
* [追问时间：你在前厅究竟等了多久？]
    一盏茶，也可能一夜。中庭的钟走得太快。 # speaker:painter # portrait:unsettled # line:front.opening.005b # voice:front.painter.004 # flag:set:front.inquiry.time
    -> front_opening_end
= front_opening_end
那我就走进你没有画完的地方。 # speaker:zhaoying # portrait:calm # line:front.opening.006 # voice:front.zhaoying.002 # memory:unlock:painter # objective:start:front-painter:inspect-easel
-> END

=== front_painting ===
画架上的中庭多出一扇窄门。门后不是风景，而是被反复涂黑的人影。 # speaker:narrator # line:front.painting.001
你说这是借景，可门轴上的泥和园丁剪刀上的泥色相同。 # speaker:zhaoying # portrait:guarded # line:front.painting.002 # voice:front.zhaoying.003
画家会把真实改得更像真实。 # speaker:painter # portrait:distant # line:front.painting.003 # voice:front.painter.005
* [保留画上的门，把它当作路线证据。]
    画可以撒谎，门的朝向不会。 # speaker:zhaoying # portrait:calm # line:front.painting.004a # voice:front.zhaoying.004 # flag:set:front.painting.route
    -> front_painting_end
* [刮开门后的黑影，确认他删掉了谁。]
    黑颜料下面有第五个人的衣角，但脸被画布吃掉了。 # speaker:zhaoying # portrait:alarmed # line:front.painting.004b # voice:front.zhaoying.005 # flag:set:front.painting.figure
    -> front_painting_end
= front_painting_end
第一枚印记落入勘验簿。其余三枚仍被空间藏着——先证明画里的门并非虚构。 # speaker:narrator # line:front.painting.005
-> END

=== front_door_proof ===
柳生的画里有门，账房的修缮格线上也留着同样宽度的空缺。两份记忆第一次重合。 # speaker:narrator # line:front.door.001
构图而已。画里添一扇门，不代表人走过。 # speaker:painter # portrait:unsettled # line:front.door.002 # voice:front.painter.006
可钱先生的账把门轴、铜钉和侧墙补缝分成了三笔。不存在的门不会花钱。 # speaker:zhaoying # portrait:guarded # line:front.door.003 # voice:front.zhaoying.008
* [标记门的朝向：它从中庭开向东院。]
    先证明路线存在，不把走路的人提前写上去。 # speaker:zhaoying # portrait:calm # line:front.door.004a # voice:front.zhaoying.009 # flag:set:front.door.judgment.route
    -> front_door_end
* [标记修缮日期：门在案发前三天刚被启用。]
    有人提前准备了入口，又在证词里集体忘掉它。 # speaker:zhaoying # portrait:alarmed # line:front.door.004b # voice:front.zhaoying.010 # flag:set:front.door.judgment.date
    -> front_door_end
= front_door_end
第一处勘误成立：画中门不是画家的虚构。 # speaker:narrator # line:front.door.005
-> END

=== front_corridor_proof ===
跨入中庭后，柳生背后的主走廊变成一面未落笔的白墙；夫人的记忆却保留每一根朱红立柱。 # speaker:narrator # line:front.corridor.001
我离开时没有回头。没有看见的路，自然不存在。 # speaker:painter # portrait:unsettled # line:front.corridor.002 # voice:front.painter.007
我在前厅见过他。他走得很急，而且回来过一次。 # speaker:wife # portrait:guarded # line:front.corridor.003 # voice:front.wife.001
* [记录物理矛盾：白墙与朱柱占据同一位置。]
    路没有消失，是柳生删掉了“返回前厅”这一步。 # speaker:zhaoying # portrait:guarded # line:front.corridor.004a # voice:front.zhaoying.011 # flag:set:front.corridor.judgment.returned
    -> front_corridor_end
* [记录时间矛盾：夫人看见的是他第二次经过。]
    两人的证词可能都是真的，只是各自省略了一次经过。 # speaker:zhaoying # portrait:calm # line:front.corridor.004b # voice:front.zhaoying.012 # flag:set:front.corridor.judgment.time
    -> front_corridor_end
= front_corridor_end
第二处勘误成立。白墙失去封路的权力，另外三枚印记开始显形。 # speaker:narrator # line:front.corridor.005
-> END

=== front_wife_jade ===
低重力偏厅里，玉佩悬在梳妆台上方。夫人说它早在案发前就丢了。 # speaker:narrator # line:front.jade.001
那不是我的。我的玉佩缺了一角。 # speaker:wife # portrait:guarded # line:front.jade.002 # voice:front.wife.002
缺角正嵌在画中门的门缝里。你用它卡住过门。 # speaker:zhaoying # portrait:guarded # line:front.jade.003 # voice:front.zhaoying.013
* [收起玉佩，保留“她去过侧门”的路线证据。]
    玉佩证明你到过那里，暂时不证明你为何去。 # speaker:zhaoying # portrait:calm # line:front.jade.004a # voice:front.zhaoying.014 # flag:set:front.jade.judgment.route
    -> front_jade_end
* [追问缺角，记录她曾为别人留门。]
    你不是把玉佩弄丢了，是把它留在门上等另一个人。 # speaker:zhaoying # portrait:guarded # line:front.jade.004b # voice:front.zhaoying.015 # flag:set:front.jade.judgment.person
    -> front_jade_end
= front_jade_end
夫人的玉佩成为第二枚印记。 # speaker:narrator # line:front.jade.005
-> END

=== front_gardener_shears ===
园艺剪卡在假山深处。刃口没有血，转轴里却塞着水榭窗封条的红纸。 # speaker:narrator # line:front.shears.001
剪刀谁都能拿。雨夜里我只修过藤。 # speaker:gardener # portrait:guilty # line:front.shears.002 # voice:front.gardener.001
* [检查刃口：它剪过纸，没有伤过人。]
    这把剪刀能证明封条被动过，不能证明凶器是什么。 # speaker:zhaoying # portrait:calm # line:front.shears.003a # voice:front.zhaoying.016 # flag:set:front.shears.judgment.seal
    -> front_shears_end
* [检查泥痕：泥来自水榭北窗下。]
    你去过水榭，又把来路改成了死循环。 # speaker:zhaoying # portrait:guarded # line:front.shears.003b # voice:front.zhaoying.017 # flag:set:front.shears.judgment.mud
    -> front_shears_end
= front_shears_end
园艺剪成为第三枚印记。它证明园丁隐瞒路线，但没有证明杀人。 # speaker:narrator # line:front.shears.004
-> END

=== front_accountant_page ===
夹页把“东院侧门修缮”写成“北楼窗格修缮”，总数相同，地点被换了。 # speaker:narrator # line:front.page.001
账目会誊错。银钱对得上就够了。 # speaker:accountant # portrait:cornered # line:front.page.002 # voice:front.accountant.001
* [核对收款人：签名被墨覆盖，仍剩一个“柳”字。]
    钱不是付给木匠，而是付给画门的人。 # speaker:zhaoying # portrait:alarmed # line:front.page.003a # voice:front.zhaoying.018 # flag:set:front.page.judgment.painter
    -> front_page_end
* [核对材料：账上没有木料，只有画布和松节油。]
    那扇门也许从未修过，只被画成了可以通过的样子。 # speaker:zhaoying # portrait:guarded # line:front.page.003b # voice:front.zhaoying.019 # flag:set:front.page.judgment.material
    -> front_page_end
= front_page_end
账页成为第四枚印记。四面锁开始回应四份互相否认的证词。 # speaker:narrator # line:front.page.004
-> END

=== front_lock ===
玉佩、园艺剪、账页和未完成的画同时贴上门扉。四面锁要求的不是答案，而是顺序。 # speaker:narrator # line:front.lock.001
先选最可信的人。他的景象会最先出现在东院。 # speaker:zhaoying # portrait:calm # line:front.lock.002 # voice:front.zhaoying.006
-> END

=== front_completion ===
四面锁依次转动。最可信的证词先亮起，最不可信的证词最后仍没有消失。 # speaker:narrator # line:front.complete.001
每个人都藏了一条路，也各自留下了一件无法伪造的东西。 # speaker:zhaoying # portrait:guarded # line:front.complete.002 # voice:front.zhaoying.007
东院开了。水榭里有四种死法在等你选一条能同时成立的。 # speaker:steward # portrait:threatening # line:front.complete.003 # voice:front.steward.001
下一步不是相信谁，是证明哪条路在物理上唯一自洽。 # speaker:steward # portrait:knowing # line:front.complete.004 # voice:front.steward.002 # flag:set:front.chapter.complete
-> END
