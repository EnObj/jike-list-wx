# 即刻节目单

展示最近历史、今日及未来各频道节目单

## 头像

![RUNOOB 图标](http://static.runoob.com/images/runoob-logo.png)

## 数据库设计

### 频道表（channel）

|字段|数据类型|说明|
|-|-|-|
|\_id|string|频道id|
|name|string|频道名称|
|logo|string|图标|

### 节目表（program)

|字段|数据类型|说明|
|-|-|-|
|\_id|string|节目id|
|channelId|string|频道id|
|date|number|日期|
|title|string|标题|
|startTime|number|开始时间（秒级时间戳）|
|endTime|number|结束时间（秒级时间戳）|
|length|number|时长（秒）|

