=== pavilion_opening ===
四面锁在身后合拢。东院尽头，水榭像一只扣在池面上的黑匣子。 # speaker:narrator # line:pavilion.opening.001
四个人都给你留了一条进去的路。可沈砚堂死时，所有门窗都关着。 # speaker:steward # portrait:knowing # line:pavilion.opening.002 # voice:pavilion.steward.001
所以我要找的不是哪条路能进去，而是哪条路在他死亡时仍然存在。 # speaker:zhaoying # portrait:guarded # line:pavilion.opening.003 # voice:pavilion.zhaoying.001
* [先检查密室是否真的成立。]
    若锁是假的，后面的证词都没有意义。 # speaker:zhaoying # portrait:calm # line:pavilion.opening.004a # voice:pavilion.zhaoying.002 # flag:set:pavilion.inquiry.lock
    -> pavilion_opening_end
* [先问四个人为什么都记得入口。]
    入口也许都是真的，只是不属于同一个时刻。 # speaker:zhaoying # portrait:guarded # line:pavilion.opening.004b # voice:pavilion.zhaoying.003 # flag:set:pavilion.inquiry.routes
    -> pavilion_opening_end
= pavilion_opening_end
正门在等你。先别切换证词，记住它在基准现实里的样子。 # speaker:steward # portrait:courteous # line:pavilion.opening.005 # voice:pavilion.steward.002 # objective:start:pavilion-lock:inspect-door
-> END

=== pavilion_sealed_door ===
正门铜锁没有撬痕，门缝里的锁舌朝向室内。窗封纸从里面压住，外侧雨水完整。 # speaker:narrator # line:pavilion.door.001
门窗紧闭不是传闻。水榭确实在某个时刻从内部封死。 # speaker:zhaoying # portrait:guarded # line:pavilion.door.002 # voice:pavilion.zhaoying.004
可你仍要进去。借一条证人的路，别把那条路当成最终答案。 # speaker:steward # portrait:knowing # line:pavilion.door.003 # voice:pavilion.steward.003
密室成立。现在至少核对两条入口，判断它们分别属于什么时间。 # speaker:zhaoying # portrait:calm # line:pavilion.door.004 # voice:pavilion.zhaoying.005 # objective:start:pavilion-routes:inspect-routes
-> END

=== pavilion_route_wife ===
夫人的证词里，后门半开，门槛上没有积水，仿佛暴雨尚未落下。 # speaker:narrator # line:pavilion.route.wife.001
门一直开着。我送茶进去时，老爷还坐在椅上。 # speaker:wife # portrait:restrained # line:pavilion.route.wife.002 # voice:pavilion.wife.001
“一直”是你愿意保留的部分。锁舌上的灰证明它后来合过一次。 # speaker:zhaoying # portrait:guarded # line:pavilion.route.wife.003 # voice:pavilion.zhaoying.006
后门曾经打开，但不能证明死亡之后仍能离开。 # speaker:zhaoying # portrait:calm # line:pavilion.route.wife.004 # voice:pavilion.zhaoying.007 # flag:set:pavilion.route.time.before-rain
-> END

=== pavilion_route_gardener ===
园丁的证词把屋顶撕开一道漏雨的洞。断瓦却压在新长的青苔上。 # speaker:narrator # line:pavilion.route.gardener.001
我上去堵过漏。洞一直在那里。 # speaker:gardener # portrait:guilty # line:pavilion.route.gardener.002 # voice:pavilion.gardener.001
断口没有七年的水锈。这个洞属于案发后的坍塌，不属于当晚。 # speaker:zhaoying # portrait:guarded # line:pavilion.route.gardener.003 # voice:pavilion.zhaoying.008
你记得屋顶漏雨，是因为你需要水来自上面。 # speaker:zhaoying # portrait:alarmed # line:pavilion.route.gardener.004 # voice:pavilion.zhaoying.009 # flag:set:pavilion.route.time.after-collapse
-> END

=== pavilion_route_accountant ===
账房的蓝色网格沉进地板，形成一条通往水榭下方的密道。尽头却是一整块没有活页的石板。 # speaker:narrator # line:pavilion.route.accountant.001
我知道密道，不等于我走到过屋里。 # speaker:accountant # portrait:cornered # line:pavilion.route.accountant.002 # voice:pavilion.accountant.001
你的话这次很准确。密道抵达水榭，却没有抵达室内。 # speaker:zhaoying # portrait:calm # line:pavilion.route.accountant.003 # voice:pavilion.zhaoying.010
它能运东西到地板下，不能让人穿过封死的石板。 # speaker:zhaoying # portrait:guarded # line:pavilion.route.accountant.004 # voice:pavilion.zhaoying.011 # flag:set:pavilion.route.blocked-below
-> END

