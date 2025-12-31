// 天气代码映射
const skyconMap = {
    'CLEAR_DAY': '☀️ 晴', 'CLEAR_NIGHT': '🌙 晴',
    'PARTLY_CLOUDY_DAY': '⛅ 多云', 'PARTLY_CLOUDY_NIGHT': '☁️ 多云',
    'CLOUDY': '☁️ 阴', 'RAIN': '🌧️ 雨', 'SNOW': '❄️ 雪',
    'WIND': '🍃 大风', 'HAZE': '🌫️ 雾霾'
};

// 工具函数：获取友好的天气名称
function getSkyconName(code) {
    // 简单的模糊匹配，如果找不到精确的key，就尝试匹配前缀
    if (skyconMap[code]) return skyconMap[code];
    if (code.includes('RAIN')) return '🌧️ 雨';
    if (code.includes('SNOW')) return '❄️ 雪';
    return code;
}

// 1. 定位功能
function locateMe() {
    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');
    loading.innerText = "正在获取您的位置...";

    if (!navigator.geolocation) {
        alert("您的浏览器不支持地理定位");
        loading.classList.add('hidden');
        return;
    }

    navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        document.getElementById('city-name').innerText = `📍 当前位置  经度纬度：${lat}，${lon}`;
        getWeather(lat, lon);
    }, (error) => {
        console.error(error);
        alert("无法获取位置，请手动输入城市");
        loading.classList.add('hidden');
    });
}

// 2. 城市搜索功能
async function searchCity() {
    const city = document.getElementById('city-input').value;
    if (!city) return alert("请输入城市名");

    const loading = document.getElementById('loading');
    loading.classList.remove('hidden');
    loading.innerText = `正在查找 "${city}"...`;
    document.getElementById('weather-result').classList.add('hidden');

    try {
        const res = await fetch(`http://localhost:3000/api/search?q=${city}`);
        const data = await res.json();

        if (data.error) {
            alert(data.error);
            loading.classList.add('hidden');
        } else {
            // 搜索成功，拿到经纬度去查天气
            // document.getElementById('city-name').innerText = `📍 ${data.display_name.split(',')[0]}`; // 只显示第一段地名
            document.getElementById('city-name').innerText = `📍 ${data.display_name}`; // display_name 都可以显示 冗余信息的重要性 不言而喻  如果 格式化一下更好 format
            getWeather(data.lat, data.lon);
        }
    } catch (error) {
        alert("搜索服务出错");
        loading.classList.add('hidden');
    }
}

// 3. 获取并展示天气 (核心逻辑)
async function getWeather(lat, lon) {
    const loading = document.getElementById('loading');
    const resultDiv = document.getElementById('weather-result');

    try {
        loading.innerText = "正在获取天气数据...";
        const response = await fetch(`http://localhost:3000/api/weather?lat=${lat}&lon=${lon}`);
        const data = await response.json();

        if (data.status === 'ok') {
            updateUI(data.result);
            loading.classList.add('hidden');
            resultDiv.classList.remove('hidden');
        } else {
            alert("天气数据获取失败");
            loading.classList.add('hidden');
        }
    } catch (error) {
        console.error(error);
        alert("网络请求失败");
        loading.classList.add('hidden');
    }
}

function updateUI(data) {
    const real = data.realtime;
    const daily = data.daily;

    // --- 更新实时部分 ---
    document.getElementById('temperature').innerText = `${Math.round(real.temperature)}°C`;
    document.getElementById('skycon').innerText = getSkyconName(real.skycon);
    document.getElementById('humidity').innerText = `${Math.round(real.humidity * 100)}%`;
    document.getElementById('wind').innerText = `${real.wind.speed} km/h`;
    // 注意：有些地区可能没有 AQI 数据，做个保护
    document.getElementById('aqi').innerText = real.air_quality?.aqi?.chn || '-';

    // --- 更新未来预报部分 ---
    const list = document.getElementById('forecast-list');
    list.innerHTML = ''; // 清空旧数据

    // 彩云返回的 daily.temperature 是一个数组，包含每天的 max 和 min
    daily.temperature.forEach((item, index) => {
        // 跳过今天（index 0 通常是今天），如果想看今天也可以保留
        const dateObj = new Date(item.date);
        const dateStr = `${dateObj.getMonth() + 1}月${dateObj.getDate()}日`;
        
        // 获取对应日期的天气现象
        const skyconCode = daily.skycon[index].value; 
        const weatherText = getSkyconName(skyconCode);

        const tempMin = Math.round(item.min);
        const tempMax = Math.round(item.max);

        const div = document.createElement('div');
        div.className = 'forecast-item';
        div.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div>${weatherText}</div>
            <div class="forecast-temp">${tempMin}° ~ ${tempMax}°</div>
        `;
        list.appendChild(div);
    });

    document.getElementById('description').innerText = data.forecast_keypoint || "暂无详细描述";
}