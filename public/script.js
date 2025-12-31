// 天气代码翻译字典
const skyconMap = {
    'CLEAR_DAY': '☀️ 晴 (白天)',
    'CLEAR_NIGHT': '🌙 晴 (夜间)',
    'PARTLY_CLOUDY_DAY': '⛅ 多云 (白天)',
    'PARTLY_CLOUDY_NIGHT': '☁️ 多云 (夜间)',
    'CLOUDY': '☁️ 阴',
    'LIGHT_HAZE': '🌫️ 轻度雾霾',
    'MODERATE_HAZE': '🌫️ 中度雾霾',
    'HEAVY_HAZE': '😷 重度雾霾',
    'LIGHT_RAIN': '🌧️ 小雨',
    'MODERATE_RAIN': '🌧️ 中雨',
    'HEAVY_RAIN': '⛈️ 大雨',
    'STORM_RAIN': '⛈️ 暴雨',
    'SNOW': '❄️ 雪'
};

async function getWeather() {
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;
    const resultDiv = document.getElementById('weather-result');
    const descP = document.getElementById('description');

    if (!lat || !lon) {
        alert("请输入经纬度");
        return;
    }

    // 显示加载状态
    resultDiv.classList.remove('hidden');
    descP.innerText = "数据加载中...";

    try {
        // 请求我们自己的后端
        const response = await fetch(`http://localhost:3000/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (data.status === 'ok') {
            updateUI(data.result);
        } else {
            descP.innerText = "API 返回错误：" + JSON.stringify(data);
        }
    } catch (error) {
        console.error(error);
        descP.innerText = "网络请求失败，请检查后端是否启动。";
    }
}

function updateUI(data) {
    const real = data.realtime;

    // 更新温度
    document.getElementById('temperature').innerText = `${Math.round(real.temperature)}°C`;
    
    // 更新天气状况文字
    const weatherText = skyconMap[real.skycon] || real.skycon;
    document.getElementById('skycon').innerText = weatherText;

    // 更新详情
    document.getElementById('humidity').innerText = `${Math.round(real.humidity * 100)}%`;
    document.getElementById('wind').innerText = `${real.wind.speed} km/h`;
    document.getElementById('aqi').innerText = real.air_quality.aqi.chn;
    
    // 更新描述信息
    document.getElementById('description').innerText = `数据更新时间: ${new Date().toLocaleTimeString()}`;
}