=== pavilion_route_painter ===
柳生的证词里，东窗破裂，碎玻璃全落在窗外。窗内屏画边缘却留着一圈湿亮的松节油。 # speaker:narrator # line:pavilion.route.painter.001
窗是我打破的。有人得从这里出去。 # speaker:painter # portrait:unsettled # line:pavilion.route.painter.002 # voice:pavilion.painter.001
从里面打破窗，玻璃会向外落。但窗下没有落地脚印。 # speaker:zhaoying # portrait:guarded # line:pavilion.route.painter.003 # voice:pavilion.zhaoying.012
破窗是掩护。真正短暂打开的，是旁边这幅还没干的画。 # speaker:zhaoying # portrait:alarmed # line:pavilion.route.painter.004 # voice:pavilion.zhaoying.013 # flag:set:pavilion.route.painting-suspected
-> END

=== pavilion_threshold ===
两条入口证词叠在一起，没有形成同一扇门，反而在门缝间撕开一道只容一人通过的记忆裂隙。 # speaker:narrator # line:pavilion.threshold.001
你不是证明了哪条路正确。你证明了这些路不属于同一个时刻。 # speaker:steward # portrait:knowing # line:pavilion.threshold.002 # voice:pavilion.steward.004
我借它们之间的矛盾进去，不把任何一条写成案发后的出口。 # speaker:zhaoying # portrait:calm # line:pavilion.threshold.003 # voice:pavilion.zhaoying.014
裂隙闭合。水榭内部同时亮起四种互相否认的死亡现场。 # speaker:narrator # line:pavilion.threshold.004 # objective:start:pavilion-body:cross-check-body
-> END

=== pavilion_body_wife ===
夫人的水榭整洁得没有一滴雨。沈砚堂坐在椅上，衣襟平整，唇角像还留着笑。 # speaker:narrator # line:pavilion.body.wife.001
我离开时他还活着。他让我把门带上。 # speaker:wife # portrait:grieving # line:pavilion.body.wife.002 # voice:pavilion.wife.002
你保留了他最后像人的样子，也把死亡从房间里删掉了。 # speaker:zhaoying # portrait:guarded # line:pavilion.body.wife.003 # voice:pavilion.zhaoying.015
* [记录坐姿与干燥衣襟。]
    这份记忆保存了死亡前的现场。 # speaker:zhaoying # portrait:calm # line:pavilion.body.wife.004a # voice:pavilion.zhaoying.016 # flag:set:pavilion.body.wife.before-death
    -> END
* [记录她亲手带上了门。]
    她承认关门，但当时屋内的人仍能从内部打开。 # speaker:zhaoying # portrait:guarded # line:pavilion.body.wife.004b # voice:pavilion.zhaoying.017 # flag:set:pavilion.body.wife.closed-door
    -> END

=== pavilion_body_gardener ===
园丁的水榭满地泥水。尸体倒在中央，肩背沾着与西院暗闸相同的青灰泥。 # speaker:narrator # line:pavilion.body.gardener.001
我进来时已经这样。我只把他翻过来，看还有没有气。 # speaker:gardener # portrait:guilty # line:pavilion.body.gardener.002 # voice:pavilion.gardener.003
泥痕从尸体下方继续延伸。你不只翻过他，还拖动过位置。 # speaker:zhaoying # portrait:alarmed # line:pavilion.body.gardener.003 # voice:pavilion.zhaoying.018
他搬动了尸体，却没有制造锁死的房间。 # speaker:zhaoying # portrait:calm # line:pavilion.body.gardener.004 # voice:pavilion.zhaoying.019 # flag:set:pavilion.body.gardener.moved
-> END

=== pavilion_body_accountant ===
账房的水榭空无一物。中央只有一块被蓝色格线绕开的空白，连“尸体”两个字都没有。 # speaker:narrator # line:pavilion.body.accountant.001
我没进去，也没见到尸体。账上没有，就不能算我的证词。 # speaker:accountant # portrait:cornered # line:pavilion.body.accountant.002 # voice:pavilion.accountant.003
否认不会让物体消失，只会让你的空间为它留出一个不敢计算的空格。 # speaker:zhaoying # portrait:guarded # line:pavilion.body.accountant.003 # voice:pavilion.zhaoying.020
空白的尺寸与另外两份证词中的尸体完全相同。 # speaker:narrator # line:pavilion.body.accountant.004 # flag:set:pavilion.body.accountant.denial
-> END

