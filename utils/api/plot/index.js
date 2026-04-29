const db = require('../../db/index')

/**
 * 查询 land_plot 表中的所有记录
 * 返回字段：plot_id, name, total_lease_area, current_vacant_area, occupied_businesses_count, plot_status, latitude, longitude
 * @returns {Promise<Array|null>} 包含所有记录的数组，如果查询失败则返回 null
 */
exports.getAllLandPlots = async () => {
    let connection = null
    try {
        connection = await db.getConnection();
        const sql = "SELECT lp.plot_id, lp.plot_name, lp.plot_description, lp.total_lease_area, lp.current_vacant_area, lp.occupied_businesses_count, lp.plot_status, lp.province, lp.city, lp.district, lp.latitude, lp.longitude, lp.created_by, u.username AS created_by_username FROM land_plot lp LEFT JOIN user u ON lp.created_by = u.id";
        const [result] = await connection.execute(sql);
        console.log(result)
        return result
    }
    catch (e) {
        console.error('查询土地地块信息失败:', e);
        return null
    }
    finally {
        if (connection) {
            connection.release()
        }
    }
}

/**
 * 根据 plot_id 查询 land_plot 表中的单条记录
 * 返回字段：plot_id, name, total_lease_area, current_vacant_area, occupied_businesses_count, plot_status, latitude, longitude
 * @param {number|string} plot_id - 地块ID
 * @returns {Promise<Object|null>} 包含地块信息的对象，如果未找到或查询失败则返回 null
 */
