import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { message, Spin, Typography } from 'antd';
import { useSettings } from '../../contexts/SettingsContext';
import MapService from '../../services/mapService';

const { Text } = Typography;

const MapComponent = forwardRef(({ destination, locations = [], dayLocations = [], height = 300, onLocationClick }, ref) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const serviceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('加载地图中...');
  const { settings } = useSettings();

  // 每天的颜色配置
  const dayColors = [
    '#1890ff', // 蓝色 - 第1天
    '#52c41a', // 绿色 - 第2天
    '#fa8c16', // 橙色 - 第3天
    '#eb2f96', // 粉色 - 第4天
    '#722ed1', // 紫色 - 第5天
    '#13c2c2', // 青色 - 第6天
    '#faad14', // 金色 - 第7天
    '#f5222d', // 红色 - 第8天
    '#2f54eb', // 靛蓝 - 第9天
    '#a0d911', // 黄绿 - 第10天
  ];

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    focusLocation: (locationName) => {
      focusOnLocation(locationName);
    }
  }));

  useEffect(() => {
    initializeMap();
    
    // 清理函数
    return () => {
      clearMarkers();
      clearPolylines();
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [destination, settings.amapApiKey, JSON.stringify(locations), JSON.stringify(dayLocations)]);

  const initializeMap = async () => {
    if (!settings.amapApiKey) {
      message.warning('请在设置中配置高德地图API密钥以显示地图');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // 清除旧标记和路线
      clearMarkers();
      clearPolylines();
      
      // 销毁旧地图实例
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      
      // 创建或复用 MapService
      if (!serviceRef.current || serviceRef.current.apiKey !== settings.amapApiKey) {
        serviceRef.current = new MapService(settings.amapApiKey);
      }
      
      const service = serviceRef.current;
      const map = await service.initMap(mapRef.current, {
        zoom: 10,
        center: [116.397428, 39.90923] // 默认北京
      });

      mapInstanceRef.current = map;

      // 等待地图完全加载
      await new Promise(resolve => {
        map.on('complete', resolve);
      });

      // 优先使用按天分组的地点
      if (dayLocations && dayLocations.length > 0) {
        await markDayLocations(dayLocations);
      }
      // 否则如果有多个地点，标记所有地点（旧逻辑）
      else if (locations && locations.length > 0) {
        await markAllLocations(locations);
      }
      // 否则如果只有目的地，搜索并定位目的地
      else if (destination) {
        try {
          const places = await service.searchPlace(destination);
          console.log(destination,'搜索结果：', places);
          if (places && places.length > 0) {
            const place = places[0];
            const center = [place.location.lng, place.location.lat];
            
            // 使用 setTimeout 确保地图已完全初始化
            setTimeout(() => {
              if (mapInstanceRef.current) {
                mapInstanceRef.current.setCenter(center);
                mapInstanceRef.current.setZoom(12);
                
                // 添加标记
                const marker = service.addMarker(center, {
                  title: place.name,
                  content: place.address
                });
                markersRef.current.push({ name: destination, marker, position: center });
              }
            }, 100);
          }
        } catch (error) {
          console.error('搜索地点失败:', error);
          message.error(`搜索地点失败: ${error.message}`);
        }
      }
    } catch (error) {
      console.error('初始化地图失败:', error);
      message.error(`地图加载失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 格式化货币
  const formatCurrency = (amount) => {
    if (!amount) return '';
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY'
    }).format(amount);
  };

  // 按天标记地点并绘制路线
  const markDayLocations = async (dailyLocs) => {
    const service = serviceRef.current;
    const map = mapInstanceRef.current;
    if (!service || !map) return;

    const allPositions = [];
    let totalSuccess = 0;
    let totalFail = 0;
    let locationIndex = 1; // 全局位置编号
    let firstLocation = null; // 保存第一个景点的位置

    // 遍历每一天
    for (let dayIndex = 0; dayIndex < dailyLocs.length; dayIndex++) {
      const dayData = dailyLocs[dayIndex];
      const dayLocs = dayData.locations;
      const color = dayColors[dayIndex % dayColors.length];
      const dayPositions = [];

      // 更新加载文本
      setLoadingText(`标记第${dayData.day}天地点...`);

      // 标记这一天的所有地点
      for (let i = 0; i < dayLocs.length; i++) {
        const locationData = dayLocs[i];
        // 兼容旧格式（字符串）和新格式（对象）
        const locationName = typeof locationData === 'string' ? locationData : locationData.location;
        
        try {
          // 添加延迟，避免触发 QPS 限制
          if (locationIndex > 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }

          const places = await service.searchPlace(locationName);
          if (places && places.length > 0) {
            const place = places[0];
            const position = [place.location.lng, place.location.lat];
            allPositions.push(position);
            dayPositions.push(position);

            // 保存第一个景点的位置
            if (!firstLocation) {
              firstLocation = position;
            }

            // 添加标记 - 使用📍emoji作为标记
            if (mapInstanceRef.current) {
              // 创建自定义标记内容（包含📍和序号）
              const markerContent = document.createElement('div');
              markerContent.style.cssText = 'position: relative; width: 24px; height: 24px; cursor: pointer;';
              markerContent.innerHTML = `
                <div style="font-size: 24px; position: absolute; left: 0; top: 0;">📍</div>
                <div style="
                  position: absolute;
                  top: -20px;
                  left: 50%;
                  transform: translateX(-50%);
                  background: ${color};
                  color: white;
                  padding: 2px 6px;
                  border-radius: 10px;
                  font-size: 12px;
                  font-weight: bold;
                  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                  white-space: nowrap;
                ">${locationIndex}</div>
              `;
              
              const marker = new service.AMap.Marker({
                position: position,
                map: mapInstanceRef.current,
                title: place.name,
                content: markerContent,
                offset: new service.AMap.Pixel(-12, -24)
              });

              // 创建信息窗口内容
              let infoContent = `
                <div style="padding: 10px; max-width: 280px;">
                  <h4 style="margin: 0 0 8px 0; color: ${color}; font-size: 14px; font-weight: bold;">
                    第${dayData.day}天 - ${dayData.date}
                  </h4>
              `;

              if (typeof locationData === 'object') {
                if (locationData.type === 'activity') {
                  infoContent += `
                    <div style="margin-bottom: 6px;">
                      <div style="font-weight: bold; color: #333; margin-bottom: 4px;">
                        ${locationData.time ? `🕐 ${locationData.time}` : ''} ${locationData.title || ''}
                      </div>
                      <div style="color: #666; font-size: 13px; margin-bottom: 4px;">
                        📍 ${locationName}
                      </div>
                      ${locationData.description ? `
                        <div style="color: #666; font-size: 12px; line-height: 1.5; margin-bottom: 4px;">
                          ${locationData.description}
                        </div>
                      ` : ''}
                      ${locationData.cost ? `
                        <div style="color: #52c41a; font-size: 13px; margin-bottom: 4px;">
                          💰 ${formatCurrency(locationData.cost)}
                        </div>
                      ` : ''}
                      ${locationData.tips ? `
                        <div style="color: #fa8c16; font-size: 12px; background: #fff7e6; padding: 4px 8px; border-radius: 4px;">
                          💡 ${locationData.tips}
                        </div>
                      ` : ''}
                    </div>
                  `;
                } else if (locationData.type === 'accommodation') {
                  infoContent += `
                    <div style="margin-bottom: 6px;">
                      <div style="font-weight: bold; color: #333; margin-bottom: 4px;">
                        🏨 ${locationData.title || ''}
                      </div>
                      <div style="color: #666; font-size: 13px; margin-bottom: 4px;">
                        📍 ${locationName}
                      </div>
                      ${locationData.cost ? `
                        <div style="color: #52c41a; font-size: 13px; margin-bottom: 4px;">
                          💰 ${formatCurrency(locationData.cost)}/晚
                        </div>
                      ` : ''}
                      ${locationData.rating ? `
                        <div style="color: #faad14; font-size: 13px;">
                          ⭐ ${locationData.rating}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }
              } else {
                // 旧格式，只显示地点名称
                infoContent += `
                  <div style="color: #666; font-size: 13px;">
                    📍 ${locationName}
                  </div>
                `;
              }

              infoContent += `</div>`;

              // 创建信息窗口
              const infoWindow = new service.AMap.InfoWindow({
                content: infoContent,
                offset: new service.AMap.Pixel(0, -30),
                autoMove: false, // 禁止自动移动地图
                // closeWhenClickMap: false, // 点击地图时不关闭（由 mouseout 控制）
                // isCustom: false // 使用默认样式
              });
              
              // 保存标记引用
              markersRef.current.push({
                name: locationName,
                marker,
                position,
                place,
                day: dayData.day,
                infoWindow,
                locationData
              });

              // 添加鼠标悬浮事件
              marker.on('mouseover', () => {
                infoWindow.open(mapInstanceRef.current, position);
              });

              marker.on('mouseout', () => {
                infoWindow.close();
              });

              // 添加点击事件
              if (onLocationClick) {
                marker.on('click', () => {
                  onLocationClick(locationName, place);
                });
              }
              
              totalSuccess++;
              locationIndex++;
            }
          }
        } catch (error) {
          console.error(`标记地点失败 ${locationName}:`, error);
          totalFail++;
          
          // 如果是 QPS 限制错误，增加延迟
          if (error.message && error.message.includes('EXCEEDED_THE_LIMIT')) {
            console.log('触发 QPS 限制，等待 1 秒...');
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }

      // 为这一天的地点绘制路线（如果有多个地点）
      if (dayPositions.length > 1) {
        const polyline = new service.AMap.Polyline({
          path: dayPositions,
          strokeColor: color,
          strokeWeight: 4,
          strokeOpacity: 0.8,
          lineJoin: 'round',
          lineCap: 'round',
          map: mapInstanceRef.current
        });
        polylinesRef.current.push(polyline);
      }
    }

    // 显示统计信息
    if (totalSuccess > 0) {
      message.success(`成功标记 ${totalSuccess} 个地点${totalFail > 0 ? `，${totalFail} 个地点标记失败` : ''}`);
    } else if (totalFail > 0) {
      message.warning(`地点标记失败，请稍后重试或减少地点数量`);
    }

    // 调整地图视野
    if (allPositions.length > 0) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          try {
            if (allPositions.length === 1) {
              // 只有一个景点,定位到该景点
              mapInstanceRef.current.setCenter(allPositions[0]);
              mapInstanceRef.current.setZoom(13);
            } else {
              // 多个景点,调整视野包含所有景点
              mapInstanceRef.current.setFitView();
            }
          } catch (error) {
            console.error('调整地图视野失败:', error);
          }
        }
      }, 500);
    }
  };

  // 标记所有地点
  const markAllLocations = async (locs) => {
    const service = serviceRef.current;
    const map = mapInstanceRef.current;
    if (!service || !map) return;

    const allPositions = [];
    let successCount = 0;
    let failCount = 0;
    const totalCount = locs.length;
    let firstLocation = null; // 保存第一个景点的位置

    // 逐个搜索地点，避免 QPS 限制
    for (let i = 0; i < locs.length; i++) {
      const location = locs[i];
      
      // 更新加载文本
      setLoadingText(`标记地点中... (${i + 1}/${totalCount})`);
      
      try {
        // 添加延迟，避免触发 QPS 限制（高德免费版 QPS 限制为 5-10/秒）
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        const places = await service.searchPlace(location);
        if (places && places.length > 0) {
          const place = places[0];
          const position = [place.location.lng, place.location.lat];
          allPositions.push(position);

          // 保存第一个景点的位置
          if (!firstLocation) {
            firstLocation = position;
          }

          // 添加标记
          if (mapInstanceRef.current) {
            const marker = service.addMarker(position, {
              title: place.name,
              content: place.address,
              label: {
                content: `${successCount + 1}`,
                direction: 'top'
              }
            });
            
            // 保存标记引用
            markersRef.current.push({
              name: location,
              marker,
              position,
              place
            });

            // 添加点击事件
            if (onLocationClick) {
              marker.on('click', () => {
                onLocationClick(location, place);
              });
            }
            
            successCount++;
          }
        }
      } catch (error) {
        console.error(`标记地点失败 ${location}:`, error);
        failCount++;
        
        // 如果是 QPS 限制错误，增加延迟
        if (error.message && error.message.includes('EXCEEDED_THE_LIMIT')) {
          console.log('触发 QPS 限制，等待 1 秒...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    // 显示统计信息
    if (successCount > 0) {
      message.success(`成功标记 ${successCount} 个地点${failCount > 0 ? `，${failCount} 个地点标记失败` : ''}`);
    } else if (failCount > 0) {
      message.warning(`地点标记失败，请稍后重试或减少地点数量`);
    }

    // 调整地图视野
    if (allPositions.length > 0) {
      setTimeout(() => {
        if (mapInstanceRef.current) {
          try {
            if (allPositions.length === 1) {
              // 只有一个景点,定位到该景点
              mapInstanceRef.current.setCenter(allPositions[0]);
              mapInstanceRef.current.setZoom(13);
            } else {
              // 多个景点,调整视野包含所有景点
              mapInstanceRef.current.setFitView();
            }
          } catch (error) {
            console.error('调整地图视野失败:', error);
          }
        }
      }, 500);
    }
  };

  // 清除所有标记
  const clearMarkers = () => {
    markersRef.current.forEach(item => {
      if (item.marker) {
        item.marker.setMap(null);
      }
    });
    markersRef.current = [];
  };

  // 清除所有路线
  const clearPolylines = () => {
    polylinesRef.current.forEach(polyline => {
      if (polyline) {
        polyline.setMap(null);
      }
    });
    polylinesRef.current = [];
  };

  // 聚焦到特定地点
  const focusOnLocation = (locationName) => {
    const item = markersRef.current.find(m => m.name === locationName);
    if (item && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(item.position);
      mapInstanceRef.current.setZoom(15);
      
      // 显示信息窗口
      if (item.infoWindow) {
        item.infoWindow.open(mapInstanceRef.current, item.position);
      }
    }
  };

  return (
    <div style={{ position: 'relative', height }}>
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          zIndex: 1000,
          gap: 12
        }}>
          <Spin />
          <Text type="secondary">{loadingText}</Text>
        </div>
      )}
      
      <div
        ref={mapRef}
        className="map-container"
        style={{
          width: '100%',
          height: '100%',
          background: '#f5f5f5'
        }}
      />
      
      {!settings.amapApiKey && !loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#f5f5f5',
          color: '#999',
          fontSize: 14
        }}>
          请在设置中配置高德地图API密钥
        </div>
      )}
    </div>
  );
});

export default MapComponent;