=== pavilion_body_painter ===
柳生的水榭里挤满画架。尸体旁放着一幅未完成的屏画，画中的月洞门正被黑色颜料覆盖。 # speaker:narrator # line:pavilion.body.painter.001
我画的是他活着的时候。后来发生什么，我没有看。 # speaker:painter # portrait:unsettled # line:pavilion.body.painter.002 # voice:pavilion.painter.003
颜料覆盖顺序相反。门先被画出，后来才被你抹掉。 # speaker:zhaoying # portrait:guarded # line:pavilion.body.painter.003 # voice:pavilion.zhaoying.021
你留下的不是死亡画像，是一条用完后必须消失的出口。 # speaker:zhaoying # portrait:alarmed # line:pavilion.body.painter.004 # voice:pavilion.zhaoying.022 # flag:set:pavilion.body.painter.paint-door
-> END

=== pavilion_inner_bolt ===
后门内侧锁舌的积灰被向下压断。门外铜环没有受力，锁门的人当时仍在屋内。 # speaker:narrator # line:pavilion.bolt.001
我只是把门带上。是他自己落的锁。 # speaker:wife # portrait:grieving # line:pavilion.bolt.002 # voice:pavilion.wife.003
这一步没有杀死他，却让画门消失后再无物理出口。 # speaker:zhaoying # portrait:guarded # line:pavilion.bolt.003 # voice:pavilion.zhaoying.023 # flag:set:pavilion.order.1-inner-lock
-> END

=== pavilion_drain ===
排水槽里的苔线由池底向室内爬升。泥沙最厚处不在屋檐下，而在锁死的地板边。 # speaker:narrator # line:pavilion.drain.001
我改水是为了断掉四景，不是为了灌死谁。 # speaker:gardener # portrait:alarmed # line:pavilion.drain.002 # voice:pavilion.gardener.004
你的改道在暴雨前只是保护动作，水位升高后才变成逆灌条件。 # speaker:zhaoying # portrait:calm # line:pavilion.drain.003 # voice:pavilion.zhaoying.024 # flag:set:pavilion.order.3-reverse-water
-> END

=== pavilion_paint_residue ===
屏画边缘的松节油尚未干透。黑颜料覆盖下，一扇月洞门的透视线与第三章画中门完全重合。 # speaker:narrator # line:pavilion.paint.001
门只维持了几息。她出去以后，四景一散，我再也画不回来。 # speaker:painter # portrait:unsettled # line:pavilion.paint.002 # voice:pavilion.painter.004
所以有人离开过密室，却没有使用任何后来还能被找到的物理入口。 # speaker:zhaoying # portrait:alarmed # line:pavilion.paint.003 # voice:pavilion.zhaoying.025 # flag:set:pavilion.order.2-exit-vanished
-> END

=== pavilion_causality ===
四份现场被压成一条时间线：内锁扣合；画门短暂打开又消失；暴雨令改道水路逆灌；沈砚堂在没有出口的水榭中溺亡。 # speaker:narrator # line:pavilion.causality.001
没有换帖，他会完成借名；没有改水，水不会逆灌；没有画门，另一个人也逃不出去。 # speaker:steward # portrait:threatening # line:pavilion.causality.002 # voice:pavilion.steward.005
四次各自想保护某个人的破坏，合成了死亡条件。没有哪一份证词能单独承担整条因果。 # speaker:zhaoying # portrait:guarded # line:pavilion.causality.003 # voice:pavilion.zhaoying.026
* [把“唯一因果链”写入勘验簿。]
    我确认发生顺序，不替任何人制造一个简单的凶手。 # speaker:zhaoying # portrait:calm # line:pavilion.causality.004a # voice:pavilion.zhaoying.027 # flag:set:case.unique-causal-chain
    -> pavilion_causality_end
* [保留“共同责任”，等待终章判断动机。]
    事实已经唯一，责任仍要等第五份证词出现。 # speaker:zhaoying # portrait:guarded # line:pavilion.causality.004b # voice:pavilion.zhaoying.028 # flag:set:pavilion.judgment.shared-conditions
    -> pavilion_causality_end
= pavilion_causality_end
四份证词最后一次要求你表态：终章开始前，暂时采用谁的真相？ # speaker:steward # portrait:knowing # line:pavilion.causality.005 # voice:pavilion.steward.006
-> END

=== pavilion_completion ===
你选择的证词覆盖水榭，另外三份没有消失，只退到镜面之后。 # speaker:narrator # line:pavilion.complete.001
水榭已经回答了“他如何死”。还剩一个问题：为什么所有人口中都缺少同一个人？ # speaker:steward # portrait:threatening # line:pavilion.complete.002 # voice:pavilion.steward.007
因为第五份证词一直拿着勘验簿。 # speaker:zhaoying # portrait:alarmed # line:pavilion.complete.003 # voice:pavilion.zhaoying.029
镜子在水面下亮起。终章“镜中我”已经解锁。 # speaker:narrator # line:pavilion.complete.004 # flag:set:pavilion.chapter.complete
-> END
