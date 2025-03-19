const { GroupService } = require('../services/groupService')

class GroupController {
  async getGroups(req, res) {
    try {
      let groups = await GroupService.getGroups(Number(req.query['user_id']))
      res.json(groups)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async getGroup(req, res) {
    try {
      let currentGroup = await GroupService.getGroupById(req.params['id'])
      if (currentGroup) {
        res.json(currentGroup)
      } else {
        res.status(404).json({ msg: "Group doesn't exist" })
      }
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async createGroup(req, res) {
    let groupData = req.body
    groupData.user_id = Number(req.query['user_id'])
    try {
      await GroupService.insertGroup(groupData)
      res.sendStatus(201)
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
  async updateGroup(req, res) {
    let groupData = req.body
    try {
      let updatedGroup = await GroupService.updateGroup(
        req.params['id'],
        groupData
      )
      res.json(updatedGroup)
    } catch (error) {
      console.log(error)
      res.json(groupData)
    }
  }
  async deleteGroup(req, res) {
    try {
      const result = await GroupService.deleteGroup(req.params['id'])
      if (result) res.json({ succes: true })
      else res.json({ succes: false })
    } catch (error) {
      console.log(error)
      res.status(500).json({ msg: 'Server error!' })
    }
  }
}

module.exports = new GroupController()
