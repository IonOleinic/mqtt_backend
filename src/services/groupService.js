const { Group } = require('../../models')

class GroupService {
  static async getGroups(userId) {
    try {
      let groups = undefined
      if (userId) {
        groups = await Group.findAll({ where: { user_id: userId } })
      } else {
        groups = await Group.findAll()
      }
      return groups
    } catch (error) {
      throw error
    }
  }
  static async getGroupsAsMap(userId) {
    try {
      let groups = []
      if (userId) {
        groups = await Group.findAll({ where: { user_id: userId } })
      } else {
        groups = await Group.findAll()
      }
      let map = new Map()
      for (let group of groups) {
        map.set(group.id, group.dataValues)
      }
      return map
    } catch (error) {
      throw error
    }
  }
  static async getGroupById(groupId) {
    try {
      const group = await Group.findByPk(groupId)
      return group
    } catch (error) {
      throw error
    }
  }
  static async insertGroup(groupData) {
    try {
      await Group.create(groupData)
      return groupData
    } catch (error) {
      throw error
    }
  }
  static async updateGroup(groupId, groupData) {
    try {
      const groupDB = await Group.findByPk(groupId)
      if (groupDB) {
        await groupDB.update(groupData)
      }
      return groupDB
    } catch (error) {
      throw error
    }
  }
  static async deleteGroup(groupId) {
    try {
      const groupDB = await Group.findByPk(groupId)
      if (groupDB) {
        await groupDB.destroy()
      }
      return true
    } catch (error) {
      throw error
    }
  }
}

module.exports = { GroupService }
