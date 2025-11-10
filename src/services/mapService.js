import AMapLoader from '@amap/amap-jsapi-loader';

// 高德地图服务
class MapService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.map = null;
    this.AMap = null;
    this.isLoaded = false;
  }

  // 加载高德地图API
  async loadAMap() {
    if (this.isLoaded && this.AMap) {
      return this.AMap;
    }

    try {
      const AMap = await AMapLoader.load({
        key: this.apiKey,
        version: '2.0',
        plugins: [
          'AMap.PlaceSearch',
          'AMap.Geolocation', 
          'AMap.Driving',
          'AMap.Walking',
          'AMap.Transfer',
          'AMap.Geocoder'
        ]
      });
      
      this.AMap = AMap;
      this.isLoaded = true;
      return AMap;
    } catch (error) {
      console.error('高德地图API加载失败:', error);
      throw error;
    }
  }

  // 初始化地图
  async initMap(container, options = {}) {
    if (!this.AMap) {
      await this.loadAMap();
    }

    const defaultOptions = {
      zoom: 10,
      center: [116.397428, 39.90923], // 北京
      mapStyle: 'amap://styles/normal',
      ...options
    };

    this.map = new this.AMap.Map(container, defaultOptions);
    return this.map;
  }

  // 搜索地点
  async searchPlace(keyword, city) {
    if (!this.AMap) {
      await this.loadAMap();
    }

    return new Promise((resolve, reject) => {
      const placeSearch = new this.AMap.PlaceSearch({
        city: city || '全国',
        pageSize: 10
      });
      console.log(placeSearch, 'placeSearch');
      placeSearch.search(keyword, (status, result) => {
        if (status === 'complete' && result.poiList) {
          resolve(result.poiList.pois);
        } else {
          console.error('搜索失败:', status, result);
          reject(new Error(`搜索失败: ${status}`));
        }
      });
    });
  }

  // 路径规划
  async planRoute(start, end, type = 'driving') {
    if (!this.AMap) {
      await this.loadAMap();
    }

    return new Promise((resolve, reject) => {
      const routeClass = {
        driving: this.AMap.Driving,
        walking: this.AMap.Walking,
        transit: this.AMap.Transfer
      }[type] || this.AMap.Driving;

      const route = new routeClass({
        map: this.map
      });

      route.search(start, end, (status, result) => {
        if (status === 'complete') {
          resolve(result);
        } else {
          reject(new Error('路径规划失败'));
        }
      });
    });
  }

  // 添加标记
  addMarker(position, options = {}) {
    if (!this.map) return null;

    const marker = new this.AMap.Marker({
      position: position,
      map: this.map,
      ...options
    });

    return marker;
  }

  // 获取当前位置
  async getCurrentPosition() {
    if (!this.AMap) {
      await this.loadAMap();
    }

    return new Promise((resolve, reject) => {
      const geolocation = new this.AMap.Geolocation({
        enableHighAccuracy: true,
        timeout: 10000
      });

      geolocation.getCurrentPosition((status, result) => {
        if (status === 'complete') {
          resolve(result.position);
        } else {
          reject(new Error('定位失败'));
        }
      });
    });
  }
}

export default MapService;