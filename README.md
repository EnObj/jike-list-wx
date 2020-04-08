# 即刻节目单

本应用基于微信小程序展示最近历史、今日及未来各频道节目单。

支持对喜欢的节目标记“看过”，“在看”，“想看”，特别是对于标记“想看”的节目支持接受播出前提醒，提醒通过微信的服务通知渠道下发到你的消息列表。

## 头像

![RUNOOB 图标](http://static.runoob.com/images/runoob-logo.png)

## 数据库设计

### 频道表（channel）

|字段|数据类型|说明|
|-|-|-|
|\_id|string|频道id|
|code|string|频道编码|
|name|string|频道名称|
|logo|string|图标|

### 节目单（program_list)

|字段|数据类型|说明|
|-|-|-|
|\_id|string|节目单id|
|channelCode|string|频道编码|
|date|number|日期（如：20200331）|
|list|array(object)|节目列表|
|\-title|string|节目名称|
|\-startTime|number|开始时间（秒级时间戳）|
|\-endTime|number|结束时间（秒级时间戳）|
|\-length|number|时长（秒）|

### 用户动作表（user_action）
|字段|数据类型|说明|
|-|-|-|
|\_id|string|动作id|
|\_openid|string|用户id|
|channel|string|频道编码|
|date|number|日期（如：20200331）|
|programInsideId|string|节目内部id|
|program|object|节目（结构和program_list.list元素一致）|
|needNotify|boolean|需要通知|
|notify|object|通知|
|\-status|string|推送状态（wait/finished）|
