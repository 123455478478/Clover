# Clover

> Make lover closer.

Clover 是一个为两个人设计的隐私优先恋爱清单 PWA。它把共同愿望、完成回忆、照片和约会账本放在同一个温暖、离线可用的空间里。

## 品牌

`Clover` 来自 “make lover closer”。Logo 由四片向中心靠近的心形叶片组成：珊瑚色代表心动，鼠尾草绿代表陪伴与成长。

## 功能

- 分类整理的 100 件恋爱小事，支持搜索、筛选和收藏
- 记录完成日期、地点、心情、文字与照片
- 自动生成共同回忆时间线
- 月度约会账本、分类统计和预算进度
- 情侣信息、纪念日和三套页面主题
- IndexedDB 本地持久化，localStorage 兼容降级
- 照片自动压缩，降低本地存储占用
- JSON 完整备份与严格恢复校验
- Service Worker 离线缓存
- 响应式桌面工作台与移动端 App 导航

## 隐私

Clover 不需要账号，也没有业务服务器。昵称、照片、回忆和账目仅保存在当前设备的浏览器中。建议定期从“我们 → 数据备份”导出 JSON 文件。

## 本地运行

```bash
pnpm install
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 生产构建

```bash
pnpm build
pnpm start
```
