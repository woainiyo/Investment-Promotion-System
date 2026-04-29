/**
 * 租赁信息 API 模块
 */

const db = require('../../db/index');

/**
 * 验证日期格式
 * @param {string} dateString - 要验证的日期字符串
 * @returns {Object} 验证结果对象 {valid: boolean, normalized: string, error?: string}
 */
function validateDateFormat(dateString) {
  if (!dateString || typeof dateString !== 'string') {
    return { valid: false, error: '日期必须是非空字符串' };
  }

  // 支持的日期格式
  const patterns = [
    /^\d{4}-\d{2}-\d{2}$/,                    // YYYY-MM-DD
    /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/  // YYYY-MM-DD HH:mm:ss
  ];

  for (const pattern of patterns) {
    if (pattern.test(dateString)) {
      return { valid: true, normalized: dateString };
    }
  }

  throw new Error('日期格式无效，支持 YYYY-MM-DD 或 YYYY-MM-DD HH:mm:ss');
}

/**
 * 根据地块ID查询所有租赁单元
 * @param {number|string} plotId - 所属地块的ID
 * @returns {Promise<Array>} 返回包含所有租赁单元记录的数组，查询失败或无数据时返回空数组
 */
exports.getLeaseUnitsByPlotId = async (plotId) => {
  let connection = null;
  try {
    // 参数验证
    if (typeof plotId !== 'number' && typeof plotId !== 'string') {
      console.error('地块ID必须为数字或字符串类型');
      return [];
    }

    // 获取数据库连接
    connection = await db.getConnection();

    // 查询 SQL 语句 - 获取所有字段，添加 enterprise_name 和 business_settlement_time
    const sql = "SELECT unit_id, unit_name, area, rent_price, unit_description, land_plot_id, unit_status, enterprise_name, business_settlement_time, created_at FROM lease_unit WHERE land_plot_id = ?";
    
    // 执行查询操作
    const [result] = await connection.execute(sql, [plotId]);
    // 返回查询结果，如果无数据则返回空数组
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
 * 批量创建租赁单元
 * @param {Array} leaseUnits - 租赁单元对象数组，每个对象包含 unitName、area、rentPrice、description、plotId 字段
 * @returns {Promise<Object|null>} 成功时返回包含插入数量和ID范围的对象，失败时返回 null
 */
exports.createLease = async (leaseUnits,plot_id) => {
  console.log('test', leaseUnits, plot_id)

  let connection = null;
  try {
    // 参数验证 - 确保输入是数组且非空
    if (!Array.isArray(leaseUnits) || leaseUnits.length === 0) {
      throw new Error('租赁单元数据必须为非空数组');
    }
    // 验证每个租赁单元对象
    for (let i = 0; i < leaseUnits.length; i++) {
      const unit = leaseUnits[i];
      
      if (!unit || typeof unit !== 'object') {
        throw new Error(`第 ${i + 1} 个租赁单元数据格式无效`);
      }
      
      const { unit_name, area, rent_price, unit_status, enterprise_name, business_settlement_time, unit_description} = unit;      // 参数验证
      if (!unit_name || typeof unit_name !== 'string') {
        throw new Error(`第 ${i + 1} 个租赁单元名称不能为空`);
      }
      
      if (typeof area !== 'number' || area <= 0) {
        throw new Error(`第 ${i + 1} 个租赁单元面积必须为正数`);
      }
      
      if (typeof rent_price !== 'number' || rent_price < 0) {
        throw new Error(`第 ${i + 1} 个租赁单元租金价格不能为负数`);
      }
      
      // 验证 unit_status
      const validStatus = ['空闲', '已出租'];
      if (unit_status !== undefined && unit_status !== null) {
        if (!validStatus.includes(unit_status)) {
          throw new Error(`第 ${i + 1} 个租赁单元状态必须是"空闲"或"已出租"之一`);
        }
      }
      
      // 验证 business_settlement_time 格式（如果提供）
      if (business_settlement_time !== undefined && business_settlement_time !== null) {
        validateDateFormat(business_settlement_time);
      }
      
      
    }

    // 获取数据库连接
    connection = await db.getConnection();

    // 构建批量插入 SQL 语句
    const valuesPlaceholders = leaseUnits.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, NOW())').join(', ');
    const sql = `INSERT INTO lease_unit (
      unit_name,
      area,
      rent_price,
      unit_description,
      land_plot_id,
      unit_status,
      enterprise_name,
      business_settlement_time,
      created_at
    ) VALUES ${valuesPlaceholders}`;
    // 构建参数数组
    const params = [];
    for (const unit of leaseUnits) {
      // 如果单元没有提供状态，默认为'空闲'
      const unitFinalStatus = unit.unit_status || '空闲';
      // enterprise_name 可以为 null 或 undefined
      const unitEnterpriseName = unit.enterprise_name || null;
      // business_settlement_time 可以为 null 或 undefined
      const unitBusinessSettlementTime = unit.business_settlement_time || null;
      params.push(
        unit.unit_name,
        unit.area,
        unit.rent_price,
        unit.unit_description || '',
        plot_id,
        unitFinalStatus,
        unitEnterpriseName,
        unitBusinessSettlementTime
      );
    }

    // 执行批量插入操作

    
    const [result] = await connection.execute(sql, params);

    // 返回插入结果信息
    return {
      affectedRows: result.affectedRows,
      insertId: result.insertId
    };

  } catch (error) {
    console.error('批量创建租赁单元失败:', error);
    return null;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 删除租赁单元
 * @param {number|string} unit_id - 租赁单元ID
 * @returns {Promise<boolean>} 删除成功返回true，失败返回false
 */
exports.deleteLease = async (unit_id) => {
  let connection = null;
  try {
    // 参数验证
    if (typeof unit_id !== 'number' && typeof unit_id !== 'string') {
      console.error('租赁单元ID必须为数字或字符串类型');
      return false;
    }

    // 获取数据库连接
    connection = await db.getConnection();

    // 执行硬删除操作
    const sql = "DELETE FROM lease_unit WHERE unit_id = ?";
    
    // 执行删除操作
    const [result] = await connection.execute(sql, [unit_id]);

    // 返回删除结果，affectedRows > 0 表示删除成功
    return result.affectedRows > 0;
    
  } catch (error) {
    console.error('删除租赁单元失败:', error);
    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 更新租赁单元信息
 * @param {Object} updateData - 要更新的租赁单元数据对象
 * @param {number|string} updateData.unit_id - 要更新的租赁单元唯一标识（必填）
 * @param {string} [updateData.unit_name] - 新的租赁单元名称（可选）
 * @param {number} [updateData.area] - 新的面积数值（可选）
 * @param {number} [updateData.rent_price] - 新的租金价格（可选）
 * @param {string} [updateData.unit_description] - 新的描述信息（可选，允许为空）
 * @returns {Promise<number|null>} 成功时返回影响的行数，失败时返回 null
 */
exports.updateLeaseUnit = async (updateData) => {
  let connection = null;
  try {
    // 参数验证
    if (!updateData || typeof updateData !== 'object') {
      console.error('更新数据必须为对象类型');
      return null;
    }

    const { unit_id, unit_name, area, rent_price, unit_description, unit_status, enterprise_name, business_settlement_time } = updateData;

    // 验证必填字段 unit_id
    if (unit_id === undefined || unit_id === null) {
      console.error('租赁单元ID(unit_id)为必填字段');
      return null;
    }

    if (typeof unit_id !== 'number' && typeof unit_id !== 'string') {
      console.error('租赁单元ID必须为数字或字符串类型');
      return null;
    }

    // 检查是否有可更新的字段
    const hasUpdateFields = unit_name !== undefined || 
                           area !== undefined || 
                           rent_price !== undefined || 
                           unit_description !== undefined ||
                           unit_status !== undefined ||
                           enterprise_name !== undefined ||
                           business_settlement_time !== undefined;

    if (!hasUpdateFields) {
      console.error('至少需要提供一个要更新的字段');
      return null;
    }

    // 验证可选字段的类型
    if (unit_name !== undefined && (typeof unit_name !== 'string' || unit_name.trim() === '')) {
      console.error('租赁单元名称必须为非空字符串');
      return null;
    }

    if (area !== undefined && (typeof area !== 'number' || area <= 0)) {
      console.error('面积必须为正数');
      return null;
    }

    if (rent_price !== undefined && (typeof rent_price !== 'number' || rent_price < 0)) {
      console.error('租金价格不能为负数');
      return null;
    }

    if (unit_description !== undefined && typeof unit_description !== 'string') {
      console.error('描述信息必须为字符串类型');
      return null;
    }

    // 验证 unit_status
    if (unit_status !== undefined && unit_status !== null) {
      const validStatus = ['空闲', '已出租'];
      if (!validStatus.includes(unit_status)) {
        console.error('租赁单元状态必须是"空闲"或"已出租"之一');
        return null;
      }
    }


    // 获取数据库连接
    connection = await db.getConnection();

    // 首先验证 unit_id 对应的租赁单元是否存在
    const checkSql = "SELECT unit_id FROM lease_unit WHERE unit_id = ?";
    const [checkResult] = await connection.execute(checkSql, [unit_id]);

    if (checkResult.length === 0) {
      console.error('要更新的租赁单元不存在');
      return null;
    }

    // 构建动态更新SQL
    const updateFields = [];
    const params = [];

    if (unit_name !== undefined) {
      updateFields.push("unit_name = ?");
      params.push(unit_name.trim());
    }

    if (area !== undefined) {
      updateFields.push("area = ?");
      params.push(area);
    }

    if (rent_price !== undefined) {
      updateFields.push("rent_price = ?");
      params.push(rent_price);
    }

    if (unit_description !== undefined) {
      updateFields.push("unit_description = ?");
      params.push(unit_description);
    }

    if (unit_status !== undefined) {
      updateFields.push("unit_status = ?");
      params.push(unit_status);
    }

    if (enterprise_name !== undefined) {
      updateFields.push("enterprise_name = ?");
      params.push(enterprise_name);
    }

    // 处理 business_settlement_time 字段
    if (business_settlement_time !== undefined && business_settlement_time !== null) {
      validateDateFormat(business_settlement_time);
      updateFields.push("business_settlement_time = ?");
      params.push(business_settlement_time);
    } else if (business_settlement_time === null) {
      // 允许显式设置为 NULL
      updateFields.push("business_settlement_time = NULL");
    }

    // 添加 unit_id 到参数列表末尾（用于 WHERE 条件）
    params.push(unit_id);

    const sql = `UPDATE lease_unit SET ${updateFields.join(', ')} WHERE unit_id = ?`;

    // 执行更新操作
    const [result] = await connection.execute(sql, params);

    // 返回影响的行数
    return result.affectedRows;

  } catch (error) {
    console.error('更新租赁单元信息失败:', error);
    return null;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

/**
 * 根据租赁单元ID查询租赁单元详情
 * @param {number|string} unitId - 租赁单元的ID
 * @returns {Promise<Object|null>} 返回租赁单元详情对象，查询失败或无数据时返回 null
 */
exports.getLeaseUnitsByUnitId = async (unitId) => {
  let connection = null;
  try {
    // 参数验证
    if (typeof unitId !== 'number' && typeof unitId !== 'string') {
      console.error('租赁单元ID必须为数字或字符串类型');
      return null;
    }

    // 获取数据库连接
    connection = await db.getConnection();

    // 查询 SQL 语句 - 将 land_plot_id 改为 unit_id，添加 enterprise_name 和 business_settlement_time 字段
    const sql = "SELECT unit_id, unit_name, area, rent_price, unit_description, land_plot_id, unit_status, enterprise_name, business_settlement_time, created_at FROM lease_unit WHERE unit_id = ?";
    
    // 执行查询操作
    const [result] = await connection.execute(sql, [unitId]);
    
    // 返回查询结果，如果无数据则返回 null
    return result && result.length > 0 ? result[0] : null;
    
  } catch (error) {
    console.error('根据租赁单元ID查询租赁单元详情失败:', error);
    return null;
  } finally {
    if (connection) {
      connection.release();
    }
  }
};