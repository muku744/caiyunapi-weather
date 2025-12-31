const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.static('public'));

// 请替换为你自己的彩云 Token
const API_TOKEN = process.env.CAIYUN_TOKEN ||'hc7VmjtV9sdSah9f'; 

// 1. 获取天气（包含实时 + 未来预报）
app.get('/api/weather', async (req, res) => {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: '需要经纬度' });

    try {
        // 使用 /weather 接口可以同时获取实时和预报数据
        // dailysteps=5 表示获取未来5天的数据
        const url = `https://api.caiyunapp.com/v2.6/${API_TOKEN}/${lon},${lat}/weather.json?dailysteps=2`;
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('天气 API 出错:', error.message);
        res.status(500).json({ error: '获取天气失败' });
    }
});

// 2. 城市搜索（地名转经纬度）
// 使用 OpenStreetMap 的 Nominatim 服务（免费，无需 Key）
app.get('/api/search', async (req, res) => {
    const city = req.query.q;
    if (!city) return res.status(400).json({ error: '请输入城市名' });

    try {
        // 必须设置 User-Agent，这是 OpenStreetMap 的规则
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
        const response = await axios.get(url, {
            headers: { 'User-Agent': 'WeatherApp-Demo/1.0' }
        });
        
        if (response.data && response.data.length > 0) {
            res.json(response.data[0]); // 返回最匹配的第一个结果
            // log.console(response.data)    上面的规则我不可以直接使用 postman访问  但估计 postman 可以配置  
        } else {
            res.status(404).json({ error: '未找到该城市' });
        }
    } catch (error) {
        console.error('搜索 API 出错:', error.message);
        res.status(500).json({ error: '搜索失败' });
    }
});

app.listen(port, () => {
    console.log(`服务器升级完毕: http://localhost:${port}`);
});