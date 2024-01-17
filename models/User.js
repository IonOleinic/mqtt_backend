// userModel.js
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    hire_date: {
      type: DataTypes.DATE,
    },
    gender: {
      type: DataTypes.STRING,
    },
    refresh_token: {
      type: DataTypes.STRING(512),
    },
  })

  return User
}
