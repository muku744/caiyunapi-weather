const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3000;

// 启用跨域支持，允许你的前端访问
app.use(cors());
// 设置静态文件目录
app.use(express.static('public'));

// 替换为你自己的彩云天气 Token
const API_TOKEN = 'hc7VmjtV9sdSah9f'; 

// 定义获取天气的路由
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: '需要提供经纬度 (lat, lon)' });
    }

    try {
        // 彩云 API 格式: https://api.caiyunapp.com/v2.6/TOKEN/经度,纬度/realtime.json
        // 注意：彩云通常是 经度(lon),纬度(lat) 的顺序
        const url = `https://api.caiyunapp.com/v2.5/${API_TOKEN}/${lon},${lat}/realtime.json`;
        
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('API 请求失败:', error.message);
        res.status(500).json({ error: '获取天气数据失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器运行在 http://localhost:${port}`);
});