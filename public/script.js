// 天气代码映射
// const skyconMap = {
//     'CLEAR_DAY': '☀️ 晴', 'CLEAR_NIGHT': '🌙 晴',
//     'PARTLY_CLOUDY_DAY': '⛅ 多云', 'PARTLY_CLOUDY_NIGHT': '☁️ 多云',
//     'CLOUDY': '☁️ 阴', 'RAIN': '🌧️ 雨', 'SNOW': '❄️ 雪',
//     'WIND': '🍃 大风', 'HAZE': '🌫️ 雾霾'
// };

// 图标基础 URL (使用 jsdelivr CDN 加速)
const ICON_BASE_URL = "https://cdn.jsdelivr.net/npm/@bybas/weather-icons@2.0.0/production/fill/all/";

// https://cdn.jsdelivr.net/npm/@bybas/weather-icons@2.0.0/index.min.js  base URL  

// 映射关系：彩云代码 -> 图标文件名
// 这里的 key 是彩云返回的代码，value 是图标文件名
const weatherMap = {
    'CLEAR_DAY': { name: '晴 (白天)', icon: 'clear-day.svg' },
    'CLEAR_NIGHT': { name: '晴 (夜间)', icon: 'clear-night.svg' },
    'PARTLY_CLOUDY_DAY': { name: '多云', icon: 'partly-cloudy-day.svg' },
    'PARTLY_CLOUDY_NIGHT': { name: '多云', icon: 'partly-cloudy-night.svg' },
    'CLOUDY': { name: '阴', icon: 'cloudy.svg' },
    'LIGHT_HAZE': { name: '轻度雾霾', icon: 'fog.svg' },
    'MODERATE_HAZE': { name: '中度雾霾', icon: 'fog.svg' },
    'HEAVY_HAZE': { name: '重度雾霾', icon: 'fog.svg' },
    'LIGHT_RAIN': { name: '小雨', icon: 'drizzle.svg' },
    'MODERATE_RAIN': { name: '中雨', icon: 'rain.svg' },
    'HEAVY_RAIN': { name: '大雨', icon: 'rain.svg' },
    'STORM_RAIN': { name: '暴雨', icon: 'thunderstorms-rain.svg' },
    'FOG': { name: '雾', icon: 'mist.svg' },
    'SNOW': { name: '雪', icon: 'snow.svg' },
    'WIND': { name: '大风', icon: 'wind.svg' }
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
        document.getElementById('city-name').innerText = `📍 当前位置`;
        document.getElementById('display-lat').innerText = lat.toFixed(4);
        document.getElementById('display-lon').innerText = lon.toFixed(4);
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
            document.getElementById('display-lat').innerText = parseFloat(data.lat).toFixed(4);
            document.getElementById('display-lon').innerText = parseFloat(data.lon).toFixed(4);
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

// 失败了 没有成功覆盖写 起个别名
async function getWeatherbylatitude() {
    const lat = document.getElementById('lat').value;
    const lon = document.getElementById('lon').value;
    const resultDiv = document.getElementById('weather-result');
    const descP = document.getElementById('description');

    if (!lat || !lon) {
        alert("请输入经纬度");
        return;
    }
    document.getElementById('display-lat').innerText = parseFloat(lat).toFixed(4);
    document.getElementById('display-lon').innerText = parseFloat(lon).toFixed(4);
    getWeather(lat,lon)
}

// 辅助函数：根据代码获取图标和名称
function getWeatherInfo(code) {
    // 如果字典里有，直接返回
    if (weatherMap[code]) return weatherMap[code];
    
    // 模糊匹配逻辑
    if (code.includes('RAIN')) return { name: '雨', icon: 'rain.svg' };
    if (code.includes('SNOW')) return { name: '雪', icon: 'snow.svg' };
    
    // 默认兜底
    return { name: code, icon: 'not-available.svg' };
}

// 更新 UI 的函数
function updateUI(data) {
    const real = data.realtime;
    const daily = data.daily;

    // 1. 设置主天气图标和文字
    const weatherInfo = getWeatherInfo(real.skycon);
    const iconImg = document.getElementById('weather-icon');
    
    iconImg.src = ICON_BASE_URL + weatherInfo.icon;
    iconImg.classList.remove('hidden'); // 加载 URL 后再显示
    
    document.getElementById('skycon').innerText = weatherInfo.name;
    document.getElementById('temperature').innerText = `${Math.round(real.temperature)}°C`;
    
    // 2. 详情数据
    document.getElementById('humidity').innerText = `${Math.round(real.humidity * 100)}%`;
    document.getElementById('wind').innerText = `${real.wind.speed} km/h`;
    document.getElementById('aqi').innerText = real.air_quality?.aqi?.chn || '-';

    // 3. 未来预报列表
    const list = document.getElementById('forecast-list');
    list.innerHTML = ''; 

    daily.temperature.forEach((item, index) => {
        const dateObj = new Date(item.date);
        const dateStr = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
        
        // 获取预报那天的图标
        const forecastCode = daily.skycon[index].value; 
        const forecastInfo = getWeatherInfo(forecastCode);

        const tempMin = Math.round(item.min);
        const tempMax = Math.round(item.max);

        const div = document.createElement('div');
        div.className = 'forecast-item';
        // 预报列表中也加入小图标
        div.innerHTML = `
            <div class="forecast-date">${dateStr}</div>
            <div class="forecast-condition">
                <img src="${ICON_BASE_URL + forecastInfo.icon}" style="width:24px; vertical-align:middle"> 
                ${forecastInfo.name}
            </div>
            <div class="forecast-temp">${tempMin}° ~ ${tempMax}°</div>
        `;
        list.appendChild(div);
    });

    document.getElementById('description').innerText = data.forecast_keypoint || "";
}