exports.getLandPlotById = async (plot_id) => {
  let connection = null;
  try {
    // 参数验证
    if (!plot_id || typeof plot_id === 'undefined') {
      throw new Error('地块ID不能为空');
    }

    // 获取数据库连接
    connection = await db.getConnection();

    // 查询地块基本信息
    const plotSql = "SELECT plot_id, plot_name, plot_description, total_lease_area, current_vacant_area, occupied_businesses_count, plot_status, province, city, district, latitude, longitude, created_by FROM land_plot WHERE plot_id = ?";
    const [plotResult] = await connection.execute(plotSql, [plot_id]);

    // 检查地块是否存在
    if (!plotResult || plotResult.length === 0) {
      return null;
    }

    const plot = plotResult[0];

    // 查询该地块下的所有租赁单元
    const leaseUnits = await exports.getLeaseUnitsByPlotId(plot.plot_id);

    // 将租赁单元添加到地块对象中
    plot.lease_units = leaseUnits || [];

    return plot;

  } catch (error) {
    console.error('根据地块ID查询地块详情失败:', error);
    return null;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 创建新地块
 * @param {string} name - 地块名称
 * @param {string|null} description - 地块描述（可为空）
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {string} province - 省份
 * @param {string} city - 城市
 * @param {string} district - 区县
 * @param {string} [plot_status] - 地块状态（可选，默认为'招租'）
 * @returns {Promise<number|null>} 成功时返回插入的 plot_id，失败时返回 null
 */
exports.createLandPlot = async (name, description, latitude, longitude, province, city, district, plot_status = '招租', created_by = null) => {
    let connection = null;
    try {
        // 参数验证
        if (!name || typeof name !== 'string') {
            throw new Error('地块名称不能为空');
        }
        
        if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
            throw new Error('纬度值必须在-90到90之间');
        }
        
        if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
            throw new Error('经度值必须在-180到180之间');
        }
        
        if (!province || typeof province !== 'string') {
            throw new Error('省份不能为空');
        }
        
        if (!city || typeof city !== 'string') {
            throw new Error('城市不能为空');
        }
        
        if (!district || typeof district !== 'string') {
            throw new Error('区县不能为空');
        }
        
        // 获取数据库连接
        connection = await db.getConnection();
        
        // 插入SQL语句 - 明确指定所有字段，其余使用默认值
        const sql = `INSERT INTO land_plot (
          plot_name,
          plot_description,
          total_lease_area,
          current_vacant_area,
          occupied_businesses_count,
          plot_status,
          latitude,
          longitude,
          province,
          city,
          district,
          created_by
        ) VALUES (
          ?,
          ?,
          0,
          0,
          0,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?,
          ?
        )`;

        // 执行插入操作
        const [result] = await connection.execute(sql, [
            name,
            description || '',
            plot_status,
            latitude,
            longitude,
            province,
            city,
            district,
            created_by
        ]);
        console.log(result.insertId)
        // 返回插入的 plot_id
        return result.insertId;
        
    } catch (error) {
        console.error('创建地块失败:', error);
        return null;
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * 删除地块（逻辑删除）
 * @param {number|string} plot_id - 地块ID
 * @param {number|string} userId - 当前用户ID（用于权限验证）
 * @returns {Promise<Object>} 删除结果对象
 */
exports.deleteLandPlot = async (plot_id, userId) => {
    let connection = null;
    try {
        // 参数验证
        if (!plot_id || typeof plot_id === 'undefined') {
            throw new Error('地块ID不能为空');
        }
        
        if (!userId || typeof userId === 'undefined') {
            throw new Error('用户ID不能为空');
        }
        
        // 获取数据库连接
        connection = await db.getConnection();
        
        // 首先验证地块是否存在且属于当前用户
        const checkSql = "SELECT plot_id, created_by FROM land_plot WHERE plot_id = ?";
        const [checkResult] = await connection.execute(checkSql, [plot_id]);
        
        if (!checkResult || checkResult.length === 0) {
            throw new Error('指定的地块不存在');
        }
        
        const plot = checkResult[0];
        // 验证权限：只有地块创建者才能删除
        if (plot.created_by !== userId) {
            throw new Error('您没有权限删除此地块');
        }
        
        // 先删除所有引用该地块的租赁单元
        const deleteLeasesSql = "DELETE FROM lease_unit WHERE land_plot_id = ?";
        const [leasesDeleteResult] = await connection.execute(deleteLeasesSql, [plot_id]);
        
        console.log(`删除了 ${leasesDeleteResult.affectedRows} 个租赁单元`);
        
        // 再删除地块本身
        const deletePlotSql = "DELETE FROM land_plot WHERE plot_id = ?";
        const [plotDeleteResult] = await connection.execute(deletePlotSql, [plot_id]);
        
        // 检查删除结果
        if (plotDeleteResult.affectedRows === 0) {
            throw new Error('删除地块失败');
        }
        
        // 返回成功结果
        return {
            success: true,
            message: '地块删除成功',
            affectedRows: plotDeleteResult.affectedRows,
            deletedLeaseUnits: leasesDeleteResult.affectedRows,
            plot_id: plot_id
        };
        
    } catch (error) {
        console.error('删除地块失败:', error);
        return {
            success: false,
            error: error.message,
            message: `删除地块失败: ${error.message}`
        };
    } finally {
        if (connection) {
            connection.release();
        }
    }
};

/**
 * 根据 plot_id 查询 lease_unit 表中的所有记录
 * 返回字段：unit_id, unit_name, area, rent_price, unit_description, land_plot_id, unit_status, created_at
 * @param {number|string} plot_id - 地块ID
 * @returns {Promise<Array|null>} 包含所有记录的数组，如果查询失败则返回 null
 */
exports.getLeaseUnitsByPlotId = async (plotId) => {
  let connection = null;
  try {
    // 参数验证
    if (!plotId || typeof plotId === 'undefined') {
      throw new Error('地块ID不能为空');
    }
    
    // 获取数据库连接
    connection = await db.getConnection();
    
    // 查询该地块下的所有租赁单元，添加 enterprise_name 字段
    const sql = "SELECT unit_id, unit_name, area, rent_price, unit_description, land_plot_id, unit_status, enterprise_name, created_at FROM lease_unit WHERE land_plot_id = ?";
    // 执行查询操作
    const [result] = await connection.execute(sql, [plotId]);
    console.log(result)
    
    // 返回查询结果
    return result || [];
    
  } catch (error) {
    console.error('根据地块ID查询租赁单元失败:', error);
    return [];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 根据用户ID查询该用户创建的所有地块
 * @param {number|string} userId - 用户ID
 * @returns {Promise<Array>} 返回包含所有地块记录的数组，查询失败或无数据时返回空数组
 */
exports.getLandPlotsByUserId = async (userId) => {
  let connection = null;
  try {
    // 参数验证
    if (!userId || typeof userId === 'undefined') {
      throw new Error('用户ID不能为空');
    }
    
    // 获取数据库连接
    connection = await db.getConnection();
    
    // 查询该用户创建的所有地块
    const sql = "SELECT lp.plot_id, lp.plot_name, lp.plot_description, lp.total_lease_area, lp.current_vacant_area, lp.occupied_businesses_count, lp.plot_status, lp.province, lp.city, lp.district, lp.latitude, lp.longitude, lp.created_by, u.username AS created_by_username FROM land_plot lp LEFT JOIN user u ON lp.created_by = u.Id WHERE lp.created_by = ?";
    
    // 执行查询操作
    const [result] = await connection.execute(sql, [userId]);
    
    // 返回查询结果
    return result || [];
    
  } catch (error) {
    console.error('根据用户ID查询地块失败:', error);
    return [];
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 更新地块信息
 * @param {Object} updateData - 更新数据对象
 * @param {number|string} updateData.plot_id - 地块ID（必填）
 * @param {string} [updateData.plot_name] - 新的地块名称
 * @param {string} [updateData.plot_description] - 新的地块描述
 * @param {number} [updateData.latitude] - 新的纬度值
 * @param {number} [updateData.longitude] - 新的经度值

 * @returns {Promise<Object|null>} 成功时返回更新结果对象，失败时返回null
 */
exports.updatePlot = async (updateData) => {
    let connection = null;
    try {
        // 参数验证
        if (!updateData || typeof updateData !== 'object') {
            throw new Error('更新数据必须是对象类型');
        }
        
        const { plot_id, plot_name, plot_description, latitude, longitude, plot_status } = updateData;
        
        if (!plot_id || typeof plot_id === 'undefined') {
            throw new Error('地块ID不能为空');
        }
        
        // 验证地块是否存在
        const existingPlot = await exports.getLandPlotById(plot_id);
        if (!existingPlot) {
            throw new Error('指定的地块不存在');
        }
        
        // 获取数据库连接
        connection = await db.getConnection();
        
        // 构建动态更新语句
        const updateFields = [];
        const updateValues = [];
        
        // 处理各个可选字段
        if (plot_name !== undefined && plot_name !== null) {
            if (typeof plot_name !== 'string' || plot_name.trim() === '') {
                throw new Error('地块名称必须是非空字符串');
            }
            updateFields.push('plot_name = ?');
            updateValues.push(plot_name.trim());
        }
        
        if (plot_description !== undefined && plot_description !== null) {
            if (typeof plot_description !== 'string') {
                throw new Error('地块描述必须是字符串类型');
            }
            updateFields.push('plot_description = ?');
            updateValues.push(plot_description);
        }
        // 处理 plot_status 字段
        if (plot_status !== undefined && plot_status !== null) {
            const validStatus = ['已租', '招租', '待更新'];
            if (!validStatus.includes(plot_status)) {
                throw new Error('地块状态必须是"招租"、"待租"或"已更新"之一');
            }
            updateFields.push('plot_status = ?');
            updateValues.push(plot_status);
        }
        
        // 处理经纬度和地理编码
        let geoProvince = null;
        let geoCity = null;
        let geoDistrict = null;
        
        if (latitude !== undefined && longitude !== undefined) {
            if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
                throw new Error('纬度值必须在-90到90之间');
            }
            if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
                throw new Error('经度值必须在-180到180之间');
            }
            
            updateFields.push('latitude = ?');
            updateFields.push('longitude = ?');
            updateValues.push(latitude);
            updateValues.push(longitude);
            
            // 调用地理编码获取最新的行政区划信息
            try {
                const geocode = require('../../geocode');
                const geoResult = await geocode.reverseGeocode(latitude, longitude);
                geoProvince = geoResult.province;
                geoCity = geoResult.city;
                geoDistrict = geoResult.district;
                
                console.log(`地理编码成功: ${latitude},${longitude} -> ${geoProvince}${geoCity}${geoDistrict}`);
            } catch (geoError) {
                console.error('地理编码失败:', geoError);
                throw new Error(`地理编码失败: ${geoError.error || geoError.message}`);
            }
        }
        
        // 更新行政区划信息（只有当地理编码成功时才更新）
        if (geoProvince && geoCity && geoDistrict) {
            updateFields.push('province = ?');
            updateFields.push('city = ?');
            updateFields.push('district = ?');
            updateValues.push(geoProvince.trim());
            updateValues.push(geoCity.trim());
            updateValues.push(geoDistrict.trim());
        }
        
        // 如果没有需要更新的字段
        if (updateFields.length === 0) {
            console.log('没有需要更新的字段');
            return {
                success: true,
                message: '没有需要更新的字段',
                affectedRows: 0,
                plot_id: plot_id
            };
        }
        
        // 构建完整的UPDATE语句
        const sql = `UPDATE land_plot SET ${updateFields.join(', ')} WHERE plot_id = ?`;
        updateValues.push(plot_id);
        
        console.log('执行SQL:', sql);
        console.log('参数:', updateValues);
        
        // 执行更新操作
        const [result] = await connection.execute(sql, updateValues);
        
        // 检查更新结果
        if (result.affectedRows === 0) {
            console.warn('警告: 没有记录被更新');
        }
        
        // 返回成功结果
        return {
            success: true,
            message: '地块信息更新成功',
            affectedRows: result.affectedRows,
            plot_id: plot_id
        };
        
    } catch (error) {
        console.error('更新地块信息失败:', error);
        return {
            success: false,
            error: error.message,
            message: `更新地块失败: ${error.message}`
        };
    } finally {
        if (connection) {
            connection.release();
        }
    }
};